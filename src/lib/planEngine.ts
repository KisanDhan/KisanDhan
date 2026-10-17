/**
 * planEngine.ts — Pure TS mirror of the Python engine (offline fallback).
 * 
 * All numbers are deterministic. Rounding rule: whole rupees;
 * farmer_share = round_half_up(net_sale * 0.30);
 * operator_share = net_sale - farmer_share (so waterfall sums exactly to gross).
 */

// Import shared config (single source of truth)
import config from '../../backend/data/config.json';
import villages from '../../backend/data/villages.json';
import operators from '../../backend/data/operators.json';
import buyers from '../../backend/data/buyers.json';
import farmRequests from '../../backend/data/farm_requests.json';
import storageSites from '../../backend/data/storage_sites.json';
import hotspotsSample from '../../backend/data/hotspots_sample.json';
import forecastSample from '../../backend/data/forecast_sample.json';

export { config, villages, operators, buyers, farmRequests, storageSites, hotspotsSample, forecastSample };

// --- Haversine ---
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Round half up ---
export function roundHalfUp(value: number): number {
  return Math.round(value + Number.EPSILON);
}

// --- Estimate ---
export function estimate(crop: string, areaAcres: number): { straw_q: number; tonnes: number } {
  const qPerAcre = (config.straw_q_per_acre as any)[crop] ?? config.straw_q_per_acre.paddy;
  const straw_q = roundHalfUp(areaAcres * qPerAcre);
  const tonnes = Math.round(straw_q / 10 * 10) / 10; // round to 1 decimal
  return { straw_q, tonnes };
}

// --- Days left ---
export function daysLeft(harvestDate: string, sowingDeadline: string): number {
  const h = new Date(harvestDate);
  const d = new Date(sowingDeadline);
  const diff = Math.floor((d.getTime() - h.getTime()) / (86400000));
  return Math.max(0, diff);
}

// --- Mark blocked days ---
export interface ForecastDay {
  date: string;
  rain_mm: number;
  rain_prob: number;
  blocked: boolean;
}

export function markBlockedDays(days: ForecastDay[]): ForecastDay[] {
  const rainMm = config.rain_threshold_mm.value;
  const rainProb = config.rain_prob_threshold.value;
  const buffer = config.rain_buffer_days.value;

  for (const d of days) {
    d.blocked = d.rain_mm >= rainMm || d.rain_prob >= rainProb;
  }
  // Drying buffer
  for (let i = 0; i < days.length; i++) {
    if (days[i].blocked && days[i].rain_mm >= rainMm) {
      for (let j = 1; j <= buffer; j++) {
        if (i + j < days.length && !days[i + j].blocked) {
          days[i + j].blocked = true;
        }
      }
    }
  }
  return days;
}

// --- Earliest pickup ---
export function earliestPickup(harvestDate: string, forecastDays: ForecastDay[]): string | null {
  const h = new Date(harvestDate);
  for (const day of forecastDays) {
    const d = new Date(day.date);
    if (d >= h && !day.blocked) {
      return day.date;
    }
  }
  return null;
}

// --- Waterfall ---
export interface Waterfall {
  gross: number;
  baling: number;
  transport: number;
  net_sale: number;
  farmer_share: number;
  operator_share: number;
  incentive: number;
  farmer_net: number;
  insitu: number;
}

export function waterfall(strawQ: number, pricePerQ: number, distanceKm: number, areaAcres: number): Waterfall {
  const balingCost = config.baling_cost_per_q.value;
  const transportRate = config.transport_cost_per_q_km.value;
  const farmerFrac = config.farmer_share.value;
  const incentivePerAcre = config.incentive_per_acre.value;
  const insituPerAcre = 200; // per worked example

  const gross = roundHalfUp(strawQ * pricePerQ);
  const baling = roundHalfUp(strawQ * balingCost);
  const transport = roundHalfUp(strawQ * distanceKm * transportRate);
  const net_sale = gross - baling - transport;
  const farmer_share = roundHalfUp(net_sale * farmerFrac);
  const operator_share = net_sale - farmer_share;
  const incentive = roundHalfUp(areaAcres * incentivePerAcre);
  const farmer_net = farmer_share + incentive;
  const insitu = roundHalfUp(areaAcres * insituPerAcre);

  return { gross, baling, transport, net_sale, farmer_share, operator_share, incentive, farmer_net, insitu };
}

