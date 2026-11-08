import math
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.errors import AppException
from backend.app.models.zone import Zone
from backend.app.schemas.risk import WhatIfRequest, WhatIfResponse, FactorItem
from backend.app.schemas.zone import ZoneResponse
from backend.app.services.predictor import predictor
from backend.app.services.weather import get_zone_hydrology_observation

router = APIRouter(prefix="/risk", tags=["Risk & Geolocation"])

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates geodesic distance between two points in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

@router.get("/locate")
def locate_nearest_district(
    lat: float = Query(..., description="Latitude coordinate"),
    lon: float = Query(..., description="Longitude coordinate"),
    db: Session = Depends(get_db),
):
    """Finds the nearest Maharashtra district zone from user GPS coordinates."""
    zones = db.query(Zone).all()
    if not zones:
        raise AppException(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NO_ZONES_AVAILABLE",
            message="No monitoring zones found in database.",
        )

    nearest = None
    min_dist = float("inf")

    for z in zones:
        d = haversine_distance(lat, lon, z.centroid_lat, z.centroid_lon)
        if d < min_dist:
            min_dist = d
            nearest = z

    return {
        "nearest_zone": {
            "id": nearest.id,
            "code": nearest.code,
            "name": nearest.name,
            "region": nearest.region,
            "centroid_lat": nearest.centroid_lat,
            "centroid_lon": nearest.centroid_lon,
        },
        "distance_km": round(min_dist, 2),
    }

@router.post("/whatif", response_model=WhatIfResponse)
def simulate_whatif_scenario(req: WhatIfRequest, db: Session = Depends(get_db)):
    """
    Simulates flood risk recalculation under additional precipitation (+0 to +100 mm).
    Reuses the trained ML model with a feature override to ensure monotonic responsiveness.
    """
    zone = db.query(Zone).filter(Zone.id == req.zone_id).first()
    if not zone:
        raise AppException(
            status_code=status.HTTP_404_NOT_FOUND,
            code="ZONE_NOT_FOUND",
            message=f"Zone #{req.zone_id} not found.",
        )

    # 1. Fetch current baseline weather telemetry
    obs_meta = get_zone_hydrology_observation(db, zone)
    weather_dict = {
        "rain_1h": 2.0,
        "rain_6h": 12.0,
        "rain_24h": obs_meta["rainfall"]["current_24h_mm"],
        "rain_72h": obs_meta["rainfall"]["current_24h_mm"] * 1.8,
        "forecast_24h": 35.0,
        "forecast_48h": 25.0,
    }

    # 2. Re-run inference with extra rain override (reusing trained ML model)
    # predictor.predict_for_zone handles 503 if model is missing
    pred_res = predictor.predict_for_zone(
        zone=zone,
        weather_dict=weather_dict,
        extra_rain_mm=max(0.0, min(100.0, req.extra_rain_mm)),
    )

    base_pred_res = predictor.predict_for_zone(
        zone=zone,
        weather_dict=weather_dict,
        extra_rain_mm=0.0,
    )

    factors_out = [
        FactorItem(
            feature=f.get("feature", "Precipitation"),
            impact=f.get("impact", "moderate"),
            text=f.get("text", ""),
            weightPercent=f.get("weightPercent", 30),
        )
        for f in pred_res["factors"]
    ]

    return WhatIfResponse(
        zone_id=zone.id,
        zone_name=zone.name,
        base_probability=base_pred_res["probability"],
        simulated_probability=pred_res["probability"],
        level=pred_res["level"],
        added_rainfall_mm=req.extra_rain_mm,
        factors=factors_out,
    )
