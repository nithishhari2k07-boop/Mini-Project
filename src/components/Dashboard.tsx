/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sprout,
  Droplets,
  Camera,
  Mic,
  TrendingUp,
  FlaskConical,
  Activity,
  Sun,
  ShieldCheck,
  ChevronRight,
  Bluetooth,
  ArrowRight,
  Info,
  CloudSun,
  Flame,
  CloudRain,
} from 'lucide-react';
import { LanguageCode, SensorData, UserProfile } from '../types.ts';
import { translations } from '../translations/index.ts';
import { Logo } from './Logo.tsx';

interface DashboardProps {
  language: LanguageCode;
  profile: UserProfile;
  sensorData: SensorData;
  onNavigate: (tab: string) => void;
  onConnectSensor: () => void;
  onOpenVoice: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  language,
  profile,
  sensorData,
  onNavigate,
  onConnectSensor,
  onOpenVoice,
}) => {
  const t = translations[language] || translations.en;

  const cropCards = [
    {
      name: 'Rice / Paddy Field',
      stage: 'Tillering Stage',
      advice: 'Maintain 2-3 cm shallow water level; check for leaf blast.',
      image: '/src/assets/images/crop_rice_paddy_1793384931976.jpg',
      photographer: 'Authentic Agri Document',
    },
    {
      name: 'Golden Wheat',
      stage: 'Grain Filling',
      advice: 'Critical irrigation window active; avoid water stress.',
      image: '/src/assets/images/crop_wheat_field_1793384932703.jpg',
      photographer: 'Authentic Agri Document',
    },
    {
      name: 'Tomato & Vegetables',
      stage: 'Flowering & Fruiting',
      advice: 'Target early blight prevention with copper fungicide or neem oil.',
      image: '/src/assets/images/crop_tomato_plant_1793384933284.jpg',
      photographer: 'Authentic Agri Document',
    },
    {
      name: 'Cotton Bolls',
      stage: 'Boll Development',
      advice: 'Inspect squares for pink bollworm larvae and sucking pests.',
      image: '/src/assets/images/crop_cotton_bolls_1793384934192.jpg',
      photographer: 'Authentic Agri Document',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section with Center Logo & Tagline */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-stone-200/80 dark:border-stone-800 bg-[#fbfdfa] dark:bg-stone-900">
        {/* Subtle farming landscape backdrop with soft contrast overlay */}
        <div className="absolute inset-0 z-0 opacity-15 dark:opacity-10 pointer-events-none">
          <img
            src="/src/assets/images/farm_panoramic_landscape_1793384934978.jpg"
            alt="Farmland landscape"
            className="w-full h-full object-cover filter blur-[2px]"
          />
        </div>

        <div className="relative z-10 p-8 sm:p-12 text-center max-w-3xl mx-auto flex flex-col items-center">
          {/* Central Logo */}
          <div className="mb-4 transform hover:scale-105 transition-transform">
            <Logo size="hero" showText={false} />
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-sans">
            Techno Crop <span className="text-emerald-700 dark:text-emerald-400">AI</span>
          </h1>

          <p className="mt-2 text-base sm:text-lg font-medium text-emerald-800 dark:text-emerald-300">
            {t.tagline}
          </p>

          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto">
            {t.greeting}, <span className="font-semibold text-stone-800 dark:text-stone-200">{profile.fullName}</span>! {t.greetingSubtitle}
          </p>

          {/* Quick Central Action Strip */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenVoice}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all duration-200 flex items-center gap-2 active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>{t.voiceAssistantTitle}</span>
            </button>

            <button
              onClick={() => onNavigate('weather')}
              className="px-5 py-2.5 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-sm font-medium rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <CloudSun className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Live Weather & Alerts</span>
            </button>

            <button
              onClick={() => onNavigate('doctor')}
              className="px-5 py-2.5 bg-white dark:bg-stone-800 hover:bg-stone-50 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 text-sm font-medium rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.navDoctor}</span>
            </button>

            <button
              onClick={onConnectSensor}
              className={`px-4 py-2.5 rounded-2xl text-sm font-medium border transition-colors flex items-center gap-2 ${
                sensorData.connectionStatus === 'connected'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-50'
              }`}
            >
              <Bluetooth className="w-4 h-4 text-emerald-600" />
              <span>
                {sensorData.connectionStatus === 'connected'
                  ? `pH Sensor: ${sensorData.currentPh}`
                  : t.connectSensor}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Field Status & Live Readings Bento Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 0: Live Weather & Early Warning Alert */}
        <div
          onClick={() => onNavigate('weather')}
          className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                  <CloudSun className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Live Weather
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded flex items-center gap-1">
                <Flame className="w-3 h-3 text-red-500" />
                <span>Heat Alert</span>
              </span>
            </div>

            <div className="mt-4">
              <span className="text-3xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                33°C
              </span>
              <p className="text-xs text-stone-500 mt-1">
                Indore · 58% Humidity · Real-time
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <span>Forecast & 3D Canopy</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
        {/* Card 1: Soil pH & Moisture Status */}
        <div
          onClick={() => onNavigate('irrigation')}
          className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Soil pH & Health
                </h3>
              </div>

              {/* Status dot */}
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    sensorData.connectionStatus === 'connected'
                      ? 'bg-emerald-500'
                      : sensorData.connectionStatus === 'connecting'
                      ? 'bg-amber-500'
                      : 'bg-stone-400'
                  }`}
                />
                <span className="text-stone-600 dark:text-stone-400">
                  {sensorData.connectionStatus === 'connected'
                    ? t.phStatusConnected
                    : t.phStatusDisconnected}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-3xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                {sensorData.connectionStatus === 'connected' ? `${sensorData.currentPh} pH` : '6.45 pH'}
              </span>
              <p className="text-xs text-stone-500 mt-1">
                {t.optimalRange} · Slightly Acidic (Good)
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <span>Manage Irrigation & Sensor</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Pest & Chemical Scanner */}
        <div
          onClick={() => onNavigate('doctor')}
          className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Pesticide & Label Scanner
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Camera Ready
              </span>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Scan bottle label or crop leaves
              </p>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Extract exact mixing dosage, waiting days (PHI), and safety precautions.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <span>Open Camera Scanner</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Mandi Market Today */}
        <div
          onClick={() => onNavigate('mandi')}
          className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Mandi Price Index
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                +3.8% Cotton
              </span>
            </div>

            <div className="mt-4">
              <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                ₹7,420 / Qtl
              </span>
              <p className="text-xs text-stone-500 mt-1">
                Rajkot APMC Mandi · High Demand Trend
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            <span>View All Market Rates</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Featured Crop Photography Gallery Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
              <span>Current Season Crop Advisories</span>
            </h2>
            <p className="text-xs text-stone-500">
              Field photography and agronomy notes for seasonal crops.
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View Agri Chemicals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cropCards.map((crop, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="relative h-48 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                <img
                  src={crop.image}
                  alt={crop.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-sm font-bold drop-shadow-xs">{crop.name}</h4>
                  <span className="text-[11px] text-stone-200">{crop.stage}</span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {crop.advice}
                </p>
                <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                  <span>Verified Agronomy</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold cursor-pointer" onClick={() => onNavigate('doctor')}>
                    Scan Field →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