// --- Burn cost ---
export function burnCost(areaAcres: number): { fine: number; note: string } {
  const fines = config.fines;
  let fine: number;
  if (areaAcres <= 2) fine = fines.upto_2_acres;
  else if (areaAcres <= 5) fine = fines.upto_5_acres;
  else fine = fines.above_5_acres;
  return { fine, note: `NGT/CAQM fine for burning on ${areaAcres} acres (estimate*)` };
}

// --- Impact ---
export function impact(tonnes: number): { co2_avoided_kg: number; co2_avoided_tonnes: number; pm25_avoided_kg: number } {
  const co2Factor = config.co2_kg_per_tonne.value;
  const pm25Factor = config.pm25_kg_per_tonne.value;
  const co2_kg = Math.round(tonnes * co2Factor * 10) / 10;
  const co2_tonnes = Math.round(co2_kg / 1000 * 10) / 10;
  const pm25_kg = Math.round(tonnes * pm25Factor * 10) / 10;
  return { co2_avoided_kg: co2_kg, co2_avoided_tonnes: co2_tonnes, pm25_avoided_kg: pm25_kg };
}

// --- Compute options (offline) ---
export interface PlanOption {
  id: string;
  label: string;
  is_best: boolean;
  feasible: boolean;
  reason: string;
  pickup_date: string | null;
  operator: string;
  buyer: string;
  buyer_id: string;
  buyer_price_per_q: number;
  distance_km: number;
  waterfall: Waterfall;
  incentive: number;
  farmer_net: number;
}

export function computeOptions(
  crop: string,
  areaAcres: number,
  villageLat: number,
  villageLng: number,
  harvestDate: string,
  sowingDeadline: string,
  forecastDays: ForecastDay[],
): PlanOption[] {
  const straw = estimate(crop, areaAcres);
  const pickupDate = earliestPickup(harvestDate, forecastDays);
  const dl = daysLeft(harvestDate, sowingDeadline);

  const scored = buyers.map(b => {
    const dist = Math.round(haversine(villageLat, villageLng, b.lat, b.lng) * 10) / 10;
    const wf = waterfall(straw.straw_q, b.price_per_q, dist, areaAcres);
    
    const bestOp = operators.reduce((best, op) => {
      const od = haversine(villageLat, villageLng, op.base_lat, op.base_lng);
      return (!best || od < best.dist) ? { op, dist: od } : best;
    }, null as any);

    let feasible = true;
    let reason = '';
    if (!pickupDate) { feasible = false; reason = 'All forecast days are blocked by rain'; }
    else if (dl <= 0) { feasible = false; reason = 'Sowing deadline has already passed'; }

    return {
      buyer: b, dist, wf, operator: bestOp?.op,
      pickupDate: pickupDate || harvestDate,
      feasible, reason, farmerNet: wf.farmer_net,
    };
  }).sort((a, b) => b.farmerNet - a.farmerNet);

  const options: PlanOption[] = [];
  const labels = ['Best option', 'Second option', 'Budget option'];
  const indices = scored.length >= 3 ? [0, 1, scored.length - 1] : scored.map((_, i) => i);
  
  indices.forEach((idx, i) => {
    const s = scored[idx];
    options.push({
      id: `opt${i + 1}`,
      label: labels[i] || `Option ${i + 1}`,
      is_best: i === 0,
      feasible: s.feasible,
      reason: s.reason,
      pickup_date: s.pickupDate,
      operator: s.operator?.name || 'None available',
      buyer: s.buyer.name,
      buyer_id: s.buyer.id,
      buyer_price_per_q: s.buyer.price_per_q,
      distance_km: s.dist,
      waterfall: s.wf,
      incentive: s.wf.incentive,
      farmer_net: s.wf.farmer_net,
    });
  });

  return rankOptions(options);
}

export function rankOptions(options: PlanOption[]): PlanOption[] {
  const feasible = options.filter(o => o.feasible).sort((a, b) => b.farmer_net - a.farmer_net);
  const infeasible = options.filter(o => !o.feasible);
  return [...feasible, ...infeasible];
}

