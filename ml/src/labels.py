"""
Semi-synthetic label generator for flood events.
Combines hydrological physical rules (extreme precipitation, antecedent soil moisture,
river stage, and terrain slope) with historical anchor disaster dates across Maharashtra.
"""

import pandas as pd
import numpy as np

# Historical anchor disasters in Maharashtra (to be verified against official reports)
KNOWN_ANCHORS = [
    # Mumbai July 2005 cloudburst
    {"zone_ids": [6, 8], "start": "2005-07-25", "end": "2005-07-28"},
    # Kolhapur and Sangli August 2019 Krishna/Panchganga floods
    {"zone_ids": [1, 10, 12], "start": "2019-08-04", "end": "2019-08-14"},
    # Mahad (Raigad) and Chiplun (Ratnagiri) July 2021 Konkan floods
    {"zone_ids": [2, 4], "start": "2021-07-21", "end": "2021-07-26"},
    # Gadchiroli July 2022 Wainganga/Pranhita backwater inundation
    {"zone_ids": [3, 7], "start": "2022-07-09", "end": "2022-07-19"},
]

def generate_flood_labels(df_featured: pd.DataFrame, horizon_hours: int = 24) -> pd.Series:
    """
    Generates binary flood label: 1 if severe inundation occurs within next horizon_hours, else 0.
    Semi-synthetic formula based on physical threshold exceedances with stochastic noise.
    """
    df = df_featured

    # 1. Physics score calculation
    rain_score = (df["rain_24h"] / 120.0).clip(0, 2.5) * 0.35 + (df["rain_72h"] / 220.0).clip(0, 2.5) * 0.25
    soil_score = (df["soil_moisture_proxy"] / 80.0).clip(0, 1.5) * 0.20
    river_score = (df["river_level_pct_of_danger"] / 95.0).clip(0, 1.5) * 0.20

    # Low elevation coastal or riverbank vulnerability boost
    terrain_boost = np.where(df["elevation_m"] < 30.0, 0.15, 0.0) + np.where(df["dist_to_river_m"] < 1000.0, 0.10, 0.0)

    combined_risk_index = rain_score + soil_score + river_score + terrain_boost

    # Base rule: risk index > 0.85 generates flood conditions
    np.random.seed(101 + horizon_hours)
    noise = np.random.normal(0, 0.08, size=len(df))
    base_label = ((combined_risk_index + noise) > 0.90).astype(int)

    # 2. Anchor known historical flood events (forced 1)
    timestamps = pd.to_datetime(df["timestamp"])
    for anchor in KNOWN_ANCHORS:
        # Check if zone matches if zone_id column is temporarily available for labeling
        if "zone_id" in df.columns:
            zone_mask = df["zone_id"].isin(anchor["zone_ids"])
        else:
            zone_mask = pd.Series(True, index=df.index)

        date_mask = (timestamps >= pd.to_datetime(anchor["start"])) & (timestamps <= pd.to_datetime(anchor["end"]))
        anchor_mask = zone_mask & date_mask
        base_label = np.where(anchor_mask, 1, base_label)

    # For horizons 48h and 72h, look ahead: label = flood within next horizon_hours
    # rolling maximum forward
    steps = max(1, horizon_hours // 24)
    # Binary flood within next horizon window
    label_series = pd.Series(base_label, index=df.index)
    forward_label = label_series.iloc[::-1].rolling(window=steps, min_periods=1).max().iloc[::-1]

    return forward_label.fillna(0).astype(int)
