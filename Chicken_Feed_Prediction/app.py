import os
import json
import pickle
import warnings
import joblib

import numpy as np
import pandas as pd

from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings("ignore")


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)
CORS(app)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "medicine_cost_xgboost.pkl"
)

PREPROCESSOR_PATH = os.path.join(
    BASE_DIR,
    "models",
    "medicine_preprocessor.pkl"
)

FEATURE_INFO_PATH = os.path.join(
    BASE_DIR,
    "models",
    "medicine_feature_info.json"
)


# ============================================================
# MODEL INFORMATION
# ============================================================

MODEL_R2 = 0.9947
MODEL_MAPE = 5.67
MODEL_ACCURACY = 94.33


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 80)
print("DIGITAL FARM MANAGEMENT PORTAL")
print("MEDICINE COST PREDICTION API")
print("=" * 80)

print("\nLoading model files...")


if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}"
    )

if not os.path.exists(PREPROCESSOR_PATH):
    raise FileNotFoundError(
        f"Preprocessor not found: {PREPROCESSOR_PATH}"
    )

if not os.path.exists(FEATURE_INFO_PATH):
    raise FileNotFoundError(
        f"Feature information not found: {FEATURE_INFO_PATH}"
    )


# ------------------------------------------------------------
# Load XGBoost model
# ------------------------------------------------------------

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

print("XGBoost model loaded")


# ------------------------------------------------------------
# IMPORTANT:
# Your preprocessor was saved using joblib, not pickle.
# Therefore load it using joblib.
# ------------------------------------------------------------

preprocessor = joblib.load(PREPROCESSOR_PATH)

print("Preprocessor loaded")


# ------------------------------------------------------------
# Feature metadata
# ------------------------------------------------------------

with open(FEATURE_INFO_PATH, "r") as f:
    feature_info = json.load(f)

print("Feature information loaded")


# ============================================================
# FEATURE LIST
# ============================================================

def find_feature_list(metadata):

    if not isinstance(metadata, dict):
        return None

    possible_keys = [
        "input_features",
        "feature_columns",
        "features",
        "feature_names",
        "training_features",
        "model_features",
        "columns"
    ]

    for key in possible_keys:

        value = metadata.get(key)

        if isinstance(value, list):
            return value

    return None


training_features = find_feature_list(
    feature_info
)


# ------------------------------------------------------------
# Try getting features from preprocessor
# ------------------------------------------------------------

if training_features is None:

    try:

        if hasattr(
            preprocessor,
            "feature_names_in_"
        ):

            training_features = list(
                preprocessor.feature_names_in_
            )

    except Exception:
        pass


# ------------------------------------------------------------
# Try model feature names
# ------------------------------------------------------------

if training_features is None:

    try:

        if hasattr(
            model,
            "feature_names_in_"
        ):

            training_features = list(
                model.feature_names_in_
            )

    except Exception:
        pass


if training_features is None:

    raise ValueError(
        "Could not determine training feature names."
    )

print(
    f"Training input features: "
    f"{len(training_features)}"
)


# ============================================================
# CATEGORICAL FEATURES
# ============================================================

CATEGORICAL_COLUMNS = [
    "chicken_type",
    "breed",
    "disease_type",
    "disease_severity",
    "medicine_type",
    "season"
]


# ============================================================
# SAFE DIVISION
# ============================================================

def safe_divide(a, b):

    if b is None or b == 0:
        return 0.0

    return a / b


# ============================================================
# SEASON
# ============================================================

def get_season(month):

    if month in [6, 7, 8, 9]:
        return "Monsoon"

    elif month in [3, 4, 5]:
        return "Summer"

    else:
        return "Winter"


# ============================================================
# FEATURE ENGINEERING
# ============================================================

