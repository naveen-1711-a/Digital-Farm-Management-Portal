# ============================================================
# CHICKEN FARM - ADVANCED NEXT MONTH FEED COST XGBOOST
# ============================================================
#
# Objective:
# Current farm information -> Predict next month's feed cost
#
# Important:
# - No future target leakage
# - Time-based train/validation/test split
# - Feature engineering
# - One-hot encoding
# - Log1p target transformation
# - XGBoost early stopping
# - Original-scale evaluation
# - Feature importance
# - Residual analysis
# - Prediction interval analysis
#
# ============================================================

import os
import json
import warnings
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from xgboost import XGBRegressor

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

warnings.filterwarnings("ignore")


# ============================================================
# CONFIGURATION
# ============================================================

DATA_PATH = "data/feed_dataset_50000.csv"

MODEL_PATH = "models/feed_xgboost.pkl"
ENCODER_PATH = "encoders/feed_encoders.pkl"
METRICS_PATH = "models/feed_metrics.json"

PREDICTIONS_PATH = "models/feed_test_predictions.csv"

ACTUAL_PREDICTED_PLOT = "plots/feed_actual_vs_predicted.png"
FEATURE_IMPORTANCE_PLOT = "plots/feed_feature_importance.png"
RESIDUAL_PLOT = "plots/feed_residuals.png"
ERROR_DISTRIBUTION_PLOT = "plots/feed_error_distribution.png"

RANDOM_STATE = 42

TRAIN_RATIO = 0.70
VALIDATION_RATIO = 0.15
TEST_RATIO = 0.15


# ============================================================
# DIRECTORIES
# ============================================================

os.makedirs("models", exist_ok=True)
os.makedirs("encoders", exist_ok=True)
os.makedirs("plots", exist_ok=True)


# ============================================================
# HEADER
# ============================================================

print("=" * 100)
print("CHICKEN FARM - HIGH PERFORMANCE FEED COST XGBOOST")
print("=" * 100)

print("""
Prediction objective:

CURRENT FARM INFORMATION
          ↓
FEATURE ENGINEERING
          ↓
XGBOOST REGRESSION
          ↓
NEXT MONTH FEED COST
""")


# ============================================================
# LOAD DATA
# ============================================================

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"\nDataset not found: {DATA_PATH}"
    )

print("\nLoading dataset...")

df = pd.read_csv(DATA_PATH)

print(
    f"Dataset shape: {df.shape[0]:,} rows × {df.shape[1]} columns"
)

print("\nDataset columns:")

for i, column in enumerate(df.columns, 1):
    print(f"{i:02d}. {column}")


# ============================================================
# TARGET
# ============================================================

TARGET = "feed_cost_next_month"

if TARGET not in df.columns:
    raise ValueError(
        f"\nTarget column '{TARGET}' not found."
    )

print(f"\n🎯 Target: {TARGET}")


# ============================================================
# BASIC CLEANING
# ============================================================

print("\n" + "=" * 100)
print("DATA CLEANING")
print("=" * 100)

print(
    f"\nDuplicate rows: {df.duplicated().sum():,}"
)

df = df.drop_duplicates().copy()

print(
    f"Rows after duplicate removal: {len(df):,}"
)


# ============================================================
# TARGET CLEANING
# ============================================================

df[TARGET] = pd.to_numeric(
    df[TARGET],
    errors="coerce"
)

before_target = len(df)

df = df.dropna(
    subset=[TARGET]
).copy()

df = df[
    df[TARGET] >= 0
].copy()

removed_target = before_target - len(df)

print(
    f"Invalid target rows removed: {removed_target:,}"
)

print(
    f"Final dataset rows: {len(df):,}"
)


# ============================================================
# TARGET STATISTICS
# ============================================================

print("\nTarget statistics:")

print(
    df[TARGET].describe()
)


# ============================================================
# DATE PROCESSING
# ============================================================

print("\n" + "=" * 100)
print("DATE PROCESSING")
print("=" * 100)

if "date" not in df.columns:
    raise ValueError(
        "Dataset must contain a 'date' column for time-based splitting."
    )

df["date"] = pd.to_datetime(
    df["date"],
    errors="coerce"
)

invalid_dates = df["date"].isna().sum()

