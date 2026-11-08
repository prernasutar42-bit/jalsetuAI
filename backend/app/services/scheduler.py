"""
Background forecast scheduler using APScheduler.
Runs multi-zone prediction jobs periodically and once at startup without crashing.
"""

import asyncio
import logging
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from backend.app.core.config import settings
from backend.app.core.database import SessionLocal
from backend.app.models.zone import Zone
from backend.app.services.weather import fetch_weather_for_centroids
from backend.app.services.predictor import predictor
from backend.app.services.alerting import check_and_create_alert_for_zone

logger = logging.getLogger(__name__)

scheduler: Optional[AsyncIOScheduler] = None

async def run_prediction_pipeline():
    """
    Fetches real-time weather forecasts, runs model predictions for all 36 zones,
    saves predictions to the database, and issues alerts where thresholds are breached.
    """
    logger.info("Starting scheduled flood prediction pipeline...")
    db = SessionLocal()
    try:
        zones = db.query(Zone).all()
        if not zones:
            logger.warning("No zones found in database. Prediction pipeline skipped.")
            return

        # Fetch Open-Meteo weather batch
        weather_map = await fetch_weather_for_centroids(zones)

        if not predictor.is_model_ready():
            predictor.load_model()

        if not predictor.is_model_ready():
            logger.warning("Predictor model not available during scheduled run. Predictions skipped.")
            return

        for zone in zones:
            try:
                w_dict = weather_map.get(zone.id, {})
                pred_result = predictor.predict_for_zone(zone, w_dict)
                predictor.save_predictions_to_db(db, zone, pred_result)

                # Check automated alerting
                check_and_create_alert_for_zone(
                    db=db,
                    zone=zone,
                    probability=pred_result["probability"],
                    level=pred_result["level"],
                    top_factors=pred_result["factors"],
                )
            except Exception as e:
                logger.error(f"Error predicting for zone {zone.name} (#{zone.id}): {e}")

        logger.info("Scheduled flood prediction pipeline completed successfully.")

    except Exception as exc:
        logger.error(f"Scheduled prediction pipeline encountered unexpected error: {exc}")
    finally:
        db.close()

def start_scheduler():
    """Starts the background scheduler and registers periodic forecast job."""
    global scheduler
    stop_scheduler()

    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    scheduler = AsyncIOScheduler(event_loop=loop)
    interval = max(5, settings.PREDICTION_INTERVAL_MINUTES)
    scheduler.add_job(
        run_prediction_pipeline,
        "interval",
        minutes=interval,
        id="flood_prediction_job",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(f"APScheduler started: flood predictions scheduled every {interval} minutes.")

def stop_scheduler():
    """Shuts down background scheduler if active."""
    global scheduler
    if scheduler is not None and scheduler.running:
        try:
            scheduler.shutdown(wait=False)
        except Exception:
            pass
        scheduler = None
