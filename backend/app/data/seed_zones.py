"""
Seed script for FloodWatch Maharashtra.
Populates all 36 Maharashtra districts with centroids, regions, and static terrain features.

NOTE ON TERRAIN VALUES:
Static terrain values (elevation_m, slope_deg, dist_to_river_m, past_flood_count) are approximate
regional estimates calibrated against SRTM elevation profiles and Maharashtra State Disaster Management records.
These are marked as approximate in the system architecture and the ML model card.
"""

import sys
import os
import uuid
import datetime
from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.config import settings
from backend.app.core.security import get_password_hash
from backend.app.models.zone import Zone
from backend.app.models.user import User
from backend.app.models.observation import Observation
from backend.app.models.prediction import Prediction
from backend.app.models.alert import Alert

# 36 Maharashtra Districts dataset
DISTRICTS_SEED_DATA = [
    {
        "id": 1,
        "code": "KOL",
        "name": "Kolhapur",
        "region": "Western Maharashtra",
        "centroid_lat": 16.7050,
        "centroid_lon": 74.2433,
        "elevation_m": 569.0,      # Approximate static terrain elevation (m)
        "slope_deg": 4.5,          # Approximate mean terrain slope (deg)
        "dist_to_river_m": 850.0,  # Approximate distance to Panchganga River (m)
        "past_flood_count": 14,     # Historical severe flood occurrences
        "river_name": "Panchganga",
        "warning_m": 39.0,
        "danger_m": 43.0,
    },
    {
        "id": 2,
        "code": "RAT",
        "name": "Ratnagiri",
        "region": "Konkan",
        "centroid_lat": 16.9902,
        "centroid_lon": 73.3120,
        "elevation_m": 11.0,
        "slope_deg": 6.8,
        "dist_to_river_m": 1200.0,
        "past_flood_count": 12,
        "river_name": "Kajali",
        "warning_m": 16.5,
        "danger_m": 19.0,
    },
    {
        "id": 3,
        "code": "GAD",
        "name": "Gadchiroli",
        "region": "Vidarbha",
        "centroid_lat": 20.1809,
        "centroid_lon": 80.0036,
        "elevation_m": 217.0,
        "slope_deg": 2.1,
        "dist_to_river_m": 2400.0,
        "past_flood_count": 16,
        "river_name": "Wainganga & Pranhita",
        "warning_m": 146.0,
        "danger_m": 149.2,
    },
    {
        "id": 4,
        "code": "RAI",
        "name": "Raigad",
        "region": "Konkan",
        "centroid_lat": 18.5158,
        "centroid_lon": 73.1311,
        "elevation_m": 24.0,
        "slope_deg": 7.4,
        "dist_to_river_m": 600.0,
        "past_flood_count": 15,
        "river_name": "Kundalika & Amba",
        "warning_m": 22.0,
        "danger_m": 24.5,
    },
    {
        "id": 5,
        "code": "SIN",
        "name": "Sindhudurg",
        "region": "Konkan",
        "centroid_lat": 16.1158,
        "centroid_lon": 73.6934,
        "elevation_m": 18.0,
        "slope_deg": 6.2,
        "dist_to_river_m": 1100.0,
        "past_flood_count": 10,
        "river_name": "Terekhol & Karli",
        "warning_m": 11.2,
        "danger_m": 13.0,
    },
    {
        "id": 6,
        "code": "MUM_SUB",
        "name": "Mumbai Suburban",
        "region": "Konkan",
        "centroid_lat": 19.0760,
        "centroid_lon": 72.8777,
        "elevation_m": 8.0,
        "slope_deg": 1.2,
        "dist_to_river_m": 350.0,
        "past_flood_count": 18,
        "river_name": "Mithi & Poisar",
        "warning_m": 3.2,
        "danger_m": 4.2,
    },
    {
        "id": 7,
        "code": "CHA",
        "name": "Chandrapur",
        "region": "Vidarbha",
        "centroid_lat": 19.9615,
        "centroid_lon": 79.2961,
        "elevation_m": 189.0,
        "slope_deg": 2.0,
        "dist_to_river_m": 1500.0,
        "past_flood_count": 11,
        "river_name": "Erai & Wardha",
        "warning_m": 123.0,
        "danger_m": 126.0,
    },
    {
        "id": 8,
        "code": "MUM_CIT",
        "name": "Mumbai City",
        "region": "Konkan",
        "centroid_lat": 18.9388,
        "centroid_lon": 72.8354,
        "elevation_m": 6.0,
        "slope_deg": 0.8,
        "dist_to_river_m": 400.0,
        "past_flood_count": 17,
        "river_name": "Arabian Sea Coastal Outfalls",
        "warning_m": 3.0,
        "danger_m": 4.0,
    },
    {
        "id": 9,
        "code": "THA",
        "name": "Thane",
        "region": "Konkan",
        "centroid_lat": 19.2183,
        "centroid_lon": 72.9781,
        "elevation_m": 14.0,
        "slope_deg": 3.1,
        "dist_to_river_m": 900.0,
        "past_flood_count": 13,
        "river_name": "Ulhas",
        "warning_m": 15.5,
        "danger_m": 17.8,
    },
    {
        "id": 10,
        "code": "SAN",
        "name": "Sangli",
        "region": "Western Maharashtra",
        "centroid_lat": 16.8524,
        "centroid_lon": 74.5815,
        "elevation_m": 549.0,
        "slope_deg": 2.5,
        "dist_to_river_m": 700.0,
        "past_flood_count": 13,
        "river_name": "Krishna",
        "warning_m": 40.0,
        "danger_m": 45.0,
    },
    {
        "id": 11,
        "code": "PAL",
        "name": "Palghar",
        "region": "Konkan",
        "centroid_lat": 19.6967,
        "centroid_lon": 72.7699,
        "elevation_m": 12.0,
        "slope_deg": 4.2,
        "dist_to_river_m": 1600.0,
        "past_flood_count": 9,
        "river_name": "Vaitarna & Surya",
        "warning_m": 100.5,
        "danger_m": 104.0,
    },
    {
        "id": 12,
        "code": "SAT",
        "name": "Satara",
        "region": "Western Maharashtra",
        "centroid_lat": 17.6805,
        "centroid_lon": 73.9935,
        "elevation_m": 742.0,
        "slope_deg": 5.9,
        "dist_to_river_m": 1900.0,
        "past_flood_count": 11,
        "river_name": "Krishna & Venna",
        "warning_m": 576.0,
        "danger_m": 580.0,
    },
    {
        "id": 13,
        "code": "BHA",
        "name": "Bhandara",
        "region": "Vidarbha",
        "centroid_lat": 21.1711,
        "centroid_lon": 79.6548,
        "elevation_m": 255.0,
        "slope_deg": 1.8,
        "dist_to_river_m": 1200.0,
        "past_flood_count": 8,
        "river_name": "Wainganga",
        "warning_m": 243.0,
        "danger_m": 246.0,
    },
    {
        "id": 14,
        "code": "GON",
        "name": "Gondia",
        "region": "Vidarbha",
        "centroid_lat": 21.4554,
        "centroid_lon": 80.1961,
        "elevation_m": 300.0,
        "slope_deg": 2.4,
        "dist_to_river_m": 2800.0,
        "past_flood_count": 7,
        "river_name": "Wainganga & Bagh",
        "warning_m": 283.0,
        "danger_m": 286.0,
    },
    {
        "id": 15,
        "code": "NAS",
        "name": "Nashik",
        "region": "North Maharashtra",
        "centroid_lat": 19.9975,
        "centroid_lon": 73.7898,
        "elevation_m": 600.0,
        "slope_deg": 3.8,
        "dist_to_river_m": 800.0,
        "past_flood_count": 9,
        "river_name": "Godavari",
        "warning_m": 563.5,
        "danger_m": 567.0,
    },
    {
        "id": 16,
        "code": "PUN",
        "name": "Pune",
        "region": "Western Maharashtra",
        "centroid_lat": 18.5204,
        "centroid_lon": 73.8567,
        "elevation_m": 560.0,
        "slope_deg": 3.2,
        "dist_to_river_m": 950.0,
        "past_flood_count": 8,
        "river_name": "Mula-Mutha",
        "warning_m": 537.5,
        "danger_m": 541.0,
    },
    {
        "id": 17,
        "code": "NAG",
        "name": "Nagpur",
        "region": "Vidarbha",
        "centroid_lat": 21.1458,
        "centroid_lon": 79.0882,
        "elevation_m": 310.0,
        "slope_deg": 1.7,
        "dist_to_river_m": 1800.0,
        "past_flood_count": 6,
        "river_name": "Nag & Pili",
        "warning_m": 307.5,
        "danger_m": 310.5,
    },
    {
        "id": 18,
        "code": "YAV",
        "name": "Yavatmal",
        "region": "Vidarbha",
        "centroid_lat": 20.3888,
        "centroid_lon": 78.1204,
        "elevation_m": 445.0,
        "slope_deg": 2.2,
        "dist_to_river_m": 3100.0,
        "past_flood_count": 5,
        "river_name": "Penganga & Wardha",
        "warning_m": 230.5,
        "danger_m": 234.0,
    },
    {
        "id": 19,
        "code": "NAN",
        "name": "Nandurbar",
        "region": "North Maharashtra",
        "centroid_lat": 21.3683,
        "centroid_lon": 74.2407,
        "elevation_m": 210.0,
        "slope_deg": 4.1,
        "dist_to_river_m": 2200.0,
        "past_flood_count": 5,
        "river_name": "Tapi & Narmada",
        "warning_m": 131.0,
        "danger_m": 135.0,
    },
    {
        "id": 20,
        "code": "WAR",
        "name": "Wardha",
        "region": "Vidarbha",
        "centroid_lat": 20.7453,
        "centroid_lon": 78.6022,
        "elevation_m": 234.0,
        "slope_deg": 1.5,
        "dist_to_river_m": 2500.0,
        "past_flood_count": 5,
        "river_name": "Wardha & Yashoda",
        "warning_m": 213.0,
        "danger_m": 217.0,
    },
    {
        "id": 21,
        "code": "AMR",
        "name": "Amravati",
        "region": "Vidarbha",
        "centroid_lat": 20.9320,
        "centroid_lon": 77.7523,
        "elevation_m": 343.0,
        "slope_deg": 2.1,
        "dist_to_river_m": 2700.0,
        "past_flood_count": 4,
        "river_name": "Purna & Pedhi",
        "warning_m": 311.0,
        "danger_m": 315.0,
    },
    {
        "id": 22,
        "code": "AKO",
        "name": "Akola",
        "region": "Vidarbha",
        "centroid_lat": 20.7002,
        "centroid_lon": 77.0082,
        "elevation_m": 282.0,
        "slope_deg": 1.3,
        "dist_to_river_m": 1300.0,
        "past_flood_count": 4,
        "river_name": "Morna & Purna",
        "warning_m": 278.0,
        "danger_m": 282.0,
    },
    {
        "id": 23,
        "code": "WAS",
        "name": "Washim",
        "region": "Vidarbha",
        "centroid_lat": 20.1112,
        "centroid_lon": 77.1352,
        "elevation_m": 546.0,
        "slope_deg": 1.4,
        "dist_to_river_m": 3400.0,
        "past_flood_count": 3,
        "river_name": "Penganga",
        "warning_m": 540.5,
        "danger_m": 544.0,
    },
    {
        "id": 24,
        "code": "BUL",
        "name": "Buldhana",
        "region": "Vidarbha",
        "centroid_lat": 20.5292,
        "centroid_lon": 76.1843,
        "elevation_m": 639.0,
        "slope_deg": 2.6,
        "dist_to_river_m": 3900.0,
        "past_flood_count": 3,
        "river_name": "Penganga & Nalganga",
        "warning_m": 620.0,
        "danger_m": 625.0,
    },
    {
        "id": 25,
        "code": "JAL_NM",
        "name": "Jalgaon",
        "region": "North Maharashtra",
        "centroid_lat": 21.0077,
        "centroid_lon": 75.5626,
        "elevation_m": 209.0,
        "slope_deg": 1.9,
        "dist_to_river_m": 1700.0,
        "past_flood_count": 4,
        "river_name": "Girna & Tapi",
        "warning_m": 202.5,
        "danger_m": 206.5,
    },
    {
        "id": 26,
        "code": "DHU",
        "name": "Dhule",
        "region": "North Maharashtra",
        "centroid_lat": 20.9042,
        "centroid_lon": 74.7749,
        "elevation_m": 250.0,
        "slope_deg": 2.1,
        "dist_to_river_m": 1400.0,
        "past_flood_count": 3,
        "river_name": "Panjhara",
        "warning_m": 247.0,
        "danger_m": 251.0,
    },
    {
        "id": 27,
        "code": "AHI",
        "name": "Ahilyanagar",
        "region": "North Maharashtra",
        "centroid_lat": 19.0948,
        "centroid_lon": 74.7480,
        "elevation_m": 649.0,
        "slope_deg": 2.0,
        "dist_to_river_m": 2100.0,
        "past_flood_count": 3,
        "river_name": "Pravara & Mula",
        "warning_m": 640.0,
        "danger_m": 645.0,
    },
    {
        "id": 28,
        "code": "SOL",
        "name": "Solapur",
        "region": "Western Maharashtra",
        "centroid_lat": 17.6599,
        "centroid_lon": 75.9064,
        "elevation_m": 458.0,
        "slope_deg": 1.2,
        "dist_to_river_m": 3200.0,
        "past_flood_count": 4,
        "river_name": "Bhima & Sina",
        "warning_m": 450.0,
        "danger_m": 455.0,
    },
    {
        "id": 29,
        "code": "NDE",
        "name": "Nanded",
        "region": "Marathwada",
        "centroid_lat": 19.1383,
        "centroid_lon": 77.3210,
        "elevation_m": 362.0,
        "slope_deg": 1.4,
        "dist_to_river_m": 1100.0,
        "past_flood_count": 4,
        "river_name": "Godavari",
        "warning_m": 346.5,
        "danger_m": 351.0,
    },
    {
        "id": 30,
        "code": "HIN",
        "name": "Hingoli",
        "region": "Marathwada",
        "centroid_lat": 19.7183,
        "centroid_lon": 77.1481,
        "elevation_m": 457.0,
        "slope_deg": 1.5,
        "dist_to_river_m": 2600.0,
        "past_flood_count": 3,
        "river_name": "Kayadhu",
        "warning_m": 450.5,
        "danger_m": 454.0,
    },
    {
        "id": 31,
        "code": "PAR",
        "name": "Parbhani",
        "region": "Marathwada",
        "centroid_lat": 19.2686,
        "centroid_lon": 76.7719,
        "elevation_m": 407.0,
        "slope_deg": 1.1,
        "dist_to_river_m": 2300.0,
        "past_flood_count": 3,
        "river_name": "Godavari & Dudhana",
        "warning_m": 396.0,
        "danger_m": 401.0,
    },
    {
        "id": 32,
        "code": "CSN",
        "name": "Chhatrapati Sambhajinagar",
        "region": "Marathwada",
        "centroid_lat": 19.8762,
        "centroid_lon": 75.3433,
        "elevation_m": 583.0,
        "slope_deg": 2.3,
        "dist_to_river_m": 2900.0,
        "past_flood_count": 3,
        "river_name": "Kham & Godavari",
        "warning_m": 572.0,
        "danger_m": 577.0,
    },
    {
        "id": 33,
        "code": "BEE",
        "name": "Beed",
        "region": "Marathwada",
        "centroid_lat": 18.9891,
        "centroid_lon": 75.7601,
        "elevation_m": 530.0,
        "slope_deg": 1.6,
        "dist_to_river_m": 3100.0,
        "past_flood_count": 2,
        "river_name": "Bindusara & Sindphana",
        "warning_m": 510.0,
        "danger_m": 515.0,
    },
    {
        "id": 34,
        "code": "LAT",
        "name": "Latur",
        "region": "Marathwada",
        "centroid_lat": 18.4088,
        "centroid_lon": 76.5604,
        "elevation_m": 631.0,
        "slope_deg": 1.3,
        "dist_to_river_m": 3800.0,
        "past_flood_count": 2,
        "river_name": "Manjara",
        "warning_m": 622.0,
        "danger_m": 627.0,
    },
    {
        "id": 35,
        "code": "JAL_MA",
        "name": "Jalna",
        "region": "Marathwada",
        "centroid_lat": 19.8347,
        "centroid_lon": 75.8816,
        "elevation_m": 508.0,
        "slope_deg": 1.2,
        "dist_to_river_m": 2900.0,
        "past_flood_count": 2,
        "river_name": "Kundalika & Dudhana",
        "warning_m": 502.0,
        "danger_m": 507.0,
    },
    {
        "id": 36,
        "code": "DHA",
        "name": "Dharashiv",
        "region": "Marathwada",
        "centroid_lat": 18.1856,
        "centroid_lon": 76.0419,
        "elevation_m": 653.0,
        "slope_deg": 1.2,
        "dist_to_river_m": 4200.0,
        "past_flood_count": 2,
        "river_name": "Terna & Sina",
        "warning_m": 646.0,
        "danger_m": 651.0,
    },
]

