/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationAlert } from '../types.ts';

const STORAGE_KEY = 'techno_crop_notifications';

export const getStoredNotifications = (): NotificationAlert[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: 'notif-1',
          title: 'Irrigation Advisory: High Temperature',
          message: 'Temperature peaking at 34°C today. Evening irrigation of 3.2 L/plant recommended for Tomato & Chilli.',
          category: 'irrigation',
          timestamp: 'Today, 08:30 AM',
          read: false,
          actionTab: 'irrigation',
        },
        {
          id: 'notif-2',
          title: 'Soil pH Sensor Sync Complete',
          message: 'Current soil pH is 6.4 (Optimal range). No lime or gypsum amendment required today.',
          category: 'ph',
          timestamp: 'Yesterday, 04:15 PM',
          read: true,
          actionTab: 'irrigation',
        },
        {
          id: 'notif-3',
          title: 'Mandi Price Spike: Wheat & Rice',
          message: 'Paddy prices up +4.2% at nearby District APMC Mandi. Good window for selling surplus stocks.',
          category: 'market',
          timestamp: 'Yesterday, 10:00 AM',
          read: true,
          actionTab: 'mandi',
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveNotifications = (notifications: NotificationAlert[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (err) {
    console.warn('Failed to save notifications to localStorage', err);
  }
};

export const checkNotificationPermission = (): NotificationPermission | 'unsupported' => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('System notifications are not supported in this browser environment.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const triggerSystemNotification = (
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    data?: any;
    onClick?: () => void;
  }
): boolean => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      // Use clean monochrome SVG or icon data URI for Android/System notification bar compatibility
      const notif = new Notification(title, {
        body: options?.body || 'Techno Crop AI farm advisory alert',
        icon: options?.icon || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2315803d"><path d="M12 2L3 9v13h18V9l-9-7zm0 3.84L18 10v10H6V10l6-4.16z"/></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2315803d"><circle cx="12" cy="12" r="10"/></svg>',
        tag: options?.tag || 'techno-crop-' + Date.now(),
      });

      if (options?.onClick) {
        notif.onclick = () => {
          window.focus();
          options.onClick?.();
        };
      }
      return true;
    } catch (err) {
      console.warn('Native notification spawn failed, fallback to in-app notification', err);
      return false;
    }
  }

  return false;
};
