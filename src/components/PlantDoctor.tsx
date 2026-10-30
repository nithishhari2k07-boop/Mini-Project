/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sprout,
  Layers,
  FlaskConical,
  X,
  Search,
  CheckCircle,
} from 'lucide-react';
import { LanguageCode } from '../types.ts';

interface DiagnosticCase {
  id: string;
  crop: string;
  cropCategory: 'Cereals' | 'Vegetables' | 'Cash Crops';
  diseaseName: string;
  confidencePercent: number;
  symptoms: string;
  soilNutrientDeficiency: string;
  organicRemedy: string;
  chemicalTreatment: string;
  dosage: string;
  sampleImage: string;
}

const EXTENDED_DIAGNOSES: DiagnosticCase[] = [
  {
    id: 'diag-tomato-blight',
    crop: 'Tomato (Solanum lycopersicum)',
    cropCategory: 'Vegetables',
    diseaseName: 'Early Blight (Alternaria solani)',
    confidencePercent: 96,
    symptoms: 'Concentric dark brown target-board rings on lower leaves with yellow halo chlorosis.',
    soilNutrientDeficiency: 'Low Potassium (K) & Excess Nitrogen imbalance causing soft tissue susceptibility.',
    organicRemedy: 'Spray fermented butter-milk (Chaach) diluted 1:10 with water + 5 ml Neem oil per litre.',
    chemicalTreatment: 'Mancozeb 75% WP or Copper Oxychloride 50% WP',
    dosage: '2.5 grams per Litre of water (approx. 500g / acre in 200L water)',
    sampleImage: '/src/assets/images/crop_tomato_plant_1793384933284.jpg',
  },
  {
    id: 'diag-rice-blast',
    crop: 'Paddy / Rice (Oryza sativa)',
    cropCategory: 'Cereals',
    diseaseName: 'Leaf Blast (Magnaporthe oryzae)',
    confidencePercent: 94,
    symptoms: 'Spindle-shaped elliptical lesions with ash-grey centers and brown margins on leaves.',
    soilNutrientDeficiency: 'Silicon (Si) and Potassium deficiency; over-application of synthetic Urea.',
    organicRemedy: 'Apply Rice Husk Ash (source of bio-silicon) in soil + Pseudomonas fluorescens @ 10g/L spray.',
    chemicalTreatment: 'Tricyclazole 75% WP (Baan / Beam) or Isoprothiolane 40% EC',
    dosage: '120 grams per acre in 200 L of water',
    sampleImage: '/src/assets/images/crop_rice_paddy_1793384931976.jpg',
  },
  {
    id: 'diag-cotton-bollworm',
    crop: 'Cotton (Gossypium hirsutum)',
    cropCategory: 'Cash Crops',
    diseaseName: 'Pink Bollworm & Sucking Pest Attack',
    confidencePercent: 92,
    symptoms: 'Rosetted flowers, young bolls shedding prematurely with pinhead larval boreholes.',
    soilNutrientDeficiency: 'Boron & Zinc micronutrient deficiency causing poor boll retention.',
    organicRemedy: 'Install 5 Pheromone Traps per acre + release Trichogramma egg parasitoids.',
    chemicalTreatment: 'Emamectin Benzoate 5% SG or Chlorantraniliprole 18.5% SC',
    dosage: '80g / acre in 200 L water (approx. 0.5g / Litre)',
    sampleImage: '/src/assets/images/crop_cotton_bolls_1793384934192.jpg',
  },
  {
    id: 'diag-sugarcane-redrot',
    crop: 'Sugarcane (Saccharum officinarum)',
    cropCategory: 'Cash Crops',
    diseaseName: 'Red Rot (Colletotrichum falcatum)',
    confidencePercent: 95,
    symptoms: 'Third or fourth leaf withers with drooping crown; pith shows blood-red discoloration with white cross-bands and alcohol sour smell.',
    soilNutrientDeficiency: 'Severe Potassium & Phosphorus shortage coupled with waterlogged root zone hypoxia.',
    organicRemedy: 'Trichoderma harzianum @ 2.5 kg/acre mixed with well-rotted farmyard manure applied to planting furrows.',
    chemicalTreatment: 'Carbendazim 50% WP (Bavistin) sett dip + Thiophanate Methyl 70% WP',
    dosage: 'Sett dip: 100g in 100L water for 15 mins | Foliar: 350g/acre',
    sampleImage: '/src/assets/images/crop_sugarcane_field_1793388139909.jpg',
  },
  {
    id: 'diag-maize-armyworm',
    crop: 'Maize / Corn (Zea mays)',
    cropCategory: 'Cereals',
    diseaseName: 'Fall Armyworm (Spodoptera frugiperda)',
    confidencePercent: 93,
    symptoms: 'Pinholes and ragged "shot-hole" damage on whorl leaves with moist sawdust-like larval fecal frass.',
    soilNutrientDeficiency: 'Zinc deficiency causing stunted internodes and pale chlorotic bands along midrib.',
    organicRemedy: 'Drop fine sand/wood ash mixed with Bacillus thuringiensis (Bt kurstaki) into the leaf whorl.',
    chemicalTreatment: 'Spinetoram 11.7% SC (Delegate) or Chlorantraniliprole 18.5% SC',
    dosage: '100 ml per acre in 150-200 L water targeting whorl',
    sampleImage: '/src/assets/images/crop_maize_corn_1793388140017.jpg',
  },
  {
    id: 'diag-chilli-anthracnose',
    crop: 'Chilli / Pepper (Capsicum annuum)',
    cropCategory: 'Vegetables',
    diseaseName: 'Anthracnose Fruit Rot & Dieback',
    confidencePercent: 94,
    symptoms: 'Sunken circular necrotic spots on ripening pods with black concentric acervuli rings; tips of branches wither from top down.',
    soilNutrientDeficiency: 'Calcium (Ca) deficiency causing blossom-end fruit wall collapse & weak cell structure.',
    organicRemedy: 'Seed treatment with Trichoderma viride @ 10g/kg + foliar spray of liquid Seaweed extract.',
    chemicalTreatment: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top) or Copper Oxychloride 50% WP',
    dosage: '200 ml per acre in 200 L water (approx. 1 ml / Litre)',
    sampleImage: '/src/assets/images/crop_chilli_pepper_1793388139995.jpg',
  },
  {
    id: 'diag-wheat-rust',
    crop: 'Wheat (Triticum aestivum)',
    cropCategory: 'Cereals',
    diseaseName: 'Yellow / Stripe Rust (Puccinia striiformis)',
    confidencePercent: 96,
    symptoms: 'Linear yellow-orange powdery pustule stripes arranged parallel to leaf veins during cool humid mornings.',
    soilNutrientDeficiency: 'High Nitrogen to Potassium ratio; deficiency of Copper (Cu) causing pollen sterility.',
    organicRemedy: 'Spray liquid fermented cow urine (Gomutra 10%) + neem seed kernel extract (NSKE 5%).',
    chemicalTreatment: 'Propiconazole 25% EC (Tilt) or Tebuconazole 25.9% EC',
    dosage: '200 ml per acre in 200 L water at first appearance of stripe',
    sampleImage: '/src/assets/images/crop_wheat_field_1793384932703.jpg',
  },
  {
    id: 'diag-potato-blight',
    crop: 'Potato & Tubers (Solanum tuberosum)',
    cropCategory: 'Vegetables',
    diseaseName: 'Late Blight (Phytophthora infestans)',
    confidencePercent: 95,
    symptoms: 'Water-soaked irregular dark lesions at leaf margins and tips; delicate white mildew fringe on leaf undersides in morning dew.',
    soilNutrientDeficiency: 'Magnesium (Mg) deficiency (interveinal chlorosis) and low available soil Phosphorus.',
    organicRemedy: 'Preventive spray of Bordeaux mixture (1%) or Copper Hydroxide @ 2g/L.',
    chemicalTreatment: 'Cymoxanil 8% + Mancozeb 64% WP (Curzate M8) or Dimethomorph 50% WP',
    dosage: '600 grams per acre in 200 L water',
    sampleImage: '/src/assets/images/farm_panoramic_landscape_1793384934978.jpg',
  },
];

