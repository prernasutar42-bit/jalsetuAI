from sqlalchemy import Column, Integer, String, Float, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Zone(Base):
    __tablename__ = "zones"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(16), unique=True, nullable=False, index=True)
    name = Column(String(128), nullable=False, index=True)
    region = Column(String(64), nullable=False, index=True)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    elevation_m = Column(Float, nullable=False)        # Approximate static terrain elevation
    slope_deg = Column(Float, nullable=False)          # Approximate mean terrain slope
    dist_to_river_m = Column(Float, nullable=False)    # Approximate distance to nearest river
    past_flood_count = Column(Integer, nullable=False, default=0)
    geometry = Column(JSON, nullable=True)             # District GeoJSON polygon if available

    users = relationship("User", back_populates="home_zone")
    observations = relationship("Observation", back_populates="zone", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="zone", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="zone", cascade="all, delete-orphan")
