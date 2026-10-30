/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  Search,
  ExternalLink,
  ShieldAlert,
  Clock,
  Filter,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { AgriProduct, LanguageCode } from '../types.ts';
import { registeredAgriProducts } from '../data/agriProductsData.ts';
import { translations } from '../translations/index.ts';

interface AgriProductsCatalogProps {
  language: LanguageCode;
}

export const AgriProductsCatalog: React.FC<AgriProductsCatalogProps> = ({ language }) => {
  const t = translations[language] || translations.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCrop, setSelectedCrop] = useState<string>('All');

  const categories = ['All', 'Insecticide', 'Fungicide', 'Herbicide', 'Bio-Pesticide', 'Fertilizer'];
  const cropFilters = ['All', 'Cotton', 'Paddy / Rice', 'Wheat', 'Tomato', 'Sugarcane', 'Potato'];

  const filteredProducts = registeredAgriProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.targetPests.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.targetCrops.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesCrop = selectedCrop === 'All' || product.targetCrops.some((c) => c.toLowerCase().includes(selectedCrop.toLowerCase()));

    return matchesSearch && matchesCategory && matchesCrop;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title & Official Legal Disclaimer */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-emerald-700 dark:text-emerald-500" />
              <span>{t.agriProductsTitle}</span>
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t.agriProductsSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300 text-xs font-medium max-w-md">
            <Info className="w-4 h-4 shrink-0 text-amber-600" />
            <span>{t.labelDisclaimer}</span>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            />
          </div>

          {/* Category Tabs */}
          <div className="md:col-span-4 flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Crop Selector */}
          <div className="md:col-span-2">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              aria-label="Filter products by target crop"
              className="w-full px-3 py-2.5 text-xs font-medium rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              {cropFilters.map((crop) => (
                <option key={crop} value={crop}>
                  {crop === 'All' ? 'All Crops' : crop}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col"
          >
            {/* Image Header with Scrim and Category Tag */}
            <div className="relative h-44 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-stone-900/80 text-white backdrop-blur-xs border border-white/10">
                  {product.category}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    product.toxicityGrade === 'Green'
                      ? 'bg-green-400'
                      : product.toxicityGrade === 'Blue'
                      ? 'bg-blue-400'
                      : product.toxicityGrade === 'Yellow'
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                  title={`CIB&RC Toxicity Grade: ${product.toxicityGrade}`}
                />
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-base font-bold leading-tight drop-shadow-xs">
                  {product.name}
                </h3>
                <p className="text-xs text-stone-300 mt-0.5 truncate drop-shadow-xs">
                  {product.activeIngredient}
                </p>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Dosage block */}
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">
                    Recommended Dosage & Application
                  </span>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">
                    {product.recommendedDosage}
                  </p>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 block italic">
                    Follow exact label instructions on packet.
                  </span>
                </div>

                {/* Target Pests */}
                <div>
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1">
                    Target Pests & Diseases:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {product.targetPests.map((pest, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                      >
                        {pest}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Crops */}
                <div>
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block mb-1">
                    Registered Crops:
                  </span>
                  <p className="text-xs text-stone-700 dark:text-stone-300">
                    {product.targetCrops.join(', ')}
                  </p>
                </div>

                {/* Waiting Period & Safety */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                  <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    PHI: {product.waitingPeriodDays} Days
                  </span>
                  <span className="truncate max-w-[200px]" title={product.manufacturer}>
                    Mfr: {product.manufacturer.split('/')[0]}
                  </span>
                </div>
              </div>

              {/* Order from Official Manufacturer Button */}
              <div className="pt-2">
                <a
                  href={product.orderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>{t.orderNow}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
          <FlaskConical className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-stone-800 dark:text-stone-200">
            No registered products match your search
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Try clearing the search text or selecting "All Categories".
          </p>
        </div>
      )}
    </div>
  );
};
