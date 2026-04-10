"""
sleep_analyzer.py — Rule-Based Sleep Risk Assessment

Evaluates sleep disruption risk based on stress scores
and raw sleep hour inputs.
"""

import logging

logger = logging.getLogger(__name__)


def analyze_sleep_impact(stress_score: float) -> dict:
    """
    Predict sleep disruption risk from a stress score (0.0 – 1.0).

    Returns:
        {"sleep_risk": "low" | "moderate" | "high"}
    """
    if stress_score > 0.8:
        risk = "high"
    elif stress_score >= 0.5:
        risk = "moderate"
    else:
        risk = "low"

    logger.info("[Sleep] Stress=%.2f → sleep_risk=%s", stress_score, risk)
    return {"sleep_risk": risk}


# Legacy function kept for backward compatibility
def analyze_sleep(sleep_hours: float):
    penalty = 0.0
    recommendations = []
    
    if sleep_hours < 5.0:
        penalty = 4.0
        recommendations.append("Severe sleep deprivation detected. Try to get at least 7 hours.")
    elif sleep_hours < 7.0:
        penalty = 2.0
        recommendations.append("Slightly sleep deprived. Aim for 8 hours for better cognitive function.")
    elif sleep_hours > 10.0:
        penalty = 1.0
        recommendations.append("Oversleeping might indicate fatigue. Try to stick to a consistent 8-hour routine.")
    else:
        recommendations.append("Good sleep hygiene maintained!")
        
    return penalty, recommendations
