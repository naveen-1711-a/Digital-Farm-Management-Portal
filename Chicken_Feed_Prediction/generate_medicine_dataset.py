import numpy as np
import pandas as pd

# ============================================================
# CHICKEN FARM - MEDICINE COST PREDICTION DATASET
# 50,000 RECORDS
# ============================================================

np.random.seed(42)

N = 50_000

print("=" * 75)
print("CHICKEN FARM MEDICINE COST DATASET GENERATOR")
print("=" * 75)
print(f"Generating {N:,} records...")


# ============================================================
# 1. BASIC INFORMATION
# ============================================================

record_id = np.arange(1, N + 1)

farm_id = np.random.randint(
    1,
    1001,
    N
)

date = pd.to_datetime(
    np.random.randint(
        pd.Timestamp("2021-01-01").value // 10**9,
        pd.Timestamp("2026-06-30").value // 10**9,
        N
    ),
    unit="s"
)

batch_id = [
    f"BATCH-{farm:04d}-{i:06d}"
    for i, farm in enumerate(
        farm_id,
        start=1
    )
]

chicken_type = np.random.choice(
    ["Broiler", "Layer"],
    N,
    p=[0.75, 0.25]
)


# ============================================================
# 2. BREED
# ============================================================

broiler_breeds = [
    "Ross 308",
    "Cobb 500",
    "Hubbard",
    "Arbor Acres"
]

layer_breeds = [
    "Hy-Line Brown",
    "Lohmann Brown",
    "ISA Brown"
]

breed = np.array([
    np.random.choice(broiler_breeds)
    if x == "Broiler"
    else np.random.choice(layer_breeds)
    for x in chicken_type
])


# ============================================================
# 3. FLOCK INFORMATION
# ============================================================

initial_chicken_count = np.random.randint(
    500,
    20001,
    N
)

age_days = np.where(
    chicken_type == "Broiler",

    np.random.randint(
        1,
        57,
        N
    ),

    np.random.randint(
        60,
        501,
        N
    )
)


# ============================================================
# 4. MORTALITY
# ============================================================

base_mortality_rate = np.random.uniform(
    0.5,
    8.0,
    N
)

mortality_count = (
    initial_chicken_count
    * base_mortality_rate
    / 100
).astype(int)

mortality_count = np.maximum(
    mortality_count,
    0
)

current_chicken_count = (
    initial_chicken_count
    - mortality_count
)

mortality_rate = (
    mortality_count
    / np.maximum(
        initial_chicken_count,
        1
    )
    * 100
)


# ============================================================
# 5. WEIGHT
# ============================================================

average_weight_kg = np.where(
    chicken_type == "Broiler",

    np.clip(
        0.045 * age_days
        + np.random.normal(
            0,
            0.10,
            N
        ),
        0.05,
        4.5
    ),

    np.clip(
        1.0
        + 0.0025 * age_days
        + np.random.normal(
            0,
            0.15,
            N
        ),
        1.0,
        3.5
    )
)

target_weight_kg = np.clip(
    average_weight_kg
    + np.random.uniform(
        0.1,
        0.6,
        N
    ),
    0.1,
    5
)

growth_rate_g_per_day = np.where(
    chicken_type == "Broiler",

    np.random.normal(
        55,
        8,
        N
    ),

    np.random.normal(
        8,
        2,
        N
    )
)

growth_rate_g_per_day = np.clip(
    growth_rate_g_per_day,
    2,
    80
)


# ============================================================
# 6. DISEASE INFORMATION
# ============================================================

disease_type = np.random.choice(
    [
        "Healthy",
        "Coccidiosis",
        "Newcastle Disease",
        "Salmonella",
        "Respiratory Infection",
        "Infectious Bronchitis",
        "Fowl Cholera",
        "Avian Influenza"
    ],
    N,
    p=[
        0.55,
        0.11,
        0.07,
        0.06,
        0.08,
        0.05,
        0.05,
        0.03
    ]
)

