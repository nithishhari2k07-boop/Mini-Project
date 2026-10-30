/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  FlaskConical,
  X,
  History,
  Info,
} from 'lucide-react';
import { LanguageCode, PesticideScan } from '../types.ts';
import { translations } from '../translations/index.ts';

interface PesticideScannerProps {
  language: LanguageCode;
}

const STORAGE_KEY = 'techno_crop_scanned_pesticides';

const SAMPLE_HISTORICAL_SCANS: PesticideScan[] = [
  {
    id: 'scan-1',
    productName: 'Confidor 200 SL',
    activeIngredient: 'Imidacloprid 17.8% SL',
    category: 'Insecticide',
    targetCrops: ['Cotton', 'Paddy', 'Chilli', 'Tomato'],
    targetPests: ['Aphids', 'Jassids', 'Whiteflies', 'Thrips'],
    dosagePerAcre: '50 ml in 150-200 L water',
    dosagePerLiter: '0.3 - 0.5 ml / Litre (7.5 ml per 15L knapsack tank)',
    preHarvestIntervalDays: 21,
    toxicityTriangle: 'Blue',
    safetyPrecautions: [
      'Wear nitrile gloves & face mask during preparation.',
      'Do not apply during active morning bee foraging hours.',
      'Wash hands and face with soap and water after spraying.',
    ],
    timestamp: 'Yesterday, 02:40 PM',
    imageUrl: '/src/assets/images/crop_tomato_plant_1793384933284.jpg',
  },
  {
    id: 'scan-2',
    productName: 'Dithane M-45',
    activeIngredient: 'Mancozeb 75% WP',
    category: 'Fungicide',
    targetCrops: ['Potato', 'Tomato', 'Wheat', 'Paddy'],
    targetPests: ['Early & Late Blight', 'Leaf Spot', 'Blast'],
    dosagePerAcre: '600 - 800 g in 200 L water',
    dosagePerLiter: '2.0 - 2.5 g / Litre (30 - 35 g per 15L knapsack tank)',
    preHarvestIntervalDays: 14,
    toxicityTriangle: 'Green',
    safetyPrecautions: [
      'Avoid inhaling wettable dust powder.',
      'Apply preventively at first appearance of symptoms.',
      'Store in original dry sealed container away from animals.',
    ],
    timestamp: '3 days ago',
    imageUrl: '/src/assets/images/crop_wheat_field_1793384932703.jpg',
  },
];

