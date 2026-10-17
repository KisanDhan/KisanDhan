import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  Satellite,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Info,
} from 'lucide-react';
import { Language } from '../types';

interface NasaKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const NasaKeyModal: React.FC<NasaKeyModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [currentKeyPreview, setCurrentKeyPreview] = useState('');
  const [hasConfiguredKey, setHasConfiguredKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/config/nasa-key')
        .then((r) => r.json())
        .then((d) => {
          setHasConfiguredKey(Boolean(d.hasKey));
          setCurrentKeyPreview(d.keyPreview || '');
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setSaveStatus({
        type: 'error',
        message: 'Please enter a valid 32-character NASA FIRMS Map Key.',
      });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/config/nasa-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mapKey: keyInput.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setHasConfiguredKey(true);
        setCurrentKeyPreview(data.keyPreview);
        setKeyInput('');
        setSaveStatus({
          type: 'success',
          message:
            language === 'hr'
              ? 'नासा मैप की पक्की जुड़गी! लाइव सैटेलाइट डेटा चाल पड्या।'
              : language === 'hi'
              ? 'नासा मैप की सफलतापूर्वक सुरक्षित हो गई! लाइव सैटेलाइट डेटा सक्रिय है।'
              : language === 'pa'
              ? 'ਨਾਸਾ ਮੈਪ ਕੀ ਸਫਲਤਾਪੂਰਵਕ ਸੁਰੱਖਿਅਤ ਹੋ ਗਈ ਹੈ! ਲਾਈਵ ਸੈਟੇਲਾਈਟ ਡੇਟਾ ਚਾਲੂ ਹੈ।'
              : 'NASA Map Key saved successfully! Live satellite fire feed is active.',
        });
      } else {
        setSaveStatus({
          type: 'error',
          message: data.error || 'Failed to save NASA Map Key.',
        });
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: 'Network error connecting to KisanDhan server.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyEnvSnippet = () => {
    navigator.clipboard.writeText('NASA_FIRMS_MAP_KEY="your_32_character_key_here"');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1c1d1f] border border-[#2e3134] rounded-3xl w-full max-w-md overflow-hidden text-stone-100 shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2e3134] flex items-center justify-between bg-[#131314]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                NASA FIRMS Map Key
                {hasConfiguredKey && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-stone-400">
                Direct live satellite stubble fire detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#282a2c] hover:bg-[#3c4043] flex items-center justify-center text-stone-300 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Explanation Banner */}
          <div className="bg-sky-950/40 border border-sky-600/40 rounded-2xl p-3.5 text-sky-200 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white text-[12px]">
                  Where & How to Add the NASA Map Key
                </p>
                <p className="text-[11px] text-sky-200/90 leading-relaxed">
                  NASA provides a free MAP_KEY to fetch real-time VIIRS/MODIS satellite fire anomalies directly for Indian agricultural coordinates.
                </p>
              </div>
            </div>
          </div>

          {/* Option A: Enter directly in UI */}
          <div className="bg-[#131314] border border-[#282a2c] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Option 1: Save Directly in App (Recommended)
              </span>
              {hasConfiguredKey && (
                <span className="text-[10px] text-stone-400 font-mono">
                  {currentKeyPreview}
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-2.5">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">
                  Enter your 32-character NASA Map Key:
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="e.g. 7f9a2b8e3c1d4e5f6a7b8c9d0e1f2a3b"
                  className="w-full bg-[#1e1f20] border border-[#3c4043] focus:border-amber-400 rounded-xl px-3 py-2 text-white font-mono text-xs placeholder:text-stone-600 outline-none transition"
                />
              </div>

              {saveStatus.message && (
                <div
                  className={`text-[11px] p-2.5 rounded-xl flex items-center gap-2 ${
                    saveStatus.type === 'success'
                      ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                      : 'bg-rose-950/70 border border-rose-500/50 text-rose-300'
                  }`}
                >
                  {saveStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{saveStatus.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Key...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save & Activate Live Feed</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Option B: Environment Variable */}
          <div className="bg-[#131314] border border-[#282a2c] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 text-xs">
                Option 2: Add in Environment Variables (.env)
              </span>
              <button
                type="button"
                onClick={copyEnvSnippet}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy snippet'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-400">
              Add this line in your project's <code className="text-amber-300 bg-[#282a2c] px-1 py-0.5 rounded">.env</code> file:
            </p>
            <div className="bg-[#1e1f20] border border-[#2e3134] rounded-xl p-2.5 font-mono text-[11px] text-stone-300 overflow-x-auto">
              NASA_FIRMS_MAP_KEY="your_32_character_key_here"
            </div>
          </div>

          {/* How to get a free key */}
          <div className="bg-[#18191a] border border-[#2e3134] rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white text-xs">Don't have a NASA Key yet?</p>
              <p className="text-[11px] text-stone-400">It's 100% free and takes 30 seconds.</p>
            </div>
            <a
              href="https://firms.modaps.eosdis.nasa.gov/api/map_key/"
              target="_blank"
              rel="noreferrer"
              className="bg-[#282a2c] hover:bg-[#3c4043] text-amber-400 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2e3134] bg-[#131314] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#282a2c] hover:bg-[#3c4043] text-stone-200 font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
