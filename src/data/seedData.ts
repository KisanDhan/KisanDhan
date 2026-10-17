import {
  CropInfo,
  CropType,
  Buyer,
  VillageLeaderboardItem,
  Language,
  FireHotspot,
  CalculationResult,
} from '../types.ts';

export const CROPS: Record<CropType, CropInfo> = {
  paddy_non_basmati: {
    id: 'paddy_non_basmati',
    name: {
      en: 'Paddy (Non-Basmati / PR-126, Pusa-44)',
      hi: 'गैर-बासमती धान (PR-126, पूसा-44)',
      pa: 'ਗੈਰ-ਬਾਸਮਤੀ ਝੋਨਾ (PR-126, ਪੂਸਾ-44)',
      hr: 'मोटा धान / पीली पूसा (PR-126, पूसा-44)',
    },
    residuePerAcreQuintal: 28, // 2.8 tonnes/acre
    avgPricePerQuintal: 220, // ₹2,200/tonne
    typicalMoisture: '14 - 18%',
    description: {
      en: 'High-silica, thick stubble. Premium demand by 2G ethanol refineries and biomass thermal power plants.',
      hi: 'अधिक सिलिका युक्त मोटा पराली। 2G इथेनॉल रिफाइनरियों और बायोमास थर्मल पावर प्लांटों द्वारा भारी मांग।',
      pa: 'ਉੱਚ ਸਿਲਿਕਾ ਵਾਲੀ ਮੋਟੀ ਪਰਾਲੀ। 2G ਈਥਾਨੌਲ ਰਿਫਾਇਨਰੀਆਂ ਅਤੇ ਬਾਇਓਮਾਸ ਪਾਵਰ ਪਲਾਂਟਾਂ ਵੱਲੋਂ ਭਾਰੀ ਮੰਗ।',
      hr: 'मोटी डांडी आला धान। 2G इथेनॉल अर बिजली घर वाले प्लांटां म भारी मांग सै।',
    },
  },
  paddy_basmati: {
    id: 'paddy_basmati',
    name: {
      en: 'Paddy (Basmati / 1121, 1509, 1718)',
      hi: 'बासमती धान (1121, 1509, 1718)',
      pa: 'ਬਾਸਮਤੀ ਝੋਨਾ (1121, 1509, 1718)',
      hr: 'बासमती धान (1121, 1509, 1718 मुछल)',
    },
    residuePerAcreQuintal: 22, // 2.2 tonnes/acre
    avgPricePerQuintal: 245, // ₹2,450/tonne
    typicalMoisture: '12 - 15%',
    description: {
      en: 'Soft, aromatic straw ideal for cattle fodder pellets and button mushroom composting beds across Sonepat & Kurukshetra.',
      hi: 'मुलायम, खुशबूदार पराली। पशु चारे की गोलियों और बटन मशरूम कंपोस्टिंग के लिए सर्वोत्तम।',
      pa: 'ਨਰਮ ਤੇ ਖੁਸ਼ਬੂਦਾਰ ਪਰਾਲੀ। ਪਸ਼ੂਆਂ ਦੇ ਚਾਰੇ ਅਤੇ ਖੁੰਬਾਂ (ਮਸ਼ਰੂਮ) ਦੀ ਕਾਸ਼ਤ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ।',
      hr: 'नरम अर सुगंधी पराली। ढ़ोरा कै चारे अर मशरूम खातर सबतै बढ़िया रेट मिलै सै।',
    },
  },
  wheat: {
    id: 'wheat',
    name: {
      en: 'Wheat (HD-2967, HD-3086, DBW-187)',
      hi: 'गेहूं की नरवाई (HD-2967, HD-3086)',
      pa: 'ਕਣਕ ਦਾ ਨਾੜ (HD-2967, HD-3086)',
      hr: 'गेहूं का नाड़ / तूड़ी (HD-2967, HD-3086)',
    },
    residuePerAcreQuintal: 18, // 1.8 tonnes/acre
    avgPricePerQuintal: 260, // ₹2,600/tonne
    typicalMoisture: '10 - 12%',
    description: {
      en: 'High nutritional value dry fodder (Toori/Bhusa). High-demand golden chaff for domestic dairy herds.',
      hi: 'उच्च पोषण सूखा चारा (तूड़ी/भूसा)। स्थानीय डेयरी मवेशियों के लिए सोने के भाव बिकने वाला भूसा।',
      pa: 'ਉੱਚ ਪੌਸ਼ਟਿਕ ਸੁੱਕਾ ਚਾਰਾ (ਤੂੜੀ)। ਡੇਅਰੀ ਪਸ਼ੂਆਂ ਲਈ ਸੋਨੇ ਦੇ ਭਾਅ ਵਿਕਣ ਵਾਲੀ ਤੂੜੀ।',
      hr: 'बढ़िया प्रोटीन आली तूड़ी। डेयरियां म सोने बरगे भा बिकै सै।',
    },
  },
  sugarcane: {
    id: 'sugarcane',
    name: {
      en: 'Sugarcane Trash / Leaves (Co-0238)',
      hi: 'गन्ने की पत्तियां व अगोला (Co-0238)',
      pa: 'ਗੰਨੇ ਦੀ ਖੋਰੀ ਤੇ ਪੱਤੇ (Co-0238)',
      hr: 'गन्ने की पत्ती अर अगोला (Co-0238)',
    },
    residuePerAcreQuintal: 35, // 3.5 tonnes/acre
    avgPricePerQuintal: 180, // ₹1,800/tonne
    typicalMoisture: '20 - 25%',
    description: {
      en: 'Dense, fibrous biomass from ratoon harvesting. Utilized for sugar mill cogeneration boilers.',
      hi: 'पेड़ी कटाई से प्राप्त रेशेदार बायोमास। चीनी मिल बॉयलरों और ब्रिकेट संयंत्रों में ईंधन के रूप में प्रयुक्त।',
      pa: 'ਮੋਡੀ ਫ਼ਸਲ ਤੋਂ ਪ੍ਰਾਪਤ ਰੇਸ਼ੇਦਾਰ ਬਾਇਓਮਾਸ। ਖੰਡ ਮਿੱਲਾਂ ਦੇ ਬਾਇਲਰਾਂ ਅਤੇ ਬ੍ਰਿਕੇਟਿੰਗ ਪਲਾਂਟਾਂ ਲਈ ਢੁਕਵਾਂ।',
      hr: 'गन्ने की सूखी पत्ती। चीनी मिल कै बॉयलर अर ईंट भट्ठयां म सीधा बिकै सै।',
    },
  },
};

