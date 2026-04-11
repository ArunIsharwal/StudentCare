from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.food import router as food_router

app = FastAPI(title="Food Pipeline API")

# Add CORS Middleware to allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(food_router)

@app.get("/")
async def root():
    return {"message": "Food Pipeline Backend is running."}
