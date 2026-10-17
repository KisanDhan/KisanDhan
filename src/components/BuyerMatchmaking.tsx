import React, { useState } from 'react';
import {
  Factory,
  CheckCircle,
  Truck,
  PhoneCall,
  CalendarCheck,
  ShieldCheck,
  Fuel,
  Flame,
  Award,
  Filter,
} from 'lucide-react';
import { Buyer, Language } from '../types';
import { TRANSLATIONS } from '../data/seedData';

interface BuyerMatchmakingProps {
  buyers: Buyer[];
  quantityQuintals: number;
  language: Language;
  onSelectBuyerForPickup: (buyer: Buyer) => void;
}

export const BuyerMatchmaking: React.FC<BuyerMatchmakingProps> = ({
  buyers,
  quantityQuintals,
  language,
  onSelectBuyerForPickup,
}) => {
  const t = TRANSLATIONS[language];
  const [filterType, setFilterType] = useState<string>('all');

  const filteredBuyers = buyers.filter((b) => {
    if (filterType === 'all') return true;
    return b.type === filterType;
  });

  const getBuyerIcon = (type: Buyer['type']) => {
    switch (type) {
      case 'biomass_power':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'bio_cng':
        return <Fuel className="w-5 h-5 text-emerald-600" />;
      case 'cattle_fodder':
        return <Award className="w-5 h-5 text-blue-600" />;
      default:
        return <Factory className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <section className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {t.rankedBuyersTitle}
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {buyers.length} Verified Plants
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            {t.rankedBuyersSubtitle}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {[
            { id: 'all', label: language === 'pa' ? 'ਸਾਰੇ' : language === 'hi' ? 'सभी' : 'All' },
            { id: 'biomass_power', label: 'Power Plants' },
            { id: 'bio_cng', label: 'Bio-CNG' },
            { id: 'cattle_fodder', label: 'Fodder' },
            { id: 'mushroom_substrate', label: 'Mushroom' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterType(pill.id)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                filterType === pill.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Buyer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBuyers.map((buyer, idx) => {
          const isTopMatch = idx === 0 && filterType === 'all';
          const totalEarnings = buyer.totalNetPayout || buyer.pricePerQuintal * quantityQuintals;

          return (
            <div
              key={buyer.id}
              className={`relative rounded-2xl p-5 border transition flex flex-col justify-between ${
                isTopMatch
                  ? 'bg-gradient-to-b from-emerald-50/60 to-white border-2 border-emerald-500 shadow-md ring-2 ring-emerald-100'
                  : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
              }`}
            >
              {isTopMatch && (
                <div className="absolute -top-3 left-4 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>
                    {language === 'pa' ? '#1 ਸਭ ਤੋਂ ਵੱਧ ਕਮਾਈ' : language === 'hi' ? '#1 सर्वाधिक शुद्ध आय' : '#1 Highest Net Payout'}
                  </span>
                </div>
              )}

              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2 mt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      {getBuyerIcon(buyer.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 leading-tight">
                        {buyer.name}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        {buyer.location} • {buyer.distanceKm ?? 18} km away
                      </p>
                    </div>
                  </div>

                  {buyer.verified && (
                    <span
                      className="text-emerald-700 bg-emerald-100/80 p-1 rounded-md shrink-0"
                      title="Verified Agro-Energy Buyer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Net Earnings Highlight */}
                <div className="bg-stone-50 rounded-xl p-3 my-3 border border-stone-200">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">
                        {language === 'pa' ? 'ਸ਼ੁੱਧ ਕਮਾਈ' : language === 'hi' ? 'शुद्ध नकद' : 'Net Payout'}
                      </span>
                      <span className="text-xl font-black text-emerald-800">
                        ₹{totalEarnings.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">Offered Rate</span>
                      <span className="text-xs font-bold text-stone-800">
                        ₹{buyer.pricePerQuintal}/qtl
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
                    <span>
                      Transport subsidy: <strong className="text-emerald-700">+₹{buyer.transportSubsidyPerQuintal}/qtl</strong>
                    </span>
                    <span>
                      Daily: <strong>{buyer.maxDailyCapacityQuintals} qtl</strong>
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4 text-[11px]">
                  {buyer.balerSupport && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                      <Truck className="w-3 h-3 text-amber-600" />
                      <span>{language === 'pa' ? 'ਬੇਲਰ ਮਸ਼ੀਨ ਭੇਜੇਗਾ' : language === 'hi' ? 'बेलर मशीन उपलब्ध' : 'Baler Provided'}</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md font-medium">
                    <span>Within {buyer.turnaroundHours}h pickup</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                <a
                  href={`tel:${buyer.phone}`}
                  className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition cursor-pointer"
                  title={`Call ${buyer.name}`}
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onSelectBuyerForPickup(buyer)}
                  className={`flex-1 font-bold text-xs py-2 px-3 rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isTopMatch
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>
                    {language === 'pa' ? 'ਪਿਕਅੱਪ ਬੁੱਕ ਕਰੋ' : language === 'hi' ? 'पिकअप बुक करें' : 'Book Pickup'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
