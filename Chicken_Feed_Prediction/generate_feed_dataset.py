import os
import numpy as np
import pandas as pd

# ============================================================
# CHICKEN FARM - FEED COST DATASET
# 50,000 REALISTIC SYNTHETIC RECORDS
# ============================================================

np.random.seed(42)

N = 50_000

OUTPUT_PATH = "data/feed_dataset_50000.csv"

os.makedirs("data", exist_ok=True)

print("=" * 90)
print("GENERATING CHICKEN FARM FEED COST DATASET")
print("=" * 90)

# ============================================================
# 1. BASIC FARM INFORMATION
# ============================================================

record_id = np.arange(1, N + 1)

farm_id = np.random.randint(
    1,
    501,
    N
)

dates = pd.date_range(
    start="2021-01-01",
    end="2026-06-30",
    periods=N
)

batch_id = np.array([
    f"BATCH-{i:05d}"
    for i in np.random.randint(1, 10001, N)
])

chicken_type = np.random.choice(
    ["Broiler", "Layer"],
    N,
    p=[0.70, 0.30]
)

# ============================================================
# 2. BREED
# ============================================================

breeds = [
    "Arbor Acres",
    "Cobb 500",
    "Hubbard",
    "Hy-Line Brown",
    "ISA Brown",
    "Lohmann Brown",
    "Ross 308"
]

breed = np.random.choice(
    breeds,
    N
)

# ============================================================
# 3. CHICKEN COUNT
# ============================================================

initial_chicken_count = np.random.randint(
    1000,
    20001,
    N
)

# Mortality
mortality_rate = np.clip(
    np.random.normal(
        0.025,
        0.015,
        N
    ),
    0,
    0.15
)

mortality_count = np.floor(
    initial_chicken_count *
    mortality_rate
).astype(int)

current_chicken_count = (
    initial_chicken_count -
    mortality_count
)

current_chicken_count = np.maximum(
    current_chicken_count,
    1
)

# Recalculate exact mortality rate
mortality_rate = (
    mortality_count /
    initial_chicken_count
)

# ============================================================
# 4. AGE
# ============================================================

age_days = np.random.randint(
    7,
    70,
    N
)

# ============================================================
# 5. WEIGHT
# ============================================================

average_weight_kg = np.where(
    chicken_type == "Broiler",

    np.clip(
        age_days * np.random.normal(
            0.045,
            0.006,
            N
        ),
        0.15,
        4.0
    ),

    np.clip(
        age_days * np.random.normal(
            0.025,
            0.004,
            N
        ),
        0.10,
        3.0
    )
)

target_weight_kg = np.where(
    chicken_type == "Broiler",
    np.random.uniform(1.8, 2.8, N),
    np.random.uniform(1.5, 2.5, N)
)

growth_rate_g_per_day = np.where(
    chicken_type == "Broiler",
    np.random.normal(45, 7, N),
    np.random.normal(25, 5, N)
)

growth_rate_g_per_day = np.maximum(
    growth_rate_g_per_day,
    5
)

# ============================================================
# 6. DISEASE
# ============================================================

disease_types = [
    "Healthy",
    "Coccidiosis",
    "Fowl Cholera",
    "Infectious Bronchitis",
    "Newcastle Disease",
    "Respiratory Infection",
    "Salmonella"
]

disease_type = np.random.choice(
    disease_types,
    N,
    p=[
        0.55,
        0.10,
        0.06,
        0.09,
        0.08,
        0.07,
        0.05
    ]
)

disease_cases = np.where(
    disease_type == "Healthy",
    0,
    np.random.randint(
        1,
        301,
        N
    )
)

disease_severity = np.where(
    disease_type == "Healthy",
    "Unknown",
    np.random.choice(
        [
            "Low",
            "Medium",
            "High",
            "Critical"
        ],
        N,
        p=[
            0.35,
            0.35,
            0.22,
            0.08
        ]
    )
)

# ============================================================
# 7. FEED TYPE
# ============================================================

feed_type = np.where(
    chicken_type == "Broiler",

    np.random.choice(
        [
            "Starter",
            "Grower",
            "Finisher"
        ],
        N,
        p=[
            0.20,
            0.35,
            0.45
        ]
    ),

    np.array([
        "Layer Feed"
    ] * N)
)

# ============================================================
# 8. DAILY FEED CONSUMPTION
# ============================================================

feed_per_bird = np.where(

    chicken_type == "Broiler",

    np.interp(
        age_days,
        [7, 21, 35, 49, 70],
        [0.035, 0.075, 0.105, 0.120, 0.130]
    ),

    np.interp(
        age_days,
        [7, 21, 35, 49, 70],
        [0.030, 0.060, 0.085, 0.100, 0.110]
    )
)

daily_feed_consumption_kg = (
    current_chicken_count *
    feed_per_bird
)

# Realistic variation
daily_feed_consumption_kg *= np.random.normal(
    1.0,
    0.05,
    N
)

daily_feed_consumption_kg = np.maximum(
    daily_feed_consumption_kg,
    1
)

# ============================================================
# 9. TOTAL FEED CONSUMPTION
# ============================================================

# Current month's approximate consumption
days_elapsed = np.random.randint(
    20,
    31,
    N
)

total_feed_consumption_kg = (
    daily_feed_consumption_kg *
    days_elapsed
)

# ============================================================
# 10. FEED PRICE
# ============================================================

base_feed_price = np.where(
    feed_type == "Starter",
    46,
    np.where(
        feed_type == "Grower",
        43,
        np.where(
            feed_type == "Finisher",
            41,
            44
        )
    )
)

