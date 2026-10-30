/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  RotateCcw,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { LanguageCode, VoiceMessage } from '../types.ts';
import { translations } from '../translations/index.ts';

interface RamboVoiceBotFloatingProps {
  language: LanguageCode;
  userName: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const KNOWLEDGE_RESPONSES: Record<string, { en: string[]; hi: string[]; ta: string[] }> = {
  irrigation: {
    en: [
      'Step 1: For current vegetative stage, provide 2.5 to 3.0 Litres of water per plant in the early evening.',
      'Step 2: Inspect top 2 inches of soil; irrigate only if dry and crumbly.',
      'Step 3: Run drip irrigation between 5:30 PM and 7:00 PM to minimize moisture evaporation loss.',
    ],
    hi: [
      'कदम 1: वर्तमान अवस्था में प्रति पौधा शाम के समय 2.5 से 3.0 लीटर पानी दें।',
      'कदम 2: ऊपरी 2 इंच मिट्टी की जांच करें; यदि सूखी हो तभी सिंचाई करें।',
      'कदम 3: वाष्पीकरण रोकने के लिए शाम 5:30 से 7:00 बजे के बीच ड्रिप चलाना सबसे अच्छा है।',
    ],
    ta: [
      'படி 1: தற்போதைய பயிர் நிலைக்கு மாலை வேளையில் செடிக்கு 2.5 முதல் 3.0 லிட்டர் தண்ணீர் பாய்ச்சவும்.',
      'படி 2: மேல் 2 அங்குல மண் காய்ந்திருந்தால் மட்டுமே நீர் பாய்ச்சவும்.',
      'படி 3: மாலை 5:30 முதல் 7:00 மணி வரை சொட்டுநீர் பாசனம் செய்வது ஆவியாதலை தடுக்கும்.',
    ],
  },
  pest: {
    en: [
      'Step 1: Check underside of leaves for aphids, whiteflies, or thrips.',
      'Step 2: For sucking pests, spray Confidor (Imidacloprid 17.8% SL) at 0.5 ml per Litre of water.',
      'Step 3: Alternatively, spray certified Neem Oil 10,000 PPM (3 ml/L) for safe organic bio-control.',
      'Step 4: Avoid spraying in harsh midday sunlight.',
    ],
    hi: [
      'कदम 1: पत्तियों के नीचे माहू, सफेद मक्खी या कीट के अंडों की जांच करें।',
      'कदम 2: रस चूसक कीटों के लिए कॉन्फिडोर (इमिडाक्लोप्रिड 17.8%) 0.5 मिली प्रति लीटर पानी में मिलाकर छिड़कें।',
      'कदम 3: जैविक नियंत्रण के लिए 10,000 PPM नीम तेल (3 मिली/लीटर) का छिड़काव करें।',
      'कदम 4: तेज धूप में छिड़काव न करें, शाम 4 बजे के बाद ही करें।',
    ],
    ta: [
      'படி 1: இலைகளின் அடிப்பகுதியில் அசுவினி அல்லது புழு முட்டைகளை பரிசோதிக்கவும்.',
      'படி 2: கான்பிடார் (இமிடாக்ளோபிரிட் 17.8%) லிட்டருக்கு 0.5 மி.லி கலந்து தெளிக்கவும்.',
      'படி 3: இயற்கை முறைக்கு வேப்பெண்ணெய் 10,000 PPM லிட்டருக்கு 3 மி.லி தெளிக்கவும்.',
      'படி 4: மாலை வேளையில் மட்டுமே தெளிக்கவும்.',
    ],
  },
  ph: {
    en: [
      'Step 1: Your soil pH reading is currently balanced in the 6.2 - 6.6 range.',
      'Step 2: If pH drops below 5.8 (acidic): Apply 150-200 kg Agricultural Lime per acre before sowing.',
      'Step 3: If pH rises above 7.8 (alkaline): Apply Gypsum or well-rotted farmyard compost to buffer salinity.',
    ],
    hi: [
      'कदम 1: आपकी मिट्टी का pH वर्तमान में 6.2 से 6.6 के आदर्श स्तर पर संतुलित है।',
      'कदम 2: यदि pH 5.8 से नीचे गिरे (अम्लीय): बुवाई से पहले 150-200 किग्रा चूना प्रति एकड़ डालें।',
      'कदम 3: यदि pH 7.8 से अधिक हो (क्षारीय): जिप्सम या सड़ी हुई गोबर की खाद मिलाकर सुधार करें।',
    ],
    ta: [
      'படி 1: உங்கள் மண்ணின் pH அளவு 6.2 முதல் 6.6 வரை உகந்த நிலையில் உள்ளது.',
      'படி 2: pH 5.8 க்கு குறைவாக இருந்தால்: ஏக்கருக்கு 150-200 கிலோ விவசாய சுண்ணாம்பு சேர்க்கவும்.',
      'படி 3: pH 7.8 க்கு மேல் இருந்தால்: ஜிப்சம் அல்லது மக்கிய தொழு உரம் சேர்க்கவும்.',
    ],
  },
  mandi: {
    en: [
      'Step 1: Market Mandi arrivals for grain crops are currently moderate with stable prices.',
      'Step 2: Wheat and Paddy prices are forecasted to hold steady over the next 4 to 6 days.',
      'Step 3: Recommendation: Store clean dry produce; sell 40% at current rates and hold remainder for peak demand.',
    ],
    hi: [
      'कदम 1: मंडी में अनाज की आवक सामान्य है और भाव स्थिर बने हुए हैं।',
      'कदम 2: अगले 4 से 6 दिनों तक गेहूं और धान के भाव मजबूत रहने का अनुमान है।',
      'कदम 3: सलाह: फसल को सूखाकर रखें; 40% अभी बेचें और शेष अच्छी मांग आने पर बेचें।',
    ],
    ta: [
      'படி 1: சந்தையில் வரத்து சீராக உள்ளதால் விலை நிலையாக உள்ளது.',
      'படி 2: அடுத்த 5 நாட்களுக்கு நெல் விலை உயரும் வாய்ப்புள்ளது.',
      'படி 3: பரிந்துரை: 40% விளைச்சலை விற்று மீதத்தை சேமித்து வைப்பது லாபகரமானது.',
    ],
  },
};

export const RamboVoiceBotFloating: React.FC<RamboVoiceBotFloatingProps> = ({
  language,
  userName,
  isOpen,
  onToggle,
  onClose,
}) => {
  const t = translations[language] || translations.en;

  const [botState, setBotState] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `${t.greeting}, ${userName}! I am Rambo Voice Bot, your AI agricultural advisor. Tap the mic to speak or type your question.`,
      timestamp: 'Just now',
      actionBullets: [
        'Ask about pesticide dosage for Cotton, Rice, or Tomato',
        'Ask today’s smart irrigation requirement',
        'Check soil pH and fertilizer recommendations',
      ],
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Speech Recognition locale
  const getSpeechLocale = (lang: LanguageCode): string => {
    switch (lang) {
      case 'hi': return 'hi-IN';
      case 'ta': return 'ta-IN';
      case 'te': return 'te-IN';
      case 'kn': return 'kn-IN';
      case 'ml': return 'ml-IN';
      case 'bn': return 'bn-IN';
      default: return 'en-IN';
    }
  };

  // Setup Web Speech API recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = getSpeechLocale(language);

      recognition.onstart = () => {
        setBotState('listening');
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleUserQuery(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setErrorMessage(t.micPermissionDenied);
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Tap mic again.');
        } else {
          setErrorMessage(`Audio input issue (${event.error}). You can also type.`);
        }
        setBotState('error');
      };

      recognition.onend = () => {
        setBotState((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      stopAudioPlayback();
    };
  }, [language]);

  const toggleListening = () => {
    if (botState === 'speaking') {
      stopAudioPlayback();
      return;
    }

    if (botState === 'listening') {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setBotState('idle');
      return;
    }

    setErrorMessage(null);
    if (!recognitionRef.current) {
      setErrorMessage(t.speechNotSupported);
      return;
    }

    try {
      recognitionRef.current.start();
    } catch {
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      } catch (err: any) {
        setErrorMessage('Unable to activate microphone. Please try typing.');
      }
    }
  };

