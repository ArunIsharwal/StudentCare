from pydantic import BaseModel
from typing import List

class StressRequest(BaseModel):
    exam_dates: List[str]
    deadlines: int
    sleep_hours: float
    meals_per_day: int

class StressResponse(BaseModel):
    stress_score: float
    risk_level: str
    recommendations: List[str]
