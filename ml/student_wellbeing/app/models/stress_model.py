"""
stress_model.py — Response Schemas for Stress Prediction

Pydantic models for request/response validation on /stress endpoints.
"""

from pydantic import BaseModel
from typing import List, Optional


class CalendarEvent(BaseModel):
    event: str
    type: str
    start_date: str
    end_date: str
    intensity: str


class StressPredictionResponse(BaseModel):
    date: str
    stress_score: float
    stress_level: str
    event: Optional[str] = None
    days_to_event: Optional[int] = None
    sleep_risk: str
    diet_risk: str
    recommendations: List[str]