  const stopAudioPlayback = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (botState === 'speaking') {
      setBotState('idle');
    }
  };

  const speakText = (text: string) => {
    if (isAudioMuted || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#•]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = getSpeechLocale(language);
    utterance.rate = 0.95;

    utterance.onstart = () => setBotState('speaking');
    utterance.onend = () => setBotState('idle');
    utterance.onerror = () => setBotState('idle');

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleUserQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const userMsg: VoiceMessage = {
      id: 'usr-' + Date.now(),
      sender: 'farmer',
      text: trimmed,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setBotState('processing');

    setTimeout(() => {
      const q = trimmed.toLowerCase();
      let bullets: string[] = [];
      let reply = '';

      if (q.includes('water') || q.includes('irrigation') || q.includes('paani') || q.includes('sinchai') || q.includes('தண்ணீர்')) {
        const set = KNOWLEDGE_RESPONSES.irrigation[language as 'en' | 'hi' | 'ta'] || KNOWLEDGE_RESPONSES.irrigation.en;
        reply = language === 'hi'
          ? 'सिंचाई परामर्श: आपके खेत के लिए निर्धारित सिंचाई मात्रा।'
          : language === 'ta'
          ? 'நீர்ப்பாசன ஆலோசனை: உங்கள் பயிருக்கான பரிந்துரை.'
          : 'Irrigation Advisory: Precise water requirements for your crop.';
        bullets = set;
      } else if (q.includes('pest') || q.includes('insect') || q.includes('spray') || q.includes('keeda') || q.includes('dawa') || q.includes('பூச்சி')) {
        const set = KNOWLEDGE_RESPONSES.pest[language as 'en' | 'hi' | 'ta'] || KNOWLEDGE_RESPONSES.pest.en;
        reply = language === 'hi'
          ? 'कीट एवं रोग नियंत्रण: अनुशंसित उपचार व खुराक।'
          : language === 'ta'
          ? 'பூச்சி கட்டுப்பாடு: பரிந்துரைக்கப்பட்ட அளவு.'
          : 'Pest & Disease Advisory: Exact chemical and organic dosages.';
        bullets = set;
      } else if (q.includes('ph') || q.includes('soil') || q.includes('mitti') || q.includes('chuna') || q.includes('மண்')) {
        const set = KNOWLEDGE_RESPONSES.ph[language as 'en' | 'hi' | 'ta'] || KNOWLEDGE_RESPONSES.ph.en;
        reply = language === 'hi'
          ? 'मृदा स्वास्थ्य: मिट्टी का pH स्तर और सुधार।'
          : language === 'ta'
          ? 'மண் வளம்: மண்ணின் pH அளவு மற்றும் உரம்.'
          : 'Soil Health: pH readings and amendment prescription.';
        bullets = set;
      } else if (q.includes('price') || q.includes('mandi') || q.includes('bhav') || q.includes('market') || q.includes('விலை')) {
        const set = KNOWLEDGE_RESPONSES.mandi[language as 'en' | 'hi' | 'ta'] || KNOWLEDGE_RESPONSES.mandi.en;
        reply = language === 'hi'
          ? 'मंडी भाव व बिक्री पूर्वानुमान:'
          : language === 'ta'
          ? 'சந்தை விலை நிலவரம்:'
          : 'Mandi Price & Demand Forecast:';
        bullets = set;
      } else {
        reply = language === 'hi'
          ? `सलाह: "${trimmed}" के संबंध में Rambo Voice Bot की सिफारिशें:`
          : language === 'ta'
          ? `பரிந்துரை: "${trimmed}" தொடர்பான வழிகாட்டல்:`
          : `Rambo Agronomy Advisory regarding "${trimmed}":`;
        bullets = [
          'Step 1: Ensure morning or evening field application to avoid evaporation.',
          'Step 2: Check soil moisture and pH before applying heavy fertilizer.',
          'Step 3: Consult local Krishi Vigyan Kendra (KVK) for regional package of practices.',
        ];
      }

      const botMsg: VoiceMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: 'Just now',
        actionBullets: bullets,
      };

      setMessages((prev) => [...prev, botMsg]);
      speakText(`${reply} ${bullets.join('. ')}`);
    }, 700);
  };

  const handleClearChat = () => {
    stopAudioPlayback();
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'assistant',
        text: `${t.greeting}, ${userName}! How can Rambo Voice Bot assist your farm today?`,
        timestamp: 'Just now',
        actionBullets: [
          'Ask about pesticide dosage for Cotton, Rice, or Tomato',
          'Ask today’s smart irrigation requirement',
          'Check soil pH and fertilizer recommendations',
        ],
      },
    ]);
  };

  const sampleQuestions = [
    'Pesticide dosage for Cotton / Rice',
    'Today’s irrigation requirement',
    'Soil pH & fertilizer balance',
    'Mandi market price forecast',
  ];

  return (
    <>
      {/* Floating Chat Bot Icon Button (Fixed Bottom-Right Corner) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isOpen && (
          <div
            onClick={onToggle}
            className="hidden sm:flex items-center gap-2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-emerald-500/30 text-stone-800 dark:text-stone-100 text-xs font-bold cursor-pointer hover:border-emerald-500 transition-all active:scale-95 animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Rambo Voice Bot</span>
          </div>
        )}

        <button
          onClick={onToggle}
          aria-label="Open Rambo Voice Bot"
          title="Rambo Voice Bot (Tap to chat & speak)"
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 focus:outline-none ${
            isOpen
              ? 'bg-stone-800 dark:bg-stone-700 text-white rotate-90 ring-4 ring-emerald-500/20'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-500/30 hover:ring-emerald-500/50'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-7 h-7" />
              {/* Online pulse badge */}
              <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-stone-900"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[540px] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-white">Rambo Voice Bot</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-emerald-100">AI Agricultural Advisor</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                title={isAudioMuted ? 'Unmute Voice Responses' : 'Mute Voice Responses'}
                aria-label="Toggle voice response"
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClearChat}
                title="Restart conversation"
                aria-label="Reset chat"
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                aria-label="Close bot"
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick suggestions strip */}
          <div className="px-3 py-2 bg-stone-50 dark:bg-stone-950/50 border-b border-stone-100 dark:border-stone-800 flex gap-2 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleUserQuery(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-400 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl ${
                    msg.sender === 'farmer'
                      ? 'bg-emerald-700 text-white rounded-br-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-bl-xs border border-stone-200/80 dark:border-stone-700/80'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Action step items */}
                  {msg.actionBullets && msg.actionBullets.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-stone-200/80 dark:border-stone-700 space-y-1.5">
                      {msg.actionBullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="block text-[9px] mt-1.5 text-stone-400 dark:text-stone-500 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {botState === 'processing' && (
              <div className="flex gap-2 items-center text-xs text-stone-500 italic p-2 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                <span>Rambo is analyzing agronomy database...</span>
              </div>
            )}

            {botState === 'speaking' && (
              <div className="flex gap-2 items-center text-xs text-emerald-700 dark:text-emerald-400 p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Rambo is speaking the advisory aloud...</span>
                <button
                  onClick={stopAudioPlayback}
                  className="ml-auto text-[10px] underline font-semibold"
                >
                  Stop
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="p-2 text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                {errorMessage}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Voice & Text Input Toolbar */}
          <div className="p-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 shrink-0">
            <div className="flex items-center gap-2">
              {/* Mic Button */}
              <button
                onClick={toggleListening}
                title={botState === 'listening' ? 'Listening... Tap to stop' : 'Tap to speak'}
                aria-label="Voice input"
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
                  botState === 'listening'
                    ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300 dark:ring-red-900'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {botState === 'listening' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputText.trim()) {
                      handleUserQuery(inputText);
                    }
                  }}
                  placeholder={botState === 'listening' ? 'Listening...' : 'Type or ask in your language...'}
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-600"
                />
                <button
                  onClick={() => handleUserQuery(inputText)}
                  disabled={!inputText.trim()}
                  aria-label="Send message"
                  className="absolute right-1.5 p-1 rounded-lg text-emerald-700 dark:text-emerald-400 disabled:text-stone-300 dark:disabled:text-stone-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-1.5 text-center text-[10px] text-stone-400">
              Made by Rambo Private Limited · Agricultural Voice Advisor
            </div>
          </div>
        </div>
      )}
    </>
  );
};
