import pytest

def test_register_success(client):
    res = client.post("/auth/register", json={
        "name": "Test Citizen",
        "email": "newcitizen@test.com",
        "password": "Password@123",
        "role": "citizen",
        "district_id": 1,
    })
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["email"] == "newcitizen@test.com"
    assert data["user"]["role"] == "citizen"

def test_login_success(client):
    res = client.post("/auth/login", json={
        "email": "admin@floodwatch.test",
        "password": "Admin@123",
    })
    assert res.status_code == 200
    data = res.json()
    assert "token" in data
    assert data["user"]["role"] == "admin"

def test_login_wrong_password(client):
    res = client.post("/auth/login", json={
        "email": "admin@floodwatch.test",
        "password": "WrongPassword999",
    })
    assert res.status_code == 401
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "INVALID_CREDENTIALS"

def test_protected_route_unauthorized(client):
    # Without Bearer token
    res = client.get("/auth/me")
    assert res.status_code == 401
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "UNAUTHORIZED"

def test_admin_only_route_forbidden_for_citizen(client, citizen_token):
    res = client.get("/admin/zones/ranked", headers={"Authorization": f"Bearer {citizen_token}"})
    assert res.status_code == 403
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "FORBIDDEN"

def test_admin_only_route_success_for_admin(client, admin_token):
    res = client.get("/admin/zones/ranked", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 36
