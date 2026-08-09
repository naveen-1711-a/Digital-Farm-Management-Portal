# ============================================================
# CHICKEN FARM - MEDICINE COST PREDICTION
# IMPROVED XGBOOST TRAINING PIPELINE
# ============================================================

import os
import json
import warnings
import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)

from xgboost import XGBRegressor

warnings.filterwarnings("ignore")


# ============================================================
# CONFIGURATION
# ============================================================

DATA_FILE = "medicine_dataset_50000.csv"

MODEL_DIR = "models"

MODEL_FILE = os.path.join(
    MODEL_DIR,
    "medicine_cost_xgboost.pkl"
)

PREPROCESSOR_FILE = os.path.join(
    MODEL_DIR,
    "medicine_preprocessor.pkl"
)

FEATURE_INFO_FILE = os.path.join(
    MODEL_DIR,
    "medicine_feature_info.json"
)

IMPORTANCE_FILE = os.path.join(
    MODEL_DIR,
    "medicine_feature_importance.csv"
)

TARGET = "medicine_cost_next_month"

RANDOM_STATE = 42


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# HEADER
# ============================================================

print("=" * 90)
print("CHICKEN FARM MEDICINE COST - IMPROVED XGBOOST TRAINING")
print("=" * 90)


# ============================================================
# 1. LOAD DATASET
# ============================================================

print("\n" + "=" * 90)
print("1. LOADING DATASET")
print("=" * 90)

if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(
        f"\nDataset not found: {DATA_FILE}\n"
        f"Make sure the CSV is in the current project folder."
    )

df = pd.read_csv(DATA_FILE)

print("Dataset loaded successfully")
print(f"Rows    : {len(df):,}")
print(f"Columns : {len(df.columns)}")


# ============================================================
# 2. BASIC VALIDATION
# ============================================================

print("\n" + "=" * 90)
print("2. DATASET VALIDATION")
print("=" * 90)

print(f"Missing values : {df.isnull().sum().sum():,}")
print(f"Duplicate rows : {df.duplicated().sum():,}")
print(f"Target column  : {TARGET}")


if TARGET not in df.columns:
    raise ValueError(
        f"Target column '{TARGET}' not found in dataset."
    )


# ============================================================
# 3. REMOVE DUPLICATE ROWS
# ============================================================

before_duplicates = len(df)

df = df.drop_duplicates().reset_index(drop=True)

after_duplicates = len(df)

print(f"Rows before duplicate removal : {before_duplicates:,}")
print(f"Rows after duplicate removal  : {after_duplicates:,}")


# ============================================================
# 4. CLEAN TARGET
# ============================================================

print("\n" + "=" * 90)
print("3. CLEANING TARGET")
print("=" * 90)

df[TARGET] = pd.to_numeric(
    df[TARGET],
    errors="coerce"
)

before_target_clean = len(df)

df = df.dropna(
    subset=[TARGET]
).reset_index(drop=True)

df = df[
    df[TARGET] >= 0
].reset_index(drop=True)

print(f"Rows before cleaning : {before_target_clean:,}")
print(f"Rows after cleaning  : {len(df):,}")
print(
    f"Rows removed         : "
    f"{before_target_clean - len(df):,}"
)


# ============================================================
# 5. DATE FEATURE ENGINEERING
# ============================================================

print("\n" + "=" * 90)
print("4. DATE FEATURE ENGINEERING")
print("=" * 90)

if "date" in df.columns:

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )

    # Date components
    df["date_year"] = df["date"].dt.year
    df["date_month"] = df["date"].dt.month
    df["date_day"] = df["date"].dt.day
    df["date_day_of_year"] = df["date"].dt.dayofyear
    df["date_weekofyear"] = df["date"].dt.isocalendar().week.astype(float)
    df["date_quarter"] = df["date"].dt.quarter
    df["date_is_weekend"] = (
        df["date"].dt.dayofweek >= 5
    ).astype(int)

    # Month represented cyclically
    df["date_month_sin"] = np.sin(
        2 * np.pi * df["date_month"] / 12
    )

    df["date_month_cos"] = np.cos(
        2 * np.pi * df["date_month"] / 12
    )

    # Day of year cyclic representation
    df["date_dayofyear_sin"] = np.sin(
        2 * np.pi * df["date_day_of_year"] / 365.25
    )

    df["date_dayofyear_cos"] = np.cos(
        2 * np.pi * df["date_day_of_year"] / 365.25
    )

    # Keep date temporarily for chronological splitting
    split_date = df["date"].copy()

    # Remove original datetime
    df = df.drop(
        columns=["date"]
    )

    print("Date converted into numeric features.")
    print("Added cyclic seasonal features.")
    print("Original date column removed.")

