import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    PROJECT_NAME: str = "JalSetuAI Maharashtra Backend"
    ENVIRONMENT: str = "development"

    # Database: Supabase PostgreSQL (e.g. postgresql+psycopg://...) or fallback SQLite
    DATABASE_URL: str = ""

    # JWT Authentication
    JWT_SECRET: str = "super-secret-floodwatch-key-change-in-prod-123456"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Machine Learning Model
    MODEL_PATH: str = "ml/models/flood_model.joblib"

    # Scheduler and Alerting
    PREDICTION_INTERVAL_MINUTES: int = 30
    ALERT_THRESHOLD: float = 0.75
    ALERT_EMAIL_ENABLED: bool = False
    SMTP_HOST: str = "localhost"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    ALERT_FROM_EMAIL: str = "alerts@floodwatch.maharashtra.gov.in"

    # CORS settings
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    # Admin seed credentials
    ADMIN_EMAIL: str = "admin@floodwatch.test"
    ADMIN_PASSWORD: str = "Admin@123"

    @property
    def effective_database_url(self) -> str:
        url = self.DATABASE_URL.strip()
        if not url:
            return "sqlite:///./floodwatch.db"
        # If url starts with postgres://, replace with postgresql+psycopg:// for SQLAlchemy 2
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+psycopg://"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

settings = Settings()
