import os
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

LOGMEAL_API_URL     = "https://api.logmeal.com/v2/image/recognition/complete"
CONFIDENCE_THRESHOLD = 0.5
TIMEOUT_SECONDS      = 10


def detect_food_logmeal(image_bytes: bytes) -> dict:
    """
    Send image bytes to the LogMeal API.
    Returns structured result dict, or empty dict so caller can fallback.
    """
    api_key = os.getenv("LOGMEAL_API_KEY")
    if not api_key:
        logger.error("[LogMeal] LOGMEAL_API_KEY is not set in environment.")
        return {}

    headers = {"Authorization": f"Bearer {api_key}"}
    files   = {"image": ("food.jpg", image_bytes, "image/jpeg")}

    try:
        response = requests.post(
            LOGMEAL_API_URL,
            headers=headers,
            files=files,
            timeout=TIMEOUT_SECONDS
        )
        response.raise_for_status()
        data = response.json()

        logger.debug("[LogMeal] Full raw response: %s", data)

        return _parse_response(data)

    except requests.exceptions.Timeout:
        logger.error("[LogMeal] Request timed out after %ds.", TIMEOUT_SECONDS)
        return {}
    except requests.exceptions.HTTPError as e:
        logger.error("[LogMeal] HTTP error: %s — status: %s", e, getattr(e.response, 'status_code', 'N/A'))
        return {}
    except Exception as e:
        logger.error("[LogMeal] Unexpected error: %s", e)
        return {}


def _parse_response(data: dict) -> dict:
    """
    Parse LogMeal API response into a clean structured dict.

    Steps:
      1. Extract all items from recognition_results
      2. Filter out anything below CONFIDENCE_THRESHOLD
      3. Sort remaining by confidence descending
      4. Return top 3 + nutrition (from API, no hardcoded fallback)
    """
    recognition_results = data.get("recognition_results", [])

    # Log all raw predictions for debugging
    logger.debug(
        "[LogMeal] All raw predictions: %s",
        [(r.get("name"), r.get("confidence")) for r in recognition_results]
    )

    # Filter and sort by confidence
    confident = sorted(
        [r for r in recognition_results if r.get("confidence", 0) >= CONFIDENCE_THRESHOLD],
        key=lambda r: r.get("confidence", 0),
        reverse=True
    )

    logger.info(
        "[LogMeal] Predictions after %.2f threshold filter: %s",
        CONFIDENCE_THRESHOLD,
        [(r.get("name"), round(r.get("confidence", 0), 4)) for r in confident]
    )

    # All predictions are low confidence
    if not confident:
        logger.warning("[LogMeal] No predictions met the confidence threshold.")
        return {
            "food":  "Unknown",
            "error": "Low confidence detection"
        }

    top        = confident[0]
    food_name  = top.get("name", "Unknown")
    confidence = round(top.get("confidence", 0.0), 4)

    # Extract nutrition directly from LogMeal response (no hardcoded values)
    nutrition = _extract_nutrition(data)

    all_predictions = [
        {
            "food":       r.get("name", ""),
            "confidence": round(r.get("confidence", 0.0), 4)
        }
        for r in confident[:3]
    ]

    logger.info("[LogMeal] Best match: %s (confidence: %s)", food_name, confidence)

    return {
        "food":            food_name,
        "confidence":      confidence,
        "nutrition":       nutrition,
        "all_predictions": all_predictions
    }


def _extract_nutrition(data: dict) -> dict:
    """
    Extract nutrition values from LogMeal API response.
    Tries multiple known response keys. Returns None values if unavailable
    so the caller knows the data is genuinely missing (not hardcoded).
    """
    nutrition_raw = data.get("nutritional_info") or {}
    serving       = nutrition_raw.get("serving_size") or {}
    per_100g      = nutrition_raw.get("per_100g") or {}

    def pick(*sources_and_keys):
        """Return first non-None value from a list of (dict, key) pairs."""
        for src, key in sources_and_keys:
            val = src.get(key)
            if val is not None:
                return val
        return None

    return {
        "calories": pick((nutrition_raw, "calories"), (serving, "calories"), (per_100g, "calories")),
        "protein":  pick((nutrition_raw, "protein"),  (serving, "protein"),  (per_100g, "protein")),
        "fat":      pick((nutrition_raw, "fat"),       (serving, "fat"),      (per_100g, "fat")),
        "carbs":    pick((nutrition_raw, "carbs"),     (serving, "carbohydrates"), (per_100g, "carbohydrates")),
    }
