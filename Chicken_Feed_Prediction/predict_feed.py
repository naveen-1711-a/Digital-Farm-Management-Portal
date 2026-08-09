import os
import warnings
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

warnings.filterwarnings("ignore")


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "models/feed_xgboost.pkl"
ENCODER_PATH = "encoders/feed_encoders.pkl"

OUTPUT_PATH = "models/latest_feed_prediction.csv"

TARGET = "feed_cost_next_month"

print("=" * 100)
print("CHICKEN FARM - NEXT MONTH FEED COST PREDICTION")
print("=" * 100)

print("""
CURRENT FARM INFORMATION
          ↓
INPUT VALIDATION
          ↓
FEATURE ENGINEERING
          ↓
TRAINED XGBOOST MODEL
          ↓
NEXT MONTH FEED COST
""")


# ============================================================
# CHECK FILES
# ============================================================

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model not found: {MODEL_PATH}\n"
        "Run train_feed.py first."
    )

if not os.path.exists(ENCODER_PATH):
    raise FileNotFoundError(
        f"Encoder metadata not found: {ENCODER_PATH}\n"
        "Run train_feed.py first."
    )


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading trained model...")

model = joblib.load(MODEL_PATH)
metadata = joblib.load(ENCODER_PATH)

print("✅ XGBoost model loaded")
print("✅ Encoder metadata loaded")


# ============================================================
# READ METADATA
# ============================================================

if isinstance(metadata, dict):

    encoders = metadata.get("encoders", {})
    expected_features = metadata.get("features", [])

else:

    encoders = {}
    expected_features = []


print(f"\nPrediction target: {TARGET}")
print(f"Expected features: {len(expected_features)}")


# ============================================================
# INPUT FUNCTIONS
# ============================================================

def get_string(prompt, default=None):

    while True:

        value = input(prompt).strip()

        if value:
            return value

        if default is not None:
            return default

        print("❌ Value cannot be empty.")


def get_float(prompt, minimum=None, maximum=None):

    while True:

        try:

            value = float(input(prompt).strip())

            if minimum is not None and value < minimum:

                print(
                    f"❌ Value must be >= {minimum}"
                )

                continue

            if maximum is not None and value > maximum:

                print(
                    f"❌ Value must be <= {maximum}"
                )

                continue

            return value

        except ValueError:

            print("❌ Enter a valid number.")


def get_int(prompt, minimum=None, maximum=None):

    while True:

        try:

            value = int(input(prompt).strip())

            if minimum is not None and value < minimum:

                print(
                    f"❌ Value must be >= {minimum}"
                )

                continue

            if maximum is not None and value > maximum:

                print(
                    f"❌ Value must be <= {maximum}"
                )

                continue

            return value

        except ValueError:

            print("❌ Enter a valid whole number.")


# ============================================================
# INPUT
# ============================================================

print("\n" + "=" * 100)
print("ENTER CURRENT FARM INFORMATION")
print("=" * 100)


# ============================================================
# CHICKEN INFORMATION
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
    minimum=1
)

age_days = get_int(
    "Age in days: ",
    minimum=1
)

average_weight_kg = get_float(
    "Average weight (kg): ",
    minimum=0.01
)

