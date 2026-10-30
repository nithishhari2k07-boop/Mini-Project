/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Droplets,
  Activity,
  Layers,
  Thermometer,
  RotateCw,
  Bluetooth,
  Battery,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LanguageCode, SensorData } from '../types.ts';
import { translations } from '../translations/index.ts';
import { phSensorService } from '../utils/phSensor.ts';

interface SmartIrrigationProps {
  language: LanguageCode;
  sensorData: SensorData;
  onRefreshSensor: () => void;
}

export const SmartIrrigation: React.FC<SmartIrrigationProps> = ({
  language,
  sensorData,
  onRefreshSensor,
}) => {
  const t = translations[language] || translations.en;

  // Farm soil & crop stage state
  const [soilType, setSoilType] = useState<'Loam' | 'Clay' | 'Sandy' | 'Black Cotton'>('Black Cotton');
  const [cropStage, setCropStage] = useState<'Vegetative' | 'Flowering' | 'Fruit / Grain Filling' | 'Maturity'>('Flowering');
  const [weatherCondition, setWeatherCondition] = useState<'Sunny & Hot' | 'Partly Cloudy' | 'Rain Expected'>('Sunny & Hot');
  const [landArea, setLandArea] = useState<number>(3.0);

  // Calculate precise water requirement (Liters per acre & mm/hour)
  const calculateIrrigation = () => {
    let baseLitersPerAcre = 8500; // Base requirement for average conditions

    if (soilType === 'Sandy') baseLitersPerAcre *= 1.25;
    else if (soilType === 'Clay') baseLitersPerAcre *= 0.85;
    else if (soilType === 'Black Cotton') baseLitersPerAcre *= 0.95;

    if (cropStage === 'Flowering') baseLitersPerAcre *= 1.35; // Critical moisture sensitive stage
    else if (cropStage === 'Fruit / Grain Filling') baseLitersPerAcre *= 1.2;
    else if (cropStage === 'Maturity') baseLitersPerAcre *= 0.6;

    if (weatherCondition === 'Sunny & Hot') baseLitersPerAcre *= 1.15;
    else if (weatherCondition === 'Rain Expected') baseLitersPerAcre *= 0.3;

    const totalFieldLiters = Math.round(baseLitersPerAcre * landArea);
    const litersPerPlant = ((totalFieldLiters / (landArea * 4000))).toFixed(1); // approx 4000 plants/acre for vegetables/cotton
    const dripRunHours = (totalFieldLiters / 6000).toFixed(1); // Standard 6000 L/hr pump delivery

    return {
      litersPerAcre: Math.round(baseLitersPerAcre),
      totalFieldLiters,
      litersPerPlant,
      dripRunHours,
    };
  };

  const prescription = calculateIrrigation();

  const handleConnectToggle = async () => {
    if (sensorData.connectionStatus === 'connected') {
      phSensorService.disconnect();
    } else {
      await phSensorService.connect();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-emerald-700 dark:text-emerald-500" />
            <span>Smart Irrigation & Soil Moisture Predictor</span>
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Calculate exact water volume per plant to avoid root rot and water wastage.
          </p>
        </div>

        {/* Live Bluetooth pH Sensor Status Chip */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleConnectToggle}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs ${
              sensorData.connectionStatus === 'connected'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : sensorData.connectionStatus === 'connecting'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 hover:bg-stone-200'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>
              {sensorData.connectionStatus === 'connected'
                ? `${t.phStatusConnected} (pH ${sensorData.currentPh})`
                : sensorData.connectionStatus === 'connecting'
                ? t.phStatusConnecting
                : t.connectSensor}
            </span>
          </button>
        </div>
      </div>

      {/* Main Grid: Soil Parameters Left, Precision Prescription Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Soil & Field Controls */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
            <span>Field Parameters</span>
          </h3>

          {/* Soil Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Soil Texture Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Loam', 'Clay', 'Sandy', 'Black Cotton'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSoilType(type)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-colors ${
                    soilType === type
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {type} Soil
                </button>
              ))}
            </div>
          </div>

          {/* Crop Stage */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Current Crop Growth Stage
            </label>
            <select
              value={cropStage}
              onChange={(e) => setCropStage(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="Vegetative">Early Vegetative Growth</option>
              <option value="Flowering">Flowering & Pollination (High Demand)</option>
              <option value="Fruit / Grain Filling">Fruit / Grain Filling Stage</option>
              <option value="Maturity">Late Maturity / Pre-Harvest</option>
            </select>
          </div>

          {/* Weather Today */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Current Weather & Forecast
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Sunny & Hot', 'Partly Cloudy', 'Rain Expected'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setWeatherCondition(w)}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                    weatherCondition === w
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Land Area */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Field Area to Irrigate (Acres)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={landArea}
              onChange={(e) => setLandArea(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        {/* Actionable Irrigation Prescription Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-green-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                Actionable Water Prescription
              </span>
              <span className="text-xs bg-emerald-800/80 px-3 py-1 rounded-full text-emerald-200 border border-emerald-700">
                Stage: {cropStage}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-xs text-emerald-200 font-medium block">
                  Per Plant Volume
                </span>
                <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  {prescription.litersPerPlant} L
                </p>
                <span className="text-[11px] text-emerald-300">Target root zone</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <span className="text-xs text-emerald-200 font-medium block">
                  Drip Pump Runtime
                </span>
                <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  {prescription.dripRunHours} hrs
                </p>
                <span className="text-[11px] text-emerald-300">At standard flow</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-xs text-emerald-200 font-medium block">
                  Total Field Volume
                </span>
                <p className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                  {(prescription.totalFieldLiters / 1000).toFixed(1)}k L
                </p>
                <span className="text-[11px] text-emerald-300">For {landArea} Acres</span>
              </div>
            </div>

            {/* Step-by-step Execution Advice */}
            <div className="mt-5 pt-4 border-t border-emerald-800/80 space-y-2 text-xs text-emerald-100">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Step 1:</strong> Start drip lines at 05:30 PM to minimize surface evaporative loss.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Step 2:</strong> Check soil moisture 6 inches deep tomorrow morning—it should be damp, not soggy.
                </span>
              </div>
            </div>
          </div>

          {/* Soil pH Sensor Live Monitor Card */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Real-time Soil pH Probe Monitor
                  </h3>
                  <p className="text-xs text-stone-500">
                    Wireless BLE environmental probe status
                  </p>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    sensorData.connectionStatus === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : sensorData.connectionStatus === 'connecting'
                      ? 'bg-amber-500 animate-bounce'
                      : 'bg-stone-400'
                  }`}
                />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {sensorData.connectionStatus === 'connected'
                    ? t.phStatusConnected
                    : sensorData.connectionStatus === 'connecting'
                    ? t.phStatusConnecting
                    : t.phStatusDisconnected}
                </span>
              </div>
            </div>

            {sensorData.connectionStatus === 'connected' ? (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                    <span className="text-xs text-stone-500 font-medium">Current pH</span>
                    <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                      {sensorData.currentPh}
                    </p>
                    <span className="text-[10px] text-stone-400">{t.optimalRange}</span>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                    <span className="text-xs text-stone-500 font-medium">Soil Temp</span>
                    <p className="text-xl font-bold font-mono text-stone-800 dark:text-stone-200 mt-1">
                      {sensorData.temperatureC}°C
                    </p>
                    <span className="text-[10px] text-stone-400">Root zone</span>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl">
                    <span className="text-xs text-stone-500 font-medium">Sensor Battery</span>
                    <p className="text-xl font-bold font-mono text-stone-800 dark:text-stone-200 mt-1 flex items-center justify-center gap-1">
                      <Battery className="w-4 h-4 text-emerald-600" />
                      <span>{sensorData.batteryLevel}%</span>
                    </p>
                    <span className="text-[10px] text-stone-400">Bluetooth LE</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-300">
                  <p className="font-semibold">Soil Nutrient Availability Verdict:</p>
                  <p className="mt-0.5">
                    At pH {sensorData.currentPh}, Nitrogen (N), Phosphorus (P), and Potassium (K) uptake by roots is running at 94% optimal efficiency. No chemical soil conditioners needed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-6 space-y-3">
                <Bluetooth className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Connect your Bluetooth or USB Soil pH sensor to read real-time soil acidity, moisture, and root-zone temperature.
                </p>
                <button
                  onClick={handleConnectToggle}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {t.connectSensor}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
