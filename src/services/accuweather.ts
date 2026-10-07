/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AirQualityData,
  AQICategory,
  ActivityRatingCategory,
  ForecastData,
  HealthActivityIndex,
  LocationData,
} from '../types/weather';
import { getCachedForecast, saveForecastToCache, ONE_HOUR_MS } from './cache';

// Curated default locations for instant access and quick selection
export const DEFAULT_LOCATIONS: LocationData[] = [
  {
    key: '2178627',
    name: 'Tarzana',
    administrativeArea: 'CA',
    country: 'United States',
    latitude: 34.1728,
    longitude: -118.5537,
  },
  {
    key: '347625',
    name: 'Los Angeles',
    administrativeArea: 'CA',
    country: 'United States',
    latitude: 34.0522,
    longitude: -118.2437,
  },
  {
    key: '349727',
    name: 'New York',
    administrativeArea: 'NY',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    key: '347629',
    name: 'San Francisco',
    administrativeArea: 'CA',
    country: 'United States',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    key: '328328',
    name: 'London',
    administrativeArea: 'England',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    key: '226396',
    name: 'Tokyo',
    administrativeArea: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    key: '623',
    name: 'Paris',
    administrativeArea: 'Île-de-France',
    country: 'France',
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    key: '347629',
    name: 'San Francisco',
    administrativeArea: 'CA',
    country: 'United States',
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    key: '300597',
    name: 'Singapore',
    administrativeArea: 'Central',
    country: 'Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
  },
  {
    key: '22889',
    name: 'Sydney',
    administrativeArea: 'NSW',
    country: 'Australia',
    latitude: -33.8688,
    longitude: 151.2093,
  },
  {
    key: '178087',
    name: 'Berlin',
    administrativeArea: 'Berlin',
    country: 'Germany',
    latitude: 52.52,
    longitude: 13.405,
  },
  {
    key: '202396',
    name: 'Delhi',
    administrativeArea: 'DL',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.209,
  },
];

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

/**
 * Searches locations worldwide using open geocoding API or AccuWeather
 */
