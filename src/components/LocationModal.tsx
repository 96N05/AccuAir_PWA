/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LocationData } from '../types/weather';
import {
  DEFAULT_LOCATIONS,
  reverseGeocode,
  searchLocations,
} from '../services/accuweather';
import { getStoredAccuWeatherApiKey } from '../services/cache';
import { Search, MapPin, Navigation, X, Loader2, Check } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationData;
  onSelectLocation: (location: LocationData) => void;
  title?: string;
  subtitle?: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  title = 'Select Your Location',
  subtitle = 'Search any city, neighborhood, or use GPS',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setQuery('');
      setResults([]);
      setGeoError(null);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const apiKey = getStoredAccuWeatherApiKey();
      try {
        const hits = await searchLocations(query, apiKey);
        setResults(hits);
      } catch (err) {
        console.warn('Location search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // HTML5 Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          onSelectLocation(loc);
          onClose();
        } catch {
          setGeoError('Could not resolve city name from your coordinates');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setGeoError(err.message || 'Permission denied or position unavailable');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 id="location-modal-title" className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {title}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input & geolocation button */}
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city (e.g., Tokyo, London, Austin)..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 rounded-xl text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 transition-shadow"
            />
            {isSearching && (
              <Loader2 className="w-4 h-4 text-neutral-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
            )}
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 rounded-lg transition-colors disabled:opacity-60"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5 text-neutral-500" />
            )}
            <span>{isLocating ? 'Detecting GPS coordinates...' : 'Use current location'}</span>
          </button>

          {geoError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 px-1">
              {geoError}
            </p>
          )}
        </div>

        {/* Results or Presets */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {query.trim().length >= 2 ? (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 px-2 mb-1.5">
                Search Results
              </div>
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((loc) => {
                    const isSelected = loc.key === currentLocation.key || loc.name === currentLocation.name;
                    return (
                      <button
                        key={loc.key}
                        type="button"
                        onClick={() => {
                          onSelectLocation(loc);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left text-sm transition-colors ${
                          isSelected
                            ? 'bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-white'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                          <span className="truncate">
                            {loc.name}
                            <span className="text-neutral-400 dark:text-neutral-500 text-xs ml-1.5 font-normal">
                              {loc.administrativeArea ? `${loc.administrativeArea}, ` : ''}
                              {loc.country}
                            </span>
                          </span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-neutral-900 dark:text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : !isSearching ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 p-3 text-center">
                  No matching cities found. Try another search.
                </p>
              ) : null}
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 px-2 mb-1.5">
                Popular Cities
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {DEFAULT_LOCATIONS.map((loc) => {
                  const isSelected = loc.name === currentLocation.name;
                  return (
                    <button
                      key={loc.key}
                      type="button"
                      onClick={() => {
                        onSelectLocation(loc);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-lg text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700'
                          : 'bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-transparent'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate font-medium">{loc.name}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{loc.country}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