else:

    split_date = None

    print("No date column found.")


# ============================================================
# 6. REMOVE IDENTIFIER COLUMNS
# ============================================================

print("\n" + "=" * 90)
print("5. REMOVING IDENTIFIER COLUMNS")
print("=" * 90)

identifier_columns = [
    "record_id",
    "farm_id",
    "batch_id"
]

removed_identifiers = []

for col in identifier_columns:

    if col in df.columns:

        df = df.drop(
            columns=[col]
        )

        removed_identifiers.append(col)


if removed_identifiers:

    print("Removed:")

    for col in removed_identifiers:
        print(f"   - {col}")

else:

    print("No identifier columns found.")


# ============================================================
# 7. OPTIONAL SAFETY FEATURE
# medicine_base_cost
# ============================================================

# Some versions of the dataset may contain
# medicine_base_cost while others may not.
#
# If it does not exist, create it from:
#
# medicine_quantity * medicine_price
#
# This is a valid current-month feature.

if (
    "medicine_base_cost" not in df.columns
    and
    "medicine_quantity" in df.columns
    and
    "medicine_price" in df.columns
):

    df["medicine_base_cost"] = (
        df["medicine_quantity"]
        * df["medicine_price"]
    )

    print(
        "\nCreated missing feature: "
        "medicine_base_cost"
    )


# ============================================================
# 8. DEFINE X AND Y
# ============================================================

print("\n" + "=" * 90)
print("6. DEFINING FEATURES")
print("=" * 90)

X = df.drop(
    columns=[TARGET]
)

y = df[TARGET].copy()


print(f"Total input features : {X.shape[1]}")


print("\nInput features:")

for i, col in enumerate(
    X.columns,
    start=1
):

    print(
        f"{i:02d}. {col}"
    )


# ============================================================
# 9. IDENTIFY FEATURE TYPES
# ============================================================

print("\n" + "=" * 90)
print("7. FEATURE TYPES")
print("=" * 90)

categorical_features = X.select_dtypes(
    include=["object", "category"]
).columns.tolist()

numeric_features = X.select_dtypes(
    include=[np.number]
).columns.tolist()


print(
    f"Numeric features     : "
    f"{len(numeric_features)}"
)

print(
    f"Categorical features : "
    f"{len(categorical_features)}"
)


print("\nCategorical features:")

for col in categorical_features:
    print(f"   - {col}")


# ============================================================
# 10. SORT CHRONOLOGICALLY
# ============================================================

print("\n" + "=" * 90)
print("8. CHRONOLOGICAL DATA SPLIT")
print("=" * 90)

if split_date is not None:

    # Align split_date with cleaned df
    split_date = split_date.loc[
        df.index
    ]

    sort_index = np.argsort(
        split_date.fillna(
            pd.Timestamp("2000-01-01")
        ).values
    )

    X = X.iloc[
        sort_index
    ].reset_index(drop=True)

    y = y.iloc[
        sort_index
    ].reset_index(drop=True)

    split_date = split_date.iloc[
        sort_index
    ].reset_index(drop=True)

    print("Dataset sorted chronologically.")

else:

    print(
        "Date unavailable. "
        "Using chronological row order."
    )


# ============================================================
# 11. TRAIN / TEST SPLIT
# ============================================================

split_index = int(
    len(X) * 0.80
)

X_train = X.iloc[
    :split_index
].copy()

X_test = X.iloc[
    split_index:
].copy()

y_train = y.iloc[
    :split_index
].copy()

y_test = y.iloc[
    split_index:
].copy()


print(
    f"\nTraining records : "
    f"{len(X_train):,}"
)

print(
    f"Testing records  : "
    f"{len(X_test):,}"
)


if split_date is not None:

    print(
        f"\nTraining date range:"
    )

    print(
        f"   {split_date.iloc[0].date()}"
        f" → "
        f"{split_date.iloc[split_index - 1].date()}"
    )

    print(
        f"\nTesting date range:"
    )

    print(
        f"   {split_date.iloc[split_index].date()}"
        f" → "
        f"{split_date.iloc[-1].date()}"
    )


# ============================================================
# 12. HANDLE MISSING VALUES
# ============================================================

print("\n" + "=" * 90)
print("9. BUILDING PREPROCESSOR")
print("=" * 90)