disease_cases = np.zeros(
    N,
    dtype=int
)

disease_ranges = {

    "Healthy": (
        0,
        5
    ),

    "Coccidiosis": (
        5,
        150
    ),

    "Newcastle Disease": (
        10,
        250
    ),

    "Salmonella": (
        5,
        180
    ),

    "Respiratory Infection": (
        5,
        200
    ),

    "Infectious Bronchitis": (
        5,
        180
    ),

    "Fowl Cholera": (
        5,
        160
    ),

    "Avian Influenza": (
        10,
        300
    )
}

for disease, (low, high) in disease_ranges.items():

    mask = disease_type == disease

    disease_cases[mask] = np.random.randint(
        low,
        high,
        mask.sum()
    )


# ============================================================
# 7. DISEASE SEVERITY
# ============================================================

disease_severity = np.where(

    disease_type == "Healthy",

    "None",

    np.where(
        disease_cases < 25,

        "Low",

        np.where(
            disease_cases < 80,

            "Medium",

            np.where(
                disease_cases < 150,

                "High",

                "Critical"
            )
        )
    )
)


# ============================================================
# 8. SEASON
# ============================================================

season = np.random.choice(
    [
        "Summer",
        "Winter",
        "Monsoon"
    ],
    N,
    p=[
        0.40,
        0.25,
        0.35
    ]
)


# ============================================================
# 9. FARM ENVIRONMENT
# ============================================================

temperature_c = np.where(

    season == "Summer",

    np.random.normal(
        32,
        3,
        N
    ),

    np.where(

        season == "Monsoon",

        np.random.normal(
            28,
            2.5,
            N
        ),

        np.random.normal(
            24,
            3,
            N
        )
    )
)

temperature_c = np.clip(
    temperature_c,
    18,
    40
)

humidity_percent = np.where(

    season == "Monsoon",

    np.random.normal(
        78,
        8,
        N
    ),

    np.random.normal(
        62,
        10,
        N
    )
)

humidity_percent = np.clip(
    humidity_percent,
    35,
    95
)

ammonia_ppm = (
    np.random.normal(
        15,
        6,
        N
    )
    + np.maximum(
        humidity_percent - 70,
        0
    ) * 0.15
)

ammonia_ppm = np.clip(
    ammonia_ppm,
    2,
    50
)

biosecurity_score = np.random.randint(
    40,
    101,
    N
)


# ============================================================
# 10. VACCINATION
# ============================================================

vaccination_count = np.where(

    chicken_type == "Broiler",

    np.random.randint(
        0,
        6,
        N
    ),

    np.random.randint(
        1,
        10,
        N
    )
)

vaccination_cost = (
    vaccination_count
    * current_chicken_count
    * np.random.uniform(
        3,
        15,
        N
    )
)

vaccination_cost = np.round(
    vaccination_cost,
    2
)


# ============================================================
# 11. MEDICINE TYPE
# ============================================================

medicine_type = np.select(

    [
        disease_type == "Healthy",
        disease_type == "Coccidiosis",
        disease_type == "Newcastle Disease",
        disease_type == "Salmonella",
        disease_type == "Respiratory Infection",
        disease_type == "Infectious Bronchitis",
        disease_type == "Fowl Cholera",
        disease_type == "Avian Influenza"
    ],

    [
        "Preventive Supplement",
        "Anticoccidial",
        "Supportive Treatment",
        "Antimicrobial",
        "Respiratory Treatment",
        "Respiratory Treatment",
        "Antimicrobial",
        "Supportive Treatment"
    ],

    default="General Treatment"
)


# ============================================================
# 12. MEDICINE QUANTITY
# ============================================================

medicine_quantity = np.where(

    disease_cases == 0,

    np.random.uniform(
        1,
        10,
        N
    ),

    disease_cases
    * np.random.uniform(
        0.5,
        2.5,
        N
    )
)

