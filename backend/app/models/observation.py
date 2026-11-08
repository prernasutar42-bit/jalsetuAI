import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    rainfall_1h_mm = Column(Float, nullable=False, default=0.0)
    rainfall_24h_mm = Column(Float, nullable=False, default=0.0)
    river_level_m = Column(Float, nullable=True)
    river_status = Column(String(32), default="normal")
    is_stale = Column(Boolean, nullable=False, default=False)

    zone = relationship("Zone", back_populates="observations")

    __table_args__ = (
        Index("idx_observations_zone_timestamp", "zone_id", timestamp.desc()),
    )
