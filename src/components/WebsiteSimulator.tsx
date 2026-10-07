/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AccuAirWidget } from './AccuAirWidget';
import { UseWeatherForecastReturn } from '../hooks/useWeatherForecast';
import { WidgetVariant } from '../types/weather';
import { Smartphone, Tablet, Monitor, ArrowLeft } from 'lucide-react';

interface WebsiteSimulatorProps {
  weather: UseWeatherForecastReturn;
  tempUnit: 'C' | 'F';
  widgetVariant: WidgetVariant;
  onOpenLocationModal: () => void;
  onOpenSettingsModal: () => void;
  onExitPreview: () => void;
}

export const WebsiteSimulator: React.FC<WebsiteSimulatorProps> = ({
  weather,
  tempUnit,
  widgetVariant,
  onOpenLocationModal,
  onOpenSettingsModal,
  onExitPreview,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const viewportWidthClass = {
    desktop: 'max-w-5xl',
    tablet: 'max-w-2xl',
    mobile: 'max-w-sm',
  }[viewport];

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-3 sm:p-6 flex flex-col">
      {/* Simulation Controls Top Bar */}
      <div className="max-w-5xl mx-auto w-full mb-4 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 py-3 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExitPreview}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Studio</span>
          </button>
          <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">
            |
          </span>
          <span className="text-xs text-neutral-500 font-medium hidden sm:inline">
            Host Website Simulation
          </span>
        </div>

        {/* Viewport switch */}
        <div className="flex items-center gap-1 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewport === 'desktop'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-medium'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewport === 'tablet'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-medium'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              viewport === 'mobile'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-medium'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>
      </div>

      {/* Simulated Browser Frame */}
      <div className={`mx-auto w-full ${viewportWidthClass} transition-all duration-200 flex-1 flex flex-col`}>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-md overflow-hidden flex-1 flex flex-col">
          {/* Simulated Browser Navigation Header */}
          <div className="bg-neutral-50 dark:bg-neutral-800/80 px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600"></div>
            </div>
            <div className="flex-1 max-w-sm mx-auto bg-white dark:bg-neutral-900 px-3 py-1 rounded-md text-[11px] text-neutral-400 font-mono text-center truncate border border-neutral-200/60 dark:border-neutral-700/60">
              https://metro-herald.example.com/health-wellness
            </div>
          </div>

          {/* Simulated Website Content */}
          <div className="p-5 sm:p-8 flex-1 flex flex-col space-y-8">
            {/* Website Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                The Daily Journal
              </div>
              <div className="text-xs text-neutral-500">
                Health & Environment Desk
              </div>
            </div>

            {/* Layout based on variant */}
            {widgetVariant === 'compact' ? (
              <div className="space-y-6">
                {/* Embed Banner right under header */}
                <AccuAirWidget
                  forecast={weather.forecast}
                  location={weather.location}
                  isLoading={weather.isLoading}
                  isRefreshing={weather.isRefreshing}
                  isOffline={weather.isOffline}
                  error={weather.error}
                  lastUpdatedText={weather.lastUpdatedText}
                  minutesUntilNextUpdate={weather.minutesUntilNextUpdate}
                  tempUnit={tempUnit}
                  variant="compact"
                  onOpenLocationModal={onOpenLocationModal}
                  onOpenSettingsModal={onOpenSettingsModal}
                  onRefresh={weather.refreshForecast}
                />

                <div className="prose dark:prose-invert max-w-none space-y-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                    Navigating Seasonal Shifts in Regional Air Quality
                  </h1>
                  <p>
                    Understanding hourly ambient air fluctuations helps athletes and individuals managing respiratory conditions optimize their daily training routines and outdoor exposure.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main article content column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Featured Special
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 leading-snug">
                    Real-Time Air Quality Guidelines for Outdoor Cardio & Athletics
                  </h1>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    AccuWeather’s continuous atmospheric telemetry models local particulate density, ozone concentration, and barometric variability to rate specific activities like distance running, gravel cycling, and trail hiking.
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Consult the live AccuAir widget on the right for automated hourly conditions and health sensitivity indices tailored to your location.
                  </p>
                </div>

                {/* Sidebar containing our widget */}
                <div className="lg:col-span-5 flex justify-center">
                  <AccuAirWidget
                    forecast={weather.forecast}
                    location={weather.location}
                    isLoading={weather.isLoading}
                    isRefreshing={weather.isRefreshing}
                    isOffline={weather.isOffline}
                    error={weather.error}
                    lastUpdatedText={weather.lastUpdatedText}
                    minutesUntilNextUpdate={weather.minutesUntilNextUpdate}
                    tempUnit={tempUnit}
                    variant={widgetVariant}
                    onOpenLocationModal={onOpenLocationModal}
                    onOpenSettingsModal={onOpenSettingsModal}
                    onRefresh={weather.refreshForecast}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