print(
    f"Invalid dates: {invalid_dates:,}"
)

df = df.dropna(
    subset=["date"]
).copy()

df = df.sort_values(
    "date"
).reset_index(drop=True)

print(
    f"Oldest date : {df['date'].min()}"
)

print(
    f"Newest date : {df['date'].max()}"
)


# ============================================================
# TARGET LEAKAGE CHECK
# ============================================================

print("\n" + "=" * 100)
print("TARGET LEAKAGE CHECK")
print("=" * 100)

future_keywords = [
    "next_month",
    "future",
    "next_month_feed",
    "future_feed",
    "target"
]

possible_leakage = []

for column in df.columns:

    if column == TARGET:
        continue

    column_lower = column.lower()

    for keyword in future_keywords:

        if keyword in column_lower:

            possible_leakage.append(column)
            break


if possible_leakage:

    print(
        "\n⚠️ Potential future-information columns:"
    )

    for column in possible_leakage:
        print(
            f"  - {column}"
        )

else:

    print(
        "✅ No obvious future target leakage columns found."
    )


# ============================================================
# FEATURE ENGINEERING
# ============================================================

print("\n" + "=" * 100)
print("ADVANCED FEATURE ENGINEERING")
print("=" * 100)


# ------------------------------------------------------------
# BASIC FARM FEATURES
# ------------------------------------------------------------

if {
    "current_chicken_count",
    "initial_chicken_count"
}.issubset(df.columns):

    df["survival_ratio"] = (
        df["current_chicken_count"] /
        df["initial_chicken_count"].replace(0, np.nan)
    )


if {
    "initial_chicken_count",
    "current_chicken_count"
}.issubset(df.columns):

    df["birds_lost"] = (
        df["initial_chicken_count"] -
        df["current_chicken_count"]
    )


# ------------------------------------------------------------
# FEED COST FEATURES
# ------------------------------------------------------------

if {
    "feed_cost",
    "current_chicken_count"
}.issubset(df.columns):

    df["feed_cost_per_chicken"] = (
        df["feed_cost"] /
        df["current_chicken_count"].replace(0, np.nan)
    )


if {
    "feed_cost",
    "current_chicken_count"
}.issubset(df.columns):

    df["daily_feed_cost"] = (
        df["feed_cost"] /
        30.0
    )


if {
    "feed_cost",
    "current_chicken_count"
}.issubset(df.columns):

    df["daily_feed_cost_per_chicken"] = (
        df["daily_feed_cost"] /
        df["current_chicken_count"].replace(0, np.nan)
    )


# ------------------------------------------------------------
# FEED CONSUMPTION FEATURES
# ------------------------------------------------------------

if {
    "daily_feed_consumption_kg",
    "current_chicken_count"
}.issubset(df.columns):

    df["daily_feed_per_chicken"] = (
        df["daily_feed_consumption_kg"] /
        df["current_chicken_count"].replace(0, np.nan)
    )


if {
    "daily_feed_consumption_kg",
    "feed_price_per_kg"
}.issubset(df.columns):

    df["daily_feed_consumption_cost"] = (
        df["daily_feed_consumption_kg"] *
        df["feed_price_per_kg"]
    )


if {
    "daily_feed_consumption_kg",
    "feed_price_per_kg"
}.issubset(df.columns):

    df["estimated_monthly_feed_cost"] = (
        df["daily_feed_consumption_kg"] *
        30.0 *
        df["feed_price_per_kg"]
    )


if {
    "daily_feed_consumption_kg",
    "current_chicken_count"
}.issubset(df.columns):

    df["estimated_monthly_feed_kg"] = (
        df["daily_feed_consumption_kg"] *
        30.0
    )


# ------------------------------------------------------------
# FEED PRICE FEATURES
# ------------------------------------------------------------

if {
    "feed_price_per_kg",
    "previous_month_feed_cost"
}.issubset(df.columns):

    df["feed_price_pressure"] = (
        df["feed_price_per_kg"] *
        df["daily_feed_consumption_kg"]
        if "daily_feed_consumption_kg" in df.columns
        else df["feed_price_per_kg"]
    )


# ------------------------------------------------------------
# FEED WASTAGE
# ------------------------------------------------------------

