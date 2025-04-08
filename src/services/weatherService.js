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

// Main function to get weather data
export const getWeatherData = async (location) => {
  try {
    console.log(`Fetching weather data for location: ${location.address}`);
    
    // Fetch current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );
    const currentData = await currentResponse.json();
    
    // Fetch forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    );
    const forecastData = await forecastResponse.json();
    
    if (currentData.cod === 200 && forecastData.cod === '200') {
      // Process current weather
      const currentWeather = {
        temperature: currentData.main.temp,
        wind_speed: currentData.wind.speed,
        precipitation: currentData.rain ? currentData.rain['1h'] : 0,
        visibility: currentData.visibility,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon
      };
      
      // Process forecast data
      const forecast = forecastData.list.map(item => ({
        date: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        wind: item.wind.speed,
        precipitation: item.rain ? item.rain['3h'] / 3 : 0, // Convert 3h precipitation to hourly
        visibility: item.visibility,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        clouds: item.clouds.all,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      }));
      
      console.log(`Weather data received for ${location.address}:`, { currentWeather, forecastCount: forecast.length });
      
      return {
        current: currentWeather,
        forecast: forecast
      };
    } else {
      console.error('Failed to fetch weather data:', currentData, forecastData);
      throw new Error('Failed to fetch weather data');
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

// Check if weather conditions are safe for drone operations
export const isWeatherSafe = (weatherData, thresholds = DEFAULT_THRESHOLDS) => {
  const {
    windSpeed,
    precipitation,
    visibility,
    temperature
  } = weatherData;

  return (
    windSpeed <= thresholds.windSpeed &&
    precipitation <= thresholds.precipitation &&
    visibility >= thresholds.visibility &&
    temperature >= thresholds.temperature.min &&
    temperature <= thresholds.temperature.max
  );
};

// Calculate weather safety score (0-100)
export const calculateWeatherScore = (weatherData, thresholds = DEFAULT_THRESHOLDS) => {
  if (!weatherData) return 0;
  
  let score = 100;
  const {
    wind_speed,
    precipitation,
    visibility,
    temperature
  } = weatherData;

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