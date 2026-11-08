import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    zone_id = Column(Integer, ForeignKey("zones.id", ondelete="CASCADE"), nullable=False, index=True)
    level = Column(String(32), nullable=False)   # 'low', 'moderate', 'high', 'severe'
    message = Column(Text, nullable=False)
    source = Column(String(32), nullable=False)  # 'model' | 'admin'
    created_by = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    zone = relationship("Zone", back_populates="alerts")

    __table_args__ = (
        Index("idx_alerts_zone_created", "zone_id", created_at.desc()),
    )
