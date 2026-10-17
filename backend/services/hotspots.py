"""Hotspot service: NASA FIRMS fire data."""
import httpx
import os
import time
from .estimator import get_hotspots_sample

_hotspot_cache: dict = {"data": None, "ts": 0}
_CACHE_TTL = 1800  # 30 minutes

FIRMS_BBOX = "74.0,27.6,77.6,32.6"


async def fetch_hotspots(days: int = 1, firms_key: str | None = None) -> dict:
    """Fetch fire hotspots from NASA FIRMS or return sample."""
    now = time.time()
    
    if _hotspot_cache["data"] and (now - _hotspot_cache["ts"]) < _CACHE_TTL:
        return _hotspot_cache["data"]
    
    key = firms_key or os.environ.get("FIRMS_MAP_KEY")
    
    if key:
        try:
            url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/VIIRS_SNPP_NRT/{FIRMS_BBOX}/{days}"
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, headers={"User-Agent": "KisanDhan-AgriTech"})
                resp.raise_for_status()
            
            csv_text = resp.text
            lines = csv_text.strip().split("\n")
            if len(lines) > 1:
                header = lines[0].split(",")
                lat_idx = header.index("latitude") if "latitude" in header else 0
                lon_idx = header.index("longitude") if "longitude" in header else 1
                conf_idx = header.index("confidence") if "confidence" in header else -1
                date_idx = header.index("acq_date") if "acq_date" in header else -1
                
                points = []
                for line in lines[1:26]:  # max 25
                    cols = line.split(",")
                    if len(cols) > max(lat_idx, lon_idx):
                        conf_str = cols[conf_idx] if conf_idx >= 0 else "nominal"
                        conf = 95 if conf_str == "high" else (65 if conf_str == "low" else 85)
                        date_val = cols[date_idx] if date_idx >= 0 else ""
                        points.append({
                            "lat": float(cols[lat_idx]),
                            "lon": float(cols[lon_idx]),
                            "confidence": conf,
                            "date": date_val,
                        })
                
                if points:
                    result = {"points": points, "source": "live"}
                    _hotspot_cache["data"] = result
                    _hotspot_cache["ts"] = now
                    return result
        except Exception as e:
            print(f"FIRMS fetch failed, using sample: {e}")
    
    # Fallback to sample
    sample = get_hotspots_sample()
    points = [{"lat": h["lat"], "lon": h["lon"], "confidence": h.get("confidence", "nominal"),
               "date": h.get("acq_date", "")} for h in sample]
    return {"points": points, "source": "sample"}


async def verify_no_burn(lat: float, lon: float, days: int = 7, firms_key: str | None = None) -> dict:
    """Check for fire detections within 2km of a point."""
    from .estimator import haversine
    
    data = await fetch_hotspots(days, firms_key)
    detections = 0
    for p in data["points"]:
        dist = haversine(lat, lon, p["lat"], p["lon"])
        if dist <= 2.0:
            detections += 1
    
    badge = "No burn detected" if detections == 0 else f"{detections} fire(s) detected nearby"
    return {
        "detections": detections,
        "badge": badge,
        "caveat": "Evidence, not proof: satellites miss small fires and clouds.",
    }
