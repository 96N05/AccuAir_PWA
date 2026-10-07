/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useWeatherForecast } from './hooks/useWeatherForecast';
import { LocationModal } from './components/LocationModal';
import { SettingsModal } from './components/SettingsModal';
import { EmbedCodeModal } from './components/EmbedCodeModal';
import { AccuAirWidget } from './components/AccuAirWidget';
import { getStoredUnit, saveStoredUnit } from './services/cache';
import { HealthActivityGroup, HealthActivityIndex } from './types/weather';
import {
  MapPin,
  RefreshCw,
  Sun,
  Moon,
  Star,
  Plus,
  X,
  Wind,
  Droplets,
  Clock,
  WifiOff,
  Settings,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Heart,
  Compass,
  Code,
  Share2,
  Github,
} from 'lucide-react';

export default function App() {
  const weather = useWeatherForecast();

  // Settings & display state
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>(() => getStoredUnit());
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('light');
  const [activeActivityTab, setActiveActivityTab] = useState<'all' | HealthActivityGroup>('all');
  const [expandedActivityIds, setExpandedActivityIds] = useState<Record<string, boolean>>({});

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);

  // Check URL parameters for direct iframe embed mode
  const [isDirectEmbed, setIsDirectEmbed] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('embed') === 'true') {
        setIsDirectEmbed(true);
      }
      const unitParam = params.get('unit');
      if (unitParam === 'C' || unitParam === 'F') {
        setTempUnit(unitParam);
      }
    }
  }, []);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const toggleActivityExpand = (id: string) => {
    setExpandedActivityIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleUnitToggle = (unit: 'C' | 'F') => {
    saveStoredUnit(unit);
    setTempUnit(unit);
  };

  const handleShareOrBookmark = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2200);
      }
    }
  };

  // Handle direct iframe embedding mode if requested via URL
  if (isDirectEmbed) {
    return (
      <div className="min-h-screen p-2 sm:p-4 bg-transparent flex items-center justify-center">
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
          variant="standard"
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onRefresh={weather.refreshForecast}
        />
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          currentLocation={weather.location}
          onSelectLocation={weather.setLocation}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          tempUnit={tempUnit}
          onUnitChange={setTempUnit}
          onApiKeyChange={weather.refreshForecast}
          isOffline={weather.isOffline}
        />
      </div>
    );
  }

  const { forecast, location, isLoading, isRefreshing, isOffline, error } = weather;

  // Semantic styles for AQI
  const aqi = forecast?.airQuality?.aqi ?? 42;
  const aqiCategory = forecast?.airQuality?.category ?? 'Good';

  const getAqiColor = (val: number) => {
    if (val <= 50) return { text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10 dark:bg-emerald-500/15', border: 'border-emerald-500/30' };
    if (val <= 100) return { text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/15', border: 'border-amber-500/30' };
    if (val <= 150) return { text: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-500/10 dark:bg-orange-500/15', border: 'border-orange-500/30' };
    if (val <= 200) return { text: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-500/10 dark:bg-rose-500/15', border: 'border-rose-500/30' };
    if (val <= 300) return { text: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-500/15', border: 'border-purple-500/30' };
    return { text: 'text-rose-950 dark:text-rose-300', bg: 'bg-rose-950/20 dark:bg-rose-900/30', border: 'border-rose-700/30' };
  };

  const aqiColors = getAqiColor(aqi);

  const getAqiDescription = (val: number) => {
    if (val <= 50) return 'Air quality is satisfactory, and air pollution poses little or no risk. Great conditions for all outdoor activities.';
    if (val <= 100) return 'Air quality is acceptable. However, unusually sensitive individuals may experience minor respiratory irritation.';
    if (val <= 150) return 'Members of sensitive groups (asthma, children, older adults) may experience health effects. General public is less likely to be affected.';
    if (val <= 200) return 'Some members of the general public may experience health effects; sensitive groups may experience more serious effects.';
    if (val <= 300) return 'Health alert: The risk of health effects is increased for everyone. Outdoor physical exertion should be limited.';
    return 'Health warning of emergency conditions: Everyone is more likely to be affected. Avoid outdoor physical activities.';
  };

  const getRatingStyle = (category: string) => {
    switch (category) {
      case 'Ideal':
      case 'Very Good':
        return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800';
      case 'Good':
        return 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800';
      case 'Fair':
        return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800';
      case 'Poor':
      case 'Very Poor':
      case 'Extreme':
        return 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800';
      default:
        return 'text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700';
    }
  };

  const activities = forecast?.healthActivities || [];
  const filteredActivities = activeActivityTab === 'all'
    ? activities
    : activities.filter((act) => act.group === activeActivityTab);

  const tempDisplay = tempUnit === 'F'
    ? `${forecast?.temperature?.fahrenheit ?? 72}°F`
    : `${forecast?.temperature?.celsius ?? 22}°C`;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      {/* Offline Alert Strip if network disconnected */}
      {isOffline && (
        <div className="bg-amber-500 text-neutral-950 text-xs px-4 py-2 font-medium flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active · Showing cached conditions for {location.name}</span>
        </div>
      )}

      {/* Primary Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Area */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Wind className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-neutral-950 dark:text-neutral-50">
                AccuAir
              </span>
              <a
                href="https://github.com/96N05"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 transition-colors shadow-2xs group"
                title="View Son Nguyen on GitHub"
              >
                <Github className="w-3 h-3 text-neutral-900 dark:text-neutral-100 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Son Nguyen</span>
              </a>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
              Personal Air Quality &amp; Outdoor Health
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Quick Temperature Unit Toggle */}
          <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-mono-numbers">
            <button
              type="button"
              onClick={() => handleUnitToggle('F')}
              className={`px-2 py-1 rounded-md transition-colors ${
                tempUnit === 'F'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-neutral-50 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
              title="Fahrenheit"
            >
              °F
            </button>
            <button
              type="button"
              onClick={() => handleUnitToggle('C')}
              className={`px-2 py-1 rounded-md transition-colors ${
                tempUnit === 'C'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-neutral-50 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
              title="Celsius"
            >
              °C
            </button>
          </div>

          {/* Manual Refresh Button */}
          <button
            type="button"
            onClick={weather.refreshForecast}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Refresh conditions"
            aria-label="Refresh conditions"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
          </button>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-6 space-y-6">
        {/* User-Controlled Location Hub & Saved Places Bar */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Active Location Display */}
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                    {location.name}
                  </h1>
                  {location.administrativeArea && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      {location.administrativeArea}
                    </span>
                  )}
                  {location.country && (
                    <span className="text-xs text-neutral-400">
                      {location.country}
                    </span>
                  )}

                  {/* Bookmark / Favorite Pin Toggle */}
                  <button
                    type="button"
                    onClick={() => weather.toggleFavorite(location)}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      weather.isCurrentFavorited
                        ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                        : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title={weather.isCurrentFavorited ? 'Pinned in your saved places' : 'Pin to saved places'}
                  >
                    <Star className={`w-4 h-4 ${weather.isCurrentFavorited ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  <span className="font-mono-numbers">
                    {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-mono-numbers">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    {weather.lastUpdatedText || 'Just updated'}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="text-teal-600 dark:text-teal-400 hidden sm:inline">
                    Hourly auto-sync
                  </span>
                </div>
              </div>
            </div>

            {/* Share/Bookmark Actions */}
            <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
              <button
                type="button"
                onClick={handleShareOrBookmark}
                className="px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors flex items-center gap-1.5"
                title="Copy bookmark link for this city"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copyFeedback ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Saved / Bookmarked Places Quick-Switcher */}
          <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 shrink-0 mr-1">
              My Places:
            </span>

            {weather.savedPlaces.map((saved) => {
              const isActive = saved.key === location.key;
              return (
                <div
                  key={saved.key}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors shrink-0 ${
                    isActive
                      ? 'bg-teal-700 text-white font-medium shadow-2xs'
                      : 'bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => weather.setLocation(saved)}
                    className="flex items-center gap-1 text-xs"
                  >
                    <span>{saved.name}</span>
                    {saved.administrativeArea && (
                      <span className={`text-[10px] ${isActive ? 'text-teal-200' : 'text-neutral-400'}`}>
                        {saved.administrativeArea}
                      </span>
                    )}
                  </button>

                  {/* Remove pill button if more than 1 place */}
                  {weather.savedPlaces.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        weather.toggleFavorite(saved);
                      }}
                      className={`ml-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${
                        isActive ? 'text-teal-200 hover:text-white' : 'text-neutral-400 hover:text-neutral-700'
                      }`}
                      title="Remove from saved places"
                      aria-label="Remove from saved places"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 transition-colors shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Add City</span>
            </button>
          </div>
        </section>

        {/* Error Alert if Any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={weather.refreshForecast}
              className="font-medium underline hover:text-rose-950 dark:hover:text-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Hero Diagnostic Dual Cards: Air Quality Index & Current Atmosphere */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Air Quality Index */}
          <div className={`p-6 rounded-2xl border transition-colors shadow-xs ${aqiColors.bg} ${aqiColors.border}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Air Quality Index (AQI)
                </span>
                <span className="text-[10px] font-mono-numbers text-neutral-400 dark:text-neutral-500">
                  EPA Standard
                </span>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${aqiColors.border} ${aqiColors.text}`}>
                {aqiCategory}
              </span>
            </div>

            <div className="flex items-baseline gap-4 my-2">
              <div className="font-mono-numbers text-5xl sm:text-6xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                {isLoading && !forecast ? '--' : aqi}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
                  Current Status
                </span>
                <p className={`text-lg sm:text-xl font-semibold leading-snug ${aqiColors.text}`}>
                  {aqiCategory} Air Quality
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-3 leading-relaxed">
              {getAqiDescription(aqi)}
            </p>

            {/* Pollutant Matrix */}
            <div className="mt-4 pt-4 border-t border-neutral-200/60 dark:border-neutral-800/80 grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/60 dark:bg-neutral-900/60 p-2 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-[10px] uppercase font-medium text-neutral-400 block">PM2.5</span>
                <span className="font-mono-numbers font-semibold text-neutral-900 dark:text-neutral-100">
                  {aqi <= 50 ? 'Low' : aqi <= 100 ? 'Moderate' : 'Elevated'}
                </span>
              </div>
              <div className="bg-white/60 dark:bg-neutral-900/60 p-2 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-[10px] uppercase font-medium text-neutral-400 block">Ozone (O₃)</span>
                <span className="font-mono-numbers font-semibold text-neutral-900 dark:text-neutral-100">
                  {aqi <= 70 ? 'Good' : 'Moderate'}
                </span>
              </div>
              <div className="bg-white/60 dark:bg-neutral-900/60 p-2 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50">
                <span className="text-[10px] uppercase font-medium text-neutral-400 block">Dust</span>
                <span className="font-mono-numbers font-semibold text-neutral-900 dark:text-neutral-100">
                  Normal
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Current Atmospheric & Environmental Feed */}
          <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Atmospheric Conditions
                </span>
                <span className="text-[10px] font-mono-numbers text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full font-medium">
                  Next sync in {weather.minutesUntilNextUpdate}m
                </span>
              </div>

              <div className="flex items-baseline justify-between gap-4 my-2">
                <div>
                  <div className="font-mono-numbers text-5xl sm:text-6xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                    {isLoading && !forecast ? '--' : tempDisplay}
                  </div>
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 mt-1 block">
                    {forecast?.temperature?.phrase || 'Clear Conditions'}
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs text-neutral-400">Outdoor Comfort</div>
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {aqi <= 50 ? 'Favorable' : 'Moderate'}
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Stats Grid */}
            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 uppercase font-medium mb-1">
                  <Droplets className="w-3 h-3 text-sky-500" />
                  <span>Humidity</span>
                </div>
                <div className="font-mono-numbers font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                  {forecast?.humidity ?? 48}%
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 uppercase font-medium mb-1">
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span>UV Index</span>
                </div>
                <div className="font-mono-numbers font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                  {forecast?.uvIndex ?? 3} ({(forecast?.uvIndex ?? 3) >= 6 ? 'High' : (forecast?.uvIndex ?? 3) >= 3 ? 'Mod' : 'Low'})
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60">
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 uppercase font-medium mb-1">
                  <Wind className="w-3 h-3 text-teal-500" />
                  <span>Air Source</span>
                </div>
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs truncate">
                  {forecast?.source === 'accuweather' ? 'AccuWeather' : 'Copernicus Live'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Personalized Advisory Card: Best Times for Outdoor Activities */}
        <section className="bg-gradient-to-r from-teal-900 to-neutral-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 rounded-md bg-teal-500/20 text-teal-300">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-xs uppercase tracking-wider font-semibold text-teal-300">
              Daily Outdoor & Health Advisory
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-200 mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Cardio & Running Window</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {aqi <= 50
                  ? 'Optimal conditions throughout the day. Early morning and late afternoon offer peak thermal comfort.'
                  : aqi <= 100
                  ? 'Favorable. Sensitive runners should aim for morning sessions before peak ozone buildup.'
                  : 'Moderate pace advised. Sensitive individuals should consider indoor training.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-200 mb-1">
                <Heart className="w-3.5 h-3.5" />
                <span>Respiratory & Asthma Risk</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {aqi <= 50
                  ? 'Low atmospheric allergen and particulate load. Ideal for open-window aeration and deep breathing.'
                  : 'Slight particulate elevation. Keep standard preventative inhalers accessible during workouts.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-200 mb-1">
                <Sun className="w-3.5 h-3.5" />
                <span>UV & Sun Protection</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {(forecast?.uvIndex ?? 4) >= 6
                  ? 'Peak midday radiation. Broad-spectrum SPF and sunglasses recommended between 11 AM and 3 PM.'
                  : 'Moderate UV index. Normal protective clothing and sunblock for prolonged sun exposure.'}
              </p>
            </div>
          </div>
        </section>

        {/* Health & Activities Lifestyle Forecast Section */}
        <section className="bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          {/* Section Header & Segmented Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-neutral-50 tracking-tight">
                AccuWeather Lifestyle Forecast
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Detailed readiness ratings across fitness, allergies, and outdoor life
              </p>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs self-start sm:self-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveActivityTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                  activeActivityTab === 'all'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-neutral-50 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                All ({activities.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveActivityTab('fitness')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                  activeActivityTab === 'fitness'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-neutral-50 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Fitness
              </button>
              <button
                type="button"
                onClick={() => setActiveActivityTab('health')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                  activeActivityTab === 'health'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-neutral-50 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Health & Allergies
              </button>
              <button
                type="button"
                onClick={() => setActiveActivityTab('outdoor')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                  activeActivityTab === 'outdoor'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-950 dark:text-neutral-50 shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                Outdoor Life
              </button>
            </div>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredActivities.map((act) => {
              const isExpanded = !!expandedActivityIds[act.id];
              const ratingBadge = getRatingStyle(act.category);

              return (
                <div
                  key={act.id}
                  className="p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-950/70 hover:bg-neutral-50/80 dark:hover:bg-neutral-900/80 transition-colors flex flex-col justify-between"                >
                  <div>
                    {/* Activity Title & Rating Pill */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {act.name}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${ratingBadge}`}>
                        {act.category}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-teal-600 dark:bg-teal-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(10, act.value * 10))}%` }}
                      />
                    </div>

                    {/* Diagnostic Advice */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2">
                      {isExpanded || act.text.length <= 60
                        ? act.text
                        : `${act.text.slice(0, 56).trimEnd()}...`}
                    </p>
                  </div>

                  {act.text.length > 60 && (
                    <button
                      type="button"
                      onClick={() => toggleActivityExpand(act.id)}
                      className="mt-3 text-[11px] font-medium text-teal-700 dark:text-teal-400 hover:underline self-start cursor-pointer"
                    >
                      {isExpanded ? 'Show less' : 'Read advisory'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer & Utilities */}
      <footer className="mt-auto border-t border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 py-6 px-4 sm:px-8 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">AccuAir</span>
            <span>·</span>
            <a
              href="https://github.com/96N05"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors font-medium"
            >
              Son Nguyen
            </a>
            <span>·</span>
            <span>Hourly auto-refresh active</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Preferences
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsEmbedModalOpen(true)}
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center gap-1"
            >
              <Code className="w-3 h-3" />
              <span>Get Widget Code</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={weather.location}
        title="Add City to My Places"
        subtitle="Search any city, neighborhood, or use GPS to add to your saved places"
        onSelectLocation={(selectedLoc) => {
          weather.setLocation(selectedLoc, true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        tempUnit={tempUnit}
        onUnitChange={setTempUnit}
        onApiKeyChange={weather.refreshForecast}
        isOffline={weather.isOffline}
      />

      <EmbedCodeModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        location={weather.location}
        variant="standard"
        tempUnit={tempUnit}
      />
    </div>
  );
}
