"""
behavior_model.py
Statistical behavior profiling using Z-score and IQR methods.
Used to detect when a worker's activity deviates significantly from their historical baseline.
"""
import numpy as np
from typing import Optional


def z_score(value: float, mean: float, std: float) -> float:
    """Calculate Z-score for anomaly detection. |Z| > 3 is anomalous."""
    if std == 0:
        return 0.0
    return (value - mean) / std


def is_quantity_anomalous(current: float, historical: list[float], threshold_z: float = 2.5) -> dict:
    """
    Determine if a quantity value is anomalous compared to historical data.
    Returns dict with isAnomaly, zScore, mean, std.
    """
    if len(historical) < 3:
        return {"isAnomaly": False, "reason": "Insufficient history", "zScore": 0, "mean": 0, "std": 0}

    arr = np.array(historical)
    mean = float(np.mean(arr))
    std = float(np.std(arr))
    z = z_score(current, mean, std)

    # Also check IQR
    q1 = float(np.percentile(arr, 25))
    q3 = float(np.percentile(arr, 75))
    iqr = q3 - q1
    upper_fence = q3 + 2.0 * iqr

    is_anomaly = abs(z) > threshold_z or (current > upper_fence and current > mean * 2)

    return {
        "isAnomaly": is_anomaly,
        "zScore": round(z, 3),
        "mean": round(mean, 2),
        "std": round(std, 2),
        "q1": round(q1, 2),
        "q3": round(q3, 2),
        "upperFence": round(upper_fence, 2),
        "current": current,
    }


def profile_deviation_score(
    current_hour: Optional[float],
    avg_login_hour: float,
    login_std: float,
    current_entries: Optional[int],
    avg_entries: float,
    entries_std: float,
) -> float:
    """
    Calculate a 0-100 deviation score for a worker's current activity
    compared to their behavioral profile.
    """
    score = 0.0

    if current_hour is not None and login_std > 0:
        z = abs(z_score(current_hour, avg_login_hour, login_std))
        score += min(50.0, z * 10)

    if current_entries is not None and entries_std > 0:
        z = abs(z_score(current_entries, avg_entries, entries_std))
        score += min(50.0, z * 10)

    return round(min(100.0, score), 2)


def update_profile(existing: dict, new_value: float, field: str) -> dict:
    """
    Incrementally update a running mean/std for a behavioral profile field.
    Uses Welford's online algorithm for numerical stability.
    """
    n = existing.get("sampleSize", 0) + 1
    mean_key = f"avg_{field}"
    std_key = f"{field}StdDev"

    old_mean = existing.get(mean_key, 0)
    new_mean = old_mean + (new_value - old_mean) / n

    old_m2 = (existing.get(std_key, 0) ** 2) * max(1, n - 1)
    new_m2 = old_m2 + (new_value - old_mean) * (new_value - new_mean)
    new_std = np.sqrt(new_m2 / n) if n > 1 else 0.0

    return {
        mean_key: round(new_mean, 4),
        std_key: round(float(new_std), 4),
        "sampleSize": n,
        "isReliable": n >= 30,
    }
