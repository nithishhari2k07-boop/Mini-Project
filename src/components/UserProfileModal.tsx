/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  X,
  Check,
  AlertCircle,
  MapPin,
  Sprout,
  Mail,
  Calendar,
  Layers,
} from 'lucide-react';
import { LanguageCode, UserProfile } from '../types.ts';
import { translations } from '../translations/index.ts';
import { validateProfileData, saveStoredProfile } from '../utils/userProfile.ts';

interface UserProfileModalProps {
  language: LanguageCode;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  language,
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const t = translations[language] || translations.en;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof UserProfile, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateProfileData(formData);

    if (!result.isValid) {
      setErrors(result.errors as Record<string, string>);
      return;
    }

    const cleanData: UserProfile = {
      ...formData,
      fullName: formData.fullName.trim(),
      age: Number(formData.age),
      email: formData.email.trim(),
      landAreaAcres: Number(formData.landAreaAcres),
    };

    saveStoredProfile(cleanData);
    onSave(cleanData);
    setIsEditing(false);
    setToastMessage(t.savedSuccess);

    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 bg-[#f9faf7] dark:bg-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {t.profileTitle}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {profile.primaryCrop} · {profile.landAreaAcres} {t.acres}
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

        {/* Success Toast Banner */}
        {toastMessage && (
          <div className="m-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                  <span className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    {t.fullName}
                  </span>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {profile.fullName}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                  <span className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    {t.age}
                  </span>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {profile.age} Years
                  </p>
                </div>

                <div className="col-span-2 p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                  <span className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    {t.email}
                  </span>
                  <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-1 break-all">
                    {profile.email}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                  <span className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    {t.landArea}
                  </span>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {profile.landAreaAcres} {t.acres}
                  </p>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                  <span className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                    <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                    {t.primaryCrop}
                  </span>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {profile.primaryCrop}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                >
                  {t.editProfile}
                </button>
              </div>
            </div>
          ) : (
            /* Edit Form Mode with Strict Validations */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t.fullName} *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="e.g., Ramesh Patel"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                    errors.fullName
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-stone-300 dark:border-stone-700 focus:ring-emerald-600/30'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t.age} (1 - 120) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', Number(e.target.value))}
                  placeholder="e.g., 42"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                    errors.age
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-stone-300 dark:border-stone-700 focus:ring-emerald-600/30'
                  }`}
                />
                {errors.age && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.age}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t.email} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g., farmer@domain.com"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-stone-300 dark:border-stone-700 focus:ring-emerald-600/30'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Land Area */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t.landArea} ({t.acres}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.landAreaAcres}
                  onChange={(e) => handleInputChange('landAreaAcres', parseFloat(e.target.value) || '')}
                  placeholder="e.g., 5.5"
                  className={`w-full px-3.5 py-2 text-sm rounded-xl border bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 ${
                    errors.landAreaAcres
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-stone-300 dark:border-stone-700 focus:ring-emerald-600/30'
                  }`}
                />
                {errors.landAreaAcres && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.landAreaAcres}
                  </p>
                )}
              </div>

              {/* Primary Crop */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {t.primaryCrop}
                </label>
                <select
                  value={formData.primaryCrop}
                  onChange={(e) => handleInputChange('primaryCrop', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                >
                  <option value="Cotton & Wheat">Cotton & Wheat</option>
                  <option value="Paddy / Rice">Paddy / Rice</option>
                  <option value="Tomato & Vegetables">Tomato & Vegetables</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Maize & Pulses">Maize & Pulses</option>
                  <option value="Soybean & Mustard">Soybean & Mustard</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(profile);
                    setIsEditing(false);
                    setErrors({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
                >
                  {t.saveChanges}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
