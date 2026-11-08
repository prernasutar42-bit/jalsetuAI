"""
Runtime feature extraction service for FloodWatch inference.
"""

import datetime
from typing import Dict, Any, List
import numpy as np
from backend.app.models.zone import Zone
from ml.src.features import FEATURE_COLUMNS, REGION_MAP

def build_feature_vector_for_zone(
    zone: Zone,
    weather_dict: Dict[str, Any],
    horizon_hours: int = 24,
    extra_rain_mm: float = 0.0,
) -> np.ndarray:
    """
    Constructs a 1D NumPy array with the exact 15 features expected by the trained XGBoost model.
    Applies extra_rain_mm override when executing what-if scenario simulations.
    """
    base_rain_1h = weather_dict.get("rain_1h", 2.0)
    base_rain_6h = weather_dict.get("rain_6h", 12.0)
    base_rain_24h = weather_dict.get("rain_24h", 45.0)
    base_rain_72h = weather_dict.get("rain_72h", 90.0)
    forecast_24h = weather_dict.get("forecast_24h", 40.0)
    forecast_48h = weather_dict.get("forecast_48h", 30.0)

    # Apply extra simulated rainfall
    rain_1h = base_rain_1h + (extra_rain_mm * 0.15)
    rain_6h = base_rain_6h + (extra_rain_mm * 0.45)
    rain_24h = base_rain_24h + extra_rain_mm
    rain_72h = base_rain_72h + extra_rain_mm

    # Derive river stage percent of danger
    danger_m = 43.0 if zone.id == 1 else (19.0 if zone.id == 2 else 45.0)
    warning_m = 39.0 if zone.id == 1 else (16.5 if zone.id == 2 else 40.0)
    runoff = (rain_72h / 100.0) * (zone.slope_deg / 3.0)
    simulated_depth = warning_m * 0.70 + runoff * 3.5
    river_pct = float(np.clip((simulated_depth / danger_m) * 100.0, 20.0, 130.0))

    # Soil moisture proxy (percent)
    soil_proxy = float(np.clip(30.0 + (rain_72h / 180.0) * 65.0, 10.0, 98.0))

    month = datetime.datetime.utcnow().month
    region_enc = REGION_MAP.get(zone.region, 1)

    row = [
        float(rain_1h),
        float(rain_6h),
        float(rain_24h),
        float(rain_72h),
        float(forecast_24h),
        float(forecast_48h),
        river_pct,
        soil_proxy,
        float(zone.elevation_m),
        float(zone.slope_deg),
        float(zone.dist_to_river_m),
        int(zone.past_flood_count),
        int(month),
        int(region_enc),
        int(horizon_hours),
    ]

    return np.array(row, dtype=float)
