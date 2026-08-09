import numpy as np
import pandas as pd

# ============================================================
# CHICKEN FARM - TOTAL COST PREDICTION DATASET
# 50,000 RECORDS
# ============================================================

np.random.seed(42)

N = 50_000

print("=" * 75)
print("CHICKEN FARM TOTAL COST DATASET GENERATOR")
print("=" * 75)
print(f"Generating {N:,} records...")

# ============================================================
# BASIC INFORMATION
# ============================================================

record_id = np.arange(1, N + 1)

farm_id = np.random.randint(1, 1001, N)

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
    for i, farm in enumerate(farm_id, start=1)
]

chicken_type = np.random.choice(
    ["Broiler", "Layer"],
    N,
    p=[0.75, 0.25]
)

# ============================================================
# BREED
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
# FARM SIZE
# ============================================================

farm_area_acres = np.round(
    np.random.uniform(1, 100, N),
    2
)

# ============================================================
# CHICKEN COUNT
# ============================================================

initial_chicken_count = np.random.randint(
    500,
    20001,
    N
)

age_days = np.where(
    chicken_type == "Broiler",
    np.random.randint(1, 57, N),
    np.random.randint(60, 501, N)
)

mortality_rate = np.random.uniform(
    0.5,
    8.0,
    N
)

mortality_count = (
    initial_chicken_count
    * mortality_rate
    / 100
).astype(int)

current_chicken_count = (
    initial_chicken_count
    - mortality_count
)

mortality_rate = (
    mortality_count
    / initial_chicken_count
    * 100
)

# ============================================================
# WEIGHT
# ============================================================

average_weight_kg = np.where(
    chicken_type == "Broiler",

    np.clip(
        0.045 * age_days
        + np.random.normal(0, 0.10, N),
        0.05,
        4.5
    ),

    np.clip(
        1.0
        + 0.0025 * age_days
        + np.random.normal(0, 0.15, N),
        1.0,
        3.5
    )
)

target_weight_kg = np.clip(
    average_weight_kg
    + np.random.uniform(0.1, 0.6, N),
    0.1,
    5
)

growth_rate_g_per_day = np.where(
    chicken_type == "Broiler",
    np.random.normal(55, 8, N),
    np.random.normal(8, 2, N)
)

growth_rate_g_per_day = np.clip(
    growth_rate_g_per_day,
    2,
    80
)

# ============================================================
# DISEASE
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

ranges = {
    "Healthy": (0, 5),
    "Coccidiosis": (5, 150),
    "Newcastle Disease": (10, 250),
    "Salmonella": (5, 180),
    "Respiratory Infection": (5, 200),
    "Infectious Bronchitis": (5, 180),
    "Fowl Cholera": (5, 160),
    "Avian Influenza": (10, 300)
}

for disease, (low, high) in ranges.items():

    mask = disease_type == disease

    disease_cases[mask] = np.random.randint(
        low,
        high,
        mask.sum()
    )

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
# SEASON
# ============================================================

season = np.random.choice(
    ["Summer", "Winter", "Monsoon"],
    N,
    p=[0.40, 0.25, 0.35]
)

# ============================================================
# ENVIRONMENT
# ============================================================

temperature_c = np.where(
    season == "Summer",
    np.random.normal(32, 3, N),

    np.where(
        season == "Monsoon",
        np.random.normal(28, 2.5, N),
        np.random.normal(24, 3, N)
    )
)

temperature_c = np.clip(
    temperature_c,
    18,
    40
)

humidity_percent = np.where(
    season == "Monsoon",
    np.random.normal(78, 8, N),
    np.random.normal(62, 10, N)
)

humidity_percent = np.clip(
    humidity_percent,
    35,
    95
)

