"""Estimator service: straw yield and waterfall calculations."""
import json
import math
import os
from decimal import Decimal, ROUND_HALF_UP

_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def _load_json(name: str):
    with open(os.path.join(_DATA_DIR, name), "r", encoding="utf-8") as f:
        return json.load(f)

def get_config():
    return _load_json("config.json")

def get_buyers():
    return _load_json("buyers.json")

def get_operators():
    return _load_json("operators.json")

def get_villages():
    return _load_json("villages.json")

def get_farm_requests():
    return _load_json("farm_requests.json")

def get_storage_sites():
    return _load_json("storage_sites.json")

def get_hotspots_sample():
    return _load_json("hotspots_sample.json")

def get_forecast_sample():
    return _load_json("forecast_sample.json")


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distance in km between two lat/lon points."""
    R = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def round_half_up(value: float) -> int:
    """Round to nearest integer using half-up rounding."""
    return int(Decimal(str(value)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def estimate_straw(crop: str, area_acres: float) -> dict:
    """Estimate straw quantity in quintals."""
    cfg = get_config()
    q_per_acre = cfg["straw_q_per_acre"].get(crop, cfg["straw_q_per_acre"]["paddy"])
    straw_q = round_half_up(area_acres * q_per_acre)
    tonnes = round(straw_q / 10, 1)
    return {"straw_q": straw_q, "tonnes": tonnes}


def waterfall(straw_q: int, price_per_q: float, distance_km: float, area_acres: float) -> dict:
    """Compute the full financial waterfall.
    
    Rounding rule: whole rupees; farmer_share = round_half_up(net_sale * 0.30);
    operator_share = net_sale - farmer_share so waterfall sums exactly to gross.
    """
    cfg = get_config()
    baling_cost = cfg["baling_cost_per_q"]["value"]
    transport_rate = cfg["transport_cost_per_q_km"]["value"]
    farmer_frac = cfg["farmer_share"]["value"]
    incentive_per_acre = cfg["incentive_per_acre"]["value"]
    insitu_per_acre = 200  # per worked example: 1600 / 8 = 200

    gross = round_half_up(straw_q * price_per_q)
    baling = round_half_up(straw_q * baling_cost)
    transport = round_half_up(straw_q * distance_km * transport_rate)
    net_sale = gross - baling - transport

    farmer_share = round_half_up(net_sale * farmer_frac)
    operator_share = net_sale - farmer_share  # ensures exact sum
    incentive = round_half_up(area_acres * incentive_per_acre)
    farmer_net = farmer_share + incentive
    insitu = round_half_up(area_acres * insitu_per_acre)

    return {
        "gross": gross,
        "baling": baling,
        "transport": transport,
        "net_sale": net_sale,
        "farmer_share": farmer_share,
        "operator_share": operator_share,
        "incentive": incentive,
        "farmer_net": farmer_net,
        "insitu": insitu,
    }


def burn_cost(area_acres: float) -> dict:
    """Fine and note for burning."""
    cfg = get_config()
    fines = cfg["fines"]
    if area_acres <= 2:
        fine = fines["upto_2_acres"]
    elif area_acres <= 5:
        fine = fines["upto_5_acres"]
    else:
        fine = fines["above_5_acres"]
    return {
        "fine": fine,
        "note": f"NGT/CAQM fine for burning on {area_acres} acres (estimate*)",
    }


def impact(tonnes: float) -> dict:
    """Environmental impact of NOT burning."""
    cfg = get_config()
    co2_kg = round(tonnes * cfg["co2_kg_per_tonne"]["value"], 1)
    co2_tonnes = round(co2_kg / 1000, 1)
    pm25_kg = round(tonnes * cfg["pm25_kg_per_tonne"]["value"], 1)
    return {
        "co2_avoided_kg": co2_kg,
        "co2_avoided_tonnes": co2_tonnes,
        "pm25_avoided_kg": pm25_kg,
    }