export const PesticideScanner: React.FC<PesticideScannerProps> = ({ language }) => {
  const t = translations[language] || translations.en;

  const [history, setHistory] = useState<PesticideScan[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : SAMPLE_HISTORICAL_SCANS;
    } catch {
      return SAMPLE_HISTORICAL_SCANS;
    }
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<PesticideScan | null>(history[0] || null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save scanned history', e);
    }
  }, [history]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const openCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported in this browser environment.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      // Connect stream to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.warn('Video play failed:', err);
          });
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(t.cameraPermissionDenied);
      } else {
        setCameraError(`Unable to open camera: ${err.message || 'Device camera unavailable'}. Please try choosing from your gallery.`);
      }
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        stopCamera();
        processCapturedImage(dataUrl);
      }
    } catch (e) {
      console.error('Capture frame error:', e);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      processCapturedImage(dataUrl);
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = '';
  };

  const processCapturedImage = (imageDataUrl: string) => {
    setIsAnalyzing(true);

    // Realistic Agricultural Label Text Recognition & Analysis simulation
    setTimeout(() => {
      // Create parsed pesticide record based on authentic agrochemical labels
      const newScan: PesticideScan = {
        id: 'scan-' + Date.now(),
        productName: 'Coragen 18.5% SC',
        activeIngredient: 'Chlorantraniliprole 18.5% w/w SC',
        category: 'Insecticide',
        targetCrops: ['Paddy / Rice', 'Sugarcane', 'Cotton', 'Tomato', 'Brinjal', 'Maize'],
        targetPests: ['Stem Borer', 'Leaf Folder', 'Early Shoot Borer', 'American Bollworm', 'Fruit Borer'],
        dosagePerAcre: '60 ml per acre in 150 - 200 L water',
        dosagePerLiter: '0.3 - 0.4 ml / Litre of water (6 ml in 15 L knapsack sprayer)',
        preHarvestIntervalDays: 14,
        toxicityTriangle: 'Green',
        safetyPrecautions: [
          'Excellent safety profile for beneficial predators and pollinators when dry.',
          'Always use calibrated hollow-cone or flat-fan nozzles.',
          'Avoid contamination of aquaculture ponds and waterways.',
          'Wash sprayer tank thoroughly with clean water after use.',
        ],
        timestamp: 'Just now',
        imageUrl: imageDataUrl,
      };

      setCurrentResult(newScan);
      setHistory((prev) => [newScan, ...prev]);
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Scanner Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Camera className="w-6 h-6 text-emerald-700 dark:text-emerald-500" />
              <span>{t.scanPesticideTitle}</span>
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t.scanSubtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openCamera}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>{t.openCamera}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm font-medium rounded-xl border border-stone-300 dark:border-stone-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{t.chooseGallery}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Camera Permission Error Notice */}
        {cameraError && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{cameraError}</p>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {t.cameraSettingsInstruction} You can also upload a clear photo from your gallery using the "Choose from Gallery" button.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Live Camera Viewfinder Overlay Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-black rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
            {/* Top Bar inside Viewfinder */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-white">
              <span className="text-xs bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                Align pesticide bottle or packet in box
              </span>
              <button
                onClick={stopCamera}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video preview */}
            <div className="relative aspect-3/4 w-full bg-stone-950 flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Guide Box */}
              <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-2xl pointer-events-none shadow-lg">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-300"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-300"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-300"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-300"></div>
              </div>
            </div>

            {/* Bottom Camera Trigger */}
            <div className="p-6 bg-stone-900 flex items-center justify-center gap-4">
              <button
                onClick={capturePhoto}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>{t.takePhoto}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-8 border border-stone-200 dark:border-stone-800 text-center space-y-3">
          <RotateCcw className="w-8 h-8 mx-auto animate-spin text-emerald-700 dark:text-emerald-500" />
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Reading Chemical Label...
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Extracting active ingredients, CIB&RC registration status, mixing ratio, and safe harvest waiting period.
          </p>
        </div>
      )}

      {/* Current Scan Result Card */}
      {currentResult && !isAnalyzing && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-stone-200 dark:border-stone-800 bg-[#f9faf7] dark:bg-stone-900 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FlaskConical className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
              <div>
                <span className="text-xs text-stone-500 font-medium">{t.productName}</span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
                  {currentResult.productName}
                </h3>
              </div>
            </div>

            {/* Toxicity Triangle Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
              <span
                className={`w-3 h-3 rounded-full ${
                  currentResult.toxicityTriangle === 'Green'
                    ? 'bg-green-500'
                    : currentResult.toxicityTriangle === 'Blue'
                    ? 'bg-blue-500'
                    : currentResult.toxicityTriangle === 'Yellow'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              />
              <span className="font-medium text-stone-700 dark:text-stone-300">
                Caution Level: {currentResult.toxicityTriangle} Triangle
              </span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Active Ingredient & Dosage */}
            <div className="space-y-4">
              <div>
                <span className="text-xs text-stone-500 font-medium block">
                  {t.activeIngredient}
                </span>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                  {currentResult.activeIngredient}
                </p>
              </div>

              <div>
                <span className="text-xs text-stone-500 font-medium block">
                  {t.recommendedDosage}
                </span>
                <div className="mt-1 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                    {currentResult.dosagePerAcre}
                  </p>
                  <p className="text-xs text-stone-600 dark:text-stone-300">
                    Tank mix: {currentResult.dosagePerLiter}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-stone-500 font-medium block">
                  {t.waitingPeriod}
                </span>
                <p className="text-sm text-stone-800 dark:text-stone-200 mt-0.5 flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{currentResult.preHarvestIntervalDays} Days before harvesting</span>
                </p>
              </div>
            </div>

            {/* Right: Target Pests & Safety Precautions */}
            <div className="space-y-4">
              <div>
                <span className="text-xs text-stone-500 font-medium block">Target Pests & Crops</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {currentResult.targetPests.map((pest, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 bg-stone-100 dark:bg-stone-800 rounded-md text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
                    >
                      {pest}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-stone-500 font-medium block mb-1.5">
                  {t.safetyInstructions}
                </span>
                <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
                  {currentResult.safetyPrecautions.map((safe, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500 shrink-0 mt-0.5" />
                      <span>{safe}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanned History List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-stone-500" />
          <span>{t.scannedHistory}</span>
          <span className="text-xs text-stone-400 font-normal">({history.length})</span>
        </h3>

        <div className="divide-y divide-stone-200 dark:divide-stone-800">
          {history.map((scan) => (
            <div
              key={scan.id}
              onClick={() => setCurrentResult(scan)}
              className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/40 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {scan.productName}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {scan.activeIngredient} · {scan.dosagePerAcre}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-stone-400 block">{scan.timestamp}</span>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  View Specs →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
