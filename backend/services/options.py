"""Options service: compute plan options for a farmer."""
from .estimator import (
    estimate_straw, waterfall, burn_cost, impact, haversine,
    get_buyers, get_operators, get_config, round_half_up,
)
from .scheduler import earliest_pickup


def compute_options(
    crop: str,
    area_acres: float,
    village_lat: float,
    village_lng: float,
    harvest_date: str,
    sowing_deadline: str,
    forecast_days: list[dict],
) -> list[dict]:
    """Generate up to 3 options (best buyer, nearest buyer, cheapest)."""
    buyers = get_buyers()
    operators = get_operators()
    straw = estimate_straw(crop, area_acres)
    straw_q = straw["straw_q"]
    
    pickup_date = earliest_pickup(harvest_date, forecast_days)
    from .scheduler import days_left
    dl = days_left(harvest_date, sowing_deadline)

    # Score each buyer
    scored = []
    for b in buyers:
        dist = round(haversine(village_lat, village_lng, b["lat"], b["lng"]), 1)
        wf = waterfall(straw_q, b["price_per_q"], dist, area_acres)
        
        # Find nearest operator
        best_op = None
        best_op_dist = float("inf")
        for op in operators:
            od = haversine(village_lat, village_lng, op["base_lat"], op["base_lng"])
            if od < best_op_dist:
                best_op_dist = od
                best_op = op
        
        feasible = True
        reason = ""
        option_pickup = pickup_date
        
        if pickup_date is None:
            feasible = False
            reason = "All forecast days are blocked by rain"
            option_pickup = harvest_date
        elif dl <= 0:
            feasible = False
            reason = "Sowing deadline has already passed"
        
        scored.append({
            "buyer": b,
            "distance_km": dist,
            "waterfall": wf,
            "operator": best_op,
            "pickup_date": option_pickup,
            "feasible": feasible,
            "reason": reason,
            "farmer_net": wf["farmer_net"],
        })
    
    # Sort by farmer_net descending
    scored.sort(key=lambda x: x["farmer_net"], reverse=True)
    
    # Build options: best, second best, worst (to show range)
    options = []
    if len(scored) >= 1:
        s = scored[0]
        options.append(_make_option("opt1", "Best option", s, True))
    if len(scored) >= 2:
        s = scored[1]
        options.append(_make_option("opt2", "Second option", s, False))
    if len(scored) >= 3:
        # Pick the worst feasible or last
        s = scored[-1]
        options.append(_make_option("opt3", "Budget option", s, False))
    
    return options


def _make_option(oid: str, label: str, scored: dict, is_best: bool) -> dict:
    b = scored["buyer"]
    wf = scored["waterfall"]
    op = scored["operator"]
    bc = burn_cost(8)  # default, will be overridden by plan
    
    return {
        "id": oid,
        "label": label,
        "is_best": is_best,
        "feasible": scored["feasible"],
        "reason": scored["reason"],
        "pickup_date": scored["pickup_date"],
        "operator": op["name"] if op else "None available",
        "operator_id": op["id"] if op else None,
        "buyer": b["name"],
        "buyer_id": b["id"],
        "buyer_price_per_q": b["price_per_q"],
        "distance_km": scored["distance_km"],
        "waterfall": wf,
        "incentive": wf["incentive"],
        "farmer_net": wf["farmer_net"],
    }


def rank_options(options: list[dict]) -> list[dict]:
    """Sort options with best first, infeasible last."""
    feasible = [o for o in options if o["feasible"]]
    infeasible = [o for o in options if not o["feasible"]]
    feasible.sort(key=lambda x: x["farmer_net"], reverse=True)
    return feasible + infeasible