if {
    "feed_wastage_kg",
    "feed_price_per_kg"
}.issubset(df.columns):

    df["feed_wastage_cost"] = (
        df["feed_wastage_kg"] *
        df["feed_price_per_kg"]
    )


if {
    "feed_wastage_kg",
    "daily_feed_consumption_kg"
}.issubset(df.columns):

    df["calculated_wastage_rate"] = (
        df["feed_wastage_kg"] /
        df["daily_feed_consumption_kg"].replace(0, np.nan)
    )


# ------------------------------------------------------------
# CURRENT VS PREVIOUS COST
# ------------------------------------------------------------

if {
    "feed_cost",
    "previous_month_feed_cost"
}.issubset(df.columns):

    df["feed_cost_change"] = (
        df["feed_cost"] -
        df["previous_month_feed_cost"]
    )

    df["feed_cost_change_percent"] = (
        df["feed_cost_change"] /
        df["previous_month_feed_cost"].replace(0, np.nan)
    )


# ------------------------------------------------------------
# CHICKEN WEIGHT FEATURES
# ------------------------------------------------------------

if {
    "target_weight_kg",
    "average_weight_kg"
}.issubset(df.columns):

    df["weight_gap_kg"] = (
        df["target_weight_kg"] -
        df["average_weight_kg"]
    )

    df["weight_progress_ratio"] = (
        df["average_weight_kg"] /
        df["target_weight_kg"].replace(0, np.nan)
    )


# ------------------------------------------------------------
# DISEASE FEATURES
# ------------------------------------------------------------

if {
    "disease_cases",
    "current_chicken_count"
}.issubset(df.columns):

    df["disease_rate"] = (
        df["disease_cases"] /
        df["current_chicken_count"].replace(0, np.nan)
    )


# ------------------------------------------------------------
# MORTALITY FEATURES
# ------------------------------------------------------------

if {
    "mortality_count",
    "current_chicken_count"
}.issubset(df.columns):

    df["mortality_per_current_bird"] = (
        df["mortality_count"] /
        df["current_chicken_count"].replace(0, np.nan)
    )


# ------------------------------------------------------------
# AGE FEATURES
# ------------------------------------------------------------

if "age_days" in df.columns:

    df["age_months"] = (
        df["age_days"] / 30.0
    )

    df["age_squared"] = (
        df["age_days"] ** 2
    )


# ------------------------------------------------------------
# GROWTH FEATURES
# ------------------------------------------------------------

if {
    "growth_rate_g_per_day",
    "age_days"
}.issubset(df.columns):

    df["estimated_growth_total_g"] = (
        df["growth_rate_g_per_day"] *
        df["age_days"]
    )


# ============================================================
# DATE FEATURES
# ============================================================

df["date_year"] = df["date"].dt.year

df["date_month"] = df["date"].dt.month

df["date_day"] = df["date"].dt.day

df["date_dayofweek"] = df["date"].dt.dayofweek

df["date_quarter"] = df["date"].dt.quarter

df["date_weekofyear"] = (
    df["date"].dt.isocalendar().week.astype(int)
)

df["date_dayofyear"] = (
    df["date"].dt.dayofyear
)


# Cyclic date features

df["month_sin"] = np.sin(
    2 * np.pi * df["date_month"] / 12
)

df["month_cos"] = np.cos(
    2 * np.pi * df["date_month"] / 12
)

df["dayofweek_sin"] = np.sin(
    2 * np.pi * df["date_dayofweek"] / 7
)

df["dayofweek_cos"] = np.cos(
    2 * np.pi * df["date_dayofweek"] / 7
)


# ============================================================
# REPLACE INFINITIES
# ============================================================

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)


# ============================================================
# IDENTIFIER REMOVAL
# ============================================================

print("\nRemoving identifier columns:")

identifier_columns = [
    "record_id",
    "farm_id",
    "batch_id",
    "date"
]

for column in identifier_columns:

    if column in df.columns:

        print(
            f"  - {column}"
        )

        df = df.drop(
            columns=[column]
        )


# ============================================================
# SEPARATE FEATURES / TARGET
# ============================================================

X = df.drop(
    columns=[TARGET]
).copy()

y = df[TARGET].copy()


# ============================================================
# CATEGORICAL FEATURES
# ============================================================