def seed_database():
    """Initializes tables and seeds zones, observations, predictions, alerts, and admin account."""
    print("Creating tables if they do not exist...")
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        # 1. Seed Zones
        print(f"Seeding {len(DISTRICTS_SEED_DATA)} Maharashtra districts...")
        for data in DISTRICTS_SEED_DATA:
            existing_zone = db.query(Zone).filter(Zone.id == data["id"]).first()
            if not existing_zone:
                zone = Zone(
                    id=data["id"],
                    code=data["code"],
                    name=data["name"],
                    region=data["region"],
                    centroid_lat=data["centroid_lat"],
                    centroid_lon=data["centroid_lon"],
                    elevation_m=data["elevation_m"],
                    slope_deg=data["slope_deg"],
                    dist_to_river_m=data["dist_to_river_m"],
                    past_flood_count=data["past_flood_count"],
                    geometry=None,
                )
                db.add(zone)
            else:
                existing_zone.code = data["code"]
                existing_zone.name = data["name"]
                existing_zone.region = data["region"]
                existing_zone.centroid_lat = data["centroid_lat"]
                existing_zone.centroid_lon = data["centroid_lon"]
                existing_zone.elevation_m = data["elevation_m"]
                existing_zone.slope_deg = data["slope_deg"]
                existing_zone.dist_to_river_m = data["dist_to_river_m"]
                existing_zone.past_flood_count = data["past_flood_count"]
        db.commit()

        # 2. Seed Admin user from settings
        admin_email = settings.ADMIN_EMAIL.strip().lower()
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            print(f"Seeding admin user: {admin_email}")
            admin_user = User(
                id=f"usr-{uuid.uuid4().hex[:12]}",
                name="Disaster Management Official",
                email=admin_email,
                password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                role="admin",
                home_zone_id=1,  # Kolhapur
                email_alerts=True,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(admin_user)
            db.commit()

        # Seed citizen demo user
        citizen_email = "citizen@floodwatch.test"
        citizen_user = db.query(User).filter(User.email == citizen_email).first()
        if not citizen_user:
            print(f"Seeding citizen user: {citizen_email}")
            citizen_user = User(
                id=f"usr-{uuid.uuid4().hex[:12]}",
                name="Ramesh Patil",
                email=citizen_email,
                password_hash=get_password_hash("Citizen@123"),
                role="citizen",
                home_zone_id=1,
                email_alerts=False,
                created_at=datetime.datetime.utcnow(),
            )
            db.add(citizen_user)
            db.commit()

        # 3. Seed initial baseline observations, predictions and alerts if empty
        if db.query(Prediction).count() == 0:
            print("Seeding baseline predictions and observations...")
            now = datetime.datetime.utcnow()
            for zone_meta in DISTRICTS_SEED_DATA:
                z_id = zone_meta["id"]
                prob_base = 0.88 if z_id in [1, 2, 3, 4] else (0.75 if z_id in [5, 6, 7, 8, 9, 10] else (0.45 if z_id < 20 else 0.18))
                level = "severe" if prob_base >= 0.75 else ("high" if prob_base >= 0.5 else ("moderate" if prob_base >= 0.25 else "low"))

                obs = Observation(
                    zone_id=z_id,
                    timestamp=now,
                    rainfall_1h_mm=8.5 if prob_base > 0.6 else 1.2,
                    rainfall_24h_mm=162.0 if prob_base > 0.7 else (65.0 if prob_base > 0.4 else 15.0),
                    river_level_m=zone_meta["warning_m"] + (1.2 if prob_base > 0.7 else -1.5),
                    river_status="warning" if prob_base > 0.6 else "normal",
                    is_stale=False,
                )
                db.add(obs)

                factors = [
                    {
                        "feature": "Precipitation volume",
                        "impact": "high" if prob_base > 0.6 else "low",
                        "text": f"24 h precipitation intensity is elevated above seasonal baseline.",
                        "weightPercent": 42,
                    },
                    {
                        "feature": "River stage & proximity",
                        "impact": "high" if prob_base > 0.6 else "moderate",
                        "text": f"{zone_meta['river_name']} level is approaching warning threshold.",
                        "weightPercent": 33,
                    },
                    {
                        "feature": "Catchment terrain saturation",
                        "impact": "moderate" if prob_base > 0.4 else "low",
                        "text": f"Terrain slope ({zone_meta['slope_deg']}°) and low elevation ({zone_meta['elevation_m']}m) promote surface runoff pooling.",
                        "weightPercent": 25,
                    },
                ]

                # Predictions for 24h, 48h, 72h
                for h in [24, 48, 72]:
                    h_prob = max(0.05, min(0.98, prob_base - (0.05 if h == 48 else (0.12 if h == 72 else 0.0))))
                    h_level = "severe" if h_prob >= 0.75 else ("high" if h_prob >= 0.5 else ("moderate" if h_prob >= 0.25 else "low"))
                    pred = Prediction(
                        zone_id=z_id,
                        horizon_hours=h,
                        probability=round(h_prob, 2),
                        level=h_level,
                        factors=factors,
                        created_at=now,
                    )
                    db.add(pred)

            db.commit()

        # Seed initial alerts if empty
        if db.query(Alert).count() == 0:
            print("Seeding initial alerts...")
            now = datetime.datetime.utcnow()
            alerts_data = [
                (1, "severe", "High flood risk in Kolhapur until 6 am. Move vehicles to higher ground. Radhanagari dam discharge active at 48,500 cusecs.", "admin", "District Disaster Officer"),
                (3, "severe", "Wainganga backwaters flooding low causeways. Bhamragad taluka road access temporarily restricted.", "model", "FloodWatch Autonomous Forecast"),
                (2, "severe", "Kajali river nearing critical threshold at Mirya creek. Fishermen and coastal residents advised to secure marine vessels.", "model", "FloodWatch Autonomous Forecast"),
                (4, "high", "Kundalika river discharge elevated near Roha. Avoid non-essential vehicular movement along low-lying river bank bypasses.", "admin", "Sub-Divisional Magistrate"),
            ]
            for zid, lvl, msg, src, author in alerts_data:
                alert = Alert(
                    zone_id=zid,
                    level=lvl,
                    message=msg,
                    source=src,
                    created_by=author,
                    created_at=now - datetime.timedelta(minutes=15 * zid),
                )
                db.add(alert)
            db.commit()

        print("Database seed completed successfully.")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
