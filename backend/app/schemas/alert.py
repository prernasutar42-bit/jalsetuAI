from typing import Optional
from pydantic import BaseModel

class AlertResponse(BaseModel):
    id: str
    district_id: int
    district_name: str
    level: str
    message: str
    source: str
    time: str
    timestamp: str
    created_by: Optional[str] = None

    class Config:
        from_attributes = True

class AlertCreateRequest(BaseModel):
    district_id: int
    district_name: Optional[str] = None
    level: str
    message: str