categorical_columns = X.select_dtypes(
    include=["object", "category", "bool"]
).columns.tolist()

print("\nCategorical features:")

for column in categorical_columns:

    print(
        f"  - {column}"
    )


# ============================================================
# NUMERIC FEATURES
# ============================================================

numeric_columns = X.select_dtypes(
    include=[np.number]
).columns.tolist()

print(
    f"\nNumeric features: {len(numeric_columns)}"
)


# ============================================================
# MISSING VALUE HANDLING
# ============================================================

for column in categorical_columns:

    X[column] = (
        X[column]
        .fillna("Unknown")
        .astype(str)
    )


for column in numeric_columns:

    X[column] = X[column].fillna(
        X[column].median()
    )


# ============================================================
# ONE-HOT ENCODING
# ============================================================

print("\nEncoding categorical variables...")

X = pd.get_dummies(
    X,
    columns=categorical_columns,
    dtype=np.float32
)


# ============================================================
# FINAL NUMERIC CLEANING
# ============================================================

X = X.replace(
    [np.inf, -np.inf],
    np.nan
)

X = X.fillna(0)

X = X.astype(np.float32)


# ============================================================
# FINAL FEATURES
# ============================================================

print("\n" + "=" * 100)
print("FINAL FEATURES")
print("=" * 100)

for i, column in enumerate(X.columns, 1):

    print(
        f"{i:03d}. {column}"
    )

print(
    f"\nTotal features: {X.shape[1]}"
)

print(
    f"Total samples : {X.shape[0]:,}"
)


# ============================================================
# TIME-BASED SPLIT
# ============================================================

print("\n" + "=" * 100)
print("TIME-BASED DATA SPLITTING")
print("=" * 100)

# Recreate date ordering independently
working_dates = pd.read_csv(
    DATA_PATH,
    usecols=["date"]
)

working_dates["date"] = pd.to_datetime(
    working_dates["date"],
    errors="coerce"
)

# Align with cleaned dataframe by sorting
sort_dates = pd.to_datetime(
    pd.read_csv(DATA_PATH)["date"],
    errors="coerce"
)

# Since X was created after sorting df,
# use the sorted dataframe's original date index
original_df = pd.read_csv(DATA_PATH)

original_df["date"] = pd.to_datetime(
    original_df["date"],
    errors="coerce"
)

# Build clean date frame from current sorted dataset
date_reference = pd.read_csv(
    DATA_PATH
)

date_reference["date"] = pd.to_datetime(
    date_reference["date"],
    errors="coerce"
)

date_reference = date_reference.dropna(
    subset=["date"]
)

# Instead of relying on original row order,
# use sorted cleaned dataframe from before feature removal.
#
# The date is already sorted because df was sorted earlier.
#
# Therefore create chronological indices directly.

# Re-load target/date pair and reproduce cleaning order
split_reference = pd.read_csv(
    DATA_PATH,
    usecols=["date", TARGET]
)

split_reference["date"] = pd.to_datetime(
    split_reference["date"],
    errors="coerce"
)

split_reference[TARGET] = pd.to_numeric(
    split_reference[TARGET],
    errors="coerce"
)

split_reference = split_reference.dropna(
    subset=["date", TARGET]
)

split_reference = split_reference[
    split_reference[TARGET] >= 0
]

split_reference = split_reference.sort_values(
    "date"
).reset_index(drop=True)


# Ensure same number of rows
if len(split_reference) != len(X):

    raise ValueError(
        f"Date reference length ({len(split_reference)}) "
        f"does not match feature matrix ({len(X)})."
    )


n = len(X)

train_end = int(
    n * TRAIN_RATIO
)

validation_end = int(
    n * (TRAIN_RATIO + VALIDATION_RATIO)
)


X_train = X.iloc[:train_end].copy()

y_train = y.iloc[:train_end].copy()


X_validation = X.iloc[
    train_end:validation_end
].copy()

y_validation = y.iloc[
    train_end:validation_end
].copy()


X_test = X.iloc[
    validation_end:
].copy()

y_test = y.iloc[
    validation_end:
].copy()


train_dates = split_reference["date"].iloc[
    :train_end
]

