import pytest

def test_zones_returns_36_zones(client):
    res = client.get("/zones")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 36
    # Verify zone fields
    z1 = data[0]
    assert "id" in z1
    assert "name" in z1
    assert "region" in z1
    assert "current_risk" in z1
    assert "probability" in z1["current_risk"]

def test_zone_risk_returns_3_forecast_items(client):
    res = client.get("/zones/1/risk")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1
    assert "forecast" in data
    assert len(data["forecast"]) == 3
    # Check 24h, 48h, 72h
    horizons = [f["hours"] for f in data["forecast"]]
    assert "24h" in horizons
    assert "48h" in horizons
    assert "72h" in horizons
    # Check factors
    assert "factors" in data
    assert len(data["factors"]) >= 1
    assert "rainfall" in data
    assert "river" in data
