"""
stress.py — Stress Analysis API Routes

Endpoints for calendar upload and stress prediction.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, UploadFile, File

from student_wellbeing.app.services.schedule_parser import parse_calendar
from student_wellbeing.app.services.stress_engine import compute_stress_score
from student_wellbeing.app.services.sleep_analyzer import analyze_sleep_impact

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/student-wellbeing/stress", tags=["Stress Analysis"])

# ── In-memory calendar cache ──────────────────────────────────────────────────
_calendar_cache: list = []


@router.get("/")
def test_stress_endpoint():
    return {"message": "Stress endpoint is active"}


@router.post("/upload-calendar")
async def upload_calendar(file: UploadFile = File(...)):
    """
    Upload an academic calendar file (CSV, JSON, or PDF).
    Parsed events are cached in memory for stress predictions.

    Supported formats:
      - CSV: columns event_name, start_date, end_date, event_type
      - JSON: list of objects with same keys
      - PDF: auto-extracts events using keyword + date regex matching
    """
    global _calendar_cache

    contents = await file.read()
    events = parse_calendar(contents, file.filename)

    if not events:
        return {
            "status": "error",
            "message": (
                "Failed to parse calendar. For CSV/JSON, ensure columns: "
                "event_name, start_date, end_date, event_type. "
                "For PDF, the parser supports text-based and image-based "
                "(scanned) PDFs with OCR. Ensure the document contains "
                "recognizable event keywords and dates."
            )
        }

    _calendar_cache = events
    logger.info("[Route] Calendar uploaded: %d events cached.", len(events))

    return {
        "status":       "success",
        "events_parsed": len(events),
        "events":        events
    }


@router.get("/stress-prediction")
def get_stress_prediction():
    """
    Get today's stress prediction based on uploaded calendar.
    Returns stress score, sleep risk, diet risk, and recommendations.
    """
    today = datetime.now().date()

    # Compute stress (uses default 0.3 if no calendar uploaded)
    stress_result = compute_stress_score(_calendar_cache, today)

    # Compute sleep risk from stress score
    sleep_result = analyze_sleep_impact(stress_result["stress_score"])

    return {
        "date":            today.isoformat(),
        "stress_score":    stress_result["stress_score"],
        "stress_level":    stress_result["stress_level"],
        "event":           stress_result["event"],
        "days_to_event":   stress_result["days_to_event"],
        "sleep_risk":      sleep_result["sleep_risk"],
        "diet_risk":       stress_result["diet_risk"],
        "recommendations": stress_result["recommendations"],
    }


@router.post("/analyze")
def analyze_stress():
    """Quick stress analysis (uses cached calendar if available)."""
    today = datetime.now().date()
    stress_result = compute_stress_score(_calendar_cache, today)
    sleep_result = analyze_sleep_impact(stress_result["stress_score"])

    return {
        "date":            today.isoformat(),
        "stress_score":    stress_result["stress_score"],
        "stress_level":    stress_result["stress_level"],
        "event":           stress_result["event"],
        "days_to_event":   stress_result["days_to_event"],
        "sleep_risk":      sleep_result["sleep_risk"],
        "diet_risk":       stress_result["diet_risk"],
        "recommendations": stress_result["recommendations"],
    }
