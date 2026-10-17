import React, { useState } from 'react';
import {
  X,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Volume2,
  Sparkles,
  UserCheck,
  CalendarCheck,
  Flame,
  Leaf,
  ShieldCheck,
} from 'lucide-react';
import { Language } from '../types';

interface GurpreetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onRunStepAction: (stepNumber: number) => void;
}

export const GurpreetDemoModal: React.FC<GurpreetDemoModalProps> = ({
  isOpen,
  onClose,
  language,
  onRunStepAction,
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Hook & The Critical 10-15 Day Dilemma',
      subtitle: 'The Real Problem Behind Delhi’s Winter Smog',
      description:
        'Every October-November, 20 million tonnes of paddy stubble are burnt across Punjab and Haryana because farmers have only 10-15 days between harvesting paddy and sowing wheat. Burning is chosen not out of desire, but because no buyer, price, or machine pickup is available in time.',
      actionLabel: 'Introduce Gurpreet Singh',
      badge: 'Hook (20s)',
    },
    {
      step: 2,
      title: 'Meet Our Farmer: Gurpreet Singh',
      subtitle: '8 Acres of Paddy, Sangrur District, 12 Days to Sow Wheat',
      description:
        'Gurpreet cannot read complex English forms or navigate complicated government subsidy portals. He opens the web app on his mobile phone and speaks in Punjabi / Hindi using the voice bot front door.',
      actionLabel: 'Show Voice Bot & Camera',
      badge: 'Farmer Persona',
    },
    {
      step: 3,
      title: 'Voice Crop Identification & Gemini Vision',
      subtitle: 'AI Identifies Residue without Farmer Typing',
      description:
        'Gurpreet taps the mic and points the phone camera at his field. Gemini 3.8 Flash Vision identifies the residue as Non-Basmati Paddy Straw (PR-126) with 94% confidence, and confirms verbally in Punjabi.',
      actionLabel: 'Analyze Residue Yield',
      badge: 'Multimodal AI',
    },
    {
      step: 4,
      title: 'Deterministic Stubble Calculation & Buyer Ranking',
      subtitle: '8 Acres = 200 Quintals (20 Tonnes) Stubble',
      description:
        'Backend deterministic tools calculate the exact yield: 200 quintals. The system ranks nearby buyers (Biomass power plants, Bio-CNG refineries, cattle fodder hubs) by Net Earning after transport. Top buyer: Punjab Biomass Power paying ₹220/quintal.',
      actionLabel: 'View Hero Comparison',
      badge: 'Matchmaking Engine',
    },
    {
      step: 5,
      title: 'Hero Screen: Sell for ₹44,000 vs. Burn for ₹0 + Penalty',
      subtitle: 'Shifting the Economics to Make Not Burning Profitable',
      description:
        'The screen presents the stark contrast: Selling gives ₹44,000 net cash directly in hand. Burning yields ₹0, incurs a ₹15,000 NGT penalty, and burns ₹9,600 worth of essential soil nutrients (NPK). Selling provides a massive +₹68,600 net advantage!',
      actionLabel: 'Schedule Baler Machine',
      badge: 'Hero Decision',
    },
    {
      step: 6,
      title: 'Closing the Loop: Guaranteed Baler Pickup Slot',
      subtitle: 'Dispatched in 48 Hours Before Wheat Sowing',
      description:
        'Gurpreet says "Book pickup" or taps the button. A round baler tractor operator is scheduled to roll and collect the straw within 48 hours, clearing the field so he can sow wheat on time without burning.',
      actionLabel: 'View Satellite Hotspots',
      badge: 'Closed Loop Logistics',
    },
    {
      step: 7,
      title: 'Live NASA FIRMS Hotspot Map & Climate Impact',
      subtitle: '29.2 Tonnes CO2 & 1,170 kg PM2.5 Avoided',
      description:
        'Satellite data displays real-time fire clusters across Punjab/Haryana with wind trajectory towards Delhi-NCR. The impact dashboard calculates verifiable emissions avoided and soil fertility preserved.',
      actionLabel: 'Finish Walkthrough',
      badge: 'Macro Impact',
    },
  ];

  const current = steps[currentStep - 1];

  const handleNext = () => {
    onRunStepAction(currentStep);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      onRunStepAction(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Indicator */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700 fill-amber-700" />
            <span>2-Minute Hackathon Pitch Demo Flow</span>
          </span>
          <span className="text-xs font-bold text-stone-400">
            Step {currentStep} of {steps.length}
          </span>
        </div>

        {/* Step Title */}
        <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-1">
          {current.title}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-emerald-700 mb-4">
          {current.subtitle}
        </p>

        {/* Step Content */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 mb-6 text-xs sm:text-sm text-stone-700 leading-relaxed space-y-3">
          <p>{current.description}</p>

          {currentStep === 2 && (
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-900">
                👨‍🌾
              </div>
              <div className="text-xs">
                <p className="font-bold text-stone-900">Gurpreet Singh (Chhajli, Sangrur)</p>
                <p className="text-stone-500">8 Acres Non-Basmati Paddy • 12 Days left to sow wheat</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="bg-emerald-100 text-emerald-950 p-2 rounded-lg font-bold">
                Sell Stubble: +₹44,000 Net
              </div>
              <div className="bg-rose-100 text-rose-950 p-2 rounded-lg font-bold">
                Burn Stubble: ₹0 + ₹15k Fine
              </div>
            </div>
          )}
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 mb-6">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => {
                setCurrentStep(s.step);
                onRunStepAction(s.step);
              }}
              className={`h-2 rounded-full transition cursor-pointer ${
                s.step === currentStep
                  ? 'w-6 bg-emerald-700'
                  : s.step < currentStep
                  ? 'w-2 bg-emerald-300'
                  : 'w-2 bg-stone-200'
              }`}
            />
          ))}
        </div>

        {/* Nav Controls */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
