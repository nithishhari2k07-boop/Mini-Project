/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Send,
  Droplets,
  Activity,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { LanguageCode, NotificationAlert } from '../types.ts';
import { translations } from '../translations/index.ts';
import {
  triggerSystemNotification,
  requestNotificationPermission,
  checkNotificationPermission,
} from '../utils/notifications.ts';

interface NotificationModalProps {
  language: LanguageCode;
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationAlert[];
  onMarkAllRead: () => void;
  onTriggerTest: () => void;
  onNavigate: (tab: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  language,
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onTriggerTest,
  onNavigate,
}) => {
  const t = translations[language] || translations.en;
  const [permissionStatus, setPermissionStatus] = useState<string>(checkNotificationPermission());
  const [testSentNotice, setTestSentNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEnableSystemNotifications = async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(granted ? 'granted' : 'denied');
  };

  const handleSendTest = () => {
    onTriggerTest();
    setTestSentNotice(t.testNotificationSent);
    setTimeout(() => setTestSentNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-[#f9faf7] dark:bg-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {t.notificationsTitle}
              </h3>
              <p className="text-xs text-stone-500">
                System and field advisory alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 flex items-center justify-center text-stone-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Bar Permission Prompt & Test Button Strip */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 space-y-2">
          {permissionStatus !== 'granted' ? (
            <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Enable notifications to receive background weather and soil alerts.</span>
              </div>
              <button
                onClick={handleEnableSystemNotifications}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shrink-0 whitespace-nowrap"
              >
                Allow
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                System notification bar alerts enabled
              </span>
            </div>
          )}

          {/* Test Notification Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleSendTest}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.sendTestNotification}</span>
            </button>

            <button
              onClick={onMarkAllRead}
              className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{t.markAllRead}</span>
            </button>
          </div>

          {testSentNotice && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold animate-pulse">
              {testSentNotice}
            </p>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100 dark:divide-stone-800">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs">
              No new alerts at this time.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.actionTab) {
                    onNavigate(item.actionTab);
                    onClose();
                  }
                }}
                className={`py-3.5 px-3 rounded-xl transition-colors cursor-pointer ${
                  !item.read
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 shrink-0 mt-0.5">
                    {item.category === 'irrigation' && <Droplets className="w-4 h-4 text-emerald-600" />}
                    {item.category === 'ph' && <Activity className="w-4 h-4 text-emerald-600" />}
                    {item.category === 'market' && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                    {item.category === 'weather' && <Info className="w-4 h-4 text-amber-600" />}
                    {item.category === 'pesticide' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
