"""Train the initial risk model.

The bootstrap records are generated from the business-risk policy so Minema has
a reproducible model before enough real cancelled bookings are available.
Replace this data generator with MongoDB booking exports as records accumulate.
"""

from pathlib import Path
import random

import joblib
from sklearn.ensemble import RandomForestClassifier

MODEL_PATH = Path(__file__).parent / "models" / "cancellation_classifier.joblib"


def rule_risk(match_score: float, consensus_percent: float, group_size: int) -> int:
    risk = 35
    risk += -18 if match_score >= 80 else 20 if match_score < 50 else -5
    risk += -12 if consensus_percent >= 75 else 15 if consensus_percent < 50 else 0
    risk += -8 if group_size >= 20 else 10 if group_size < 10 else 0
    return max(5, min(88, risk))


def build_bootstrap_data(samples: int = 5000):
    rng = random.Random(42)
    features, labels = [], []
    for _ in range(samples):
        group_size = rng.randint(2, 80)
        consensus_percent = rng.randint(20, 100)
        match_score = rng.randint(25, 99)
        time_slot_hour = rng.choice([10, 12, 14, 16, 18, 20, 22])
        day_of_week = rng.randint(0, 6)
        risk = rule_risk(match_score, consensus_percent, group_size)
        # Late-night and weekday bookings add realistic variation to the labels.
        probability = min(0.95, max(0.03, risk / 100 + (0.05 if time_slot_hour >= 22 else 0) + (0.03 if day_of_week in [1, 2] else 0)))
        features.append([group_size, consensus_percent, match_score, time_slot_hour, day_of_week])
        labels.append(1 if rng.random() < probability else 0)
    return features, labels


if __name__ == "__main__":
    features, labels = build_bootstrap_data()
    model = RandomForestClassifier(n_estimators=300, min_samples_leaf=8, random_state=42, class_weight="balanced")
    model.fit(features, labels)
    MODEL_PATH.parent.mkdir(exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Saved trained RandomForestClassifier to {MODEL_PATH}")
