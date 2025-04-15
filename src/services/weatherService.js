import axios from 'axios';

// Import API key
import { OPENWEATHER_API_KEY } from '../config/apiKeys';

// Default weather thresholds
export const DEFAULT_THRESHOLDS = {
  windSpeed: 20, // mph
  precipitation: 0.1, // mm/h
  visibility: 5000, // meters
  temperature: {
    min: 32, // °F
    max: 95  // °F
  }
};

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
      throw new Error('Invalid location object: missing coordinates');
    }

    console.log(`Fetching weather data for location: ${location.address || 'Unknown'}`);
    
    // Coordinates should be [longitude, latitude]
    const [longitude, latitude] = location.coordinates;
    
    // Fetch current weather
    const currentResponse = await axios.get(
      `${WEATHER_API_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );
    
    // Fetch forecast data
    const forecastResponse = await axios.get(
      `${WEATHER_API_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );
    
    if (currentResponse.data.cod === 200 && forecastResponse.data.cod === '200') {
      const currentData = currentResponse.data;
      
      // Process current weather
      const currentWeather = {
        temperature: currentData.main.temp,
        wind_speed: currentData.wind.speed,
        precipitation: currentData.rain ? currentData.rain['1h'] : 0,
        visibility: currentData.visibility,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        humidity: currentData.main.humidity,
        sunrise: currentData.sys.sunrise,
        sunset: currentData.sys.sunset
      };
      
      // Process and aggregate forecast data by day
      const forecast = aggregateForecastByDay(forecastResponse.data.list);
      
      console.log(`Weather data received for ${location.address || 'Unknown'}:`, { 
        currentWeather, 
        forecastCount: forecast.length 
      });
      
      return {
        current: currentWeather,
        forecast: forecast
      };
    } else {
      console.error('Failed to fetch weather data:', currentResponse.data, forecastResponse.data);
      throw new Error('Failed to fetch weather data');
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
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
    console.error('Error fetching sunrise/sunset data:', error);
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
  
  let score = 100;
  const {
    wind_speed,
    precipitation,
    visibility,
    temperature
  } = weatherData.current;

  // Wind speed impact
  if (wind_speed > thresholds.windSpeed * 0.8) {
    score -= 30;
  } else if (wind_speed > thresholds.windSpeed * 0.5) {
    score -= 15;
  }

  // Precipitation impact
  if (precipitation > thresholds.precipitation * 0.8) {
    score -= 25;
  } else if (precipitation > thresholds.precipitation * 0.5) {
    score -= 10;
  }

  // Visibility impact
  if (visibility < thresholds.visibility * 0.8) {
    score -= 25;
  } else if (visibility < thresholds.visibility * 0.5) {
    score -= 15;
  }

  // Temperature impact
  if (temperature < thresholds.temperature.min || temperature > thresholds.temperature.max) {
    score -= 20;
  } else if (
    temperature < thresholds.temperature.min * 1.1 || 
    temperature > thresholds.temperature.max * 0.9
  ) {
    score -= 10;
  }

  return Math.max(0, score);
};

/**
 * Check if weather conditions are safe for drone operation
 * @param {Object} weatherData - Weather data object
 * @param {Object} thresholds - Optional custom thresholds
 * @returns {boolean} Whether conditions are safe
 */
export const isWeatherSafe = (weatherData, thresholds = DEFAULT_THRESHOLDS) => {
  if (!weatherData || !weatherData.current) return false;

  const { temperature, wind_speed, description } = weatherData.current;

  // Check temperature
  if (temperature < thresholds.temperature.min || temperature > thresholds.temperature.max) {
    return false;
  }

  // Check wind speed
  if (wind_speed > thresholds.windSpeed) {
    return false;
  }

  // Check weather conditions
  const conditions = description.toLowerCase();
  const unsafeConditions = ['storm', 'thunder', 'rain', 'snow', 'sleet', 'hail'];
  if (unsafeConditions.some(condition => conditions.includes(condition))) {
    return false;
  }

  return true;
}; 