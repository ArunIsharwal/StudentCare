"""
vision_service.py — Food Detection Pipeline Controller

Responsibilities:
  - Orchestrate primary (LogMeal API) and fallback (HuggingFace) detection
  - No API logic here — that lives in logmeal_service.py
  - No hardcoded nutrition in primary path — LogMeal supplies it
  - Fallback uses local FOOD_NUTRITION lookup only when API is unavailable
"""

import io
import logging
from PIL import Image
from transformers import pipeline

from app.services.logmeal_service import detect_food_logmeal
from app.services.nutrition_data import FOOD_NUTRITION   # fallback only

logger = logging.getLogger(__name__)

# ── HuggingFace fallback model (lazy-loaded) ──────────────────────────────────
_hf_classifier = None

def _get_hf_classifier():
    global _hf_classifier
    if _hf_classifier is None:
        logger.info("Loading HuggingFace fallback model (nateraw/food)...")
        _hf_classifier = pipeline("image-classification", model="nateraw/food")
    return _hf_classifier


# ── Main pipeline entry point ─────────────────────────────────────────────────

def process_food_image(image_bytes: bytes) -> dict:
    """
    Central food detection controller.

    Flow:
      1. Try LogMeal API (accurate, includes real nutrition)
      2. On failure → fallback to HuggingFace + local nutrition lookup
      3. On total failure → return safe unknown response
    """
    # ── Step 1: LogMeal API ───────────────────────────────────────────────────
    try:
        result = detect_food_logmeal(image_bytes)
        if result:
            logger.info("[LogMeal] Detection succeeded — food: %s (confidence: %s)",
                        result.get("food"), result.get("confidence"))
            return result
        else:
            logger.warning("[LogMeal] Returned empty result — triggering fallback.")
    except Exception as e:
        logger.error("[LogMeal] API call raised an exception: %s — triggering fallback.", e)

    # ── Step 2: HuggingFace fallback ──────────────────────────────────────────
    return _hf_fallback(image_bytes)


# ── Fallback logic (private) ──────────────────────────────────────────────────

def _hf_fallback(image_bytes: bytes) -> dict:
    """HuggingFace model + local nutrition dictionary as offline fallback."""
    logger.warning("[Fallback] Using HuggingFace model for detection.")
    try:
        image = Image.open(io.BytesIO(image_bytes))
        clf = _get_hf_classifier()
        hf_results = clf(image)

        predictions = [
            {
                "food":       r["label"].replace("_", " ").title(),
                "confidence": round(r["score"], 4)
            }
            for r in hf_results[:3]
            if r.get("score", 0) >= 0.1
        ]

        if not predictions:
            logger.error("[Fallback] HuggingFace returned no usable predictions.")
            return _unknown_response()

        top = predictions[0]
        food_name = top["food"]
        nutrition = _get_nutrition_fallback(food_name)

        logger.info("[Fallback] Detected: %s (confidence: %s)", food_name, top["confidence"])

        return {
            "food":            food_name,
            "confidence":      top["confidence"],
            "nutrition":       nutrition,
            "all_predictions": predictions
        }
    except Exception as e:
        logger.error("[Fallback] HuggingFace model also failed: %s", e)
        return _unknown_response()


def _get_nutrition_fallback(food_name: str) -> dict:
    """
    Local nutrition lookup — only used when LogMeal API is unavailable.
    Keyword-based matching with a safe default.
    """
    food_key = food_name.lower()

    for key, nutrition in FOOD_NUTRITION.items():
        if key in food_key:
            return {**nutrition, "carbs": nutrition.get("carbs", 0)}

    if "rice" in food_key:
        return {**FOOD_NUTRITION.get("rice", {}), "carbs": 0}
    if "curry" in food_key:
        return {**FOOD_NUTRITION.get("chicken curry", {}), "carbs": 0}
    if "bread" in food_key:
        return {**FOOD_NUTRITION.get("roti", {}), "carbs": 0}

    return {"calories": 250, "protein": 10, "fat": 8, "carbs": 0}


def _unknown_response() -> dict:
    return {
        "food":            "Unknown",
        "confidence":      0.0,
        "nutrition":       {"calories": 200, "protein": 5, "fat": 5, "carbs": 0},
        "all_predictions": []
    }