from fastapi import FastAPI
from app.routes.food import router as food_router

app = FastAPI(title="Food Pipeline API")

app.include_router(food_router)

@app.get("/")
async def root():
    return {"message": "Food Pipeline Backend is running."}
