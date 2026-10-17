import React from 'react';
import { Trophy, Award, Flame, TrendingUp, ShieldCheck } from 'lucide-react';
import { Language, VillageLeaderboardItem } from '../types';
import { TRANSLATIONS } from '../data/seedData';

interface VillageLeaderboardProps {
  leaderboard: VillageLeaderboardItem[];
  language: Language;
}

export const VillageLeaderboard: React.FC<VillageLeaderboardProps> = ({
  leaderboard,
  language,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <section className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {t.villageLeaderboardTitle}
            </h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Zero-Smoke Badges</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {t.villageLeaderboardSubtitle}
          </p>
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      <div className="space-y-3">
        {leaderboard.map((item) => {
          return (
            <div
              key={item.village}
              className={`rounded-2xl p-4 sm:p-5 border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.rank === 1
                  ? 'bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border-amber-300 shadow-xs'
                  : 'bg-stone-50/60 hover:bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                    item.rank === 1
                      ? 'bg-amber-500 text-stone-950 font-black text-base'
                      : item.rank === 2
                      ? 'bg-stone-300 text-stone-900'
                      : item.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  #{item.rank}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-stone-900 text-base">
                      {item.village}
                    </h3>
                    <span className="text-xs text-stone-500 font-medium">
                      ({item.district}, {item.state})
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                      <Award className="w-3 h-3 text-emerald-600" />
                      <span>{item.badge[language]}</span>
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-3">
                    <span>
                      Diverted:{' '}
                      <strong className="text-stone-900">
                        {item.stubbleDivertedTonnes.toLocaleString()} tonnes
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Fire Incidents:{' '}
                      <strong className={item.firesRecordedCurrentYear === 0 ? 'text-emerald-700' : 'text-rose-600'}>
                        {item.firesRecordedCurrentYear} fires
                      </strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* Payout & Reduction Stats */}
              <div className="flex items-center gap-6 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Total Farmer Cash Paid
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-800">
                    ₹{(item.totalFarmerIncome / 100000).toFixed(1)} Lakhs
                  </span>
                </div>

                <div className="text-right pl-4 border-l border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Fire Averted
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-700 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>{item.reductionPercentage}%</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
