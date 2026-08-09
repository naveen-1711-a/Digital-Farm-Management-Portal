import os
import json
import warnings
import numpy as np
import pandas as pd
import joblib

warnings.filterwarnings("ignore")

# ============================================================
# DIGITAL FARM MANAGEMENT PORTAL
# NEXT MONTH MEDICINE COST PREDICTION
#
# MODEL:
# XGBoost
#
# PREPROCESSING:
# Saved sklearn preprocessor
#
# TARGET:
# medicine_cost_next_month
#
# TARGET TRANSFORMATION:
# log1p during training
# expm1 during prediction
# ============================================================


# ============================================================
# PATHS
# ============================================================

MODEL_PATH = "models/medicine_cost_xgboost.pkl"
PREPROCESSOR_PATH = "models/medicine_preprocessor.pkl"
FEATURE_INFO_PATH = "models/medicine_feature_info.json"

OUTPUT_PATH = "models/latest_medicine_prediction.csv"

WIDTH = 100


# ============================================================
# DISPLAY HELPERS
# ============================================================

def line():
    print("=" * WIDTH)


def money(value):
    return f"₹{value:,.2f}"


def percentage(value):
    return f"{value:.2f}%"


def safe_divide(a, b):
    if b is None or b == 0:
        return 0.0

    return a / b


# ============================================================
# HEADER
# ============================================================

line()
print("DIGITAL FARM - NEXT MONTH MEDICINE COST PREDICTION")
line()

print("""
CURRENT FARM DATA
        ↓
DISEASE TREND
        ↓
ENVIRONMENTAL CONDITIONS
        ↓
PREVIOUS MEDICINE USAGE
        ↓
MEDICINE PRICE / USAGE
        ↓
CURRENT MEDICINE EXPENDITURE
        ↓
FEATURE ENGINEERING
        ↓
SAVED PREPROCESSOR
        ↓
XGBOOST MODEL
        ↓
LOG1P → EXPM1
        ↓
NEXT-MONTH MEDICINE COST
""")

# ============================================================
# CHECK FILES
# ============================================================

print("Checking trained model files...")

required_files = [
    MODEL_PATH,
    PREPROCESSOR_PATH,
    FEATURE_INFO_PATH
]

for file_path in required_files:

    if not os.path.exists(file_path):

        raise FileNotFoundError(
            f"""
❌ Required file not found:

{file_path}

Please run:

python train_medicine.py

first.
"""
        )

print("✅ All model files found.")


# ============================================================
# LOAD MODEL USING JOBLIB
# ============================================================

print("\nLoading trained XGBoost model...")

try:

    model = joblib.load(
        MODEL_PATH
    )

except Exception as e:

    print("\n❌ Could not load XGBoost model.")
    print("Reason:", e)

    raise

print("✅ XGBoost model loaded.")


# ============================================================
# LOAD PREPROCESSOR USING JOBLIB
# ============================================================

print("Loading trained preprocessor...")

try:

    preprocessor = joblib.load(
        PREPROCESSOR_PATH
    )

except Exception as e:

    print("\n❌ Could not load preprocessor.")
    print("Reason:", e)

    print("""
Possible reason:

The preprocessor was saved using joblib.
This prediction script now correctly uses:

joblib.load()

instead of:

pickle.load()
""")

    raise

print("✅ Preprocessor loaded.")


# ============================================================
# LOAD FEATURE INFORMATION
# ============================================================

print("Loading feature information...")

try:

    with open(
        FEATURE_INFO_PATH,
        "r",
        encoding="utf-8"
    ) as f:

        feature_info = json.load(f)

except Exception as e:

    print("\n❌ Could not load feature information.")
    print("Reason:", e)

    raise

print("✅ Feature information loaded.")


# ============================================================
# TRAINING FEATURES
# ============================================================

training_features = None


def find_feature_list(metadata):

    if not isinstance(
        metadata,
        dict
    ):
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

        value = metadata.get(
            key
        )

        if isinstance(
            value,
            list
        ):

            return value

    return None


training_features = find_feature_list(
    feature_info
)


# ============================================================
# GET FEATURES FROM PREPROCESSOR
# ============================================================

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


# ============================================================
# FALLBACK: USE MODEL FEATURE COUNT
# ============================================================

