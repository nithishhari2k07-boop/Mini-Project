/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Bell,
  Globe,
  Sun,
  Moon,
  User,
  Bluetooth,
  ChevronDown,
} from 'lucide-react';
import { LanguageCode, SensorData, UserProfile } from '../types.ts';
import { translations, languageList } from '../translations/index.ts';
import { Logo } from './Logo.tsx';

interface TopBarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  language: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  profile: UserProfile;
  sensorData: SensorData;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onConnectSensor: () => void;
  firebaseUser: any;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  language,
  onSelectLanguage,
  theme,
  onToggleTheme,
  profile,
  sensorData,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenProfile,
  onConnectSensor,
  firebaseUser,
  onGoogleSignIn,
  onGoogleSignOut,
}) => {
  const t = translations[language] || translations.en;

  const navItems = [
    { id: 'dashboard', label: t.navDashboard },
    { id: 'weather', label: t.navWeather },
    { id: 'doctor', label: t.navDoctor },
    { id: 'irrigation', label: t.navIrrigation },
    { id: 'mandi', label: t.navMandi },
    { id: 'products', label: t.navProducts },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 md:gap-8 h-16">
        {/* Zone 1: Single Brand Wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none shrink-0"
        >
          <Logo size="sm" showText={true} />
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors pb-1 text-sm ${
                currentTab === item.id
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold border-b-2 border-emerald-600'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Interactive Affordances (Sensor Status, Notifications, Language, Theme, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* pH Sensor Status Badge */}
          <button
            onClick={onConnectSensor}
            title={
              sensorData.connectionStatus === 'connected'
                ? `Connected: ${sensorData.currentPh} pH`
                : 'Click to connect soil pH sensor'
            }
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              sensorData.connectionStatus === 'connected'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : sensorData.connectionStatus === 'connecting'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5" />
            <span>
              {sensorData.connectionStatus === 'connected'
                ? `${sensorData.currentPh} pH`
                : 'pH Sensor'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                sensorData.connectionStatus === 'connected'
                  ? 'bg-emerald-500'
                  : sensorData.connectionStatus === 'connecting'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-stone-400'
              }`}
            />
          </button>

          {/* System Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            aria-label="Farm notifications"
            className="relative p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative flex items-center">
            <Globe className="w-4 h-4 absolute left-2 text-stone-500 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
              aria-label="Select app language"
              className="appearance-none pl-7 pr-6 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors focus:outline-none cursor-pointer"
            >
              {languageList.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} ({lang.code.toUpperCase()})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 text-stone-400 pointer-events-none" />
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Dedicated User Profile Icon Button (Separate Profile Icon) */}
          <button
            onClick={onOpenProfile}
            title={profile.fullName ? `${profile.fullName} (${profile.landAreaAcres} acres) · Farmer Profile` : 'Farmer Profile'}
            aria-label="Farmer Profile"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline text-xs font-semibold">
              {profile.fullName ? profile.fullName.split(' ')[0] : 'Profile'}
            </span>
          </button>

          {/* Google Sign-in / Firebase Auth Button */}
          {firebaseUser ? (
            <div className="flex items-center gap-1.5">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'Google Account'}
                  title={firebaseUser.email || firebaseUser.displayName}
                  className="w-7 h-7 rounded-lg object-cover border border-emerald-300 dark:border-emerald-800"
                />
              ) : null}
              <button
                onClick={onGoogleSignOut}
                title={t.signOut}
                className="px-2 py-1 text-xs font-medium text-stone-500 hover:text-red-600 transition-colors"
              >
                {t.signOut}
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleSignIn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 shadow-xs text-xs font-semibold text-stone-700 dark:text-stone-200 transition-colors shrink-0"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">{t.signInGoogle}</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-stone-200/80 dark:border-stone-800/80 bg-[#f9faf7] dark:bg-stone-900/90 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors ${
              currentTab === item.id
                ? 'bg-emerald-700 text-white font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
