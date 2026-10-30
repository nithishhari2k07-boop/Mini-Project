/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  Wind,
  Droplets,
  AlertTriangle,
  Flame,
  Send,
  MapPin,
  Compass,
  RotateCw,
  CheckCircle,
  Activity,
  Layers,
  Thermometer,
} from 'lucide-react';
import {
  WeatherData,
  WeatherLocation,
  AGRI_LOCATIONS,
  fetchLiveWeatherData,
  sendWeatherPushNotification,
  ExtremeWeatherAlert,
} from '../utils/weatherService.ts';
import { LanguageCode } from '../types.ts';
import { CropField3D } from './CropField3D.tsx';

interface WeatherWidgetProps {
  language: LanguageCode;
  onExtremeAlertTriggered?: (alert: ExtremeWeatherAlert) => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  language,
  onExtremeAlertTriggered,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation>(AGRI_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pushStatusMessage, setPushStatusMessage] = useState<string | null>(null);

  const loadWeather = async (loc: WeatherLocation) => {
    setIsLoading(true);
    try {
      const data = await fetchLiveWeatherData(loc);
      setWeatherData(data);
    } catch (err) {
      console.warn('Weather load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedLocation);
  }, [selectedLocation]);

  const handlePushAlert = (alert: ExtremeWeatherAlert) => {
    const success = sendWeatherPushNotification(alert);
    onExtremeAlertTriggered?.(alert);

    if (success) {
      setPushStatusMessage(`Push notification sent to your device notification bar for: ${alert.title}`);
    } else {
      setPushStatusMessage(`Notification triggered in-app (please enable notification permission in browser).`);
    }

    setTimeout(() => {
      setPushStatusMessage(null);
    }, 4500);
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc: WeatherLocation = {
            name: 'Local Farm Coordinates',
            state: 'GPS Located',
            latitude: Number(position.coords.latitude.toFixed(4)),
            longitude: Number(position.coords.longitude.toFixed(4)),
          };
          setSelectedLocation(userLoc);
        },
        (err) => {
          console.warn('Geolocation denied or failed:', err);
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Weather Header Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-emerald-700 dark:text-emerald-500" />
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Live Weather & Extreme Event Forecast
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time agro-meteorological station telemetry and extreme weather early warning.
          </p>
        </div>

        {/* Location selector and GPS button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <select
              value={selectedLocation.name}
              onChange={(e) => {
                const found = AGRI_LOCATIONS.find((l) => l.name === e.target.value);
                if (found) setSelectedLocation(found);
              }}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              {AGRI_LOCATIONS.map((loc) => (
                <option key={loc.name} value={loc.name}>
                  {loc.name}, {loc.state}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleUseCurrentLocation}
            title="Use current GPS location"
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-emerald-700" />
          </button>

          <button
            onClick={() => loadWeather(selectedLocation)}
            title="Refresh weather data"
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>
      </div>

      {/* Push Notification Feedback Banner */}
      {pushStatusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs animate-pulse">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{pushStatusMessage}</span>
        </div>
      )}

      {/* Extreme Weather Early Warnings (Heat Waves, Heavy Rain) */}
      {weatherData && weatherData.activeAlerts.length > 0 && (
        <div className="space-y-4">
          {weatherData.activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.type === 'heat_wave'
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
                  : alert.type === 'heavy_rain'
                  ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800/80 text-sky-950 dark:text-sky-200'
                  : 'bg-stone-50 dark:bg-stone-800/60 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    alert.type === 'heat_wave'
                      ? 'bg-amber-500 text-white'
                      : alert.type === 'heavy_rain'
                      ? 'bg-sky-600 text-white'
                      : 'bg-stone-700 text-white'
                  }`}
                >
                  {alert.type === 'heat_wave' ? (
                    <Flame className="w-6 h-6 animate-pulse" />
                  ) : alert.type === 'heavy_rain' ? (
                    <CloudRain className="w-6 h-6 animate-bounce" />
                  ) : (
                    <Wind className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-stone-900/60 border border-black/10">
                      {alert.severity}
                    </span>
                    <h3 className="text-base font-bold leading-tight">{alert.title}</h3>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">{alert.description}</p>

                  <div className="pt-2 space-y-1">
                    {alert.actionSteps.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button: Send Push Notification to Device Notification Bar */}
              <div className="shrink-0 flex flex-col gap-2">
                <button
                  onClick={() => handlePushAlert(alert)}
                  className="px-5 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-100 text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Push Alert to Bar</span>
                </button>
                <span className="text-[10px] text-center opacity-60">
                  Trigger: {alert.triggerMetric}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Meteorological Grid */}
      {weatherData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Weather Parameters & Bioscience Agronomy (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Primary Current Metrics Box */}
            <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
                    Current Field Conditions
                  </span>
                  <h3 className="text-2xl font-bold mt-1">
                    {weatherData.location.name}, {weatherData.location.state}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-mono font-bold tabular-nums">
                    {weatherData.current.temperature}°C
                  </span>
                  <p className="text-xs text-emerald-200">
                    Feels like {weatherData.current.apparentTemperature}°C
                  </p>
                </div>
              </div>

              {/* Weather Stats Strip */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-emerald-800/70 text-xs">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5" />
                    Humidity
                  </span>
                  <p className="text-lg font-bold font-mono mt-1">
                    {weatherData.current.relativeHumidity}%
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />
                    Wind Gusts
                  </span>
                  <p className="text-lg font-bold font-mono mt-1">
                    {weatherData.current.windGusts} km/h
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5" />
                    Precipitation
                  </span>
                  <p className="text-lg font-bold font-mono mt-1">
                    {weatherData.current.precipitation} mm/h
                  </p>
                </div>
              </div>
            </div>

            {/* Bioscience Crop Metrics (GDD, VPD, Transpiration Stress) */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
                  <span>Bioscience Agronomy Metrics</span>
                </h4>
                <span className="text-xs text-stone-400">Scientific Model</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl">
                  <span className="text-xs text-stone-500 font-medium block">
                    GDD (Base 10°C)
                  </span>
                  <p className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
                    {weatherData.bioMetrics.growingDegreeDays}
                  </p>
                  <span className="text-[10px] text-stone-400">Daily accumulation</span>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl">
                  <span className="text-xs text-stone-500 font-medium block">
                    VPD (Vapor Pressure)
                  </span>
                  <p className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1">
                    {weatherData.bioMetrics.vaporPressureDeficitKPa} kPa
                  </p>
                  <span className="text-[10px] text-stone-400">Transpiration drive</span>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl">
                  <span className="text-xs text-stone-500 font-medium block">
                    Crop Stress Level
                  </span>
                  <p
                    className={`text-base font-bold mt-1 ${
                      weatherData.bioMetrics.transpirationStressIndex === 'High'
                        ? 'text-red-600'
                        : weatherData.bioMetrics.transpirationStressIndex === 'Moderate'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {weatherData.bioMetrics.transpirationStressIndex}
                  </p>
                  <span className="text-[10px] text-stone-400">Stomatal status</span>
                </div>
              </div>
            </div>

            {/* 5-Day Agricultural Forecast Strip */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                5-Day Agronomic Outlook
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {weatherData.daily.map((day, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-700/80 text-center flex flex-col justify-between"
                  >
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {day.dayName}
                    </span>

                    <div className="my-2 flex justify-center">
                      {day.precipitationSum > 5 ? (
                        <CloudRain className="w-5 h-5 text-sky-500" />
                      ) : day.tempMax >= 38 ? (
                        <Flame className="w-5 h-5 text-red-500" />
                      ) : (
                        <Sun className="w-5 h-5 text-amber-500" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold font-mono">
                        {day.tempMax}° / <span className="text-stone-400">{day.tempMin}°</span>
                      </div>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 block mt-0.5">
                        {day.precipitationProbability}% Rain
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 3D Crop Field Canopy Visualizer (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    3D Crop Canopy Microclimate
                  </h4>
                  <p className="text-xs text-stone-500">
                    Interactive WebGL procedural field simulation
                  </p>
                </div>
              </div>

              {/* Three.js 3D Scene */}
              <CropField3D
                weatherMode={
                  weatherData.activeAlerts.some((a) => a.type === 'heat_wave')
                    ? 'heat_wave'
                    : weatherData.activeAlerts.some((a) => a.type === 'heavy_rain')
                    ? 'rain'
                    : 'sunny'
                }
                ambientTempC={weatherData.current.temperature}
              />

              <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  Canopy Microclimate Verdict:
                </p>
                <p>
                  Procedural plant transpiration reacts to ambient VPD and thermal index. Furrow moisture levels automatically adjust based on precipitation forecast.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
