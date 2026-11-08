FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=8000

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements_core.txt backend/requirements_core.txt
COPY backend/requirements.txt backend/requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements_core.txt click email-validator "bcrypt<4.1.0" "uvicorn[standard]" starlette --no-deps xgboost

COPY backend/ backend/
COPY ml/models/ ml/models/
COPY ml/src/ ml/src/
COPY pytest.ini pytest.ini

# Seed initial database
RUN python -m backend.app.data.seed_zones

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]
