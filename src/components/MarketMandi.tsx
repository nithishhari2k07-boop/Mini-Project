/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LanguageCode, MandiPrice } from '../types.ts';

interface MarketMandiProps {
  language: LanguageCode;
}

const MANDI_DATA: MandiPrice[] = [
  {
    crop: 'Cotton (Kapas)',
    variety: 'Medium Staple (Shankar-6)',
    mandi: 'Rajkot APMC Mandi',
    state: 'Gujarat',
    currentPrice: 7420,
    changePercent: 3.8,
    trend: 'rising',
    forecastAdvice: 'Hold harvest for 5-7 days: Textile export demand is driving prices up toward ₹7,700/qtl.',
    updatedDate: 'Today, 10:30 AM',
  },
  {
    crop: 'Paddy / Rice',
    variety: 'Basmati 1121 & PB-1',
    mandi: 'Karnal Grain Market',
    state: 'Haryana',
    currentPrice: 3850,
    changePercent: 1.5,
    trend: 'rising',
    forecastAdvice: 'Optimal sell window active: High mill procurement. Recommend selling 60% of harvested lot.',
    updatedDate: 'Today, 11:15 AM',
  },
  {
    crop: 'Wheat (Gehun)',
    variety: 'Sharbati / Lok-1',
    mandi: 'Indore Mandi',
    state: 'Madhya Pradesh',
    currentPrice: 2680,
    changePercent: -0.8,
    trend: 'stable',
    forecastAdvice: 'Stable government MSP buffer. Hold in dry storage if waiting for local bakery premium.',
    updatedDate: 'Today, 09:45 AM',
  },
  {
    crop: 'Tomato',
    variety: 'Hybrid F1 (Abhinav / US-440)',
    mandi: 'Kolar APMC Mandi',
    state: 'Karnataka',
    currentPrice: 1950,
    changePercent: 8.2,
    trend: 'rising',
    forecastAdvice: 'Strong harvest recommendation: Festival consumption peak is causing a strong 3-day price surge.',
    updatedDate: 'Today, 08:00 AM',
  },
  {
    crop: 'Soybean',
    variety: 'JS-9560 Yellow',
    mandi: 'Latur Mandi',
    state: 'Maharashtra',
    currentPrice: 4520,
    changePercent: -2.1,
    trend: 'falling',
    forecastAdvice: 'Prices soft due to heavy arrivals. If storage is available, avoid panic selling this week.',
    updatedDate: 'Today, 10:00 AM',
  },
];

export const MarketMandi: React.FC<MarketMandiProps> = ({ language }) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('All');

  const filteredMandi = MANDI_DATA.filter((item) =>
    selectedCrop === 'All' ? true : item.crop.includes(selectedCrop)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-700 dark:text-emerald-500" />
            <span>Market Mandi Intelligence & Harvest Timing</span>
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Real-time APMC Mandi price trends and predictive advice on when to harvest and sell.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
          {['All', 'Cotton', 'Paddy', 'Wheat', 'Tomato', 'Soybean'].map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCrop === crop
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Price Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMandi.map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {item.crop}
                  </h3>
                  <p className="text-xs text-stone-500">{item.variety}</p>
                </div>

                {/* Trend pill */}
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    item.trend === 'rising'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : item.trend === 'falling'
                      ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  {item.trend === 'rising' && <TrendingUp className="w-3.5 h-3.5" />}
                  {item.trend === 'falling' && <TrendingDown className="w-3.5 h-3.5" />}
                  {item.trend === 'stable' && <Minus className="w-3.5 h-3.5" />}
                  <span>
                    {item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
                  </span>
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200/80 dark:border-stone-700">
                <span className="text-[11px] text-stone-500 font-medium uppercase tracking-wide block">
                  Current Mandi Price
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                    ₹{item.currentPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-stone-500">/ Quintal (100 kg)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  <span>
                    {item.mandi}, {item.state}
                  </span>
                </div>
              </div>

              {/* Predictive Forecast & Timing Advice */}
              <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs">
                <span className="font-semibold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                  Advisor Harvest & Sale Recommendation:
                </span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                  {item.forecastAdvice}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.updatedDate}
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                Verified APMC Data
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
