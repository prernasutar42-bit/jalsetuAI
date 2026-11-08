import datetime
from sqlalchemy import Column, Integer, Float, String, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    horizon_hours = Column(Integer, nullable=False)  # 24, 48, 72
    probability = Column(Float, nullable=False)      # 0.0 to 1.0
    level = Column(String(32), nullable=False)       # 'low', 'moderate', 'high', 'severe'
    factors = Column(JSON, nullable=False)           # list of plain-language factors with impact and weights
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    zone = relationship("Zone", back_populates="predictions")

    __table_args__ = (
        Index("idx_predictions_zone_created", "zone_id", created_at.desc()),
    )
