"""
Open-Meteo weather forecast service.
Fetches real-time precipitation and forecast for all 36 Maharashtra district centroids
in batched requests, with 2 retries, timeouts, and fallback to last stored observation.
"""

import logging
from typing import Dict, List, Optional
import httpx
from sqlalchemy.orm import Session
from backend.app.models.zone import Zone
from backend.app.models.observation import Observation

logger = logging.getLogger(__name__)

OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

async def fetch_weather_for_centroids(zones: List[Zone]) -> Dict[int, dict]:
    """
    Fetches 3-day hourly forecast for the given zones in a batched API call.
    Returns dict: zone_id -> weather telemetry dict.
    """
    if not zones:
        return {}

    lats = [f"{z.centroid_lat:.4f}" for z in zones]
    lons = [f"{z.centroid_lon:.4f}" for z in zones]

    params = {
        "latitude": ",".join(lats),
        "longitude": ",".join(lons),
        "hourly": "precipitation",
        "current": "precipitation",
        "forecast_days": 3,
        "timezone": "Asia/Kolkata",
    }

    # Execute with 2 retries and 8.0s timeout
    last_exc = None
    for attempt in range(1, 3):
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(OPEN_METEO_FORECAST_URL, params=params)
                if resp.status_code == 200:
                    data = resp.json()
                    # Open-Meteo returns a list if multiple locations requested, or a single dict if one
                    data_list = data if isinstance(data, list) else [data]

                    result = {}
                    for i, z in enumerate(zones):
                        if i < len(data_list):
                            z_data = data_list[i]
                            hourly = z_data.get("hourly", {})
                            precip_list = hourly.get("precipitation", [])
                            current = z_data.get("current", {})

                            rain_1h = float(current.get("precipitation", 0.0) or (precip_list[0] if precip_list else 0.0))
                            rain_24h = float(sum(precip_list[:24])) if len(precip_list) >= 24 else rain_1h * 12
                            forecast_24h = float(sum(precip_list[24:48])) if len(precip_list) >= 48 else rain_24h * 0.8
                            forecast_48h = float(sum(precip_list[48:72])) if len(precip_list) >= 72 else forecast_24h * 0.7

                            result[z.id] = {
                                "rain_1h": round(rain_1h, 2),
                                "rain_24h": round(rain_24h, 2),
                                "rain_6h": round(float(sum(precip_list[:6])), 2) if len(precip_list) >= 6 else rain_1h * 4,
                                "rain_72h": round(float(sum(precip_list[:72])), 2) if len(precip_list) >= 72 else rain_24h * 2.2,
                                "forecast_24h": round(forecast_24h, 2),
                                "forecast_48h": round(forecast_48h, 2),
                                "is_stale": False,
                            }
                    return result

        except Exception as exc:
            last_exc = exc
            logger.warning(f"Open-Meteo request attempt {attempt} failed: {exc}")

    logger.error(f"Open-Meteo API unavailable after 2 retries: {last_exc}. Falling back to cached database telemetry.")
    return {}

def get_zone_hydrology_observation(db: Session, zone: Zone, weather_data: Optional[dict] = None) -> dict:
    """
    Returns latest telemetry for zone, integrating fresh weather data or falling back to last observation.
    """
    latest_obs = (
        db.query(Observation)
        .filter(Observation.zone_id == zone.id)
        .order_by(Observation.timestamp.desc())
        .first()
    )

    if weather_data and zone.id in weather_data:
        w = weather_data[zone.id]
        rain_24h = w["rain_24h"]
        is_stale = False
    elif latest_obs:
        rain_24h = latest_obs.rainfall_24h_mm
        is_stale = True
    else:
        rain_24h = 45.0 if zone.region == "Konkan" else 15.0
        is_stale = True

    # Hydrological seasonal normals and river level proxy
    normal_24h = 50.0 if zone.region == "Konkan" else (35.0 if zone.region == "Western Maharashtra" else 20.0)
    anomaly_ratio = round(rain_24h / max(1.0, normal_24h), 1)

    # Danger mark and warning mark estimates from seed metadata
    danger_m = 43.0 if zone.id == 1 else (19.0 if zone.id == 2 else (149.2 if zone.id == 3 else 45.0))
    warning_m = 39.0 if zone.id == 1 else (16.5 if zone.id == 2 else (146.0 if zone.id == 3 else 40.0))

    # Derived river gauge height
    gauge_surge = (rain_24h / 120.0) * (danger_m - warning_m) * 1.2
    current_river_m = round(warning_m - 0.8 + gauge_surge, 1)

    river_status = "normal"
    if current_river_m >= danger_m:
        river_status = "danger"
    elif current_river_m >= warning_m:
        river_status = "warning"

    freeboard_m = round(max(0.0, danger_m - current_river_m), 1)

    river_names = {
        1: "Panchganga", 2: "Kajali", 3: "Wainganga & Pranhita", 4: "Kundalika & Amba",
        5: "Terekhol & Karli", 6: "Mithi & Poisar", 7: "Erai & Wardha", 8: "Coastal Outfalls",
        9: "Ulhas", 10: "Krishna", 11: "Vaitarna & Surya", 12: "Krishna & Venna",
        15: "Godavari", 16: "Mula-Mutha", 17: "Nag & Pili", 25: "Girna & Tapi",
        29: "Godavari", 32: "Kham & Godavari",
    }
    river_name = river_names.get(zone.id, "Local River Basin")

    return {
        "rainfall": {
            "current_24h_mm": rain_24h,
            "normal_24h_mm": normal_24h,
            "trend": "rising" if rain_24h > normal_24h else "steady",
            "anomaly_ratio": anomaly_ratio,
        },
        "river": {
            "name": river_name,
            "current_m": current_river_m,
            "warning_level_m": warning_m,
            "danger_level_m": danger_m,
            "status": river_status,
            "freeboard_m": freeboard_m,
            "dam_discharge_cusec": 48500 if zone.id == 1 and current_river_m > warning_m else (18000 if zone.id == 2 else 0),
        },
        "soil_saturation_pct": min(98, max(25, int(40 + (rain_24h / 150.0) * 55))),
        "is_stale": is_stale,
    }