medicine_quantity = (
    medicine_quantity
    * np.where(

        disease_severity == "Critical",

        1.40,

        np.where(
            disease_severity == "High",

            1.20,

            np.where(
                disease_severity == "Medium",

                1.05,

                1.00
            )
        )
    )
)

medicine_quantity = np.round(
    medicine_quantity,
    2
)


# ============================================================
# 13. MEDICINE PRICE
# ============================================================

medicine_price = np.select(

    [
        medicine_type == "Preventive Supplement",
        medicine_type == "Anticoccidial",
        medicine_type == "Supportive Treatment",
        medicine_type == "Antimicrobial",
        medicine_type == "Respiratory Treatment"
    ],

    [
        np.random.uniform(
            80,
            250,
            N
        ),

        np.random.uniform(
            150,
            500,
            N
        ),

        np.random.uniform(
            100,
            450,
            N
        ),

        np.random.uniform(
            200,
            700,
            N
        ),

        np.random.uniform(
            180,
            600,
            N
        )
    ],

    default=np.random.uniform(
        100,
        500,
        N
    )
)

medicine_price = np.round(
    medicine_price,
    2
)


# ============================================================
# 14. CURRENT MEDICINE COST
# ============================================================

medicine_base_cost = (
    medicine_quantity
    * medicine_price
)

medicine_cost = (
    medicine_base_cost
    * np.where(

        disease_severity == "Critical",

        1.35,

        np.where(
            disease_severity == "High",

            1.20,

            np.where(
                disease_severity == "Medium",

                1.08,

                1.00
            )
        )
    )
)

medicine_cost = np.round(
    medicine_cost,
    2
)


# ============================================================
# 15. VETERINARY VISITS
# ============================================================

vet_visit_count = np.where(

    disease_cases == 0,

    np.random.randint(
        0,
        2,
        N
    ),

    np.random.randint(
        1,
        8,
        N
    )
)

vet_visit_count = (
    vet_visit_count
    + np.where(

        disease_severity == "Critical",

        np.random.randint(
            1,
            4,
            N
        ),

        0
    )
)

vet_cost = (
    vet_visit_count
    * np.random.uniform(
        500,
        2000,
        N
    )
)

vet_cost = np.round(
    vet_cost,
    2
)


# ============================================================
# 16. PREVIOUS MONTH MEDICINE COST
# ============================================================

previous_month_medicine_cost = (
    medicine_cost
    * np.random.uniform(
        0.75,
        1.25,
        N
    )
)

previous_month_medicine_cost = np.round(
    previous_month_medicine_cost,
    2
)


# ============================================================
# 17. FARM SIZE
# ============================================================

farm_area_acres = np.round(

    np.random.uniform(
        1,
        100,
        N
    ),

    2
)


# ============================================================
# 18. WATER CONSUMPTION
# ============================================================

water_per_bird = np.where(

    chicken_type == "Broiler",

    np.random.uniform(
        0.15,
        0.30,
        N
    ),

    np.random.uniform(
        0.20,
        0.35,
        N
    )
)

water_consumption_liters = (
    current_chicken_count
    * water_per_bird
    * 30
)

water_consumption_liters = np.round(
    water_consumption_liters,
    2
)


# ============================================================
# 19. ELECTRICITY COST
# ============================================================

electricity_cost = (
    3000
    + current_chicken_count * 0.30

    + np.maximum(
        temperature_c - 28,
        0
    ) * 200

    + np.random.normal(
        0,
        1000,
        N
    )
)

electricity_cost = np.clip(
    electricity_cost,
    2500,
    None
)

electricity_cost = np.round(
    electricity_cost,
    2
)


# ============================================================
# 20. LABOUR COST
# ============================================================

labour_cost = (
    8000
    + current_chicken_count * 1.5

    + np.random.normal(
        0,
        1500,
        N
    )
)

labour_cost = np.clip(
    labour_cost,
    5000,
    None
)

labour_cost = np.round(
    labour_cost,
    2
)


