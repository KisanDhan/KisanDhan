"""Impact service: environmental impact calculations."""
from .estimator import get_config


def compute_impact(tonnes: float) -> dict:
    """Compute environmental impact of diverting straw from burning."""
    cfg = get_config()
    co2_factor = cfg["co2_kg_per_tonne"]["value"]
    pm25_factor = cfg["pm25_kg_per_tonne"]["value"]
    
    co2_kg = round(tonnes * co2_factor, 1)
    co2_tonnes = round(co2_kg / 1000, 1)
    pm25_kg = round(tonnes * pm25_factor, 1)
    
    return {
        "co2_avoided_kg": co2_kg,
        "co2_avoided_tonnes": co2_tonnes,
        "pm25_avoided_kg": pm25_kg,
        "source": {
            "co2_factor": f"{co2_factor} kg CO2/tonne ({cfg['co2_kg_per_tonne']['source']})",
            "pm25_factor": f"{pm25_factor} kg PM2.5/tonne ({cfg['pm25_kg_per_tonne']['source']})",
        }
    }


def supply_summary() -> list[dict]:
    """Village-level supply estimate with fire counts from sample."""
    from .estimator import get_villages, get_hotspots_sample, haversine, estimate_straw
    
    villages = get_villages()
    hotspots = get_hotspots_sample()
    
    result = []
    for v in villages:
        # Estimate supply: assume 50 acres avg per village
        straw = estimate_straw("paddy", 50)
        
        # Count fires within 5km
        fire_count = 0
        for h in hotspots:
            dist = haversine(v["lat"], v["lng"], h["lat"], h["lon"])
            if dist <= 5.0:
                fire_count += 1
        
        result.append({
            "name": v["name"],
            "lat": v["lat"],
            "lon": v["lng"],
            "straw_q_est": straw["straw_q"],
            "fire_count": fire_count,
        })
    
    return result
