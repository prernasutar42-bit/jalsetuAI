import datetime
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.errors import AppException
from backend.app.models.zone import Zone
from backend.app.models.prediction import Prediction
from backend.app.models.alert import Alert
from backend.app.models.user import User
from backend.app.schemas.alert import AlertCreateRequest, AlertResponse
from backend.app.routers.auth import get_current_admin
from backend.app.routers.alerts import format_time_ago
from backend.app.services.scheduler import run_prediction_pipeline
from backend.app.services.weather import get_zone_hydrology_observation
from backend.app.services.predictor import predictor

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.post("/alerts", response_model=AlertResponse)
def create_manual_alert(
    req: AlertCreateRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Issues an official manual flood advisory broadcast across citizen and emergency channels."""
    zone = db.query(Zone).filter(Zone.id == req.district_id).first()
    if not zone:
        raise AppException(
            status_code=status.HTTP_404_NOT_FOUND,
            code="ZONE_NOT_FOUND",
            message=f"Target district zone #{req.district_id} does not exist.",
        )

    new_alert = Alert(
        zone_id=zone.id,
        level=req.level.lower(),
        message=req.message.strip(),
        source="admin",
        created_by=current_admin.name,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return AlertResponse(
        id=f"alt-{new_alert.id}",
        district_id=new_alert.zone_id,
        district_name=zone.name,
        level=new_alert.level,
        message=new_alert.message,
        source=f"{new_alert.created_by} (Manual Broadcast)",
        time="Just now",
        timestamp=new_alert.created_at.isoformat(),
        created_by=new_alert.created_by,
    )

@router.get("/zones/ranked")
def get_zones_ranked_by_risk(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Returns all 36 districts sorted by AI flood probability descending."""
    zones = db.query(Zone).all()
    ranked = []

    for z in zones:
        latest_pred = (
            db.query(Prediction)
            .filter(Prediction.zone_id == z.id, Prediction.horizon_hours == 24)
            .order_by(Prediction.created_at.desc())
            .first()
        )

        obs = get_zone_hydrology_observation(db, z)

        prob = latest_pred.probability if latest_pred else 0.20
        level = latest_pred.level if latest_pred else predictor.classify_level(prob)

        ranked.append({
            "id": z.id,
            "code": z.code,
            "name": z.name,
            "region": z.region,
            "probability": prob,
            "level": level,
            "rainfall_24h_mm": obs["rainfall"]["current_24h_mm"],
            "river_name": obs["river"]["name"],
            "river_current_m": obs["river"]["current_m"],
            "river_danger_m": obs["river"]["danger_level_m"],
            "elevation_m": z.elevation_m,
            "slope_deg": z.slope_deg,
            "past_flood_count": z.past_flood_count,
        })

    # Sort descending by probability
    ranked.sort(key=lambda x: x["probability"], reverse=True)
    return ranked

@router.post("/run-prediction")
async def trigger_prediction_pipeline(
    current_admin: User = Depends(get_current_admin),
):
    """Forces an immediate execution of the multi-zone hydrological prediction pipeline."""
    await run_prediction_pipeline()
    return {
        "status": "success",
        "message": "Prediction pipeline executed successfully across all 36 monitoring zones.",
        "executed_at": datetime.datetime.utcnow().isoformat(),
    }