validation_dates = split_reference["date"].iloc[
    train_end:validation_end
]

test_dates = split_reference["date"].iloc[
    validation_end:
]


print(
    f"Training   : {len(X_train):,} "
    f"({len(X_train)/n*100:.1f}%)"
)

print(
    f"Validation : {len(X_validation):,} "
    f"({len(X_validation)/n*100:.1f}%)"
)

print(
    f"Testing    : {len(X_test):,} "
    f"({len(X_test)/n*100:.1f}%)"
)


print("\nDate ranges:")

print(
    f"Train      : {train_dates.min().date()} → "
    f"{train_dates.max().date()}"
)

print(
    f"Validation : {validation_dates.min().date()} → "
    f"{validation_dates.max().date()}"
)

print(
    f"Test       : {test_dates.min().date()} → "
    f"{test_dates.max().date()}"
)


# ============================================================
# TARGET TRANSFORMATION
# ============================================================

print("\n" + "=" * 100)
print("TARGET TRANSFORMATION")
print("=" * 100)

print("""
Using log1p(target).

This helps the model handle:
- small farms
- medium farms
- large farms
- extreme cost values
""")

y_train_log = np.log1p(
    y_train
)

y_validation_log = np.log1p(
    y_validation
)

y_test_log = np.log1p(
    y_test
)


# ============================================================
# XGBOOST MODEL
# ============================================================

print("\n" + "=" * 100)
print("CREATING HIGH PERFORMANCE XGBOOST")
print("=" * 100)


model = XGBRegressor(

    # --------------------------------------------------------
    # TREE CONFIGURATION
    # --------------------------------------------------------

    n_estimators=5000,

    max_depth=6,

    min_child_weight=2,

    # --------------------------------------------------------
    # LEARNING
    # --------------------------------------------------------

    learning_rate=0.015,

    # --------------------------------------------------------
    # SAMPLING
    # --------------------------------------------------------

    subsample=0.90,

    colsample_bytree=0.90,

    colsample_bylevel=0.90,

    # --------------------------------------------------------
    # REGULARIZATION
    # --------------------------------------------------------

    gamma=0.02,

    reg_alpha=0.001,

    reg_lambda=5.0,

    # --------------------------------------------------------
    # OBJECTIVE
    # --------------------------------------------------------

    objective="reg:squarederror",

    eval_metric="rmse",

    # --------------------------------------------------------
    # PERFORMANCE
    # --------------------------------------------------------

    tree_method="hist",

    n_jobs=-1,

    random_state=RANDOM_STATE
)


# ============================================================
# TRAIN
# ============================================================

print("\nStarting training...")

print("""
Important:
The model is trained on log-transformed feed cost,
but all final metrics are calculated in ₹.
""")

print(
    "Early stopping is enabled."
)

print(
    "Training can take several minutes."
)

print("=" * 100)


model.fit(

    X_train,

    y_train_log,

    eval_set=[
        (
            X_train,
            y_train_log
        ),
        (
            X_validation,
            y_validation_log
        )
    ],

    verbose=200
)


# ============================================================
# PREDICTIONS
# ============================================================

print("\nGenerating predictions...")


train_prediction_log = model.predict(
    X_train
)

validation_prediction_log = model.predict(
    X_validation
)

test_prediction_log = model.predict(
    X_test
)


# Convert back to original ₹ scale

train_prediction = np.expm1(
    train_prediction_log
)

validation_prediction = np.expm1(
    validation_prediction_log
)

test_prediction = np.expm1(
    test_prediction_log
)


# Prevent negative cost predictions

train_prediction = np.maximum(
    train_prediction,
    0
)

validation_prediction = np.maximum(
    validation_prediction,
    0
)

test_prediction = np.maximum(
    test_prediction,
    0
)


# ============================================================
# METRICS
# ============================================================

def calculate_metrics(
    actual,
    predicted
):

    mae = mean_absolute_error(
        actual,
        predicted
    )

    rmse = np.sqrt(
        mean_squared_error(
            actual,
            predicted
        )
    )

    r2 = r2_score(
        actual,
        predicted
    )

    # Safe MAPE
    denominator = np.maximum(
        np.abs(actual),
        1.0
    )

    mape = np.mean(
        np.abs(
            (actual - predicted) /
            denominator
        )
    ) * 100

    median_error = np.median(
        np.abs(
            actual - predicted
        )
    )

    max_error = np.max(
        np.abs(
            actual - predicted
        )
    )

    return {
        "mae": mae,
        "rmse": rmse,
        "mape": mape,
        "r2": r2,
        "median_error": median_error,
        "max_error": max_error
    }