def create_features(data):

    # --------------------------------------------------------
    # Required values
    # --------------------------------------------------------

    farm_area_acres = float(
        data.get("farm_area_acres", 0)
    )

    chicken_type = data.get(
        "chicken_type",
        "Broiler"
    )

    breed = data.get(
        "breed",
        "Unknown"
    )

    initial_chicken_count = int(
        data.get(
            "initial_chicken_count",
            0
        )
    )

    current_chicken_count = int(
        data.get(
            "current_chicken_count",
            0
        )
    )

    age_days = int(
        data.get(
            "age_days",
            0
        )
    )

    average_weight_kg = float(
        data.get(
            "average_weight_kg",
            0
        )
    )

    target_weight_kg = float(
        data.get(
            "target_weight_kg",
            0
        )
    )

    growth_rate_g_per_day = float(
        data.get(
            "growth_rate_g_per_day",
            0
        )
    )

    mortality_count = int(
        data.get(
            "mortality_count",
            0
        )
    )

    disease_cases = int(
        data.get(
            "disease_cases",
            0
        )
    )

    disease_type = data.get(
        "disease_type",
        "Healthy"
    )

    disease_severity = data.get(
        "disease_severity",
        "Low"
    )

    vaccination_count = int(
        data.get(
            "vaccination_count",
            0
        )
    )

    vaccination_cost = float(
        data.get(
            "vaccination_cost",
            0
        )
    )

    medicine_type = data.get(
        "medicine_type",
        "General"
    )

    medicine_quantity = float(
        data.get(
            "medicine_quantity",
            0
        )
    )

    medicine_price = float(
        data.get(
            "medicine_price",
            0
        )
    )

    medicine_cost = float(
        data.get(
            "medicine_cost",
            0
        )
    )

    vet_visit_count = int(
        data.get(
            "vet_visit_count",
            0
        )
    )

    vet_cost = float(
        data.get(
            "vet_cost",
            0
        )
    )

    temperature_c = float(
        data.get(
            "temperature_c",
            0
        )
    )

    humidity_percent = float(
        data.get(
            "humidity_percent",
            0
        )
    )

    ammonia_ppm = float(
        data.get(
            "ammonia_ppm",
            0
        )
    )

    water_consumption_liters = float(
        data.get(
            "water_consumption_liters",
            0
        )
    )

    biosecurity_score = float(
        data.get(
            "biosecurity_score",
            0
        )
    )

    electricity_cost = float(
        data.get(
            "electricity_cost",
            0
        )
    )

    labour_cost = float(
        data.get(
            "labour_cost",
            0
        )
    )

    daily_feed_consumption_kg = float(
        data.get(
            "daily_feed_consumption_kg",
            0
        )
    )

    feed_price_per_kg = float(
        data.get(
            "feed_price_per_kg",
            0
        )
    )

    feed_cost = float(
        data.get(
            "feed_cost",
            0
        )
    )

    previous_month_medicine_cost = float(
        data.get(
            "previous_month_medicine_cost",
            0
        )
    )


    # ========================================================
    # DATE
    # ========================================================

    date_value = data.get(
        "current_date",
        None
    )

    if date_value:

        try:
            current_date = pd.to_datetime(
                date_value
            )

        except Exception:
            current_date = pd.Timestamp.today()

    else:
        current_date = pd.Timestamp.today()


    date_year = current_date.year
    date_month = current_date.month
    date_day = current_date.day
    date_dayofweek = current_date.dayofweek
    date_quarter = current_date.quarter

    date_weekofyear = int(
        current_date.isocalendar().week
    )

    date_dayofyear = (
        current_date.dayofyear
    )


    # ========================================================
    # DERIVED FEATURES
    # ========================================================

    survival_ratio = safe_divide(
        current_chicken_count,
        initial_chicken_count
    )

    birds_lost = max(
        initial_chicken_count -
        current_chicken_count,
        0
    )

    mortality_rate = (
        safe_divide(
            mortality_count,
            initial_chicken_count
        ) * 100
    )

    mortality_per_current_bird = safe_divide(
        mortality_count,
        current_chicken_count
    )

    birds_per_acre = safe_divide(
        current_chicken_count,
        farm_area_acres
    )

    disease_rate = (
        safe_divide(
            disease_cases,
            current_chicken_count
        ) * 100
    )

    disease_mortality_ratio = safe_divide(
        mortality_count,
        disease_cases
    )

    medicine_cost_per_bird = safe_divide(
        medicine_cost,
        current_chicken_count
    )

    medicine_quantity_per_bird = safe_divide(
        medicine_quantity,
        current_chicken_count
    )

    medicine_price_pressure = (
        medicine_price *
        medicine_quantity
    )

    medicine_base_cost = (
        medicine_quantity *
        medicine_price
    )

    medicine_cost_change = (
        medicine_cost -
        previous_month_medicine_cost
    )

    medicine_cost_change_percent = (
        safe_divide(
            medicine_cost_change,
            previous_month_medicine_cost
        ) * 100
    )

    vet_cost_per_visit = safe_divide(
        vet_cost,
        vet_visit_count
    )

    vet_cost_per_bird = safe_divide(
        vet_cost,
        current_chicken_count
    )

    vaccination_cost_per_bird = safe_divide(
        vaccination_cost,
        current_chicken_count
    )

    vaccination_cost_per_event = safe_divide(
        vaccination_cost,
        vaccination_count
    )

    daily_feed_per_bird = safe_divide(
        daily_feed_consumption_kg,
        current_chicken_count
    )

    feed_cost_per_bird = safe_divide(
        feed_cost,
        current_chicken_count
    )

    estimated_monthly_feed_cost = (
        daily_feed_consumption_kg *
        feed_price_per_kg *
        30
    )


    # ========================================================
    # ENVIRONMENT RISK
    # ========================================================

    temperature_risk = max(
        temperature_c - 28,
        0
    )

    humidity_risk = max(
        humidity_percent - 70,
        0
    )

    ammonia_risk = max(
        ammonia_ppm - 10,
        0
    )

    biosecurity_risk = max(
        70 - biosecurity_score,
        0
    )

    environment_risk_score = (

        temperature_risk * 2.0

        + humidity_risk * 1.0

        + ammonia_risk * 2.0

        + biosecurity_risk * 0.5
    )

    environment_risk_score = float(
        np.clip(
            environment_risk_score,
            0,
            100
        )
    )


    # ========================================================
    # WEIGHT FEATURES
    # ========================================================

    weight_gap_kg = (
        target_weight_kg -
        average_weight_kg
    )

    weight_progress_ratio = safe_divide(
        average_weight_kg,
        target_weight_kg
    )

    age_months = (
        age_days / 30
    )

    estimated_growth_total_g = (
        growth_rate_g_per_day *
        age_days
    )


    # ========================================================
    # OPERATING COST
    # ========================================================

    total_operating_cost = (

        electricity_cost
        + labour_cost
        + vet_cost
        + vaccination_cost
        + medicine_cost
        + feed_cost
    )


    # ========================================================
    # CYCLIC FEATURES
    # ========================================================

    month_sin = np.sin(
        2 * np.pi *
        date_month / 12
    )

    month_cos = np.cos(
        2 * np.pi *
        date_month / 12
    )

    dayofyear_sin = np.sin(
        2 * np.pi *
        date_dayofyear / 365.25
    )

    dayofyear_cos = np.cos(
        2 * np.pi *
        date_dayofyear / 365.25
    )


    # ========================================================
    # SEASON
    # ========================================================

    season = get_season(
        date_month
    )


    # ========================================================
    # RAW DATA
    # ========================================================

    features = {

        "chicken_type": chicken_type,
        "breed": breed,

        "farm_area_acres":
            farm_area_acres,

        "initial_chicken_count":
            initial_chicken_count,

        "current_chicken_count":
            current_chicken_count,

        "age_days":
            age_days,

        "age_months":
            age_months,

        "average_weight_kg":
            average_weight_kg,

        "target_weight_kg":
            target_weight_kg,

        "growth_rate_g_per_day":
            growth_rate_g_per_day,

        "weight_gap_kg":
            weight_gap_kg,

        "weight_progress_ratio":
            weight_progress_ratio,

        "mortality_count":
            mortality_count,

        "mortality_rate":
            mortality_rate,

        "survival_ratio":
            survival_ratio,

        "birds_lost":
            birds_lost,

        "mortality_per_current_bird":
            mortality_per_current_bird,

        "birds_per_acre":
            birds_per_acre,

        "disease_cases":
            disease_cases,

        "disease_type":
            disease_type,

        "disease_severity":
            disease_severity,

        "disease_rate":
            disease_rate,

        "vaccination_count":
            vaccination_count,

        "vaccination_cost":
            vaccination_cost,

        "medicine_type":
            medicine_type,

        "medicine_quantity":
            medicine_quantity,

        "medicine_price":
            medicine_price,

        "medicine_base_cost":
            medicine_base_cost,

        "medicine_cost":
            medicine_cost,

        "medicine_cost_per_bird":
            medicine_cost_per_bird,

        "medicine_quantity_per_bird":
            medicine_quantity_per_bird,

        "medicine_price_pressure":
            medicine_price_pressure,

        "medicine_cost_change":
            medicine_cost_change,

        "medicine_cost_change_percent":
            medicine_cost_change_percent,

        "vet_visit_count":
            vet_visit_count,

        "vet_cost":
            vet_cost,

        "temperature_c":
            temperature_c,

        "humidity_percent":
            humidity_percent,

        "ammonia_ppm":
            ammonia_ppm,

        "water_consumption_liters":
            water_consumption_liters,

        "biosecurity_score":
            biosecurity_score,

        "environment_risk_score":
            environment_risk_score,

        "electricity_cost":
            electricity_cost,

        "labour_cost":
            labour_cost,

        "daily_feed_consumption_kg":
            daily_feed_consumption_kg,

        "feed_price_per_kg":
            feed_price_per_kg,

        "feed_cost":
            feed_cost,

        "previous_month_medicine_cost":
            previous_month_medicine_cost,

        "season":
            season,

        "total_operating_cost":
            total_operating_cost,

        "date_year":
            date_year,

        "date_month":
            date_month,

        "date_day":
            date_day,

        "date_day_of_year":
            date_dayofyear,

        "date_weekofyear":
            date_weekofyear,

        "date_quarter":
            date_quarter,

        "date_is_weekend":
            int(date_dayofweek >= 5),

        "date_month_sin":
            month_sin,

        "date_month_cos":
            month_cos,

        "date_dayofyear_sin":
            dayofyear_sin,

        "date_dayofyear_cos":
            dayofyear_cos
    }


    return pd.DataFrame(
        [features]
    )


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_medicine_cost(data):

    # --------------------------------------------------------
    # Create raw features
    # --------------------------------------------------------

    input_df = create_features(
        data
    )


    # --------------------------------------------------------
    # Match training columns
    # --------------------------------------------------------

    for feature in training_features:

        if feature not in input_df.columns:

            input_df[feature] = 0


    input_df = input_df[
        training_features
    ].copy()


    # --------------------------------------------------------
    # Missing values
    # --------------------------------------------------------

    input_df = input_df.replace(
        [np.inf, -np.inf],
        np.nan
    )


    for column in input_df.columns:

        if pd.api.types.is_numeric_dtype(
            input_df[column]
        ):

            input_df[column] = (
                input_df[column]
                .fillna(0)
            )

        else:

            input_df[column] = (
                input_df[column]
                .fillna("Unknown")
            )


    # --------------------------------------------------------
    # PREPROCESSING
    # --------------------------------------------------------

    X_processed = preprocessor.transform(
        input_df
    )


    # --------------------------------------------------------
    # XGBOOST
    # --------------------------------------------------------

    prediction_log = model.predict(
        X_processed
    )


    # --------------------------------------------------------
    # IMPORTANT:
    # Training target:
    #
    # y = log1p(medicine_cost_next_month)
    #
    # Reverse:
    #
    # cost = expm1(prediction)
    # --------------------------------------------------------

    predicted_cost = float(
        np.expm1(
            prediction_log[0]
        )
    )

    predicted_cost = max(
        predicted_cost,
        0
    )


    # ========================================================
    # CURRENT VALUES
    # ========================================================

    current_cost = float(
        data.get(
            "medicine_cost",
            0
        )
    )

    previous_cost = float(
        data.get(
            "previous_month_medicine_cost",
            0
        )
    )


    # ========================================================
    # CHANGE
    # ========================================================

    change_current = (
        predicted_cost -
        current_cost
    )

    change_current_percent = (
        safe_divide(
            change_current,
            current_cost
        ) * 100
    )

    change_previous = (
        predicted_cost -
        previous_cost
    )

    change_previous_percent = (
        safe_divide(
            change_previous,
            previous_cost
        ) * 100
    )


    # ========================================================
    # EXPECTED RANGE
    # ========================================================

    error_rate = MODEL_MAPE / 100

    error_amount = (
        predicted_cost *
        error_rate
    )

    lower_bound = max(
        predicted_cost -
        error_amount,
        0
    )

    upper_bound = (
        predicted_cost +
        error_amount
    )


    # ========================================================
    # TREND STATUS
    # ========================================================

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

    else:

        trend = "RELATIVELY STABLE"

        status = "stable"


    # ========================================================
    # RESPONSE
    # ========================================================

    return {

        "success": True,

        "prediction": {

            "current_medicine_cost":
                round(
                    current_cost,
                    2
                ),

            "previous_month_medicine_cost":
                round(
                    previous_cost,
                    2
                ),

            "predicted_next_month_medicine_cost":
                round(
                    predicted_cost,
                    2
                ),

            "expected_lower_range":
                round(
                    lower_bound,
                    2
                ),

            "expected_upper_range":
                round(
                    upper_bound,
                    2
                ),

            "change_from_current":
                round(
                    change_current,
                    2
                ),

            "change_percent_from_current":
                round(
                    change_current_percent,
                    2
                ),

            "change_from_previous":
                round(
                    change_previous,
                    2
                ),

            "change_percent_from_previous":
                round(
                    change_previous_percent,
                    2
                ),

            "trend":
                trend,

            "status":
                status
        },

        "farm": {

            "chicken_count":
                int(
                    data.get(
                        "current_chicken_count",
                        0
                    )
                ),

            "disease_cases":
                int(
                    data.get(
                        "disease_cases",
                        0
                    )
                ),

            "disease_type":
                data.get(
                    "disease_type",
                    "Unknown"
                ),

            "disease_severity":
                data.get(
                    "disease_severity",
                    "Unknown"
                ),

            "medicine_type":
                data.get(
                    "medicine_type",
                    "Unknown"
                ),

            "medicine_quantity":
                float(
                    data.get(
                        "medicine_quantity",
                        0
                    )
                ),

            "medicine_price":
                float(
                    data.get(
                        "medicine_price",
                        0
                    )
                ),

            "temperature":
                float(
                    data.get(
                        "temperature_c",
                        0
                    )
                ),

            "humidity":
                float(
                    data.get(
                        "humidity_percent",
                        0
                    )
                ),

            "ammonia":
                float(
                    data.get(
                        "ammonia_ppm",
                        0
                    )
                ),

            "biosecurity_score":
                float(
                    data.get(
                        "biosecurity_score",
                        0
                    )
                )
        },

        "environment": {

            "risk_score":
                round(
                    float(
                        create_features(data).iloc[0][
                            "environment_risk_score"
                        ]
                    ),
                    2
                )
        },

        "model": {

            "name":
                "XGBoost",

            "target":
                "medicine_cost_next_month",

            "target_transformation":
                "log1p → expm1",

            "r2":
                MODEL_R2,

            "mape":
                MODEL_MAPE,

            "approx_accuracy":
                MODEL_ACCURACY
        }
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "success": True,

        "message":
            "Digital Farm Medicine Cost Prediction API",

        "model":
            "XGBoost",

        "target":
            "medicine_cost_next_month",

        "status":
            "running"
    })


