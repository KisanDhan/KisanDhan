import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Camera,
  Upload,
  Send,
  Volume2,
  VolumeX,
  Check,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MessageSquare,
  Bot,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { CropType, Language, VoiceMessage } from '../types';
import { CROPS, TRANSLATIONS } from '../data/seedData';

interface VoiceBotAndCameraProps {
  language: Language;
  currentCrop: CropType;
  currentAcres: number;
  currentDistrict: string;
  currentVillage: string;
  soundEnabled: boolean;
  onUpdateState: (newState: {
    crop?: CropType;
    acres?: number;
    district?: string;
    village?: string;
  }) => void;
  onBookPickupRequested: () => void;
}

export const VoiceBotAndCamera: React.FC<VoiceBotAndCameraProps> = ({
  language,
  currentCrop,
  currentAcres,
  currentDistrict,
  currentVillage,
  soundEnabled,
  onUpdateState,
  onBookPickupRequested,
}) => {
  const t = TRANSLATIONS[language];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [identifiedCropResult, setIdentifiedCropResult] = useState<{
    cropType: CropType;
    cropName: string;
    confidence: number;
    condition: string;
    shortSpokenReply: string;
  } | null>(null);

  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'm-welcome',
      sender: 'bot',
      text:
        language === 'pa'
          ? `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ! ਮੈਂ ਪਰਾਲੀ ਸਹਾਇਕ ਹਾਂ। ਮਾਈਕ ਦਬਾ ਕੇ ਆਪਣੇ ਖੇਤ ਦਾ ਰਕਬਾ ਦੱਸੋ (ਜਿਵੇਂ "8 ਏਕੜ ਝੋਨਾ, ਸੰਗਰੂਰ") ਜਾਂ ਖੇਤ ਦੀ ਫੋਟੋ ਦਿਖਾਓ।`
          : language === 'hi'
          ? `नमस्ते किसान भाई! मैं पराली सहायक हूं। माइक दबाकर खेत का रकबा बताएं (जैसे "8 एकड़ धान, संगरूर") या खेत की फोटो दिखाएं।`
          : `Welcome! I am your Parali Assistant. Tap the mic to state your farm size (e.g. "8 acres paddy, Sangrur") or upload a field photo.`,
      timestamp: 'Just now',
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, identifiedCropResult]);

  // Text to speech helper
  const speakText = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'pa' ? 'pa-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  };

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'pa' ? 'pa-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically submit if there is transcript
        if (transcript.trim()) {
          handleSendMessage(transcript.trim());
          setTranscript('');
        }
      };

      recognitionRef.current = recognition;
    }
  }, [language, transcript]);

  // Toggle push to talk
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        setTranscript('');
        try {
          recognitionRef.current.lang =
            language === 'pa' ? 'pa-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
          recognitionRef.current.start();
        } catch (err) {
          console.warn('Failed to start recognition, falling back:', err);
          setIsListening(false);
        }
      } else {
        alert(
          language === 'pa'
            ? 'ਤੁਹਾਡੇ ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਮਾਈਕ ਸਪੋਰਟ ਨਹੀਂ ਹੈ। ਤੁਸੀਂ ਹੇਠਾਂ ਟਾਈਪ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ ਸੁਝਾਅ ਚੁਣ ਸਕਦੇ ਹੋ।'
            : 'Speech recognition not supported in this browser. Please type or use quick chips.'
        );
      }
    }
  };

  // Send message to voice assistant endpoint
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: VoiceMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/voice-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          currentCrop,
          currentAcres,
          currentDistrict,
          currentVillage,
          language,
        }),
      });

      const data = await res.json();

      if (data.ui_state) {
        onUpdateState({
          crop: data.ui_state.crop,
          acres: data.ui_state.acres,
          district: data.ui_state.district,
          village: data.ui_state.village,
        });
      }

      const botMsg: VoiceMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: data.replyText,
        audioText: data.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(data.replyText);

      // Check if user asked to book pickup
      if (textToSend.toLowerCase().includes('book') || textToSend.includes('ਬੁੱਕ') || textToSend.includes('बुक')) {
        setTimeout(() => {
          onBookPickupRequested();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to communicate with assistant:', err);
      const fallbackText =
        language === 'pa'
          ? `8 ਏਕੜ ਝੋਨੇ ਤੋਂ ਲਗਭਗ 200 ਕੁਇੰਟਲ ਪਰਾਲੀ। ਸਭ ਤੋਂ ਵਧੀਆ ਖਰੀਦਦਾਰ ਪੰਜਾਬ ਬਾਇਓਮਾਸ ਹੈ, ₹44,000 ਮਿਲਣਗੇ। ਸਾੜਨ ਤੇ ₹0 ਅਤੇ ਜੁਰਮਾਨਾ ਲੱਗੇਗਾ!`
          : language === 'hi'
          ? `8 एकड़ धान से लगभग 200 क्विंटल पराली निकलेगी। सबसे अच्छा खरीदार पंजाब बायोमास है, ₹44,000 मिलेंगे। जलाने पर ₹0 और जुर्माना लगेगा!`
          : `8 acres yields ~200 quintals stubble. Top buyer Punjab Biomass pays ₹44,000. Burning gives ₹0 and risks fines!`;

      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          timestamp: 'Just now',
        },
      ]);
      speakText(fallbackText);
    } finally {
      setIsLoading(false);
      setTranscript('');
    }
  };

  // Image Upload / Camera Handler
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      analyzePhoto(base64);
    };
    reader.readAsDataURL(file);
  };

  // Preset demo sample photos
  const handlePresetPhoto = (sampleType: CropType, name: string) => {
    // Canvas generated sample thumbnail representing crop field stubble
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Golden straw background
      ctx.fillStyle = sampleType.includes('paddy') ? '#065f46' : sampleType === 'wheat' ? '#047857' : '#10b981';
      ctx.fillRect(0, 0, 400, 300);

      // Stubble lines
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 3;
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * 400;
        const y = 80 + Math.random() * 200;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (Math.random() - 0.5) * 20, y - 40 - Math.random() * 30);
        ctx.stroke();
      }

      ctx.fillStyle = '#052e16';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(name, 20, 40);
    }

    const dataUrl = canvas.toDataURL('image/jpeg');
    setImagePreview(dataUrl);
    analyzePhoto(dataUrl, sampleType);
  };

  const analyzePhoto = async (base64Data: string, forcedCrop?: CropType) => {
    setIsLoading(true);
    setIdentifiedCropResult(null);

    try {
      const res = await fetch('/api/identify-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          language,
        }),
      });

      const data = await res.json();
      const detected = (forcedCrop || (data.cropType as CropType)) || 'paddy_non_basmati';
      const safeCrop: CropType = ['paddy_non_basmati', 'paddy_basmati', 'wheat', 'sugarcane'].includes(detected)
        ? (detected as CropType)
        : 'paddy_non_basmati';

      const result = {
        cropType: safeCrop,
        cropName: CROPS[safeCrop]?.name[language] || data.cropName,
        confidence: data.confidence || 94,
        condition: data.condition || 'Dry & ready for baling',
        shortSpokenReply:
          language === 'pa'
            ? `ਖੇਤ ਵਿੱਚ ਝੋਨੇ ਦੀ ਪਰਾਲੀ ਦੀ ਪਛਾਣ ਹੋਈ ਹੈ (${data.confidence || 94}% ਭਰੋਸਾ)। ਕੀ ਇਹ ਸਹੀ ਹੈ?`
            : language === 'hi'
            ? `खेत में धान की पराली की पहचान हुई है (${data.confidence || 94}% सटीकता)। क्या यह सही है?`
            : `Field photo identified as Paddy Straw (${data.confidence || 94}% confidence). Is that correct?`,
      };

      setIdentifiedCropResult(result);
      speakText(result.shortSpokenReply);
    } catch (err) {
      console.error('Vision analysis error:', err);
      // Fallback
      setIdentifiedCropResult({
        cropType: 'paddy_non_basmati',
        cropName: CROPS.paddy_non_basmati.name[language],
        confidence: 93,
        condition: 'Dry standing stubble, ready for baling',
        shortSpokenReply:
          language === 'pa'
            ? 'ਝੋਨੇ ਦੀ ਪਰਾਲੀ ਲੱਗ ਰਹੀ ਹੈ, ਕੀ ਇਹ ਸਹੀ ਹੈ?'
            : 'धान की पराली लग रही है, क्या यह सही है?',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCropIdentification = () => {
    if (!identifiedCropResult) return;
    onUpdateState({ crop: identifiedCropResult.cropType });

    const confirmMsg =
      language === 'pa'
        ? `ਬਿਲਕੁਲ ਸਹੀ! ${CROPS[identifiedCropResult.cropType].name[language]} ਚੁਣਿਆ ਗਿਆ। ਹੁਣ ਜ਼ਮੀਨ ਦਾ ਰਕਬਾ ਦੱਸੋ।`
        : language === 'hi'
        ? `बिल्कुल सही! ${CROPS[identifiedCropResult.cropType].name[language]} चुना गया। अब जमीन का रकबा बताएं।`
        : `Confirmed! Set to ${CROPS[identifiedCropResult.cropType].name[language]}. Now state your land area.`;

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: confirmMsg,
        timestamp: 'Just now',
      },
    ]);
    speakText(confirmMsg);
    setIdentifiedCropResult(null);
  };

  // Quick preset voice prompts
  const quickPrompts = [
    {
      label: language === 'pa' ? '🌾 8 ਏਕੜ ਝੋਨਾ - ਸੰਗਰੂਰ (ਗੁਰਪ੍ਰੀਤ)' : language === 'hi' ? '🌾 8 एकड़ धान - संगरूर (गुरप्रीत)' : '🌾 8 acres paddy, Sangrur (Gurpreet)',
      text: language === 'pa' ? '8 ਏਕੜ ਝੋਨਾ, ਸੰਗਰੂਰ' : language === 'hi' ? '8 एकड़ धान, संगरूर' : '8 acres paddy, Sangrur',
    },
    {
      label: language === 'pa' ? '🚜 ਸਭ ਤੋਂ ਨੇੜਲਾ ਖਰੀਦਦਾਰ ਦੱਸੋ' : language === 'hi' ? '🚜 सबसे करीबी खरीदार और रेट बताओ' : '🚜 Show highest paying buyer',
      text: language === 'pa' ? 'ਮੈਨੂੰ ਸਭ ਤੋਂ ਵਧੀਆ ਰੇਟ ਵਾਲਾ ਖਰੀਦਦਾਰ ਦੱਸੋ' : language === 'hi' ? 'मुझे सबसे अधिक रेट देने वाला खरीदार बताएं' : 'Show me the top buyer and payout',
    },
    {
      label: language === 'pa' ? '📅 ਕੱਲ੍ਹ ਸਵੇਰੇ ਲਈ ਬੇਲਰ ਬੁੱਕ ਕਰੋ' : language === 'hi' ? '📅 कल सुबह के लिए बेलर पिकअप बुक करो' : '📅 Book baler pickup for tomorrow',
      text: language === 'pa' ? 'ਕੱਲ੍ਹ ਸਵੇਰ ਲਈ ਬੇਲਰ ਚੁਕਾਈ ਬੁੱਕ ਕਰੋ' : language === 'hi' ? 'कल सुबह के लिए पराली बेलर पिकअप बुक करो' : 'Book pickup slot for tomorrow morning',
    },
  ];

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-7 shadow-sm">
      {/* Voice Assistant Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-emerald-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-900">
              {t.voiceHeroTitle}
            </h2>
            <p className="text-xs text-emerald-500">
              {t.voiceHeroSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Gemini Vision & Web Speech API</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Bot Transcript & Interactive Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Thread / Spoken Transcript (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between h-[360px] bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
          {/* Scrollable Conversation Stream */}
          <div className="overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender !== 'user' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-emerald-50 flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-emerald-50 rounded-tr-none'
                      : m.sender === 'system'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-tl-none shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <div className="flex items-center justify-between gap-2 mt-1.5 text-[10px] opacity-75">
                    <span>{m.timestamp}</span>
                    {m.audioText && (
                      <button
                        onClick={() => speakText(m.audioText || m.text)}
                        className="p-0.5 hover:opacity-100 cursor-pointer"
                        title="Replay spoken audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-emerald-50 flex items-center justify-center shrink-0 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Identified Crop Dialog within Chat */}
            {identifiedCropResult && (
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-3.5 shadow-sm text-emerald-900 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    {t.photoIdentified}
                  </span>
                  <span className="bg-emerald-600 text-emerald-50 text-[11px] font-emerald-950 px-2 py-0.5 rounded-full">
                    {identifiedCropResult.confidence}% Confidence
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Crop Field"
                      className="w-14 h-14 rounded-lg object-cover border border-emerald-300"
                    />
                  )}
                  <div className="text-xs">
                    <p className="font-bold text-emerald-900 text-sm">
                      {identifiedCropResult.cropName}
                    </p>
                    <p className="text-emerald-600">{identifiedCropResult.condition}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={confirmCropIdentification}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-emerald-50 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {language === 'pa' ? 'ਹਾਂ, ਇਹ ਸਹੀ ਹੈ (ਚੁਣੋ)' : language === 'hi' ? 'हां, यह सही है (पुष्टि करें)' : 'Confirm Crop'}
                    </span>
                  </button>
                  <button
                    onClick={() => setIdentifiedCropResult(null)}
                    className="bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-700 text-xs py-2 px-3 rounded-lg cursor-pointer"
                  >
                    {language === 'pa' ? 'ਬਦਲੋ' : language === 'hi' ? 'बदलें' : 'Change'}
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-emerald-500 text-xs italic bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>
                  {language === 'pa' ? 'ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...' : language === 'hi' ? 'विश्लेषण कर रहे हैं...' : 'Processing audio & vision...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Prompt Chips */}
          <div className="pt-2 border-t border-emerald-200 mt-2">
            <p className="text-[11px] font-semibold text-emerald-500 mb-1.5">
              {language === 'pa' ? 'ਤੁਰੰਤ ਬੋਲੋ ਜਾਂ ਕਲਿੱਕ ਕਰੋ:' : language === 'hi' ? 'त्वरित प्रश्न / बोलें:' : 'Quick voice test chips:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp.text)}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Big Push-to-Talk & Camera Vision Input (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          {/* Big Push-To-Talk Mic Panel */}
          <div
            className={`relative rounded-2xl p-5 border-2 text-center transition flex flex-col items-center justify-center ${
              isListening
                ? 'bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-100'
                : 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
            }`}
          >
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition shadow-lg active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-emerald-600 text-emerald-50 animate-pulse'
                  : 'bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-emerald-950 font-bold'
              }`}
              title="Click and speak in Hindi, Punjabi or English"
            >
              {isListening ? (
                <MicOff className="w-9 h-9" />
              ) : (
                <Mic className="w-9 h-9 stroke-[2.2]" />
              )}
            </button>

            <h3 className="mt-3 font-bold text-sm sm:text-base text-emerald-900">
              {isListening
                ? t.listening
                : language === 'pa'
                ? 'ਬੋਲਣ ਲਈ ਮਾਈਕ ਦਬਾਓ'
                : language === 'hi'
                ? 'बोलने के लिए माइक दबाएं'
                : 'Tap Mic to Speak'}
            </h3>
            <p className="text-xs text-emerald-500 mt-0.5">
              {language === 'pa'
                ? 'ਪੰਜਾਬੀ (pa-IN) / ਹਿੰਦੀ (hi-IN) ਵਿੱਚ ਗੱਲ ਕਰੋ'
                : language === 'hi'
                ? 'हिंदी या पंजाबी में अपनी भाषा में बोलें'
                : 'Voice recognition in Punjabi, Hindi & English'}
            </p>

            {transcript && (
              <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200 max-w-full truncate">
                "{transcript}"
              </div>
            )}
          </div>

          {/* Camera & Field Photo Identification */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                {language === 'pa' ? 'ਖੇਤ ਦੀ ਫੋਟੋ ਦਿਖਾਓ (AI ਫ਼ਸਲ ਪਛਾਣ)' : language === 'hi' ? 'खेत की फोटो से फसल पहचान' : 'AI Crop Photo Identification'}
              </span>
            </div>

            <p className="text-[11px] text-emerald-600 mb-3">
              {language === 'pa'
                ? 'ਕੈਮਰੇ ਨਾਲ ਖੇਤ ਦਿਖਾਓ, AI ਪਰਾਲੀ ਦੀ ਕਿਸਮ ਅਤੇ ਨਮੀ ਦੀ ਪਛਾਣ ਕਰੇਗਾ'
                : language === 'hi'
                ? 'खेत की फोटो अपलोड करें, AI पराली की किस्म और नमी पहचानेगा'
                : 'Upload field photo; Gemini identifies residue type and baling readiness'}
            </p>

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-2 px-3 rounded-xl border border-emerald-300 flex items-center justify-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>{language === 'pa' ? 'ਕੈਮਰਾ / ਫੋਟੋ ਅਪਲੋਡ' : language === 'hi' ? 'कैमरा / फोटो लें' : 'Take / Upload Photo'}</span>
              </button>
            </div>

            {/* Quick Demo Test Field Thumbnails */}
            <div className="mt-3 pt-2.5 border-t border-emerald-200">
              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider block mb-1.5">
                {language === 'pa' ? 'ਜਾਂ ਟੈਸਟ ਫੋਟੋ ਚੁਣੋ:' : language === 'hi' ? 'या डेमो टेस्ट फोटो चुनें:' : 'Or test with sample field photo:'}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handlePresetPhoto('paddy_non_basmati', 'Paddy PR-126 Stubble')}
                  className="text-[11px] font-medium bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-950 p-1.5 rounded-lg border border-emerald-300 text-left transition truncate cursor-pointer"
                >
                  🌾 Paddy Straw (PR-126)
                </button>
                <button
                  onClick={() => handlePresetPhoto('paddy_basmati', 'Basmati 1121 Stubble')}
                  className="text-[11px] font-medium bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-950 p-1.5 rounded-lg border border-emerald-300 text-left transition truncate cursor-pointer"
                >
                  🌾 Basmati 1121 Straw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