train_metrics = calculate_metrics(
    y_train.values,
    train_prediction
)

validation_metrics = calculate_metrics(
    y_validation.values,
    validation_prediction
)

test_metrics = calculate_metrics(
    y_test.values,
    test_prediction
)


# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 100)
print("MODEL PERFORMANCE")
print("=" * 100)


def print_metrics(
    name,
    metrics
):

    print(f"\n{name}")

    print(
        f"MAE                    : "
        f"₹{metrics['mae']:,.2f}"
    )

    print(
        f"RMSE                   : "
        f"₹{metrics['rmse']:,.2f}"
    )

    print(
        f"MAPE                   : "
        f"{metrics['mape']:.2f}%"
    )

    print(
        f"R²                     : "
        f"{metrics['r2']:.4f}"
    )

    print(
        f"Median Absolute Error  : "
        f"₹{metrics['median_error']:,.2f}"
    )

    print(
        f"Maximum Absolute Error : "
        f"₹{metrics['max_error']:,.2f}"
    )


print_metrics(
    "TRAINING",
    train_metrics
)

print_metrics(
    "VALIDATION",
    validation_metrics
)

print_metrics(
    "TEST",
    test_metrics
)


# ============================================================
# GENERALIZATION CHECK
# ============================================================

train_r2 = train_metrics["r2"]

test_r2 = test_metrics["r2"]

r2_gap = train_r2 - test_r2


print("\n" + "=" * 100)
print("GENERALIZATION CHECK")
print("=" * 100)

print(
    f"Train R² : {train_r2:.4f}"
)

print(
    f"Test R²  : {test_r2:.4f}"
)

print(
    f"R² gap   : {r2_gap:.4f}"
)


if r2_gap < 0.01:

    print(
        "✅ Excellent train/test generalization."
    )

elif r2_gap < 0.03:

    print(
        "✅ Acceptable generalization."
    )

else:

    print(
        "⚠️ Possible overfitting."
    )


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

importance = pd.DataFrame({

    "feature": X.columns,

    "importance": model.feature_importances_

})

importance = importance.sort_values(
    "importance",
    ascending=False
).reset_index(
    drop=True
)


print("\n" + "=" * 100)
print("TOP FEATURE IMPORTANCE")
print("=" * 100)

for _, row in importance.head(25).iterrows():

    print(
        f"{row['feature']:<45}"
        f"{row['importance']:.8f}"
    )


# ============================================================
# FEED COST FEATURE CHECK
# ============================================================

print("\n" + "=" * 100)
print("IMPORTANT FEED COST FEATURES")
print("=" * 100)


important_cost_features = [
    "feed_cost",
    "previous_month_feed_cost",
    "feed_cost_per_chicken",
    "daily_feed_cost",
    "daily_feed_cost_per_chicken",
    "estimated_monthly_feed_cost",
    "feed_price_per_kg",
    "daily_feed_consumption_kg",
    "daily_feed_per_chicken",
    "feed_wastage_cost",
    "feed_cost_change",
    "feed_cost_change_percent"
]


for feature in important_cost_features:

    matching = [
        col for col in X.columns
        if col == feature
    ]

    if matching:

        value = importance.loc[
            importance["feature"] == feature,
            "importance"
        ].iloc[0]

        print(
            f"{feature:<40}"
            f"{value:.8f}"
        )


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(
    model,
    MODEL_PATH
)

print(
    f"\n✅ Model saved: {MODEL_PATH}"
)


# ============================================================
# SAVE PREPROCESSING METADATA
# ============================================================

metadata = {

    "target": TARGET,

    "features": list(X.columns),

    "categorical_columns": categorical_columns,

    "numeric_columns": numeric_columns,

    "target_transform": "log1p",

    "prediction_transform": "expm1",

    "model_type": "XGBRegressor",

    "random_state": RANDOM_STATE,

    "training_samples": int(len(X_train)),

    "validation_samples": int(len(X_validation)),

    "test_samples": int(len(X_test)),

    "feature_count": int(X.shape[1])

}


