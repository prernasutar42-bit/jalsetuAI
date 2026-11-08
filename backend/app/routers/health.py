import datetime
from fastapi import APIRouter
from backend.app.services.predictor import predictor

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "JalSetuAI Maharashtra API",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "model_loaded": predictor.is_model_ready(),
    }