export async function searchLocations(query: string, apiKey?: string): Promise<LocationData[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // If user provided AccuWeather API Key
  if (apiKey) {
    try {
      const res = await fetch(
        `https://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${encodeURIComponent(
          apiKey
        )}&q=${encodeURIComponent(trimmed)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any) => ({
            key: String(item.Key),
            name: item.LocalizedName,
            administrativeArea: item.AdministrativeArea?.LocalizedName || '',
            country: item.Country?.LocalizedName || '',
            latitude: item.GeoPosition?.Latitude || 0,
            longitude: item.GeoPosition?.Longitude || 0,
          }));
        }
      }
    } catch {
      // Fall through to open geocoding
    }
  }

  // Open-Meteo Geocoding API (Fast, no key required, high quality worldwide coverage)
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        trimmed
      )}&count=6&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return filterDefaultLocations(trimmed);
    }

    return data.results.map((item: any) => ({
      key: `geo_${item.id || item.latitude.toFixed(2)}_${item.longitude.toFixed(2)}`,
      name: item.name,
      administrativeArea: item.admin1 || item.country || '',
      country: item.country || '',
      latitude: item.latitude,
      longitude: item.longitude,
    }));
  } catch {
    return filterDefaultLocations(trimmed);
  }
}

function filterDefaultLocations(query: string): LocationData[] {
  const lower = query.toLowerCase();
  if (lower.includes('91356')) {
    return DEFAULT_LOCATIONS.filter((loc) => loc.name === 'Tarzana');
  }
  return DEFAULT_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(lower) ||
      loc.country.toLowerCase().includes(lower) ||
      loc.administrativeArea.toLowerCase().includes(lower)
  );
}

/**
 * Reverse geocodes latitude/longitude to a LocationData object
 */
export async function reverseGeocode(lat: number, lon: number): Promise<LocationData> {
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${lat.toFixed(2)},${lon.toFixed(
        2
      )}&count=1&language=en&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results[0]) {
        const item = data.results[0];
        return {
          key: `geo_${lat.toFixed(3)}_${lon.toFixed(3)}`,
          name: item.name || 'Current Location',
          administrativeArea: item.admin1 || '',
          country: item.country || '',
          latitude: lat,
          longitude: lon,
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    key: `geo_${lat.toFixed(3)}_${lon.toFixed(3)}`,
    name: 'Current Location',
    administrativeArea: '',
    country: '',
    latitude: lat,
    longitude: lon,
  };
}

/**
 * Fetch forecast for a location:
 * - Checks offline cache if offline
 * - Calls AccuWeather API if API key provided
 * - Falls back to high-resolution live atmospheric feed mapped into AccuWeather specification
 * - Caches result in localStorage
 */
export async function fetchForecast(
  location: LocationData,
  apiKey?: string,
  forceRefresh = false
): Promise<ForecastData> {
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  // If offline and not force refresh, or even if force refresh when strictly offline, return cached
  if (isOffline) {
    const cached = getCachedForecast(location.key);
    if (cached) {
      return cached.data;
    }
    throw new Error('You are currently offline and no cached forecast is available for this location.');
  }

  // Check cache freshness unless forceRefresh is true
  if (!forceRefresh) {
    const cached = getCachedForecast(location.key);
    if (cached && Date.now() - cached.cachedAt < ONE_HOUR_MS) {
      return cached.data;
    }
  }

  // Attempt live fetch
  try {
    let result: ForecastData;

    if (apiKey) {
      result = await fetchAccuWeatherDirect(location, apiKey);
    } else {
      result = await fetchAtmosphericForecast(location);
    }

    // Cache the fresh forecast
    saveForecastToCache(location.key, result);
    return result;
  } catch (err) {
    // If live fetch fails (e.g. network timeout or API limit), fallback to cache if available
    const cached = getCachedForecast(location.key);
    if (cached) {
      return cached.data;
    }
    throw err;
  }
}

/**
 * AccuWeather direct API integration
 */
async function fetchAccuWeatherDirect(
  location: LocationData,
  apiKey: string
): Promise<ForecastData> {
  let locationKey = location.key;

  // If key is not numeric AccuWeather Key, resolve by coordinates
  if (!/^\d+$/.test(locationKey)) {
    const geoUrl = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=${encodeURIComponent(
      apiKey
    )}&q=${location.latitude},${location.longitude}`;
    const geoRes = await fetch(geoUrl);
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData?.Key) {
        locationKey = String(geoData.Key);
      }
    }
  }

  // 1. Fetch Daily Forecasts with details (contains Air Quality & Pollen)
  const forecastUrl = `https://dataservice.accuweather.com/forecasts/v1/daily/1day/${locationKey}?apikey=${encodeURIComponent(
    apiKey
  )}&details=true&metric=true`;
  const forecastRes = await fetch(forecastUrl);
  if (!forecastRes.ok) {
    throw new Error(`AccuWeather API error (${forecastRes.status})`);
  }
  const forecastJson = await forecastRes.json();
  const dailyForecast = forecastJson?.DailyForecasts?.[0];

  // Extract Air Quality (AccuWeather AirAndPollen array)
  let aqiValue = 42;
  let categoryLabel: AQICategory = 'Good';

  if (dailyForecast?.AirAndPollen) {
    const airQualityObj = dailyForecast.AirAndPollen.find(
      (item: any) => item.Name === 'AirQuality'
    );
    if (airQualityObj) {
      aqiValue = airQualityObj.Value ?? 42;
      const cat = airQualityObj.Category || getAQICategory(aqiValue);
      categoryLabel = (cat in ['Good', 'Moderate', 'Unhealthy for Sensitive Groups', 'Unhealthy', 'Very Unhealthy', 'Hazardous']
        ? cat
        : getAQICategory(aqiValue)) as AQICategory;
    }
  }

  // 2. Fetch Health & Activities Daily Indices
  let healthActivities: HealthActivityIndex[] = [];
  try {
    const indicesUrl = `https://dataservice.accuweather.com/indices/v1/daily/1day/${locationKey}?apikey=${encodeURIComponent(
      apiKey
    )}`;
    const indicesRes = await fetch(indicesUrl);
    if (indicesRes.ok) {
      const indicesJson = await indicesRes.json();
      if (Array.isArray(indicesJson)) {
        healthActivities = mapAccuWeatherIndices(indicesJson);
      }
    }
  } catch {
    // If indices endpoint rate limits, synthesize from weather params
  }

  if (healthActivities.length === 0) {
    healthActivities = generateStandardHealthIndices(
      aqiValue,
      dailyForecast?.Temperature?.Maximum?.Value ?? 22,
      dailyForecast?.Day?.RelativeHumidity ?? 50,
      dailyForecast?.AirAndPollen?.find((p: any) => p.Name === 'UVIndex')?.Value ?? 4
    );
  }

  const tempC = dailyForecast?.Temperature?.Maximum?.Value ?? 20;
  const tempF = Math.round((tempC * 9) / 5 + 32);
  const now = Date.now();

  return {
    location,
    airQuality: {
      aqi: Math.round(aqiValue),
      category: categoryLabel,
    },
    healthActivities,
    temperature: {
      celsius: Math.round(tempC),
      fahrenheit: tempF,
      phrase: dailyForecast?.Day?.IconPhrase || 'Partly Sunny',
    },
    humidity: dailyForecast?.Day?.RelativeHumidity ?? 50,
    uvIndex: dailyForecast?.AirAndPollen?.find((p: any) => p.Name === 'UVIndex')?.Value ?? 4,
    updatedAt: now,
    nextUpdateAt: now + ONE_HOUR_MS,
    source: 'accuweather',
  };
}

