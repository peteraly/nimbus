import axios from 'axios';
import { isWeatherSafe, getWeatherForecast } from './weatherUtils';

// Cache duration for route data (1 hour)
const CACHE_DURATION = 3600000;
const routeCache = new Map();

// Get optimized route between multiple locations
export const getOptimizedRoute = async (locations, apiKey, mode = 'fastest') => {
  const cacheKey = locations.map(loc => `${loc.lat},${loc.lng}`).join('|');
  const cachedData = routeCache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    // Get weather forecasts for all locations
    const weatherForecasts = await Promise.all(
      locations.map(loc => getWeatherForecast(loc, apiKey))
    );

    // Get route from Google Maps Directions API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${locations[0].lat},${locations[0].lng}&destination=${locations[locations.length - 1].lat},${locations[locations.length - 1].lng}&waypoints=${locations.slice(1, -1).map(loc => `${loc.lat},${loc.lng}`).join('|')}&mode=driving&optimize=true&key=${apiKey}`
    );

    const route = response.data.routes[0];
    const optimizedOrder = route.waypoint_order.map(index => locations[index + 1]);
    
    // Add weather information to each stop
    const routeWithWeather = optimizedOrder.map((stop, index) => ({
      ...stop,
      weatherForecast: weatherForecasts[index],
      isSafe: weatherForecasts[index].every(day => isWeatherSafe(day))
    }));

    const data = {
      timestamp: Date.now(),
      data: {
        route: routeWithWeather,
        distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
        duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
        polyline: route.overview_polyline.points
      }
    };

    routeCache.set(cacheKey, data);
    return data.data;
  } catch (error) {
    console.error('Error getting optimized route:', error);
    throw error;
  }
};

// Reorder route based on weather conditions
export const reorderRouteForWeather = (route, weatherForecasts) => {
  // Create a matrix of weather scores for each stop and day
  const weatherScores = route.map((stop, stopIndex) => {
    const forecast = weatherForecasts[stopIndex];
    return forecast.map((day, dayIndex) => ({
      stopIndex,
      dayIndex,
      score: calculateWeatherScore(day)
    }));
  }).flat();

  // Sort by weather score (highest first)
  weatherScores.sort((a, b) => b.score - a.score);

  // Group stops by day
  const stopsByDay = {};
  weatherScores.forEach(({ stopIndex, dayIndex }) => {
    if (!stopsByDay[dayIndex]) {
      stopsByDay[dayIndex] = [];
    }
    stopsByDay[dayIndex].push(route[stopIndex]);
  });

  // Create new route order
  const reorderedRoute = Object.values(stopsByDay).flat();

  return {
    route: reorderedRoute,
    weatherScores,
    stopsByDay
  };
};

// Calculate weather score for a day (higher is better)
const calculateWeatherScore = (day) => {
  let score = 100;
  
  // Deduct points for unfavorable conditions
  if (day.wind_speed > 15) score -= 20;
  if (day.precipitation > 0) score -= 30;
  if (day.visibility < 5) score -= 15;
  if (day.temperature < 40 || day.temperature > 90) score -= 25;

  return score;
};

// Get alternative routes if weather conditions are unsafe
export const getAlternativeRoutes = async (locations, apiKey, radius = 5000) => {
  try {
    // Get current route
    const currentRoute = await getOptimizedRoute(locations, apiKey);
    
    // Find unsafe stops
    const unsafeStops = currentRoute.route.filter(stop => !stop.isSafe);
    
    // For each unsafe stop, find alternative locations
    const alternativeRoutes = await Promise.all(
      unsafeStops.map(async (stop) => {
        const alternatives = await findAlternativeLocations(stop, radius, apiKey);
        
        if (alternatives.length === 0) {
          return null;
        }

        // Create new route with alternative location
        const newLocations = locations.map(loc => 
          loc === stop ? alternatives[0] : loc
        );

        return getOptimizedRoute(newLocations, apiKey);
      })
    );

    // Filter out null results and sort by weather safety
    return alternativeRoutes
      .filter(route => route !== null)
      .sort((a, b) => {
        const aSafety = a.route.filter(stop => stop.isSafe).length;
        const bSafety = b.route.filter(stop => stop.isSafe).length;
        return bSafety - aSafety;
      });
  } catch (error) {
    console.error('Error getting alternative routes:', error);
    return [];
  }
};

// Calculate route statistics
export const calculateRouteStats = (route) => {
  const totalStops = route.route.length;
  const safeStops = route.route.filter(stop => stop.isSafe).length;
  const unsafeStops = totalStops - safeStops;

  return {
    totalStops,
    safeStops,
    unsafeStops,
    safetyPercentage: (safeStops / totalStops) * 100,
    totalDistance: route.distance,
    totalDuration: route.duration
  };
}; 