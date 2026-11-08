import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Point to SQLite test database before importing app
os.environ["DATABASE_URL"] = "sqlite:///./test_floodwatch.db"
os.environ["ADMIN_EMAIL"] = "admin@floodwatch.test"
os.environ["ADMIN_PASSWORD"] = "Admin@123"

from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.data.seed_zones import seed_database
from backend.app.services.predictor import predictor

TEST_DATABASE_URL = "sqlite:///./test_floodwatch.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    seed_database()
    predictor.load_model()
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_floodwatch.db"):
        try:
            os.remove("./test_floodwatch.db")
        except Exception:
            pass

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def admin_token(client):
    resp = client.post("/auth/login", json={"email": "admin@floodwatch.test", "password": "Admin@123"})
    return resp.json()["token"]

@pytest.fixture
def citizen_token(client):
    resp = client.post("/auth/login", json={"email": "citizen@floodwatch.test", "password": "Citizen@123"})
    return resp.json()["token"]