function mapAccuWeatherIndices(indices: any[]): HealthActivityIndex[] {
  const desired = [
    { name: 'Running', group: 'fitness' as const },
    { name: 'Bicycling', group: 'fitness' as const, alias: 'Cycling' },
    { name: 'Hiking', group: 'fitness' as const },
    { name: 'Outdoor Activity', group: 'outdoor' as const, alias: 'Outdoor Activities' },
    { name: 'Sinus Headache', group: 'health' as const },
    { name: 'Asthma', group: 'health' as const, alias: 'Asthma Forecast' },
    { name: 'Dust & Dander', group: 'health' as const },
    { name: 'Arthritis', group: 'health' as const },
    { name: 'Lawn Mowing', group: 'outdoor' as const },
    { name: 'UV Index', group: 'health' as const },
  ];

  const results: HealthActivityIndex[] = [];

  for (const target of desired) {
    const found = indices.find(
      (idx) =>
        idx.Name.toLowerCase() === target.name.toLowerCase() ||
        (target.alias && idx.Name.toLowerCase() === target.alias.toLowerCase())
    );
    if (found) {
      results.push({
        id: String(found.ID || target.name.toLowerCase().replace(/\s+/g, '_')),
        name: target.alias || found.Name,
        category: found.Category || 'Good',
        value: found.Value || 7,
        text: found.Text || `${found.Category} conditions for ${target.name.toLowerCase()}`,
        group: target.group,
      });
    }
  }

  return results;
}

/**
 * Live atmospheric feed based on Copernicus & US EPA models via Open-Meteo
 * Standardized directly to AccuWeather Health & Activities index specifications.
 */
async function fetchAtmosphericForecast(location: LocationData): Promise<ForecastData> {
  const { latitude, longitude } = location;

  const [aqRes, weatherRes] = await Promise.all([
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5,pm10,ozone,dust`
    ),
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,uv_index,wind_speed_10m,weather_code`
    ),
  ]);

  if (!aqRes.ok || !weatherRes.ok) {
    throw new Error('Atmospheric service temporarily unavailable');
  }

  const aqData = await aqRes.json();
  const weatherData = await weatherRes.json();

  const rawAqi = aqData?.current?.us_aqi ?? 38;
  const aqi = Math.round(rawAqi);
  const aqiCategory = getAQICategory(aqi);

  const tempC = weatherData?.current?.temperature_2m ?? 21;
  const tempF = Math.round((tempC * 9) / 5 + 32);
  const humidity = weatherData?.current?.relative_humidity_2m ?? 52;
  const uvIndex = Math.round(weatherData?.current?.uv_index ?? 3);
  const windSpeed = weatherData?.current?.wind_speed_10m ?? 8;
  const precipitation = weatherData?.current?.precipitation ?? 0;
  const pm25 = aqData?.current?.pm2_5 ?? 10;
  const dust = aqData?.current?.dust ?? 5;

  const healthActivities = generateStandardHealthIndices(
    aqi,
    tempC,
    humidity,
    uvIndex,
    windSpeed,
    precipitation,
    pm25,
    dust
  );

  const now = Date.now();

  return {
    location,
    airQuality: {
      aqi,
      category: aqiCategory,
    },
    healthActivities,
    temperature: {
      celsius: Math.round(tempC),
      fahrenheit: tempF,
      phrase: getWeatherPhrase(weatherData?.current?.weather_code ?? 0),
    },
    humidity: Math.round(humidity),
    uvIndex,
    updatedAt: now,
    nextUpdateAt: now + ONE_HOUR_MS,
    source: 'live-atmospheric',
  };
}

