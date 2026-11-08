"""
Script to import simplified GeoJSON polygon boundaries into zones.geometry.
Reads backend/app/data/maharashtra_districts.geojson and maps features to database zones.
"""

import os
import json
import logging
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.zone import Zone

logger = logging.getLogger(__name__)

GEOJSON_FILE = os.path.join(os.path.dirname(__file__), "maharashtra_districts.geojson")

NAME_ALIASES = {
    "aurangabad": "chhatrapati sambhajinagar",
    "osmanabad": "dharashiv",
    "ahmednagar": "ahilyanagar",
    "mumbai": "mumbai city",
    "bombay": "mumbai city",
    "mumbai suburban": "mumbai suburban",
    "kolhapur": "kolhapur",
    "pune": "pune",
}

def seed_simplified_geojson():
    if not os.path.exists(GEOJSON_FILE):
        print(f"GeoJSON file not found at: {GEOJSON_FILE}")
        print("See backend/app/data/README.md for instructions on downloading Maharashtra district boundaries.")
        return

    print(f"Loading GeoJSON from {GEOJSON_FILE}...")
    with open(GEOJSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data.get("features", [])
    if not features:
        print("No features found in GeoJSON file.")
        return

    db: Session = SessionLocal()
    try:
        zones = db.query(Zone).all()
        zone_by_name = {z.name.lower(): z for z in zones}

        updated_count = 0
        for feat in features:
            props = feat.get("properties", {})
            geom = feat.get("geometry", {})
            raw_name = (
                props.get("district")
                or props.get("DISTRICT")
                or props.get("name")
                or props.get("NAME")
                or props.get("dtname")
                or ""
            ).lower().strip()

            target_name = NAME_ALIASES.get(raw_name, raw_name)
            zone = zone_by_name.get(target_name)

            if not zone:
                # Substring matching
                for z_name, z in zone_by_name.items():
                    if z_name in target_name or target_name in z_name:
                        zone = z
                        break

            if zone and geom:
                zone.geometry = geom
                updated_count += 1
                print(f"Mapped polygon geometry for zone #{zone.id}: {zone.name}")

        db.commit()
        print(f"Successfully seeded geometry for {updated_count} / {len(zones)} zones.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_simplified_geojson()
