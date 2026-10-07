/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ForecastData,
  LocationData,
  WidgetVariant,
} from '../types/weather';
import { AirQualitySection } from './AirQualitySection';
import { HealthActivitiesList } from './HealthActivitiesList';
import { MinimalActivitiesGallery } from './MinimalActivitiesGallery';
import {
  MapPin,
  RefreshCw,
  WifiOff,
  CloudSun,
  Clock,
  Settings,
} from 'lucide-react';

interface AccuAirWidgetProps {
  forecast: ForecastData | null;
  location: LocationData;
  isLoading: boolean;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
  lastUpdatedText: string;
  minutesUntilNextUpdate: number;
  tempUnit: 'C' | 'F';
  variant?: WidgetVariant;
  onOpenLocationModal: () => void;
  onOpenSettingsModal?: () => void;
  onRefresh: () => void;
}

export const AccuAirWidget: React.FC<AccuAirWidgetProps> = ({
  forecast,
  location,
  isLoading,
  isRefreshing,
  isOffline,
  error,
  lastUpdatedText,
  minutesUntilNextUpdate,
  tempUnit,
  variant = 'standard',
  onOpenLocationModal,
  onOpenSettingsModal,
  onRefresh,
}) => {
  // If no forecast and loading: minimal skeleton
  if (isLoading && !forecast) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between mb-5">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-16"></div>
        </div>
        <div className="h-28 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl mb-5"></div>
        <div className="space-y-3">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4"></div>
          <div className="h-8 bg-neutral-100 dark:bg-neutral-800/40 rounded"></div>
          <div className="h-8 bg-neutral-100 dark:bg-neutral-800/40 rounded"></div>
          <div className="h-8 bg-neutral-100 dark:bg-neutral-800/40 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !forecast) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
          <WifiOff className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Forecast Unavailable
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {error}
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="mt-2 py-2 px-4 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-medium inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!forecast) return null;

  const tempDisplay =
    tempUnit === 'C'
      ? `${forecast.temperature.celsius}°C`
      : `${forecast.temperature.fahrenheit}°F`;

  // COMPACT BANNER VARIANT (Minimal horizontal layout)
  if (variant === 'compact') {
    return (
      <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl px-4 py-3 shadow-xs transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Location & Conditions */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="group flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors truncate"
            >
              <MapPin className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
              <span className="truncate">{location.name}</span>
            </button>
            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">
              ·
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono-numbers">
              {tempDisplay}
            </span>
          </div>

          {/* AQI minimal display */}
          <div className="flex items-center gap-3">
            <AirQualitySection data={forecast.airQuality} variant="compact" />

            <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-800 pl-3">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Refresh forecast"
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neutral-900 dark:text-neutral-100' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MINIMAL CARD VARIANT (Focused on AQI and primary quick activities)
  if (variant === 'minimal') {
    return (
      <div className="w-full max-w-sm mx-auto bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 shadow-xs transition-colors">
        {/* Header with location */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="group flex items-center gap-1.5 text-left transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 group-hover:underline">
                {location.name}
              </span>
              <span className="text-[11px] text-neutral-400 ml-1.5">
                {location.country}
              </span>
            </div>
          </button>
          <span className="text-xs font-mono-numbers font-medium text-neutral-600 dark:text-neutral-400">
            {tempDisplay}
          </span>
        </div>

        {/* Air Quality section strictly AQI value and descriptive label */}
        <div className="mb-4">
          <AirQualitySection data={forecast.airQuality} variant="standard" />
        </div>

        {/* Interactive Health & Activities Gallery (Swipe or click through pages) */}
        <div className="mb-1">
          <MinimalActivitiesGallery
            activities={forecast.healthActivities}
            itemsPerPage={3}
          />
        </div>

        {/* Minimal Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Hourly sync · {lastUpdatedText}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    );
  }

  // STANDARD FULL WIDGET VARIANT (Complete responsive card)
  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-sm transition-colors text-neutral-900 dark:text-neutral-100">
      {/* Top Header: Location, Temperature & Actions */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <button
            type="button"
            onClick={onOpenLocationModal}
            className="group flex items-center gap-1.5 text-left rounded-md -ml-1 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Click to change location"
          >
            <MapPin className="w-4 h-4 text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 shrink-0" />
            <span className="text-base font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
              {location.name}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {location.administrativeArea ? `${location.administrativeArea}, ` : ''}
              {location.country}
            </span>
          </button>

          {/* Environmental overview metadata (unboxed, separated by dot) */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1 pl-0.5">
            <span className="flex items-center gap-1">
              <CloudSun className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{forecast.temperature.phrase}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers font-medium text-neutral-800 dark:text-neutral-200">
              {tempDisplay}
            </span>
            <span aria-hidden="true">·</span>
            <span>Humidity {forecast.humidity}%</span>
          </div>
        </div>

        {/* Top actions: Settings & Manual Refresh */}
        <div className="flex items-center gap-1 shrink-0">
          {onOpenSettingsModal && (
            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Widget Settings"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            aria-label="Refresh forecast"
            title="Refresh now"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-neutral-950 dark:text-neutral-50' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* AIR QUALITY SECTION:
          Strictly displays AQI value and simple descriptive text label
      */}
      <div className="mb-5">
        <AirQualitySection data={forecast.airQuality} variant="standard" />
      </div>

      {/* HEALTH & ACTIVITIES FORECAST LIST */}
      <div>
        <HealthActivitiesList activities={forecast.healthActivities} />
      </div>

      {/* FOOTER: Hourly auto-update indicator & offline cache status */}
      <div className="mt-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 dark:text-neutral-500">
        <div className="flex items-center gap-1.5 min-w-0">
          {isOffline ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline (cached)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Hourly auto-update</span>
            </span>
          )}
          <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">
            ·
          </span>
          <span className="font-mono-numbers truncate">
            {lastUpdatedText}
          </span>
        </div>

        <div className="text-[11px] font-mono-numbers text-neutral-400 dark:text-neutral-500">
          Next sync: in ~{minutesUntilNextUpdate}m
        </div>
      </div>
    </div>
  );
};