function getWeatherPhrase(code: number): string {
  if (code === 0) return 'Clear Skies';
  if (code === 1 || code === 2) return 'Mostly Sunny';
  if (code === 3) return 'Overcast';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Light Drizzle';
  if (code >= 61 && code <= 65) return 'Rain Showers';
  if (code >= 71 && code <= 77) return 'Snow Flurries';
  if (code >= 80 && code <= 82) return 'Rain';
  if (code >= 95) return 'Thunderstorms';
  return 'Fair';
}

function generateStandardHealthIndices(
  aqi: number,
  tempC: number,
  humidity: number,
  uvIndex: number,
  windSpeed = 8,
  precipitation = 0,
  pm25 = 12,
  dust = 5
): HealthActivityIndex[] {
  const scoreFromRating = (cat: ActivityRatingCategory): number => {
    switch (cat) {
      case 'Ideal':
        return 10;
      case 'Very Good':
        return 8;
      case 'Good':
        return 7;
      case 'Fair':
        return 5;
      case 'Poor':
      case 'Very Poor':
      default:
        return 3;
    }
  };

  // Running calculation
  let runningRating: ActivityRatingCategory = 'Good';
  let runningText = 'Optimal air and temperature for running';
  if (aqi > 150 || precipitation > 2 || tempC > 34 || tempC < -2) {
    runningRating = 'Poor';
    runningText = aqi > 150 ? 'Poor air quality; indoor workout advised' : 'Unfavorable outdoor temperature';
  } else if (aqi > 100 || tempC > 28 || windSpeed > 25) {
    runningRating = 'Fair';
    runningText = 'Fair conditions; moderate pace recommended';
  } else if (aqi < 40 && tempC >= 12 && tempC <= 20) {
    runningRating = 'Ideal';
    runningText = 'Prime weather and clean air for outdoor running';
  } else {
    runningRating = 'Very Good';
    runningText = 'Good conditions for tempo runs and cardio';
  }

  // Cycling
  let cyclingRating: ActivityRatingCategory = 'Good';
  let cyclingText = 'Favorable road and air conditions';
  if (windSpeed > 30 || precipitation > 1 || aqi > 150) {
    cyclingRating = 'Poor';
    cyclingText = windSpeed > 30 ? 'High winds make road cycling difficult' : 'Unfavorable weather or air conditions';
  } else if (windSpeed > 18 || aqi > 90) {
    cyclingRating = 'Fair';
    cyclingText = 'Breezy conditions; stay alert on exposed routes';
  } else if (aqi <= 45 && windSpeed < 12) {
    cyclingRating = 'Ideal';
    cyclingText = 'Calm winds and clean air for cycling';
  } else {
    cyclingRating = 'Very Good';
    cyclingText = 'Great conditions for road and gravel rides';
  }

  // Hiking
  let hikingRating: ActivityRatingCategory = 'Good';
  let hikingText = 'Pleasant trail conditions';
  if (precipitation > 0 || aqi > 120 || tempC > 32) {
    hikingRating = 'Poor';
    hikingText = 'Wet trails or high heat risk';
  } else if (aqi <= 45 && tempC >= 15 && tempC <= 24) {
    hikingRating = 'Ideal';
    hikingText = 'Excellent visibility and clean mountain air';
  } else {
    hikingRating = 'Very Good';
    hikingText = 'Great weather for local trails and walks';
  }

  // Sinus Headache (Health)
  let sinusRating: ActivityRatingCategory = 'Good';
  let sinusText = 'Low atmospheric sinus risk';
  if (humidity > 80 || humidity < 25 || aqi > 120) {
    sinusRating = 'Poor';
    sinusText = 'Humidity shifts and air pollutants may trigger sinus pressure';
  } else if (humidity > 65 || aqi > 75) {
    sinusRating = 'Fair';
    sinusText = 'Moderate sinus sensitivity risk today';
  } else {
    sinusRating = 'Very Good';
    sinusText = 'Stable pressure and comfortable humidity levels';
  }

  // Asthma (Health)
  let asthmaRating: ActivityRatingCategory = 'Good';
  let asthmaText = 'Low respiratory irritant level';
  if (aqi > 150 || pm25 > 35) {
    asthmaRating = 'Poor';
    asthmaText = 'High particulate matter; keep inhalers accessible';
  } else if (aqi > 80 || pm25 > 20) {
    asthmaRating = 'Fair';
    asthmaText = 'Moderate respiratory trigger risk for sensitive individuals';
  } else if (aqi <= 35) {
    asthmaRating = 'Ideal';
    asthmaText = 'Very low pollutant concentration; easy breathing';
  } else {
    asthmaRating = 'Very Good';
    asthmaText = 'Minimal atmospheric triggers detected';
  }

  // Dust & Dander
  let dustRating: ActivityRatingCategory = 'Good';
  let dustText = 'Low dust particulate activity';
  if (dust > 15 || (windSpeed > 20 && humidity < 35)) {
    dustRating = 'Poor';
    dustText = 'Dry air and wind elevation stirring airborne dust';
  } else if (dust > 8) {
    dustRating = 'Fair';
    dustText = 'Moderate environmental dust particles';
  } else {
    dustRating = 'Very Good';
    dustText = 'Low particulate suspension outdoors';
  }

  // UV Index
  let uvRating: ActivityRatingCategory = 'Good';
  let uvText = `UV Index: ${uvIndex} (Moderate)`;
  if (uvIndex >= 8) {
    uvRating = 'Poor';
    uvText = `UV Index: ${uvIndex} (Very High) · Sun protection required`;
  } else if (uvIndex >= 6) {
    uvRating = 'Fair';
    uvText = `UV Index: ${uvIndex} (High) · Wear sunscreen during midday`;
  } else if (uvIndex <= 2) {
    uvRating = 'Ideal';
    uvText = `UV Index: ${uvIndex} (Low) · Minimal sun protection needed`;
  } else {
    uvRating = 'Good';
    uvText = `UV Index: ${uvIndex} (Moderate) · Normal daytime exposure`;
  }

  // Arthritis / Joint Comfort
  let arthritisRating: ActivityRatingCategory = 'Good';
  let arthritisText = 'Comfortable barometric joint conditions';
  if (humidity > 85 && tempC < 10) {
    arthritisRating = 'Poor';
    arthritisText = 'Damp, cold conditions may aggravate joint stiffness';
  } else if (humidity > 70) {
    arthritisRating = 'Fair';
    arthritisText = 'Moderate dampness index';
  } else {
    arthritisRating = 'Very Good';
    arthritisText = 'Warm, dry weather supports joint ease';
  }

  // Lawn Mowing & Gardening (Outdoor)
  let lawnRating: ActivityRatingCategory = 'Good';
  let lawnText = 'Dry turf and fair yard conditions';
  if (precipitation > 0) {
    lawnRating = 'Poor';
    lawnText = 'Wet grass and rain; postpone lawn care';
  } else if (tempC > 32 || aqi > 120) {
    lawnRating = 'Fair';
    lawnText = 'Mow early morning to avoid peak heat and ozone';
  } else if (tempC >= 15 && tempC <= 26 && aqi <= 60) {
    lawnRating = 'Ideal';
    lawnText = 'Optimal dry conditions for trimming and yard work';
  } else {
    lawnRating = 'Very Good';
    lawnText = 'Favorable weather for garden maintenance';
  }

  return [
    {
      id: 'running',
      name: 'Running',
      category: runningRating,
      value: scoreFromRating(runningRating),
      text: runningText,
      group: 'fitness',
    },
    {
      id: 'cycling',
      name: 'Cycling',
      category: cyclingRating,
      value: scoreFromRating(cyclingRating),
      text: cyclingText,
      group: 'fitness',
    },
    {
      id: 'hiking',
      name: 'Hiking & Walking',
      category: hikingRating,
      value: scoreFromRating(hikingRating),
      text: hikingText,
      group: 'fitness',
    },
    {
      id: 'asthma',
      name: 'Asthma Forecast',
      category: asthmaRating,
      value: scoreFromRating(asthmaRating),
      text: asthmaText,
      group: 'health',
    },
    {
      id: 'sinus',
      name: 'Sinus Headache',
      category: sinusRating,
      value: scoreFromRating(sinusRating),
      text: sinusText,
      group: 'health',
    },
    {
      id: 'uv',
      name: 'UV Index',
      category: uvRating,
      value: uvIndex,
      text: uvText,
      group: 'health',
    },
    {
      id: 'dust',
      name: 'Dust & Dander',
      category: dustRating,
      value: scoreFromRating(dustRating),
      text: dustText,
      group: 'health',
    },
    {
      id: 'arthritis',
      name: 'Arthritis Index',
      category: arthritisRating,
      value: scoreFromRating(arthritisRating),
      text: arthritisText,
      group: 'health',
    },
    {
      id: 'lawn',
      name: 'Lawn & Garden',
      category: lawnRating,
      value: scoreFromRating(lawnRating),
      text: lawnText,
      group: 'outdoor',
    },
  ];
}
