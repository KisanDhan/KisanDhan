import React from 'react';
import { ArrowRight, CheckCircle2, XCircle, AlertOctagon, TrendingUp, DollarSign, CalendarCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { CalculationResult, Language } from '../types';
import { CROPS, TRANSLATIONS } from '../data/seedData';

interface HeroComparisonProps {
  calculation: CalculationResult;
  language: Language;
  onBookPickup: () => void;
}

export const HeroComparison: React.FC<HeroComparisonProps> = ({
  calculation,
  language,
  onBookPickup,
}) => {
  const t = TRANSLATIONS[language];
  const cropInfo = CROPS[calculation.crop];
  const totalBurnLoss = calculation.burningFine + calculation.soilNutrientLossRupees;
  const netAdvantage = calculation.netIncome + totalBurnLoss;

  return (
    <section className="bg-gradient-to-b from-emerald-100 to-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Economic Decision Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 tracking-tight">
            {language === 'pa'
              ? 'ਪਰਾਲੀ ਵੇਚੋ ਬਨਾਮ ਸਾੜੋ: ਆਰਥਿਕ ਮੁਕਾਬਲਾ'
              : language === 'hi'
              ? 'पराली बेचें बनाम जलाएं: आर्थिक तुलना'
              : 'Sell vs. Burn: The Economic Comparison'}
          </h2>
          <p className="text-sm text-emerald-600 mt-1">
            {language === 'pa'
              ? `${calculation.acres} ਏਕੜ ${cropInfo.name[language]} ਲਈ ਸਿੱਧਾ ਹਿਸਾਬ ਕਿਤਾਬ`
              : language === 'hi'
              ? `${calculation.acres} एकड़ ${cropInfo.name[language]} के लिए वास्तविक वित्तीय आकलन`
              : `Direct financial calculation for ${calculation.acres} acres of ${cropInfo.name[language]}`}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs">
          <span className="text-emerald-500 font-medium">Yield:</span>
          <span className="font-bold text-emerald-900">{calculation.stubbleQuantityQuintals} Quintals</span>
          <span className="text-emerald-300">|</span>
          <span className="font-bold text-emerald-700">{calculation.stubbleQuantityTonnes} Tonnes</span>
        </div>
      </div>

      {/* Side-by-Side Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* OPTION 1: SELL PARALI (WINNER) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-emerald-50 rounded-2xl p-6 sm:p-7 shadow-lg border-2 border-emerald-500 flex flex-col justify-between">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {language === 'pa' ? 'ਸਭ ਤੋਂ ਲਾਹੇਵੰਦ ਵਿਕਲਪ' : language === 'hi' ? 'सर्वोत्तम लाभदायक विकल्प' : 'PROFITABLE CHOICE'}
              </span>
              <span className="text-xs text-emerald-200 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-700/50">
                {calculation.bestBuyer?.name || 'Punjab Biomass Power'}
              </span>
            </div>

            <p className="text-emerald-200 text-sm font-semibold uppercase tracking-wider">
              {t.netEarned}
            </p>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl sm:text-5xl font-emerald-950 tracking-tight text-emerald-50">
                +₹{calculation.netIncome.toLocaleString('en-IN')}
              </span>
              <span className="text-emerald-300 text-sm font-medium">
                (@ ₹{calculation.bestBuyer?.pricePerQuintal || 220}/quintal)
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mb-5">
              {language === 'pa'
                ? `ਕੁੱਲ ਕੀਮਤ ₹${calculation.grossIncome.toLocaleString('en-IN')} - ਕਰਾਇਆ ₹${calculation.transportCost.toLocaleString('en-IN')} (ਖਰੀਦਦਾਰ ਵੱਲੋਂ ਛੋਟ)`
                : language === 'hi'
                ? `सकल मूल्य ₹${calculation.grossIncome.toLocaleString('en-IN')} - परिवहन ₹${calculation.transportCost.toLocaleString('en-IN')} (खरीदार सब्सिडी सहित)`
                : `Gross Value ₹${calculation.grossIncome.toLocaleString('en-IN')} minus Transport Cost ₹${calculation.transportCost.toLocaleString('en-IN')}`}
            </p>

            {/* Checklist of Gains */}
            <div className="space-y-2.5 bg-emerald-950/40 p-4 rounded-xl border border-emerald-700/40 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-emerald-100">
                  <strong>
                    {language === 'pa' ? 'ਨਕਦ ਭੁਗਤਾਨ:' : language === 'hi' ? 'नकद भुगतान:' : 'Farm-gate Payout:'}
                  </strong>{' '}
                  {language === 'pa'
                    ? 'ਖੇਤ ਵਿੱਚੋਂ ਪਰਾਲੀ ਚੁੱਕਣ ਵੇਲੇ ਸਿੱਧਾ ਕਿਸਾਨ ਦੇ ਖਾਤੇ ਜਾਂ ਹੱਥ ਵਿੱਚ'
                    : language === 'hi'
                    ? 'खेत से पराली उठते ही सीधे बैंक खाते या नकद'
                    : 'Instant digital/cash payout at pickup point'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-emerald-100">
                  <strong>
                    {language === 'pa' ? 'ਬੇਲਰ ਮਸ਼ੀਨ ਸਹਾਇਤਾ:' : language === 'hi' ? 'बेलर मशीन सुविधा:' : 'Baler Provided:'}
                  </strong>{' '}
                  {language === 'pa'
                    ? 'ਖਰੀਦਦਾਰ ਜਾਂ ਐਗਰੀਗੇਟਰ ਵੱਲੋਂ ਰਾਊਂਡ/ਸਕੁਏਅਰ ਬੇਲਰ ਮਸ਼ੀਨ ਭੇਜੀ ਜਾਵੇਗੀ'
                    : language === 'hi'
                    ? 'खरीदार द्वारा खेत पर राउंड या चौकोर बेलर मशीन भेजी जाएगी'
                    : 'Tractor baler dispatched to farm to roll stubble'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-emerald-100">
                  <strong>
                    {language === 'pa' ? 'ਕਣਕ ਬਿਜਾਈ ਸਮੇਂ ਸਿਰ:' : language === 'hi' ? 'गेहूं बुवाई समय पर:' : 'Zero Sowing Delay:'}
                  </strong>{' '}
                  {language === 'pa'
                    ? '48 ਘੰਟਿਆਂ ਵਿੱਚ ਖੇਤ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸਾਫ਼, ਕਣਕ ਦੀ ਝਾੜ ਵਿੱਚ ਕੋਈ ਕਮੀ ਨਹੀਂ'
                    : language === 'hi'
                    ? '48 घंटे में खेत पूरी तरह साफ, गेहूं उत्पादन सुरक्षित'
                    : 'Field cleared in 48h, safeguarding wheat yield'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-emerald-200">
              {language === 'pa'
                ? 'ਕੋਈ ਫਾਰਮ ਭਰਨ ਦੀ ਲੋੜ ਨਹੀਂ'
                : language === 'hi'
                ? 'कागजी झंझट मुक्त प्रक्रिया'
                : 'Zero paperwork, instant slot reservation'}
            </span>
            <button
              onClick={onBookPickup}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              <span>{t.bookPickup}</span>
              <ArrowRight className="w-4 h-4 text-emerald-900" />
            </button>
          </div>
        </div>

        {/* OPTION 2: BURN IN FIELD (PENALTIES & LOSSES) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-emerald-50 rounded-2xl p-6 sm:p-7 shadow-lg border-2 border-emerald-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                <AlertOctagon className="w-4 h-4 text-emerald-400" />
                {language === 'pa' ? 'ਨੁਕਸਾਨ ਅਤੇ ਜੁਰਮਾਨਾ' : language === 'hi' ? 'घाटा एवं कानूनी कार्रवाई' : 'FINANCIAL LOSS & RISKS'}
              </span>
              <span className="text-xs text-emerald-300 font-semibold bg-emerald-900/50 px-2.5 py-1 rounded-md border border-emerald-800">
                {language === 'pa' ? 'ਸੈਟੇਲਾਈਟ ਨਿਗਰਾਨੀ' : language === 'hi' ? 'उपग्रह सैटेलाइट चालान' : 'FIRMS Satellite Monitored'}
              </span>
            </div>

            <p className="text-emerald-300 text-sm font-semibold uppercase tracking-wider">
              {language === 'pa' ? 'ਪਰਾਲੀ ਸਾੜਨ ਤੇ ਕਮਾਈ' : language === 'hi' ? 'जलाने पर आय' : 'Income from Burning'}
            </p>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl sm:text-5xl font-emerald-950 tracking-tight text-emerald-300">
                ₹0
              </span>
              <span className="text-emerald-400 text-xs font-semibold uppercase">
                {language === 'pa' ? '+ ਮੋਟਾ ਜੁਰਮਾਨਾ' : language === 'hi' ? '+ भारी जुर्माना' : '+ Penalties & Soil Destruction'}
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 mb-5">
              {language === 'pa'
                ? `ਅੱਗ ਲਾਉਣਾ ਮੁਫ਼ਤ ਲੱਗਦਾ ਹੈ, ਪਰ ਕਿਸਾਨ ਦਾ ਕੁੱਲ ਨੁਕਸਾਨ ਲਗਭਗ ₹${totalBurnLoss.toLocaleString('en-IN')} ਹੁੰਦਾ ਹੈ`
                : language === 'hi'
                ? `जलाना मुफ्त लगता है, परंतु किसान का वास्तविक नुकसान लगभग ₹${totalBurnLoss.toLocaleString('en-IN')} होता है`
                : `Burning appears free, but causes ₹${totalBurnLoss.toLocaleString('en-IN')} in real farmer losses`}
            </p>

            {/* Breakdown of Burning Losses */}
            <div className="space-y-2.5 bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/40 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-emerald-100">
                  <strong>
                    {language === 'pa' ? 'ਸਰਕਾਰੀ ਜੁਰਮਾਨਾ (NGT Fine):' : language === 'hi' ? 'सरकारी जुर्माना (NGT):' : 'Legal Fine (NGT Order):'}
                  </strong>{' '}
                  <span className="text-emerald-300 font-bold">
                    -₹{calculation.burningFine.toLocaleString('en-IN')}
                  </span>{' '}
                  ({language === 'pa'
                    ? `${calculation.acres > 5 ? '5 ਏਕੜ ਤੋਂ ਵੱਧ' : '2-5 ਏਕੜ'} ਲਈ ਚਲਾਨ`
                    : language === 'hi'
                    ? `${calculation.acres > 5 ? '5 एकड़ से अधिक' : '2-5 एकड़'} भूमि चालान`
                    : `Penalty rate for ${calculation.acres} acres`})
                </span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-emerald-100">
                  <strong>
                    {language === 'pa' ? 'ਜ਼ਮੀਨ ਦੀ ਖਾਦ ਦਾ ਨੁਕਸਾਨ:' : language === 'hi' ? 'मिट्टी के उर्वरक का नाश:' : 'Fertilizer Nutrient Loss:'}
                  </strong>{' '}
                  <span className="text-emerald-300 font-bold">
                    -₹{calculation.soilNutrientLossRupees.toLocaleString('en-IN')}
                  </span>{' '}
                  ({language === 'pa'
                    ? `ਨਾਈਟ੍ਰੋਜਨ, ਫਾਸਫੋਰਸ, ਪੋਟਾਸ਼ ਸੜਨ ਦਾ ਘਾਟਾ`
                    : language === 'hi'
                    ? `नाइट्रोजन, फास्फोरस व पोटाश जलने का घाटा`
                    : `${calculation.soilNutrientKg.nitrogen}kg N + ${calculation.soilNutrientKg.potash}kg K lost`})
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-emerald-100">
                  <strong>
                    {language === 'pa' ? 'ਲਾਲ ਐਂਟਰੀ ਤੇ ਪੁਲਿਸ ਕੇਸ:' : language === 'hi' ? 'जमीन रिकॉर्ड में रेड एंट्री:' : 'Red Entry in Revenue Record:'}
                  </strong>{' '}
                  {language === 'pa'
                    ? 'ਖੇਤੀਬਾੜੀ ਕਰਜ਼ਾ ਅਤੇ ਸਰਕਾਰੀ ਸਬਸਿਡੀਆਂ ਬੰਦ ਹੋਣ ਦਾ ਖ਼ਤਰਾ'
                    : language === 'hi'
                    ? 'किसान क्रेडिट कार्ड व सब्सिडी रुकने का कानूनी खतरा'
                    : 'Risk of subsidy freeze & police FIR'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-emerald-800/50 flex items-center justify-between">
            <span className="text-xs text-emerald-300 font-medium">
              {language === 'pa' ? 'ਕੁੱਲ ਨੁਕਸਾਨ (ਜੁਰਮਾਨਾ + ਖਾਦ):' : language === 'hi' ? 'कुल वास्तविक नुकसान:' : 'Total Hidden Cost of Burning:'}
            </span>
            <span className="text-base font-emerald-950 text-emerald-300">
              -₹{totalBurnLoss.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Bottom Banner - Net Difference */}
      <div className="mt-6 bg-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center shrink-0 font-emerald-950 text-xl shadow-sm">
            <TrendingUp className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-emerald-950 text-emerald-900">
              {language === 'pa'
                ? `ਪਰਾਲੀ ਨਾ ਸਾੜਨ ਨਾਲ ਕੁੱਲ ₹${netAdvantage.toLocaleString('en-IN')} ਦਾ ਸਿੱਧਾ ਫਾਇਦਾ!`
                : language === 'hi'
                ? `पराली न जलाने पर किसान को कुल ₹${netAdvantage.toLocaleString('en-IN')} का शुद्ध लाभ!`
                : `Total Farmer Advantage: +₹${netAdvantage.toLocaleString('en-IN')} by Selling!`}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-600">
              {language === 'pa'
                ? `(₹${calculation.netIncome.toLocaleString('en-IN')} ਹੱਥ ਵਿੱਚ ਕਮਾਈ + ₹${totalBurnLoss.toLocaleString('en-IN')} ਜੁਰਮਾਨੇ ਅਤੇ ਜ਼ਮੀਨ ਦੇ ਨੁਕਸਾਨ ਤੋਂ ਬਚਾਅ)`
                : language === 'hi'
                ? `(₹${calculation.netIncome.toLocaleString('en-IN')} नकद आय + ₹${totalBurnLoss.toLocaleString('en-IN')} जुर्माना व खाद के नुकसान से बचाव)`
                : `(₹${calculation.netIncome.toLocaleString('en-IN')} Net Cash Payout + ₹${totalBurnLoss.toLocaleString('en-IN')} Saved in Fines & Soil Fertility)`}
            </p>
          </div>
        </div>

        <button
          onClick={onBookPickup}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-emerald-50 font-bold text-sm px-6 py-3 rounded-xl shadow-md transition active:scale-95 shrink-0 cursor-pointer"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{language === 'pa' ? 'ਅੱਜ ਹੀ ਚੁਕਾਈ ਬੁੱਕ ਕਰੋ' : language === 'hi' ? 'आज ही पिकअप बुक करें' : 'Schedule Stubble Baler Pickup'}</span>
        </button>
      </div>
    </section>
  );
};
