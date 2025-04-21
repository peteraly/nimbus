import axios from 'axios';

// Import API key
import { OPENWEATHER_API_KEY } from '../config/apiKeys';

const debug = process.env.NODE_ENV === 'development';

/* eslint-disable no-console */
const logDebug = (...args) => {
  if (debug) {
    console.log(...args);
  }
};

const logError = (...args) => {
  if (debug) {
    console.error(...args);
  }
};
/* eslint-enable no-console */

// Weather thresholds
export const DEFAULT_THRESHOLDS = {
  windSpeed: 20, // mph
  precipitation: 0.1, // inches/hour
  visibility: 5000, // meters
  temperature: {
    min: 32, // °F
    max: 95 // °F
  }
};

// Cache weather data for 15 minutes
const CACHE_DURATION = 15 * 60 * 1000;
const weatherCache = new Map();

const getCacheKey = (lat, lon) => `${lat},${lon}`;

const WEATHER_API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Helper function to get date key (YYYY-MM-DD)
const getDateKey = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Helper function to aggregate forecast data by day
const aggregateForecastByDay = (forecastList) => {
  const dailyForecasts = {};

  forecastList.forEach(item => {
    const dateKey = getDateKey(item.dt * 1000);
    
    if (!dailyForecasts[dateKey]) {
      dailyForecasts[dateKey] = {
        date: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        wind: item.wind.speed,
        precipitation: item.rain ? item.rain['3h'] / 3 : 0,
        visibility: item.visibility,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        clouds: item.clouds.all,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        readings: 1
      };
    } else {
      const current = dailyForecasts[dateKey];
      current.temperature = (current.temperature * current.readings + item.main.temp) / (current.readings + 1);
      current.wind = (current.wind * current.readings + item.wind.speed) / (current.readings + 1);
      current.precipitation = (current.precipitation * current.readings + (item.rain ? item.rain['3h'] / 3 : 0)) / (current.readings + 1);
      current.visibility = (current.visibility * current.readings + item.visibility) / (current.readings + 1);
      current.humidity = (current.humidity * current.readings + item.main.humidity) / (current.readings + 1);
      current.pressure = (current.pressure * current.readings + item.main.pressure) / (current.readings + 1);
      current.clouds = (current.clouds * current.readings + item.clouds.all) / (current.readings + 1);
      current.readings += 1;
    }
  });

  return Object.values(dailyForecasts);
};

/**
 * Get weather data for a location
 * @param {Object} location - Location object with coordinates and address
 * @returns {Promise<Object>} Weather data including current conditions and forecast
 */
