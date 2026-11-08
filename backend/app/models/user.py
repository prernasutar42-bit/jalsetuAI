import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), nullable=False, default="citizen")  # 'citizen' | 'admin'
    home_zone_id = Column(Integer, ForeignKey("zones.id", ondelete="SET NULL"), nullable=True)
    email_alerts = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    home_zone = relationship("Zone", back_populates="users")