// --- Rank pairs (buyer+operator combos for matching) ---
export function rankPairs(villageLat: number, villageLng: number, strawQ: number, areaAcres: number) {
  return buyers.map(b => {
    const dist = Math.round(haversine(villageLat, villageLng, b.lat, b.lng) * 10) / 10;
    const wf = waterfall(strawQ, b.price_per_q, dist, areaAcres);
    return { buyer: b, distance_km: dist, waterfall: wf, farmer_net: wf.farmer_net };
  }).sort((a, b) => b.farmer_net - a.farmer_net);
}

// --- Build lots (offline mirror) ---
export interface Lot {
  lot_id: string;
  operator: string;
  buyer: string;
  qty_q: number;
  pickup_date: string;
  route: { farmer: string; village: string; lat: number; lng: number; straw_q: number }[];
  storage_site: string;
}

export function buildLots(): Lot[] {
  const radiusKm = config.lot_radius_km.value;
  const dateWindow = config.lot_date_window_days.value;
  
  const requests = [...farmRequests].sort((a, b) => a.harvest_date.localeCompare(b.harvest_date));
  const assigned = new Set<string>();
  const lots: Lot[] = [];
  let lotId = 0;

  for (const seedReq of requests) {
    if (assigned.has(seedReq.id)) continue;
    lotId++;

    const bestOp = operators.reduce((best, op) => {
      const d = haversine(seedReq.lat, seedReq.lng, op.base_lat, op.base_lng);
      return (!best || d < best.dist) ? { op, dist: d } : best;
    }, null as any);

    if (!bestOp) continue;

    const capacity = bestOp.op.capacity_q_per_day;
    const lotReqs = [seedReq];
    assigned.add(seedReq.id);
    let totalQ = estimate(seedReq.crop, seedReq.area_acres).straw_q;

    for (const req of requests) {
      if (assigned.has(req.id)) continue;
      const dist = haversine(seedReq.lat, seedReq.lng, req.lat, req.lng);
      if (dist > radiusKm) continue;
      const daysDiff = Math.abs(
        (new Date(req.harvest_date).getTime() - new Date(seedReq.harvest_date).getTime()) / 86400000
      );
      if (daysDiff > dateWindow) continue;
      const reqStraw = estimate(req.crop, req.area_acres).straw_q;
      if (totalQ + reqStraw > capacity) continue;
      lotReqs.push(req);
      assigned.add(req.id);
      totalQ += reqStraw;
    }

    // Nearest-neighbour route
    const route: typeof lotReqs = [];
    const remaining = [...lotReqs];
    let currLat = bestOp.op.base_lat;
    let currLng = bestOp.op.base_lng;
    while (remaining.length > 0) {
      let minDist = Infinity;
      let minIdx = 0;
      remaining.forEach((r, i) => {
        const d = haversine(currLat, currLng, r.lat, r.lng);
        if (d < minDist) { minDist = d; minIdx = i; }
      });
      const nearest = remaining.splice(minIdx, 1)[0];
      route.push(nearest);
      currLat = nearest.lat;
      currLng = nearest.lng;
    }

    const bestBuyer = buyers.reduce((best, b) => b.price_per_q > best.price_per_q ? b : best, buyers[0]);
    const centerLat = lotReqs.reduce((s, r) => s + r.lat, 0) / lotReqs.length;
    const centerLng = lotReqs.reduce((s, r) => s + r.lng, 0) / lotReqs.length;
    const nearestStore = storageSites.reduce((best, s) => {
      const d = haversine(centerLat, centerLng, s.lat, s.lng);
      return (!best || d < best.dist) ? { site: s, dist: d } : best;
    }, null as any);

    lots.push({
      lot_id: `LOT-${String(lotId).padStart(3, '0')}`,
      operator: bestOp.op.name,
      buyer: bestBuyer.name,
      qty_q: totalQ,
      pickup_date: seedReq.harvest_date,
      route: route.map(r => ({
        farmer: r.farmer,
        village: r.village,
        lat: r.lat,
        lng: r.lng,
        straw_q: estimate(r.crop, r.area_acres).straw_q,
      })),
      storage_site: nearestStore?.site.name || 'Unknown',
    });
  }

  return lots;
}