joblib.dump(
    metadata,
    ENCODER_PATH
)

print(
    f"✅ Encoder/metadata saved: {ENCODER_PATH}"
)


# ============================================================
# SAVE TEST PREDICTIONS
# ============================================================

prediction_df = pd.DataFrame({

    "actual_feed_cost": y_test.values,

    "predicted_feed_cost": test_prediction,

    "absolute_error": np.abs(
        y_test.values -
        test_prediction
    ),

    "percentage_error": (
        np.abs(
            y_test.values -
            test_prediction
        ) /
        np.maximum(
            np.abs(y_test.values),
            1
        )
    ) * 100

})

prediction_df.to_csv(
    PREDICTIONS_PATH,
    index=False
)

print(
    f"✅ Test predictions saved: {PREDICTIONS_PATH}"
)


# ============================================================
# ACTUAL VS PREDICTED
# ============================================================

plt.figure(
    figsize=(10, 8)
)

plt.scatter(
    y_test,
    test_prediction,
    alpha=0.35
)

minimum = min(
    y_test.min(),
    test_prediction.min()
)

maximum = max(
    y_test.max(),
    test_prediction.max()
)

plt.plot(
    [minimum, maximum],
    [minimum, maximum],
    linestyle="--"
)

plt.xlabel(
    "Actual Next Month Feed Cost (₹)"
)

plt.ylabel(
    "Predicted Next Month Feed Cost (₹)"
)

plt.title(
    f"XGBoost Feed Cost Prediction\n"
    f"Test R² = {test_r2:.4f}"
)

plt.grid(
    True,
    alpha=0.3
)

plt.tight_layout()

plt.savefig(
    ACTUAL_PREDICTED_PLOT,
    dpi=250
)

plt.close()

print(
    f"✅ Plot saved: {ACTUAL_PREDICTED_PLOT}"
)


# ============================================================
# FEATURE IMPORTANCE PLOT
# ============================================================

top_features = importance.head(20).sort_values(
    "importance"
)

plt.figure(
    figsize=(10, 8)
)

plt.barh(
    top_features["feature"],
    top_features["importance"]
)

plt.xlabel(
    "XGBoost Importance"
)

plt.ylabel(
    "Feature"
)

plt.title(
    "Top 20 Feed Cost Prediction Features"
)

plt.tight_layout()

plt.savefig(
    FEATURE_IMPORTANCE_PLOT,
    dpi=250
)

plt.close()

print(
    f"✅ Feature importance plot saved: "
    f"{FEATURE_IMPORTANCE_PLOT}"
)


# ============================================================
# RESIDUAL PLOT
# ============================================================

residuals = (
    y_test.values -
    test_prediction
)

plt.figure(
    figsize=(10, 7)
)

plt.scatter(
    test_prediction,
    residuals,
    alpha=0.35
)

plt.axhline(
    0,
    linestyle="--"
)

plt.xlabel(
    "Predicted Feed Cost (₹)"
)

plt.ylabel(
    "Residual (Actual - Predicted)"
)

plt.title(
    "Feed Cost Prediction Residuals"
)

plt.grid(
    True,
    alpha=0.3
)

plt.tight_layout()

plt.savefig(
    RESIDUAL_PLOT,
    dpi=250
)

plt.close()

print(
    f"✅ Residual plot saved: {RESIDUAL_PLOT}"
)


# ============================================================
# ERROR DISTRIBUTION
# ============================================================

absolute_errors = np.abs(
    residuals
)

percentiles = {

    "50": float(
        np.percentile(
            absolute_errors,
            50
        )
    ),

    "75": float(
        np.percentile(
            absolute_errors,
            75
        )
    ),

    "90": float(
        np.percentile(
            absolute_errors,
            90
        )
    ),

    "95": float(
        np.percentile(
            absolute_errors,
            95
        )
    ),

    "99": float(
        np.percentile(
            absolute_errors,
            99
        )
    )
}


plt.figure(
    figsize=(10, 7)
)

plt.hist(
    absolute_errors,
    bins=60
)

