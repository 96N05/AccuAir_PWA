/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LocationData {
  key: string;
  name: string;
  administrativeArea: string;
  country: string;
  latitude: number;
  longitude: number;
}

export type AQICategory = 
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export interface AirQualityData {
  aqi: number;
  category: AQICategory;
}

export type HealthActivityGroup = 'fitness' | 'health' | 'outdoor';

export type ActivityRatingCategory = 
  | 'Ideal'
  | 'Very Good'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Very Poor';

export interface HealthActivityIndex {
  id: string;
  name: string;
  category: ActivityRatingCategory;
  value: number; // 1 to 10 or 0 to 100
  text: string;
  group: HealthActivityGroup;
}

export interface ForecastData {
  location: LocationData;
  airQuality: AirQualityData;
  healthActivities: HealthActivityIndex[];
  temperature: {
    celsius: number;
    fahrenheit: number;
    phrase: string;
  };
  humidity: number;
  uvIndex: number;
  updatedAt: number; // epoch ms
  nextUpdateAt: number; // epoch ms
  source: 'accuweather' | 'live-atmospheric' | 'cache';
}

export interface CachedForecast {
  data: ForecastData;
  cachedAt: number;
  locationKey: string;
}

export type WidgetVariant = 'standard' | 'compact' | 'minimal';
export type ThemePreference = 'dark' | 'light' | 'system';
