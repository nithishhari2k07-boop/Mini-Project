/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn';

export interface UserProfile {
  fullName: string;
  age: number;
  email: string;
  landAreaAcres: number;
  primaryCrop: string;
  region: string;
  userId?: string;
  photoURL?: string;
}

export interface SensorData {
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  currentPh: number;
  temperatureC: number;
  batteryLevel: number;
  lastUpdated: string;
  history: Array<{
    time: string;
    ph: number;
  }>;
}

export interface PesticideScan {
  id: string;
  productName: string;
  activeIngredient: string;
  category: 'Insecticide' | 'Fungicide' | 'Herbicide' | 'Bio-Pesticide' | 'Fertilizer';
  targetCrops: string[];
  targetPests: string[];
  dosagePerAcre: string;
  dosagePerLiter: string;
  preHarvestIntervalDays: number;
  toxicityTriangle: 'Green' | 'Blue' | 'Yellow' | 'Red';
  safetyPrecautions: string[];
  timestamp: string;
  imageUrl?: string;
}

export interface AgriProduct {
  id: string;
  name: string;
  brandExamples: string;
  activeIngredient: string;
  category: 'Insecticide' | 'Fungicide' | 'Herbicide' | 'Bio-Pesticide' | 'Fertilizer';
  targetCrops: string[];
  targetPests: string[];
  recommendedDosage: string;
  safetyPrecautions: string[];
  waitingPeriodDays: number;
  manufacturer: string;
  orderUrl: string;
  imageUrl: string;
  toxicityGrade: 'Green' | 'Blue' | 'Yellow' | 'Red';
}

export interface VoiceMessage {
  id: string;
  sender: 'farmer' | 'assistant';
  text: string;
  timestamp: string;
  actionBullets?: string[];
}

export interface MandiPrice {
  crop: string;
  variety: string;
  mandi: string;
  state: string;
  currentPrice: number; // in INR per quintal
  changePercent: number;
  trend: 'rising' | 'falling' | 'stable';
  forecastAdvice: string;
  updatedDate: string;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  category: 'weather' | 'irrigation' | 'ph' | 'market' | 'pesticide';
  timestamp: string;
  read: boolean;
  actionTab?: string;
}
