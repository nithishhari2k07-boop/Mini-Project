/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const pixelSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    hero: 96,
  };

  const dim = pixelSizes[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* High-Precision Vector Emblem: Crop Leaf + Circuit AI Grid */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-950 p-2 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/30"
        style={{ width: dim, height: dim }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="leafGrad" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="50%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
            <linearGradient id="circuitGrad" x1="10" y1="90" x2="80" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Soil/Earth base curve */}
          <path
            d="M 18 84 Q 50 94 82 84"
            stroke="#d97706"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Primary Leaf Contour */}
          <path
            d="M 50 82 C 32 74 20 54 22 34 C 24 18 42 12 50 14 C 58 12 76 18 78 34 C 80 54 68 74 50 82 Z"
            fill="url(#leafGrad)"
            opacity="0.95"
          />

          {/* Left Sub-leaflet / Sprout wing */}
          <path
            d="M 36 60 C 22 55 12 40 18 28 C 26 26 36 38 38 52 Z"
            fill="#16a34a"
            opacity="0.85"
          />

          {/* Central Stem & Main Circuit Vein */}
          <path
            d="M 50 80 L 50 20"
            stroke="url(#circuitGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Circuit Branches & Data Bus Nodes */}
          {/* Branch 1 Left */}
          <path
            d="M 50 64 L 34 52 L 26 52"
            stroke="#fef08a"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="52" r="2.5" fill="#fef08a" filter="url(#circuitGlow)" />

          {/* Branch 2 Right */}
          <path
            d="M 50 56 L 66 44 L 72 44"
            stroke="#fef08a"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="72" cy="44" r="2.5" fill="#fef08a" filter="url(#circuitGlow)" />

          {/* Branch 3 Left Upper */}
          <path
            d="M 50 42 L 38 32 L 32 32"
            stroke="#fef08a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="32" r="2.2" fill="#fef08a" />

          {/* Branch 4 Right Upper */}
          <path
            d="M 50 32 L 62 24 L 68 24"
            stroke="#fef08a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="68" cy="24" r="2.2" fill="#fef08a" />

          {/* Apical AI Sensor Apex Node */}
          <circle cx="50" cy="18" r="3.5" fill="#ffffff" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="50" cy="18" r="1.5" fill="#22c55e" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-stone-900 dark:text-stone-100 text-lg leading-tight">
            Techno Crop <span className="text-emerald-700 dark:text-emerald-400">AI</span>
          </span>
          <span className="text-[11px] font-medium tracking-wide text-stone-500 dark:text-stone-400">
            Smart Farming, Healthier Crops
          </span>
        </div>
      )}
    </div>
  );
};