# ------------------------------------------------------------
# Numeric pipeline
# ------------------------------------------------------------

numeric_pipeline = Pipeline(
    steps=[

        (
            "imputer",
            SimpleImputer(
                strategy="median"
            )
        )

    ]
)


# ------------------------------------------------------------
# Categorical pipeline
# ------------------------------------------------------------

categorical_pipeline = Pipeline(
    steps=[

        (
            "imputer",
            SimpleImputer(
                strategy="most_frequent"
            )
        ),

        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=True
            )
        )

    ]
)


# ------------------------------------------------------------
# Column Transformer
# ------------------------------------------------------------

preprocessor = ColumnTransformer(
    transformers=[

        (
            "numeric",
            numeric_pipeline,
            numeric_features
        ),

        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )

    ],
    remainder="drop",
    sparse_threshold=0.3
)


# ============================================================
# 13. FIT PREPROCESSOR
# ============================================================

print("\nFitting preprocessor...")

X_train_processed = preprocessor.fit_transform(
    X_train
)

X_test_processed = preprocessor.transform(
    X_test
)


print(
    "Preprocessor fitted successfully."
)

print(
    f"Processed training shape : "
    f"{X_train_processed.shape}"
)

print(
    f"Processed testing shape  : "
    f"{X_test_processed.shape}"
)

print(
    f"\nTraining matrix type : "
    f"{type(X_train_processed).__name__}"
)

print(
    f"Testing matrix type  : "
    f"{type(X_test_processed).__name__}"
)


# ============================================================
# 14. LOG TRANSFORM TARGET
# ============================================================

print("\n" + "=" * 90)
print("10. TARGET TRANSFORMATION")
print("=" * 90)

print(
    "Using log1p transformation "
    "to handle highly skewed medicine costs."
)

y_train_log = np.log1p(
    y_train
)

y_test_log = np.log1p(
    y_test
)


# ============================================================
# 15. BUILD XGBOOST
# ============================================================

print("\n" + "=" * 90)
print("11. BUILDING IMPROVED XGBOOST MODEL")
print("=" * 90)


model = XGBRegressor(

    # Large maximum number of trees.
    # Early stopping will find the useful number.
    n_estimators=2000,

    learning_rate=0.025,

    max_depth=6,

    min_child_weight=5,

    subsample=0.85,

    colsample_bytree=0.85,

    gamma=0.05,

    reg_alpha=0.10,

    reg_lambda=2.0,

    objective="reg:squarederror",

    eval_metric="rmse",

    tree_method="hist",

    random_state=RANDOM_STATE,

    n_jobs=-1,

    early_stopping_rounds=75
)


print(
    "XGBoost configuration:"
)

print(
    f"   n_estimators       : "
    f"{model.n_estimators}"
)

print(
    f"   learning_rate      : "
    f"{model.learning_rate}"
)

print(
    f"   max_depth          : "
    f"{model.max_depth}"
)

print(
    f"   min_child_weight   : "
    f"{model.min_child_weight}"
)

print(
    f"   subsample          : "
    f"{model.subsample}"
)

print(
    f"   colsample_bytree   : "
    f"{model.colsample_bytree}"
)

print(
    f"   reg_alpha          : "
    f"{model.reg_alpha}"
)

print(
    f"   reg_lambda         : "
    f"{model.reg_lambda}"
)

print(
    f"   early stopping     : "
    f"{model.early_stopping_rounds}"
)


# ============================================================
# 16. TRAIN MODEL
# ============================================================

print("\n" + "=" * 90)
print("12. TRAINING XGBOOST")
print("=" * 90)

print("Training started...")
print(
    "The model will stop automatically "
    "when validation performance stops improving."
)


model.fit(

    X_train_processed,

    y_train_log,

    eval_set=[
        (
            X_train_processed,
            y_train_log
        ),

        (
            X_test_processed,
            y_test_log
        )
    ],

    verbose=False
)


print("\nTraining completed successfully.")


if hasattr(
    model,
    "best_iteration"
):

    print(
        f"Best iteration : "
        f"{model.best_iteration}"
    )


# ============================================================
# 17. PREDICTIONS
# ============================================================

print("\n" + "=" * 90)
print("13. GENERATING PREDICTIONS")
print("=" * 90)


predicted_log = model.predict(
    X_test_processed
)


# Reverse log1p transformation
predicted_cost = np.expm1(
    predicted_log
)


# Safety: cost cannot be negative
predicted_cost = np.maximum(
    predicted_cost,
    0
)


# ============================================================
# 18. EVALUATION
# ============================================================