# Seasonal + random price movement
seasonal_price = (
    2.5 *
    np.sin(
        2 * np.pi *
        pd.Series(dates).dt.month.values /
        12
    )
)

feed_price_per_kg = (
    base_feed_price +
    seasonal_price +
    np.random.normal(
        0,
        2,
        N
    )
)

feed_price_per_kg = np.clip(
    feed_price_per_kg,
    30,
    60
)

# ============================================================
# 11. FEED WASTAGE
# ============================================================

feed_wastage_rate = np.clip(
    np.random.normal(
        0.025,
        0.01,
        N
    ),
    0.005,
    0.08
)

feed_wastage_kg = (
    daily_feed_consumption_kg *
    30 *
    feed_wastage_rate
)

# ============================================================
# 12. FEED CONVERSION
# ============================================================

feed_conversion_ratio = np.where(
    chicken_type == "Broiler",
    np.random.normal(
        1.65,
        0.15,
        N
    ),
    np.random.normal(
        2.0,
        0.20,
        N
    )
)

feed_conversion_ratio = np.clip(
    feed_conversion_ratio,
    1.2,
    3.0
)

# ============================================================
# 13. ENVIRONMENT
# ============================================================

temperature_c = np.random.normal(
    28,
    4,
    N
)

humidity_percent = np.clip(
    np.random.normal(
        65,
        10,
        N
    ),
    30,
    95
)

ammonia_ppm = np.clip(
    np.random.normal(
        12,
        6,
        N
    ),
    1,
    40
)

biosecurity_score = np.clip(
    np.random.normal(
        75,
        15,
        N
    ),
    20,
    100
)

# ============================================================
# 14. CURRENT MONTHLY FEED COST
# ============================================================

# IMPORTANT:
# feed_cost = MONTHLY COST
#
# Daily feed × 30 days × price/kg
# + wastage cost

base_monthly_feed_kg = (
    daily_feed_consumption_kg *
    30
)

base_monthly_feed_cost = (
    base_monthly_feed_kg *
    feed_price_per_kg
)

wastage_cost = (
    feed_wastage_kg *
    feed_price_per_kg
)

feed_cost = (
    base_monthly_feed_cost +
    wastage_cost
)

# Small realistic variation
feed_cost *= np.random.normal(
    1.0,
    0.015,
    N
)

feed_cost = np.maximum(
    feed_cost,
    1000
)

# ============================================================
# 15. PREVIOUS MONTH COST
# ============================================================

previous_month_factor = np.random.normal(
    0.98,
    0.05,
    N
)

previous_month_feed_cost = (
    feed_cost *
    previous_month_factor
)

previous_month_feed_cost = np.maximum(
    previous_month_feed_cost,
    1000
)

# ============================================================
# 16. NEXT MONTH FEED COST
# ============================================================

# Future price movement
future_price_change = np.random.normal(
    1.0,
    0.035,
    N
)

# Expected flock change
future_flock_change = np.random.normal(
    1.01,
    0.025,
    N
)

# Disease effect
disease_cost_factor = np.where(
    disease_type == "Healthy",
    1.0,
    np.where(
        disease_severity == "Low",
        1.01,
        np.where(
            disease_severity == "Medium",
            1.025,
            np.where(
                disease_severity == "High",
                1.05,
                1.08
            )
        )
    )
)

# Temperature / environment effect
environment_factor = (
    1 +
    np.maximum(
        temperature_c - 30,
        0
    ) * 0.003
)

# Future monthly cost
feed_cost_next_month = (
    feed_cost
    * future_price_change
    * future_flock_change
    * disease_cost_factor
    * environment_factor
)

# Random business variation
feed_cost_next_month *= np.random.normal(
    1.0,
    0.015,
    N
)

feed_cost_next_month = np.maximum(
    feed_cost_next_month,
    1000
)

# ============================================================
# 17. BUILD DATAFRAME
# ============================================================

df = pd.DataFrame({

    "record_id":
        record_id,

    "farm_id":
        farm_id,

    "date":
        dates,

    "batch_id":
        batch_id,

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
        mortality_rate,

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
        previous_month_feed_cost,

    "feed_cost_next_month":
        feed_cost_next_month
})

# ============================================================
# 18. VALIDATION
# ============================================================

print("\n" + "=" * 90)
print("DATASET VALIDATION")
print("=" * 90)

print(
    f"\nRows: {len(df):,}"
)

print(
    f"Columns: {len(df.columns)}"
)

print("\nCost validation:")

print(
    f"Average daily feed: "
    f"{df['daily_feed_consumption_kg'].mean():,.2f} kg"
)

print(
    f"Average feed price: "
    f"₹{df['feed_price_per_kg'].mean():,.2f}/kg"
)

print(
    f"Average monthly feed cost: "
    f"₹{df['feed_cost'].mean():,.2f}"
)

print(
    f"Average next month cost: "
    f"₹{df['feed_cost_next_month'].mean():,.2f}"
)

# Mathematical check
expected_monthly_cost = (
    df["daily_feed_consumption_kg"]
    * 30
    * df["feed_price_per_kg"]
)

correlation = np.corrcoef(
    expected_monthly_cost,
    df["feed_cost"]
)[0, 1]

print(
    f"\nExpected monthly cost vs feed_cost correlation: "
    f"{correlation:.4f}"
)

# ============================================================
# 19. SAVE
# ============================================================

df.to_csv(
    OUTPUT_PATH,
    index=False
)

print(
    f"\n✅ Dataset saved:"
)

print(
    OUTPUT_PATH
)

print("\n" + "=" * 90)
print("DATASET GENERATION COMPLETED")
print("=" * 90)