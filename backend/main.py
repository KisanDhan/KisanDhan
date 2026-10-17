"""KisanDhan FastAPI backend.

Routes served at root (Express proxies /api/v2/* -> /*).
"""
import os
import sys
import json
import logging
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kisandhan")

# --- Startup: validate GEMINI_MODEL ---
def _check_gemini_model():
    model = os.environ.get("GEMINI_MODEL", "")
    if not model:
        logger.warning("GEMINI_MODEL not set. Chat will use deterministic template replies.")
        return
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set. Chat will use deterministic template replies.")
        return
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        models = [m.name for m in client.models.list()]
        logger.info(f"Available Gemini models: {models[:10]}...")
        if model not in models and f"models/{model}" not in models:
            logger.warning(f"GEMINI_MODEL='{model}' not found in available models. Chat may fail.")
        else:
            logger.info(f"GEMINI_MODEL='{model}' is available.")
    except Exception as e:
        logger.warning(f"Could not verify GEMINI_MODEL: {e}")

_check_gemini_model()

# --- App ---
app = FastAPI(
    title="KisanDhan API",
    description="Stubble-to-income planning engine. We make not burning the profitable choice.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory booking store
_bookings: list[dict] = []


# --- Pydantic models ---
class EstimateRequest(BaseModel):
    crop: str = "paddy"
    area_acres: float = Field(ge=0.5, le=200)

class PlanRequest(BaseModel):
    crop: str = "paddy"
    area_acres: float = Field(ge=0.5, le=200)
    village: str = "Machhiwara"
    harvest_date: str  # ISO date
    sowing_deadline: str  # ISO date

class BookRequest(BaseModel):
    plan_option_id: str
    farmer_name: str
    village: str
    date: str

class VerifyRequest(BaseModel):
    lat: float
    lon: float
    days: int = Field(default=7, ge=1, le=30)

class ChatRequest(BaseModel):
    transcript: list[dict] = []
    image: Optional[str] = None
    language: str = "en"


# --- Utility ---
def _validate_language(lang: str) -> str:
    return lang if lang in ("en", "hi", "pa", "hr") else "en"

def _validate_iso_date(d: str) -> str:
    try:
        datetime.fromisoformat(d)
        return d
    except ValueError:
        return datetime.now().strftime("%Y-%m-%d")

def _get_firms_key(request: Request) -> str | None:
    """Get FIRMS key from header (injected by Express) or env. Never from browser."""
    key = request.headers.get("x-nasa-key")
    if not key:
        key = os.environ.get("FIRMS_MAP_KEY")
    return key


# --- Routes ---

@app.get("/health")
async def health():
    return {"status": "ok", "service": "kisandhan-api", "version": "2.0.0"}


@app.post("/estimate")
async def estimate(req: EstimateRequest):
    from backend.services.estimator import estimate_straw
    result = estimate_straw(req.crop, req.area_acres)
    return result


@app.get("/forecast")
async def forecast(lat: float = 30.9, lon: float = 75.85, demo: str | None = None):
    from backend.services.scheduler import fetch_forecast
    force_rain = demo == "rain"
    result = await fetch_forecast(lat, lon, force_demo_rain=force_rain)
    return result


@app.post("/plan")
async def plan(req: PlanRequest):
    from backend.services.estimator import estimate_straw, burn_cost, impact, get_villages
    from backend.services.scheduler import fetch_forecast, days_left
    from backend.services.options import compute_options, rank_options

    harvest = _validate_iso_date(req.harvest_date)
    deadline = _validate_iso_date(req.sowing_deadline)

    # Find village coords
    villages = get_villages()
    v = next((v for v in villages if v["name"] == req.village), None)
    if not v:
        v = villages[0] if villages else {"lat": 30.9, "lng": 75.85}

    straw = estimate_straw(req.crop, req.area_acres)
    dl = days_left(harvest, deadline)
    fc = await fetch_forecast(v["lat"], v["lng"])
    
    options = compute_options(
        req.crop, req.area_acres, v["lat"], v["lng"],
        harvest, deadline, fc["days"],
    )
    options = rank_options(options)
    
    bc = burn_cost(req.area_acres)
    imp = impact(straw["tonnes"])
    
    best_id = options[0]["id"] if options else None
    
    assumptions = [
        f"Straw yield: {straw['straw_q']} q ({req.crop} @ config rate, estimate)",
        f"Baling: Rs 45/q (range 40-50, assumption)",
        f"Transport: Rs 0.25/q/km (assumption)",
        f"Farmer share: 30% of net sale (platform policy)",
        f"Incentive: Rs 1200/acre (CRM scheme estimate*)",
        f"CO2 factor: 1460 kg/tonne (*verify before presenting)",
        f"PM2.5 factor: 10 kg/tonne (*verify before presenting)",
    ]
    
    return {
        "straw_q": straw["straw_q"],
        "tonnes": straw["tonnes"],
        "days_left": dl,
        "forecast_days": fc["days"],
        "forecast_source": fc["source"],
        "options": options,
        "best_option_id": best_id,
        "burn": bc,
        "impact": imp,
        "assumptions": assumptions,
    }


@app.get("/lots")
async def lots():
    from backend.services.lots import build_lots
    result = build_lots()
    return {"lots": result}


@app.get("/supply")
async def supply():
    from backend.services.impact import supply_summary
    villages = supply_summary()
    return {"villages": villages}


@app.get("/hotspots")
async def hotspots(days: int = 1, request: Request = None):
    from backend.services.hotspots import fetch_hotspots
    key = _get_firms_key(request) if request else None
    result = await fetch_hotspots(days, key)
    return result


@app.post("/book")
async def book(req: BookRequest):
    ref = f"KD-{datetime.now().strftime('%Y%m%d')}-{len(_bookings)+1:04d}"
    
    # Find the operator/buyer from the option
    from backend.services.estimator import get_operators, get_buyers
    operators = get_operators()
    buyers = get_buyers()
    
    booking = {
        "reference": ref,
        "plan_option_id": req.plan_option_id,
        "farmer_name": req.farmer_name,
        "village": req.village,
        "date": req.date,
        "operator": operators[0]["name"] if operators else "Baler Hub 1 (demo)",
        "buyer": buyers[0]["name"] if buyers else "Paper mill 1 (demo)",
        "status": "confirmed",
    }
    _bookings.append(booking)
    return booking


@app.post("/verify")
async def verify(req: VerifyRequest, request: Request):
    from backend.services.hotspots import verify_no_burn
    key = _get_firms_key(request)
    result = await verify_no_burn(req.lat, req.lon, req.days, key)
    return result


@app.get("/operators")
async def list_operators():
    from backend.services.estimator import get_operators
    return {"operators": get_operators()}


@app.get("/storage-sites")
async def list_storage_sites():
    from backend.services.estimator import get_storage_sites
    return {"storage_sites": get_storage_sites()}


@app.post("/chat")
async def chat(req: ChatRequest, request: Request):
    from backend.services.agent import chat_with_agent
    from backend.services.estimator import estimate_straw, waterfall
    
    lang = _validate_language(req.language)
    
    # Build plan data from context if available
    plan_data = None
    straw = estimate_straw("paddy", 8)
    wf = waterfall(straw["straw_q"], 180, 25, 8)
    plan_data = {
        "area_acres": 8,
        "crop": "paddy",
        "straw_q": straw["straw_q"],
        "farmer_share": wf["farmer_share"],
        "incentive": wf["incentive"],
        "farmer_net": wf["farmer_net"],
    }
    
    result = await chat_with_agent(req.transcript, lang, req.image, plan_data)
    return result
