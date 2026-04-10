from fastapi import APIRouter, UploadFile, File
from app.services.vision_service import process_food_image, clean_food_name, get_nutrition

router = APIRouter(prefix="/food", tags=["Food"])

@router.get("/")
async def get_food_info():
    return {"message": "Food route operational."}

@router.post("/analyze")
async def analyze_food(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        labels = process_food_image(contents)
        
        if not labels:
            return {
                "food": "Unknown",
                "confidence": False,
                "calories": 200,
                "protein": 5,
                "fat": 5
            }
            
        food_name, is_confident = clean_food_name(labels)
        nutrition = get_nutrition(food_name)
        
        return {
            "food": food_name,
            "confidence": is_confident,
            "calories": nutrition["calories"],
            "protein": nutrition["protein"],
            "fat": nutrition["fat"]
        }
    except Exception:
        return {
            "food": "Unknown",
            "confidence": False,
            "calories": 200,
            "protein": 5,
            "fat": 5
        }