if training_features is None:

    print(
        "\n⚠️ Raw feature names were not found "
        "in feature_info."
    )

    print(
        "Using expected training schema from "
        "your 61-feature training configuration."
    )

    training_features = [

        "chicken_type",
        "breed",
        "farm_area_acres",
        "initial_chicken_count",
        "current_chicken_count",
        "age_days",
        "age_months",
        "average_weight_kg",
        "target_weight_kg",
        "growth_rate_g_per_day",
        "weight_gap_kg",
        "weight_progress_ratio",
        "mortality_count",
        "mortality_rate",
        "survival_ratio",
        "birds_lost",
        "mortality_per_current_bird",
        "birds_per_acre",
        "disease_cases",
        "disease_type",
        "disease_severity",
        "disease_rate",
        "vaccination_count",
        "vaccination_cost",
        "medicine_type",
        "medicine_quantity",
        "medicine_price",
        "medicine_base_cost",
        "medicine_cost",
        "medicine_cost_per_bird",
        "medicine_quantity_per_bird",
        "medicine_price_pressure",
        "medicine_cost_change",
        "medicine_cost_change_percent",
        "vet_visit_count",
        "vet_cost",
        "temperature_c",
        "humidity_percent",
        "ammonia_ppm",
        "water_consumption_liters",
        "biosecurity_score",
        "environment_risk_score",
        "electricity_cost",
        "labour_cost",
        "daily_feed_consumption_kg",
        "feed_price_per_kg",
        "feed_cost",
        "previous_month_medicine_cost",
        "season",
        "total_operating_cost",
        "date_year",
        "date_month",
        "date_day",
        "date_day_of_year",
        "date_weekofyear",
        "date_quarter",
        "date_is_weekend",
        "date_month_sin",
        "date_month_cos",
        "date_dayofyear_sin",
        "date_dayofyear_cos"
    ]


# ============================================================
# DISPLAY TRAINING FEATURES
# ============================================================

print(
    f"\nExpected raw training features: "
    f"{len(training_features)}"
)

print("\nTraining feature structure:")

for i, feature in enumerate(
    training_features,
    start=1
):

    print(
        f"{i:02d}. {feature}"
    )


# ============================================================
# INPUT HELPERS
# ============================================================

def get_string(prompt):

    while True:

        value = input(
            prompt
        ).strip()

        if value:

            return value

        print(
            "❌ Please enter a value."
        )


def get_float(
    prompt,
    minimum=None,
    maximum=None
):

    while True:

        try:

            value = float(
                input(prompt).strip()
            )

            if minimum is not None:

                if value < minimum:

                    print(
                        f"❌ Value must be >= "
                        f"{minimum}"
                    )

                    continue

            if maximum is not None:

                if value > maximum:

                    print(
                        f"❌ Value must be <= "
                        f"{maximum}"
                    )

                    continue

            return value

        except ValueError:

            print(
                "❌ Please enter a valid number."
            )


def get_int(
    prompt,
    minimum=None,
    maximum=None
):

    while True:

        try:

            value = int(
                input(prompt).strip()
            )

            if minimum is not None:

                if value < minimum:

                    print(
                        f"❌ Value must be >= "
                        f"{minimum}"
                    )

                    continue

            if maximum is not None:

                if value > maximum:

                    print(
                        f"❌ Value must be <= "
                        f"{maximum}"
                    )

                    continue

            return value

        except ValueError:

            print(
                "❌ Please enter a valid integer."
            )


# ============================================================
# INPUT FARM DATA
# ============================================================

line()
print("ENTER CURRENT FARM INFORMATION")
line()


# ============================================================
# FARM
# ============================================================

print("\n--- FARM INFORMATION ---")

farm_area_acres = get_float(
    "Farm area (acres): ",
    minimum=0.01
)


# ============================================================
# CHICKEN
# ============================================================

print("\n--- CHICKEN INFORMATION ---")

chicken_type = get_string(
    "Chicken type (Broiler/Layer): "
)

breed = get_string(
    "Breed: "
)

initial_chicken_count = get_int(
    "Initial chicken count: ",
    minimum=1
)

current_chicken_count = get_int(
    "Current chicken count: ",
    minimum=0
)

age_days = get_int(
    "Age in days: ",
    minimum=0
)

