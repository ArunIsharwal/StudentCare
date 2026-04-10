from fastapi import APIRouter, UploadFile, File
from app.services.vision_service import process_food_image

router = APIRouter(prefix="/food", tags=["Food"])

_FALLBACK = {
    "food":            "Unknown",
    "confidence":      0.0,
    "nutrition":       {"calories": 200, "protein": 5, "fat": 5, "carbs": 0},
    "all_predictions": []
}

@router.get("/")
async def get_food_info():
    return {"message": "Food route operational."}

@router.post("/analyze")
async def analyze_food(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        result = process_food_image(contents)

        if not result or result.get("food") == "Unknown":
            return _FALLBACK

        nutrition = result.get("nutrition", {})

        return {
            "food":            result["food"],
            "confidence":      result["confidence"],
            "calories":        nutrition.get("calories", 0),
            "protein":         nutrition.get("protein", 0),
            "fat":             nutrition.get("fat", 0),
            "carbs":           nutrition.get("carbs", 0),
            "all_predictions": result.get("all_predictions", [])
        }
    except Exception:
        return _FALLBACK
