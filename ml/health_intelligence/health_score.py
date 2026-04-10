from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="Health Score API")

class HealthScoreRequest(BaseModel):
    aqi: int
    calories: int
    sleep: Optional[float] = None
    steps: Optional[int] = None
    hydration: Optional[int] = None

def calculate_aqi_score(aqi: int) -> int:
    if 0 <= aqi <= 50:
        return 100
    elif 51 <= aqi <= 100:
        return 80
    elif 101 <= aqi <= 150:
        return 60
    elif 151 <= aqi <= 200:
        return 40
    elif 201 <= aqi <= 300:
        return 20
    else:
        return 10

def calculate_calorie_score(calories: int) -> int:
    if 1800 <= calories <= 2200:
        return 100
    elif 1500 <= calories <= 1799 or 2201 <= calories <= 2500:
        return 80
    elif 1200 <= calories <= 1499 or 2501 <= calories <= 3000:
        return 60
    else:
        return 40

def calculate_health_score(aqi: int, calories: int, **kwargs) -> dict:
    """
    Generate a normalized health score that reflects the user's overall 
    well-being considering environmental conditions (AQI) and dietary intake (calories).
    Designed to be extensible for future inputs like sleep, steps, hydration.
    """
    if not (0 <= aqi <= 500):
        # We cap it at 500 for validation based on spec
        raise ValueError("AQI must be between 0 and 500")
    if calories <= 0:
        raise ValueError("Calories must be greater than 0")

    aqi_score = calculate_aqi_score(aqi)
    calorie_score = calculate_calorie_score(calories)

    # Weighted averaging
    # AQI Weight = 40%
    # Calorie Weight = 60%
    health_score = round((0.4 * aqi_score) + (0.6 * calorie_score))

    # Category Logic
    if 80 <= health_score <= 100:
        category = "Excellent"
    elif 60 <= health_score <= 79:
        category = "Good"
    elif 40 <= health_score <= 59:
        category = "Moderate"
    else:
        category = "Poor"

    result = {
        "health_score": health_score,
        "category": category,
        "details": {
            "aqi_score_component": aqi_score,
            "calorie_score_component": calorie_score
        }
    }
    
    # Future extensibility hook: 
    # Process kwargs (sleep, steps, hydration) when added to the weighting formula
    if kwargs:
        result["additional_metrics_received"] = list(kwargs.keys())

    return result

@app.post("/health_score")
def generate_health_score_post(request: HealthScoreRequest):
    try:
        # Pass extra metrics via kwargs for extensibility 
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

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)