# ============================================================
# 21. FEED COST
# ============================================================

daily_feed_consumption_kg = (

    current_chicken_count

    * np.where(

        chicken_type == "Broiler",

        np.clip(
            0.015
            + age_days * 0.0015,
            0.01,
            0.18
        ),

        0.115
    )
)

daily_feed_consumption_kg = np.round(
    daily_feed_consumption_kg,
    2
)

feed_price_per_kg = np.random.uniform(
    35,
    60,
    N
)

feed_cost = (
    daily_feed_consumption_kg
    * 30
    * feed_price_per_kg
)

feed_cost = np.round(
    feed_cost,
    2
)


# ============================================================
# 22. DERIVED FEATURES
# ============================================================

print("\nGenerating derived features...")


# ------------------------------------------------------------
# 22.1 SURVIVAL RATIO
# ------------------------------------------------------------

survival_ratio = (
    current_chicken_count
    / np.maximum(
        initial_chicken_count,
        1
    )
)

survival_ratio = np.round(
    survival_ratio,
    4
)


# ------------------------------------------------------------
# 22.2 BIRDS LOST
# ------------------------------------------------------------

birds_lost = (
    initial_chicken_count
    - current_chicken_count
)


# ------------------------------------------------------------
# 22.3 MORTALITY PER CURRENT BIRD
# ------------------------------------------------------------

mortality_per_current_bird = (
    mortality_count
    / np.maximum(
        current_chicken_count,
        1
    )
)

mortality_per_current_bird = np.round(
    mortality_per_current_bird,
    6
)


# ------------------------------------------------------------
# 22.4 BIRDS PER ACRE
# ------------------------------------------------------------

birds_per_acre = (
    current_chicken_count
    / np.maximum(
        farm_area_acres,
        0.01
    )
)

birds_per_acre = np.round(
    birds_per_acre,
    2
)


# ------------------------------------------------------------
# 22.5 DISEASE RATE
# ------------------------------------------------------------

disease_rate = (
    disease_cases
    / np.maximum(
        current_chicken_count,
        1
    )
    * 100
)

disease_rate = np.round(
    disease_rate,
    4
)


# ------------------------------------------------------------
# 22.6 MEDICINE COST PER BIRD
# ------------------------------------------------------------

medicine_cost_per_bird = (
    medicine_cost
    / np.maximum(
        current_chicken_count,
        1
    )
)

medicine_cost_per_bird = np.round(
    medicine_cost_per_bird,
    4
)


# ------------------------------------------------------------
# 22.7 MEDICINE QUANTITY PER BIRD
# ------------------------------------------------------------

medicine_quantity_per_bird = (
    medicine_quantity
    / np.maximum(
        current_chicken_count,
        1
    )
)

medicine_quantity_per_bird = np.round(
    medicine_quantity_per_bird,
    6
)


# ------------------------------------------------------------
# 22.8 MEDICINE PRICE PRESSURE
# ------------------------------------------------------------

medicine_price_pressure = (
    medicine_price
    * medicine_quantity
)

medicine_price_pressure = np.round(
    medicine_price_pressure,
    2
)


# ------------------------------------------------------------
# 22.9 MEDICINE COST CHANGE
# ------------------------------------------------------------

medicine_cost_change = (
    medicine_cost
    - previous_month_medicine_cost
)

medicine_cost_change = np.round(
    medicine_cost_change,
    2
)


# ------------------------------------------------------------
# 22.10 MEDICINE COST CHANGE PERCENT
# ------------------------------------------------------------

medicine_cost_change_percent = (
    medicine_cost_change
    / np.maximum(
        previous_month_medicine_cost,
        1
    )
    * 100
)

medicine_cost_change_percent = np.round(
    medicine_cost_change_percent,
    2
)


# ------------------------------------------------------------
# 22.11 ENVIRONMENT RISK SCORE
# ------------------------------------------------------------

temperature_risk = np.maximum(
    temperature_c - 28,
    0
)