target_weight_kg = get_float(
    "Target weight (kg): ",
    minimum=0.01
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
# FEED
# ============================================================

print("\n--- FEED INFORMATION ---")

feed_type = get_string(
    "Feed type: "
)

daily_feed_consumption_kg = get_float(
    "Daily feed consumption (kg): ",
    minimum=0
)

total_feed_consumption_kg = get_float(
    "Total feed consumption (kg): ",
    minimum=0
)

feed_price_per_kg = get_float(
    "Feed price per kg (₹): ",
    minimum=0.01
)

feed_cost_input = get_float(
    "Current feed cost (₹) [enter 0 to calculate]: ",
    minimum=0
)

feed_conversion_ratio = get_float(
    "Feed conversion ratio: ",
    minimum=0.01
)

feed_wastage_kg = get_float(
    "Feed wastage (kg): ",
    minimum=0
)

feed_wastage_rate = get_float(
    "Feed wastage rate (%): ",
    minimum=0
)

previous_month_feed_cost = get_float(
    "Previous month feed cost (₹): ",
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

biosecurity_score = get_float(
    "Biosecurity score (0-100): ",
    minimum=0,
    maximum=100
)


# ============================================================
# DATE
# ============================================================

print("\n--- DATE INFORMATION ---")

date_input = input(
    "Current date (YYYY-MM-DD) [press Enter for today]: "
).strip()


if date_input == "":

    prediction_date = datetime.today()

else:

    try:

        prediction_date = pd.to_datetime(
            date_input
        )

    except Exception:

        print(
            "❌ Invalid date. Using today's date."
        )

        prediction_date = datetime.today()


# ============================================================
# INPUT VALIDATION
# ============================================================

print("\n" + "=" * 100)
print("INPUT VALIDATION")
print("=" * 100)


# ------------------------------------------------------------
# CHICKEN COUNT
# ------------------------------------------------------------

if current_chicken_count > initial_chicken_count:

    print(
        "⚠️ Current chicken count is greater than initial count."
    )

    print(
        "Using current value as entered."
    )


# ------------------------------------------------------------
# MORTALITY CHECK
# ------------------------------------------------------------

expected_current_count = (
    initial_chicken_count - mortality_count
)

if abs(
    current_chicken_count - expected_current_count
) > initial_chicken_count * 0.10:

    print(
        "⚠️ Mortality count and current chicken count "
        "are not perfectly consistent."
    )


# ============================================================
# CALCULATE CURRENT FEED COST
# ============================================================

calculated_daily_cost = (
    daily_feed_consumption_kg *
    feed_price_per_kg
)

calculated_monthly_cost = (
    calculated_daily_cost *
    30
)


print("\nFeed cost consistency check:")

print(
    f"Daily consumption     : "
    f"{daily_feed_consumption_kg:,.2f} kg"
)

print(
    f"Feed price            : "
    f"₹{feed_price_per_kg:,.2f}/kg"
)

print(
    f"Calculated daily cost  : "
    f"₹{calculated_daily_cost:,.2f}"
)

print(
    f"Calculated monthly cost: "
    f"₹{calculated_monthly_cost:,.2f}"
)


# ============================================================
# HANDLE CURRENT FEED COST
# ============================================================

if feed_cost_input == 0:

    feed_cost = calculated_monthly_cost

    print(
        "\n✅ Current feed cost automatically calculated."
    )

else:

    difference = abs(
        feed_cost_input -
        calculated_monthly_cost
    )

    percentage_difference = (
        difference /
        max(calculated_monthly_cost, 1)
    ) * 100


    if percentage_difference > 20:

        print("\n⚠️ WARNING")
        print(
            "Entered current feed cost differs "
            "significantly from consumption × price."
        )

        print(
            f"Entered cost     : ₹{feed_cost_input:,.2f}"
        )

        print(
            f"Calculated cost  : ₹{calculated_monthly_cost:,.2f}"
        )

        print(
            f"Difference       : {percentage_difference:.2f}%"
        )

        print(
            "\nUsing calculated feed cost because "
            "it is physically consistent with the "
            "feed consumption and price."
        )

        feed_cost = calculated_monthly_cost

    else:

        feed_cost = feed_cost_input

        print(
            "\n✅ Current feed cost is consistent."
        )


# ============================================================
# CREATE DATAFRAME
# ============================================================

print("\n" + "=" * 100)
print("FEATURE ENGINEERING")
print("=" * 100)


data = {

    "chicken_type":
        chicken_type,

    "breed":
        breed,

    "initial_chicken_count":
        initial_chicken_count,

    "current_chicken_count":
        current_chicken_count,

    "age_days":
        age_days,

    "average_weight_kg":
        average_weight_kg,

    "target_weight_kg":
        target_weight_kg,

    "growth_rate_g_per_day":
        growth_rate_g_per_day,

    "mortality_count":
        mortality_count,

    "mortality_rate":
        mortality_count /
        max(initial_chicken_count, 1),

    "disease_cases":
        disease_cases,

    "disease_type":
        disease_type,

    "disease_severity":
        disease_severity,

    "feed_type":
        feed_type,

    "daily_feed_consumption_kg":
        daily_feed_consumption_kg,

    "total_feed_consumption_kg":
        total_feed_consumption_kg,

    "feed_price_per_kg":
        feed_price_per_kg,

    "feed_cost":
        feed_cost,

    "feed_conversion_ratio":
        feed_conversion_ratio,

    "feed_wastage_kg":
        feed_wastage_kg,

    "feed_wastage_rate":
        feed_wastage_rate,

    "temperature_c":
        temperature_c,

    "humidity_percent":
        humidity_percent,

    "ammonia_ppm":
        ammonia_ppm,

    "biosecurity_score":
        biosecurity_score,

    "previous_month_feed_cost":
        previous_month_feed_cost
}


df = pd.DataFrame(
    [data]
)


# ============================================================
# BASIC DERIVED FEATURES
# ============================================================

df["survival_ratio"] = (

    df["current_chicken_count"] /
    df["initial_chicken_count"].replace(
        0,
        np.nan
    )

)

df["survival_ratio"] = df[
    "survival_ratio"
].fillna(0)


df["birds_lost"] = (

    df["initial_chicken_count"] -
    df["current_chicken_count"]

)


df["feed_cost_per_chicken"] = (

    df["feed_cost"] /
    df["current_chicken_count"].replace(
        0,
        np.nan
    )

)

df["feed_cost_per_chicken"] = df[
    "feed_cost_per_chicken"
].fillna(0)


df["daily_feed_cost"] = (

    df["daily_feed_consumption_kg"] *
    df["feed_price_per_kg"]

)


df["daily_feed_cost_per_chicken"] = (

    df["daily_feed_cost"] /
    df["current_chicken_count"].replace(
        0,
        np.nan
    )

)

df["daily_feed_cost_per_chicken"] = df[
    "daily_feed_cost_per_chicken"
].fillna(0)


df["daily_feed_per_chicken"] = (

    df["daily_feed_consumption_kg"] /
    df["current_chicken_count"].replace(
        0,
        np.nan
    )

)

df["daily_feed_per_chicken"] = df[
    "daily_feed_per_chicken"
].fillna(0)


df["daily_feed_consumption_cost"] = (

    df["daily_feed_consumption_kg"] *
    df["feed_price_per_kg"]

)


df["estimated_monthly_feed_cost"] = (

    df["daily_feed_cost"] *
    30

)


df["estimated_monthly_feed_kg"] = (

    df["daily_feed_consumption_kg"] *
    30

)


df["feed_price_pressure"] = (

    df["feed_price_per_kg"] *
    df["daily_feed_consumption_kg"]

)


df["feed_wastage_cost"] = (

    df["feed_wastage_kg"] *
    df["feed_price_per_kg"]

)


df["calculated_wastage_rate"] = (

    df["feed_wastage_kg"] /
    df["daily_feed_consumption_kg"].replace(
        0,
        np.nan
    )

)

df["calculated_wastage_rate"] = df[
    "calculated_wastage_rate"
].fillna(0)


df["feed_cost_change"] = (

    df["feed_cost"] -
    df["previous_month_feed_cost"]

)


df["feed_cost_change_percent"] = (

    df["feed_cost_change"] /
    df["previous_month_feed_cost"].replace(
        0,
        np.nan
    )

) * 100

df["feed_cost_change_percent"] = df[
    "feed_cost_change_percent"
].fillna(0)


df["weight_gap_kg"] = (

    df["target_weight_kg"] -
    df["average_weight_kg"]

)


df["weight_progress_ratio"] = (

    df["average_weight_kg"] /
    df["target_weight_kg"].replace(
        0,
        np.nan
    )

)

df["weight_progress_ratio"] = df[
    "weight_progress_ratio"
].fillna(0)


df["disease_rate"] = (

    df["disease_cases"] /
    df["current_chicken_count"].replace(
        0,
        np.nan
    )

)

df["disease_rate"] = df[
    "disease_rate"
].fillna(0)


df["mortality_per_current_bird"] = (

    df["mortality_count"] /
    df["current_chicken_count"].replace(
        0,
        np.nan
    )

)

df["mortality_per_current_bird"] = df[
    "mortality_per_current_bird"
].fillna(0)


df["age_months"] = (

    df["age_days"] / 30

)


df["age_squared"] = (

    df["age_days"] ** 2

)


df["estimated_growth_total_g"] = (

    df["growth_rate_g_per_day"] *
    df["age_days"]

)


# ============================================================
# DATE FEATURES
# ============================================================

df["date_year"] = prediction_date.year

df["date_month"] = prediction_date.month

df["date_day"] = prediction_date.day

df["date_dayofweek"] = prediction_date.dayofweek

df["date_quarter"] = (
    (prediction_date.month - 1) // 3 + 1
)

df["date_weekofyear"] = (
    prediction_date.isocalendar().week
)

df["date_dayofyear"] = (
    prediction_date.dayofyear
)


# Cyclic date features

df["month_sin"] = np.sin(
    2 * np.pi *
    prediction_date.month / 12
)

df["month_cos"] = np.cos(
    2 * np.pi *
    prediction_date.month / 12
)

df["dayofweek_sin"] = np.sin(
    2 * np.pi *
    prediction_date.dayofweek / 7
)

df["dayofweek_cos"] = np.cos(
    2 * np.pi *
    prediction_date.dayofweek / 7
)


# ============================================================
# ONE-HOT ENCODING
# ============================================================

categorical_columns = [

    "chicken_type",
    "breed",
    "disease_type",
    "disease_severity",
    "feed_type"

]


print("\nEncoding categorical features...")


# ------------------------------------------------------------
# USE SAME CATEGORY ENCODING STRUCTURE
# ------------------------------------------------------------

for column in categorical_columns:

    if column not in df.columns:
        continue

    value = str(
        df.loc[0, column]
    )


    # If training used LabelEncoder
    if column in encoders:

        encoder = encoders[column]

        if value in encoder.classes_:

            df[column] = encoder.transform(
                [value]
            )

        else:

            print(
                f"⚠️ Unknown {column}: {value}"
            )

            print(
                "Using first known training category."
            )

            df[column] = encoder.transform(
                [encoder.classes_[0]]
            )


# ============================================================
# IMPORTANT:
# Some versions of train_feed.py used one-hot encoding.
# Detect that from expected feature names.
# ============================================================

feature_names = list(
    expected_features
)


if any(
    f.startswith("chicken_type_")
    for f in feature_names
):

    print(
        "Detected one-hot encoded training features."
    )

    # Rebuild original categorical values
    original_values = {

        "chicken_type":
            chicken_type,

        "breed":
            breed,

        "disease_type":
            disease_type,

        "disease_severity":
            disease_severity,

        "feed_type":
            feed_type

    }


    # Remove encoded numeric columns
    for column in categorical_columns:

        if column in df.columns:

            df = df.drop(
                columns=[column]
            )


    # Create one-hot columns
    for column in categorical_columns:

        prefix = column + "_"

        possible_features = [

            f for f in feature_names

            if f.startswith(prefix)

        ]

        current_value = original_values[column]


        for feature in possible_features:

            category = feature[
                len(prefix):
            ]

            df[feature] = int(
                current_value == category
            )


# ============================================================
# MATCH TRAINING FEATURES
# ============================================================

print(
    "\nMatching training feature structure..."
)


for feature in feature_names:

    if feature not in df.columns:

        df[feature] = 0


extra_columns = [

    column

    for column in df.columns

    if column not in feature_names

]


if extra_columns:

    df = df.drop(
        columns=extra_columns
    )


df = df[
    feature_names
]


# ============================================================
# NUMERIC CLEANING
# ============================================================

for column in df.columns:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


df = df.replace(
    [np.inf, -np.inf],
    np.nan
)


df = df.fillna(0)


# ============================================================
# FINAL SHAPE
# ============================================================

print(
    f"\nFinal input shape: {df.shape}"
)

print(
    f"Expected feature count: "
    f"{len(feature_names)}"
)

print(
    f"Actual feature count: "
    f"{df.shape[1]}"
)


if df.shape[1] != len(feature_names):

    raise ValueError(
        "❌ Feature count mismatch."
    )


# ============================================================
# PREDICTION
# ============================================================

print("\n" + "=" * 100)
print("GENERATING PREDICTION")
print("=" * 100)

print(
    "\nRunning XGBoost..."
)


prediction = model.predict(
    df
)


prediction = float(
    prediction[0]
)


# ============================================================
# LOG TRANSFORMATION DETECTION
# ============================================================

# Your latest training model uses log1p(target).
# Therefore convert prediction back to ₹.

prediction = np.expm1(
    prediction
)


prediction = max(
    prediction,
    0
)


# ============================================================
# EXPECTED RANGE
# ============================================================

# Approximate uncertainty based on your observed
# test MAPE around 3-4%.

lower_prediction = (
    prediction * 0.96
)

upper_prediction = (
    prediction * 1.04
)


# ============================================================
# CHANGE CALCULATIONS
# ============================================================

change_current = (

    prediction -
    feed_cost

)


if feed_cost > 0:

    change_current_percent = (

        change_current /
        feed_cost

    ) * 100

else:

    change_current_percent = 0


change_previous = (

    prediction -
    previous_month_feed_cost

)


if previous_month_feed_cost > 0:

    change_previous_percent = (

        change_previous /
        previous_month_feed_cost

    ) * 100

else:

    change_previous_percent = 0


# ============================================================
# RESULT
# ============================================================

print("\n" + "=" * 100)
print("PREDICTION RESULT")
print("=" * 100)


print(
    f"\nCurrent Feed Cost       : "
    f"₹{feed_cost:,.2f}"
)

print(
    f"Previous Month Cost     : "
    f"₹{previous_month_feed_cost:,.2f}"
)

print(
    f"Predicted Next Month    : "
    f"₹{prediction:,.2f}"
)

print(
    f"Expected Approx. Range : "
    f"₹{lower_prediction:,.2f} - "
    f"₹{upper_prediction:,.2f}"
)


print(
    f"\nChange from current    : "
    f"₹{change_current:,.2f}"
)

print(
    f"Percentage change      : "
    f"{change_current_percent:.2f}%"
)


print(
    f"\nChange from previous   : "
    f"₹{change_previous:,.2f}"
)

print(
    f"Percentage change      : "
    f"{change_previous_percent:.2f}%"
)


# ============================================================
# INTERPRETATION
# ============================================================

print("\n" + "=" * 100)
print("PREDICTION INTERPRETATION")
print("=" * 100)


if change_current_percent > 15:

    print(
        "🔴 EXPECTED SIGNIFICANT INCREASE"
    )

elif change_current_percent > 5:

    print(
        "🟠 EXPECTED MODERATE INCREASE"
    )

elif change_current_percent < -15:

    print(
        "🟢 EXPECTED SIGNIFICANT DECREASE"
    )

elif change_current_percent < -5:

    print(
        "🟡 EXPECTED MODERATE DECREASE"
    )

else:

    print(
        "🔵 EXPECTED RELATIVELY STABLE COST"
    )


# ============================================================
# IMPORTANT INPUT FACTORS
# ============================================================

print("\n" + "=" * 100)
print("IMPORTANT INPUT FACTORS")
print("=" * 100)


print(
    f"Current chicken count       : "
    f"{current_chicken_count:,}"
)

print(
    f"Daily feed consumption      : "
    f"{daily_feed_consumption_kg:,.2f} kg"
)

print(
    f"Feed price                  : "
    f"₹{feed_price_per_kg:,.2f}/kg"
)

print(
    f"Current feed cost           : "
    f"₹{feed_cost:,.2f}"
)

print(
    f"Previous month feed cost    : "
    f"₹{previous_month_feed_cost:,.2f}"
)

print(
    f"Feed wastage                : "
    f"{feed_wastage_kg:,.2f} kg"
)

print(
    f"Disease cases               : "
    f"{disease_cases}"
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
    f"Biosecurity score           : "
    f"{biosecurity_score:.2f}"
)


# ============================================================
# SAVE PREDICTION
# ============================================================

result = {

    "prediction_date":
        prediction_date.strftime(
            "%Y-%m-%d"
        ),

    "chicken_type":
        chicken_type,

    "breed":
        breed,

    "current_chicken_count":
        current_chicken_count,

    "age_days":
        age_days,

    "daily_feed_consumption_kg":
        daily_feed_consumption_kg,

    "feed_price_per_kg":
        feed_price_per_kg,

    "current_feed_cost":
        feed_cost,

    "previous_month_feed_cost":
        previous_month_feed_cost,

    "predicted_next_month_feed_cost":
        prediction,

    "lower_estimate":
        lower_prediction,

    "upper_estimate":
        upper_prediction,

    "change_from_current":
        change_current,

    "change_percent":
        change_current_percent,

    "test_model_note":
        "Prediction generated using trained XGBoost model."

}


result_df = pd.DataFrame(
    [result]
)


result_df.to_csv(
    OUTPUT_PATH,
    index=False
)


print(
    f"\n✅ Prediction saved: {OUTPUT_PATH}"
)


# ============================================================
# WARNING
# ============================================================

print("\n" + "=" * 100)
print("IMPORTANT")
print("=" * 100)

print("""
This prediction is an ML estimate based on the current
farm information provided.

The prediction is NOT a guaranteed future cost.

Actual next-month feed cost can change because of:

- Feed market price changes
- Feed availability
- Flock size changes
- Mortality
- Disease outbreaks
- Feed consumption changes
- Feed wastage
- Weather conditions
- Management decisions

For production use, retrain the model periodically using
real historical farm records.
""")


print("=" * 100)
print("✅ FEED COST PREDICTION COMPLETED")
print("=" * 100)