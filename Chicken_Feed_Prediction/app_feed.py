import os
import json
import warnings
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings("ignore")

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "feed_xgboost.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "encoders", "feed_encoders.pkl")

# Load model and encoders
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model not found: {MODEL_PATH}")
if not os.path.exists(ENCODER_PATH):
    raise FileNotFoundError(f"Encoder not found: {ENCODER_PATH}")

model = joblib.load(MODEL_PATH)
metadata = joblib.load(ENCODER_PATH)

expected_features = []
if isinstance(metadata, dict):
    expected_features = metadata.get("features", [])

def safe_divide(a, b):
    if b is None or b == 0:
        return 0.0
    return a / b

@app.route("/api/predict-feed", methods=["POST"])
def predict_feed():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"success": False, "error": "Invalid JSON"}), 400
        
        # Extract features
        df = pd.DataFrame([{
            "chicken_type": data.get("chicken_type", "Broiler"),
            "breed": data.get("breed", "Unknown"),
            "initial_chicken_count": int(data.get("initial_chicken_count", 0)),
            "current_chicken_count": int(data.get("current_chicken_count", 0)),
            "age_days": int(data.get("age_days", 0)),
            "average_weight_kg": float(data.get("average_weight_kg", 0)),
            "target_weight_kg": float(data.get("target_weight_kg", 0)),
            "growth_rate_g_per_day": float(data.get("growth_rate_g_per_day", 0)),
            "mortality_count": int(data.get("mortality_count", 0)),
            "mortality_rate": safe_divide(int(data.get("mortality_count", 0)), max(int(data.get("initial_chicken_count", 1)), 1)),
            "disease_cases": int(data.get("disease_cases", 0)),
            "disease_type": data.get("disease_type", "Healthy"),
            "disease_severity": data.get("disease_severity", "Low"),
            "feed_type": data.get("feed_type", "Standard"),
            "daily_feed_consumption_kg": float(data.get("daily_feed_consumption_kg", 0)),
            "total_feed_consumption_kg": float(data.get("total_feed_consumption_kg", 0)),
            "feed_price_per_kg": float(data.get("feed_price_per_kg", 0)),
            "feed_cost": float(data.get("feed_cost", 0)),
            "feed_conversion_ratio": float(data.get("feed_conversion_ratio", 0)),
            "feed_wastage_kg": float(data.get("feed_wastage_kg", 0)),
            "feed_wastage_rate": float(data.get("feed_wastage_rate", 0)),
            "temperature_c": float(data.get("temperature_c", 0)),
            "humidity_percent": float(data.get("humidity_percent", 0)),
            "ammonia_ppm": float(data.get("ammonia_ppm", 0)),
            "biosecurity_score": float(data.get("biosecurity_score", 0)),
            "previous_month_feed_cost": float(data.get("previous_month_feed_cost", 0))
        }])

        df["survival_ratio"] = df["current_chicken_count"] / df["initial_chicken_count"].replace(0, np.nan)
        df["survival_ratio"] = df["survival_ratio"].fillna(0)
        df["birds_lost"] = df["initial_chicken_count"] - df["current_chicken_count"]
        df["feed_cost_per_chicken"] = df["feed_cost"] / df["current_chicken_count"].replace(0, np.nan)
        df["feed_cost_per_chicken"] = df["feed_cost_per_chicken"].fillna(0)
        df["daily_feed_cost"] = df["daily_feed_consumption_kg"] * df["feed_price_per_kg"]
        df["daily_feed_cost_per_chicken"] = df["daily_feed_cost"] / df["current_chicken_count"].replace(0, np.nan)
        df["daily_feed_cost_per_chicken"] = df["daily_feed_cost_per_chicken"].fillna(0)
        df["daily_feed_per_chicken"] = df["daily_feed_consumption_kg"] / df["current_chicken_count"].replace(0, np.nan)
        df["daily_feed_per_chicken"] = df["daily_feed_per_chicken"].fillna(0)
        df["daily_feed_consumption_cost"] = df["daily_feed_consumption_kg"] * df["feed_price_per_kg"]
        df["estimated_monthly_feed_cost"] = df["daily_feed_cost"] * 30
        df["estimated_monthly_feed_kg"] = df["daily_feed_consumption_kg"] * 30
        df["feed_price_pressure"] = df["feed_price_per_kg"] * df["daily_feed_consumption_kg"]
        df["feed_wastage_cost"] = df["feed_wastage_kg"] * df["feed_price_per_kg"]
        df["calculated_wastage_rate"] = df["feed_wastage_kg"] / df["daily_feed_consumption_kg"].replace(0, np.nan)
        df["calculated_wastage_rate"] = df["calculated_wastage_rate"].fillna(0)
        df["feed_cost_change"] = df["feed_cost"] - df["previous_month_feed_cost"]
        df["feed_cost_change_percent"] = (df["feed_cost_change"] / df["previous_month_feed_cost"].replace(0, np.nan)) * 100
        df["feed_cost_change_percent"] = df["feed_cost_change_percent"].fillna(0)
        df["weight_gap_kg"] = df["target_weight_kg"] - df["average_weight_kg"]
        df["weight_progress_ratio"] = df["average_weight_kg"] / df["target_weight_kg"].replace(0, np.nan)
        df["weight_progress_ratio"] = df["weight_progress_ratio"].fillna(0)
        df["disease_rate"] = df["disease_cases"] / df["current_chicken_count"].replace(0, np.nan)
        df["disease_rate"] = df["disease_rate"].fillna(0)

        # Categorical Encoding
        categorical_cols = df.select_dtypes(include=["object"]).columns
        for col in categorical_cols:
            df[col] = df[col].astype("category")

        # Align columns
        if len(expected_features) > 0:
            for feature in expected_features:
                if feature not in df.columns:
                    df[feature] = 0
            df = df[expected_features]
            
        prediction_log = model.predict(df)
        predicted_cost = max(float(np.expm1(prediction_log[0])), 0)
        
        current_cost = float(data.get("feed_cost", 0))
        previous_cost = float(data.get("previous_month_feed_cost", 0))
        
        change_current = predicted_cost - current_cost
        change_current_percent = safe_divide(change_current, current_cost) * 100

        change_previous = predicted_cost - previous_cost
        change_previous_percent = safe_divide(change_previous, previous_cost) * 100
        
        lower_bound = predicted_cost * 0.96
        upper_bound = predicted_cost * 1.04
        
        status = "stable"
        trend = "RELATIVELY STABLE"
        if change_current_percent >= 20:
            trend = "SIGNIFICANT INCREASE"
            status = "critical"
        elif change_current_percent >= 5:
            trend = "MODERATE INCREASE"
            status = "warning"
        elif change_current_percent <= -20:
            trend = "SIGNIFICANT DECREASE"
            status = "positive"
        elif change_current_percent <= -5:
            trend = "MODERATE DECREASE"
            status = "positive"

        return jsonify({
            "success": True,
            "prediction": {
                "predicted_next_month_feed_cost": round(predicted_cost, 2),
                "current_feed_cost": round(current_cost, 2),
                "previous_month_feed_cost": round(previous_cost, 2),
                "expected_lower_range": round(lower_bound, 2),
                "expected_upper_range": round(upper_bound, 2),
                "change_from_current": round(change_current, 2),
                "change_percent_from_current": round(change_current_percent, 2),
                "change_from_previous": round(change_previous, 2),
                "change_percent_from_previous": round(change_previous_percent, 2),
                "trend": trend,
                "status": status
            },
            "important_factors": {
                "current_chicken_count": int(data.get("current_chicken_count", 0)),
                "daily_feed_consumption_kg": float(data.get("daily_feed_consumption_kg", 0)),
                "feed_price_per_kg": float(data.get("feed_price_per_kg", 0)),
                "current_feed_cost": current_cost,
                "previous_month_feed_cost": previous_cost,
                "feed_wastage_kg": float(data.get("feed_wastage_kg", 0)),
                "disease_cases": int(data.get("disease_cases", 0)),
                "temperature_c": float(data.get("temperature_c", 0)),
                "humidity_percent": float(data.get("humidity_percent", 0)),
                "biosecurity_score": float(data.get("biosecurity_score", 0))
            }
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
