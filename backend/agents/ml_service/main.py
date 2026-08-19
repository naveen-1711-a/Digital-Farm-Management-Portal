"""
main.py
Farm Integrity Agent — Python ML Microservice
FastAPI server exposing anomaly detection and model training endpoints.
Runs on port 5001 alongside the Node.js backend (port 5000).

Start with: uvicorn main:app --host 0.0.0.0 --port 5001 --reload
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Optional
import uvicorn

from isolation_forest import score as if_score, train as if_train
from behavior_model import is_quantity_anomalous, profile_deviation_score

app = FastAPI(
    title="Farm Integrity ML Service",
    description="Isolation Forest anomaly detection for the Farm Integrity Agent",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ──────────────────────────────────────────────────────────────────

class AnomalyRequest(BaseModel):
    domain: str  # e.g. 'Medicine', 'Feed'
    features: dict[str, Any]

class AnomalyResponse(BaseModel):
    domain: str
    anomalyScore: float  # 0-100, higher = more anomalous
    isAnomaly: bool
    model: str

class TrainRequest(BaseModel):
    domain: str
    trainingData: list[dict[str, Any]]

class QuantityCheckRequest(BaseModel):
    current: float
    historical: list[float]
    threshold_z: Optional[float] = 2.5

class ProfileDeviationRequest(BaseModel):
    currentHour: Optional[float] = None
    avgLoginHour: float
    loginStd: float
    currentEntries: Optional[int] = None
    avgEntries: float
    entriesStd: float


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Farm Integrity ML Service",
        "version": "1.0.0",
    }


@app.post("/detect-anomaly", response_model=AnomalyResponse)
def detect_anomaly(req: AnomalyRequest):
    """
    Score a farm event using the domain-specific Isolation Forest model.
    Returns anomalyScore 0-100 (higher = more suspicious).
    Falls back to 50 (neutral) if no model is trained yet.
    """
    try:
        anomaly_score = if_score(req.domain, req.features)
        return AnomalyResponse(
            domain=req.domain,
            anomalyScore=anomaly_score,
            isAnomaly=anomaly_score >= 65.0,
            model="IsolationForest",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/train")
def train_model(req: TrainRequest):
    """
    Train or retrain the Isolation Forest model for a given domain.
    Typically called on a schedule or when enough new labeled data exists.
    """
    try:
        result = if_train(req.domain, req.trainingData)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/quantity-anomaly")
def check_quantity(req: QuantityCheckRequest):
    """
    Check if a quantity value is statistically anomalous using Z-score + IQR.
    """
    try:
        result = is_quantity_anomalous(req.current, req.historical, req.threshold_z)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/behavior-deviation")
def check_behavior(req: ProfileDeviationRequest):
    """
    Calculate behavioral deviation score for a worker vs their profile baseline.
    """
    try:
        score = profile_deviation_score(
            req.currentHour,
            req.avgLoginHour,
            req.loginStd,
            req.currentEntries,
            req.avgEntries,
            req.entriesStd,
        )
        return {"deviationScore": score, "isAnomalous": score >= 60.0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)
