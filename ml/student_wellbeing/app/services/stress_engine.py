"""
stress_engine.py — Rule-Based Stress Prediction Engine

Computes stress scores from academic calendar events,
generates recommendations, and evaluates diet impact.
All logic is deterministic (no ML/RAG).
"""

import logging
from datetime import datetime, date
from typing import Optional

logger = logging.getLogger(__name__)

# ── Stress score ranges by event type ─────────────────────────────────────────
EVENT_STRESS = {
    "exam":     (0.8, 1.0),
    "deadline": (0.6, 0.8),
    "lab":      (0.5, 0.7),
    "holiday":  (0.1, 0.3),
}

# ── Recommendations by stress level ──────────────────────────────────────────
RECOMMENDATIONS = {
    "high": [
        "Increase protein intake to support brain function",
        "Avoid skipping meals — eat at least 3 times a day",
        "Sleep at least 7 hours, avoid screens before bed",
        "Take 10-minute breaks every 45 minutes of study",
    ],
    "medium": [
        "Maintain a balanced diet with fruits and vegetables",
        "Stay hydrated — drink at least 8 glasses of water",
        "Keep a consistent sleep schedule",
    ],
    "low": [
        "Keep your routine consistent",
        "Use this low-pressure time to build healthy habits",
    ],
}

DEFAULT_STRESS_SCORE = 0.3


def compute_stress_score(calendar_data: list, current_date: date = None) -> dict:
    """
    Compute stress score from academic calendar events relative to current_date.

    Logic:
      - If current_date falls within an event range → use event stress range
      - If an event starts within 3 days → add +0.1 proximity bonus
      - Multiple overlapping events → scores accumulate, capped at 1.0

    Returns:
        {
          "stress_score": float (0.0 – 1.0),
          "stress_level": "low" | "medium" | "high",
          "event": Optional[str],
          "days_to_event": int | None,
          "recommendations": [...],
          "diet_risk": "low" | "moderate" | "high"
        }
    """
    if current_date is None:
        current_date = datetime.now().date()

    if not calendar_data:
        logger.warning("[Stress] No calendar data available — returning default score.")
        return _build_response(DEFAULT_STRESS_SCORE, None, None)

    total_stress = 0.0
    closest_event = None
    closest_days = None

    for entry in calendar_data:
        try:
            start = datetime.strptime(entry["start_date"], "%Y-%m-%d").date()
            end   = datetime.strptime(entry["end_date"], "%Y-%m-%d").date()
        except (KeyError, ValueError) as e:
            logger.warning("[Stress] Skipping malformed event: %s (%s)", entry, e)
            continue

        event_type = entry.get("type", "deadline")
        low_s, high_s = EVENT_STRESS.get(event_type, (0.5, 0.7))

        days_to_start = (start - current_date).days
        event_stress = 0.0

        # Currently inside the event window
        if start <= current_date <= end:
            event_stress = high_s
            days_to_start = 0
            logger.info("[Stress] Currently inside event '%s' (type=%s) → stress=%.2f",
                        entry["event"], event_type, event_stress)

        # Event starts within the next 3 days
        elif 0 < days_to_start <= 3:
            event_stress = low_s + 0.1
            logger.info("[Stress] Event '%s' in %d day(s) → stress=%.2f",
                        entry["event"], days_to_start, event_stress)

        # Event is upcoming but farther than 3 days
        elif 3 < days_to_start <= 7:
            event_stress = low_s * 0.5
            logger.debug("[Stress] Event '%s' in %d day(s) → minor stress=%.2f",
                         entry["event"], days_to_start, event_stress)

        total_stress += event_stress

        # Track the closest upcoming/active event
        if event_stress > 0:
            if closest_days is None or days_to_start < closest_days:
                closest_days = days_to_start
                closest_event = entry["event"]

    # Cap at 1.0
    total_stress = min(1.0, round(total_stress, 4))

    return _build_response(total_stress, closest_event, closest_days)


def _build_response(stress_score: float, event: Optional[str], days_to_event: Optional[int]) -> dict:
    """Build the full stress prediction response."""
    stress_level = _classify_stress(stress_score)
    recs = RECOMMENDATIONS.get(stress_level, [])
    diet_risk = compute_diet_impact(stress_score)

    return {
        "stress_score":    stress_score,
        "stress_level":    stress_level,
        "event":           event,
        "days_to_event":   days_to_event,
        "recommendations": recs,
        "diet_risk":       diet_risk,
    }


def _classify_stress(score: float) -> str:
    if score >= 0.7:
        return "high"
    elif score >= 0.4:
        return "medium"
    return "low"


# ── Diet Impact ───────────────────────────────────────────────────────────────

def compute_diet_impact(stress_score: float) -> str:
    """
    Rule-based diet risk assessment.
    High stress → higher probability of junk food / irregular meals.
    """
    if stress_score >= 0.8:
        return "high"
    elif stress_score >= 0.5:
        return "moderate"
    return "low"
