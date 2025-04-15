import { MAPBOX_ACCESS_TOKEN } from '../config/apiKeys';

const MAX_DISTANCE_KM = 3000; // Increased maximum distance between consecutive points

/**
 * Calculate the distance between two points using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Gets a route between multiple points using Mapbox Directions API
 * @param {string} coordinates - Semicolon-separated coordinates "lng,lat;lng,lat;..."
 * @returns {Promise<Object>} - Route data from Mapbox
 */
const getRoute = async (coordinates) => {
  if (!coordinates) {
    throw new Error('No coordinates provided');
  }

  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error('Mapbox access token is missing');
  }

  // Validate distances between consecutive points
  const coordPairs = coordinates.split(';').map(coord => coord.split(',').map(Number));
  
  for (let i = 0; i < coordPairs.length - 1; i++) {
    const [lon1, lat1] = coordPairs[i];
    const [lon2, lat2] = coordPairs[i + 1];
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    
    if (distance > MAX_DISTANCE_KM) {
      throw new Error(
        `The distance between points ${i + 1} and ${i + 2} is ${Math.round(distance)}km, ` +
        `which exceeds the maximum allowed distance of ${MAX_DISTANCE_KM}km. ` +
        `Consider adding intermediate stops between these locations.`
      );
    }
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?` +
      `geometries=geojson&` +
      `overview=full&` +
      `access_token=${MAPBOX_ACCESS_TOKEN}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error('Invalid Mapbox access token');
      } else if (response.status === 422) {
        throw new Error(
          'Unable to create route between these locations. ' +
          'The distance may be too great or the locations may be inaccessible by road. ' +
          'Try adding intermediate stops or checking if all locations are accessible by car.'
        );
      }
      throw new Error(errorData.message || `Failed to fetch route from Mapbox: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new Error('No routes found between the specified locations. Try adjusting your route or adding intermediate stops.');
    }

    const route = data.routes[0];
    if (!route.geometry || !route.geometry.coordinates || !Array.isArray(route.geometry.coordinates)) {
      throw new Error('Invalid route geometry in Mapbox response');
    }

    if (typeof route.distance !== 'number' || typeof route.duration !== 'number') {
      throw new Error('Invalid route metrics in Mapbox response');
    }

    return {
      routes: [{
        geometry: route.geometry,
        distance: route.distance,
        duration: route.duration,
        legs: route.legs || []
      }]
    };
  } catch (error) {
    console.error('Error fetching route from Mapbox:', error);
    throw error instanceof Error ? error : new Error('Failed to process route data');
  }
};

export { getRoute, calculateDistance, MAX_DISTANCE_KM }; 