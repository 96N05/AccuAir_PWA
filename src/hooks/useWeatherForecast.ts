/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ForecastData, LocationData } from '../types/weather';
import {
  DEFAULT_LOCATIONS,
  fetchForecast,
} from '../services/accuweather';
import {
  getCachedForecast,
  getStoredLocation,
  saveStoredLocation,
  getStoredAccuWeatherApiKey,
  getSavedPlaces,
  savePlaceToFavorites,
  removePlaceFromFavorites,
  isPlaceFavorited,
  ONE_HOUR_MS,
} from '../services/cache';

export interface UseWeatherForecastReturn {
  forecast: ForecastData | null;
  location: LocationData;
  isLoading: boolean;
  isRefreshing: boolean;
  isOffline: boolean;
  error: string | null;
  lastUpdatedText: string;
  minutesUntilNextUpdate: number;
  savedPlaces: LocationData[];
  isCurrentFavorited: boolean;
  setLocation: (loc: LocationData, addToFavorites?: boolean) => void;
  addSavedPlace: (loc: LocationData) => void;
  toggleFavorite: (loc?: LocationData) => void;
  refreshForecast: () => Promise<void>;
}

function getInitialLocation(): LocationData {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const locName = params.get('city') || params.get('loc') || params.get('name');
    const lat = params.get('lat');
    const lon = params.get('lon');
    if (locName && lat && lon) {
      return {
        key: `geo_${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`,
        name: locName,
        administrativeArea: params.get('state') || params.get('admin') || '',
        country: params.get('country') || '',
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
    }
  }
  return getStoredLocation() || DEFAULT_LOCATIONS[0];
}

export function useWeatherForecast(): UseWeatherForecastReturn {
  const [location, setLocationState] = useState<LocationData>(getInitialLocation);

  const [forecast, setForecast] = useState<ForecastData | null>(() => {
    const cached = getCachedForecast(location.key);
    return cached ? cached.data : null;
  });

  const [savedPlaces, setSavedPlaces] = useState<LocationData[]>(() => {
    const stored = getSavedPlaces();
    if (stored.length === 0) {
      const initial = getInitialLocation();
      savePlaceToFavorites(initial);
      return [initial];
    }
    return stored;
  });

  const [isLoading, setIsLoading] = useState<boolean>(!forecast);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  const activeLocationRef = useRef<LocationData>(location);
  activeLocationRef.current = location;

  // Listen to network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Auto-refresh when coming back online
      refreshForecast();
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer to keep relative time strings fresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Primary forecast loader
  const loadForecast = useCallback(
    async (loc: LocationData, force = false) => {
      const apiKey = getStoredAccuWeatherApiKey();
      setError(null);

      // Check cache first for immediate render
      const cached = getCachedForecast(loc.key);
      if (cached && !forecast) {
        setForecast(cached.data);
      }

      if (force) {
        setIsRefreshing(true);
      } else if (!forecast) {
        setIsLoading(true);
      }

      try {
        const data = await fetchForecast(loc, apiKey, force);
        setForecast(data);
        setError(null);
      } catch (err: any) {
        console.warn('Forecast fetch warning:', err);
        // Fallback to cache if available
        if (cached) {
          setForecast(cached.data);
          setError(null);
        } else {
          setError(err?.message || 'Unable to load forecast data');
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [forecast]
  );

  // Load when location changes
  useEffect(() => {
    loadForecast(location, false);
  }, [location.key]);

  // AUTOMATIC HOURLY UPDATE ENGINE
  useEffect(() => {
    // Check every minute if 1 hour has elapsed since last update
    const checkHourlyUpdate = () => {
      if (!forecast) return;
      const elapsed = Date.now() - forecast.updatedAt;
      if (elapsed >= ONE_HOUR_MS && navigator.onLine) {
        console.log('Hourly update triggered: 1 hour elapsed since last sync');
        loadForecast(activeLocationRef.current, true);
      }
    };

    const intervalId = setInterval(checkHourlyUpdate, 60000);

    // Also check on tab focus / visibility change if user returns after an hour
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkHourlyUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [forecast, loadForecast]);

  const setLocation = useCallback((newLoc: LocationData, addToFavorites = false) => {
    saveStoredLocation(newLoc);
    setLocationState(newLoc);

    if (addToFavorites) {
      const updated = savePlaceToFavorites(newLoc);
      setSavedPlaces(updated);
    }

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('city', newLoc.name);
      url.searchParams.set('lat', newLoc.latitude.toString());
      url.searchParams.set('lon', newLoc.longitude.toString());
      if (newLoc.administrativeArea) url.searchParams.set('state', newLoc.administrativeArea);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const addSavedPlace = useCallback((newLoc: LocationData) => {
    const updated = savePlaceToFavorites(newLoc);
    setSavedPlaces(updated);
  }, []);

  const isCurrentFavorited = isPlaceFavorited(location.key);

  const toggleFavorite = useCallback((locToToggle?: LocationData) => {
    const target = locToToggle || activeLocationRef.current;
    if (isPlaceFavorited(target.key)) {
      const updated = removePlaceFromFavorites(target.key);
      setSavedPlaces(updated);
    } else {
      const updated = savePlaceToFavorites(target);
      setSavedPlaces(updated);
    }
  }, []);

  const refreshForecast = useCallback(async () => {
    await loadForecast(activeLocationRef.current, true);
  }, [loadForecast]);

  // Relative timestamp calculation
  const getRelativeText = (): string => {
    if (!forecast) return '';
    const diffMs = Math.max(0, now - forecast.updatedAt);
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'Just updated';
    if (diffMinutes === 1) return 'Updated 1 min ago';
    if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `Updated ${diffHours}h ago`;
  };

  const minutesUntilNext = forecast
    ? Math.max(0, Math.ceil((forecast.updatedAt + ONE_HOUR_MS - now) / 60000))
    : 60;

  return {
    forecast,
    location,
    isLoading,
    isRefreshing,
    isOffline,
    error,
    lastUpdatedText: getRelativeText(),
    minutesUntilNextUpdate: minutesUntilNext,
    savedPlaces,
    isCurrentFavorited,
    setLocation,
    addSavedPlace,
    toggleFavorite,
    refreshForecast,
  };
}