export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number; state: 'Punjab' | 'Haryana' }> = {
  Sangrur: { lat: 30.2458, lng: 75.8421, state: 'Punjab' },
  Bathinda: { lat: 30.2110, lng: 74.9455, state: 'Punjab' },
  Ludhiana: { lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  Amritsar: { lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  Patiala: { lat: 30.3398, lng: 76.3869, state: 'Punjab' },
  Firozpur: { lat: 30.9237, lng: 74.6133, state: 'Punjab' },
  Karnal: { lat: 29.6857, lng: 76.9905, state: 'Haryana' },
  Panipat: { lat: 29.3909, lng: 76.9635, state: 'Haryana' },
  Kaithal: { lat: 29.8015, lng: 76.4019, state: 'Haryana' },
  Kurukshetra: { lat: 29.9695, lng: 76.8783, state: 'Haryana' },
  Fatehabad: { lat: 29.5186, lng: 75.4576, state: 'Haryana' },
  Sirsa: { lat: 29.5349, lng: 75.0298, state: 'Haryana' },
};

export const SEEDED_BUYERS: Buyer[] = [
  {
    id: 'b1',
    name: 'Punjab Biomass Power Plant Ltd.',
    type: 'biomass_power',
    typeName: {
      en: 'Biomass Power Plant (12 MW)',
      hi: 'बायोमास विद्युत संयंत्र (12 मेगावाट)',
      pa: 'ਬਾਇਓਮਾਸ ਬਿਜਲੀ ਪਲਾਂਟ (12 ਮੈਗਾਵਾਟ)',
      hr: 'बायोमास बिजली घर (12 मेगावाट)',
    },
    location: 'Muktsar Sahib Road',
    district: 'Sangrur',
    state: 'Punjab',
    lat: 30.2612,
    lng: 75.7891,
    pricePerQuintal: 220,
    transportSubsidyPerQuintal: 20,
    minQuantityQuintals: 40,
    maxDailyCapacityQuintals: 800,
    verified: true,
    phone: '+91-1633-261890',
    balerSupport: true,
    turnaroundHours: 36,
  },
  {
    id: 'b2',
    name: 'IOCL Panipat 2G Ethanol Bio-Refinery',
    type: 'bio_cng',
    typeName: {
      en: 'Govt. 2G Bio-Ethanol Refinery (IOCL)',
      hi: 'सरकारी 2G बायो-इथेनॉल रिफाइनरी',
      pa: 'ਸਰਕਾਰੀ 2G ਬਾਇਓ-ਈਥਾਨੌਲ ਰਿਫਾਇਨਰੀ',
      hr: 'सरकारी 2G बायो-इथेनॉल रिफाइनरी (IOCL पानीपत)',
    },
    location: 'Panipat Refinery Complex',
    district: 'Panipat',
    state: 'Haryana',
    lat: 29.4589,
    lng: 76.9241,
    pricePerQuintal: 240,
    transportSubsidyPerQuintal: 30,
    minQuantityQuintals: 50,
    maxDailyCapacityQuintals: 1500,
    verified: true,
    phone: '+91-180-2578921',
    balerSupport: true,
    turnaroundHours: 24,
  },
  {
    id: 'b3',
    name: 'Sutlej Bio-Pellets & Fuel Works',
    type: 'biomass_power',
    typeName: {
      en: 'Industrial Torrefied Pelletizer',
      hi: 'औद्योगिक बायोमास पैलेट संयंत्र',
      pa: 'ਉਦਯੋਗਿਕ ਬਾਇਓਮਾਸ ਪੈਲੇਟ ਯੂਨਿਟ',
      hr: 'बायोमास पैलेट फैक्ट्री',
    },
    location: 'Moga-Barnala Highway',
    district: 'Ludhiana',
    state: 'Punjab',
    lat: 30.8165,
    lng: 75.3717,
    pricePerQuintal: 215,
    transportSubsidyPerQuintal: 15,
    minQuantityQuintals: 30,
    maxDailyCapacityQuintals: 600,
    verified: true,
    phone: '+91-1636-224411',
    balerSupport: true,
    turnaroundHours: 48,
  },
  {
    id: 'b4',
    name: 'HAFED Mega Cattle Feed & Fodder Bank',
    type: 'cattle_fodder',
    typeName: {
      en: 'Cooperative Fodder Bank (HAFED)',
      hi: 'सहकारी चारा एवं पोषण बैंक',
      pa: 'ਸਹਿਕਾਰੀ ਪਸ਼ੂ ਖ਼ੁਰਾਕ ਬੈਂਕ',
      hr: 'हैफेड सहकारी चारा व तूड़ी बैंक',
    },
    location: 'GT Road Agro Hub',
    district: 'Kurukshetra',
    state: 'Haryana',
    lat: 29.9695,
    lng: 76.8783,
    pricePerQuintal: 250,
    transportSubsidyPerQuintal: 25,
    minQuantityQuintals: 20,
    maxDailyCapacityQuintals: 450,
    verified: true,
    phone: '+91-1744-239100',
    balerSupport: false,
    turnaroundHours: 24,
  },
  {
    id: 'b5',
    name: 'Shree Cement & NTPC Co-firing Depot',
    type: 'biomass_power',
    typeName: {
      en: 'Cement Kiln Bio-Fuel Supply',
      hi: 'सीमेंट भट्ठा बायो-ईंधन डिपो',
      pa: 'ਸੀਮਿੰਟ ਭੱਠਾ ਬਾਇਓ-ਬਾਲਣ ਡਿੱਪੂ',
      hr: 'सीमेंट भट्ठा बायो-ईंधन डिपो',
    },
    location: 'Bathinda Industrial Growth Centre',
    district: 'Bathinda',
    state: 'Punjab',
    lat: 30.2110,
    lng: 74.9455,
    pricePerQuintal: 218,
    transportSubsidyPerQuintal: 20,
    minQuantityQuintals: 60,
    maxDailyCapacityQuintals: 1000,
    verified: true,
    phone: '+91-164-2210555',
    balerSupport: true,
    turnaroundHours: 48,
  },
];

export const NASA_FIRMS_HOTSPOTS: FireHotspot[] = [
  {
    id: 'nf-1',
    lat: 30.2458,
    lng: 75.8421,
    village: 'Chhajli',
    district: 'Sangrur',
    state: 'Punjab',
    brightnessTempK: 342,
    frpMw: 24.5,
    confidence: 94,
    timeAgo: '42 mins ago',
    satellite: 'VIIRS',
    source: 'NASA FIRMS VIIRS NRT (S-NPP)',
  },
  {
    id: 'nf-2',
    lat: 30.3398,
    lng: 76.3869,
    village: 'Samana Khurd',
    district: 'Patiala',
    state: 'Punjab',
    brightnessTempK: 338,
    frpMw: 19.8,
    confidence: 89,
    timeAgo: '1 hr ago',
    satellite: 'VIIRS',
    source: 'NASA FIRMS VIIRS NRT (NOAA-20)',
  },
  {
    id: 'nf-3',
    lat: 31.2001,
    lng: 75.1205,
    village: 'Patti West',
    district: 'Tarn Taran',
    state: 'Punjab',
    brightnessTempK: 351,
    frpMw: 32.1,
    confidence: 98,
    timeAgo: '1 hr 15 mins ago',
    satellite: 'VIIRS',
    source: 'NASA FIRMS VIIRS NRT (S-NPP)',
  },
  {
    id: 'nf-4',
    lat: 29.8015,
    lng: 76.4019,
    village: 'Kalayat',
    district: 'Kaithal',
    state: 'Haryana',
    brightnessTempK: 329,
    frpMw: 14.2,
    confidence: 82,
    timeAgo: '2 hrs ago',
    satellite: 'MODIS',
    source: 'NASA FIRMS MODIS Aqua',
  },
  {
    id: 'nf-5',
    lat: 29.6857,
    lng: 76.9905,
    village: 'Nissing',
    district: 'Karnal',
    state: 'Haryana',
    brightnessTempK: 335,
    frpMw: 18.0,
    confidence: 88,
    timeAgo: '2 hrs 30 mins ago',
    satellite: 'VIIRS',
    source: 'NASA FIRMS VIIRS NRT (NOAA-20)',
  },
  {
    id: 'nf-6',
    lat: 30.4502,
    lng: 74.8912,
    village: 'Gidderbaha',
    district: 'Muktsar',
    state: 'Punjab',
    brightnessTempK: 346,
    frpMw: 26.7,
    confidence: 92,
    timeAgo: '3 hrs ago',
    satellite: 'VIIRS',
    source: 'NASA FIRMS VIIRS NRT (S-NPP)',
  },
];

export const VILLAGE_LEADERBOARD: VillageLeaderboardItem[] = [
  {
    village: 'Bhagwanpur',
    district: 'Sangrur',
    state: 'Punjab',
    stubbleDivertedTonnes: 1420,
    totalFarmerIncome: 3053000,
    firesRecordedCurrentYear: 2,
    reductionPercentage: 94,
    badge: {
      en: 'Zero-Smoke Hero 🏆',
      hi: 'धुआं-मुक्त आदर्श गांव 🏆',
      pa: 'ਧੂੰਆਂ-ਮੁਕਤ ਪਿੰਡ ਚੈਂਪੀਅਨ 🏆',
      hr: 'धुआं-मुक्त नंबर वन गाम 🏆',
    },
    rank: 1,
  },
  {
    village: 'Tarawari',
    district: 'Karnal',
    state: 'Haryana',
    stubbleDivertedTonnes: 1180,
    totalFarmerIncome: 2773000,
    firesRecordedCurrentYear: 4,
    reductionPercentage: 91,
    badge: {
      en: 'Ethanol Gold Supplier 🥇',
      hi: 'इथेनॉल गोल्ड सप्लायर 🥇',
      pa: 'ਈਥਾਨੌਲ ਗੋਲਡ ਸਪਲਾਇਰ 🥇',
      hr: 'इथेनॉल गोल्ड सप्लायर 🥇',
    },
    rank: 2,
  },
  {
    village: 'Raikot Khurd',
    district: 'Ludhiana',
    state: 'Punjab',
    stubbleDivertedTonnes: 940,
    totalFarmerIncome: 2021000,
    firesRecordedCurrentYear: 7,
    reductionPercentage: 86,
    badge: {
      en: 'Green Harvest Star 🌟',
      hi: 'हरित फसल नक्षत्र 🌟',
      pa: 'ਹਰੀ ਕ੍ਰਾਂਤੀ ਸਿਤਾਰਾ 🌟',
      hr: 'हरी क्रांति सितारा 🌟',
    },
    rank: 3,
  },
  {
    village: 'Assandh',
    district: 'Karnal',
    state: 'Haryana',
    stubbleDivertedTonnes: 860,
    totalFarmerIncome: 1935000,
    firesRecordedCurrentYear: 9,
    reductionPercentage: 82,
    badge: {
      en: 'Baler Machine Pioneer 🚜',
      hi: 'बेलर मशीन अग्रणी 🚜',
      pa: 'ਬੇਲਰ ਮਸ਼ੀਨ ਮੋਹਰੀ 🚜',
      hr: 'बेलर मशीन का सरदार 🚜',
    },
    rank: 4,
  },
];

// Calculate distance between two lat/lng points using Haversine formula (km)
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function estimateStubble(crop: CropType, acres: number) {
  const cropInfo = CROPS[crop] || CROPS.paddy_non_basmati;
  const quintals = Math.round(acres * cropInfo.residuePerAcreQuintal);
  const tonnes = Number((quintals / 10).toFixed(1));
  return { quintals, tonnes };
}

export function rankBuyers(crop: CropType, acres: number, district: string): Buyer[] {
  const userLoc = DISTRICT_COORDINATES[district] || DISTRICT_COORDINATES.Sangrur;
  const { quintals } = estimateStubble(crop, acres);

  return SEEDED_BUYERS.map((b) => {
    const dist = calculateDistanceKm(userLoc.lat, userLoc.lng, b.lat, b.lng);
    // Transport cost approximation: ₹0.40 per quintal per km, offset by transport subsidy
    const netTransportDeduction = Math.max(0, dist * 0.4 - b.transportSubsidyPerQuintal);
    const netRate = Math.round(b.pricePerQuintal - netTransportDeduction);
    const totalPayout = Math.round(netRate * quintals);

    return {
      ...b,
      distanceKm: dist,
      netEarningPerQuintal: netRate,
      totalNetPayout: totalPayout,
    };
  }).sort((a, b) => (b.totalNetPayout || 0) - (a.totalNetPayout || 0));
}

export function calculateComparison(
  crop: CropType,
  acres: number,
  district: string,
  village: string
): CalculationResult {
  const { quintals, tonnes } = estimateStubble(crop, acres);
  const ranked = rankBuyers(crop, acres, district);
  const best = ranked[0] || SEEDED_BUYERS[0];

  const grossIncome = Math.round(quintals * best.pricePerQuintal);
  const transportCost = Math.round(
    Math.max(0, (best.distanceKm || 15) * 0.4 - best.transportSubsidyPerQuintal) * quintals
  );
  const netIncome = grossIncome - transportCost;

  // Legal Burning Fine: NGT fine is ₹2,500 (<2 acres), ₹5,000 (2-5 acres), ₹15,000 (>5 acres)
  const burningFine = acres < 2 ? 2500 : acres <= 5 ? 5000 : 15000;

  // Soil nutrient loss per acre from burning:
  // 5.5 kg Nitrogen, 2.3 kg Phosphorus, 25 kg Potassium, 1.2 kg Sulphur + 400 kg Organic Carbon
  const nitrogenKg = Math.round(acres * 5.5);
  const phosphorusKg = Math.round(acres * 2.3);
  const potashKg = Math.round(acres * 25.0);
  const organicCarbonKg = Math.round(acres * 400.0);

  // Economic replacement cost of lost fertilizers (Urea + DAP + MOP) ~ ₹3,200 per acre
  const soilNutrientLossRupees = Math.round(acres * 3200);

  // Emissions: 1 tonne stubble burnt releases ~1.5 tonnes CO2 and ~12 kg PM2.5
  const co2AvoidedTonnes = Number((tonnes * 1.5).toFixed(1));
  const pm25AvoidedKg = Math.round(tonnes * 12);

  return {
    crop,
    acres,
    village,
    district,
    stubbleQuantityQuintals: quintals,
    stubbleQuantityTonnes: tonnes,
    bestBuyer: best,
    grossIncome,
    transportCost,
    netIncome,
    burningFine,
    soilNutrientLossRupees,
    soilNutrientKg: {
      nitrogen: nitrogenKg,
      phosphorus: phosphorusKg,
      potash: potashKg,
      organicCarbon: organicCarbonKg,
    },
    co2AvoidedTonnes,
    pm25AvoidedKg,
    aqiContributionAverted: `${pm25AvoidedKg} kg fine particulates diverted from Delhi-NCR air`,
  };
}

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appName: 'KisanDhan',
    appBadge: 'Beta | Real Stubble Monetization',
    appTagline: "We don't tell you not to burn. We pay you not to.",
    greetingTitle: 'Hello, Kisan Partner!',
    greetingSubtitle: 'Get cash for crop residue with free baler pickup at your farm gate.',
    acreQuestion: 'How many acres of harvest stubble do you have?',
    acresUnit: 'Acres',
    calcStubbleYield: 'Estimated Residue',
    calcMarketIncome: 'Direct Net Income',
    calcBalerSavings: 'Free In-Field Baler Pickup',
    calcFineAvoided: 'Penalties & Fines Avoided',
    sellVsBurnTitle: 'Your Crop Residue Choice',
    burnHeadline: 'If Burned in Field',
    burnCostLoss: 'Direct Loss & Penalties',
    burnSoilDamage: 'Burns 400kg Nitrogen, Phosphorus & Potash per acre',
    burnFineNote: 'Govt. Red Entry on land revenue record + ₹15,000 fine',
    sellHeadline: 'If Sold via KisanDhan',
    sellGain: 'Total Direct Benefit',
    sellFreeBaler: 'Free baler & tractor rake dispatched to your farm',
    sellDirectAccount: 'Direct Bank Transfer (DBT) within 48 hours',
    bookBalerNow: 'Schedule Farm-Gate Baler Pickup',
    topBuyersTitle: 'Verified Stubble Buyers Near You',
    distanceAway: 'km away',
    freeBalerBadge: 'Free Baler & Rake',
    advancePayBadge: 'advance DBT',
    ratePerTon: '/ton',
    chatPlaceholder: 'Ask in English, Haryanvi, Hindi, or Punjabi...',
    cameraVoiceAction: 'AI Stubble Scanner',
    cameraSubtitle: 'Camera & Voice Multimodal',
    actionScanCrop: 'Scan Crop Stubble',
    actionNearbyBuyers: 'Nearby Stubble Buyers',
    actionLeaderboard: 'Village Champions',
    actionFireMap: 'NASA Fire Hotspots',
    activeBookingsTitle: 'Your Scheduled Pickups',
    bookingConfirmed: 'Confirmed & Baler Assigned',
    viewDetails: 'View Details',
    back: 'Back',
    satelliteFiresNotice: 'NASA Satellite Fire Hotspots Detected (Punjab & Haryana)',
    viewMapButton: 'View Hotspot Map →',
    typingIndicator: 'KisanDhan AI is calculating live rates & buyers...',
    delhiPmAqi: 'Delhi PM2.5',
    windDrift: 'Wind drift toward NCR',
    bookButton: 'Book',
    stubbleEstimator: 'Scientific Stubble & Income Estimator',
  },
  hr: {
    appName: 'किसानधन',
    appBadge: 'बीटा | पराली बेचो, धन कमाओ',
    appTagline: 'म्हारा काम किसानों नै आग लाण तै रोकना कोन्या, ना फूंकाण के पईसे देणा सै।',
    greetingTitle: 'राम-राम किसान भाई!',
    greetingSubtitle: 'खेत म पराली जलान की कोई जरूरत कोन्या—फ्री बेलर बुलाओ अर सीधे रुपये पाओ।',
    acreQuestion: 'थारे खेत म कितणे एकड़ की पराली / नाड़ सै?',
    acresUnit: 'एकड़',
    calcStubbleYield: 'अंदाजन पराली वजन',
    calcMarketIncome: 'सीधी बैंक कमाई',
    calcBalerSavings: 'फ्री बेलर अर ट्रालियां की बचत',
    calcFineAvoided: 'बचया चालान अर जुर्माना',
    sellVsBurnTitle: 'थारा फैसला: आग लगाओगे या रोकड़ा कमाओगे?',
    burnHeadline: 'जे खेत म आग लगाई',
    burnCostLoss: 'सीधा नुकसान अर जुर्माना',
    burnSoilDamage: 'खेत की सारी उपजाऊ शक्ति जलगी, 400 किलो खाद का नुकसान',
    burnFineNote: 'तहसीलदार की लाल स्याही (रेड एंट्री) + ₹15,000 का सरकारी चालान',
    sellHeadline: 'जे किसानधन पै बेची',
    sellGain: 'सीधा कुल मुनाफा',
    sellFreeBaler: 'फ्री बेलर मशीन थारे खेत म खुद आग्या',
    sellDirectAccount: '48 घंटे म सीधा बैंक खाते म रुपये',
    bookBalerNow: 'खेत पै बेलर मशीन बुक करो',
    topBuyersTitle: 'थारे धोरै कै पक्के खरीदार व फैक्ट्री',
    distanceAway: 'किमी दूर',
    freeBalerBadge: 'मुफ्त बेलर मशीन',
    advancePayBadge: 'पेशगी बैंक ट्रांसफर',
    ratePerTon: '/टन',
    chatPlaceholder: 'हरियाणवी, हिन्दी, अंग्रेजी या पंजाबी म पूछो...',
    cameraVoiceAction: 'कैमरा स्कैनर',
    cameraSubtitle: 'कैमरा अर बोलकै बताओ',
    actionScanCrop: 'पराली फोटो जांच',
    actionNearbyBuyers: 'धोरै कै खरीदार',
    actionLeaderboard: 'गाम की चौधर',
    actionFireMap: 'नासा आग नक्शा',
    activeBookingsTitle: 'थारी बुक करी बेलर गाड़ियां',
    bookingConfirmed: 'मंजूर सै - बेलर चाल पड़्या',
    viewDetails: 'पूरी जानकारी',
    back: 'पाछे जाओ',
    satelliteFiresNotice: 'नासा सैटेलाइट न हरियाणा-पंजाब म आग पकड़ी',
    viewMapButton: 'नक्शा देखो →',
    typingIndicator: 'किसानधन AI ताजा मंडी रेट अर खरीदार खोज रह्या सै...',
    delhiPmAqi: 'दिल्ली प्रदूषण',
    windDrift: 'हवा का रुख एनसीआर कानी',
    bookButton: 'बुक करो',
    stubbleEstimator: 'पराली वजन अर कमाई का हिसाब',
  },
  hi: {
    appName: 'किसानधन',
    appBadge: 'बीटा | पराली से सीधी कमाई',
    appTagline: 'हम किसानों को पराली जलाने से नहीं रोकते, पराली का सही दाम देते हैं।',
    greetingTitle: 'नमस्ते, किसान भाई!',
    greetingSubtitle: 'पराली को खेत में जलाने की बजाय मुफ्त बेलर से उठवाएं और सीधे खाते में पैसे पाएं।',
    acreQuestion: 'आपके पास कितने एकड़ की पराली/नाड़ है?',
    acresUnit: 'एकड़',
    calcStubbleYield: 'अनुमानित पराली अवशेष',
    calcMarketIncome: 'सीधी शुद्ध कमाई',
    calcBalerSavings: 'मुफ्त बेलर व उठान बचत',
    calcFineAvoided: 'चालान व जुर्माने से बचत',
    sellVsBurnTitle: 'आपका विकल्प: आग या आमदनी?',
    burnHeadline: 'यदि खेत में जलाया',
    burnCostLoss: 'सीधा आर्थिक नुकसान',
    burnSoilDamage: 'प्रति एकड़ 400 किग्रा नाइट्रोजन व पोषक तत्व नष्ट',
    burnFineNote: 'खसरा गिरदावरी में रेड एंट्री + ₹15,000 तक का सरकारी चालान',
    sellHeadline: 'यदि किसानधन पर बेचा',
    sellGain: 'कुल सीधा फायदा',
    sellFreeBaler: 'मुफ्त बेलर व रेक मशीन आपके खेत पर आएगी',
    sellDirectAccount: '48 घंटे में सीधे बैंक खाते में भुगतान (DBT)',
    bookBalerNow: 'खेत पर बेलर मशीन बुक करें',
    topBuyersTitle: 'आपके नजदीकी सत्यापित खरीदार',
    distanceAway: 'किमी दूर',
    freeBalerBadge: 'मुफ्त बेलर सुविधा',
    advancePayBadge: 'अग्रिम भुगतान',
    ratePerTon: '/टन',
    chatPlaceholder: 'हरियाणवी, हिन्दी, पंजाबी या अंग्रेजी में बोलें या लिखें...',
    cameraVoiceAction: 'कैमरा एआई स्कैनर',
    cameraSubtitle: 'कैमरा व आवाज से तुरंत जांच',
    actionScanCrop: 'फसल पराली स्कैन',
    actionNearbyBuyers: 'नजदीकी खरीदार',
    actionLeaderboard: 'गांव लीडरबोर्ड',
    actionFireMap: 'नासा उपग्रह आग नक्शा',
    activeBookingsTitle: 'आपकी निर्धारित बुकिंग',
    bookingConfirmed: 'स्वीकृत - बेलर आवंटित',
    viewDetails: 'विवरण देखें',
    back: 'वापस',
    satelliteFiresNotice: 'नासा सैटेलाइट द्वारा आग के हॉटस्पॉट चिह्नित (पंजाब व हरियाणा)',
    viewMapButton: 'नक्शा देखें →',
    typingIndicator: 'किसानधन AI ताज़ा मंडी दरें व खरीदार खोज रहा है...',
    delhiPmAqi: 'दिल्ली PM2.5',
    windDrift: 'हवा का बहाव दिल्ली की ओर',
    bookButton: 'बुक करें',
    stubbleEstimator: 'पराली मात्रा व आमदनी कैलकुलेटर',
  },
  pa: {
    appName: 'ਕਿਸਾਨਧਨ',
    appBadge: 'ਬੀਟਾ | ਪਰਾਲੀ ਤੋਂ ਸਿੱਧੀ ਕਮਾਈ',
    appTagline: 'ਅਸੀਂ ਕਿਸਾਨਾਂ ਨੂੰ ਪਰਾਲੀ ਸਾੜਨ ਤੋਂ ਨਹੀਂ ਰੋਕਦੇ, ਪਰਾਲੀ ਦਾ ਪੂਰਾ ਮੁੱਲ ਦਿੰਦੇ ਹਾਂ।',
    greetingTitle: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਕਿਸਾਨ ਵੀਰੋ!',
    greetingSubtitle: 'ਖੇਤ ਵਿੱਚ ਪਰਾਲੀ ਸਾੜਨ ਦੀ ਬਜਾਏ ਮੁਫ਼ਤ ਬੇਲਰ ਰਾਹੀਂ ਚੁਕਵਾਓ ਅਤੇ ਸਿੱਧੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਪੈਸੇ ਪਾਓ।',
    acreQuestion: 'ਤੁਹਾਡੇ ਕੋਲ ਕਿੰਨੇ ਏਕੜ ਦੀ ਪਰਾਲੀ ਹੈ?',
    acresUnit: 'ਏਕੜ',
    calcStubbleYield: 'ਅੰਦਾਜ਼ਨ ਪਰਾਲੀ ਵਜ਼ਨ',
    calcMarketIncome: 'ਸਿੱਧੀ ਸ਼ੁੱਧ ਕਮਾਈ',
    calcBalerSavings: 'ਮੁਫ਼ਤ ਬੇਲਰ ਚੁਕਾਈ ਬੱਚਤ',
    calcFineAvoided: 'ਚਲਾਨ ਅਤੇ ਜੁਰਮਾਨੇ ਤੋਂ ਬਚਾਅ',
    sellVsBurnTitle: 'ਤੁਹਾਡਾ ਫੈਸਲਾ: ਅੱਗ ਜਾਂ ਆਮਦਨ?',
    burnHeadline: 'ਜੇਕਰ ਖੇਤ ਵਿੱਚ ਸਾੜਿਆ',
    burnCostLoss: 'ਸਿੱਧਾ ਨੁਕਸਾਨ ਅਤੇ ਜੁਰਮਾਨਾ',
    burnSoilDamage: 'ਜ਼ਮੀਨ ਦੀ ਉਪਜਾਊ ਸ਼ਕਤੀ ਨਸ਼ਟ, 400 ਕਿੱਲੋ ਖਾਦ ਦਾ ਨੁਕਸਾਨ',
    burnFineNote: 'ਜਮ੍ਹਾਬੰਦੀ ਵਿੱਚ ਰੈੱਡ ਐਂਟਰੀ + ₹15,000 ਤੱਕ ਸਰਕਾਰੀ ਚਲਾਨ',
    sellHeadline: 'ਜੇਕਰ ਕਿਸਾਨਧਨ ਤੇ ਵੇਚਿਆ',
    sellGain: 'ਕੁੱਲ ਸਿੱਧਾ ਲਾਭ',
    sellFreeBaler: 'ਮੁਫ਼ਤ ਬੇਲਰ ਤੇ ਟਰੈਕਟਰ ਰੇਕ ਖੇਤ ਵਿੱਚ ਪਹੁੰਚੇਗੀ',
    sellDirectAccount: '48 ਘੰਟਿਆਂ ਵਿੱਚ ਸਿੱਧਾ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਭੁਗਤਾਨ',
    bookBalerNow: 'ਖੇਤ ਵਿੱਚ ਬੇਲਰ ਮਸ਼ੀਨ ਬੁੱਕ ਕਰੋ',
    topBuyersTitle: 'ਤੁਹਾਡੇ ਨੇੜੇ ਦੇ ਤਸਦੀਕਸ਼ੁਦਾ ਖਰੀਦਦਾਰ',
    distanceAway: 'ਕਿ.ਮੀ. ਦੂਰ',
    freeBalerBadge: 'ਮੁਫ਼ਤ ਬੇਲਰ ਸਹੂਲਤ',
    advancePayBadge: 'ਅਗਾਊਂ ਭੁਗਤਾਨ',
    ratePerTon: '/ਟਨ',
    chatPlaceholder: 'ਹਰਿਆਣਵੀ, ਪੰਜਾਬੀ, ਹਿੰਦੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਲਿਖੋ...',
    cameraVoiceAction: 'ਕੈਮਰਾ AI ਸਕੈਨਰ',
    cameraSubtitle: 'ਕੈਮਰਾ ਅਤੇ ਆਵਾਜ਼ ਨਾਲ ਤੁਰੰਤ ਜਾਂਚ',
    actionScanCrop: 'ਪਰਾਲੀ ਫੋਟੋ ਸਕੈਨ',
    actionNearbyBuyers: 'ਨੇੜਲੇ ਖਰੀਦਦਾਰ',
    actionLeaderboard: 'ਪਿੰਡ ਚੈਂਪੀਅਨ',
    actionFireMap: 'ਨਾਸਾ ਅੱਗ ਨਕਸ਼ਾ',
    activeBookingsTitle: 'ਤੁਹਾਡੀਆਂ ਤੈਅ ਕੀਤੀਆਂ ਬੁਕਿੰਗਾਂ',
    bookingConfirmed: 'ਮਨਜ਼ੂਰ - ਬੇਲਰ ਭੇਜਿਆ ਗਿਆ',
    viewDetails: 'ਵੇਰਵੇ ਦੇਖੋ',
    back: 'ਪਿੱਛੇ',
    satelliteFiresNotice: 'ਨਾਸਾ ਸੈਟੇਲਾਈਟ ਵੱਲੋਂ ਅੱਗ ਦੇ ਹਾਟਸਪੌਟ ਦਰਜ (ਪੰਜਾਬ ਅਤੇ ਹਰਿਆਣਾ)',
    viewMapButton: 'ਨਕਸ਼ਾ ਦੇਖੋ →',
    typingIndicator: 'ਕਿਸਾਨਧਨ AI ਤਾਜ਼ਾ ਰੇਟ ਅਤੇ ਖਰੀਦਦਾਰ ਲੱਭ ਰਿਹਾ ਹੈ...',
    delhiPmAqi: 'ਦਿੱਲੀ ਪ੍ਰਦੂਸ਼ਣ',
    windDrift: 'ਹਵਾ ਦਾ ਰੁਖ ਦਿੱਲੀ ਵੱਲ',
    bookButton: 'ਬੁੱਕ ਕਰੋ',
    stubbleEstimator: 'ਪਰਾਲੀ ਮਾਤਰਾ ਤੇ ਕਮਾਈ ਦਾ ਹਿਸਾਬ',
  },
};