humidity_risk = np.maximum(
    humidity_percent - 70,
    0
)

ammonia_risk = np.maximum(
    ammonia_ppm - 10,
    0
)

biosecurity_risk = np.maximum(
    70 - biosecurity_score,
    0
)

environment_risk_score = (

    temperature_risk * 2.0

    + humidity_risk * 1.0

    + ammonia_risk * 2.0

    + biosecurity_risk * 0.5
)

environment_risk_score = np.clip(
    environment_risk_score,
    0,
    100
)

environment_risk_score = np.round(
    environment_risk_score,
    2
)


# ------------------------------------------------------------
# 22.12 WEIGHT GAP
# ------------------------------------------------------------

weight_gap_kg = (
    target_weight_kg
    - average_weight_kg
)

weight_gap_kg = np.round(
    weight_gap_kg,
    3
)


# ------------------------------------------------------------
# 22.13 WEIGHT PROGRESS RATIO
# ------------------------------------------------------------

weight_progress_ratio = (
    average_weight_kg
    / np.maximum(
        target_weight_kg,
        0.01
    )
)

weight_progress_ratio = np.round(
    weight_progress_ratio,
    4
)


# ------------------------------------------------------------
# 22.14 AGE MONTHS
# ------------------------------------------------------------

age_months = (
    age_days / 30.0
)

age_months = np.round(
    age_months,
    2
)


# ------------------------------------------------------------
# 22.15 TOTAL OPERATING COST
# ------------------------------------------------------------

total_operating_cost = (

    medicine_cost
    + vaccination_cost
    + vet_cost
    + electricity_cost
    + labour_cost
    + feed_cost
)

total_operating_cost = np.round(
    total_operating_cost,
    2
)


# ============================================================
# 23. NEXT MONTH MEDICINE COST
# TARGET VARIABLE
# ============================================================

print("Generating target variable...")


# Disease growth
disease_growth_factor = (
    disease_cases
    * 0.0015
)


# Severity factor
severity_factor = np.where(

    disease_severity == "Critical",

    0.25,

    np.where(

        disease_severity == "High",

        0.15,

        np.where(

            disease_severity == "Medium",

            0.08,

            np.where(

                disease_severity == "Low",

                0.03,

                0
            )
        )
    )
)


# Poor biosecurity
biosecurity_factor = (
    np.maximum(
        70 - biosecurity_score,
        0
    )
    * 0.003
)


# Temperature stress
temperature_factor = (
    np.maximum(
        temperature_c - 32,
        0
    )
    * 0.01
)


# Humidity stress
humidity_factor = (
    np.maximum(
        humidity_percent - 75,
        0
    )
    * 0.003
)


# Medicine market price variation
medicine_price_change = np.random.normal(
    0.03,
    0.08,
    N
)


# ============================================================
# TARGET CALCULATION
# ============================================================

medicine_cost_next_month = (

    medicine_cost

    * (

        1

        + disease_growth_factor

        + severity_factor

        + biosecurity_factor

        + temperature_factor

        + humidity_factor

        + medicine_price_change
    )
)


# Keep target within realistic range
medicine_cost_next_month = np.clip(

    medicine_cost_next_month,

    medicine_cost * 0.70,

    medicine_cost * 2.50
)

medicine_cost_next_month = np.round(
    medicine_cost_next_month,
    2
)


# ============================================================
# 24. CREATE FINAL DATAFRAME
# ============================================================

