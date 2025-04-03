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

// Helper function to calculate weather score for a location
const calculateWeatherScore = (forecast) => {
  if (!forecast || !Array.isArray(forecast)) {
    console.log('Invalid forecast data:', forecast);
    return 0;
  }
  
  // Get the next 24 hours of forecast
  const nextDayForecast = forecast[0];
  if (!nextDayForecast) {
    console.log('No forecast data available');
    return 0;
  }

  console.log('Calculating weather score for forecast:', JSON.stringify(nextDayForecast, null, 2));
  let score = 100; // Start with perfect score
  let reductions = [];

  // Reduce score based on weather conditions
  // Check for wind speed using either wind or wind_speed property
  const windSpeed = nextDayForecast.wind || nextDayForecast.wind_speed || 0;
  if (windSpeed > 20) { // High wind
    score -= 30;
    reductions.push(`wind speed ${windSpeed} mph > 20 mph (-30)`);
  }

  // Check for precipitation
  const precip = nextDayForecast.precipitation || 0;
  if (precip > 0.1) { // Rain
    score -= 25;
    reductions.push(`precipitation ${precip} mm/h > 0.1 mm/h (-25)`);
  }

  // Check for visibility
  const visibility = nextDayForecast.visibility || 10000;
  if (visibility < 5000) { // Poor visibility
    score -= 25;
    reductions.push(`visibility ${visibility}m < 5000m (-25)`);
  }

  // Check for temperature
  const temp = nextDayForecast.temperature;
  if (temp < 32 || temp > 95) { // Temperature outside safe range
    score -= 20;
    reductions.push(`temperature ${temp}°F outside safe range (-20)`);
  }

  const finalScore = Math.max(0, score);
  console.log('Weather score reductions:', reductions);
  console.log('Final weather score:', finalScore);
  return finalScore;
};

// Get optimized route between multiple locations
export const getOptimizedRoute = async (locations) => {
  console.log('=== getOptimizedRoute Debug ===');
  console.log('Input locations:', locations.map(l => ({
    address: l.address,
    hasForecast: !!l.forecast,
    hasCoords: !!l.lat && !!l.lng,
    lat: l.lat,
    lng: l.lng
  })));

  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not loaded');
    throw new Error('Google Maps API not loaded');
  }

  if (locations.length < 2) {
    console.log('Not enough locations for route optimization');
    return null;
  }

  try {
    // Calculate weather scores for each location
    const weatherScores = locations.map(location => {
      console.log('Calculating weather score for:', location.address);
      const score = calculateWeatherScore(location.forecast);
      console.log('Weather score:', score);
      return {
        location,
        score
      };
    });

    // Sort locations by weather score (highest first)
    const sortedLocations = [...weatherScores].sort((a, b) => b.score - a.score);
    console.log('Sorted locations by weather score:', sortedLocations.map(l => ({
      address: l.location.address,
      score: l.score
    })));

    // Create waypoints for the route
    const waypoints = sortedLocations.slice(1, -1).map(loc => ({
      location: new window.google.maps.LatLng(loc.location.lat, loc.location.lng),
      stopover: true
    }));

    console.log('Created waypoints:', waypoints.length);

    // Create directions request
    const request = {
      origin: new window.google.maps.LatLng(sortedLocations[0].location.lat, sortedLocations[0].location.lng),
      destination: new window.google.maps.LatLng(sortedLocations[sortedLocations.length - 1].location.lat, sortedLocations[sortedLocations.length - 1].location.lng),
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: window.google.maps.TravelMode.DRIVING
    };

    console.log('Directions request:', {
      origin: request.origin.toString(),
      destination: request.destination.toString(),
      numWaypoints: waypoints.length
    });

    // Get directions
    const directionsService = new window.google.maps.DirectionsService();
    const result = await new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        console.log('Directions service status:', status);
        if (status === window.google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });

    console.log('Directions result received:', {
      hasResult: !!result,
      numRoutes: result?.routes?.length,
      numLegs: result?.routes?.[0]?.legs?.length
    });

    if (!result || !result.routes || result.routes.length === 0) {
      throw new Error('No valid route found');
    }

    // Calculate total distance and duration
    const totalDistance = result.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalDuration = result.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0);

    // Calculate overall route safety percentage
    const overallSafetyPercentage = Math.round(
      weatherScores.reduce((sum, score) => sum + score.score, 0) / weatherScores.length
    );

    console.log('Route calculations:', {
      totalDistance,
      totalDuration,
      overallSafetyPercentage
    });

    // Prepare route data
    const routeData = {
      directions: result,
      route: result.routes[0].legs.map(leg => ({
        start: leg.start_location,
        end: leg.end_location,
        distance: leg.distance,
        duration: leg.duration
      })),
      distance: totalDistance,
      duration: totalDuration,
      safetyPercentage: overallSafetyPercentage,
      weatherScores: weatherScores.map(score => ({
        location: score.location.address,
        score: score.score
      }))
    };

    console.log('Final route data:', {
      numStops: routeData.route.length,
      distance: routeData.distance,
      duration: routeData.duration,
      safetyPercentage: routeData.safetyPercentage,
      weatherScores: routeData.weatherScores
    });

    return routeData;
  } catch (error) {
    console.error('Error in getOptimizedRoute:', error);
    throw error;
  }
};

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

