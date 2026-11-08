"""
Feature engineering pipeline for FloodWatch ML models.
Computes precipitation aggregates, antecedent soil moisture proxies, river stage proxies,
and static terrain features per zone.
"""

import pandas as pd
import numpy as np

REGION_MAP = {
    "Konkan": 0,
    "Western Maharashtra": 1,
    "Marathwada": 2,
    "Vidarbha": 3,
    "North Maharashtra": 4,
}

FEATURE_COLUMNS = [
    "rain_1h",
    "rain_6h",
    "rain_24h",
    "rain_72h",
    "forecast_rain_24h",
    "forecast_rain_48h",
    "river_level_pct_of_danger",
    "soil_moisture_proxy",
    "elevation_m",
    "slope_deg",
    "dist_to_river_m",
    "past_flood_count",
    "month",
    "region_encoded",
    "horizon_hours",
]

def engineer_features_for_zone(df_zone: pd.DataFrame, zone_meta: dict) -> pd.DataFrame:
    """
    Computes time-series rolling features for a single district zone.
    df_zone must have ['timestamp', 'precipitation'] sorted by timestamp.
    """
    df = df_zone.copy()
    df = df.sort_values("timestamp").reset_index(drop=True)

    # 1. Past precipitation windows
    p = df["precipitation"]
    df["rain_1h"] = p
    df["rain_6h"] = p.rolling(window=6, min_periods=1).sum()
    df["rain_24h"] = p.rolling(window=24, min_periods=1).sum()
    df["rain_72h"] = p.rolling(window=72, min_periods=1).sum()

    # 2. Future rainfall horizons (forward-looking rainfall for horizon evaluation)
    # Using shift(-24) etc.
    df["forecast_rain_24h"] = p.iloc[::-1].rolling(window=24, min_periods=1).sum().iloc[::-1].shift(-1).fillna(0)
    df["forecast_rain_48h"] = p.iloc[::-1].rolling(window=48, min_periods=1).sum().iloc[::-1].shift(-1).fillna(0)

    # 3. Antecedent soil moisture proxy: rolling 7d (168h) and 14d (336h) weighted sum
    rain_7d = p.rolling(window=168, min_periods=1).sum()
    rain_14d = p.rolling(window=336, min_periods=1).sum()
    # Normalize proxy to approximate percent saturation (0 - 100)
    df["soil_moisture_proxy"] = np.clip((rain_7d * 0.6 + rain_14d * 0.4) / 4.0, 5.0, 98.0)

    # 4. River level percent of danger mark (hydrological proxy from rainfall & terrain)
    # Fast runoff from steep slopes + high 72h rainfall drives river level near danger mark
    danger_mark = zone_meta.get("danger_m", 40.0)
    warning_mark = zone_meta.get("warning_m", 36.0)
    base_depth = warning_mark * 0.70
    runoff_amplification = (df["rain_72h"] / 100.0) * (zone_meta["slope_deg"] / 3.0)
    simulated_depth = base_depth + runoff_amplification * 3.5
    df["river_level_pct_of_danger"] = np.clip((simulated_depth / danger_mark) * 100.0, 20.0, 130.0)

    # 5. Static terrain parameters (approximate)
    df["elevation_m"] = float(zone_meta["elevation_m"])
    df["slope_deg"] = float(zone_meta["slope_deg"])
    df["dist_to_river_m"] = float(zone_meta["dist_to_river_m"])
    df["past_flood_count"] = int(zone_meta["past_flood_count"])

    # 6. Temporal and regional attributes
    df["month"] = df["timestamp"].dt.month
    df["region_encoded"] = REGION_MAP.get(zone_meta["region"], 1)

    return df
