import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.core.errors import (
    AppException,
    app_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from backend.app.models.zone import Zone
from backend.app.data.seed_zones import seed_database
from backend.app.services.predictor import predictor
from backend.app.services.scheduler import start_scheduler
from backend.app.routers import health, auth, zones, risk, alerts, admin

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing FloodWatch backend database tables...")
    Base.metadata.create_all(bind=engine)

    # Check if database needs seeding
    db = SessionLocal()
    try:
        zone_count = db.query(Zone).count()
        if zone_count < 36:
            logger.info("Database not fully seeded. Running initial seed for 36 districts...")
            seed_database()
    except Exception as e:
        logger.error(f"Error checking/seeding database: {e}")
    finally:
        db.close()

    # Load machine learning model bundle
    predictor.load_model()

    # Start APScheduler background jobs
    try:
        start_scheduler()
    except Exception as e:
        logger.warning(f"Could not start scheduler in current runtime context: {e}")

    yield
    # Shutdown actions
    logger.info("Shutting down JalSetuAI backend...")
    from backend.app.services.scheduler import stop_scheduler
    stop_scheduler()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="JalSetuAI: AI-Based Flood Prediction & Early Warning Decision-Support API for Maharashtra",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized Error Handlers: {"error": {"code": "...", "message": "..."}}
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Include Routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(zones.router)
app.include_router(risk.router)
app.include_router(alerts.router)
app.include_router(admin.router)