// Reorder route based on weather conditions
export const reorderRouteForWeather = (route, weatherForecasts) => {
  // Create a matrix of weather scores for each stop and day
  const weatherScores = route.map((stop, stopIndex) => {
    const forecast = weatherForecasts[stopIndex];
    return forecast.map((day, dayIndex) => ({
      stopIndex,
      dayIndex,
      score: calculateWeatherScore(forecast)
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

// Get alternative routes if weather conditions are unsafe
export const getAlternativeRoutes = async (locations, apiKey, radius = 5000) => {
  try {
    // Get current route
    const currentRoute = await getOptimizedRoute(locations);
    
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

        return getOptimizedRoute(newLocations);
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
  if (!route) {
    console.log('No route data provided to calculateRouteStats');
    return null;
  }

  console.log('Calculating route stats for route:', {
    numLocations: route.route.length,
    hasWeatherScores: !!route.weatherScores,
    totalDistance: route.distance,
    totalDuration: route.duration
  });

  // Calculate safety stats from weather scores
  const safetyStats = route.weatherScores.reduce((stats, stop) => {
    if (stop.score > 70) stats.safe++;
    else if (stop.score > 40) stats.moderate++;
    else stats.unsafe++;
    return stats;
  }, { safe: 0, moderate: 0, unsafe: 0 });

  console.log('Safety stats calculated:', safetyStats);

  return {
    totalStops: route.route.length,
    safeStops: safetyStats.safe,
    moderateStops: safetyStats.moderate,
    unsafeStops: safetyStats.unsafe,
    safetyPercentage: route.safetyPercentage,
    totalDistance: route.distance,
    totalDuration: route.duration,
    legs: route.legs,
    weatherScores: route.weatherScores
  };
};

/**
 * Generates multiple route options based on different weather priorities
 * @param {Array} locations - Array of location objects with weather data
 * @returns {Array} - Array of route options
 */
export const generateRouteOptions = async (locations) => {
  console.log('Generating route options for locations:', locations);
  
  if (!window.google || !window.google.maps) {
    console.error('Google Maps API not loaded');
    return [];
  }
  
  if (locations.length < 2) {
    console.log('Not enough locations for route options');
    return [];
  }
  
  try {
    // Calculate weather scores for each location
    const weatherScores = calculateWeatherScores(locations);
    console.log('Weather scores calculated:', weatherScores);
    
    // Generate different route options based on priorities
    const routeOptions = [];
    
    // 1. Safety First - Prioritize locations with best weather conditions
    const safetyFirstRoute = await generateSafetyFirstRoute(locations, weatherScores);
    if (safetyFirstRoute) routeOptions.push(safetyFirstRoute);
    
    // 2. Distance Optimized - Minimize total travel distance
    const distanceOptimizedRoute = await generateDistanceOptimizedRoute(locations, weatherScores);
    if (distanceOptimizedRoute) routeOptions.push(distanceOptimizedRoute);
    
    // 3. Balanced - Consider both weather safety and travel distance
    const balancedRoute = await generateBalancedRoute(locations, weatherScores);
    if (balancedRoute) routeOptions.push(balancedRoute);
    
    // 4. Time Optimized - Consider time of day for each location
    const timeOptimizedRoute = await generateTimeOptimizedRoute(locations, weatherScores);
    if (timeOptimizedRoute) routeOptions.push(timeOptimizedRoute);
    
    console.log('Generated route options:', routeOptions);
    return routeOptions;
  } catch (error) {
    console.error('Error generating route options:', error);
    return [];
  }
};

/**
 * Calculates weather scores for each location
 * @param {Array} locations - Array of location objects with weather data
 * @returns {Array} - Array of weather score objects
 */
const calculateWeatherScores = (locations) => {
  return locations.map(location => {
    const currentHour = new Date().getHours();
    const currentForecast = location.forecast.find(f => {
      const forecastDate = new Date(f.date);
      return forecastDate.getHours() === currentHour;
    }) || location.forecast[0];
    
    // Calculate weather score based on current conditions
    const windScore = calculateWindScore(currentForecast.wind);
    const precipScore = calculatePrecipScore(currentForecast.precipitation);
    const visibilityScore = calculateVisibilityScore(currentForecast.visibility);
    const tempScore = calculateTempScore(currentForecast.temperature);
    
    // Calculate overall weather score (0-100)
    const weatherScore = Math.round((windScore + precipScore + visibilityScore + tempScore) / 4);
    
    return {
      location: location.address,
      score: weatherScore,
      windScore,
      precipScore,
      visibilityScore,
      tempScore,
      forecast: currentForecast
    };
  });
};

/**
 * Calculates wind score based on wind speed
 * @param {number} windSpeed - Wind speed in mph
 * @returns {number} - Wind score (0-100)
 */
const calculateWindScore = (windSpeed) => {
  if (windSpeed <= 5) return 100;
  if (windSpeed <= 10) return 90;
  if (windSpeed <= 15) return 70;
  if (windSpeed <= 20) return 50;
  if (windSpeed <= 25) return 30;
  return 10;
};

/**
 * Calculates precipitation score based on precipitation amount
 * @param {number} precipitation - Precipitation in mm/h
 * @returns {number} - Precipitation score (0-100)
 */
const calculatePrecipScore = (precipitation) => {
  if (precipitation === 0) return 100;
  if (precipitation <= 0.1) return 90;
  if (precipitation <= 0.5) return 70;
  if (precipitation <= 1) return 50;
  if (precipitation <= 2) return 30;
  return 10;
};

/**
 * Calculates visibility score based on visibility distance
 * @param {number} visibility - Visibility in meters
 * @returns {number} - Visibility score (0-100)
 */
const calculateVisibilityScore = (visibility) => {
  if (visibility >= 10000) return 100;
  if (visibility >= 8000) return 90;
  if (visibility >= 5000) return 70;
  if (visibility >= 3000) return 50;
  if (visibility >= 1000) return 30;
  return 10;
};

/**
 * Calculates temperature score based on temperature
 * @param {number} temperature - Temperature in Fahrenheit
 * @returns {number} - Temperature score (0-100)
 */
const calculateTempScore = (temperature) => {
  if (temperature >= 50 && temperature <= 80) return 100;
  if (temperature >= 40 && temperature <= 90) return 90;
  if (temperature >= 32 && temperature <= 95) return 70;
  if (temperature >= 25 && temperature <= 100) return 50;
  if (temperature >= 20 && temperature <= 105) return 30;
  return 10;
};

/**
 * Generates a safety-first route prioritizing locations with best weather conditions
 * @param {Array} locations - Array of location objects
 * @param {Array} weatherScores - Array of weather score objects
 * @returns {Object} - Route option object
 */
const generateSafetyFirstRoute = async (locations, weatherScores) => {
  try {
    // Sort locations by weather score (highest first)
    const sortedLocations = [...locations].sort((a, b) => {
      const scoreA = weatherScores.find(s => s.location === a.address).score;
      const scoreB = weatherScores.find(s => s.location === b.address).score;
      return scoreB - scoreA;
    });
    
    // Get directions for the sorted route
    const directions = await getDirections(sortedLocations);
    if (!directions) return null;
    
    // Calculate route stats
    const routeStats = calculateRouteStats(directions, sortedLocations);
    
    // Calculate safety percentage
    const safetyPercentage = calculateSafetyPercentage(weatherScores, sortedLocations);
    
    // Generate weather highlights
    const weatherHighlights = generateWeatherHighlights(weatherScores, sortedLocations);
    
    return {
      name: 'Safety First',
      description: 'Prioritizes locations with the best weather conditions',
      route: sortedLocations,
      directions,
      distance: routeStats.totalDistance,
      duration: routeStats.totalDuration,
      safetyPercentage,
      weatherScore: Math.round(weatherScores.reduce((sum, score) => sum + score.score, 0) / weatherScores.length),
      weatherHighlights,
      weatherScores: weatherScores.map(score => ({
        location: score.location,
        score: score.score
      }))
    };
  } catch (error) {
    console.error('Error generating safety-first route:', error);
    return null;
  }
};

/**
 * Generates a distance-optimized route minimizing total travel distance
 * @param {Array} locations - Array of location objects
 * @param {Array} weatherScores - Array of weather score objects
 * @returns {Object} - Route option object
 */
const generateDistanceOptimizedRoute = async (locations, weatherScores) => {
  try {
    // Use the original route order (which is typically distance-optimized by Google Maps)
    const directions = await getDirections(locations);
    if (!directions) return null;
    
    // Calculate route stats
    const routeStats = calculateRouteStats(directions, locations);
    
    // Calculate safety percentage
    const safetyPercentage = calculateSafetyPercentage(weatherScores, locations);
    
    // Generate weather highlights
    const weatherHighlights = generateWeatherHighlights(weatherScores, locations);
    
    return {
      name: 'Distance Optimized',
      description: 'Minimizes total travel distance',
      route: locations,
      directions,
      distance: routeStats.totalDistance,
      duration: routeStats.totalDuration,
      safetyPercentage,
      weatherScore: Math.round(weatherScores.reduce((sum, score) => sum + score.score, 0) / weatherScores.length),
      weatherHighlights,
      weatherScores: weatherScores.map(score => ({
        location: score.location,
        score: score.score
      }))
    };
  } catch (error) {
    console.error('Error generating distance-optimized route:', error);
    return null;
  }
};

/**
 * Generates a balanced route considering both weather safety and travel distance
 * @param {Array} locations - Array of location objects
 * @param {Array} weatherScores - Array of weather score objects
 * @returns {Object} - Route option object
 */
const generateBalancedRoute = async (locations, weatherScores) => {
  try {
    // Create a weighted scoring system that considers both weather and distance
    const weightedScores = calculateWeightedScores(locations, weatherScores);
    
    // Sort locations by weighted score
    const sortedLocations = [...locations].sort((a, b) => {
      const scoreA = weightedScores.find(s => s.location === a.address).weightedScore;
      const scoreB = weightedScores.find(s => s.location === b.address).weightedScore;
      return scoreB - scoreA;
    });
    
    // Get directions for the sorted route
    const directions = await getDirections(sortedLocations);
    if (!directions) return null;
    
    // Calculate route stats
    const routeStats = calculateRouteStats(directions, sortedLocations);
    
    // Calculate safety percentage
    const safetyPercentage = calculateSafetyPercentage(weatherScores, sortedLocations);
    
    // Generate weather highlights
    const weatherHighlights = generateWeatherHighlights(weatherScores, sortedLocations);
    
    return {
      name: 'Balanced',
      description: 'Considers both weather safety and travel distance',
      route: sortedLocations,
      directions,
      distance: routeStats.totalDistance,
      duration: routeStats.totalDuration,
      safetyPercentage,
      weatherScore: Math.round(weatherScores.reduce((sum, score) => sum + score.score, 0) / weatherScores.length),
      weatherHighlights,
      weatherScores: weatherScores.map(score => ({
        location: score.location,
        score: score.score
      }))
    };
  } catch (error) {
    console.error('Error generating balanced route:', error);
    return null;
  }
};

/**
 * Calculates weighted scores considering both weather and distance
 * @param {Array} locations - Array of location objects
 * @param {Array} weatherScores - Array of weather score objects
 * @returns {Array} - Array of weighted score objects
 */
const calculateWeightedScores = (locations, weatherScores) => {
  // Calculate distances between all locations
  const distances = calculateDistances(locations);
  
  // Calculate average distance for normalization
  const avgDistance = Object.values(distances).reduce((sum, dist) => sum + dist, 0) / 
                     (Object.keys(distances).length || 1);
  
  return locations.map(location => {
    const weatherScore = weatherScores.find(s => s.location === location.address).score;
    
    // Calculate average distance to other locations
    const locationDistances = Object.entries(distances)
      .filter(([key]) => key.includes(location.address))
      .map(([_, dist]) => dist);
    
    const avgLocationDistance = locationDistances.reduce((sum, dist) => sum + dist, 0) / 
                               (locationDistances.length || 1);
    
    // Normalize distance score (closer is better)
    const distanceScore = Math.max(0, 100 - (avgLocationDistance / avgDistance) * 50);
    
    // Calculate weighted score (70% weather, 30% distance)
    const weightedScore = (weatherScore * 0.7) + (distanceScore * 0.3);
    
    return {
      location: location.address,
      weatherScore,
      distanceScore,
      weightedScore
    };
  });
};

/**
 * Calculates distances between all locations
 * @param {Array} locations - Array of location objects
 * @returns {Object} - Object with distance keys and values
 */
const calculateDistances = (locations) => {
  const distances = {};
  
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const key = `${locations[i].address}|${locations[j].address}`;
      const distance = calculateDistance(
        parseFloat(locations[i].lat),
        parseFloat(locations[i].lng),
        parseFloat(locations[j].lat),
        parseFloat(locations[j].lng)
      );
      distances[key] = distance;
    }
  }
  
  return distances;
};

/**
 * Generates a time-optimized route considering time of day for each location
 * @param {Array} locations - Array of location objects
 * @param {Array} weatherScores - Array of weather score objects
 * @returns {Object} - Route option object
 */
const generateTimeOptimizedRoute = async (locations, weatherScores) => {
  try {
    // Get current time
    const now = new Date();
    const currentHour = now.getHours();
    
    // Calculate time-based scores for each location
    const timeBasedScores = calculateTimeBasedScores(locations, weatherScores, currentHour);
    
    // Sort locations by time-based score
    const sortedLocations = [...locations].sort((a, b) => {
      const scoreA = timeBasedScores.find(s => s.location === a.address).timeBasedScore;
      const scoreB = timeBasedScores.find(s => s.location === b.address).timeBasedScore;
      return scoreB - scoreA;
    });
    
    // Get directions for the sorted route
    const directions = await getDirections(sortedLocations);
    if (!directions) return null;
    
    // Calculate route stats
    const routeStats = calculateRouteStats(directions, sortedLocations);
    
    // Calculate safety percentage
    const safetyPercentage = calculateSafetyPercentage(weatherScores, sortedLocations);
    
    // Generate time-based weather highlights
    const weatherHighlights = generateTimeBasedWeatherHighlights(timeBasedScores, sortedLocations);
    
    return {
      name: 'Time Optimized',
      description: 'Considers the time of day for each location',
      route: sortedLocations,
      directions,
      distance: routeStats.totalDistance,
      duration: routeStats.totalDuration,
      safetyPercentage,
      weatherScore: Math.round(timeBasedScores.reduce((sum, score) => sum + score.timeBasedScore, 0) / timeBasedScores.length),
      weatherHighlights,
      weatherScores: timeBasedScores.map(score => ({
        location: score.location,
        score: score.timeBasedScore
      }))
    };
  } catch (error) {
    console.error('Error generating time-optimized route:', error);
    return null;
  }
};

/**
 * Calculates time-based scores for each location
 * @param {Array} locations - Array of location objects
 * @param {Array} weatherScores - Array of weather score objects
 * @param {number} currentHour - Current hour (0-23)
 * @returns {Array} - Array of time-based score objects
 */
const calculateTimeBasedScores = (locations, weatherScores, currentHour) => {
  return locations.map(location => {
    const weatherScore = weatherScores.find(s => s.location === location.address);
    
    // Get forecast for the next 6 hours
    const nextHoursForecast = location.forecast
      .filter(f => {
        const forecastHour = new Date(f.date).getHours();
        return forecastHour >= currentHour && forecastHour < currentHour + 6;
      })
      .slice(0, 6);
    
    if (nextHoursForecast.length === 0) {
      return {
        location: location.address,
        timeBasedScore: weatherScore.score,
        bestHour: currentHour
      };
    }
    
    // Calculate scores for each hour
    const hourlyScores = nextHoursForecast.map(forecast => {
      const hour = new Date(forecast.date).getHours();
      const windScore = calculateWindScore(forecast.wind);
      const precipScore = calculatePrecipScore(forecast.precipitation);
      const visibilityScore = calculateVisibilityScore(forecast.visibility);
      const tempScore = calculateTempScore(forecast.temperature);
      
      return {
        hour,
        score: Math.round((windScore + precipScore + visibilityScore + tempScore) / 4)
      };
    });
    
    // Find the best hour
    const bestHour = hourlyScores.reduce((best, current) => 
      current.score > best.score ? current : best, 
      { hour: currentHour, score: 0 }
    ).hour;
    
    // Calculate time-based score (weighted average of next 6 hours)
    const timeBasedScore = Math.round(
      hourlyScores.reduce((sum, score) => sum + score.score, 0) / hourlyScores.length
    );
    
    return {
      location: location.address,
      timeBasedScore,
      bestHour
    };
  });
};

/**
 * Generates weather highlights for a route
 * @param {Array} weatherScores - Array of weather score objects
 * @param {Array} route - Array of location objects in route order
 * @returns {string} - Weather highlights text
 */
const generateWeatherHighlights = (weatherScores, route) => {
  // Find the location with the worst weather
  const worstWeather = weatherScores.reduce((worst, current) => 
    current.score < worst.score ? current : worst, 
    { score: 100 }
  );
  
  // Find the location with the best weather
  const bestWeather = weatherScores.reduce((best, current) => 
    current.score > best.score ? current : best, 
    { score: 0 }
  );
  
  return `Best conditions at ${bestWeather.location} (${bestWeather.score}%), worst at ${worstWeather.location} (${worstWeather.score}%)`;
};

/**
 * Generates time-based weather highlights for a route
 * @param {Array} timeBasedScores - Array of time-based score objects
 * @param {Array} route - Array of location objects in route order
 * @returns {string} - Time-based weather highlights text
 */
const generateTimeBasedWeatherHighlights = (timeBasedScores, route) => {
  // Find the location with the best time to visit
  const bestTime = timeBasedScores.reduce((best, current) => 
    current.timeBasedScore > best.timeBasedScore ? current : best, 
    { timeBasedScore: 0 }
  );
  
  return `Best time to visit ${bestTime.location} is around ${bestTime.bestHour}:00`;
};

/**
 * Calculates safety percentage for a route
 * @param {Array} weatherScores - Array of weather score objects
 * @param {Array} route - Array of location objects in route order
 * @returns {number} - Safety percentage (0-100)
 */
const calculateSafetyPercentage = (weatherScores, route) => {
  // Calculate average weather score for the route
  const routeScores = route.map(location => 
    weatherScores.find(score => score.location === location.address).score
  );
  
  const avgScore = routeScores.reduce((sum, score) => sum + score, 0) / routeScores.length;
  
  // Convert to safety percentage (0-100)
  return Math.round(avgScore);
};

/**
 * Gets directions for a route using Google Maps API
 * @param {Array} locations - Array of location objects in route order
 * @returns {Object} - Google Maps directions object
 */
const getDirections = async (locations) => {
  if (locations.length < 2) return null;
  
  try {
    const directionsService = new window.google.maps.DirectionsService();
    
    // Create waypoints for all locations except first and last
    const waypoints = locations.slice(1, -1).map(location => ({
      location: new window.google.maps.LatLng(
        parseFloat(location.lat),
        parseFloat(location.lng)
      ),
      stopover: true
    }));
    
    // Create request for directions
    const request = {
      origin: new window.google.maps.LatLng(
        parseFloat(locations[0].lat),
        parseFloat(locations[0].lng)
      ),
      destination: new window.google.maps.LatLng(
        parseFloat(locations[locations.length - 1].lat),
        parseFloat(locations[locations.length - 1].lng)
      ),
      waypoints,
      optimizeWaypoints: false,
      travelMode: window.google.maps.TravelMode.DRIVING
    };
    
    // Get directions
    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          resolve(result);
        } else {
          console.error('Error getting directions:', status);
          reject(new Error(`Directions request failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
};

// Helper function to find alternative locations near an unsafe stop
const findAlternativeLocations = async (stop, radius, apiKey) => {
  console.log('Finding alternative locations for stop:', stop);
  
  try {
    // Use Google Places API to find nearby locations
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    const request = {
      location: new window.google.maps.LatLng(stop.lat, stop.lng),
      radius: radius || 5000, // Default 5km radius
      type: ['point_of_interest', 'establishment']
    };
    
    return new Promise((resolve, reject) => {
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          console.log('Found alternative locations:', results.length);
          
          // Transform results to match our location format
          const alternatives = results.map(place => ({
            address: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            placeId: place.place_id
          }));
          
          resolve(alternatives);
        } else {
          console.error('Places API error:', status);
          resolve([]);
        }
      });
    });
  } catch (error) {
    console.error('Error finding alternative locations:', error);
    return [];
  }
}; 