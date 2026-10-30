/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageCode, SensorData, UserProfile, NotificationAlert } from './types.ts';
import { translations } from './translations/index.ts';
import { TopBar } from './components/TopBar.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { VoiceAssistant } from './components/VoiceAssistant.tsx';
import { PesticideScanner } from './components/PesticideScanner.tsx';
import { SmartIrrigation } from './components/SmartIrrigation.tsx';
import { MarketMandi } from './components/MarketMandi.tsx';
import { AgriProductsCatalog } from './components/AgriProductsCatalog.tsx';
import { UserProfileModal } from './components/UserProfileModal.tsx';
import { NotificationModal } from './components/NotificationModal.tsx';
import { PlantDoctor } from './components/PlantDoctor.tsx';
import { WeatherWidget } from './components/WeatherWidget.tsx';
import { RamboVoiceBotFloating } from './components/RamboVoiceBotFloating.tsx';
import { ExtremeWeatherAlert } from './utils/weatherService.ts';
import { phSensorService } from './utils/phSensor.ts';
import {
  getStoredNotifications,
  saveNotifications,
  triggerSystemNotification,
  requestNotificationPermission,
} from './utils/notifications.ts';
import { getStoredProfile, saveStoredProfile } from './utils/userProfile.ts';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase.ts';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { Sprout, ShieldCheck, Heart, Info, CloudSun } from 'lucide-react';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('techno_crop_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Language state
  const [language, setLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('techno_crop_lang') as LanguageCode;
    return saved || 'en';
  });

  // Current active view/tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // User Profile state
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // pH Sensor Telemetry state
  const [sensorData, setSensorData] = useState<SensorData>(() => phSensorService.getData());

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationAlert[]>(() =>
    getStoredNotifications()
  );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Rambo Voice Bot floating state
  const [isRamboBotOpen, setIsRamboBotOpen] = useState(false);

  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('techno_crop_theme', theme);
  }, [theme]);

  // Apply language preference to localStorage
  const handleSelectLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem('techno_crop_lang', lang);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Subscribe to pH Sensor changes
  useEffect(() => {
    const unsubscribe = phSensorService.subscribe((data) => {
      setSensorData(data);
    });
    return () => unsubscribe();
  }, []);

  // Save notifications when updated
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  // Toggle sensor connection
  const handleConnectSensor = async () => {
    if (sensorData.connectionStatus === 'connected') {
      phSensorService.disconnect();
    } else {
      await phSensorService.connect();
    }
  };

  // Firebase Auth state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Monitor Firebase Auth state changes and sync profile with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
          } else {
            // First time Google login: Seed user document in Firestore
            const initialData: UserProfile = {
              ...profile,
              fullName: user.displayName || profile.fullName,
              email: user.email || profile.email,
              userId: user.uid,
              photoURL: user.photoURL || undefined,
            };
            await setDoc(userDocRef, initialData);
            setProfile(initialData);
          }
        } catch (err) {
          console.warn('Firestore user profile sync note:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out failed:', err);
    }
  };

  const handleSaveProfile = async (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...updated,
          userId: firebaseUser.uid,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'users/' + firebaseUser.uid);
      }
    }
  };

  const handleExtremeWeatherAlert = async (alert: ExtremeWeatherAlert) => {
    const notif: NotificationAlert = {
      id: alert.id,
      title: alert.title,
      message: `${alert.description} Action: ${alert.actionSteps[0]}`,
      category: 'weather',
      timestamp: 'Just now',
      read: false,
      actionTab: 'weather',
    };

    setNotifications((prev) => [notif, ...prev]);

    // Save to Firestore if user is logged in
    if (firebaseUser) {
      try {
        await addDoc(collection(db, 'weatherAlerts'), {
          title: alert.title,
          message: alert.description,
          eventType: alert.type,
          severity: alert.severity,
          userId: firebaseUser.uid,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore weather alert save note:', err);
      }
    }
  };

  // Trigger test system notification (Prompt Item #2 requirement)
  const handleTriggerTestNotification = async () => {
    // Request permission if not already granted
    await requestNotificationPermission();

    const title = 'Techno Crop AI: Field Advisory';
    const message = `Soil moisture optimal at ${sensorData.currentPh} pH. Drip irrigation scheduled for 5:30 PM today.`;

    // 1. Fire native browser notification bar alert
    triggerSystemNotification(title, {
      body: message,
      onClick: () => {
        setCurrentTab('irrigation');
      },
    });

    // 2. Add to in-app log
    const newNotif: NotificationAlert = {
      id: 'test-' + Date.now(),
      title,
      message,
      category: 'irrigation',
      timestamp: 'Just now',
      read: false,
      actionTab: 'irrigation',
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const t = translations[language] || translations.en;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf6] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      {/* Top Bar Navigation */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        profile={profile}
        sensorData={sensorData}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onConnectSensor={handleConnectSensor}
        firebaseUser={firebaseUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            language={language}
            profile={profile}
            sensorData={sensorData}
            onNavigate={setCurrentTab}
            onConnectSensor={handleConnectSensor}
            onOpenVoice={() => setIsRamboBotOpen(true)}
          />
        )}

        {currentTab === 'weather' && (
          <WeatherWidget
            language={language}
            onExtremeAlertTriggered={handleExtremeWeatherAlert}
          />
        )}

        {currentTab === 'doctor' && (
          <div className="space-y-10">
            {/* Plant Doctor Diagnostics */}
            <PlantDoctor language={language} />

            {/* Pesticide Label Scanner */}
            <PesticideScanner language={language} />
          </div>
        )}

        {currentTab === 'irrigation' && (
          <SmartIrrigation
            language={language}
            sensorData={sensorData}
            onRefreshSensor={handleConnectSensor}
          />
        )}

        {currentTab === 'mandi' && <MarketMandi language={language} />}

        {currentTab === 'products' && <AgriProductsCatalog language={language} />}

        {currentTab === 'voice' && (
          <VoiceAssistant language={language} userName={profile.fullName} />
        )}
      </main>

      {/* Floating Rambo Voice Bot (Chat Bot in bottom right corner, tap to access) */}
      <RamboVoiceBotFloating
        language={language}
        userName={profile.fullName}
        isOpen={isRamboBotOpen}
        onToggle={() => setIsRamboBotOpen((prev) => !prev)}
        onClose={() => setIsRamboBotOpen(false)}
      />

      {/* Farmer Profile Modal */}
      <UserProfileModal
        language={language}
        profile={profile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* Notification Center Modal */}
      <NotificationModal
        language={language}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onTriggerTest={handleTriggerTestNotification}
        onNavigate={setCurrentTab}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 py-8 px-4 sm:px-6 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-800 dark:text-stone-200">Techno Crop AI</span>
              <span>·</span>
              <span>{t.tagline}</span>
              <span>·</span>
              <span>v2.4.0</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
              <span>Official Agrochemical Guidance & CIB&RC Standards</span>
              <span>·</span>
              <span className="text-emerald-700 dark:text-emerald-400">Photo Attribution: Agricultural Documentary</span>
              <span>·</span>
              <button
                onClick={() => setIsProfileOpen(true)}
                className="text-stone-700 dark:text-stone-300 underline hover:no-underline"
              >
                {profile.fullName} ({profile.landAreaAcres} {t.acres})
              </button>
            </div>
          </div>

          {/* Prominent Footer Credit: Made by Rambo Private Limited */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                Official
              </span>
              <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                Made by Rambo Private Limited
              </p>
            </div>
            <p className="text-stone-500 dark:text-stone-400 text-[11px]">
              Empowering farmers with AI diagnostics, real-time weather alerts, and precision agronomy.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
