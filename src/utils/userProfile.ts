/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types.ts';

const PROFILE_KEY = 'techno_crop_user_profile';

const DEFAULT_PROFILE: UserProfile = {
  fullName: 'Rajesh Patel',
  age: 42,
  email: 'rajesh.patel.agri@example.com',
  landAreaAcres: 5.5,
  primaryCrop: 'Cotton & Wheat',
  region: 'Indore, Madhya Pradesh',
};

export const getStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) {
      return DEFAULT_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_PROFILE;
  }
};

export const saveStoredProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
};

export interface ProfileValidationResult {
  isValid: boolean;
  errors: {
    fullName?: string;
    age?: string;
    email?: string;
    landAreaAcres?: string;
  };
}

export const validateProfileData = (data: Partial<UserProfile>): ProfileValidationResult => {
  const errors: ProfileValidationResult['errors'] = {};

  // Name: required, letters and spaces only
  if (!data.fullName || data.fullName.trim() === '') {
    errors.fullName = 'Full name is required.';
  } else if (!/^[A-Za-z\s.'-]+$/.test(data.fullName.trim())) {
    errors.fullName = 'Name must contain letters only (no numbers or special symbols).';
  }

  // Age: number between 1 and 120
  if (data.age === undefined || data.age === null || isNaN(Number(data.age))) {
    errors.age = 'Age is required.';
  } else {
    const ageNum = Number(data.age);
    if (ageNum < 1 || ageNum > 120 || !Number.isInteger(ageNum)) {
      errors.age = 'Age must be a whole number between 1 and 120.';
    }
  }

  // Email: valid email format
  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address (e.g., name@domain.com).';
  }

  // Land area: positive decimal number in acres
  if (data.landAreaAcres === undefined || data.landAreaAcres === null || isNaN(Number(data.landAreaAcres))) {
    errors.landAreaAcres = 'Land area is required.';
  } else {
    const landNum = Number(data.landAreaAcres);
    if (landNum <= 0) {
      errors.landAreaAcres = 'Land area must be a positive decimal number in acres.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
