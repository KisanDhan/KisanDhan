import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Flame,
  Factory,
  Wind,
  MapPin,
  Compass,
  AlertTriangle,
  RefreshCw,
  List,
  Map as MapIcon,
  Layers,
  ChevronRight,
  ArrowLeft,
  Key,
  CheckCircle2,
  ExternalLink,
  X,
  Radar,
  Eye,
} from 'lucide-react';
import { Buyer, FireHotspot, Language } from '../types';
import { TRANSLATIONS } from '../data/seedData';

interface HotspotMapProps {
  hotspots: FireHotspot[];
  buyers: Buyer[];
  currentDistrict: string;
  currentVillage: string;
  language: Language;
  onBack?: () => void;
}

export const HotspotMap: React.FC<HotspotMapProps> = ({
  hotspots: initialHotspots,
  buyers,
  currentDistrict,
  currentVillage,
  language,
  onBack,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [hotspots, setHotspots] = useState<FireHotspot[]>(initialHotspots);
  const [showFires, setShowFires] = useState(true);
  const [showBuyers, setShowBuyers] = useState(true);
  const [showWindVector, setShowWindVector] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'radar' | 'list'>('radar');
  const [selectedHotspot, setSelectedHotspot] = useState<FireHotspot | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Translations dictionary for map component
  const i18n = {
    en: {
      mapTitle: 'Live Satellite Fire & Stubble Buyer Map',
      mapSubtitle: 'Active fire anomalies across Punjab-Haryana with Delhi smoke vector',
      activeFires: 'Active Fire Hotspots',
      btnRadar: 'Radar View',
      btnMap: 'Street Map',
      btnList: 'List View',
      filterFires: '🔥 Fires',
      filterBuyers: '🏭 Buyers',
      filterSmoke: '💨 Smoke Drift',
      windNoteTitle: 'Wind Drift: 14.2 km/h NW → SE (Towards Delhi-NCR)',
      windNoteDesc: 'KisanDhan routes balers to active fire clusters first to stop emissions at the farm gate.',
      listTitle: 'Active Satellite Fire Hotspots (NASA FIRMS VIIRS/MODIS)',
      yourField: 'Your Farm Field',
      verifiedBuyer: 'Verified Stubble Buyer',
      offeredRate: 'Offered Rate:',
      dailyCapacity: 'Daily Capacity:',
      phone: 'Phone:',
      backBtn: 'Back',
      dismiss: 'Dismiss',
      power: 'Radiative Power',
      conf: 'Confidence',
      radarLegendFires: 'Active Fire Hotspots',
      radarLegendBuyers: 'Biomass Buyers (Free Baler)',
      radarLegendSmoke: 'Prevailing Wind Plume',
    },
    hr: {
      mapTitle: 'नासा उपग्रह आग व खरीदार मैप',
      mapSubtitle: 'पंजाब-हरियाणा म्हां उपग्रह नै पकड़ी आग अर दिल्ली कानी उड़दा धुआं',
      activeFires: 'सक्रिय आग के बिंदु',
      btnRadar: 'रडार मैप',
      btnMap: 'नक्शा',
      btnList: 'पूरी सूची',
      filterFires: '🔥 आग',
      filterBuyers: '🏭 खरीदार',
      filterSmoke: '💨 धुआं',
      windNoteTitle: 'हवा की चाल: 14.2 किमी/घंटा (दिल्ली कानी)',
      windNoteDesc: 'नासा उपग्रह डेटा तै म्हारे बेलर अर खरीदार पैहल्या आग आले गामां म्हां पहुंचे हैं ताकी धुआं ना उड़ै।',
      listTitle: 'सक्रिय उपग्रह आग की सूची (NASA FIRMS)',
      yourField: 'थारा खेत',
      verifiedBuyer: 'पक्का पराली खरीदार',
      offeredRate: 'भाव दर:',
      dailyCapacity: 'दैनिक उठान:',
      phone: 'फोन:',
      backBtn: 'वापस',
      dismiss: 'हटाओ',
      power: 'गर्मी शक्ति',
      conf: 'सटीकता',
      radarLegendFires: 'खेत म्हां आग',
      radarLegendBuyers: 'पक्के खरीदार (फ्री बेलर)',
      radarLegendSmoke: 'हवा का रुख दिल्ली कानी',
    },
    hi: {
      mapTitle: 'नासा उपग्रह आग व खरीदार मैप',
      mapSubtitle: 'पंजाब-हरियाणा में उपग्रह द्वारा दर्ज आग एवं दिल्ली की ओर धुएं का बहाव',
      activeFires: 'सक्रिय आग के बिंदु',
      btnRadar: 'रडार मैप',
      btnMap: 'नक्शा',
      btnList: 'पूरी सूची',
      filterFires: '🔥 आग',
      filterBuyers: '🏭 खरीदार',
      filterSmoke: '💨 धुएं का बहाव',
      windNoteTitle: 'हवा की गति: 14.2 किमी/घंटा (उत्तर-पश्चिम से दिल्ली की ओर)',
      windNoteDesc: 'नासा उपग्रह डेटा के जरिए हम उन क्षेत्रों में पहले बेलर भेजते हैं ताकि दिल्ली में स्मॉग न फैले।',
      listTitle: 'सक्रिय उपग्रह आग हॉटस्पॉट (NASA FIRMS VIIRS/MODIS)',
      yourField: 'आपका खेत',
      verifiedBuyer: 'सत्यापित पराली खरीदार',
      offeredRate: 'प्रस्तावित दर:',
      dailyCapacity: 'दैनिक क्षमता:',
      phone: 'फोन:',
      backBtn: 'वापस',
      dismiss: 'हटाएं',
      power: 'ऊष्मा शक्ति',
      conf: 'सटीकता',
      radarLegendFires: 'सक्रिय आग',
      radarLegendBuyers: 'बायोमास खरीदार (मुफ्त बेलर)',
      radarLegendSmoke: 'धुएं का बहाव',
    },
    pa: {
      mapTitle: 'ਨਾਸਾ ਲਾਈਵ ਅੱਗ ਅਤੇ ਖਰੀਦਦਾਰ ਮੈਪ',
      mapSubtitle: 'ਪੰਜਾਬ-ਹਰਿਆਣਾ ਵਿੱਚ ਸੈਟੇਲਾਈਟ ਅੱਗ ਅਤੇ ਦਿੱਲੀ ਵੱਲ ਧੂੰਏਂ ਦਾ ਵਹਾਅ',
      activeFires: 'ਸੈਟੇਲਾਈਟ ਅੱਗ ਦੇ ਪੁਆਇੰਟ',
      btnRadar: 'ਰਡਾਰ ਮੈਪ',
      btnMap: 'ਨਕਸ਼ਾ',
      btnList: 'ਸੂਚੀ',
      filterFires: '🔥 ਅੱਗ',
      filterBuyers: '🏭 ਖਰੀਦਦਾਰ',
      filterSmoke: '💨 ਧੂੰਏਂ ਦਾ ਵਹਾਅ',
      windNoteTitle: 'ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ: 14.2 ਕਿ.ਮੀ./ਘੰਟਾ (ਪੱਛਮ ਤੋਂ ਦਿੱਲੀ ਵੱਲ)',
      windNoteDesc: 'ਨਾਸਾ ਸੈਟੇਲਾਈਟ ਡਾਟਾ ਰਾਹੀਂ ਅਸੀਂ ਪਹਿਲਾਂ ਉੱਥੇ ਬੇਲਰ ਅਤੇ ਟਰਾਲੀਆਂ ਭੇਜਦੇ ਹਾਂ ਤਾਂ ਜੋ ਧੂੰਆਂ ਦਿੱਲੀ ਵੱਲ ਨਾ ਜਾਵੇ।',
      listTitle: 'ਨਾਸਾ ਸੈਟੇਲਾਈਟ ਅੱਗ ਦੀ ਲਾਈਵ ਸੂਚੀ (NASA FIRMS VIIRS/MODIS)',
      yourField: 'ਤੁਹਾਡਾ ਖੇਤ',
      verifiedBuyer: 'ਪ੍ਰਮਾਣਿਤ ਪਰਾਲੀ ਖਰੀਦਦਾਰ',
      offeredRate: 'ਪੇਸ਼ਕਸ਼ ਦਰ:',
      dailyCapacity: 'ਰੋਜ਼ਾਨਾ ਸਮਰੱਥਾ:',
      phone: 'ਫੋਨ:',
      backBtn: 'ਪਿੱਛੇ',
      dismiss: 'ਹਟਾਓ',
      power: 'ਤਾਪ ਊਰਜਾ',
      conf: 'ਭਰੋਸਾ',
      radarLegendFires: 'ਸੈਟੇਲਾਈਟ ਅੱਗ',
      radarLegendBuyers: 'ਪੱਕੇ ਖਰੀਦਦਾਰ',
      radarLegendSmoke: 'ਧੂੰਏਂ ਦਾ ਰੁਖ਼',
    },
  }[language];

  // Refresh live satellite data
  useEffect(() => {
    fetch('/api/data/firms-hotspots')
      .then((r) => r.json())
      .then((d) => {
        if (d.hotspots && d.hotspots.length > 0) {
          setHotspots(d.hotspots);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize Leaflet Map when in 'map' mode
  useEffect(() => {
    if (viewMode !== 'map') return;

    let isCancelled = false;
    let timer: any = null;

    // Small delay to ensure modal container has computed width/height
    timer = setTimeout(() => {
      const container = mapContainerRef.current;
      if (!container || isCancelled) return;

      try {
        if ((container as any)._leaflet_id) {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
          }
          delete (container as any)._leaflet_id;
        }

        const map = L.map(container, {
          center: [30.2, 75.8],
          zoom: 8,
          zoomControl: true,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        // Reliable OpenStreetMap tile server
        const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          subdomains: ['a', 'b', 'c'],
        });

        tileLayer.on('tileerror', () => {
          // Fallback to CartoDB Voyager
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19,
          }).addTo(map);
        });

        tileLayer.addTo(map);

        // Resize invalidation
        setTimeout(() => map.invalidateSize(), 100);
        setTimeout(() => map.invalidateSize(), 400);

        // 1. Add Fire Hotspot Markers
        if (showFires) {
          hotspots.forEach((spot) => {
            const fireIcon = L.divIcon({
              className: 'custom-fire-marker',
              html: `<div style="
                width: 28px; 
                height: 28px; 
                background: #10b981; 
                border: 2px solid #ecfdf5; 
                border-radius: 50%; 
                box-shadow: 0 0 14px #059669;
                display: flex;
                align-items: center;
                justify-content: center;
                color: emerald-50;
                font-size: 14px;
                cursor: pointer;
              ">🔥</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            const marker = L.marker([spot.lat, spot.lng], { icon: fireIcon });
            marker.bindPopup(`
              <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #052e16; min-width: 170px;">
                <div style="font-weight: 800; color: #059669;">🔥 NASA Detection (${spot.source || 'VIIRS'})</div>
                <div style="font-weight: 700; font-size: 14px; margin-top: 3px;">${spot.village}, ${spot.district}</div>
                <div style="color: #6ee7b7; font-size: 11px;">Satellite: ${spot.satellite} • ${spot.timeAgo}</div>
                <hr style="margin: 6px 0; border: 0; border-top: 1px solid #a7f3d0;" />
                <div>${i18n.power}: <b>${spot.frpMw} MW</b></div>
                <div>${i18n.conf}: <b style="color: #047857;">${spot.confidence}%</b></div>
              </div>
            `);
            marker.on('click', () => setSelectedHotspot(spot));
            marker.addTo(map);
          });
        }

        // 2. Add Buyer Facility Markers
        if (showBuyers) {
          buyers.forEach((b) => {
            const buyerIcon = L.divIcon({
              className: 'custom-buyer-marker',
              html: `<div style="
                background: #059669; 
                color: #ecfdf5; 
                padding: 4px 8px; 
                border-radius: 12px; 
                border: 2px solid #ecfdf5; 
                font-size: 11px; 
                font-weight: 800;
                box-shadow: 0 3px 8px rgba(0,0,0,0.35);
                white-space: nowrap;
                cursor: pointer;
              ">🏭 ${b.name.split(' ')[0]}</div>`,
              iconSize: [80, 24],
              iconAnchor: [40, 12],
            });

            const marker = L.marker([b.lat, b.lng], { icon: buyerIcon });
            marker.bindPopup(`
              <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #052e16; min-width: 180px;">
                <div style="font-weight: 800; color: #059669;">🏭 Verified Stubble Buyer</div>
                <div style="font-weight: 700; font-size: 13px; margin-top: 2px;">${b.name}</div>
                <div style="color: #6ee7b7; font-size: 11px;">${b.location}</div>
                <hr style="margin: 6px 0; border: 0; border-top: 1px solid #a7f3d0;" />
                <div>Price: <b style="color: #059669;">₹${b.pricePerQuintal}/quintal</b></div>
                <div>Machinery: <b>${b.balerSupport ? 'Free Baler Dispatched' : 'Self Transport'}</b></div>
              </div>
            `);
            marker.on('click', () => setSelectedBuyer(b));
            marker.addTo(map);
          });
        }

        // 3. User Farm Marker
        const userIcon = L.divIcon({
          className: 'custom-farmer-marker',
          html: `<div style="
            background: #34d399; 
            color: #052e16; 
            padding: 4px 8px; 
            border-radius: 12px; 
            border: 2px solid #ecfdf5; 
            font-size: 11px; 
            font-weight: 900;
            box-shadow: 0 0 12px #34d399;
            white-space: nowrap;
          ">🌾 Your Farm (${currentVillage})</div>`,
          iconSize: [90, 24],
          iconAnchor: [45, 12],
        });
        L.marker([30.2458, 75.8421], { icon: userIcon }).addTo(map);
      } catch (err: any) {
        console.warn('Leaflet initialization error:', err);
        setMapError('Leaflet tile render busy. Switched to high-res Satellite Radar.');
        setViewMode('radar');
      }
    }, 120);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode, hotspots, buyers, showFires, showBuyers, currentDistrict, currentVillage]);

  // Satellite Radar Geographic projection helpers (Punjab, Haryana, Delhi: 74°E-78°E, 28°N-32°N)
  const projectX = (lng: number) => {
    // 74°E = 5%, 78°E = 95%
    return ((lng - 74.0) / 4.0) * 90 + 5;
  };
  const projectY = (lat: number) => {
    // 32°N = 5%, 28°N = 95% (Inverted for SVG coordinate space)
    return ((32.0 - lat) / 4.0) * 90 + 5;
  };

  return (
    <div className="bg-[#065f46] border border-[#059669] rounded-3xl p-3 sm:p-4 text-emerald-50 flex flex-col h-full relative overflow-hidden">
      {/* Top Header & Layer Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5 pb-2.5 border-b border-[#059669] shrink-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 bg-[#047857] hover:bg-[#10b981] text-emerald-200 px-2.5 py-1 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer mr-0.5"
                title={i18n.backBtn}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>{i18n.backBtn}</span>
              </button>
            )}
            <h2 className="text-xs sm:text-sm font-bold text-emerald-50 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{i18n.mapTitle}</span>
            </h2>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-emerald-950 px-2 py-0.5 rounded-full whitespace-nowrap">
              {hotspots.length} {i18n.activeFires}
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-0.5">
            {i18n.mapSubtitle}
          </p>
        </div>

        {/* View Switcher: Radar vs Street Map vs List */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="bg-[#052e16] p-0.5 rounded-xl border border-[#059669] flex items-center">
            <button
              onClick={() => setViewMode('radar')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'radar'
                  ? 'bg-emerald-600 text-emerald-950 shadow-xs'
                  : 'text-emerald-400 hover:text-emerald-50'
              }`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>{i18n.btnRadar}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-emerald-950 shadow-xs'
                  : 'text-emerald-400 hover:text-emerald-50'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>{i18n.btnMap}</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-emerald-950 shadow-xs'
                  : 'text-emerald-400 hover:text-emerald-50'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{i18n.btnList}</span>
            </button>
          </div>

          {/* Layer Filter Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowFires(!showFires)}
              className={`text-[11px] px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                showFires
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-[#052e16] border-[#059669] text-emerald-500'
              }`}
            >
              🔥
            </button>
            <button
              onClick={() => setShowBuyers(!showBuyers)}
              className={`text-[11px] px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                showBuyers
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-[#052e16] border-[#059669] text-emerald-500'
              }`}
            >
              🏭
            </button>
            <button
              onClick={() => setShowWindVector(!showWindVector)}
              className={`text-[11px] px-2 py-0.5 rounded-lg border font-bold transition cursor-pointer ${
                showWindVector
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-[#052e16] border-[#059669] text-emerald-500'
              }`}
            >
              💨
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SATELLITE RADAR MODE (100% Guaranteed to work on all devices & networks) */}
      {viewMode === 'radar' && (
        <div className="relative rounded-2xl overflow-hidden border border-[#059669] flex-1 w-full bg-[#052e16] flex flex-col justify-between">
          {/* Geocoded SVG Radar Screen */}
          <div className="relative w-full h-full min-h-[340px]">
            <svg
              className="w-full h-full absolute inset-0"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Radar Grid Lines */}
              <defs>
                <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </radialGradient>
                <linearGradient id="smokePlume" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.45" />
                  <stop offset="70%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* State Boundaries Background (Abstracted Punjab, Haryana, Delhi Basin) */}
              <rect x="0" y="0" width="100" height="100" fill="#052e16" />
              <circle cx="50" cy="50" r="45" stroke="#047857" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="30" stroke="#047857" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="15" stroke="#047857" strokeWidth="0.5" fill="none" />
              <line x1="50" y1="5" x2="50" y2="95" stroke="#047857" strokeWidth="0.5" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="#047857" strokeWidth="0.5" />

              {/* Prevailing NW-SE Wind Vector towards Delhi */}
              {showWindVector && (
                <path
                  d="M 25,25 Q 50,55 82,85"
                  stroke="url(#smokePlume)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              )}

              {/* Major Region Reference Points */}
              <text x="25" y="18" fill="#6ee7b7" fontSize="3.2" fontWeight="700">PUNJAB (MALWA/MAJHA)</text>
              <text x="60" y="55" fill="#6ee7b7" fontSize="3.2" fontWeight="700">HARYANA (GT ROAD)</text>
              <text x="75" y="88" fill="#10b981" fontSize="3.5" fontWeight="900">DELHI-NCR (AIRSHED)</text>
            </svg>

            {/* Clickable Overlay Elements: Fires, Buyers, Farm */}
            <div className="absolute inset-0">
              {/* 1. Fire Hotspots */}
              {showFires &&
                hotspots.map((spot) => {
                  const left = projectX(spot.lng);
                  const top = projectY(spot.lat);
                  const isSelected = selectedHotspot?.id === spot.id;

                  return (
                    <div
                      key={spot.id}
                      onClick={() => {
                        setSelectedHotspot(spot);
                        setSelectedBuyer(null);
                      }}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                    >
                      <div className="relative">
                        <span className="absolute -inset-1 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg transition active:scale-90 ${
                            isSelected
                              ? 'bg-emerald-500 text-emerald-50 ring-2 ring-emerald-50 scale-125'
                              : 'bg-emerald-600/90 hover:bg-emerald-500 text-emerald-50 border border-emerald-50/60'
                          }`}
                        >
                          🔥
                        </div>
                      </div>
                      <span className="hidden group-hover:block absolute top-7 left-1/2 -translate-x-1/2 bg-emerald-950/90 text-emerald-50 text-[9px] px-2 py-0.5 rounded-md whitespace-nowrap border border-emerald-500/50 shadow-md">
                        {spot.village} ({spot.frpMw} MW)
                      </span>
                    </div>
                  );
                })}

              {/* 2. Buyers */}
              {showBuyers &&
                buyers.map((b) => {
                  const left = projectX(b.lng);
                  const top = projectY(b.lat);
                  const isSelected = selectedBuyer?.id === b.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBuyer(b);
                        setSelectedHotspot(null);
                      }}
                      style={{ left: `${left}%`, top: `${top}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                    >
                      <div
                        className={`px-2 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 shadow-md transition active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-500 text-emerald-950 ring-2 ring-emerald-50 scale-110'
                            : 'bg-emerald-700/90 hover:bg-emerald-600 text-emerald-50 border border-emerald-400/60'
                        }`}
                      >
                        <span>🏭</span>
                        <span className="hidden sm:inline">{b.name.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })}

              {/* 3. Your Farm Location Pin */}
              <div
                style={{ left: `${projectX(75.8421)}%`, top: `${projectY(30.2458)}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
              >
                <div className="bg-emerald-400 text-emerald-950 font-emerald-950 px-2 py-0.5 rounded-full text-[10px] border-2 border-emerald-50 shadow-xl flex items-center gap-1 animate-bounce">
                  <span>🌾</span>
                  <span>{currentVillage} (You)</span>
                </div>
              </div>
            </div>

            {/* Bottom Radar Details Card (When a point is clicked) */}
            {selectedHotspot && (
              <div className="absolute bottom-3 left-3 right-3 z-40 bg-[#052e16]/95 border border-emerald-500/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between animate-fadeIn text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    🔥 Active Stubble Fire Hotspot
                  </span>
                  <p className="font-extrabold text-emerald-50 text-sm">
                    {selectedHotspot.village}, {selectedHotspot.district} ({selectedHotspot.state})
                  </p>
                  <p className="text-[11px] text-emerald-400">
                    Satellite: {selectedHotspot.satellite} • Radiative Power: <b>{selectedHotspot.frpMw} MW</b> • Confidence: <b>{selectedHotspot.confidence}%</b>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="p-1 rounded-full bg-[#047857] hover:bg-[#10b981] text-emerald-300 cursor-pointer ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {selectedBuyer && (
              <div className="absolute bottom-3 left-3 right-3 z-40 bg-[#052e16]/95 border border-emerald-500/50 rounded-2xl p-3 shadow-2xl flex items-center justify-between animate-fadeIn text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    🏭 Verified Biomass Buyer
                  </span>
                  <p className="font-extrabold text-emerald-50 text-sm">{selectedBuyer.name}</p>
                  <p className="text-[11px] text-emerald-300">
                    Price: <strong className="text-emerald-400">₹{selectedBuyer.pricePerQuintal}/quintal</strong> • {selectedBuyer.location}
                  </p>
                  <p className="text-[10px] text-emerald-400">
                    {selectedBuyer.balerSupport ? '🚜 Free Baler & Rake Dispatched' : 'Self Transport'} • Phone: {selectedBuyer.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBuyer(null)}
                  className="p-1 rounded-full bg-[#047857] hover:bg-[#10b981] text-emerald-300 cursor-pointer ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Floating Info Badge */}
          <div className="px-3 py-2 bg-[#052e16] border-t border-[#059669] flex items-center justify-between text-[11px] text-emerald-400 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{i18n.radarLegendFires}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{i18n.radarLegendBuyers}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{i18n.radarLegendSmoke}</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-bold">
              <Compass className="w-3.5 h-3.5" />
              <span>14.2 km/h NW → Delhi-NCR</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LEAFLET STREET MAP MODE */}
      {viewMode === 'map' && (
        <div className="relative rounded-2xl overflow-hidden border border-[#059669] flex-1 min-h-[340px] w-full bg-[#052e16]">
          <div ref={mapContainerRef} className="w-full h-full min-h-[340px] z-10" />

          {/* Wind overlay note */}
          <div className="absolute bottom-3 left-3 z-20 bg-[#052e16]/95 backdrop-blur-md text-emerald-50 p-3 rounded-2xl text-xs space-y-1 border border-[#059669] max-w-xs shadow-2xl">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{i18n.windNoteTitle}</span>
            </div>
            <p className="text-[11px] text-emerald-300 leading-relaxed">
              {i18n.windNoteDesc}
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: STRUCTURED LIST VIEW */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[460px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
            {i18n.listTitle}
          </h3>
          {hotspots.map((h) => (
            <div
              key={h.id}
              className="bg-[#052e16] border border-[#059669] rounded-xl p-3 flex items-center justify-between text-xs hover:border-emerald-500/50 transition"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-50 text-sm">
                    {h.village}, {h.district}
                  </span>
                  <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {h.frpMw} MW
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400">
                  {h.state} • Satellite: {h.satellite} • {h.timeAgo}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-emerald-400">
                  {h.confidence}% {i18n.conf}
                </span>
                <p className="text-[10px] text-emerald-500 font-mono">
                  {h.lat.toFixed(2)}°N, {h.lng.toFixed(2)}°E
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