print("\n" + "=" * 90)
print("14. MODEL EVALUATION")
print("=" * 90)


actual = y_test.values.astype(float)

prediction = predicted_cost.astype(float)


# ------------------------------------------------------------
# MAE
# ------------------------------------------------------------

mae = mean_absolute_error(
    actual,
    prediction
)


# ------------------------------------------------------------
# RMSE
# ------------------------------------------------------------

rmse = np.sqrt(
    mean_squared_error(
        actual,
        prediction
    )
)


# ------------------------------------------------------------
# R2
# ------------------------------------------------------------

r2 = r2_score(
    actual,
    prediction
)


# ------------------------------------------------------------
# MAPE
# ------------------------------------------------------------

non_zero_mask = (
    actual > 1
)

if non_zero_mask.sum() > 0:

    mape = np.mean(
        np.abs(
            (
                actual[non_zero_mask]
                -
                prediction[non_zero_mask]
            )
            /
            actual[non_zero_mask]
        )
    ) * 100

else:

    mape = np.nan


# ------------------------------------------------------------
# Median Absolute Percentage Error
# ------------------------------------------------------------

if non_zero_mask.sum() > 0:

    mdape = np.median(
        np.abs(
            (
                actual[non_zero_mask]
                -
                prediction[non_zero_mask]
            )
            /
            actual[non_zero_mask]
        )
    ) * 100

else:

    mdape = np.nan


# ------------------------------------------------------------
# Approximate MAPE-based score
# ------------------------------------------------------------

if not np.isnan(mape):

    approximate_accuracy = max(
        0,
        100 - mape
    )

else:

    approximate_accuracy = np.nan


print(
    f"MAE                  : "
    f"₹{mae:,.2f}"
)

print(
    f"RMSE                 : "
    f"₹{rmse:,.2f}"
)

print(
    f"R²                   : "
    f"{r2:.4f}"
)

print(
    f"MAPE                 : "
    f"{mape:.2f}%"
)

print(
    f"Median APE           : "
    f"{mdape:.2f}%"
)

print(
    f"Approx. MAPE score   : "
    f"{approximate_accuracy:.2f}%"
)


# ============================================================
# 19. SAMPLE PREDICTIONS
# ============================================================

print("\n" + "=" * 90)
print("15. SAMPLE PREDICTIONS")
print("=" * 90)


sample_count = min(
    15,
    len(actual)
)


results = pd.DataFrame({

    "Actual_Cost":
        actual[:sample_count],

    "Predicted_Cost":
        prediction[:sample_count]

})


results["Difference"] = (
    results["Predicted_Cost"]
    -
    results["Actual_Cost"]
)


results["Absolute_Error"] = (
    results["Difference"]
    .abs()
)


results["Percentage_Error"] = np.where(

    results["Actual_Cost"] > 1,

    (
        results["Absolute_Error"]
        /
        results["Actual_Cost"]
        * 100
    ),

    0
)


print(
    results.to_string(
        index=False,
        formatters={
            "Actual_Cost":
                "{:,.2f}".format,

            "Predicted_Cost":
                "{:,.2f}".format,

            "Difference":
                "{:,.2f}".format,

            "Absolute_Error":
                "{:,.2f}".format,

            "Percentage_Error":
                "{:.2f}%".format
        }
    )
)


# ============================================================
# 20. FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 90)
print("16. FEATURE IMPORTANCE")
print("=" * 90)


feature_names = (
    preprocessor
    .get_feature_names_out()
)


importance_values = (
    model.feature_importances_
)


feature_importance = pd.DataFrame({

    "feature":
        feature_names,

    "importance":
        importance_values

})


feature_importance = (
    feature_importance
    .sort_values(
        by="importance",
        ascending=False
    )
    .reset_index(drop=True)
)


print(
    "\nTop 30 important features:"
)

print(
    feature_importance
    .head(30)
    .to_string(
        index=False
    )
)


# ============================================================
# 21. SAVE FEATURE IMPORTANCE
# ============================================================

feature_importance.to_csv(
    IMPORTANCE_FILE,
    index=False
)


print(
    f"\nFeature importance saved:"
)

print(
    IMPORTANCE_FILE
)


# ============================================================
# 22. SAVE MODEL
# ============================================================

print("\n" + "=" * 90)
print("17. SAVING MODEL")
print("=" * 90)


joblib.dump(
    model,
    MODEL_FILE
)


print(
    f"Model saved:"
)

print(
    MODEL_FILE
)


