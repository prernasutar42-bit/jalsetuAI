from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.models.alert import Alert
from backend.app.models.zone import Zone
from backend.app.schemas.alert import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

def format_time_ago(dt) -> str:
    import datetime
    now = datetime.datetime.utcnow()
    diff = now - dt
    mins = int(diff.total_seconds() / 60)
    if mins < 1:
        return "Just now"
    if mins < 60:
        return f"{mins} min ago"
    hours = mins // 60
    if hours < 24:
        return f"{hours} hr{'s' if hours > 1 else ''} ago"
    days = hours // 24
    return f"{days} day{'s' if days > 1 else ''} ago"

@router.get("", response_model=List[AlertResponse])
def get_alerts(
    zone_id: Optional[int] = Query(None, description="Filter by district zone ID"),
    district: Optional[str] = Query(None, description="Filter by district name or ID"),
    level: Optional[str] = Query(None, description="Filter by severity level"),
    db: Session = Depends(get_db),
):
    """Retrieves official early warning bulletin feed filtered by zone and severity."""
    query = db.query(Alert, Zone.name).join(Zone, Alert.zone_id == Zone.id)

    target_zone_id = zone_id
    if not target_zone_id and district and district.lower() != "all":
        try:
            target_zone_id = int(district)
        except ValueError:
            matched_zone = db.query(Zone).filter(Zone.name.ilike(district)).first()
            if matched_zone:
                target_zone_id = matched_zone.id

    if target_zone_id:
        query = query.filter(Alert.zone_id == target_zone_id)

    if level and level.lower() != "all":
        query = query.filter(Alert.level == level.lower())

    results = query.order_by(Alert.created_at.desc()).limit(100).all()

    alerts_out = []
    for alert, zone_name in results:
        alerts_out.append(
            AlertResponse(
                id=f"alt-{alert.id}",
                district_id=alert.zone_id,
                district_name=zone_name,
                level=alert.level,
                message=alert.message,
                source=f"{alert.created_by} ({alert.source})" if alert.created_by else f"FloodWatch Bulletin ({alert.source})",
                time=format_time_ago(alert.created_at),
                timestamp=alert.created_at.isoformat(),
                created_by=alert.created_by,
            )
        )

    return alerts_out
