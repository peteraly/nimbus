import axios from 'axios';

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

// Mock forecast data for testing
const mockForecast = [
  {
    date: new Date().toISOString(),
    temperature: 72,
    wind: 5,
    precipitation: 0,
    visibility: 10000,
    humidity: 50,
    pressure: 1013,
    clouds: 20,
    description: 'clear sky',
    icon: '01d'
  },
  {
    date: new Date(Date.now() + 3600000).toISOString(),
    temperature: 75,
    wind: 7,
    precipitation: 0,
    visibility: 10000,
    humidity: 45,
    pressure: 1012,
    clouds: 10,
    description: 'few clouds',
    icon: '02d'
  }
];

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 3600000;

// Weather data cache
const weatherCache = new Map();

// Check if weather data is safe for drone operations
export const isWeatherSafe = (weatherData, thresholds = DEFAULT_THRESHOLDS) => {
  const {
    wind_speed,
    precipitation,
    visibility,
    temperature
  } = weatherData;

  return (
    wind_speed <= thresholds.windSpeed &&
    precipitation <= thresholds.precipitation &&
    visibility >= thresholds.visibility &&
    temperature >= thresholds.temperature.min &&
    temperature <= thresholds.temperature.max
  );
};

// Get weather forecast for a location
export const getWeatherForecast = async (location, apiKey) => {
  try {
    console.log('Fetching weather forecast for location:', location);
    
    // Create mock forecast data for testing
    const mockForecast = Array(5).fill().map((_, i) => ({
      date: new Date(Date.now() + i * 86400000).toISOString(),
      temperature: 70 + Math.random() * 20 - 10,
      wind: Math.random() * 25,
      precipitation: Math.random() < 0.3 ? Math.random() * 2 : 0,
      visibility: 10000 - Math.random() * 5000
    }));

    // If no API key, return mock data
    if (!apiKey) {
      console.log('No API key provided, returning mock forecast');
      return mockForecast;
    }

    // Try to get real forecast data
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${apiKey}&units=imperial`
    );
    const data = await response.json();

    if (data.cod === '200' && data.list) {
      // Process 5-day forecast data
      const forecast = data.list
        .filter((item, index) => index % 8 === 0) // Get one reading per day
        .slice(0, 5) // Limit to 5 days
        .map(item => ({
          date: new Date(item.dt * 1000).toISOString(),
          temperature: item.main.temp,
          wind: item.wind.speed,
          precipitation: item.rain ? item.rain['3h'] / 3 : 0, // Convert 3h precipitation to hourly
          visibility: item.visibility,
          weather: item.weather[0].main
        }));

      console.log('Processed weather forecast:', forecast);
      return forecast;
    } else {
      console.warn('Invalid weather data received, using mock data');
      return mockForecast;
    }
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return mockForecast;
  }
};

// Analyze route safety based on weather forecast
export const analyzeRouteSafety = (route, weatherForecasts, thresholds = DEFAULT_THRESHOLDS) => {
  return route.map((stop, index) => {
    const forecast = weatherForecasts[index];
    const isSafe = forecast.every(day => isWeatherSafe(day, thresholds));
    
    return {
      ...stop,
      weatherSafety: {
        isSafe,
        forecast,
        recommendations: isSafe ? [] : generateWeatherRecommendations(forecast)
      }
    };
  });
};

// Generate weather-based recommendations for route optimization
export const generateWeatherRecommendations = (forecast) => {
  const recommendations = [];
  
  // Find the best day for each stop based on weather conditions
  const bestDay = forecast.reduce((best, day, index) => {
    const score = calculateWeatherScore(day);
    return score > best.score ? { index, score } : best;
  }, { index: 0, score: 0 });

  if (bestDay.index !== 0) {
    recommendations.push({
      type: 'reschedule',
      message: `Consider rescheduling to ${forecast[bestDay.index].date.toLocaleDateString()} for better weather conditions`,
      priority: 'high'
    });
  }

  return recommendations;
};

// Calculate a weather score for a given day (higher is better)
const calculateWeatherScore = (day) => {
  let score = 100;
  
  // Deduct points for unfavorable conditions
  if (day.wind_speed > 15) score -= 20;
  if (day.precipitation > 0) score -= 30;
  if (day.visibility < 5) score -= 15;
  if (day.temperature < 40 || day.temperature > 90) score -= 25;

  return score;
};

// Check if weather conditions require immediate rerouting
export const requiresRerouting = (currentWeather, thresholds = DEFAULT_THRESHOLDS) => {
  return !isWeatherSafe(currentWeather, thresholds);
};

// Get alternative locations with better weather
export const findAlternativeLocations = async (location, radius, apiKey) => {
  try {
    // Use Google Places API to find nearby locations
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=point_of_interest&key=${apiKey}`
    );

    // Filter locations based on weather conditions
    const alternatives = await Promise.all(
      response.data.results.map(async (place) => {
        const forecast = await getWeatherForecast(
          { lat: place.geometry.location.lat, lng: place.geometry.location.lng },
          apiKey
        );
        
        return {
          ...place,
          weatherForecast: forecast,
          isSafe: forecast.every(day => isWeatherSafe(day))
        };
      })
    );

    return alternatives.filter(alt => alt.isSafe);
  } catch (error) {
    console.error('Error finding alternative locations:', error);
    return [];
  }
}; 