export type Language = 'en' | 'hi' | 'pa' | 'hr';

export type CropType = 'paddy_non_basmati' | 'paddy_basmati' | 'wheat' | 'sugarcane';

export type DetectedCropType = CropType | 'not_crop' | 'unknown';

export interface CropDetectionResponse {
  isCrop: boolean;
  cropType: DetectedCropType;
  cropName: string;
  detectedSubject?: string;
  confidence: number;
  condition: string;
  shortSpokenReply: string;
  errorMessage?: string;
}

export interface CropInfo {
  id: CropType;
  name: {
    en: string;
    hi: string;
    pa: string;
    hr: string;
  };
  residuePerAcreQuintal: number; // in Quintals (1 quintal = 100 kg)
  avgPricePerQuintal: number; // in INR
  description: {
    en: string;
    hi: string;
    pa: string;
    hr: string;
  };
  typicalMoisture: string;
}

export interface Buyer {
  id: string;
  name: string;
  type: 'biomass_power' | 'bio_cng' | 'cattle_fodder' | 'paper_packaging' | 'mushroom_substrate';
  typeName: {
    en: string;
    hi: string;
    pa: string;
    hr: string;
  };
  location: string;
  district: string;
  state: 'Punjab' | 'Haryana';
  lat: number;
  lng: number;
  pricePerQuintal: number; // Base rate offered
  transportSubsidyPerQuintal: number; // Transport support paid by buyer
  minQuantityQuintals: number;
  maxDailyCapacityQuintals: number;
  verified: boolean;
  phone: string;
  balerSupport: boolean; // Supplies baler machinery to field
  distanceKm?: number;
  netEarningPerQuintal?: number;
  totalNetPayout?: number;
  turnaroundHours: number;
}

export interface FireHotspot {
  id: string;
  lat: number;
  lng: number;
  village: string;
  district: string;
  state: string;
  brightnessTempK: number;
  frpMw: number; // Fire Radiative Power (MW)
  confidence: number; // 0 - 100%
  timeAgo: string;
  satellite: 'VIIRS' | 'MODIS';
  source?: string;
}

export interface CalculationResult {
  crop: CropType;
  acres: number;
  village: string;
  district: string;
  stubbleQuantityQuintals: number;
  stubbleQuantityTonnes: number;
  bestBuyer: Buyer | null;
  grossIncome: number;
  transportCost: number;
  netIncome: number;
  burningFine: number;
  soilNutrientLossRupees: number;
  soilNutrientKg: {
    nitrogen: number;
    phosphorus: number;
    potash: number;
    organicCarbon: number;
  };
  co2AvoidedTonnes: number;
  pm25AvoidedKg: number;
  aqiContributionAverted: string;
}

export interface PickupBooking {
  id: string;
  farmerName: string;
  phone: string;
  village: string;
  district: string;
  acres: number;
  crop: CropType;
  quantityQuintals: number;
  buyerId: string;
  buyerName: string;
  scheduledDate: string;
  timeSlot: 'Morning (07:00 - 11:00)' | 'Afternoon (11:00 - 15:00)' | 'Evening (15:00 - 19:00)';
  machineryType: 'Round Baler + Trolley' | 'Square Baler + Flatbed' | 'Straw Chopper / Mulcher';
  status: 'Confirmed' | 'Dispatched' | 'Completed';
  netPaymentExpected: number;
  operatorName: string;
  operatorPhone: string;
  createdAt: string;
}

export interface VillageLeaderboardItem {
  village: string;
  district: string;
  state: string;
  stubbleDivertedTonnes: number;
  totalFarmerIncome: number;
  firesRecordedCurrentYear: number;
  reductionPercentage: number;
  badge: {
    en: string;
    hi: string;
    pa: string;
    hr: string;
  };
  rank: number;
}

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  audioText?: string;
  cropDetected?: string;
  confidence?: number;
  suggestedAction?: string;
  timestamp: string;
}

