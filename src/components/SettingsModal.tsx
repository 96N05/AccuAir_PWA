/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  getStoredAccuWeatherApiKey,
  saveStoredAccuWeatherApiKey,
  getStoredUnit,
  saveStoredUnit,
} from '../services/cache';
import { X, Key, Wifi, WifiOff, Trash2, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempUnit: 'C' | 'F';
  onUnitChange: (unit: 'C' | 'F') => void;
  onApiKeyChange: () => void;
  isOffline: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  tempUnit,
  onUnitChange,
  onApiKeyChange,
  isOffline,
}) => {
  const [apiKey, setApiKey] = useState(() => getStoredAccuWeatherApiKey());
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);
  const [clearedCacheSuccess, setClearedCacheSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredAccuWeatherApiKey(apiKey);
    onApiKeyChange();
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 2000);
  };

  const handleClearCache = () => {
    // Clear localStorage cached forecasts
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('accuair_forecast_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setClearedCacheSuccess(true);
    setTimeout(() => setClearedCacheSuccess(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 id="settings-modal-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Widget Settings
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Update frequency, units, and API credentials
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Temperature Unit */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 block">
              Temperature Unit
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  saveStoredUnit('C');
                  onUnitChange('C');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  tempUnit === 'C'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Celsius (°C)
              </button>
              <button
                type="button"
                onClick={() => {
                  saveStoredUnit('F');
                  onUnitChange('F');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  tempUnit === 'F'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                    : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Fahrenheit (°F)
              </button>
            </div>
          </div>

          {/* Auto-update Cadence */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1 block">
              Hourly Auto-Update Cadence
            </label>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              The widget automatically re-queries AccuWeather every 60 minutes in the background, minimizing data usage and keeping conditions accurate.
            </p>
          </div>

          {/* Network & Offline Status */}
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Network Status:</span>
              <span className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
                {isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-500" /> Offline (using cached data)
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" /> Online
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-700/60">
              <span className="text-neutral-500 dark:text-neutral-400">Offline Caching:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Active in localStorage
              </span>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleClearCache}
                className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
              >
                <Trash2 className="w-3 h-3" />
                {clearedCacheSuccess ? 'Cache cleared!' : 'Clear cached locations'}
              </button>
            </div>
          </div>

          {/* Optional AccuWeather API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> AccuWeather API Key (Optional)
              </label>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-2 leading-relaxed">
              By default, AccuAir queries live high-resolution environmental feeds standardized to AccuWeather metrics. You can also supply your personal AccuWeather Developer API key here.
            </p>
            <form onSubmit={handleSaveApiKey} className="space-y-2">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste AccuWeather API key..."
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-lg text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {savedKeySuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> Saved!
                  </>
                ) : (
                  'Save Key'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
