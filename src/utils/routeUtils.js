import { calculateWeatherScore } from '../services/weatherService';

/**
 * Cache for storing previously calculated routes to improve performance
 * @type {Map<string, Object>}
 */
const routeCache = new Map();

/**
 * Maximum number of routes to store in cache to prevent memory issues
 * @type {number}
 */
const MAX_CACHE_SIZE = 100;

/**
 * Debounce function to prevent too many API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate a cache key for routes based on locations
 * @param {Array<Object>} locations - Array of location objects
 * @param {Object} startLocation - Optional start location
 * @returns {string} - Cache key
 */
const generateCacheKey = (locations, startLocation) => {
  if (!Array.isArray(locations)) {
    throw new Error('Locations must be an array');
  }
  
  const locationStrings = locations.map(loc => {
    if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
      throw new Error('Invalid location object');
    }
    return `${loc.lat},${loc.lng}`;
  }).sort();
  
  const startString = startLocation 
    ? `${startLocation.lat},${startLocation.lng}` 
    : '';
    
  return `${startString}-${locationStrings.join('-')}`;
};

/**
 * Calculate weather score for a location
 * @param {Object} weatherData - Weather data object
 * @returns {number} - Weather score
 */
export const calculateLocationWeatherScore = (weatherData) => {
  if (!weatherData) return 0;
  return calculateWeatherScore(weatherData.current || weatherData);
};

/**
 * Get optimized route using Mapbox Directions API
 * @param {Array<Object>} locations - Array of location objects
 * @param {Object} weatherData - Weather data object
 * @param {Object} startLocation - Optional start location
 * @returns {Promise<Object>} - Optimized route
 */
const getOptimizedRoute = async (locations, weatherData, startLocation) => {
  try {
    if (!locations || locations.length === 0) {
      throw new Error('No locations provided for route optimization');
    }

    const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
    if (!mapboxToken) {
      throw new Error('Mapbox API token is missing');
    }
    
    // Prepare waypoints for the API call
    const waypoints = [];
    
    // Add start location if provided
    if (startLocation) {
      waypoints.push(`${startLocation.lng},${startLocation.lat}`);
    }
    
    // Add all other locations
    locations.forEach(location => {
      waypoints.push(`${location.lng},${location.lat}`);
    });
    
    // Check if we have at least 2 waypoints
    if (waypoints.length < 2) {
      throw new Error('Not enough input coordinates given; minimum number of coordinates is 2');
    }
    
    // Construct the API URL
    const waypointsString = waypoints.join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointsString}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
    
    // Make the API call
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mapbox API error: ${response.statusText}. ${errorData.message || ''}`);
    }
    
    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found');
    }
    
    // Get the first route
    const route = data.routes[0];
    
    // Calculate weather scores for each location
    const locationScores = [];
    
    // Add start location score if provided
    if (startLocation && weatherData[startLocation.address]) {
      locationScores.push({
        location: startLocation,
        score: calculateLocationWeatherScore(weatherData[startLocation.address])
      });
    }
    
    // Add scores for other locations
    locations.forEach(location => {
      if (weatherData[location.address]) {
        locationScores.push({
          location: location,
          score: calculateLocationWeatherScore(weatherData[location.address])
        });
      }
    });
    
    // Return the optimized route with weather information
    return {
      geometry: route.geometry,
      distance: route.distance,
      duration: route.duration,
      locationScores: locationScores,
      isLoading: false,
      error: null
    };
  } catch (error) {
    console.error('Error in getOptimizedRoute:', error);
    throw error;
  }
};

/**
 * Optimized route calculation function with caching
 * @param {Array<Object>} locations - Array of location objects
 * @param {Object} weatherData - Weather data object
 * @param {Object} startLocation - Optional start location
 * @returns {Promise<Object>} - Optimized route
 */
export const calculateOptimizedRoute = async (locations, weatherData, startLocation) => {
  try {
    // Generate cache key
    const cacheKey = generateCacheKey(locations, startLocation);
    
    // Check cache first
    if (routeCache.has(cacheKey)) {
      console.log('Using cached route');
      return routeCache.get(cacheKey);
    }
    
    // If not in cache, calculate new route
    const route = await getOptimizedRoute(locations, weatherData, startLocation);
    
    // Store in cache
    routeCache.set(cacheKey, route);
    
    // Limit cache size to prevent memory issues
    if (routeCache.size > MAX_CACHE_SIZE) {
      const firstKey = routeCache.keys().next().value;
      routeCache.delete(firstKey);
    }
    
    return route;
  } catch (error) {
    console.error('Error calculating optimized route:', error);
    throw error;
  }
};

/**
 * Debounced version of the route calculation
 * @type {Function}
 */
export const debouncedCalculateRoute = debounce(calculateOptimizedRoute, 500);

/**
 * Clear route cache
 */
export const clearRouteCache = () => {
  routeCache.clear();
};

/**
 * Get nearby places using Mapbox API
 * @param {Object} location - Location object with lat and lng
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Array<Object>>} - Array of nearby places
 */
export const getNearbyPlaces = async (location, radius = 1000) => {
  try {
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      throw new Error('Invalid location object');
    }
    
    const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;
    if (!mapboxToken) {
      throw new Error('Mapbox API token is missing');
    }
    
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?types=poi&radius=${radius}&access_token=${mapboxToken}`
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Mapbox API error: ${response.statusText}. ${errorData.message || ''}`);
    }
    
    const data = await response.json();
    
    return data.features.map(feature => ({
      name: feature.text,
      location: {
        lat: feature.center[1],
        lng: feature.center[0]
      },
      placeId: feature.id
    }));
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return [];
  }
}; 