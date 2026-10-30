/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { LanguageCode, VoiceMessage } from '../types.ts';
import { translations } from '../translations/index.ts';

interface VoiceAssistantProps {
  language: LanguageCode;
  userName: string;
}

const KNOWLEDGE_RESPONSES: Record<string, { en: string[]; hi: string[]; ta: string[] }> = {
  irrigation: {
    en: [
      'For your current crop stage, provide 2.5 to 3.0 Litres of water per plant in the early evening.',
      'Check top 2 inches of soil; only irrigate if moisture feels crumbly and dry.',
      'Drip irrigation efficiency is highest between 5:30 PM and 7:00 PM to minimize evaporation.',
    ],
    hi: [
      'वर्तमान अवस्था में प्रति पौधा शाम के समय 2.5 से 3.0 लीटर पानी दें।',
      'ऊपरी 2 इंच मिट्टी की जांच करें; यदि सूखी हो तभी सिंचाई करें।',
      'वाष्पीकरण रोकने के लिए शाम 5:30 से 7:00 बजे के बीच ड्रिप चलाना सबसे अच्छा है।',
    ],
    ta: [
      'தற்போதைய பயிர் நிலைக்கு மாலை வேளையில் செடிக்கு 2.5 முதல் 3.0 லிட்டர் தண்ணீர் பாய்ச்சவும்.',
      'மேல் 2 அங்குல மண் காய்ந்திருந்தால் மட்டுமே நீர் பாய்ச்சவும்.',
      'மாலை 5:30 முதல் 7:00 மணி வரை சொட்டுநீர் பாசனம் செய்வது ஆவியாதலை தடுக்கும்.',
    ],
  },
  pest: {
    en: [
      'Step 1: Check underside of leaves for aphids, whiteflies, or early caterpillar eggs.',
      'Step 2: For sucking pests, spray Confidor (Imidacloprid 17.8% SL) at 0.5 ml per Litre of water.',
      'Step 3: Alternatively, spray certified Neem Oil 10,000 PPM (3 ml/L) for safe organic control.',
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
      'Your soil pH reading is currently balanced in the 6.2 - 6.6 range.',
      'If pH drops below 5.8 (acidic): Apply 150-200 kg Agricultural Lime per acre before sowing.',
      'If pH rises above 7.8 (alkaline): Apply Gypsum or well-rotted farmyard compost to buffer salinity.',
    ],
    hi: [
      'आपकी मिट्टी का pH वर्तमान में 6.2 से 6.6 के आदर्श स्तर पर संतुलित है।',
      'यदि pH 5.8 से नीचे गिरता है (अम्लीय): बुवाई से पहले 150-200 किग्रा चूना प्रति एकड़ डालें।',
      'यदि pH 7.8 से अधिक हो (क्षारीय): जिप्सम या सड़ी हुई गोबर की खाद मिलाकर सुधार करें।',
    ],
    ta: [
      'உங்கள் மண்ணின் pH அளவு 6.2 முதல் 6.6 வரை உகந்த நிலையில் உள்ளது.',
      'pH 5.8 க்கு குறைவாக இருந்தால்: ஏக்கருக்கு 150-200 கிலோ விவசாய சுண்ணாம்பு சேர்க்கவும்.',
      'pH 7.8 க்கு மேல் இருந்தால்: ஜிப்சம் அல்லது மக்கிய தொழு உரம் சேர்க்கவும்.',
    ],
  },
  mandi: {
    en: [
      'Market Mandi arrivals for grain crops are currently moderate with stable prices.',
      'Wheat and Paddy prices are forecasted to hold steady over the next 4 to 6 days.',
      'Recommendation: Store clean dry produce; sell 40% at current rates and hold remaining for peak festive demand.',
    ],
    hi: [
      'मंडी में अनाज की आवक सामान्य है और भाव स्थिर बने हुए हैं।',
      'अगले 4 से 6 दिनों तक गेहूं और धान के भाव मजबूत रहने का अनुमान है।',
      'सलाह: फसल को सूखाकर रखें; 40% अभी बेचें और शेष अच्छी मांग आने पर बेचें।',
    ],
    ta: [
      'சந்தையில் வரத்து சீராக உள்ளதால் விலை நிலையாக உள்ளது.',
      'அடுத்த 5 நாட்களுக்கு நெல் விலை உயரும் வாய்ப்புள்ளது.',
      'பரிந்துரை: 40% விளைச்சலை விற்று மீதத்தை சேமித்து வைப்பது லாபகரமானது.',
    ],
  },
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ language, userName }) => {
  const t = translations[language] || translations.en;

  const [botState, setBotState] = useState<'idle' | 'listening' | 'processing' | 'speaking' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `${t.greeting}, ${userName}! ${t.voiceSubtitle}`,
      timestamp: 'Just now',
      actionBullets: [
        'Ask about pesticide dosage for Cotton, Rice, or Tomato',
        'Ask today’s irrigation requirement',
        'Check soil pH and fertilizer recommendations',
      ],
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Map app language code to speech locale
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
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage(t.micPermissionDenied);
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech was detected. Please try tapping the mic again.');
        } else {
          setErrorMessage(`Audio input issue (${event.error}). You can also type your question.`);
        }
        setBotState('error');
      };

      recognition.onend = () => {
        // Only return to idle if not currently processing or speaking
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

    if (!recognitionRef.current) {
      setErrorMessage(t.speechNotSupported);
      setBotState('error');
      return;
    }

    try {
      stopAudioPlayback();
      setErrorMessage(null);
      recognitionRef.current.lang = getSpeechLocale(language);
      recognitionRef.current.start();
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      // If already started, stop then restart
      try {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 200);
      } catch {
        setErrorMessage(t.micPermissionDenied);
        setBotState('error');
      }
    }
  };

  const stopAudioPlayback = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (botState === 'speaking') {
      setBotState('idle');
    }
  };

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLocale(language);
    utterance.rate = 0.95; // Slightly slower, very clear for farmers
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setBotState('speaking');
    };

    utterance.onend = () => {
      setBotState('idle');
    };

    utterance.onerror = () => {
      setBotState('idle');
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleUserQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    // Add farmer message
    const userMsg: VoiceMessage = {
      id: 'usr-' + Date.now(),
      sender: 'farmer',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setBotState('processing');

    // Simulate intelligent agronomic reasoning
    setTimeout(() => {
      const lower = trimmed.toLowerCase();
      let bullets: string[] = [];
      let replyIntro = '';

      if (lower.includes('water') || lower.includes('pani') || lower.includes('irrigation') || lower.includes('தண்ணீர்') || lower.includes('నీరు')) {
        const langPack = KNOWLEDGE_RESPONSES.irrigation[language as 'en' | 'hi' | 'ta'] || KNOWLEDGE_RESPONSES.irrigation.en;
        bullets = langPack;
        replyIntro = language === 'hi' ? 'सिंचाई सलाह:' : language === 'ta' ? 'நீர்ப்பாசன ஆலோசனை:' : 'Smart Irrigation Prescription:';
      } else if (lower.includes('pest') || lower.includes('keeda') || lower.includes('spray') || lower.includes('insect') || lower.includes('பூச்சி') || lower.includes('పురుగు')) {
        const langPack = KNOWLEDGE_RESPONSES.pest[language as 'en' | 'hi' | 'ta'] || KNOWLEDGE_RESPONSES.pest.en;
        bullets = langPack;
        replyIntro = language === 'hi' ? 'कीट नियंत्रण एवं दवा की मात्रा:' : language === 'ta' ? 'பூச்சி மருந்து பரிந்துரை:' : 'Pest Control & Dosage Recommendation:';
      } else if (lower.includes('ph') || lower.includes('soil') || lower.includes('mitti') || lower.includes('மண்')) {
        const langPack = KNOWLEDGE_RESPONSES.ph[language as 'en' | 'hi' | 'ta'] || KNOWLEDGE_RESPONSES.ph.en;
        bullets = langPack;
        replyIntro = language === 'hi' ? 'मृदा pH एवं पोषक तत्व विश्लेषण:' : language === 'ta' ? 'மண் pH ஆலோசனை:' : 'Soil pH & Health Analysis:';
      } else if (lower.includes('mandi') || lower.includes('price') || lower.includes('bhav') || lower.includes('market') || lower.includes('விலை') || lower.includes('ధర')) {
        const langPack = KNOWLEDGE_RESPONSES.mandi[language as 'en' | 'hi' | 'ta'] || KNOWLEDGE_RESPONSES.mandi.en;
        bullets = langPack;
        replyIntro = language === 'hi' ? 'मंडी भाव व बिक्री सलाह:' : language === 'ta' ? 'சந்தை விலை நிலவரம்:' : 'Market Mandi Intelligence:';
      } else {
        bullets = [
          language === 'hi'
            ? 'फसल की पत्तियों में कोई दाग या पीलापन दिखे तो कैमरा स्कैनर से फोटो खींचें।'
            : 'For exact plant diagnostics, use the Plant Doctor camera scan on the next tab.',
          language === 'hi'
            ? 'प्रति एकड़ 150 लीटर पानी में सुझाई गई दवा का ही घोल बनाकर छिड़काव करें।'
            : 'Always calibrate spray tanks with 150-200 L water per acre for uniform coverage.',
          language === 'hi'
            ? 'आप मुझसे पानी, दवा की मात्रा या मंडी भाव के बारे में कभी भी पूछ सकते हैं।'
            : 'You can ask about water dosage, pesticide mixing ratios, or today mandi rates.',
        ];
        replyIntro = language === 'hi' ? 'सलाहकार का उत्तर:' : 'Agronomy Advisory:';
      }

      const botMsg: VoiceMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: replyIntro,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionBullets: bullets,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Speak aloud the primary bullets
      const speechSummary = `${replyIntro}. ${bullets.slice(0, 2).join('. ')}`;
      speakText(speechSummary);
    }, 900);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleUserQuery(inputText);
    }
  };

  return (
    <div className="flex flex-col h-[640px] max-w-4xl mx-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
      {/* Bot Header */}
      <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#f9faf7] dark:bg-stone-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              {t.voiceAssistantTitle}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t.tagline} · {getSpeechLocale(language)}
            </p>
          </div>
        </div>

        {/* Audio control button */}
        {botState === 'speaking' && (
          <button
            onClick={stopAudioPlayback}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 rounded-lg hover:bg-amber-200 transition-colors"
          >
            <VolumeX className="w-4 h-4" />
            <span>{t.stopAudio}</span>
          </button>
        )}
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'farmer' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'farmer'
                  ? 'bg-emerald-700 text-white rounded-tr-sm'
                  : 'bg-stone-100 dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 rounded-tl-sm border border-stone-200 dark:border-stone-700/60'
              }`}
            >
              <p className="font-medium">{msg.text}</p>

              {msg.actionBullets && msg.actionBullets.length > 0 && (
                <div className="mt-3 pt-3 border-t border-stone-200/60 dark:border-stone-700/60 space-y-2">
                  {msg.actionBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-stone-700 dark:text-stone-300">{bullet}</span>
                    </div>
                  ))}
                </div>
              )}

              <span className="block text-[10px] mt-2 opacity-60 text-right">
                {msg.timestamp}
              </span>
            </div>

            {msg.sender === 'farmer' && (
              <div className="w-8 h-8 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {/* State Banner */}
        {botState === 'listening' && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="font-medium">{t.micListening}</span>
          </div>
        )}

        {botState === 'processing' && (
          <div className="flex items-center gap-3 p-3 bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-600 dark:text-stone-300 text-xs">
            <RotateCcw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            <span>{t.micProcessing}</span>
          </div>
        )}

        {botState === 'speaking' && (
          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs">
            <Volume2 className="w-4 h-4 animate-pulse text-emerald-600" />
            <span className="font-medium">{t.micSpeaking}</span>
          </div>
        )}

        {errorMessage && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-800 dark:text-red-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{errorMessage}</p>
              <button
                onClick={toggleListening}
                className="mt-2 text-xs font-semibold underline hover:no-underline"
              >
                Retry Microphone
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Farming Prompts */}
      <div className="px-6 py-2 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-200/80 dark:border-stone-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-stone-400 shrink-0 font-medium">Quick ask:</span>
        <button
          onClick={() => handleUserQuery('How much water for tomatoes today?')}
          className="px-2.5 py-1 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 hover:border-emerald-500 whitespace-nowrap text-stone-700 dark:text-stone-300"
        >
          Tomato irrigation
        </button>
        <button
          onClick={() => handleUserQuery('Pesticide for cotton bollworm')}
          className="px-2.5 py-1 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 hover:border-emerald-500 whitespace-nowrap text-stone-700 dark:text-stone-300"
        >
          Cotton bollworm
        </button>
        <button
          onClick={() => handleUserQuery('Is wheat mandi price rising this week?')}
          className="px-2.5 py-1 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 hover:border-emerald-500 whitespace-nowrap text-stone-700 dark:text-stone-300"
        >
          Mandi wheat prices
        </button>
        <button
          onClick={() => handleUserQuery('How to improve acidic soil pH 5.4')}
          className="px-2.5 py-1 bg-white dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700 hover:border-emerald-500 whitespace-nowrap text-stone-700 dark:text-stone-300"
        >
          Soil pH correction
        </button>
      </div>

      {/* Input / Voice Bar */}
      <div className="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center gap-3">
        {/* Large Accessible Microphone Button with listening pulse */}
        <button
          type="button"
          onClick={toggleListening}
          aria-label={t.micReady}
          title={t.micReady}
          className={`relative p-3.5 rounded-full text-white shadow-md transition-all duration-200 flex items-center justify-center shrink-0 ${
            botState === 'listening'
              ? 'bg-red-600 hover:bg-red-700 scale-110 ring-4 ring-red-400/50'
              : botState === 'speaking'
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-emerald-700 hover:bg-emerald-800 active:scale-95'
          }`}
        >
          {botState === 'listening' ? (
            <Mic className="w-5 h-5 animate-pulse" />
          ) : botState === 'speaking' ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Text fallback input */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={botState === 'listening' ? t.micListening : t.micPromptPlaceholder}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>{t.sendQuery}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
