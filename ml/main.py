import sys
import os

# ── Path Setup ────────────────────────────────────────────────────────────────
# food.py uses `from app.services...` (relative to food_pipeline/).
# Injecting food_pipeline root lets those imports resolve from anywhere.

ML_DIR = os.path.dirname(os.path.abspath(__file__))          # StudentCare/ml/
ROOT_DIR = os.path.dirname(ML_DIR)                           # StudentCare/
FOOD_PIPELINE_DIR = os.path.join(ML_DIR, "food_pipeline")    # StudentCare/ml/food_pipeline/

for path in [FOOD_PIPELINE_DIR, ML_DIR, ROOT_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

# ── Imports ───────────────────────────────────────────────────────────────────
from fastapi import FastAPI

# food_pipeline uses internal `from app.services...` — works because FOOD_PIPELINE_DIR is in sys.path
from app.routes.food import router as food_router

# student_wellbeing is a proper package under ml/
from student_wellbeing.app.routes.stress import router as stress_router

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="StudentCare ML API",
    version="1.0.0",
    description="Unified ML backend: Food Analysis + Student Wellbeing"
)

app.include_router(food_router, prefix="/api")        # → /api/food/ and /api/food/analyze
app.include_router(stress_router)                     # → /api/student-wellbeing/stress/*

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "food":             "/api/food/",
            "food_analyze":     "/api/food/analyze",
            "stress":           "/api/student-wellbeing/stress/",
            "stress_analyze":   "/api/student-wellbeing/stress/analyze"
        }
    }