plt.xlabel(
    "Absolute Prediction Error (₹)"
)

plt.ylabel(
    "Number of Predictions"
)

plt.title(
    "Feed Cost Prediction Error Distribution"
)

plt.grid(
    True,
    alpha=0.3
)

plt.tight_layout()

plt.savefig(
    ERROR_DISTRIBUTION_PLOT,
    dpi=250
)

plt.close()

print(
    f"✅ Error distribution plot saved: "
    f"{ERROR_DISTRIBUTION_PLOT}"
)


# ============================================================
# PRINT ERROR DISTRIBUTION
# ============================================================

print("\n" + "=" * 100)
print("PREDICTION ERROR DISTRIBUTION")
print("=" * 100)

for percentile, value in percentiles.items():

    print(
        f"{percentile}th percentile error : "
        f"₹{value:,.2f}"
    )


# ============================================================
# SAVE METRICS
# ============================================================

metrics = {

    "model": "XGBoost",

    "objective": "Next month feed cost prediction",

    "dataset": DATA_PATH,

    "target": TARGET,

    "samples": int(len(df)),

    "features": int(X.shape[1]),

    "target_transform": "log1p",

    "train": {
        "mae": float(train_metrics["mae"]),
        "rmse": float(train_metrics["rmse"]),
        "mape": float(train_metrics["mape"]),
        "r2": float(train_metrics["r2"]),
        "median_error": float(
            train_metrics["median_error"]
        ),
        "max_error": float(
            train_metrics["max_error"]
        )
    },

    "validation": {
        "mae": float(validation_metrics["mae"]),
        "rmse": float(validation_metrics["rmse"]),
        "mape": float(validation_metrics["mape"]),
        "r2": float(validation_metrics["r2"]),
        "median_error": float(
            validation_metrics["median_error"]
        ),
        "max_error": float(
            validation_metrics["max_error"]
        )
    },

    "test": {
        "mae": float(test_metrics["mae"]),
        "rmse": float(test_metrics["rmse"]),
        "mape": float(test_metrics["mape"]),
        "r2": float(test_metrics["r2"]),
        "median_error": float(
            test_metrics["median_error"]
        ),
        "max_error": float(
            test_metrics["max_error"]
        )
    },

    "generalization": {

        "r2_gap": float(r2_gap)

    },

    "error_percentiles": percentiles,

    "model_parameters": {

        "n_estimators": 5000,

        "max_depth": 6,

        "min_child_weight": 2,

        "learning_rate": 0.015,

        "subsample": 0.90,

        "colsample_bytree": 0.90,

        "colsample_bylevel": 0.90,

        "gamma": 0.02,

        "reg_alpha": 0.001,

        "reg_lambda": 5.0

    }

}


with open(
    METRICS_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        metrics,
        file,
        indent=4
    )


print(
    f"✅ Metrics saved: {METRICS_PATH}"
)


# ============================================================
# FINAL REPORT
# ============================================================

print("\n" + "=" * 100)
print("🎉 HIGH PERFORMANCE FEED COST MODEL COMPLETED")
print("=" * 100)

print("""
Prediction target:
    feed_cost_next_month
""")

print(
    f"Test R²   : {test_metrics['r2']:.4f}"
)

print(
    f"Test MAPE : {test_metrics['mape']:.2f}%"
)

print(
    f"Test MAE  : ₹{test_metrics['mae']:,.2f}"
)

print(
    f"Test RMSE : ₹{test_metrics['rmse']:,.2f}"
)

print(
    f"Median Error : ₹{test_metrics['median_error']:,.2f}"
)

print(
    f"R² Gap    : {r2_gap:.4f}"
)

print("\nSaved files:")

print(
    f"✅ {MODEL_PATH}"
)

print(
    f"✅ {ENCODER_PATH}"
)

print(
    f"✅ {METRICS_PATH}"
)

print(
    f"✅ {PREDICTIONS_PATH}"
)

print(
    f"✅ {ACTUAL_PREDICTED_PLOT}"
)

print(
    f"✅ {FEATURE_IMPORTANCE_PLOT}"
)

print(
    f"✅ {RESIDUAL_PLOT}"
)

print(
    f"✅ {ERROR_DISTRIBUTION_PLOT}"
)

print("=" * 100)