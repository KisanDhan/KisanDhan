import React from 'react';
import { Sprout, Volume2, VolumeX, Sparkles, AlertTriangle, Languages, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/seedData';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenDemo: () => void;
  activeBookingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  soundEnabled,
  onToggleSound,
  onOpenDemo,
  activeBookingsCount,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      {/* Top Crucial Context Banner */}
      <div className="bg-amber-950 text-amber-100 text-xs py-1.5 px-4 font-medium flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-2 mx-auto">
          <span className="inline-flex items-center gap-1 bg-amber-800 text-amber-200 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            HackSprint AgriTech
          </span>
          <span>
            {language === 'pa'
              ? 'ਹਰ ਸਾਲ 200 ਲੱਖ ਟਨ ਪਰਾਲੀ ਸਾੜੀ ਜਾਂਦੀ ਹੈ। ਅਸੀਂ ਕਿਸਾਨਾਂ ਨੂੰ ਨਾ ਸਾੜਨ ਦੇ ਪੈਸੇ ਦਿੰਦੇ ਹਾਂ।'
              : language === 'hi'
              ? 'हर वर्ष 200 लाख टन पराली जलती है। हम किसानों को न जलाने के पैसे देते हैं।'
              : 'Punjab & Haryana stubble burning emits 40% of Delhi winter smog. We pay farmers not to burn.'}
          </span>
          <span className="hidden md:inline text-amber-300 font-semibold">• 10-15 Day Wheat Sowing Window Solution</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 font-sans">
                {t.appTitle}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Real Payouts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium italic">
              "{t.tagline}"
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Pitch Demo Trigger */}
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg shadow-sm transition active:scale-95 cursor-pointer"
            title="Step-by-step 2-minute pitch demonstration with Gurpreet"
          >
            <Sparkles className="w-4 h-4 text-stone-950 fill-stone-950" />
            <span className="hidden sm:inline">Gurpreet Story</span>
            <span>2-Min Demo</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-stone-100 border-stone-200 text-stone-500'
            }`}
            title={soundEnabled ? 'Voice playback active' : 'Voice muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline font-medium">{soundEnabled ? 'Voice On' : 'Muted'}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200">
            <Languages className="w-3.5 h-3.5 text-stone-500 ml-1 mr-1.5" />
            {(['pa', 'hi', 'en'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => onLanguageChange(lang)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                  language === lang
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {lang === 'pa' ? 'ਪੰਜਾਬੀ' : lang === 'hi' ? 'हिन्दी' : 'EN'}
              </button>
            ))}
          </div>

          {/* Active Bookings Badge */}
          {activeBookingsCount > 0 && (
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{activeBookingsCount} Pickup Booked</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
