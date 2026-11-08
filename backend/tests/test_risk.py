import pytest

def test_whatif_changes_probability_monotonically(client):
    # Test Pune (#16) at 0mm, 30mm, 60mm, 100mm
    res_0 = client.post("/risk/whatif", json={"zone_id": 16, "extra_rain_mm": 0})
    assert res_0.status_code == 200
    p0 = res_0.json()["simulated_probability"]

    res_30 = client.post("/risk/whatif", json={"zone_id": 16, "extra_rain_mm": 30})
    assert res_30.status_code == 200
    p30 = res_30.json()["simulated_probability"]

    res_60 = client.post("/risk/whatif", json={"zone_id": 16, "extra_rain_mm": 60})
    assert res_60.status_code == 200
    p60 = res_60.json()["simulated_probability"]

    res_100 = client.post("/risk/whatif", json={"zone_id": 16, "extra_rain_mm": 100})
    assert res_100.status_code == 200
    p100 = res_100.json()["simulated_probability"]

    # Monotonicity check
    assert p0 <= p30 <= p60 <= p100, f"Expected monotonic growth: {p0} <= {p30} <= {p60} <= {p100}"
    assert p100 > p0, f"Expected risk to increase with 100mm extra rainfall: {p100} > {p0}"

def test_locate_nearest_district(client):
    # Coordinate near Kolhapur: 16.70, 74.24
    res = client.get("/risk/locate?lat=16.71&lon=74.25")
    assert res.status_code == 200
    data = res.json()
    assert "nearest_zone" in data
    assert data["nearest_zone"]["id"] == 1
    assert data["nearest_zone"]["name"] == "Kolhapur"
    assert data["distance_km"] < 10.0