# ============================================================
# HEALTH API
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    return jsonify({

        "success": True,

        "status":
            "healthy",

        "model_loaded":
            model is not None,

        "preprocessor_loaded":
            preprocessor is not None
    })


# ============================================================
# PREDICT API
# ============================================================

@app.route(
    "/api/predict-medicine",
    methods=["POST"]
)
def predict_api():

    try:

        # ----------------------------------------------------
        # Get JSON
        # ----------------------------------------------------

        data = request.get_json(
            silent=True
        )


        if data is None:

            return jsonify({

                "success": False,

                "error":
                    "Request body must contain JSON data."
            }), 400


        # ----------------------------------------------------
        # Basic validation
        # ----------------------------------------------------

        required_fields = [

            "farm_area_acres",

            "initial_chicken_count",

            "current_chicken_count",

            "disease_cases",

            "medicine_quantity",

            "medicine_price",

            "medicine_cost",

            "previous_month_medicine_cost"
        ]


        missing_fields = [

            field

            for field in required_fields

            if field not in data
        ]


        if missing_fields:

            return jsonify({

                "success": False,

                "error":
                    "Missing required fields.",

                "missing_fields":
                    missing_fields

            }), 400


        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        result = predict_medicine_cost(
            data
        )


        return jsonify(
            result
        ), 200


    except Exception as e:

        print(
            "\nPrediction API error:"
        )

        print(
            str(e)
        )


        return jsonify({

            "success": False,

            "error":
                "Prediction failed.",

            "details":
                str(e)

        }), 500


# ============================================================
# MODEL INFO API
# ============================================================

@app.route(
    "/api/model-info",
    methods=["GET"]
)
def model_info():

    return jsonify({

        "success": True,

        "model":
            "XGBoost",

        "target":
            "medicine_cost_next_month",

        "r2":
            MODEL_R2,

        "mape":
            MODEL_MAPE,

        "approx_accuracy":
            MODEL_ACCURACY,

        "training_records":
            40000,

        "testing_records":
            10000,

        "features":
            len(training_features)
    })


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    print("\n" + "=" * 80)

    print(
        "MEDICINE PREDICTION API STARTING"
    )

    print(
        "URL: http://127.0.0.1:5001"
    )

    print(
        "Prediction API:"
    )

    print(
        "POST http://127.0.0.1:5001/api/predict-medicine"
    )

    print("=" * 80)

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )