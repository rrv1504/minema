from pathlib import Path
from typing import Any

import joblib

MODEL_PATH = Path(__file__).parent / "models" / "cancellation_classifier.joblib"
FEATURE_NAMES = ["group_size", "consensus_percent", "match_score", "time_slot_hour", "day_of_week"]
_classifier = None


def load_cancellation_model():
    global _classifier
    if _classifier is None and MODEL_PATH.exists():
        _classifier = joblib.load(MODEL_PATH)
    return _classifier


def compute_cancellation_risk(match_score: float, consensus_percent: float, group_size: int, time_slot_hour: int = 20, day_of_week: int = 5) -> dict[str, Any]:
    risk = 35
    factors: list[dict[str, int | str]] = []
    if match_score >= 80:
        risk -= 18; factors.append({"label": "High group match score", "impact": -18})
    elif match_score < 50:
        risk += 20; factors.append({"label": "Low group match score", "impact": 20})
    else:
        risk -= 5; factors.append({"label": "Moderate match score", "impact": -5})
    if consensus_percent >= 75:
        risk -= 12; factors.append({"label": "Strong mood consensus", "impact": -12})
    elif consensus_percent < 50:
        risk += 15; factors.append({"label": "Mixed mood preferences", "impact": 15})
    if group_size >= 20:
        risk -= 8; factors.append({"label": "Large committed group", "impact": -8})
    elif group_size < 10:
        risk += 10; factors.append({"label": "Small group, higher dropout risk", "impact": 10})
    rule_risk = max(5, min(88, risk))
    classifier = load_cancellation_model()
    if classifier is not None:
        probability = classifier.predict_proba([[group_size, consensus_percent, match_score, time_slot_hour, day_of_week]])[0][1]
        risk = max(5, min(88, round(probability * 100)))
    else:
        risk = rule_risk
    level = "low" if risk < 30 else "medium" if risk < 55 else "high"
    suggestion = {"low": "This group has a strong booking signal. Confirm a time that suits everyone.", "medium": "Share the top picks with the group before finalizing the hall.", "high": "Try a higher-consensus option or confirm attendance before booking."}[level]
    return {
        "risk": risk,
        "level": level,
        "factors": factors,
        "suggestion": suggestion,
        "model": "RandomForestClassifier" if classifier is not None else "rule-based fallback",
        "ruleRisk": rule_risk,
    }