average_weight_kg = get_float(
    "Average weight (kg): ",
    minimum=0
)

target_weight_kg = get_float(
    "Target weight (kg): ",
    minimum=0
)

growth_rate_g_per_day = get_float(
    "Growth rate (g/day): ",
    minimum=0
)


# ============================================================
# MORTALITY
# ============================================================

print("\n--- MORTALITY INFORMATION ---")

mortality_count = get_int(
    "Mortality count: ",
    minimum=0
)


# ============================================================
# DISEASE
# ============================================================

print("\n--- DISEASE INFORMATION ---")

disease_cases = get_int(
    "Disease cases: ",
    minimum=0
)

disease_type = get_string(
    "Disease type: "
)

disease_severity = get_string(
    "Disease severity: "
)


# ============================================================
# VACCINATION
# ============================================================

print("\n--- VACCINATION INFORMATION ---")

vaccination_count = get_int(
    "Vaccination count: ",
    minimum=0
)

vaccination_cost = get_float(
    "Vaccination cost (₹): ",
    minimum=0
)


# ============================================================
# MEDICINE
# ============================================================

print("\n--- MEDICINE INFORMATION ---")

medicine_type = get_string(
    "Medicine type: "
)

medicine_quantity = get_float(
    "Medicine quantity: ",
    minimum=0
)

medicine_price = get_float(
    "Medicine price (₹): ",
    minimum=0
)

medicine_cost_input = get_float(
    "Current medicine cost (₹) [0 = calculate]: ",
    minimum=0
)


# ============================================================
# VETERINARY
# ============================================================

print("\n--- VETERINARY INFORMATION ---")

vet_visit_count = get_int(
    "Veterinary visit count: ",
    minimum=0
)

vet_cost = get_float(
    "Veterinary cost (₹): ",
    minimum=0
)


# ============================================================
# ENVIRONMENT
# ============================================================

print("\n--- ENVIRONMENT INFORMATION ---")

temperature_c = get_float(
    "Temperature (°C): "
)

humidity_percent = get_float(
    "Humidity (%): ",
    minimum=0,
    maximum=100
)

ammonia_ppm = get_float(
    "Ammonia (ppm): ",
    minimum=0
)

water_consumption_liters = get_float(
    "Water consumption (liters): ",
    minimum=0
)


# ============================================================
# OPERATING COST
# ============================================================

print("\n--- FARM OPERATING COST ---")

electricity_cost = get_float(
    "Electricity cost (₹): ",
    minimum=0
)

labour_cost = get_float(
    "Labour cost (₹): ",
    minimum=0
)

biosecurity_score = get_float(
    "Biosecurity score (0-100): ",
    minimum=0,
    maximum=100
)


# ============================================================
# FEED
# ============================================================

print("\n--- FEED INFORMATION ---")

daily_feed_consumption_kg = get_float(
    "Daily feed consumption (kg): ",
    minimum=0
)

feed_price_per_kg = get_float(
    "Feed price per kg (₹): ",
    minimum=0
)

feed_cost = get_float(
    "Current feed cost (₹): ",
    minimum=0
)

previous_month_medicine_cost = get_float(
    "Previous month medicine cost (₹): ",
    minimum=0
)


# ============================================================
# DATE
# ============================================================

print("\n--- DATE INFORMATION ---")

date_input = input(
    "Current date (YYYY-MM-DD) [Enter = today]: "
).strip()


if date_input == "":

    current_date = pd.Timestamp.today()

else:

    try:

        current_date = pd.to_datetime(
            date_input
        )

    except Exception:

        raise ValueError(
            "❌ Invalid date. "
            "Use YYYY-MM-DD."
        )


# ============================================================
# INPUT VALIDATION
# ============================================================

line()
print("INPUT VALIDATION")
line()


if current_chicken_count > initial_chicken_count:

    print(
        "⚠️ WARNING: Current chicken count "
        "is greater than initial count."
    )


if mortality_count > initial_chicken_count:

    print(
        "⚠️ WARNING: Mortality count "
        "is greater than initial count."
    )


if disease_cases > current_chicken_count:

    print(
        "⚠️ WARNING: Disease cases "
        "exceed current chicken count."
    )


# ============================================================
# CURRENT MEDICINE COST
# ============================================================

calculated_medicine_cost = (
    medicine_quantity *
    medicine_price
)