df = pd.DataFrame({

    # --------------------------------------------------------
    # BASIC
    # --------------------------------------------------------

    "record_id":
        record_id,

    "farm_id":
        farm_id,

    "date":
        date,

    "batch_id":
        batch_id,

    "chicken_type":
        chicken_type,

    "breed":
        breed,

    # --------------------------------------------------------
    # FARM
    # --------------------------------------------------------

    "farm_area_acres":
        farm_area_acres,

    # --------------------------------------------------------
    # FLOCK
    # --------------------------------------------------------

    "initial_chicken_count":
        initial_chicken_count,

    "current_chicken_count":
        current_chicken_count,

    # --------------------------------------------------------
    # AGE
    # --------------------------------------------------------

    "age_days":
        age_days,

    "age_months":
        age_months,

    # --------------------------------------------------------
    # WEIGHT
    # --------------------------------------------------------

    "average_weight_kg":
        np.round(
            average_weight_kg,
            3
        ),

    "target_weight_kg":
        np.round(
            target_weight_kg,
            3
        ),

    "growth_rate_g_per_day":
        np.round(
            growth_rate_g_per_day,
            2
        ),

    "weight_gap_kg":
        weight_gap_kg,

    "weight_progress_ratio":
        weight_progress_ratio,

    # --------------------------------------------------------
    # MORTALITY
    # --------------------------------------------------------

    "mortality_count":
        mortality_count,

    "mortality_rate":
        np.round(
            mortality_rate,
            2
        ),

    "survival_ratio":
        survival_ratio,

    "birds_lost":
        birds_lost,

    "mortality_per_current_bird":
        mortality_per_current_bird,

    "birds_per_acre":
        birds_per_acre,

    # --------------------------------------------------------
    # DISEASE
    # --------------------------------------------------------

    "disease_cases":
        disease_cases,

    "disease_type":
        disease_type,

    "disease_severity":
        disease_severity,

    "disease_rate":
        disease_rate,

    # --------------------------------------------------------
    # VACCINATION
    # --------------------------------------------------------

    "vaccination_count":
        vaccination_count,

    "vaccination_cost":
        vaccination_cost,

    # --------------------------------------------------------
    # MEDICINE
    # --------------------------------------------------------

    "medicine_type":
        medicine_type,

    "medicine_quantity":
        medicine_quantity,

    "medicine_price":
        medicine_price,

    "medicine_base_cost":
        np.round(
            medicine_base_cost,
            2
        ),

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

    # --------------------------------------------------------
    # VETERINARY
    # --------------------------------------------------------

    "vet_visit_count":
        vet_visit_count,

    "vet_cost":
        vet_cost,

    # --------------------------------------------------------
    # ENVIRONMENT
    # --------------------------------------------------------

    "temperature_c":
        np.round(
            temperature_c,
            2
        ),

    "humidity_percent":
        np.round(
            humidity_percent,
            2
        ),

    "ammonia_ppm":
        np.round(
            ammonia_ppm,
            2
        ),

    "water_consumption_liters":
        water_consumption_liters,

    "biosecurity_score":
        biosecurity_score,

    "environment_risk_score":
        environment_risk_score,

    # --------------------------------------------------------
    # OPERATING COST
    # --------------------------------------------------------

    "electricity_cost":
        electricity_cost,

    "labour_cost":
        labour_cost,

    # --------------------------------------------------------
    # FEED
    # --------------------------------------------------------

    "daily_feed_consumption_kg":
        daily_feed_consumption_kg,

    "feed_price_per_kg":
        np.round(
            feed_price_per_kg,
            2
        ),

    "feed_cost":
        feed_cost,

    # --------------------------------------------------------
    # PREVIOUS MEDICINE COST
    # --------------------------------------------------------

    "previous_month_medicine_cost":
        previous_month_medicine_cost,

    # --------------------------------------------------------
    # SEASON
    # --------------------------------------------------------

    "season":
        season,

    # --------------------------------------------------------
    # TOTAL OPERATING COST
    # --------------------------------------------------------

    "total_operating_cost":
        total_operating_cost,

    # ========================================================
    # TARGET
    # ========================================================

    "medicine_cost_next_month":
        medicine_cost_next_month
})


# ============================================================
# 25. REQUIRED FEATURE LIST
# ============================================================

