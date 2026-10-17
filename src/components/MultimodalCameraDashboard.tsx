import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Upload,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  FlipHorizontal,
  VideoOff,
  Video,
  ArrowLeft,
  Aperture,
  ShieldAlert,
} from 'lucide-react';
import { Buyer, CalculationResult, CropType, Language } from '../types';
import { CROPS, calculateComparison, rankBuyers, TRANSLATIONS } from '../data/seedData';

interface MultimodalCameraDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  acres: number;
  district: string;
  village: string;
  soundEnabled: boolean;
  onBookPickup: (buyer: Buyer) => void;
  onApplyCrop: (crop: CropType) => void;
}

export const MultimodalCameraDashboard: React.FC<MultimodalCameraDashboardProps> = ({
  isOpen,
  onClose,
  language,
  acres,
  district,
  village,
  soundEnabled,
  onBookPickup,
  onApplyCrop,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'results'>('camera');
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'live' | 'error'>('idle');
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [voiceReply, setVoiceReply] = useState<string>('');

  // Crop detection state: supports both valid crop and non-crop detection (e.g. selfie/person)
  const [detectionResult, setDetectionResult] = useState<{
    isCrop: boolean;
    cropType?: CropType;
    cropName?: string;
    detectedSubject?: string;
    confidence: number;
    condition: string;
    spokenReply: string;
    errorMessage?: string;
    calculation?: CalculationResult;
    topBuyer?: Buyer;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Multilingual translations for camera scanner (including Haryanvi)
  const i18n = {
    en: {
      title: 'Camera & Voice Scanner',
      live: 'Camera Live',
      connecting: 'Connecting Camera...',
      reticle: 'AIM AT PADDY STUBBLE',
      takePhoto: 'Capture Frame',
      choosePhoto: 'Upload Photo',
      retryCamera: 'Retry Camera',
      switchCam: 'Switch Camera',
      holdToSpeak: 'Push to Speak',
      listening: 'Listening...',
      backBtn: 'Back',
      demoSamples: 'Quick Test Samples:',
      analyzing: 'Gemini 3.8 Flash Vision analyzing photo...',
      estimatingYield: `Verifying crop stubble and estimating ${acres} acres yield...`,
      accuracy: 'Confidence',
      condition: 'Condition:',
      sellCardTitle: 'SELL PARALI',
      burnCardTitle: 'BURN IN FIELD',
      ngtFine: 'NGT legal penalty risk',
      zeroRupees: '₹0 Income',
      bookPickup: 'Book Baler & Pickup',
      rescan: 'Scan Again',
      notCropHeader: 'No Crop Stubble Detected',
      notCropSub: 'The uploaded photo was identified as:',
      notCropGuide: 'Please take or upload a photo of the crop stubble/straw in your harvested field.',
      tryAgain: 'Take Another Photo',
    },
    hi: {
      title: 'कैमरा व आवाज़ स्कैनर',
      live: 'कैमरा लाइव है',
      connecting: 'कैमरा शुरू हो रहा है...',
      reticle: 'धान की पराली की तरफ कैमरा करें',
      takePhoto: 'फोटो खींचें',
      choosePhoto: 'फोटो चुनें',
      retryCamera: 'कैमरा पुनः शुरू करें',
      switchCam: 'कैमरा बदलें',
      holdToSpeak: 'माइक दबाकर बोलें',
      listening: 'सुन रहे हैं...',
      backBtn: 'वापस',
      demoSamples: 'डेमो नमूने:',
      analyzing: 'फसल अवशेष की पहचान व गणना हो रही है...',
      estimatingYield: `${acres} एकड़ से पराली उपज का आकलन जारी है...`,
      accuracy: 'सटीकता',
      condition: 'अवस्था:',
      sellCardTitle: 'पराली बेचें',
      burnCardTitle: 'खेत में जलाएं',
      ngtFine: 'NGT जुर्माना जोखिम',
      zeroRupees: '₹0 कमाई',
      bookPickup: 'बेलिंग व उठान बुक करें',
      rescan: 'दोबारा स्कैन करें',
      notCropHeader: 'पराली / फसल अवशेष नहीं मिला',
      notCropSub: 'इस फोटो में पहचाना गया विषय:',
      notCropGuide: 'यह फोटो किसी व्यक्ति, चेहरे या कमरे की है। कृपया अपने कटे हुए खेत की पराली की फोटो लें।',
      tryAgain: 'दूसरी फोटो लें',
    },
    pa: {
      title: 'ਕੈਮਰਾ ਤੇ ਆਵਾਜ਼ ਸਕੈਨਰ',
      live: 'ਕੈਮਰਾ ਚਾਲੂ ਹੈ (ਲਾਈਵ)',
      connecting: 'ਕੈਮਰਾ ਚਾਲੂ ਹੋ ਰਿਹਾ ਹੈ...',
      reticle: 'ਝੋਨੇ ਦੀ ਪਰਾਲੀ ਵੱਲ ਕੈਮਰਾ ਕਰੋ',
      takePhoto: 'ਫੋਟੋ ਖਿੱਚੋ',
      choosePhoto: 'ਫੋਟੋ ਚੁਣੋ',
      retryCamera: 'ਕੈਮਰਾ ਮੁੜ ਚਾਲੂ ਕਰੋ',
      switchCam: 'ਕੈਮਰਾ ਬਦਲੋ',
      holdToSpeak: 'ਮਾਈਕ ਦਬਾ ਕੇ ਬੋਲੋ',
      listening: 'ਸੁਣ ਰਿਹਾ ਹੈ...',
      backBtn: 'ਪਿੱਛੇ',
      demoSamples: 'ਡੈਮੋ ਨਮੂਨੇ:',
      analyzing: 'ਫ਼ਸਲ ਦੀ ਰਹਿੰਦ-ਖੂਹੰਦ ਦੀ ਪਛਾਣ ਹੋ ਰਹੀ ਹੈ...',
      estimatingYield: `${acres} ਏਕੜ ਤੋਂ ਪਰਾਲੀ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਇਆ ਜਾ ਰਿਹਾ ਹੈ...`,
      accuracy: 'ਸ਼ੁੱਧਤਾ',
      condition: 'ਹਾਲਤ:',
      sellCardTitle: 'ਪਰਾਲੀ ਵੇਚੋ',
      burnCardTitle: 'ਖੇਤ ਵਿੱਚ ਸਾੜੋ',
      ngtFine: 'NGT ਜੁਰਮਾਨਾ ਜੋਖਮ',
      zeroRupees: '₹0 ਆਮਦਨ',
      bookPickup: 'ਬੇਲਰ ਚੁਕਾਈ ਬੁੱਕ ਕਰੋ',
      rescan: 'ਦੁਬਾਰਾ ਸਕੈਨ ਕਰੋ',
      notCropHeader: 'ਖੇਤ ਦੀ ਪਰਾਲੀ ਨਹੀਂ ਮਿਲੀ',
      notCropSub: 'ਇਸ ਫੋਟੋ ਵਿੱਚ ਪਛਾਣੀ ਗਈ ਚੀਜ਼:',
      notCropGuide: 'ਇਹ ਫੋਟੋ ਕਿਸੇ ਵਿਅਕਤੀ ਜਾਂ ਕਮਰੇ ਦੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਖੇਤ ਦੀ ਪਰਾਲੀ ਦੀ ਫੋਟੋ ਲਓ।',
      tryAgain: 'ਦੂਜੀ ਫੋਟੋ ਲਓ',
    },
    hr: {
      title: 'कैमरा अर आवाज़ स्कैनर',
      live: 'कैमरा लाइव चाल्या सै',
      connecting: 'कैमरा जुड़ रह्या सै...',
      reticle: 'धान की पराली कानी कैमरा करो',
      takePhoto: 'फोटो खींचो',
      choosePhoto: 'फोटो छांटो',
      retryCamera: 'कैमरा फेर चलाओ',
      switchCam: 'कैमरा बदलो',
      holdToSpeak: 'माइक दाब कै बोलो',
      listening: 'सुणूं सूं...',
      backBtn: 'वापस',
      demoSamples: 'खेत के नमूने:',
      analyzing: 'Gemini AI पराली की पड़ताल कर रह्या सै...',
      estimatingYield: `${acres} एकड़ खेत तै पराली अर नफे का हिसाब लग रह्या सै...`,
      accuracy: 'सटीकता',
      condition: 'हालत:',
      sellCardTitle: 'पराली बेचो',
      burnCardTitle: 'खेत म्हां आग लाओ',
      ngtFine: 'NGT का सरकारी जुर्माना',
      zeroRupees: '₹0 कमाई',
      bookPickup: 'बेलर अर ट्राली बुक करो',
      rescan: 'फेर तै स्कैन करो',
      notCropHeader: 'खेत की पराली कोन्या मिली',
      notCropSub: 'फोटो म्हां पाई गई चीज:',
      notCropGuide: 'यो फोटो किसे माणस या कमरे का सै। आपणे खेत म्हां पड़ी पराली की फोटो खींचो।',
      tryAgain: 'दोबारा फोटो खींचो',
    },
  }[language];

  // Speak response helper
  const speak = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'pa' ? 'pa-IN' : language === 'en' ? 'en-IN' : 'hi-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus('idle');
  }, []);

  // Safe attach stream to video element
  const bindStreamToVideo = useCallback((stream: MediaStream) => {
    streamRef.current = stream;
    const v = videoRef.current;
    if (v) {
      v.srcObject = stream;
      v.muted = true;
      v.defaultMuted = true;
      v.setAttribute('playsinline', 'true');
      v.setAttribute('autoplay', 'true');

      const playPromise = v.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setCameraStatus('live'))
          .catch((err) => {
            console.warn('Video play promise rejected:', err);
            setCameraStatus('live');
          });
      }
    }
  }, []);

  // Start Camera with resilient fallbacks
  const startCamera = useCallback(async (preferredFacing: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraStatus('requesting');
    setCameraErrorMsg('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('error');
      setCameraErrorMsg('Camera access is not supported on this browser or connection. Please use file/photo capture.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: preferredFacing },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: false,
      });

      bindStreamToVideo(stream);
      return;
    } catch (firstErr: any) {
      console.warn('Ideal facingMode camera failed, trying generic video constraint:', firstErr);
    }

    try {
      const fallbackStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      bindStreamToVideo(fallbackStream);
    } catch (secondErr: any) {
      console.error('All camera attempts failed:', secondErr);
      setCameraStatus('error');
      if (secondErr.name === 'NotAllowedError' || secondErr.name === 'PermissionDeniedError') {
        setCameraErrorMsg('Camera permission was denied. Please allow camera access in browser settings, or upload a photo.');
      } else {
        setCameraErrorMsg(`Camera error (${secondErr.name || 'Unavailable'}). Use photo upload or sample buttons below.`);
      }
    }
  }, [facingMode, stopCamera, bindStreamToVideo]);

  const toggleFacingMode = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab('camera');
      setCapturedImage(null);
      startCamera();

      const intro =
        language === 'pa'
          ? 'ਕੈਮਰਾ ਚਾਲੂ ਹੈ। ਖੇਤ ਦੀ ਪਰਾਲੀ ਦਿਖਾਓ ਅਤੇ ਮਾਈਕ ਦਬਾ ਕੇ ਬੋਲੋ।'
          : language === 'hi'
          ? 'कैमरा चालू है। खेत की पराली दिखाएं और माइक दबाकर बोलें।'
          : language === 'hr'
          ? 'कैमरा चाल्या सै। खेत की पराली दिखाओ अर माइक दाब कै बोलो।'
          : 'Camera active. Point at crop stubble in your field and tap capture.';
      setVoiceReply(intro);
      speak(intro);
    } else {
      stopCamera();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleBack = () => {
    if (activeTab === 'results') {
      setActiveTab('camera');
      startCamera();
    } else {
      stopCamera();
      onClose();
    }
  };

  // Capture frame from live video feed
  const capturePhoto = () => {
    if (videoRef.current && (cameraStatus === 'live' || streamRef.current)) {
      try {
        const video = videoRef.current;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCapturedImage(dataUrl);
          stopCamera();
          processImageWithGemini(dataUrl);
          return;
        }
      } catch (err) {
        console.warn('Canvas frame capture error, falling to file input:', err);
      }
    }

    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImage(base64);
      stopCamera();
      processImageWithGemini(base64);
    };
    reader.readAsDataURL(file);
  };

  // Process image with Gemini 3.8 Flash Vision with strict non-crop rejection
  const processImageWithGemini = async (base64Img: string, forcedCrop?: CropType) => {
    setIsAnalyzing(true);
    setActiveTab('results');

    try {
      const response = await fetch('/api/identify-crop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Img,
          language,
        }),
      });

      const data = await response.json();

      // CASE 1: Image is NOT crop residue (e.g. selfie, human face, indoor object)
      if (data.isCrop === false || data.cropType === 'not_crop') {
        const subject = data.detectedSubject || 'Person / Face';
        const spoken = data.shortSpokenReply || i18n.notCropGuide;

        setDetectionResult({
          isCrop: false,
          detectedSubject: subject,
          confidence: data.confidence || 98,
          condition: 'Non-agricultural image',
          spokenReply: spoken,
          errorMessage: data.errorMessage || i18n.notCropGuide,
        });

        setVoiceReply(spoken);
        speak(spoken);
        return;
      }

      // CASE 2: Genuine crop residue detected!
      const detectedCrop: CropType = forcedCrop || data.cropType || 'paddy_non_basmati';
      onApplyCrop(detectedCrop);

      const calc = calculateComparison(detectedCrop, acres, district, village);
      const ranked = rankBuyers(detectedCrop, acres, district);
      const topBuyer = ranked[0];

      const spoken =
        language === 'pa'
          ? `ਇਹ ${CROPS[detectedCrop].name.pa} ਹੈ (${data.confidence || 94}% ਭਰੋਸਾ)। ${acres} ਏਕੜ ਤੋਂ ${calc.stubbleQuantityQuintals} ਕੁਇੰਟਲ ਪਰਾਲੀ ਨਿਕਲੇਗੀ। ${topBuyer.name} ਤੋਂ ₹${calc.netIncome.toLocaleString('en-IN')} ਮਿਲਣਗੇ। ਸਾੜਨ ਨਾਲ ₹0 ਅਤੇ ₹${calc.burningFine.toLocaleString('en-IN')} ਜੁਰਮਾਨਾ ਲੱਗੇਗਾ!`
          : language === 'hr'
          ? `यो ${CROPS[detectedCrop].name.hr} सै (${data.confidence || 94}% सटीकता)। ${acres} एकड़ तै ${calc.stubbleQuantityQuintals} क्विंटल पराली निकळेगी। ${topBuyer.name} थानै ₹${calc.netIncome.toLocaleString('en-IN')} देवैगा। आग लाण पै ₹0 अर जुर्माना लागैगा!`
          : language === 'hi'
          ? `यह ${CROPS[detectedCrop].name.hi} है (${data.confidence || 94}% सटीकता)। ${acres} एकड़ से ${calc.stubbleQuantityQuintals} क्विंटल पराली निकलेगी। ${topBuyer.name} आपको ₹${calc.netIncome.toLocaleString('en-IN')} देंगे।`
          : `Identified as ${CROPS[detectedCrop].name.en} (${data.confidence || 94}% confidence). Yield: ${calc.stubbleQuantityQuintals} quintals. Top verified buyer ${topBuyer.name} pays ₹${calc.netIncome.toLocaleString('en-IN')} net.`;

      setDetectionResult({
        isCrop: true,
        cropType: detectedCrop,
        cropName: CROPS[detectedCrop].name[language],
        confidence: data.confidence || 94,
        condition: data.condition || 'Dry and ready for baling',
        spokenReply: spoken,
        calculation: calc,
        topBuyer,
      });

      setVoiceReply(spoken);
      speak(spoken);
    } catch (err) {
      console.error('Vision analysis error:', err);
      const fallbackSpoken = 'Could not verify crop stubble in photo. Please ensure good lighting and aim at the field.';
      setDetectionResult({
        isCrop: false,
        detectedSubject: 'Unrecognized Image',
        confidence: 0,
        condition: 'Analysis Failed',
        spokenReply: fallbackSpoken,
        errorMessage: 'Could not detect crop stubble. Please try again with a clear photo of your field.',
      });
      setVoiceReply(fallbackSpoken);
      speak(fallbackSpoken);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Push-to-Talk Mic Handler
  const toggleSpeechRecognition = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'pa' ? 'pa-IN' : language === 'en' ? 'en-IN' : 'hi-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          text += e.results[i][0].transcript;
        }
        setSpokenTranscript(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        if (spokenTranscript.trim()) {
          handleSpokenQuery(spokenTranscript.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const handleSpokenQuery = async (query: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          currentCrop: detectionResult?.cropType || 'paddy_non_basmati',
          currentAcres: acres,
          currentDistrict: district,
          currentVillage: village,
          language,
        }),
      });

      const data = await res.json();
      setVoiceReply(data.replyText);
      speak(data.replyText);

      if (data.ui_state?.calculation && detectionResult?.isCrop) {
        setDetectionResult((prev) => ({
          ...prev!,
          cropType: data.ui_state.crop,
          cropName: CROPS[data.ui_state.crop as CropType]?.name[language] || 'Paddy',
          calculation: data.ui_state.calculation,
          topBuyer: data.ui_state.topBuyer,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#131314] flex flex-col justify-between text-white animate-fadeIn overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#282a2c] bg-[#131314]/95 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 bg-[#282a2c] hover:bg-[#3c4043] text-stone-200 px-2.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer mr-0.5"
            title={i18n.backBtn}
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>{i18n.backBtn}</span>
          </button>

          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{i18n.title}</span>
              {(cameraStatus === 'live' || streamRef.current) && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </h2>
            <p className="text-[10px] text-stone-400">
              {cameraStatus === 'live' || streamRef.current
                ? `${i18n.live} (${facingMode === 'environment' ? 'Rear' : 'Front'})`
                : cameraStatus === 'requesting'
                ? i18n.connecting
                : i18n.choosePhoto}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(cameraStatus === 'live' || streamRef.current) && (
            <button
              onClick={toggleFacingMode}
              className="p-2 rounded-xl bg-[#282a2c] hover:bg-[#3c4043] text-stone-300 cursor-pointer"
              title={i18n.switchCam}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl bg-[#282a2c] hover:bg-[#3c4043] text-stone-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 relative overflow-y-auto p-4 flex flex-col items-center justify-center">
        {activeTab === 'camera' && (
          <div className="w-full max-w-sm flex flex-col items-center">
            {/* Viewfinder Screen */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-black border-2 border-emerald-500/70 shadow-2xl flex items-center justify-center">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.muted = true;
                    el.defaultMuted = true;
                    el.play().then(() => setCameraStatus('live')).catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  v.play().then(() => setCameraStatus('live')).catch(() => {});
                }}
                onCanPlay={() => setCameraStatus('live')}
                onPlaying={() => setCameraStatus('live')}
                className="w-full h-full object-cover"
              />

              {!streamRef.current && cameraStatus !== 'live' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#1e1f20]/95 z-10">
                  {cameraStatus === 'requesting' ? (
                    <>
                      <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
                      <p className="text-xs font-bold text-white">{i18n.connecting}</p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        Please grant camera permissions when prompted.
                      </p>
                    </>
                  ) : (
                    <>
                      <VideoOff className="w-10 h-10 text-stone-500 mb-2" />
                      <p className="text-xs font-bold text-white mb-1">
                        {cameraErrorMsg || 'Camera preview unavailable'}
                      </p>
                      <p className="text-[11px] text-stone-400 mb-4">
                        You can take a photo with your device camera or pick a file.
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startCamera()}
                          className="bg-[#282a2c] hover:bg-[#3c4043] text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>{i18n.retryCamera}</span>
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{i18n.choosePhoto}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Viewfinder Reticle */}
              <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-2 z-10">
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></span>
                  <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></span>
                </div>
                <div className="text-center text-[10px] font-mono bg-black/60 text-emerald-300 px-2 py-0.5 rounded-full mx-auto backdrop-blur-xs">
                  {i18n.reticle}
                </div>
                <div className="flex justify-between">
                  <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></span>
                  <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></span>
                </div>
              </div>

              {/* Shutter Button */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-20 pointer-events-auto">
                <button
                  onClick={capturePhoto}
                  className="w-14 h-14 rounded-full bg-white/90 hover:bg-white text-stone-950 p-1 flex items-center justify-center shadow-2xl active:scale-95 transition cursor-pointer ring-4 ring-emerald-500/50"
                  title={i18n.takePhoto}
                >
                  <div className="w-11 h-11 rounded-full border-2 border-stone-950 flex items-center justify-center bg-emerald-500 text-stone-950">
                    <Aperture className="w-6 h-6" />
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Farm Samples */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto w-full pb-1 text-xs">
              <span className="text-[10px] text-stone-500 shrink-0">{i18n.demoSamples}</span>
              <button
                onClick={() => {
                  setCapturedImage(null);
                  processImageWithGemini('sample_paddy', 'paddy_non_basmati');
                }}
                className="bg-[#1e1f20] hover:bg-[#282a2c] text-stone-200 px-2.5 py-1 rounded-lg border border-[#2e3134] whitespace-nowrap cursor-pointer"
              >
                🌾 Paddy PR-126
              </button>
              <button
                onClick={() => {
                  setCapturedImage(null);
                  processImageWithGemini('sample_basmati', 'paddy_basmati');
                }}
                className="bg-[#1e1f20] hover:bg-[#282a2c] text-stone-200 px-2.5 py-1 rounded-lg border border-[#2e3134] whitespace-nowrap cursor-pointer"
              >
                🌾 Basmati Straw
              </button>
              <button
                onClick={() => {
                  setCapturedImage(null);
                  processImageWithGemini('sample_wheat', 'wheat');
                }}
                className="bg-[#1e1f20] hover:bg-[#282a2c] text-stone-200 px-2.5 py-1 rounded-lg border border-[#2e3134] whitespace-nowrap cursor-pointer"
              >
                🌾 Wheat Turi
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: AI Vision Results */}
        {activeTab === 'results' && (
          <div className="w-full max-w-sm space-y-3">
            {isAnalyzing ? (
              <div className="text-center py-10">
                <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mx-auto mb-3" />
                <p className="text-xs font-bold text-white">{i18n.analyzing}</p>
                <p className="text-[11px] text-stone-400 mt-1">{i18n.estimatingYield}</p>
              </div>
            ) : detectionResult ? (
              <div className="space-y-3 animate-fadeIn">
                {/* CHECK: Was this a non-crop image (like a selfie or person)? */}
                {!detectionResult.isCrop ? (
                  <div className="bg-amber-950/60 border-2 border-amber-500/80 rounded-2xl p-4 text-white space-y-3">
                    <div className="flex items-center gap-2.5 text-amber-400">
                      <ShieldAlert className="w-6 h-6 shrink-0" />
                      <div>
                        <h3 className="text-sm font-black">{i18n.notCropHeader}</h3>
                        <p className="text-[11px] text-amber-200/90 mt-0.5">
                          {i18n.notCropSub} <strong className="text-white underline">{detectionResult.detectedSubject}</strong>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed bg-[#131314]/80 p-3 rounded-xl border border-amber-500/30">
                      {detectionResult.errorMessage || i18n.notCropGuide}
                    </p>

                    {/* Audio playback of warning */}
                    <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                      <span className="italic text-[11px]">"{voiceReply || detectionResult.spokenReply}"</span>
                      <button
                        onClick={() => speak(voiceReply || detectionResult.spokenReply)}
                        className="p-1.5 rounded-lg bg-[#282a2c] hover:bg-[#3c4043] text-amber-400 cursor-pointer shrink-0 ml-2"
                        title="Replay Voice"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('camera');
                        startCamera();
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{i18n.tryAgain}</span>
                    </button>
                  </div>
                ) : (
                  /* Genuine Crop Residue Verified Screen */
                  <div className="space-y-3">
                    <div className="bg-[#1e1f20] border border-[#2e3134] p-4 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                            Crop Identified (Gemini Vision)
                          </span>
                          <h3 className="text-lg font-black text-white mt-0.5">
                            {detectionResult.cropName}
                          </h3>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {i18n.condition} {detectionResult.condition}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full">
                            {detectionResult.confidence}% {i18n.accuracy}
                          </span>
                          <p className="text-[10px] text-stone-400 mt-1">
                            {acres} Acres • {detectionResult.calculation?.stubbleQuantityQuintals} qtl
                          </p>
                        </div>
                      </div>

                      {/* Audio reply banner */}
                      <div className="mt-3 pt-2.5 border-t border-[#2e3134] flex items-center justify-between text-xs text-stone-300">
                        <p className="text-[11px] leading-relaxed italic pr-2">
                          "{voiceReply || detectionResult.spokenReply}"
                        </p>
                        <button
                          onClick={() => speak(voiceReply || detectionResult.spokenReply)}
                          className="p-1.5 rounded-lg bg-[#282a2c] hover:bg-[#3c4043] text-emerald-400 cursor-pointer shrink-0"
                          title="Replay Voice"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Financial Comparison Box (Sell vs Burn) */}
                    {detectionResult.calculation && detectionResult.topBuyer && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-emerald-950/70 border border-emerald-500/80 rounded-2xl p-3 text-white">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                            {i18n.sellCardTitle}
                          </span>
                          <div className="text-xl font-black text-emerald-300 my-0.5">
                            +₹{detectionResult.calculation.netIncome.toLocaleString('en-IN')}
                          </div>
                          <p className="text-[10px] text-emerald-200">
                            {detectionResult.topBuyer.name}
                          </p>
                        </div>

                        <div className="bg-rose-950/70 border border-rose-600/70 rounded-2xl p-3 text-white">
                          <span className="text-[10px] font-bold text-rose-400 uppercase block">
                            {i18n.burnCardTitle}
                          </span>
                          <div className="text-xl font-black text-rose-400 my-0.5">
                            {i18n.zeroRupees}
                          </div>
                          <p className="text-[10px] text-rose-300">
                            -₹{detectionResult.calculation.burningFine.toLocaleString('en-IN')} {i18n.ngtFine}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 1-Tap Booking Button */}
                    {detectionResult.topBuyer && (
                      <button
                        onClick={() => {
                          stopCamera();
                          onClose();
                          onBookPickup(detectionResult.topBuyer!);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95 cursor-pointer"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>{i18n.bookPickup}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTab('camera');
                        startCamera();
                      }}
                      className="w-full bg-[#1e1f20] hover:bg-[#282a2c] text-stone-300 py-2 rounded-xl text-xs font-bold border border-[#2e3134] flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{i18n.rescan}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Hidden File Input for Device Camera Capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Bottom Bar: Action Shutter, Push to Talk, Photo Upload */}
      <div className="p-3 bg-[#131314]/95 border-t border-[#282a2c] shrink-0">
        <div className="max-w-sm mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 bg-[#1e1f20] hover:bg-[#282a2c] border border-[#2e3134] text-stone-300 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>{i18n.choosePhoto}</span>
          </button>

          <button
            onClick={toggleSpeechRecognition}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 fill-stone-950" />}
            <span>{isListening ? i18n.listening : i18n.holdToSpeak}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
