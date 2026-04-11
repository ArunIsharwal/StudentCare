import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
DEFAULT_WAQI_TOKEN = "43fabff5cf754bebf150ff113b9c79d0902fa8b1"
REQUEST_HEADERS = {"User-Agent": "StudentCareAQI/1.0"}
IP_SOURCES = {"ipapi", "ipwhois", "ipinfo"}
KNOWN_LOCATIONS = [
    {
        "aliases": (
            "RIICO Industrial Area, Ranpur, Kota",
            "Ranpur, Kota",
            "Ranpur Kota",
            "RIICO Ranpur Kota",
        ),
        "lat": 25.0831251,
        "lon": 75.8621041,
        "label": "RIICO Industrial Area, Ranpur, Kota",
    }
]

load_dotenv(dotenv_path=ENV_PATH)


def normalize_place_key(value):
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


class AQIService:
    @classmethod
    def interpret(cls, aqi: int) -> dict:
        """Maps a raw AQI number to health data."""
        thresholds = [
            (0, 50, "Good", "#00E400", "Air quality is satisfactory."),
            (51, 100, "Moderate", "#FFFF00", "Sensitive individuals should limit exertion."),
            (101, 150, "Unhealthy (Sensitive)", "#FF7E00", "People with respiratory issues should stay indoors."),
            (151, 200, "Unhealthy", "#FF0000", "Everyone should limit outdoor time."),
            (201, 300, "Very Unhealthy", "#8F3F97", "Health alert: Avoid outdoor activities."),
            (301, 500, "Hazardous", "#7E0023", "Emergency conditions. Stay indoors."),
        ]

        for lower, upper, level, color, advice in thresholds:
            if lower <= aqi <= upper:
                return {"aqi": aqi, "status": level, "color": color, "advice": advice}
        return {"aqi": aqi, "status": "Unknown", "color": "#000000", "advice": "No data."}

    @staticmethod
    def _parse_float(value):
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    @classmethod
    def get_known_location(cls, place_query: str):
        normalized_query = normalize_place_key(place_query)
        if not normalized_query:
            return None

        for location in KNOWN_LOCATIONS:
            normalized_aliases = [normalize_place_key(alias) for alias in location["aliases"]]
            if normalized_query in normalized_aliases:
                return {
                    "lat": location["lat"],
                    "lon": location["lon"],
                    "label": location["label"],
                    "source": "preset",
                    "precision": "manual",
                }

        return None

    @classmethod
    def get_windows_location(cls):
        """Gets device coordinates from Windows location services when available."""
        if os.name != "nt":
            return None

        command = (
            "Add-Type -AssemblyName System.Device; "
            "$watcher = New-Object System.Device.Location.GeoCoordinateWatcher; "
            "$null = $watcher.TryStart($false, [TimeSpan]::FromSeconds(5)); "
            "$coord = $watcher.Position.Location; "
            "if ($coord -and -not $coord.IsUnknown) { "
            "@{ lat = $coord.Latitude; lon = $coord.Longitude; label = 'Windows device location' } "
            "| ConvertTo-Json -Compress }"
        )

        try:
            result = subprocess.run(
                ["powershell", "-NoProfile", "-Command", command],
                capture_output=True,
                text=True,
                timeout=10,
                check=False,
            )
        except Exception:
            return None

        stdout = result.stdout.strip()
        if result.returncode != 0 or not stdout:
            return None

        try:
            data = json.loads(stdout)
        except json.JSONDecodeError:
            return None

        lat = cls._parse_float(data.get("lat"))
        lon = cls._parse_float(data.get("lon"))
        if lat is None or lon is None:
            return None

        return {
            "lat": lat,
            "lon": lon,
            "label": data.get("label") or "Windows device location",
            "source": "windows",
            "precision": "device",
        }

    @classmethod
    def get_location_from_place(cls, place_query: str):
        """Geocodes a place name to coordinates."""
        known_location = cls.get_known_location(place_query)
        if known_location:
            return known_location

        try:
            response = requests.get(
                "https://nominatim.openstreetmap.org/search",
                params={"q": place_query, "format": "jsonv2", "limit": 1},
                headers=REQUEST_HEADERS,
                timeout=10,
            )
            response.raise_for_status()
            results = response.json()
        except Exception:
            return None

        if not results:
            return None

        first_result = results[0]
        lat = cls._parse_float(first_result.get("lat"))
        lon = cls._parse_float(first_result.get("lon"))
        if lat is None or lon is None:
            return None

        return {
            "lat": lat,
            "lon": lon,
            "label": first_result.get("display_name") or place_query,
            "source": "place",
            "precision": "manual",
        }

    @classmethod
    def get_current_location(cls):
        """Detects the user's location with exact sources first, then approximate IP lookup."""
        env_lat = cls._parse_float(os.getenv("CURRENT_LAT"))
        env_lon = cls._parse_float(os.getenv("CURRENT_LON"))
        env_place = os.getenv("CURRENT_PLACE")

        if env_lat is not None and env_lon is not None:
            return {
                "lat": env_lat,
                "lon": env_lon,
                "label": "Custom coordinates from environment",
                "source": "env",
                "precision": "manual",
            }

        if env_place:
            location = cls.get_location_from_place(env_place)
            if location:
                location["source"] = "env_place"
                return location

        location = cls.get_windows_location()
        if location:
            return location

        providers = [
            (
                "ipapi",
                "https://ipapi.co/json/",
                lambda data: {
                    "lat": cls._parse_float(data.get("latitude")),
                    "lon": cls._parse_float(data.get("longitude")),
                    "label": ", ".join(
                        part for part in (data.get("city"), data.get("region"), data.get("country_name")) if part
                    ),
                },
            ),
            (
                "ipwhois",
                "https://ipwho.is/",
                lambda data: {
                    "lat": cls._parse_float(data.get("latitude")),
                    "lon": cls._parse_float(data.get("longitude")),
                    "label": ", ".join(
                        part for part in (data.get("city"), data.get("region"), data.get("country")) if part
                    ),
                }
                if data.get("success", True)
                else None,
            ),
            (
                "ipinfo",
                "https://ipinfo.io/json",
                lambda data: {
                    "lat": cls._parse_float((data.get("loc") or ",").split(",")[0]),
                    "lon": cls._parse_float((data.get("loc") or ",").split(",")[1]),
                    "label": ", ".join(part for part in (data.get("city"), data.get("region"), data.get("country")) if part),
                }
                if data.get("loc")
                else None,
            ),
        ]

        for source, url, parser in providers:
            try:
                response = requests.get(url, headers=REQUEST_HEADERS, timeout=5)
                response.raise_for_status()
                data = response.json()
                location = parser(data)
                if not location:
                    continue
                if location["lat"] is None or location["lon"] is None:
                    continue
                location["source"] = source
                location["precision"] = "approximate"
                return location
            except Exception:
                continue

        return None

    @classmethod
    def fetch_waqi_data(cls, lat: float, lon: float, api_token: str):
        """Fetches AQI for exact GPS coordinates using WAQI as primary."""
        url = f"https://api.waqi.info/feed/geo:{lat};{lon}/?token={api_token}"

        try:
            response = requests.get(url, headers=REQUEST_HEADERS, timeout=10)
            response.raise_for_status()
            res_json = response.json()

            if res_json.get("status") != "ok":
                return None

            data = res_json["data"]
            # Time can be in 'v' (unix timestamp) or 'iso' format in data['time']
            timestamp = data.get("time", {}).get("v")
            if not timestamp:
                iso_time = data.get("time", {}).get("iso", "")
                if iso_time:
                    try:
                        dt = datetime.fromisoformat(iso_time.replace("Z", "+00:00"))
                        timestamp = dt.timestamp()
                    except ValueError:
                        timestamp = None

            return {
                "aqi": cls._parse_float(data.get("aqi")),
                "station": data.get("city", {}).get("name", "Unknown WAQI Station"),
                "timestamp": timestamp,
                "source": "WAQI"
            }
        except Exception as exc:
            return None

    @classmethod
    def fetch_open_meteo_data(cls, lat: float, lon: float):
        """Fetches US AQI from Open-Meteo Air Quality API."""
        url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi&timezone=GMT"
        try:
            response = requests.get(url, headers=REQUEST_HEADERS, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            current = data.get("current", {})
            val = current.get("us_aqi")
            if val is None:
                return None
            
            time_str = current.get("time", "")
            timestamp = None
            if time_str:
                try:
                    dt = datetime.fromisoformat(time_str).replace(tzinfo=timezone.utc)
                    timestamp = dt.timestamp()
                except ValueError:
                    pass
            
            return {
                "aqi": float(val),
                "station": "Open-Meteo Aggregated Cell",
                "timestamp": timestamp,
                "source": "Open-Meteo"
            }
        except Exception:
            return None

    @classmethod
    def get_reliable_aqi(cls, location: dict, api_token: str):
        lat = location["lat"]
        lon = location["lon"]
        
        waqi_data = cls.fetch_waqi_data(lat, lon, api_token)
        meteo_data = cls.fetch_open_meteo_data(lat, lon)
        
        now = datetime.now(timezone.utc).timestamp()
        max_age = 3600  # 60 minutes
        
        def is_fresh(data_obj):
            if not data_obj or data_obj.get("aqi") is None or data_obj.get("timestamp") is None:
                return False
            if not (0 <= data_obj["aqi"] <= 500):
                return False
            if now - data_obj["timestamp"] > max_age:
                return False
            return True
            
        waqi_fresh = is_fresh(waqi_data)
        meteo_fresh = is_fresh(meteo_data)
        
        selected_data = None
        inconsistency_flag = None
        
        if waqi_fresh and meteo_fresh:
            waqi_val = waqi_data["aqi"]
            meteo_val = meteo_data["aqi"]
            diff = abs(waqi_val - meteo_val)
            max_val = max(waqi_val, meteo_val)
            if max_val > 0 and (diff / max_val) > 0.20:
                inconsistency_flag = f"High variance between sources (>20%). WAQI: {waqi_val}, Open-Meteo: {meteo_val}."
            
            # User specifically requested Open-Meteo's result to be the primary one displayed
            selected_data = meteo_data
        elif meteo_fresh:
            selected_data = meteo_data
            inconsistency_flag = "WAQI data stale/unavailable. Playing safely with Open-Meteo."
        elif waqi_fresh:
            selected_data = waqi_data
            inconsistency_flag = "Open-Meteo unavailable. Falling back to WAQI."
        else:
            return {
                "aqi": None,
                "status": "unavailable"
            }
            
        category = cls.interpret(selected_data["aqi"]).get("status", "Unknown")
        dt = datetime.fromtimestamp(selected_data["timestamp"], tz=timezone.utc)
        
        result = {
            "aqi": int(selected_data["aqi"]),
            "category": category,
            "source": selected_data["source"],
            "last_updated": dt.isoformat().replace("+00:00", "Z"),
            "location": location.get("label", "Unknown location"),
            "inconsistency_flag": inconsistency_flag
        }
            
        return result


def get_waqi_token():
    return os.getenv("WAQI_API_TOKEN") or os.getenv("AQI_API_TOKEN") or DEFAULT_WAQI_TOKEN


def parse_args():
    parser = argparse.ArgumentParser(description="Fetch AQI for your current or specified coordinates.")
    parser.add_argument("--lat", type=float, help="Latitude override for exact location")
    parser.add_argument("--lon", type=float, help="Longitude override for exact location")
    parser.add_argument("--place", help="Place name override, for example --place \"Bengaluru, Karnataka\"")
    return parser.parse_args()


def save_env_value(key, value):
    lines = []
    if ENV_PATH.exists():
        lines = ENV_PATH.read_text(encoding="utf-8").splitlines()

    updated = False
    for index, line in enumerate(lines):
        if line.startswith(f"{key}="):
            lines[index] = f'{key}="{value}"'
            updated = True
            break

    if not updated:
        lines.append(f'{key}="{value}"')

    content = "\n".join(lines).rstrip() + "\n"
    ENV_PATH.write_text(content, encoding="utf-8")
    os.environ[key] = value


def prompt_for_place():
    if not sys.stdin.isatty():
        return None

    print("Automatic location is only approximate on this network.")
    print("Enter your current city/state to get the correct AQI.")

    place = input("Place: ").strip()
    if not place:
        return None

    location = AQIService.get_location_from_place(place)
    if not location:
        print(f"Could not resolve place: {place}")
        return None

    save_choice = input("Save this place for future runs? [Y/n]: ").strip().lower()
    if save_choice in ("", "y", "yes"):
        save_env_value("CURRENT_PLACE", place)
        location["source"] = "env_place"

    return location


app = FastAPI(title="AQI Service API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/aqi")
def get_aqi_endpoint(
    lat: Optional[float] = None, 
    lon: Optional[float] = None, 
    place: Optional[str] = None
):
    token = get_waqi_token()
    if not token:
        raise HTTPException(status_code=500, detail="Missing WAQI token in environment.")

    if (lat is None) ^ (lon is None):
        raise HTTPException(status_code=400, detail="Provide both lat and lon together.")

    if lat is not None and lon is not None:
        location = {
            "lat": lat,
            "lon": lon,
            "label": f"Manual coordinates ({lat}, {lon})",
            "source": "api",
            "precision": "manual",
        }
    elif place:
        location = AQIService.get_location_from_place(place)
        if not location:
            raise HTTPException(status_code=404, detail=f"Could not resolve place: {place}")
    else:
        location = AQIService.get_current_location()
        if not location:
            raise HTTPException(status_code=404, detail="Could not determine location automatically.")

    report = AQIService.get_reliable_aqi(location, token)
    return report

class HealthScoreRequest(BaseModel):
    aqi: int
    calories: int
    sleep: Optional[float] = None
    steps: Optional[int] = None
    hydration: Optional[int] = None

def calculate_aqi_score(aqi: int) -> int:
    if 0 <= aqi <= 50: return 100
    elif 51 <= aqi <= 100: return 80
    elif 101 <= aqi <= 150: return 60
    elif 151 <= aqi <= 200: return 40
    elif 201 <= aqi <= 300: return 20
    else: return 10

def calculate_calorie_score(calories: int) -> int:
    if 1800 <= calories <= 2200: return 100
    elif 1500 <= calories <= 1799 or 2201 <= calories <= 2500: return 80
    elif 1200 <= calories <= 1499 or 2501 <= calories <= 3000: return 60
    else: return 40

def calculate_health_score(aqi: int, calories: int, **kwargs) -> dict:
    if not (0 <= aqi <= 500):
        raise ValueError("AQI must be between 0 and 500")
    if calories <= 0:
        raise ValueError("Calories must be greater than 0")

    aqi_score = calculate_aqi_score(aqi)
    calorie_score = calculate_calorie_score(calories)
    health_score = round((0.4 * aqi_score) + (0.6 * calorie_score))

    if 80 <= health_score <= 100: category = "Excellent"
    elif 60 <= health_score <= 79: category = "Good"
    elif 40 <= health_score <= 59: category = "Moderate"
    else: category = "Poor"

    result = {
        "health_score": health_score,
        "category": category,
        "details": {
            "aqi_score_component": aqi_score,
            "calorie_score_component": calorie_score
        }
    }
    if kwargs:
        result["additional_metrics_received"] = list(kwargs.keys())
    return result

@app.post("/health_score")
def generate_health_score_post(request: HealthScoreRequest):
    try:
        extra_metrics = {k: v for k, v in request.model_dump().items() if k not in ["aqi", "calories"] and v is not None}
        return calculate_health_score(request.aqi, request.calories, **extra_metrics)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health_score")
def generate_health_score_get(
    aqi: int = Query(..., description="Air Quality Index value (0-500)"), 
    calories: int = Query(..., description="Total daily calorie intake (kcal)")
):
    try:
        return calculate_health_score(aqi, calories)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


def resolve_location(args):
    if (args.lat is None) ^ (args.lon is None):
        print("Provide both --lat and --lon together.")
        raise SystemExit(1)

    if args.lat is not None and args.lon is not None:
        return {
            "lat": args.lat,
            "lon": args.lon,
            "label": f"Manual coordinates ({args.lat}, {args.lon})",
            "source": "cli",
            "precision": "manual",
        }

    if args.place:
        location = AQIService.get_location_from_place(args.place)
        if not location:
            print(f"Could not resolve place: {args.place}")
            raise SystemExit(1)
        return location

    location = AQIService.get_current_location()
    if location and location.get("source") not in IP_SOURCES:
        return location

    prompted_location = prompt_for_place()
    if prompted_location:
        return prompted_location

    return location


if __name__ == "__main__":
    args = parse_args()
    token = get_waqi_token()

    if not token:
        print("Missing WAQI token. Add WAQI_API_TOKEN to .env.")
        raise SystemExit(1)

    location = resolve_location(args)
    if not location:
        print("Could not determine your location.")
        print("Try enabling Windows Location or run with --place, --lat and --lon.")
        raise SystemExit(1)

    report = AQIService.get_reliable_aqi(location, token)

    if report.get("aqi") is not None:
        print("-" * 30)
        print(f"LOCATION: {report['location']}")
        print(f"AQI: {report['aqi']} ({report['category']})")
        print(f"SOURCE: {report['source']}")
        print(f"LAST UPDATED: {report['last_updated']}")
        if report.get("inconsistency_flag"):
            print(f"FLAG: {report['inconsistency_flag']}")
        print("-" * 30)
    else:
        print("Failed to fetch reliable AQI. Data unavailable or all sources stale or invalid.")
