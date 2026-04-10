from fastapi import APIRouter
from app.services.vision_service import process_food_image

router = APIRouter(prefix="/food", tags=["Food"])

@router.get("/")
async def get_food_info():
    return {"message": "Food route operational."}

@router.post("/analyze")
async def analyze_food():
    # Example using the vision service
    result = process_food_image("dummy_data")
    return {"result": result}
