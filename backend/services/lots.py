"""Lot builder: group farm requests into operational lots."""
from .estimator import haversine, get_farm_requests, get_operators, get_buyers, get_storage_sites, get_config, estimate_straw


def build_lots() -> list[dict]:
    """Greedy lot builder.
    
    Algorithm:
    1. Sort requests by pickup/harvest date
    2. Seed a lot with the first unassigned request
    3. Add requests within radius and date window while within operator capacity
    4. Route by nearest neighbour from operator base
    5. Best buyer by price
    6. Nearest storage site
    """
    cfg = get_config()
    radius_km = cfg["lot_radius_km"]["value"]
    date_window = cfg["lot_date_window_days"]["value"]
    
    requests = get_farm_requests()
    operators = get_operators()
    buyers = get_buyers()
    storage_sites = get_storage_sites()
    
    # Sort by harvest_date
    requests.sort(key=lambda r: r["harvest_date"])
    
    assigned = set()
    lots = []
    lot_id = 0
    
    for i, seed_req in enumerate(requests):
        if seed_req["id"] in assigned:
            continue
        
        lot_id += 1
        # Find nearest operator
        best_op = None
        best_op_dist = float("inf")
        for op in operators:
            d = haversine(seed_req["lat"], seed_req["lng"], op["base_lat"], op["base_lng"])
            if d < best_op_dist:
                best_op_dist = d
                best_op = op
        
        if not best_op:
            continue
        
        capacity = best_op["capacity_q_per_day"]
        lot_requests = [seed_req]
        assigned.add(seed_req["id"])
        straw = estimate_straw(seed_req["crop"], seed_req["area_acres"])
        total_q = straw["straw_q"]
        
        # Add nearby requests within radius and date window
        for j, req in enumerate(requests):
            if req["id"] in assigned:
                continue
            dist = haversine(seed_req["lat"], seed_req["lng"], req["lat"], req["lng"])
            if dist > radius_km:
                continue
            # Check date window
            from datetime import datetime
            seed_date = datetime.fromisoformat(seed_req["harvest_date"])
            req_date = datetime.fromisoformat(req["harvest_date"])
            if abs((req_date - seed_date).days) > date_window:
                continue
            req_straw = estimate_straw(req["crop"], req["area_acres"])
            if total_q + req_straw["straw_q"] > capacity:
                continue
            lot_requests.append(req)
            assigned.add(req["id"])
            total_q += req_straw["straw_q"]
        
        # Route by nearest neighbour from operator base
        route = _nearest_neighbour_route(best_op["base_lat"], best_op["base_lng"], lot_requests)
        
        # Best buyer by price
        best_buyer = max(buyers, key=lambda b: b["price_per_q"])
        
        # Nearest storage site
        center_lat = sum(r["lat"] for r in lot_requests) / len(lot_requests)
        center_lng = sum(r["lng"] for r in lot_requests) / len(lot_requests)
        nearest_storage = min(
            storage_sites,
            key=lambda s: haversine(center_lat, center_lng, s["lat"], s["lng"])
        )
        
        lots.append({
            "lot_id": f"LOT-{lot_id:03d}",
            "operator": best_op["name"],
            "operator_id": best_op["id"],
            "buyer": best_buyer["name"],
            "buyer_id": best_buyer["id"],
            "qty_q": total_q,
            "pickup_date": seed_req["harvest_date"],
            "route": [{"farmer": r["farmer"], "village": r["village"], 
                       "lat": r["lat"], "lng": r["lng"],
                       "straw_q": estimate_straw(r["crop"], r["area_acres"])["straw_q"]}
                      for r in route],
            "storage_site": nearest_storage["name"],
            "storage_site_id": nearest_storage["id"],
            "demo": True,
        })
    
    return lots


def _nearest_neighbour_route(start_lat: float, start_lng: float, requests: list[dict]) -> list[dict]:
    """Order requests by nearest-neighbour from start point."""
    remaining = list(requests)
    route = []
    curr_lat, curr_lng = start_lat, start_lng
    
    while remaining:
        nearest = min(remaining, key=lambda r: haversine(curr_lat, curr_lng, r["lat"], r["lng"]))
        route.append(nearest)
        curr_lat, curr_lng = nearest["lat"], nearest["lng"]
        remaining.remove(nearest)
    
    return route