export const getWeatherData = async (location) => {
  try {
    if (!location || !location.coordinates) {
      throw new Error('Invalid location data');
    }

    const [lon, lat] = location.coordinates;
    const cacheKey = getCacheKey(lat, lon);
    
    // Check cache first
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached weather data for:', location.address);
      return cached.data;
    }

    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key is not configured');
    }

    // Fetch both current weather and forecast in parallel
    const [currentWeather, forecast] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`)
    ]);

    // Check responses
    if (!currentWeather.ok || !forecast.ok) {
      throw new Error('Weather API request failed');
    }

    const [currentData, forecastData] = await Promise.all([
      currentWeather.json(),
      forecast.json()
    ]);

    const weatherData = {
      current: {
        temperature: Math.round(currentData.main.temp),
        wind: Math.round(currentData.wind.speed),
        precipitation: currentData.rain ? currentData.rain['1h'] || 0 : 0,
        visibility: currentData.visibility,
        conditions: currentData.weather[0].main,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon
      },
      forecast: forecastData.list
        .filter((item, index) => index % 8 === 0) // One reading per day
        .slice(0, 5) // 5-day forecast
        .map(item => ({
          date: new Date(item.dt * 1000).toISOString(),
          temperature: Math.round(item.main.temp),
          wind: Math.round(item.wind.speed),
          precipitation: item.rain ? item.rain['3h'] / 3 : 0,
          visibility: item.visibility,
          conditions: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        }))
    };

    // Cache the result
    weatherCache.set(cacheKey, {
      timestamp: Date.now(),
      data: weatherData
    });

    console.log('Weather data received for', location.address, weatherData);
    return weatherData;

  } catch (error) {
    console.error('Failed to fetch weather for', location.address, error);
    
    // Return mock data as fallback
    return {
      current: {
        temperature: 70,
        wind: 5,
        precipitation: 0,
        visibility: 10000,
        conditions: 'Clear',
        description: 'clear sky',
        icon: '01d'
      },
      forecast: Array(5).fill().map((_, i) => ({
        date: new Date(Date.now() + i * 86400000).toISOString(),
        temperature: 70,
        wind: 5,
        precipitation: 0,
        visibility: 10000,
        conditions: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }))
    };
  }
};

/**
 * Get sunrise and sunset times for a location
 * @param {Array} coordinates - [longitude, latitude] array
 * @param {Date} date - Optional date to get times for
 * @returns {Promise<Object>} - Sunrise and sunset times
 */
export async function getSunriseSunset(coordinates, date = new Date()) {
  try {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new Error('Invalid coordinates: must be [longitude, latitude] array');
    }

    const [longitude, latitude] = coordinates;
    
    const response = await axios.get(
      `${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );

    const { sys } = response.data;
    
    // Convert Unix timestamps to Date objects in local time
    const sunrise = new Date(sys.sunrise * 1000);
    const sunset = new Date(sys.sunset * 1000);

    // If date is different from today, adjust the times
    if (date) {
      const targetDate = new Date(date);
      sunrise.setFullYear(targetDate.getFullYear());
      sunrise.setMonth(targetDate.getMonth());
      sunrise.setDate(targetDate.getDate());
      
      sunset.setFullYear(targetDate.getFullYear());
      sunset.setMonth(targetDate.getMonth());
      sunset.setDate(targetDate.getDate());
    }

    return {
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
      dayLength: (sunset - sunrise) / (1000 * 60) // length of day in minutes
    };
  } catch (error) {
    logError('Error fetching sunrise/sunset data:', error);
    // Return default values for testing/fallback (sunrise: 7 AM, sunset: 7 PM)
    const defaultDate = date || new Date();
    const sunrise = new Date(defaultDate);
    sunrise.setHours(7, 0, 0, 0);
    const sunset = new Date(defaultDate);
    sunset.setHours(19, 0, 0, 0);
    
    return {
      sunrise: sunrise.toISOString(),
      sunset: sunset.toISOString(),
      dayLength: 12 * 60 // 12 hours in minutes
    };
  }
}

/**
 * Calculate weather score
 * @param {Object} weatherData - Weather data object
 * @returns {number} Score between 0 and 100
 */
export const calculateWeatherScore = (weatherData, thresholds = DEFAULT_THRESHOLDS) => {
  if (!weatherData || !weatherData.current) return 0;

  const { temperature, wind, precipitation, visibility } = weatherData.current;
  let score = 100;

  // Temperature penalties
  if (temperature < thresholds.temperature.min || temperature > thresholds.temperature.max) {
    score -= 30;
  }

  // Wind penalties
  if (wind > thresholds.windSpeed) {
    score -= 25 * (wind / thresholds.windSpeed);
  }

  // Precipitation penalties
  if (precipitation > thresholds.precipitation) {
    score -= 20 * (precipitation / thresholds.precipitation);
  }

  // Visibility penalties
  if (visibility < thresholds.visibility) {
    score -= 25 * (1 - visibility / thresholds.visibility);
  }

  return Math.max(0, Math.round(score));
};

/**
 * Check if weather conditions are safe for drone operation
 * @param {Object} weatherData - Weather data object
 * @param {Object} thresholds - Optional custom thresholds
 * @returns {boolean} Whether conditions are safe
 */
export const isWeatherSafe = (weatherData, thresholds = DEFAULT_THRESHOLDS) => {
  if (!weatherData || !weatherData.current) return false;

  const { temperature, wind, precipitation, visibility } = weatherData.current;

  return (
    temperature >= thresholds.temperature.min &&
    temperature <= thresholds.temperature.max &&
    wind <= thresholds.windSpeed &&
    precipitation <= thresholds.precipitation &&
    visibility >= thresholds.visibility
  );
}; 