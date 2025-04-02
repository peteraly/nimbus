import axios from 'axios';

// Weather thresholds for drone operations
const DEFAULT_THRESHOLDS = {
  windSpeed: 20, // mph
  precipitation: 0, // mm/h
  visibility: 3, // miles
  temperature: {
    min: 32, // °F
    max: 104 // °F
  }
};

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
  const cacheKey = `${location.lat},${location.lng}`;
  const cachedData = weatherCache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    // Get 7-day forecast from OpenWeatherMap using the 5-day forecast endpoint
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&units=imperial&appid=${apiKey}`
    );

    // Group forecast data by day
    const dailyForecasts = {};
    response.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date: new Date(item.dt * 1000),
          temperature: item.main.temp,
          wind_speed: item.wind.speed,
          precipitation: item.rain ? item.rain['3h'] / 3 : 0, // Convert 3h rain to hourly
          visibility: item.visibility / 1609.34, // Convert meters to miles
          weather: item.weather[0].main,
          description: item.weather[0].description
        };
      }
    });

    const forecast = Object.values(dailyForecasts).slice(0, 7); // Get up to 7 days

    const data = {
      timestamp: Date.now(),
      data: forecast
    };

    weatherCache.set(cacheKey, data);
    return forecast;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
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