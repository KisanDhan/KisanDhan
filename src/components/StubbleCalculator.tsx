import React from 'react';
import { Calculator, Clock, MapPin, Layers, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { CropType, Language } from '../types';
import { CROPS, DISTRICT_COORDINATES, TRANSLATIONS } from '../data/seedData';

interface StubbleCalculatorProps {
  crop: CropType;
  acres: number;
  district: string;
  village: string;
  daysRemaining: number;
  language: Language;
  onCropChange: (c: CropType) => void;
  onAcresChange: (a: number) => void;
  onDistrictChange: (d: string) => void;
  onVillageChange: (v: string) => void;
  onDaysChange: (days: number) => void;
  onResetGurpreet: () => void;
}

export const StubbleCalculator: React.FC<StubbleCalculatorProps> = ({
  crop,
  acres,
  district,
  village,
  daysRemaining,
  language,
  onCropChange,
  onAcresChange,
  onDistrictChange,
  onVillageChange,
  onDaysChange,
  onResetGurpreet,
}) => {
  const t = TRANSLATIONS[language];
  const cropInfo = CROPS[crop];
  const totalQuintals = Math.round(acres * cropInfo.residuePerAcreQuintal);
  const totalTonnes = Number((totalQuintals / 10).toFixed(1));

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-900">
              {t.stubbleEstimator}
            </h2>
            <p className="text-xs text-emerald-500">
              {language === 'pa'
                ? 'ਰਕਬੇ ਅਤੇ ਫ਼ਸਲ ਦੇ ਅਧਾਰ ਤੇ ਪਰਾਲੀ ਦੀ ਸਹੀ ਮਾਤਰਾ ਅਤੇ ਕਮਾਈ ਦਾ ਹਿਸਾਬ'
                : language === 'hi'
                ? 'रकबे व फसल अनुसार पराली मात्रा और आय का सटीक अनुमान'
                : 'Scientific residue yield lookup by ICAR / PAU agriculture standards'}
            </p>
          </div>
        </div>

        {/* Gurpreet Persona Quick Reset */}
        <button
          onClick={onResetGurpreet}
          className="self-start sm:self-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
          <span>{t.sampleGurpreet}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Input 1: Crop Type */}
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            {t.cropLabel}
          </label>
          <select
            value={crop}
            onChange={(e) => onCropChange(e.target.value as CropType)}
            className="w-full bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition cursor-pointer"
          >
            {Object.keys(CROPS).map((key) => (
              <option key={key} value={key}>
                {CROPS[key as CropType].name[language]}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-emerald-500 mt-1.5 flex items-center gap-1">
            <span>Residue factor:</span>
            <span className="font-bold text-emerald-700">{cropInfo.residuePerAcreQuintal} Qtl/acre</span>
          </p>
        </div>

        {/* Input 2: Land Area (Acres) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {t.acresLabel}
            </label>
            <span className="text-sm font-emerald-950 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {acres} {language === 'pa' ? 'ਏਕੜ' : language === 'hi' ? 'एकड़' : 'Acres'}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            step={0.5}
            value={acres}
            onChange={(e) => onAcresChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-2 bg-emerald-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-emerald-400 mt-1">
            <span>1 Acre</span>
            <span>8 (Gurpreet)</span>
            <span>25</span>
            <span>50 Acres</span>
          </div>
        </div>

        {/* Input 3: District & Village */}
        <div>
          <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
            {t.districtLabel} & {t.villageLabel}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={district}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="bg-emerald-50 border border-emerald-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {Object.keys(DISTRICT_COORDINATES).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={village}
              onChange={(e) => onVillageChange(e.target.value)}
              placeholder="Village"
              className="bg-emerald-50 border border-emerald-300 rounded-xl px-2.5 py-2 text-xs font-medium text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <p className="text-[11px] text-emerald-500 mt-1.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Targeting Punjab/Haryana Bio Hubs</span>
          </p>
        </div>

        {/* Input 4: Sowing Window Countdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'pa' ? 'ਕਣਕ ਬਿਜਾਈ ਦੇ ਦਿਨ' : language === 'hi' ? 'गेहूं बुवाई में शेष दिन' : 'Sowing Window'}</span>
            </label>
            <span
              className={`text-xs font-emerald-950 px-2 py-0.5 rounded-md ${
                daysRemaining <= 5
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              {daysRemaining} Days Left
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={20}
            step={1}
            value={daysRemaining}
            onChange={(e) => onDaysChange(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-600 cursor-pointer h-2 bg-emerald-200 rounded-lg"
          />
          <p className="text-[11px] text-emerald-500 mt-1.5">
            {daysRemaining <= 7 ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Urgent: Priority Baler Dispatched
              </span>
            ) : (
              <span>Optimal 10-15 day clearing window</span>
            )}
          </p>
        </div>
      </div>

      {/* Result Metrics Bar */}
      <div className="mt-6 bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-emerald-50 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
              {language === 'pa' ? 'ਅਨੁਮਾਨਿਤ ਕੁੱਲ ਪਰਾਲੀ' : language === 'hi' ? 'अनुमानित कुल पराली' : 'Estimated Total Residue'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-emerald-950 text-emerald-900">
                {totalQuintals} Quintals
              </span>
              <span className="text-sm font-bold text-emerald-700">
                ({totalTonnes} Tonnes)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-emerald-600">
          <div>
            <span className="text-emerald-400 block font-medium">Baling Format:</span>
            <span className="font-bold text-emerald-800">Round Bales (30kg) or Square</span>
          </div>
          <div>
            <span className="text-emerald-400 block font-medium">Est. Harvester Cut:</span>
            <span className="font-bold text-emerald-800">Combine + Straw Reaper</span>
          </div>
          <div>
            <span className="text-emerald-400 block font-medium">Moisture Rating:</span>
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {cropInfo.typicalMoisture} (Optimum)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