# ============================================================
# 23. SAVE PREPROCESSOR
# ============================================================

joblib.dump(
    preprocessor,
    PREPROCESSOR_FILE
)


print(
    f"Preprocessor saved:"
)

print(
    PREPROCESSOR_FILE
)


# ============================================================
# 24. SAVE FEATURE INFORMATION
# ============================================================

feature_info = {

    "target": TARGET,

    "model_type":
        "XGBRegressor",

    "target_transformation":
        "log1p",

    "prediction_inverse_transformation":
        "expm1",

    "original_input_features":
        X.columns.tolist(),

    "numeric_features":
        numeric_features,

    "categorical_features":
        categorical_features,

    "processed_feature_count":
        int(
            X_train_processed.shape[1]
        ),

    "training_records":
        int(
            len(X_train)
        ),

    "testing_records":
        int(
            len(X_test)
        ),

    "metrics": {

        "MAE":
            float(mae),

        "RMSE":
            float(rmse),

        "R2":
            float(r2),

        "MAPE":
            float(mape)
            if not np.isnan(mape)
            else None,

        "Median_APE":
            float(mdape)
            if not np.isnan(mdape)
            else None,

        "Approximate_MAPE_Score":
            float(
                approximate_accuracy
            )
            if not np.isnan(
                approximate_accuracy
            )
            else None

    },

    "best_iteration":
        int(
            model.best_iteration
        )
        if hasattr(
            model,
            "best_iteration"
        )
        else None,

    "xgboost_parameters": {

        "n_estimators":
            model.n_estimators,

        "learning_rate":
            model.learning_rate,

        "max_depth":
            model.max_depth,

        "min_child_weight":
            model.min_child_weight,

        "subsample":
            model.subsample,

        "colsample_bytree":
            model.colsample_bytree,

        "gamma":
            model.gamma,

        "reg_alpha":
            model.reg_alpha,

        "reg_lambda":
            model.reg_lambda

    }

}


with open(
    FEATURE_INFO_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        feature_info,
        f,
        indent=4
    )


print(
    f"Feature information saved:"
)

print(
    FEATURE_INFO_FILE
)


# ============================================================
# 25. SAVE TEST PREDICTIONS
# ============================================================

test_predictions = X_test.copy()

test_predictions[
    "actual_medicine_cost_next_month"
] = actual

test_predictions[
    "predicted_medicine_cost_next_month"
] = prediction

test_predictions[
    "absolute_error"
] = np.abs(
    actual - prediction
)

test_predictions[
    "percentage_error"
] = np.where(

    actual > 1,

    (
        np.abs(
            actual - prediction
        )
        /
        actual
        * 100
    ),

    0
)


TEST_PREDICTION_FILE = os.path.join(
    MODEL_DIR,
    "medicine_test_predictions.csv"
)


test_predictions.to_csv(
    TEST_PREDICTION_FILE,
    index=False
)


print(
    f"\nTest predictions saved:"
)

print(
    TEST_PREDICTION_FILE
)


# ============================================================
# 26. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 90)
print("TRAINING COMPLETED SUCCESSFULLY")
print("=" * 90)

print(
    f"Dataset rows          : "
    f"{len(df):,}"
)

print(
    f"Original features     : "
    f"{X.shape[1]}"
)

print(
    f"Processed features    : "
    f"{X_train_processed.shape[1]}"
)

print(
    f"Training records      : "
    f"{len(X_train):,}"
)

print(
    f"Testing records       : "
    f"{len(X_test):,}"
)

print(
    f"MAE                   : "
    f"₹{mae:,.2f}"
)

print(
    f"RMSE                  : "
    f"₹{rmse:,.2f}"
)

print(
    f"R²                    : "
    f"{r2:.4f}"
)

print(
    f"MAPE                  : "
    f"{mape:.2f}%"
)

print(
    f"Median APE            : "
    f"{mdape:.2f}%"
)

print(
    f"Approx. MAPE Score    : "
    f"{approximate_accuracy:.2f}%"
)

print(
    f"Best XGBoost iteration: "
    f"{model.best_iteration}"
    if hasattr(
        model,
        "best_iteration"
    )
    else "Not available"
)


print("\nSaved files:")

print(
    f"1. {MODEL_FILE}"
)

print(
    f"2. {PREPROCESSOR_FILE}"
)

print(
    f"3. {FEATURE_INFO_FILE}"
)

print(
    f"4. {IMPORTANCE_FILE}"
)

print(
    f"5. {TEST_PREDICTION_FILE}"
)

print("=" * 90)