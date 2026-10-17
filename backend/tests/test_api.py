"""Backend tests for KisanDhan FastAPI services."""
import json
import os
import sys
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient

# Ensure backend is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from backend.main import app

client = TestClient(app)

# Load worked example fixture
FIXTURE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "fixtures", "worked_example.json"
)
with open(FIXTURE_PATH, "r") as f:
    FIXTURE = json.load(f)


class TestWorkedExample:
    """Test the worked example: Gurpreet, 8 acres paddy, buyer at 25 km, Rs 180/q."""

    def test_estimate_straw(self):
        resp = client.post("/estimate", json={"crop": "paddy", "area_acres": 8})
        assert resp.status_code == 200
        data = resp.json()
        assert data["straw_q"] == FIXTURE["straw_q"]  # 216
        assert data["tonnes"] == FIXTURE["tonnes"]  # 21.6

    def test_waterfall_sums_to_gross(self):
        from backend.services.estimator import waterfall
        wf = waterfall(
            straw_q=FIXTURE["straw_q"],
            price_per_q=FIXTURE["input"]["buyer_price_per_q"],
            distance_km=FIXTURE["input"]["buyer_distance_km"],
            area_acres=FIXTURE["input"]["area_acres"],
        )
        # Verify each field
        assert wf["gross"] == FIXTURE["gross"]  # 38880
        assert wf["baling"] == FIXTURE["baling"]  # 9720
        assert wf["transport"] == FIXTURE["transport"]  # 1350
        assert wf["net_sale"] == FIXTURE["net_sale"]  # 27810
        assert wf["farmer_share"] == FIXTURE["farmer_share"]  # 8343
        assert wf["operator_share"] == FIXTURE["operator_share"]  # 19467
        assert wf["incentive"] == FIXTURE["incentive"]  # 9600
        assert wf["farmer_net"] == FIXTURE["farmer_net"]  # 17943
        # Waterfall must sum: baling + transport + farmer_share + operator_share = gross
        assert wf["baling"] + wf["transport"] + wf["farmer_share"] + wf["operator_share"] == wf["gross"]

    def test_farmer_share_plus_operator_share_equals_net_sale(self):
        from backend.services.estimator import waterfall
        wf = waterfall(216, 180, 25, 8)
        assert wf["farmer_share"] + wf["operator_share"] == wf["net_sale"]


class TestDaysLeft:
    def test_days_left_12(self):
        from backend.services.scheduler import days_left
        # Sample: harvest 2026-10-17, deadline 2026-10-29 = 12 days
        dl = days_left("2026-10-17", "2026-10-29")
        assert dl == 12

    def test_days_left_zero_past_deadline(self):
        from backend.services.scheduler import days_left
        dl = days_left("2026-10-29", "2026-10-17")
        assert dl == 0


class TestRainMovesPickup:
    def test_rain_day_moves_pickup(self):
        from backend.services.scheduler import earliest_pickup
        forecast_days = [
            {"date": "2026-10-17", "rain_mm": 0, "rain_prob": 10, "blocked": False},
            {"date": "2026-10-18", "rain_mm": 8.5, "rain_prob": 85, "blocked": True},
            {"date": "2026-10-19", "rain_mm": 0, "rain_prob": 15, "blocked": True},  # drying buffer
            {"date": "2026-10-20", "rain_mm": 0, "rain_prob": 5, "blocked": False},
        ]
        # Harvest is 2026-10-18 (rain day) -> should move to 2026-10-20
        pickup = earliest_pickup("2026-10-18", forecast_days)
        assert pickup == "2026-10-20"


class TestInfeasibleDeadline:
    def test_infeasible_gives_reason(self):
        resp = client.post("/plan", json={
            "crop": "paddy",
            "area_acres": 8,
            "village": "Machhiwara",
            "harvest_date": "2026-10-29",
            "sowing_deadline": "2026-10-17",  # deadline before harvest
        })
        assert resp.status_code == 200
        data = resp.json()
        # At least one option should be infeasible with a reason
        infeasible = [o for o in data["options"] if not o["feasible"]]
        assert len(infeasible) > 0
        for o in infeasible:
            assert o["reason"]  # must have a reason string


class TestLots:
    def test_lots_at_least_3(self):
        resp = client.get("/lots")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["lots"]) >= 3

    def test_lots_have_route_order(self):
        resp = client.get("/lots")
        data = resp.json()
        for lot in data["lots"]:
            assert "route" in lot
            assert len(lot["route"]) >= 1
            # Each route stop has lat/lng
            for stop in lot["route"]:
                assert "lat" in stop
                assert "lng" in stop


class TestFallbacks:
    def test_forecast_fallback_on_failure(self):
        """When network call fails, should return sample data."""
        import backend.services.scheduler as sched
        # Clear cache
        sched._forecast_cache.clear()
        
        with patch("httpx.AsyncClient.get", side_effect=Exception("Network error")):
            import asyncio
            result = asyncio.get_event_loop().run_until_complete(
                sched.fetch_forecast(30.9, 75.85)
            )
            assert result["source"] == "sample"
            assert len(result["days"]) > 0

    def test_hotspots_fallback_on_failure(self):
        """When FIRMS call fails, should return sample data."""
        import backend.services.hotspots as hs
        hs._hotspot_cache = {"data": None, "ts": 0}
        
        with patch("httpx.AsyncClient.get", side_effect=Exception("Network error")):
            import asyncio
            result = asyncio.get_event_loop().run_until_complete(
                hs.fetch_hotspots(1, "fake-key")
            )
            assert result["source"] == "sample"
            assert len(result["points"]) > 0


class TestHealthAndEndpoints:
    def test_health(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    def test_estimate(self):
        resp = client.post("/estimate", json={"crop": "paddy", "area_acres": 8})
        assert resp.status_code == 200

    def test_supply(self):
        resp = client.get("/supply")
        assert resp.status_code == 200
        assert "villages" in resp.json()

    def test_operators(self):
        resp = client.get("/operators")
        assert resp.status_code == 200
        assert "operators" in resp.json()

    def test_storage_sites(self):
        resp = client.get("/storage-sites")
        assert resp.status_code == 200
        assert "storage_sites" in resp.json()

    def test_book(self):
        resp = client.post("/book", json={
            "plan_option_id": "opt1",
            "farmer_name": "Test Farmer",
            "village": "Machhiwara",
            "date": "2026-10-20",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "confirmed"
        assert data["reference"]

    def test_input_validation_acres(self):
        resp = client.post("/estimate", json={"crop": "paddy", "area_acres": 0.1})
        assert resp.status_code == 422  # validation error

        resp = client.post("/estimate", json={"crop": "paddy", "area_acres": 300})
        assert resp.status_code == 422
