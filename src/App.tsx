import React, { useState, useRef, useEffect } from 'react';
import {
  Sprout,
  Camera,
  Paperclip,
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  TrendingUp,
  Flame,
  Factory,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  X,
  ExternalLink,
  MapPin,
  Leaf,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Satellite,
  Key,
  Newspaper,
  Compass,
} from 'lucide-react';
import {
  Buyer,
  CalculationResult,
  CropType,
  FireHotspot,
  Language,
  PickupBooking,
} from './types';
import {
  CROPS,
  SEEDED_BUYERS,
  NASA_FIRMS_HOTSPOTS,
  VILLAGE_LEADERBOARD,
  calculateComparison,
  rankBuyers,
  TRANSLATIONS,
} from './data/seedData';
import { PickupSchedulerModal } from './components/PickupSchedulerModal';
import { GurpreetDemoModal } from './components/GurpreetDemoModal';
import { MultimodalCameraDashboard } from './components/MultimodalCameraDashboard';
import { FarmerProfileDrawer } from './components/FarmerProfileDrawer';
import { HotspotMap } from './components/HotspotMap';
import { NasaKeyModal } from './components/NasaKeyModal';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  audioText?: string;
  cardType?: 'sell_vs_burn' | 'buyers' | 'map' | 'impact' | 'calculator' | 'non_crop_warning';
  detectedSubject?: string;
  sources?: { title: string; url: string }[];
  timestamp: string;
}

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  timeAgo: string;
}