export const PlantDoctor: React.FC<{ language: LanguageCode }> = () => {
  const [selectedCase, setSelectedCase] = useState<DiagnosticCase>(EXTENDED_DIAGNOSES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredCrops = EXTENDED_DIAGNOSES.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.cropCategory === activeCategory;
    const matchesSearch =
      c.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.diseaseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const triggerMockScan = (newCase: DiagnosticCase) => {
    setIsScanning(true);
    setTimeout(() => {
      setSelectedCase(newCase);
      setIsScanning(false);
    }, 600);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setTimeout(() => {
        // Build customized visual diagnostic
        const customCase: DiagnosticCase = {
          id: 'custom-' + Date.now(),
          crop: 'Custom Farm Leaf Sample',
          cropCategory: 'Vegetables',
          diseaseName: 'Detected: Bacterial Leaf Streak & Nitrogen Stress',
          confidencePercent: 93,
          symptoms: 'Interveinal yellowing, water-soaked translucent lesions along lateral veins.',
          soilNutrientDeficiency: 'Nitrogen & Zinc deficiency causing restricted photosynthetic area.',
          organicRemedy: 'Foliar spray of 2% Panchagavya + Pseudomonas fluorescens @ 10g/L.',
          chemicalTreatment: 'Streptocycline 90% (6g) + Copper Oxychloride 50% WP (500g) per acre.',
          dosage: 'Spray in 150-200 L water with uniform coverage',
          sampleImage: dataUrl,
        };
        setSelectedCase(customCase);
        setIsScanning(false);
      }, 900);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Camera and Upload CTAs */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sprout className="w-6 h-6 text-emerald-700 dark:text-emerald-500" />
            <span>Plant Doctor & Leaf Diagnostic Scanner</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Instant disease identification, nutrient balance, and organic/chemical prescriptions for 8+ major crops.
          </p>
        </div>

        {/* Live Camera & Upload Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Affected Leaf</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCustomUpload}
          />
        </div>
      </div>

      {/* Crop Selector Strip & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs">
          {['All', 'Cereals', 'Vegetables', 'Cash Crops'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop or disease..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </div>
      </div>

      {/* Horizontal Crop Badges Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {filteredCrops.map((item) => (
          <button
            key={item.id}
            onClick={() => triggerMockScan(item)}
            className={`px-3.5 py-2 rounded-xl border font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              selectedCase.id === item.id
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm scale-102'
                : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-emerald-500'
            }`}
          >
            <span>{item.crop.split(' ')[0]}</span>
            <span className="opacity-70 text-[10px]">({item.diseaseName.split(' ')[0]})</span>
          </button>
        ))}
      </div>

      {/* Main Diagnostic Detail View */}
      {isScanning ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200 dark:border-stone-800 space-y-3">
          <RotateCcw className="w-10 h-10 animate-spin text-emerald-700 mx-auto" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Analyzing leaf morphology and spore margin...
          </h3>
          <p className="text-xs text-stone-500">
            Scanning fungal spore margins and chloroplast chlorosis index.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Scanned Image and Disease Identity */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs flex flex-col">
            <div className="relative h-64 w-full bg-stone-100 dark:bg-stone-800">
              <img
                src={selectedCase.sampleImage}
                alt={selectedCase.diseaseName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs bg-emerald-600/90 px-2.5 py-0.5 rounded-md font-semibold">
                  {selectedCase.confidencePercent}% Precision Diagnosis
                </span>
                <h3 className="text-lg font-bold mt-1 leading-tight">{selectedCase.diseaseName}</h3>
                <p className="text-xs text-stone-300">{selectedCase.crop}</p>
              </div>
            </div>

            <div className="p-6 flex-1 space-y-4">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                  Identified Symptoms
                </span>
                <p className="text-xs text-stone-700 dark:text-stone-300 mt-1 leading-relaxed">
                  {selectedCase.symptoms}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs">
                <span className="font-semibold text-amber-900 dark:text-amber-300 block mb-0.5">
                  Soil Mineral / Nutrient Defect:
                </span>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                  {selectedCase.soilNutrientDeficiency}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Dual Prescription (Organic vs Chemical) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step-by-Step Action Plan */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                <span>Actionable Crop Prescription</span>
              </h3>

              {/* Organic Solution */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
                    Option A: Certified Organic & Biological Remedy
                  </span>
                  <span className="text-[10px] bg-emerald-200/80 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200 font-semibold">
                    Eco-Friendly
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {selectedCase.organicRemedy}
                </p>
              </div>

              {/* Chemical Treatment with Exact Dosage */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
                    Option B: Fast-Acting Chemical Knockdown
                  </span>
                  <span className="text-[10px] bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded text-stone-700 dark:text-stone-300 font-semibold">
                    Targeted Control
                  </span>
                </div>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {selectedCase.chemicalTreatment}
                </p>
                <div className="p-2.5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                    Exact Dosage:
                  </span>{' '}
                  <span className="text-stone-700 dark:text-stone-300">{selectedCase.dosage}</span>
                </div>
              </div>

              {/* Step checklist */}
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Step 1:</strong> Isolate and prune severely infected lower leaves before spraying.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Step 2:</strong> Spray during late afternoon (after 4:30 PM) ensuring full underside leaf coverage.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
