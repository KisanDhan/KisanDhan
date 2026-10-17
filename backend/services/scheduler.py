"""Scheduler service: forecast and day blocking."""
import httpx
import os
import time
from datetime import datetime, timedelta
from .estimator import get_config, get_forecast_sample

_forecast_cache: dict = {}
_CACHE_TTL = 1800  # 30 minutes


async def fetch_forecast(lat: float, lon: float, force_demo_rain: bool = False) -> dict:
    """Fetch 10-day forecast from Open-Meteo or return sample."""
    cache_key = f"{lat:.2f},{lon:.2f}"
    now = time.time()
    
    if cache_key in _forecast_cache and (now - _forecast_cache[cache_key]["ts"]) < _CACHE_TTL:
        cached = _forecast_cache[cache_key]["data"]
        if force_demo_rain:
            return _ensure_rain(cached)
        return cached

    cfg = get_config()
    rain_mm_threshold = cfg["rain_threshold_mm"]["value"]
    rain_prob_threshold = cfg["rain_prob_threshold"]["value"]
    rain_buffer = cfg["rain_buffer_days"]["value"]

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={lat}&longitude={lon}"
            f"&daily=precipitation_sum,precipitation_probability_max"
            f"&timezone=Asia%2FKolkata"
            f"&forecast_days=10"
        )
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

        dates = data["daily"]["time"]
        precip = data["daily"]["precipitation_sum"]
        prob = data["daily"]["precipitation_probability_max"]

        days = []
        for i in range(len(dates)):
            rain = precip[i] if precip[i] is not None else 0
            p = prob[i] if prob[i] is not None else 0
            blocked = rain >= rain_mm_threshold or p >= rain_prob_threshold
            days.append({
                "date": dates[i],
                "rain_mm": rain,
                "rain_prob": p,
                "blocked": blocked,
            })

        # Apply drying buffer: day after rain is also blocked
        for i in range(len(days)):
            if days[i]["blocked"] and days[i]["rain_mm"] >= rain_mm_threshold:
                for j in range(1, rain_buffer + 1):
                    if i + j < len(days) and not days[i + j]["blocked"]:
                        days[i + j]["blocked"] = True

        result = {"days": days, "source": "live"}
        _forecast_cache[cache_key] = {"data": result, "ts": now}
        
        if force_demo_rain:
            return _ensure_rain(result)
        return result

    except Exception as e:
        print(f"Forecast fetch failed, using sample: {e}")
        sample = get_forecast_sample()
        if force_demo_rain:
            return _ensure_rain(sample)
        return sample


def _ensure_rain(forecast: dict) -> dict:
    """Ensure at least one blocked day for demo purposes."""
    days = forecast["days"]
    has_blocked = any(d["blocked"] for d in days)
    if not has_blocked and len(days) >= 2:
        days[1]["rain_mm"] = 8.5
        days[1]["rain_prob"] = 85
        days[1]["blocked"] = True
        if len(days) >= 3:
            days[2]["blocked"] = True  # drying buffer
    return {"days": days, "source": forecast.get("source", "sample")}


def days_left(harvest_date: str, sowing_deadline: str) -> int:
    """Number of calendar days between harvest and deadline."""
    h = datetime.fromisoformat(harvest_date)
    d = datetime.fromisoformat(sowing_deadline)
    return max(0, (d - h).days)


def mark_blocked_days(forecast_days: list[dict]) -> list[dict]:
    """Return the same list with blocked status applied (already done in fetch)."""
    return forecast_days


def earliest_pickup(harvest_date: str, forecast_days: list[dict]) -> str | None:
    """Find the earliest non-blocked date on or after harvest."""
    h = datetime.fromisoformat(harvest_date).date()
    for day in forecast_days:
        d = datetime.fromisoformat(day["date"]).date()
        if d >= h and not day["blocked"]:
            return day["date"]
    return None