export default function App() {
  // English is default as requested
  const [language, setLanguage] = useState<Language>('en');
  const [crop, setCrop] = useState<CropType>('paddy_non_basmati');
  const [acres, setAcres] = useState<number>(8);
  const [district, setDistrict] = useState<string>('Sangrur');
  const [village, setVillage] = useState<string>('Chhajli');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals & Drawers
  const [isCameraDashboardOpen, setIsCameraDashboardOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);
  const [isNasaKeyModalOpen, setIsNasaKeyModalOpen] = useState(false);
  const [isNewsDrawerOpen, setIsNewsDrawerOpen] = useState(false);
  const [selectedBuyerForPickup, setSelectedBuyerForPickup] = useState<Buyer | null>(null);

  // Real Web Scraped Indian Agri News Feed
  const [scrapedNews, setScrapedNews] = useState<NewsItem[]>([]);
  const [hasNasaKey, setHasNasaKey] = useState(false);

  // Chat conversation state
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Calculations
  const [calculation, setCalculation] = useState<CalculationResult>(() =>
    calculateComparison('paddy_non_basmati', 8, 'Sangrur', 'Chhajli')
  );
  const [buyers, setBuyers] = useState<Buyer[]>(() =>
    rankBuyers('paddy_non_basmati', 8, 'Sangrur')
  );
  const [hotspots] = useState<FireHotspot[]>(NASA_FIRMS_HOTSPOTS);
  const [bookings, setBookings] = useState<PickupBooking[]>([]);

  const [liveWeather, setLiveWeather] = useState<{
    tempC: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    delhiPm25: number;
    delhiAqiCategory: string;
  } | null>(null);

  // Localized texts
  const i18n = {
    en: {
      appName: 'KisanDhan',
      appSubName: 'Beta',
      tagline: "We don't tell you not to burn. We pay you not to.",
      greeting: 'Hello, Kisan Partner',
      homeBack: 'Home',
      back: 'Back',
      selectLand: 'Select Land:',
      acreUnit: 'Acres',
      liveDelhiAQI: 'Live Delhi PM2.5:',
      windLabel: 'Wind:',
      windNW: 'km/h NW',
      actionCameraTitle: 'Camera & Voice',
      actionCameraSub: 'Scan field & speak',
      actionSellTitle: 'Sell vs Burn (+₹44k)',
      actionSellSub: 'Net profit comparison',
      actionBuyersTitle: 'Top Buyers',
      actionBuyersSub: 'Highest paying plants',
      actionMapTitle: 'NASA Fire Map',
      actionMapSub: 'Active smoke vector',
      querySell: 'What is the sell profit vs burn?',
      queryBuyers: 'Show me top verified buyers',
      placeholder: 'Ask in English, Haryanvi, Hindi...',
      fileAttached: 'Field photo attached',
      typingText: 'KisanDhan is verifying photo & live rates...',
      sellHeader: 'SELL PARALI',
      burnHeader: 'BURN IN FIELD',
      burnFineRisk: 'NGT fine risk',
      bookBalerBtn: 'Book Baler & Pickup',
      bookBtn: 'Book',
      firesDetected: 'Satellite Fire Hotspots Detected',
      windHeadingDelhi: 'Wind Drift: 14.2 km/h heading to Delhi-NCR',
      viewMapBtn: 'View Hotspot Map →',
      groundedInSearch: 'Grounded in Indian Mandi & Govt Portals:',
      micError: 'Speech recognition not supported in browser.',
      newsFeedTitle: 'Real-Time Indian Agri & Mandi Updates',
    },
    hr: {
      appName: 'KisanDhan',
      appSubName: 'किसानधन (बीटा)',
      tagline: 'म्हारा काम किसानों नै आग लाण तै रोकना कोन्या, ना फूंकाण के पईसे देणा सै।',
      greeting: 'राम-राम किसान भाई',
      homeBack: 'मुख्य पृष्ठ',
      back: 'वापस',
      selectLand: 'खेत का रकबा छांटो:',
      acreUnit: 'एकड़',
      liveDelhiAQI: 'लाइव दिल्ली PM2.5:',
      windLabel: 'हवा:',
      windNW: 'किमी/घंटा (दिल्ली कानी)',
      actionCameraTitle: 'कैमरा अर बोल कै',
      actionCameraSub: 'खेत दिखाओ अर हरियाणवी म्हां बोलो',
      actionSellTitle: 'पराली बेचो (+₹44k)',
      actionSellSub: 'नफा बनाम जुर्माना',
      actionBuyersTitle: 'पक्के खरीदार',
      actionBuyersSub: 'सब तै घणा भाव',
      actionMapTitle: 'नासा आग मैप',
      actionMapSub: 'दिल्ली कानी धुआं',
      querySell: 'पराली बेचण पै कितणा नफा मिलैगा?',
      queryBuyers: 'सब तै बढ़िया खरीदार बताओ',
      placeholder: 'हरियाणवी, हिन्दी, अंग्रेजी म्हां पूछो...',
      fileAttached: 'खेत की फोटो लगा दी',
      typingText: 'KisanDhan लाइव रेट अर मशीनां की जांच कर रह्या सै...',
      sellHeader: 'पराली बेचो',
      burnHeader: 'खेत म्हां आग लाओ',
      burnFineRisk: 'NGT का सरकारी जुर्माना',
      bookBalerBtn: 'बेलर अर ट्राली बुक करो',
      bookBtn: 'बुक करो',
      firesDetected: 'उपग्रह नै पकड़ी आग के बिंदु',
      windHeadingDelhi: 'हवा की चाल: 14.2 किमी/घंटा दिल्ली कानी',
      viewMapBtn: 'नक्शा देखो →',
      groundedInSearch: 'भारतीय मंडी व सरकारी पोर्टल तै सत्यापित:',
      micError: 'ब्राउज़र म्हां माइक सपोर्ट कोन्या।',
      newsFeedTitle: 'ताजा भारतीय कृषि व पराली नीतियां',
    },
    hi: {
      appName: 'KisanDhan',
      appSubName: 'किसानधन (बीटा)',
      tagline: 'हम किसानों को पराली जलाने से नहीं रोकते, पराली का सही दाम देते हैं।',
      greeting: 'नमस्ते, किसान भाई',
      homeBack: 'मुख्य पृष्ठ',
      back: 'वापस',
      selectLand: 'खेत का रकबा चुनें:',
      acreUnit: 'एकड़',
      liveDelhiAQI: 'लाइव दिल्ली PM2.5:',
      windLabel: 'हवा:',
      windNW: 'किमी/घंटा (दिल्ली की ओर)',
      actionCameraTitle: 'कैमरा व आवाज़',
      actionCameraSub: 'खेत दिखाएं व बोलें',
      actionSellTitle: 'पराली बेचें (+₹44k)',
      actionSellSub: 'सीधा मुनाफा बनाम जुर्माना',
      actionBuyersTitle: 'सत्यापित खरीदार',
      actionBuyersSub: 'उच्चतम दर देने वाले प्लांट',
      actionMapTitle: 'नासा आग मैप',
      actionMapSub: 'दिल्ली की ओर धुआं',
      querySell: 'पराली बेचने पर कितना लाभ होगा?',
      queryBuyers: 'नजदीकी शीर्ष खरीदार दिखाएं',
      placeholder: 'पराली, भाव या मशीनों के बारे में पूछें...',
      fileAttached: 'खेत की फोटो संलग्न है',
      typingText: 'किसानधन ताज़ा मंडी दर व खरीदारों की जांच कर रहा है...',
      sellHeader: 'पराली बेचें',
      burnHeader: 'खेत में जलाएं',
      burnFineRisk: 'सरकारी जुर्माना जोखिम',
      bookBalerBtn: 'बेलर व उठान बुक करें',
      bookBtn: 'बुक करें',
      firesDetected: 'नासा उपग्रह द्वारा आग चिह्नित',
      windHeadingDelhi: 'हवा का बहाव: 14.2 किमी/घंटा दिल्ली की ओर',
      viewMapBtn: 'नक्शा देखें →',
      groundedInSearch: 'भारतीय मंडी व कृषि पोर्टल से सत्यापित:',
      micError: 'ब्राउज़र में माइक समर्थित नहीं है।',
      newsFeedTitle: 'ताज़ा भारतीय कृषि व पराली नीतियां',
    },
    pa: {
      appName: 'KisanDhan',
      appSubName: 'ਕਿਸਾਨਧਨ (ਬੀਟਾ)',
      tagline: 'ਅਸੀਂ ਕਿਸਾਨਾਂ ਨੂੰ ਪਰਾਲੀ ਸਾੜਨ ਤੋਂ ਨਹੀਂ ਰੋਕਦੇ, ਪਰਾਲੀ ਦਾ ਪੂਰਾ ਮੁੱਲ ਦਿੰਦੇ ਹਾਂ।',
      greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਕਿਸਾਨ ਵੀਰੋ',
      homeBack: 'ਮੁੱਖ ਪੰਨਾ',
      back: 'ਪਿੱਛੇ',
      selectLand: 'ਜ਼ਮੀਨ ਦਾ ਰਕਬਾ ਚੁਣੋ:',
      acreUnit: 'ਏਕੜ',
      liveDelhiAQI: 'ਲਾਈਵ ਦਿੱਲੀ PM2.5:',
      windLabel: 'ਹਵਾ:',
      windNW: 'ਕਿਮੀ/ਘੰਟਾ (ਦਿੱਲੀ ਵੱਲ)',
      actionCameraTitle: 'ਕੈਮਰਾ ਤੇ ਆਵਾਜ਼',
      actionCameraSub: 'ਖੇਤ ਦਿਖਾਓ ਅਤੇ ਬੋਲੋ',
      actionSellTitle: 'ਪਰਾਲੀ ਵੇਚੋ (+₹44k)',
      actionSellSub: 'ਮੁਨਾਫਾ ਬਨਾਮ ਜੁਰਮਾਨਾ',
      actionBuyersTitle: 'ਵੱਡੇ ਖਰੀਦਦਾਰ',
      actionBuyersSub: 'ਸਭ ਤੋਂ ਵੱਧ ਭਾਅ',
      actionMapTitle: 'ਨਾਸਾ ਅੱਗ ਮੈਪ',
      actionMapSub: 'ਦਿੱਲੀ ਵੱਲ ਧੂੰਆਂ',
      querySell: 'ਪਰਾਲੀ ਵੇਚਣ ਤੇ ਕਿੰਨਾ ਮੁਨਾਫ਼ਾ ਹੋਵੇਗਾ?',
      queryBuyers: 'ਸਭ ਤੋਂ ਵਧੀਆ ਖਰੀਦਦਾਰ ਦਿਖਾਓ',
      placeholder: 'ਪੰਜਾਬੀ, ਹਰਿਆਣਵੀ, ਹਿੰਦੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਪੁੱਛੋ...',
      fileAttached: 'ਖੇਤ ਦੀ ਫੋਟੋ ਲਗਾਈ ਗਈ',
      typingText: 'ਕਿਸਾਨਧਨ ਤਾਜ਼ਾ ਰੇਟ ਅਤੇ ਬੇਲਰਾਂ ਦੀ ਜਾਂਚ ਕਰ ਰਿਹਾ ਹੈ...',
      sellHeader: 'ਪਰਾਲੀ ਵੇਚੋ',
      burnHeader: 'ਖੇਤ ਵਿੱਚ ਸਾੜੋ',
      burnFineRisk: 'ਸਰਕਾਰੀ ਜੁਰਮਾਨਾ',
      bookBalerBtn: 'ਬੇਲਰ ਤੇ ਚੁਕਾਈ ਬੁੱਕ ਕਰੋ',
      bookBtn: 'ਬੁੱਕ ਕਰੋ',
      firesDetected: 'ਉਪਗ੍ਰਹਿ ਵੱਲੋਂ ਅੱਗ ਦਰਜ',
      windHeadingDelhi: 'ਹਵਾ ਦੀ ਚਾਲ: 14.2 ਕਿਮੀ/ਘੰਟਾ ਦਿੱਲੀ ਵੱਲ',
      viewMapBtn: 'ਨਕਸ਼ਾ ਦੇਖੋ →',
      groundedInSearch: 'ਭਾਰਤੀ ਮੰਡੀ ਬੋਰਡ ਅਤੇ ਪੋਰਟਲਾਂ ਤੋਂ ਤਸਦੀਕਸ਼ੁਦਾ:',
      micError: 'ਬ੍ਰਾਊਜ਼ਰ ਵਿੱਚ ਮਾਈਕ ਸਪੋਰਟ ਨਹੀਂ ਹੈ।',
      newsFeedTitle: 'ਤਾਜ਼ਾ ਭਾਰਤੀ ਖੇਤੀਬਾੜੀ ਅਤੇ ਪਰਾਲੀ ਨੀਤੀਆਂ',
    },
  }[language];

  // Fetch real Open-Meteo live weather, NASA key status, and live Indian agri news
  useEffect(() => {
    fetch('/api/data/live-weather')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setLiveWeather({
            tempC: d.punjabWeather.tempC,
            windSpeedKmh: d.punjabWeather.windSpeedKmh,
            windDirectionDeg: d.punjabWeather.windDirectionDeg,
            delhiPm25: d.delhiAqi.pm25Current,
            delhiAqiCategory: d.delhiAqi.category,
          });
        }
      })
      .catch(() => {});

    fetch('/api/bookings')
      .then((r) => r.json())
      .then((d) => {
        if (d.bookings) setBookings(d.bookings);
      })
      .catch(() => {});

    fetch('/api/config/nasa-key')
      .then((r) => r.json())
      .then((d) => {
        setHasNasaKey(Boolean(d.hasKey));
      })
      .catch(() => {});

    fetch('/api/data/live-india-feed')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.items)) {
          setScrapedNews(d.items);
        }
      })
      .catch(() => {});
  }, []);

  // Update calculations when acreage, crop, district or village changes
  useEffect(() => {
    const calc = calculateComparison(crop, acres, district, village);
    const ranked = rankBuyers(crop, acres, district);
    setCalculation(calc);
    setBuyers(ranked);
  }, [crop, acres, district, village]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Audio Playback
  const speakText = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'pa' ? 'pa-IN' : language === 'hi' || language === 'hr' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  // Push to talk mic
  const toggleVoiceInput = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert(i18n.micError);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'pa' ? 'pa-IN' : language === 'hi' || language === 'hr' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          transcript += e.results[i][0].transcript;
        }
        setInputText(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => {
        setIsListening(false);
        if (inputText.trim()) {
          handleSendMessage(inputText.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  // Submit Message to Gemini Multi-Turn Backend
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() && !attachedImage) return;

    const userQuery = textToSend.trim() || (attachedImage ? 'Field photo attached' : '');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: userQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    const photoToProcess = attachedImage;
    setAttachedImage(null);
    setIsTyping(true);

    try {
      // If photo was attached, identify crop with Gemini Vision
      if (photoToProcess) {
        const vRes = await fetch('/api/identify-crop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: photoToProcess, language }),
        });
        const vData = await vRes.json();

        // STRICT REJECTION: If photo is a person, face, selfie, clothes, or non-farm scene
        if (!vData.isCrop || vData.cropType === 'not_crop') {
          setIsTyping(false);
          const subject = vData.detectedSubject || 'Person / Non-farm Object';

          const warningReplies: Record<Language, string> = {
            en: `⚠️ No agricultural crop stubble detected in this photo!\n\nThis photo appears to be a ${subject} (person / non-farm image). KisanDhan only calculates stubble income and dispatches balers for real crop straw in your field.\n\nPlease point your camera or upload a clear photo of harvested crop stubble (Paddy, Wheat, or Sugarcane) in your field to see buyers and net income.`,
            hr: `⚠️ खेत की पराली कोन्या दिखी भाई!\n\nयो फोटो ${subject} (माणस या कमरे) का सै। माणस या गैर-कृषि फोटो पै पराली का भाव कोन्या मिलैगा।\n\nपक्के खरीदार, बेलर मशीन अर रोकड़ा जाणन खातर आपणे कटे होए खेत म्हां पराली की फोटो लगाओ!`,
            hi: `⚠️ इस फोटो में फसल अवशेष (पराली) नहीं मिली!\n\nयह फोटो ${subject} (व्यक्ति या गैर-कृषि वस्तु) की प्रतीत होती है। किसानधन केवल खेत की असली पराली के लिए खरीदार और आय की गणना करता है।\n\nकृपया अपने कटे हुए खेत की पराली (धान, गेहूं या गन्ना) की साफ फोटो भेजें ताकि सही भाव मिल सके।`,
            pa: `⚠️ ਇਸ ਫੋਟੋ ਵਿੱਚ ਖੇਤ ਦੀ ਪਰਾਲੀ ਨਹੀਂ ਮਿਲੀ!\n\nਇਹ ਫੋਟੋ ${subject} (ਵਿਅਕਤੀ ਜਾਂ ਹੋਰ ਚੀਜ਼) ਦੀ ਜਾਪਦੀ ਹੈ। ਕਿਸਾਨਧਨ ਸਿਰਫ਼ ਖੇਤ ਦੀ ਪਰਾਲੀ ਲਈ ਰੇਟ ਅਤੇ ਬੇਲਰ ਬੁਕਿੰਗ ਕਰਦਾ ਹੈ।\n\nਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਖੇਤ ਵਿੱਚੋਂ ਕੱਟੀ ਹੋਈ ਪਰਾਲੀ ਦੀ ਸਾਫ਼ ਫ਼ੋਟੋ ਲਗਾਓ ਤਾਂ ਜੋ ਪੱਕੇ ਖਰੀਦਦਾਰ ਤੇ ਕਮਾਈ ਵੇਖੀ ਜਾ ਸਕੇ।`,
          };

          const botWarning = warningReplies[language] || warningReplies.en;

          const nonCropMsg: ChatMessage = {
            id: `b-err-${Date.now()}`,
            role: 'model',
            text: botWarning,
            audioText: vData.shortSpokenReply || botWarning,
            cardType: 'non_crop_warning',
            detectedSubject: subject,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages((prev) => [...prev, nonCropMsg]);
          speakText(vData.shortSpokenReply || botWarning);
          return; // STOP! Never calculate or return crop price!
        }

        // Genuine Crop Residue Verified!
        setCrop(vData.cropType);
      }

      // Standard conversational query or genuine crop verified
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          history,
          currentCrop: crop,
          currentAcres: acres,
          currentDistrict: district,
          currentVillage: village,
          language,
        }),
      });

      const data = await res.json();
      if (data.ui_state) {
        if (data.ui_state.crop) setCrop(data.ui_state.crop);
        if (data.ui_state.acres) setAcres(data.ui_state.acres);
        if (data.ui_state.district) setDistrict(data.ui_state.district);
      }

      const botMsg: ChatMessage = {
        id: `g-${Date.now()}`,
        role: 'model',
        text: data.replyText,
        audioText: data.replyText,
        cardType: data.cardType || 'sell_vs_burn',
        sources: data.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(data.replyText);
    } catch (error) {
      console.error('Chat error:', error);
      const fallback =
        language === 'hr'
          ? `थारे ${acres} एकड़ तै लगभग ₹${calculation.netIncome.toLocaleString('en-IN')} का खरा नफा होवैगा। खरीदार खेत पै खुद बेलर भेजैगा!`
          : language === 'pa'
          ? `${acres} ਏਕੜ ਤੋਂ ₹${calculation.netIncome.toLocaleString('en-IN')} ਦੀ ਸਿੱਧੀ ਕਮਾਈ ਹੋਵੇਗੀ। ਬੇਲਰ ਚੁਕਾਈ ਮੁਫ਼ਤ ਹੈ।`
          : language === 'hi'
          ? `${acres} एकड़ से ₹${calculation.netIncome.toLocaleString('en-IN')} की शुद्ध कमाई होगी। बेलर मशीन खेत पर पहुंचेगी।`
          : `${acres} acres yields ₹${calculation.netIncome.toLocaleString('en-IN')} net income with free farm-gate baler pickup.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `f-${Date.now()}`,
          role: 'model',
          text: fallback,
          audioText: fallback,
          cardType: 'sell_vs_burn',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakText(fallback);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOpenPickupForBuyer = (b: Buyer) => {
    setSelectedBuyerForPickup(b);
    setIsPickupModalOpen(true);
  };

  const handleBookingConfirmed = (newBooking: PickupBooking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setIsPickupModalOpen(false);

    const confirmReply =
      language === 'hr'
        ? `बधाई हो भाई! थारी ${newBooking.quantityQuintals} क्विंटल पराली खातर बेलर गाड़ी बुक हो गी। 48 घंटे म बैंक म ₹${newBooking.netPaymentExpected.toLocaleString('en-IN')} आवेंगे।`
        : language === 'pa'
        ? `ਮੁਬਾਰਕਾਂ ਕਿਸਾਨ ਵੀਰੋ! ਤੁਹਾਡੀ ${newBooking.quantityQuintals} ਕੁਇੰਟਲ ਪਰਾਲੀ ਲਈ ਬੇਲਰ ਬੁੱਕ ਹੋ ਗਿਆ ਹੈ। ₹${newBooking.netPaymentExpected.toLocaleString('en-IN')} ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਜਮ੍ਹਾਂ ਹੋਣਗੇ।`
        : language === 'hi'
        ? `बधाई हो! आपकी ${newBooking.quantityQuintals} क्विंटल पराली के लिए बेलर बुक हो गया है। ₹${newBooking.netPaymentExpected.toLocaleString('en-IN')} सीधे बैंक खाते में आएंगे।`
        : `Booking Confirmed! Free baler assigned for ${newBooking.quantityQuintals} quintals. ₹${newBooking.netPaymentExpected.toLocaleString('en-IN')} expected via direct transfer.`;

    setMessages((prev) => [
      ...prev,
      {
        id: `conf-${Date.now()}`,
        role: 'model',
        text: confirmReply,
        audioText: confirmReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    speakText(confirmReply);
  };

  // Quick action tiles for Home view
  const quickActions = [
    {
      title: i18n.actionCameraTitle,
      subtitle: i18n.actionCameraSub,
      icon: <Camera className="w-5 h-5 text-emerald-400" />,
      onClick: () => setIsCameraDashboardOpen(true),
      highlight: true,
    },
    {
      title: i18n.actionSellTitle,
      subtitle: i18n.actionSellSub,
      icon: <TrendingUp className="w-5 h-5 text-amber-400" />,
      onClick: () => handleSendMessage(i18n.querySell),
    },
    {
      title: i18n.actionBuyersTitle,
      subtitle: i18n.actionBuyersSub,
      icon: <Factory className="w-5 h-5 text-sky-400" />,
      onClick: () => handleSendMessage(i18n.queryBuyers),
    },
    {
      title: i18n.actionMapTitle,
      subtitle: i18n.actionMapSub,
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      onClick: () => setIsFullMapOpen(true),
    },
  ];

  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#131314] text-stone-100 font-sans select-none overflow-hidden">
      {/* 1. TOP HEADER: STRICT COMPLIANCE -> ONLY LOGO, NAME, AND PROFILE PICTURE */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-[#282a2c] bg-[#131314] shrink-0 z-20">
        {/* Left: App Logo & Name */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-1 bg-[#1e1f20] hover:bg-[#282a2c] text-stone-300 hover:text-white px-2 py-1 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer mr-0.5 border border-[#2e3134]"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>{i18n.homeBack}</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md">
            <Sprout className="w-4 h-4 text-stone-950 font-bold" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">
              {i18n.appName}
            </span>
            <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded tracking-wider uppercase">
              {i18n.appSubName}
            </span>
          </div>
        </div>

        {/* Right: ONLY Profile Picture Avatar (Never clipped, opens full drawer with languages & settings) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="relative w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-black text-xs flex items-center justify-center ring-2 ring-emerald-500/50 shadow-md active:scale-95 transition cursor-pointer"
            title="Farmer Profile, Language Switcher & Settings"
          >
            <span>GS</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#131314]"></span>
          </button>
        </div>
      </header>

      {/* 2. CENTRE: GREETING & SIMPLE ACTION TILES (Fitting gracefully without scrollbar on Home view) */}
      <main
        className={`flex-1 px-4 flex flex-col max-w-md w-full mx-auto ${
          messages.length === 0
            ? 'justify-between py-2 overflow-hidden'
            : 'overflow-y-auto py-3 space-y-4 scrollbar-thin'
        }`}
      >
        {messages.length === 0 ? (
          /* GREETING & SIMPLE ACTION TILES - PERFECTLY BALANCED FOR MOBILE VIEWPORT */
          <div className="flex-1 flex flex-col justify-between py-1">
            {/* Top Greeting Block */}
            <div className="space-y-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  {i18n.greeting}
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 mt-0.5 font-medium leading-relaxed">
                  {i18n.tagline}
                </p>
              </div>

              {/* Land Acreage Selector */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[11px] font-semibold text-stone-400">
                  {i18n.selectLand}
                </span>
                {[4, 8, 12, 16].map((a) => (
                  <button
                    key={a}
                    onClick={() => setAcres(a)}
                    className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                      acres === a
                        ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-xs'
                        : 'bg-[#1e1f20] text-stone-300 border-[#2e3134] hover:bg-[#282a2c]'
                    }`}
                  >
                    {a} {i18n.acreUnit}
                  </button>
                ))}
                <span className="text-[11px] text-stone-500 ml-1">• {village}, {district}</span>
              </div>

              {/* Live Weather & AQI Pill */}
              {liveWeather && (
                <div className="flex items-center gap-2 bg-[#1e1f20] border border-[#2e3134] px-3 py-1 rounded-full text-[11px] text-stone-300 w-fit">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>
                    {i18n.liveDelhiAQI} <strong className="text-white">{liveWeather.delhiPm25} µg/m³</strong> ({liveWeather.delhiAqiCategory})
                  </span>
                  <span className="text-stone-500">•</span>
                  <span>
                    {i18n.windLabel} <strong className="text-white">{liveWeather.windSpeedKmh} {i18n.windNW}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* 4 Simple Action Cards in 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 my-2">
              {quickActions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`p-3 rounded-2xl text-left transition flex flex-col justify-between h-24 sm:h-26 border active:scale-[0.98] cursor-pointer ${
                    item.highlight
                      ? 'bg-gradient-to-br from-emerald-950/70 to-[#1e1f20] border-emerald-500/60 shadow-sm'
                      : 'bg-[#1e1f20] hover:bg-[#282a2c] border-[#2e3134]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="p-1.5 rounded-xl bg-[#131314]/80 border border-[#2e3134]">
                      {item.icon}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-white">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Single-Line Live Mandi Wire Ticker */}
            <div
              onClick={() => setIsNewsDrawerOpen(true)}
              className="bg-[#18191a] border border-[#2e3134] hover:border-sky-500/40 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider shrink-0">
                  Mandi Wire:
                </span>
                <p className="text-[11px] text-stone-300 truncate">
                  {scrapedNews.length > 0 ? scrapedNews[0].title : 'CAQM mandates 5% biomass co-firing in thermal power plants'}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-500 shrink-0 ml-1.5" />
            </div>
          </div>
        ) : (
          /* CONVERSATION THREAD */
          <div className="space-y-3 pb-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Text Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-stone-950 font-bold rounded-br-xs'
                      : msg.cardType === 'non_crop_warning'
                      ? 'bg-amber-950/80 border-2 border-amber-500/80 text-amber-100 rounded-bl-xs'
                      : 'bg-[#1e1f20] border border-[#2e3134] text-stone-100 rounded-bl-xs shadow-sm'
                  }`}
                >
                  {/* Non-Crop Warning Header */}
                  {msg.cardType === 'non_crop_warning' && (
                    <div className="flex items-center gap-1.5 text-amber-400 font-black mb-1 text-xs">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{msg.detectedSubject ? `Identified: ${msg.detectedSubject}` : 'Non-Agricultural Photo'}</span>
                    </div>
                  )}

                  <p className="whitespace-pre-line text-xs sm:text-sm">{msg.text}</p>

                  {/* Audio Replay Button */}
                  {msg.role === 'model' && msg.audioText && (
                    <div className="mt-1.5 pt-1.5 border-t border-[#2e3134] flex items-center justify-between text-[11px] text-stone-400">
                      <button
                        onClick={() => speakText(msg.audioText!)}
                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Replay Voice</span>
                      </button>
                      <span className="text-[10px] text-stone-500">{msg.timestamp}</span>
                    </div>
                  )}
                </div>

                {/* Sell vs Burn Financial Card */}
                {msg.role === 'model' && msg.cardType === 'sell_vs_burn' && (
                  <div className="w-full max-w-sm mt-2 bg-[#1c1d1f] border border-[#2e3134] rounded-2xl p-3.5 shadow-md space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Sell Card */}
                      <div className="bg-emerald-950/70 border border-emerald-500/70 rounded-xl p-2.5 text-white">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                          {i18n.sellHeader}
                        </span>
                        <div className="text-lg font-black text-emerald-300 my-0.5">
                          +₹{calculation.netIncome.toLocaleString('en-IN')}
                        </div>
                        <p className="text-[10px] text-emerald-200 truncate">
                          {buyers[0]?.name || 'Punjab Biomass Hub'}
                        </p>
                      </div>

                      {/* Burn Card */}
                      <div className="bg-rose-950/70 border border-rose-600/70 rounded-xl p-2.5 text-white">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                          {i18n.burnHeader}
                        </span>
                        <div className="text-lg font-black text-rose-400 my-0.5">
                          ₹0 Income
                        </div>
                        <p className="text-[10px] text-rose-300">
                          -₹{calculation.burningFine.toLocaleString('en-IN')} {i18n.burnFineRisk}
                        </p>
                      </div>
                    </div>

                    {/* Book Baler CTA */}
                    <button
                      onClick={() => handleOpenPickupForBuyer(buyers[0])}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>{i18n.bookBalerBtn}</span>
                    </button>
                  </div>
                )}

                {/* Buyers Card */}
                {msg.role === 'model' && msg.cardType === 'buyers' && (
                  <div className="w-full max-w-sm mt-2 bg-[#1c1d1f] border border-[#2e3134] rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-300 border-b border-[#2e3134] pb-1.5">
                      <span>Verified Biomass Buyers</span>
                      <span className="text-emerald-400">{district} Hub</span>
                    </div>
                    {buyers.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className="bg-[#131314] p-2 rounded-xl border border-[#2e3134] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white text-xs">{b.name}</p>
                          <p className="text-[10px] text-stone-400">
                            {b.distanceKm} km away • {b.balerSupport ? 'Free Baler' : 'Self Transport'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-emerald-400 text-xs">
                            ₹{b.totalNetPayout?.toLocaleString('en-IN')}
                          </p>
                          <button
                            onClick={() => handleOpenPickupForBuyer(b)}
                            className="mt-1 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer"
                          >
                            {i18n.bookBtn}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Map Card */}
                {msg.role === 'model' && msg.cardType === 'map' && (
                  <div className="w-full max-w-sm mt-2 bg-[#1c1d1f] border border-[#2e3134] rounded-2xl p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                      <Flame className="w-4 h-4" />
                      <span>{hotspots.length} {i18n.firesDetected}</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      {i18n.windHeadingDelhi}
                    </p>
                    <button
                      onClick={() => setIsFullMapOpen(true)}
                      className="w-full bg-[#282a2c] hover:bg-[#3c4043] text-stone-100 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      <span>{i18n.viewMapBtn}</span>
                    </button>
                  </div>
                )}

                {/* Grounding Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-1 text-[10px] text-stone-500 flex items-center gap-1 flex-wrap">
                    <span>{i18n.groundedInSearch}</span>
                    {msg.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-0.5 mr-1"
                      >
                        <span>{s.title}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 bg-[#1e1f20] border border-[#2e3134] text-stone-300 px-3 py-2 rounded-2xl rounded-bl-xs w-fit text-xs">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>{i18n.typingText}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* 3. BOTTOM INPUT BAR: TEXT, ATTACH IMAGE/FILE, MIC, CAMERA DASHBOARD */}
      <footer className="p-2.5 border-t border-[#282a2c] bg-[#131314] shrink-0 max-w-md w-full mx-auto">
        {/* Attached image preview banner */}
        {attachedImage && (
          <div className="mb-2 px-3 py-1 bg-[#1e1f20] border border-emerald-500/50 rounded-xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5" />
              <span>{i18n.fileAttached}</span>
            </div>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-1 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 bg-[#1e1f20] border border-[#2e3134] focus-within:border-emerald-500/80 rounded-2xl px-2 py-1 transition">
          {/* File input (hidden) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setAttachedImage(ev.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />

          {/* Attach Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-stone-400 hover:text-stone-200 transition rounded-xl cursor-pointer"
            title="Attach Field Photo or Report"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Camera Dashboard Trigger */}
          <button
            onClick={() => setIsCameraDashboardOpen(true)}
            className="p-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 rounded-xl transition cursor-pointer active:scale-95"
            title={i18n.actionCameraTitle}
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (inputText.trim() || attachedImage)) {
                handleSendMessage(inputText.trim());
              }
            }}
            placeholder={i18n.placeholder}
            className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm placeholder:text-stone-500 outline-none px-1"
          />

          {/* Voice Input (Speech Recognition) */}
          <button
            onClick={toggleVoiceInput}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Push to Speak"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage(inputText.trim())}
            disabled={!inputText.trim() && !attachedImage}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#282a2c] text-stone-950 disabled:text-stone-600 rounded-xl font-bold transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* 4. CAMERA & VOICE MULTIMODAL DASHBOARD */}
      <MultimodalCameraDashboard
        isOpen={isCameraDashboardOpen}
        onClose={() => setIsCameraDashboardOpen(false)}
        language={language}
        soundEnabled={soundEnabled}
        acres={acres}
        district={district}
        village={village}
        onApplyCrop={(detected) => setCrop(detected)}
        onBookPickup={(b) => handleOpenPickupForBuyer(b)}
      />

      {/* 5. FARMER PROFILE & SETTINGS DRAWER (Contains 4-language switcher, NASA Map Key, and Wire) */}
      <FarmerProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        language={language}
        onLanguageChange={(l) => setLanguage(l)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        acres={acres}
        district={district}
        village={village}
        bookings={bookings}
        onOpenDemo={() => setIsDemoModalOpen(true)}
      />

      {/* 6. BALER PICKUP SCHEDULER MODAL */}
      <PickupSchedulerModal
        isOpen={isPickupModalOpen}
        onClose={() => setIsPickupModalOpen(false)}
        buyer={selectedBuyerForPickup || buyers[0] || null}
        crop={crop}
        acres={acres}
        quantityQuintals={calculation.stubbleQuantityQuintals}
        netPayout={selectedBuyerForPickup?.totalNetPayout || calculation.netIncome}
        district={district}
        village={village}
        language={language}
        onBookingConfirmed={handleBookingConfirmed}
      />

      {/* 7. FULL SCREEN SATELLITE FIRE & BUYER MAP (With Guaranteed Radar & Leaflet Fallback) */}
      {isFullMapOpen && (
        <div className="fixed inset-0 z-50 bg-[#131314] flex flex-col animate-fadeIn">
          <div className="p-3 flex items-center justify-between border-b border-[#282a2c] bg-[#131314]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullMapOpen(false)}
                className="flex items-center gap-1.5 bg-[#1e1f20] hover:bg-[#282a2c] text-white px-2.5 py-1.5 rounded-xl text-xs font-bold border border-[#2e3134] transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-emerald-400" />
                <span>{i18n.back}</span>
              </button>
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>
                  {language === 'hr' ? 'नासा आग मैप' : language === 'pa' ? 'ਨਾਸਾ ਅੱਗ ਮੈਪ' : language === 'hi' ? 'नासा आग मैप' : 'NASA Fire Map'}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsNasaKeyModalOpen(true)}
                className="bg-[#1e1f20] hover:bg-[#282a2c] text-amber-300 border border-amber-500/40 px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>NASA Key</span>
              </button>
              <button
                onClick={() => setIsFullMapOpen(false)}
                className="p-1.5 rounded-full bg-[#1e1f20] text-stone-300 hover:text-white cursor-pointer border border-[#2e3134]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-2 overflow-hidden">
            <HotspotMap
              hotspots={hotspots}
              buyers={buyers}
              currentDistrict={district}
              currentVillage={village}
              language={language}
              onBack={() => setIsFullMapOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 8. NASA FIRMS MAP KEY CONFIGURATION MODAL */}
      <NasaKeyModal
        isOpen={isNasaKeyModalOpen}
        onClose={() => setIsNasaKeyModalOpen(false)}
        language={language}
      />

      {/* 9. REAL-TIME SCRAPED INDIAN AGRI WIRE DRAWER */}
      {isNewsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex justify-end animate-fadeIn">
          <div className="w-full max-w-sm bg-[#1c1d1f] border-l border-[#2e3134] text-white h-full p-4 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#2e3134]">
                <button
                  onClick={() => setIsNewsDrawerOpen(false)}
                  className="flex items-center gap-1.5 text-stone-200 bg-[#282a2c] hover:bg-[#3c4043] px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
                  <span>{i18n.back}</span>
                </button>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4 text-sky-400" />
                  Live Mandi Wire
                </span>
                <button
                  onClick={() => setIsNewsDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-[#282a2c] text-stone-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                <div className="bg-sky-950/40 border border-sky-600/40 rounded-xl p-3 text-xs text-sky-200">
                  <p className="font-bold text-white text-xs mb-1">
                    {i18n.newsFeedTitle}
                  </p>
                  <p className="text-[11px] text-sky-200/80 leading-relaxed">
                    Direct news scraping from Indian agricultural authorities, CAQM, NTPC, and Punjab/Haryana Mandi Boards.
                  </p>
                </div>

                <div className="space-y-2 mt-2">
                  {scrapedNews.map((n, idx) => (
                    <div
                      key={idx}
                      className="bg-[#131314] border border-[#2e3134] rounded-xl p-2.5 text-xs space-y-1 hover:border-sky-500/40 transition"
                    >
                      <h4 className="font-semibold text-white text-xs leading-snug">
                        {n.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                        <span>{n.timeAgo}</span>
                        {n.link && (
                          <a
                            href={n.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-400 hover:underline flex items-center gap-1"
                          >
                            <span>Read Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#2e3134]">
              <button
                onClick={() => setIsNewsDrawerOpen(false)}
                className="w-full bg-[#282a2c] hover:bg-[#3c4043] text-stone-200 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Close Wire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. 2-MIN PITCH DEMO MODAL */}
      <GurpreetDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        language={language}
        onRunStepAction={(step) => {
          if (step === 3) setIsCameraDashboardOpen(true);
          else if (step === 6) handleOpenPickupForBuyer(buyers[0]);
          else if (step === 7) setIsFullMapOpen(true);
        }}
      />
    </div>
  );
}
