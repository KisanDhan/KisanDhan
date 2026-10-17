import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  MapPin,
  Sparkles,
  Volume2,
  VolumeX,
  CalendarCheck,
  Languages,
  ShieldCheck,
  Phone,
  FileSpreadsheet,
  ArrowLeft,
  Key,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Language, PickupBooking } from '../types';

interface FarmerProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  acres: number;
  district: string;
  village: string;
  bookings: PickupBooking[];
  onOpenDemo: () => void;
}

export const FarmerProfileDrawer: React.FC<FarmerProfileDrawerProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  soundEnabled,
  onToggleSound,
  acres,
  district,
  village,
  bookings,
  onOpenDemo,
}) => {
  const [nasaKeyInput, setNasaKeyInput] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [hasNasaKey, setHasNasaKey] = useState(false);

  useEffect(() => {
    fetch('/api/config/nasa-key')
      .then((r) => r.json())
      .then((d) => setHasNasaKey(Boolean(d.hasKey)))
      .catch(() => {});
  }, [isOpen]);

  const handleSaveNasaKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nasaKeyInput.trim()) return;

    try {
      const res = await fetch('/api/config/nasa-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapKey: nasaKeyInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setKeySaved(true);
        setHasNasaKey(true);
        setTimeout(() => setKeySaved(false), 3000);
      }
    } catch (e) {}
  };

  const i18n = {
    en: {
      profileSettings: 'Farmer Profile & Settings',
      backBtn: 'Back',
      langLabel: 'Response Language',
      audioLabel: 'Audio Voice Response',
      enabled: 'Enabled',
      muted: 'Muted',
      activeBookings: 'Active Baler Bookings',
      noBookings: 'No active bookings yet. Tap camera or bottom button to book.',
      daysToSow: '12 Days to Wheat Sowing',
      pitchBtn: 'Launch 2-Min Pitch Demo',
      paddyStraw: 'Acres Paddy',
      nasaKeyTitle: 'NASA FIRMS Satellite Key',
      nasaKeySub: 'Stream real-time satellite fire passes',
      saveKey: 'Save Key',
      saved: 'Saved!',
      getKeyFree: 'Get free key',
    },
    hi: {
      profileSettings: 'किसान प्रोफाइल एवं सेटिंग्स',
      backBtn: 'वापस',
      langLabel: 'बोलने व पढ़ने की भाषा',
      audioLabel: 'ऑडियो आवाज़ (TTS)',
      enabled: 'सक्रिय',
      muted: 'म्यूट',
      activeBookings: 'सक्रिय बेलर बुकिंग',
      noBookings: 'फिलहाल कोई बुकिंग नहीं है। कैमरा या नीचे का बटन दबाकर बुक करें।',
      daysToSow: '12 दिनों में गेहूं की बुवाई',
      pitchBtn: '2-मिनट डेमो पिच देखें',
      paddyStraw: 'एकड़ धान',
      nasaKeyTitle: 'नासा उपग्रह मैप की (Key)',
      nasaKeySub: 'लाइव सैटेलाइट आग डेटा स्ट्रीम करें',
      saveKey: 'सुरक्षित करें',
      saved: 'सफल!',
      getKeyFree: 'मुफ्त की लें',
    },
    pa: {
      profileSettings: 'ਕਿਸਾਨ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਸੈਟਿੰਗਜ਼',
      backBtn: 'ਪਿੱਛੇ',
      langLabel: 'ਬੋਲਣ ਅਤੇ ਪੜ੍ਹਨ ਦੀ ਭਾਸ਼ਾ',
      audioLabel: 'ਆਵਾਜ਼ (TTS) ਸੁਣੋ',
      enabled: 'ਚਾਲੂ ਹੈ',
      muted: 'ਬੰਦ ਹੈ',
      activeBookings: 'ਪੱਕੀਆਂ ਹੋਈਆਂ ਬੁਕਿੰਗਾਂ',
      noBookings: 'ਹਾਲੇ ਕੋਈ ਬੁਕਿੰਗ ਨਹੀਂ ਹੈ। ਕੈਮਰਾ ਜਾਂ ਹੇਠਾਂ ਦਿੱਤਾ ਬਟਨ ਦਬਾ ਕੇ ਬੁੱਕ ਕਰੋ।',
      daysToSow: '12 ਦਿਨਾਂ ਵਿੱਚ ਕਣਕ ਬੀਜਣੀ ਹੈ',
      pitchBtn: '2-ਮਿੰਟ ਡੈਮੋ ਪਿੱਚ ਚਲਾਓ',
      paddyStraw: 'ਏਕੜ ਝੋਨਾ',
      nasaKeyTitle: 'ਨਾਸਾ ਸੈਟੇਲਾਈਟ ਮੈਪ ਕੀ (Key)',
      nasaKeySub: 'ਲਾਈਵ ਸੈਟੇਲਾਈਟ ਅੱਗ ਡਾਟਾ ਪ੍ਰਾਪਤ ਕਰੋ',
      saveKey: 'ਸੇਵ ਕਰੋ',
      saved: 'ਸੇਵ ਹੋ ਗਈ!',
      getKeyFree: 'ਮੁਫ਼ਤ ਕੀ ਲਵੋ',
    },
    hr: {
      profileSettings: 'किसान प्रोफाइल अर सेटिंग्स',
      backBtn: 'वापस',
      langLabel: 'बोलण अर पढ़ण की भाषा',
      audioLabel: 'ऑडियो आवाज़ (TTS)',
      enabled: 'चालू सै',
      muted: 'म्यूट',
      activeBookings: 'सक्रिय बेलर बुकिंग',
      noBookings: 'इब तक कोई बुकिंग कोन्या। कैमरा या नीचे का बटन दाब कै बुक करो।',
      daysToSow: '12 दिनां म्हां गेहूं बीजना सै',
      pitchBtn: '2-मिनट डेमो पिच देखो',
      paddyStraw: 'एकड़ धान',
      nasaKeyTitle: 'नासा उपग्रह मैप की (Key)',
      nasaKeySub: 'लाइव सैटेलाइट आग डेटा लेओ',
      saveKey: 'सेव करो',
      saved: 'सेव हो गी!',
      getKeyFree: 'मुफ्त की लेओ',
    },
  }[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-xs bg-[#1c1d1f] text-white h-full p-5 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#2e3134]">
        <div>
          {/* Header with Back button */}
          <div className="flex items-center justify-between pb-3.5 border-b border-[#2e3134]">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-stone-200 hover:text-white bg-[#282a2c] hover:bg-[#3c4043] px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>{i18n.backBtn}</span>
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {i18n.profileSettings}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-[#282a2c] text-stone-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User Card */}
          <div className="mt-4 flex items-center gap-3 bg-[#131314] p-3.5 rounded-2xl border border-[#2e3134]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-black text-lg shadow-sm">
              GS
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Gurpreet Singh</h3>
              <p className="text-xs text-stone-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-500" />
                <span>
                  {village}, {district}
                </span>
              </p>
              <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 px-2 py-0.5 rounded-full">
                {acres} {i18n.paddyStraw} • {i18n.daysToSow}
              </span>
            </div>
          </div>

          {/* Language Selection: 4 Options with English as Default */}
          <div className="mt-5">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-stone-400" />
              <span>{i18n.langLabel}</span>
            </label>
            <div className="grid grid-cols-4 gap-1 bg-[#131314] p-1 rounded-xl border border-[#2e3134]">
              {[
                { id: 'en' as Language, label: 'EN' },
                { id: 'hi' as Language, label: 'हि' },
                { id: 'pa' as Language, label: 'ਪੰ' },
                { id: 'hr' as Language, label: 'हरि' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onLanguageChange(item.id)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer text-center ${
                    language === item.id
                      ? 'bg-emerald-600 text-stone-950 shadow-xs font-black'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Sound Toggle */}
          <div className="mt-4 flex items-center justify-between bg-[#131314] p-3 rounded-xl border border-[#2e3134]">
            <span className="text-xs font-bold text-stone-300">{i18n.audioLabel}</span>
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-[#282a2c] border-[#3c4043] text-stone-400'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? i18n.enabled : i18n.muted}</span>
            </button>
          </div>

          {/* NASA FIRMS MAP KEY SETTING */}
          <div className="mt-4 bg-[#131314] p-3 rounded-xl border border-[#2e3134] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{i18n.nasaKeyTitle}</span>
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${hasNasaKey ? 'bg-emerald-900/60 text-emerald-300' : 'bg-stone-800 text-stone-400'}`}>
                {hasNasaKey ? 'Active' : 'Unset'}
              </span>
            </div>
            <p className="text-[10px] text-stone-400">{i18n.nasaKeySub}</p>

            <form onSubmit={handleSaveNasaKey} className="flex gap-1.5">
              <input
                type="text"
                placeholder="NASA Map Key..."
                value={nasaKeyInput}
                onChange={(e) => setNasaKeyInput(e.target.value)}
                className="flex-1 bg-[#1c1d1f] border border-[#2e3134] rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold px-2 py-1 rounded-lg text-[10px] cursor-pointer"
              >
                {keySaved ? i18n.saved : i18n.saveKey}
              </button>
            </form>

            <a
              href="https://firms.modaps.eosdis.nasa.gov/api/map_key/"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5 pt-0.5"
            >
              <span>{i18n.getKeyFree}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Active Bookings */}
          <div className="mt-4">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider block mb-2 flex items-center gap-1">
              <CalendarCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>{i18n.activeBookings} ({bookings.length})</span>
            </span>
            {bookings.length === 0 ? (
              <p className="text-xs text-stone-400 bg-[#131314] p-3 rounded-xl border border-dashed border-[#2e3134]">
                {i18n.noBookings}
              </p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-[#131314] border border-[#2e3134] rounded-xl p-2.5 text-xs"
                  >
                    <div className="flex justify-between font-bold text-white">
                      <span className="font-mono text-emerald-400">{b.id}</span>
                      <span className="text-emerald-400 font-extrabold">
                        +₹{b.netPaymentExpected.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-0.5">{b.buyerName}</p>
                    <p className="text-[10px] text-stone-400 mt-1">
                      {b.scheduledDate} • {b.timeSlot}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2-Min Demo Walkthrough Trigger */}
        <div className="pt-4 border-t border-[#2e3134]">
          <button
            onClick={() => {
              onClose();
              onOpenDemo();
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-stone-950" />
            <span>{i18n.pitchBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
