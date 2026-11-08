from typing import List, Optional, Any
from pydantic import BaseModel

class FactorItem(BaseModel):
    feature: str
    impact: str  # 'low' | 'moderate' | 'high' | 'severe'
    text: str
    weightPercent: Optional[int] = None

class ForecastItem(BaseModel):
    hours: str  # '24h', '48h', '72h'
    timeLabel: str
    probability: float
    level: str
    expectedRainfall_mm: Optional[int] = None

class RainfallTelemetry(BaseModel):
    current_24h_mm: float
    normal_24h_mm: float
    trend: str
    anomaly_ratio: float

class RiverTelemetry(BaseModel):
    name: str
    current_m: float
    warning_level_m: float
    danger_level_m: float
    status: str
    freeboard_m: float
    dam_discharge_cusec: int

class CurrentRisk(BaseModel):
    probability: float
    level: str
    updated_at: str

class ZoneRiskDetailResponse(BaseModel):
    id: int
    name: str
    region: str
    lat: float
    lon: float
    current_risk: CurrentRisk
    forecast: List[ForecastItem]
    factors: List[FactorItem]
    rainfall: RainfallTelemetry
    river: RiverTelemetry
    soil_saturation_pct: int
    is_stale: bool = False
    updated_at: str

class WhatIfRequest(BaseModel):
    zone_id: int
    extra_rain_mm: float

class WhatIfResponse(BaseModel):
    zone_id: int
    zone_name: str
    base_probability: float
    simulated_probability: float
    level: str
    added_rainfall_mm: float
    factors: List[FactorItem]
