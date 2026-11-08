from typing import Optional, Any
from pydantic import BaseModel

class CurrentRiskBrief(BaseModel):
    probability: float
    level: str
    updated_at: str

class ZoneResponse(BaseModel):
    id: int
    code: str
    name: str
    region: str
    lat: float
    lon: float
    centroid_lat: float
    centroid_lon: float
    elevation_m: float
    slope_deg: float
    dist_to_river_m: float
    past_flood_count: int
    geometry: Optional[Any] = None
    current_risk: Optional[CurrentRiskBrief] = None

    class Config:
        from_attributes = True