required_features = [

    "survival_ratio",
    "birds_lost",
    "mortality_per_current_bird",
    "birds_per_acre",
    "disease_rate",
    "medicine_cost_per_bird",
    "medicine_quantity_per_bird",
    "medicine_price_pressure",
    "medicine_cost_change",
    "medicine_cost_change_percent",
    "environment_risk_score",
    "weight_gap_kg",
    "weight_progress_ratio",
    "age_months",
    "total_operating_cost"
]


# ============================================================
# 26. DATASET VALIDATION
# ============================================================

print("\n" + "=" * 75)
print("DATASET VALIDATION")
print("=" * 75)

print(
    f"Rows              : {len(df):,}"
)

print(
    f"Columns           : {len(df.columns)}"
)

print(
    f"Missing values    : {df.isnull().sum().sum()}"
)

print(
    f"Duplicate IDs     : "
    f"{df['record_id'].duplicated().sum()}"
)


# ============================================================
# CHECK REQUIRED FEATURES
# ============================================================

missing_features = [

    feature

    for feature in required_features

    if feature not in df.columns
]

if missing_features:

    print("\n❌ MISSING FEATURES:")

    for feature in missing_features:
        print(
            f"   - {feature}"
        )

else:

    print(
        "\n✅ ALL 15 DERIVED FEATURES "
        "ARE PRESENT"
    )


# ============================================================
# CHECK NUMERIC FEATURES FOR NaN / INF
# ============================================================

numeric_columns = df.select_dtypes(
    include=[np.number]
).columns

nan_count = df[numeric_columns].isna().sum().sum()

inf_count = np.isinf(
    df[numeric_columns].to_numpy()
).sum()

print(
    f"\nNaN numeric values : {nan_count}"
)

print(
    f"Infinity values    : {inf_count}"
)


# ============================================================
# TARGET VALIDATION
# ============================================================

print("\nTARGET VALIDATION")

print(
    f"Target column     : medicine_cost_next_month"
)

print(
    f"Target minimum    : "
    f"₹{df['medicine_cost_next_month'].min():,.2f}"
)

print(
    f"Target maximum    : "
    f"₹{df['medicine_cost_next_month'].max():,.2f}"
)

print(
    f"Target mean       : "
    f"₹{df['medicine_cost_next_month'].mean():,.2f}"
)

print(
    f"Target median     : "
    f"₹{df['medicine_cost_next_month'].median():,.2f}"
)


# ============================================================
# DERIVED FEATURE STATISTICS
# ============================================================

print("\n" + "=" * 75)
print("15 DERIVED FEATURE STATISTICS")
print("=" * 75)

print(
    df[required_features]
    .describe()
    .T[
        [
            "mean",
            "std",
            "min",
            "max"
        ]
    ]
)


# ============================================================
# 27. SAVE DATASET
# ============================================================

output_file = (
    "medicine_dataset_50000.csv"
)

df.to_csv(
    output_file,
    index=False
)


# ============================================================
# 28. FINAL OUTPUT
# ============================================================

print("\n" + "=" * 75)
print("MEDICINE DATASET CREATED SUCCESSFULLY")
print("=" * 75)

print(
    f"File       : {output_file}"
)

print(
    f"Records    : {len(df):,}"
)

print(
    f"Columns    : {len(df.columns)}"
)

print(
    "Target     : medicine_cost_next_month"
)

print(
    "\n15 New Derived Features:"
)

for i, feature in enumerate(
    required_features,
    start=1
):

    print(
        f"{i:2d}. {feature}"
    )


# ============================================================
# FIRST 5 RECORDS
# ============================================================

print("\n" + "=" * 75)
print("FIRST 5 RECORDS")
print("=" * 75)

print(
    df.head().to_string()
)


# ============================================================
# DATASET LOCATION
# ============================================================

print("\n" + "=" * 75)
print("DATASET SAVED")
print("=" * 75)

print(
    "medicine_dataset_50000.csv"
)

print(
    "Expected location:"
)

print(
    "D:\\Chicken_Feed_Prediction"
)

print("=" * 75)