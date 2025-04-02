import axios from 'axios';
import { isWeatherSafe, getWeatherForecast } from './weatherUtils';

// Cache duration for route data (1 hour)
const CACHE_DURATION = 3600000;
const routeCache = new Map();

// Wait for Google Maps API to be loaded
const waitForGoogleMaps = () => {
  console.log('Waiting for Google Maps API to load...');
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      resolve(window.google.maps);
    } else {
      console.log('Setting up interval to check for Google Maps API');
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          console.log('Google Maps API loaded');
          clearInterval(checkGoogleMaps);
          resolve(window.google.maps);
        }
      }, 100);
    }
  });
};

// Get optimized route between multiple locations
export const getOptimizedRoute = async (locations, apiKey, mode = 'fastest') => {
  console.log('getOptimizedRoute called with locations:', locations);
  
  if (!locations || locations.length < 2) {
    console.log('Not enough locations for route');
    return null;
  }

  const cacheKey = locations.map(loc => `${loc.lat},${loc.lng}`).join('|');
  const cachedData = routeCache.get(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('Returning cached route data');
    return cachedData.data;
  }

  try {
    console.log('Waiting for Google Maps API...');
    const maps = await waitForGoogleMaps();
    console.log('Google Maps API loaded, creating DirectionsService');
    
    // Create a promise to handle the directions service
    return new Promise((resolve, reject) => {
      const directionsService = new maps.DirectionsService();
      console.log('DirectionsService created');

      const waypoints = locations.slice(1, -1).map(location => {
        console.log('Creating waypoint for location:', location);
        return {
          location: new maps.LatLng(parseFloat(location.lat), parseFloat(location.lng)),
          stopover: true,
        };
      });

      const origin = new maps.LatLng(
        parseFloat(locations[0].lat),
        parseFloat(locations[0].lng)
      );
      const destination = new maps.LatLng(
        parseFloat(locations[locations.length - 1].lat),
        parseFloat(locations[locations.length - 1].lng)
      );

      console.log('Requesting directions with:', {
        origin: `${origin.lat()},${origin.lng()}`,
        destination: `${destination.lat()},${destination.lng()}`,
        waypoints: waypoints.length,
      });

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: maps.TravelMode.DRIVING,
        },
        (result, status) => {
          console.log('Directions service returned status:', status);
          if (status === 'OK') {
            console.log('Route received successfully');
            // Get the optimized order of locations
            const waypointOrder = result.routes[0].waypoint_order;
            const orderedLocations = [locations[0]];
            waypointOrder.forEach(index => {
              orderedLocations.push(locations[index + 1]);
            });
            orderedLocations.push(locations[locations.length - 1]);

            // Calculate total distance and duration
            const legs = result.routes[0].legs;
            const totalDistance = legs.reduce((sum, leg) => sum + leg.distance.value, 0);
            const totalDuration = legs.reduce((sum, leg) => sum + leg.duration.value, 0);

            // Calculate safety percentage based on weather conditions
            const safeLocations = orderedLocations.filter(loc => {
              if (!loc.forecast || !Array.isArray(loc.forecast)) return false;
              return loc.forecast.some(day => isWeatherSafe(day));
            });

            const safetyPercentage = (safeLocations.length / orderedLocations.length) * 100;

            const data = {
              timestamp: Date.now(),
              data: {
                directions: result,
                route: orderedLocations,
                distance: totalDistance,
                duration: totalDuration,
                safetyPercentage,
                legs: legs.map(leg => ({
                  distance: leg.distance,
                  duration: leg.duration,
                  startLocation: leg.start_location,
                  endLocation: leg.end_location
                }))
              }
            };

            console.log('Caching and returning route data');
            routeCache.set(cacheKey, data);
            resolve(data.data);
          } else {
            console.error('Failed to get directions:', status);
            reject(new Error(`Failed to get directions: ${status}`));
          }
        }
      );
    });
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
  if (!route) return null;

  return {
    totalStops: route.route.length,
    safeStops: route.route.filter(loc => {
      if (!loc.forecast || !Array.isArray(loc.forecast)) return false;
      return loc.forecast.some(day => isWeatherSafe(day));
    }).length,
    unsafeStops: route.route.length - route.route.filter(loc => {
      if (!loc.forecast || !Array.isArray(loc.forecast)) return false;
      return loc.forecast.some(day => isWeatherSafe(day));
    }).length,
    safetyPercentage: route.safetyPercentage,
    totalDistance: route.distance,
    totalDuration: route.duration,
    legs: route.legs
  };
}; 