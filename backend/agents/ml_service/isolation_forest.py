"""
isolation_forest.py
Isolation Forest anomaly detection model per domain.
Trains on historical signal features and scores new events 0-100.
"""
import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Default contamination rate (expected fraction of anomalies in data)
CONTAMINATION = 0.05  # 5%


def _model_path(domain: str) -> str:
    return os.path.join(MODEL_DIR, f"{domain.lower()}_isolation_forest.pkl")


def train(domain: str, training_data: list[dict]) -> dict:
    """
    Train or retrain an Isolation Forest model for the given domain.
    
    Args:
        domain: e.g. 'Medicine', 'Feed', 'Attendance'
        training_data: list of feature dicts
    
    Returns:
        dict with training summary
    """
    if len(training_data) < 10:
        return {"success": False, "reason": "Insufficient training data (need >= 10 samples)"}

    features = _extract_features(training_data)
    if features is None or len(features) == 0:
        return {"success": False, "reason": "Could not extract features"}

    model = IsolationForest(
        n_estimators=100,
        contamination=CONTAMINATION,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(features)
    joblib.dump(model, _model_path(domain))

    return {
        "success": True,
        "domain": domain,
        "samplesUsed": len(training_data),
        "modelPath": _model_path(domain),
    }


def score(domain: str, features_dict: dict) -> float:
    """
    Score a single event using the trained Isolation Forest model.
    
    Returns:
        Anomaly score 0-100. Higher = more anomalous.
        Returns 50 (neutral) if no model is trained yet.
    """
    model_path = _model_path(domain)

    if not os.path.exists(model_path):
        # No trained model yet — return neutral score
        return 50.0

    try:
        model = joblib.load(model_path)
        features = _extract_single_features(features_dict)
        
        if features is None:
            return 50.0

        # Isolation Forest scores: -1 = anomaly, 1 = normal
        # decision_function gives raw score (negative = more anomalous)
        raw_score = model.decision_function([features])[0]
        prediction = model.predict([features])[0]  # -1 or 1

        # Convert to 0-100 scale
        # decision_function range is typically -0.5 to 0.5
        # Map so that anomaly (-1) → high score (70-100), normal (1) → low score (0-40)
        normalized = max(0.0, min(1.0, (0.5 - raw_score)))
        anomaly_score = normalized * 100.0

        return round(anomaly_score, 2)

    except Exception as e:
        print(f"[IsolationForest] Scoring error for domain {domain}: {e}")
        return 50.0


def _extract_features(data: list[dict]) -> np.ndarray | None:
    """Extract numeric feature matrix from a list of feature dicts."""
    try:
        rows = [_extract_single_features(d) for d in data]
        rows = [r for r in rows if r is not None]
        if not rows:
            return None
        return np.array(rows)
    except Exception:
        return None


def _extract_single_features(d: dict) -> list | None:
    """Extract a numeric feature vector from a single feature dict."""
    try:
        return [
            float(d.get("signalCount", 0)),
            float(d.get("suspiciousFindingCount", 0)),
            float(d.get("ruleScore", 0)),
            float(d.get("afterHours", 0)),
            float(d.get("quantityMultiplier", 1)),
            float(d.get("previousAnomalyCount", 0)),
            float(d.get("editCount", 0)),
        ]
    except (TypeError, ValueError):
        return None