ammonia_ppm = (
    np.random.normal(15, 6, N)
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
# FEED
# ============================================================

feed_type = np.where(
    chicken_type == "Broiler",

    np.where(
        age_days <= 14,
        "Starter",

        np.where(
            age_days <= 28,
            "Grower",
            "Finisher"
        )
    ),

    np.where(
        age_days <= 18,
        "Chick Feed",
        "Layer Feed"
    )
)

feed_per_bird = np.where(
    chicken_type == "Broiler",

    np.clip(
        0.015
        + age_days * 0.0015
        + np.random.normal(0, 0.004, N),
        0.01,
        0.18
    ),

    np.clip(
        np.random.normal(0.115, 0.015, N),
        0.07,
        0.18
    )
)

daily_feed_consumption_kg = (
    current_chicken_count
    * feed_per_bird
)

daily_feed_consumption_kg = np.round(
    daily_feed_consumption_kg,
    2
)

total_feed_consumption_kg = (
    daily_feed_consumption_kg * 30
)

feed_wastage_rate = np.clip(
    np.random.normal(5, 1.5, N),
    1,
    15
)

feed_wastage_kg = (
    total_feed_consumption_kg
    * feed_wastage_rate
    / 100
)

feed_price_per_kg = np.where(
    feed_type == "Starter",
    np.random.normal(48, 4, N),

    np.where(
        feed_type == "Grower",
        np.random.normal(44, 4, N),

        np.where(
            feed_type == "Finisher",
            np.random.normal(41, 4, N),

            np.where(
                feed_type == "Chick Feed",
                np.random.normal(46, 4, N),
                np.random.normal(40, 4, N)
            )
        )
    )
)

feed_price_per_kg = np.clip(
    feed_price_per_kg,
    30,
    65
)

feed_cost = (
    total_feed_consumption_kg
    + feed_wastage_kg
) * feed_price_per_kg

# ============================================================
# MEDICINE
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

medicine_quantity = np.where(
    disease_cases == 0,

    np.random.uniform(1, 10, N),

    disease_cases
    * np.random.uniform(0.5, 2.5, N)
)

medicine_price = np.random.uniform(
    80,
    650,
    N
)

medicine_cost = (
    medicine_quantity
    * medicine_price
)

medicine_cost = (
    medicine_cost
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

# ============================================================
# VACCINATION
# ============================================================

vaccination_count = np.where(
    chicken_type == "Broiler",
    np.random.randint(0, 6, N),
    np.random.randint(1, 10, N)
)

vaccination_cost = (
    vaccination_count
    * current_chicken_count
    * np.random.uniform(3, 15, N)
)

# ============================================================
# VETERINARY
# ============================================================

vet_visit_count = np.where(
    disease_cases == 0,
    np.random.randint(0, 2, N),
    np.random.randint(1, 8, N)
)

vet_cost = (
    vet_visit_count
    * np.random.uniform(500, 2000, N)
)

# ============================================================
# WATER
# ============================================================

water_per_bird = np.where(
    chicken_type == "Broiler",
    np.random.uniform(0.15, 0.30, N),
    np.random.uniform(0.20, 0.35, N)
)

water_consumption_liters = (
    current_chicken_count
    * water_per_bird
    * 30
)

# ============================================================
# ELECTRICITY
# ============================================================

electricity_cost = (
    3000
    + current_chicken_count * 0.30
    + np.maximum(
        temperature_c - 28,
        0
    ) * 200
    + np.random.normal(0, 1000, N)
)

electricity_cost = np.clip(
    electricity_cost,
    2500,
    None
)

# ============================================================
# LABOUR
# ============================================================

labour_cost = (
    8000
    + current_chicken_count * 1.5
    + np.random.normal(0, 1500, N)
)

labour_cost = np.clip(
    labour_cost,
    5000,
    None
)

# ============================================================
# PREVIOUS MONTH COSTS
# ============================================================

previous_month_feed_cost = (
    feed_cost
    * np.random.uniform(0.88, 1.12, N)
)

previous_month_medicine_cost = (
    medicine_cost
    * np.random.uniform(0.75, 1.25, N)
)

# ============================================================
# CURRENT TOTAL OPERATIONAL COST
# ============================================================

total_operational_cost = (
    feed_cost
    + medicine_cost
    + vaccination_cost
    + vet_cost
    + electricity_cost
    + labour_cost
)

# ============================================================
# NEXT MONTH FEED COST
# ============================================================

feed_cost_next_month = (
    feed_cost
    * (
        1
        + np.random.normal(0.03, 0.05, N)
        + np.maximum(
            temperature_c - 32,
            0
        ) * 0.01
        + feed_wastage_rate * 0.002
    )
)

feed_cost_next_month = np.clip(
    feed_cost_next_month,
    feed_cost * 0.80,
    feed_cost * 1.50
)

# ============================================================
# NEXT MONTH MEDICINE COST
# ============================================================

medicine_cost_next_month = (
    medicine_cost
    * (
        1
        + np.random.normal(0.03, 0.08, N)
        + disease_cases * 0.001
        + np.maximum(
            70 - biosecurity_score,
            0
        ) * 0.003
    )
)

medicine_cost_next_month = np.clip(
    medicine_cost_next_month,
    medicine_cost * 0.70,
    medicine_cost * 2.50
)

# ============================================================
# NEXT MONTH OTHER COSTS
# ============================================================

vaccination_cost_next_month = (
    vaccination_cost
    * np.random.uniform(
        0.90,
        1.10,
        N
    )
)

vet_cost_next_month = (
    vet_cost
    * np.random.uniform(
        0.90,
        1.20,
        N
    )
)

electricity_cost_next_month = (
    electricity_cost
    * np.random.uniform(
        0.95,
        1.12,
        N
    )
)

labour_cost_next_month = (
    labour_cost
    * np.random.uniform(
        0.98,
        1.10,
        N
    )
)

# ============================================================
# TARGET: TOTAL COST NEXT MONTH
# ============================================================

total_cost_next_month = (
    feed_cost_next_month
    + medicine_cost_next_month
    + vaccination_cost_next_month
    + vet_cost_next_month
    + electricity_cost_next_month
    + labour_cost_next_month
)

# Add small realistic variation
total_cost_next_month = (
    total_cost_next_month
    * np.random.uniform(
        0.98,
        1.02,
        N
    )
)

# ============================================================
# CREATE DATAFRAME
# ============================================================

df = pd.DataFrame({

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

    "farm_area_acres":
        np.round(
            farm_area_acres,
            2
        ),

    "initial_chicken_count":
        initial_chicken_count,

    "current_chicken_count":
        current_chicken_count,

    "age_days":
        age_days,

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

    "mortality_count":
        mortality_count,

    "mortality_rate":
        np.round(
            mortality_rate,
            2
        ),

    "disease_cases":
        disease_cases,

    "disease_type":
        disease_type,

    "disease_severity":
        disease_severity,

    "vaccination_count":
        vaccination_count,

    "vaccination_cost":
        np.round(
            vaccination_cost,
            2
        ),

    "feed_type":
        feed_type,

    "daily_feed_consumption_kg":
        daily_feed_consumption_kg,

    "total_feed_consumption_kg":
        np.round(
            total_feed_consumption_kg,
            2
        ),

    "feed_price_per_kg":
        np.round(
            feed_price_per_kg,
            2
        ),

    "feed_cost":
        np.round(
            feed_cost,
            2
        ),

    "feed_wastage_kg":
        np.round(
            feed_wastage_kg,
            2
        ),

    "feed_wastage_rate":
        np.round(
            feed_wastage_rate,
            2
        ),

    "medicine_type":
        medicine_type,

    "medicine_quantity":
        np.round(
            medicine_quantity,
            2
        ),

    "medicine_price":
        np.round(
            medicine_price,
            2
        ),

    "medicine_cost":
        np.round(
            medicine_cost,
            2
        ),

    "vet_visit_count":
        vet_visit_count,

    "vet_cost":
        np.round(
            vet_cost,
            2
        ),

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
        np.round(
            water_consumption_liters,
            2
        ),

    "electricity_cost":
        np.round(
            electricity_cost,
            2
        ),

    "labour_cost":
        np.round(
            labour_cost,
            2
        ),

    "biosecurity_score":
        biosecurity_score,

    "previous_month_feed_cost":
        np.round(
            previous_month_feed_cost,
            2
        ),

    "previous_month_medicine_cost":
        np.round(
            previous_month_medicine_cost,
            2
        ),

    "total_operational_cost":
        np.round(
            total_operational_cost,
            2
        ),

    "season":
        season,

    "feed_cost_next_month":
        np.round(
            feed_cost_next_month,
            2
        ),

    "medicine_cost_next_month":
        np.round(
            medicine_cost_next_month,
            2
        ),

    "total_cost_next_month":
        np.round(
            total_cost_next_month,
            2
        )
})

# ============================================================
# VALIDATION
# ============================================================

print("\n" + "=" * 75)
print("DATASET VALIDATION")
print("=" * 75)

print(f"Rows           : {len(df):,}")
print(f"Columns        : {len(df.columns)}")
print(f"Missing values : {df.isnull().sum().sum()}")
print(
    f"Duplicate IDs  : "
    f"{df['record_id'].duplicated().sum()}"
)

# ============================================================
# SAVE
# ============================================================

output_file = "total_cost_dataset_50000.csv"

df.to_csv(
    output_file,
    index=False
)

print("\n" + "=" * 75)
print("TOTAL COST DATASET CREATED SUCCESSFULLY")
print("=" * 75)

print(f"File       : {output_file}")
print(f"Records    : {len(df):,}")
print(f"Columns    : {len(df.columns)}")
print("Target     : total_cost_next_month")

print("\nFirst 5 records:")
print(df.head())

print("\nSaved in:")
print("D:\\Chicken_Feed_Prediction")

print("=" * 75)