print("\nMedicine cost consistency check:")

print(
    f"Medicine quantity      : "
    f"{medicine_quantity:,.2f}"
)

print(
    f"Medicine price          : "
    f"{money(medicine_price)}"
)

print(
    f"Calculated medicine cost: "
    f"{money(calculated_medicine_cost)}"
)


if medicine_cost_input == 0:

    medicine_cost = (
        calculated_medicine_cost
    )

    print(
        "\n✅ Current medicine cost "
        "calculated automatically."
    )

else:

    medicine_cost = medicine_cost_input

    print(
        f"\nEntered medicine cost: "
        f"{money(medicine_cost)}"
    )


# ============================================================
# FEATURE ENGINEERING
# ============================================================

line()
print("FEATURE ENGINEERING")
line()


# ============================================================
# BASIC FEATURES
# ============================================================

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


# ============================================================
# MEDICINE FEATURES
# ============================================================

medicine_base_cost = (
    medicine_quantity *
    medicine_price
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


# ============================================================
# VETERINARY FEATURES
# ============================================================

vet_cost_per_visit = safe_divide(
    vet_cost,
    vet_visit_count
)

vet_cost_per_bird = safe_divide(
    vet_cost,
    current_chicken_count
)


# ============================================================
# VACCINATION FEATURES
# ============================================================

vaccination_cost_per_bird = safe_divide(
    vaccination_cost,
    current_chicken_count
)

vaccination_cost_per_event = safe_divide(
    vaccination_cost,
    vaccination_count
)


# ============================================================
# FEED FEATURES
# ============================================================

daily_feed_per_bird = safe_divide(
    daily_feed_consumption_kg,
    current_chicken_count
)

feed_cost_per_bird = safe_divide(
    feed_cost,
    current_chicken_count
)


# ============================================================
# ESTIMATED MONTHLY FEED COST
# ============================================================

estimated_monthly_feed_cost = (
    daily_feed_consumption_kg *
    feed_price_per_kg *
    30
)


# ============================================================
# ENVIRONMENT RISK
# ============================================================

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


# ============================================================
# WEIGHT FEATURES
# ============================================================

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

age_squared = (
    age_days ** 2
)

estimated_growth_total_g = (
    growth_rate_g_per_day *
    age_days
)


# ============================================================
# TOTAL OPERATING COST
# ============================================================

total_operating_cost = (

    electricity_cost

    + labour_cost

    + vet_cost

    + vaccination_cost

    + medicine_cost

    + feed_cost
)


# ============================================================
# DATE FEATURES
# ============================================================

date_year = current_date.year

date_month = current_date.month

date_day = current_date.day

date_dayofweek = current_date.dayofweek

date_quarter = current_date.quarter

date_weekofyear = int(
    current_date.isocalendar().week
)

date_dayofyear = current_date.dayofyear


# ============================================================
# CYCLIC FEATURES
# ============================================================

date_month_sin = np.sin(
    2 * np.pi *
    date_month / 12
)

date_month_cos = np.cos(
    2 * np.pi *
    date_month / 12
)

date_dayofyear_sin = np.sin(
    2 * np.pi *
    date_dayofyear / 365.25
)

date_dayofyear_cos = np.cos(
    2 * np.pi *
    date_dayofyear / 365.25
)


# ============================================================
# SEASON
# ============================================================

if date_month in [6, 7, 8, 9]:

    season = "Monsoon"

elif date_month in [3, 4, 5]:

    season = "Summer"

else:

    season = "Winter"


# ============================================================
# CREATE EXACT RAW DATAFRAME
# ============================================================

data = {

    # ----------------------------
    # CATEGORICAL
    # ----------------------------

    "chicken_type":
        chicken_type,

    "breed":
        breed,

    # ----------------------------
    # FARM / CHICKEN
    # ----------------------------

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

    # ----------------------------
    # MORTALITY
    # ----------------------------

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

    # ----------------------------
    # DISEASE
    # ----------------------------

    "disease_cases":
        disease_cases,

    "disease_type":
        disease_type,

    "disease_severity":
        disease_severity,

    "disease_rate":
        disease_rate,

    # ----------------------------
    # VACCINATION
    # ----------------------------

    "vaccination_count":
        vaccination_count,

    "vaccination_cost":
        vaccination_cost,

    # ----------------------------
    # MEDICINE
    # ----------------------------

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

    # ----------------------------
    # VETERINARY
    # ----------------------------

    "vet_visit_count":
        vet_visit_count,

    "vet_cost":
        vet_cost,

    # ----------------------------
    # ENVIRONMENT
    # ----------------------------

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

    # ----------------------------
    # OPERATING COST
    # ----------------------------

    "electricity_cost":
        electricity_cost,

    "labour_cost":
        labour_cost,

    # ----------------------------
    # FEED
    # ----------------------------

    "daily_feed_consumption_kg":
        daily_feed_consumption_kg,

    "feed_price_per_kg":
        feed_price_per_kg,

    "feed_cost":
        feed_cost,

    # ----------------------------
    # PREVIOUS MEDICINE
    # ----------------------------

    "previous_month_medicine_cost":
        previous_month_medicine_cost,

    # ----------------------------
    # SEASON
    # ----------------------------

    "season":
        season,

    # ----------------------------
    # OPERATING TOTAL
    # ----------------------------

    "total_operating_cost":
        total_operating_cost,

    # ----------------------------
    # DATE
    # ----------------------------

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
        int(
            date_dayofweek >= 5
        ),

    "date_month_sin":
        date_month_sin,

    "date_month_cos":
        date_month_cos,

    "date_dayofyear_sin":
        date_dayofyear_sin,

    "date_dayofyear_cos":
        date_dayofyear_cos
}


input_df = pd.DataFrame(
    [data]
)


# ============================================================
# CHECK RAW FEATURES
# ============================================================

print("\nRaw feature construction completed.")

print(
    f"Raw features generated: "
    f"{len(input_df.columns)}"
)

print(
    f"Training raw features expected: "
    f"{len(training_features)}"
)


# ============================================================
# FEATURE NAME COMPATIBILITY
# ============================================================

# Handle older/newer naming versions.

if (
    "date_dayofyear"
    in training_features
    and
    "date_dayofyear"
    not in input_df.columns
):

    input_df[
        "date_dayofyear"
    ] = input_df[
        "date_day_of_year"
    ]


if (
    "date_day_of_year"
    in training_features
    and
    "date_day_of_year"
    not in input_df.columns
):

    input_df[
        "date_day_of_year"
    ] = input_df[
        "date_dayofyear"
    ]


# ============================================================
# ADD MISSING TRAINING FEATURES
# ============================================================

print(
    "\nMatching training feature structure..."
)

for feature in training_features:

    if feature not in input_df.columns:

        print(
            f"⚠️ Missing feature added as 0: "
            f"{feature}"
        )

        input_df[
            feature
        ] = 0


# ============================================================
# REMOVE EXTRA FEATURES
# ============================================================

extra_features = [

    column
    for column in input_df.columns

    if column not in training_features
]


if extra_features:

    print(
        "\nRemoving extra features:"
    )

    for feature in extra_features:

        print(
            f"   - {feature}"
        )


# ============================================================
# EXACT COLUMN ORDER
# ============================================================

input_df = input_df[
    training_features
].copy()


print(
    f"\nFinal raw input shape: "
    f"{input_df.shape}"
)


# ============================================================
# HANDLE MISSING VALUES
# ============================================================

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


# ============================================================
# PREPROCESSING
# ============================================================

line()
print("PREPROCESSING INPUT")
line()

print(
    "Applying saved training preprocessor..."
)

try:

    X_processed = (
        preprocessor.transform(
            input_df
        )
    )

except Exception as e:

    print(
        "\n❌ Preprocessing failed."
    )

    print(
        "\nReason:"
    )

    print(e)

    print(
        "\nInput columns:"
    )

    print(
        input_df.columns.tolist()
    )

    raise


# Convert sparse matrix if necessary

if hasattr(
    X_processed,
    "toarray"
):

    X_processed = (
        X_processed.toarray()
    )


X_processed = np.asarray(
    X_processed
)


print(
    f"Processed input shape: "
    f"{X_processed.shape}"
)


# ============================================================
# CHECK MODEL FEATURE COUNT
# ============================================================

try:

    expected_model_features = (
        model.get_booster()
        .num_features()
    )

except Exception:

    expected_model_features = (
        X_processed.shape[1]
    )


print(
    f"Model expected processed "
    f"features: {expected_model_features}"
)

print(
    f"Actual processed features: "
    f"{X_processed.shape[1]}"
)


if (
    X_processed.shape[1]
    != expected_model_features
):

    raise ValueError(
        f"""
❌ PROCESSED FEATURE COUNT MISMATCH

Model expects:
{expected_model_features}

Preprocessor produced:
{X_processed.shape[1]}

This means predict_medicine.py and
train_medicine.py are using different
feature structures.

Run:

python train_medicine.py

again and then:

python predict_medicine.py
"""
    )


print(
    "✅ Feature structure matches training."
)


# ============================================================
# XGBOOST PREDICTION
# ============================================================

line()
print("GENERATING XGBOOST PREDICTION")
line()

try:

    prediction_log = model.predict(
        X_processed
    )

except Exception as e:

    print(
        "\n❌ XGBoost prediction failed."
    )

    print(e)

    raise


# ============================================================
# LOG1P → ORIGINAL SCALE
# ============================================================

# TRAINING:
#
# y_train = np.log1p(y)
#
# PREDICTION:
#
# original = np.expm1(prediction)
#
# ============================================================

predicted_medicine_cost = float(
    np.expm1(
        prediction_log[0]
    )
)


# Prevent negative values

predicted_medicine_cost = max(
    predicted_medicine_cost,
    0.0
)


# ============================================================
# EXPECTED RANGE
# ============================================================

# Based on your reported test MAPE:
#
# 5.67%
#
# This is an approximate error range.
# It is NOT a statistical confidence interval.

error_rate = 0.0567

error_amount = (
    predicted_medicine_cost *
    error_rate
)

lower_bound = max(
    predicted_medicine_cost -
    error_amount,
    0
)

upper_bound = (
    predicted_medicine_cost +
    error_amount
)


# ============================================================
# COST CHANGES
# ============================================================

change_current = (
    predicted_medicine_cost -
    medicine_cost
)

change_current_percent = (
    safe_divide(
        change_current,
        medicine_cost
    )
    * 100
)


change_previous = (
    predicted_medicine_cost -
    previous_month_medicine_cost
)

change_previous_percent = (
    safe_divide(
        change_previous,
        previous_month_medicine_cost
    )
    * 100
)


# ============================================================
# TREND STATUS
# ============================================================

if change_current_percent >= 20:

    risk_status = (
        "🔴 EXPECTED SIGNIFICANT INCREASE"
    )

elif change_current_percent >= 5:

    risk_status = (
        "🟠 EXPECTED MODERATE INCREASE"
    )

elif change_current_percent <= -20:

    risk_status = (
        "🟢 EXPECTED SIGNIFICANT DECREASE"
    )

elif change_current_percent <= -5:

    risk_status = (
        "🔵 EXPECTED MODERATE DECREASE"
    )

else:

    risk_status = (
        "⚪ EXPECTED RELATIVELY STABLE COST"
    )


# ============================================================
# PREDICTION RESULT
# ============================================================

line()
print("PREDICTION RESULT")
line()

print(
    f"\nCurrent Medicine Cost       : "
    f"{money(medicine_cost)}"
)

print(
    f"Previous Month Medicine Cost: "
    f"{money(previous_month_medicine_cost)}"
)

print(
    f"Predicted Next Month        : "
    f"{money(predicted_medicine_cost)}"
)

print(
    f"Expected Approx. Range      : "
    f"{money(lower_bound)} - "
    f"{money(upper_bound)}"
)

print(
    f"\nChange from current         : "
    f"{money(change_current)}"
)

print(
    f"Percentage change           : "
    f"{percentage(change_current_percent)}"
)

print(
    f"\nChange from previous        : "
    f"{money(change_previous)}"
)

print(
    f"Percentage change           : "
    f"{percentage(change_previous_percent)}"
)


# ============================================================
# INTERPRETATION
# ============================================================

line()
print("PREDICTION INTERPRETATION")
line()

print(
    f"\n{risk_status}"
)


# ============================================================
# IMPORTANT INPUT FACTORS
# ============================================================

line()
print("IMPORTANT INPUT FACTORS")
line()

print(
    f"Current chicken count       : "
    f"{current_chicken_count:,}"
)

print(
    f"Disease cases               : "
    f"{disease_cases:,}"
)

print(
    f"Disease type                : "
    f"{disease_type}"
)

print(
    f"Disease severity            : "
    f"{disease_severity}"
)

print(
    f"Medicine type               : "
    f"{medicine_type}"
)

print(
    f"Medicine quantity           : "
    f"{medicine_quantity:,.2f}"
)

print(
    f"Medicine price              : "
    f"{money(medicine_price)}"
)

print(
    f"Current medicine cost       : "
    f"{money(medicine_cost)}"
)

print(
    f"Previous medicine cost      : "
    f"{money(previous_month_medicine_cost)}"
)

print(
    f"Vaccination count           : "
    f"{vaccination_count}"
)

print(
    f"Veterinary visits           : "
    f"{vet_visit_count}"
)

print(
    f"Temperature                 : "
    f"{temperature_c:.2f} °C"
)

print(
    f"Humidity                    : "
    f"{humidity_percent:.2f}%"
)

print(
    f"Ammonia                     : "
    f"{ammonia_ppm:.2f} ppm"
)

print(
    f"Biosecurity score           : "
    f"{biosecurity_score:.2f}"
)

print(
    f"Environment risk score      : "
    f"{environment_risk_score:.2f}"
)


# ============================================================
# MODEL INFORMATION
# ============================================================

line()
print("MODEL INFORMATION")
line()

print(
    "Model                      : XGBoost"
)

print(
    "Target                     : "
    "medicine_cost_next_month"
)

print(
    "Target transformation      : "
    "log1p → expm1"
)

print(
    "Training records           : "
    "40,000"
)

print(
    "Testing records            : "
    "10,000"
)

print(
    "Test R²                    : "
    "0.9947"
)

print(
    "Test MAPE                  : "
    "5.67%"
)

print(
    "Approx. MAPE score         : "
    "94.33%"
)

print(
    "Best XGBoost iteration     : "
    "643"
)


# ============================================================
# SAVE RESULT
# ============================================================

result = {

    "prediction_date":
        current_date.strftime(
            "%Y-%m-%d"
        ),

    "current_medicine_cost":
        medicine_cost,

    "previous_month_medicine_cost":
        previous_month_medicine_cost,

    "predicted_next_month_medicine_cost":
        predicted_medicine_cost,

    "expected_lower_range":
        lower_bound,

    "expected_upper_range":
        upper_bound,

    "change_from_current":
        change_current,

    "change_percent_from_current":
        change_current_percent,

    "change_from_previous":
        change_previous,

    "change_percent_from_previous":
        change_previous_percent,

    "disease_cases":
        disease_cases,

    "disease_type":
        disease_type,

    "disease_severity":
        disease_severity,

    "medicine_type":
        medicine_type,

    "medicine_quantity":
        medicine_quantity,

    "medicine_price":
        medicine_price,

    "biosecurity_score":
        biosecurity_score,

    "environment_risk_score":
        environment_risk_score,

    "model":
        "XGBoost",

    "target":
        "medicine_cost_next_month",

    "test_r2":
        0.9947,

    "test_mape":
        5.67,

    "approx_mape_score":
        94.33,

    "best_iteration":
        643
}


os.makedirs(
    "models",
    exist_ok=True
)


pd.DataFrame(
    [result]
).to_csv(
    OUTPUT_PATH,
    index=False
)


# ============================================================
# FINAL WARNING
# ============================================================

line()
print("IMPORTANT")
line()

print("""
This prediction is an ML estimate based on
the current farm information provided.

The prediction is NOT a guaranteed future
medicine cost.

Actual medicine cost can change because of:

- Disease outbreaks
- Disease severity
- Medicine price changes
- Medicine quantity changes
- Vaccination requirements
- Veterinary visits
- Mortality
- Flock size
- Farm management
- Temperature
- Humidity
- Ammonia
- Biosecurity
- Seasonal conditions
- Treatment decisions

For production deployment, periodically retrain
the model using real historical farm records.

Do not use this model to make veterinary treatment
decisions. Consult a qualified veterinarian.
""")


print(
    f"\n✅ Prediction saved to:"
    f"\n{OUTPUT_PATH}"
)

line()

print(
    "✅ MEDICINE COST PREDICTION COMPLETED"
)

line()