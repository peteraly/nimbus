import { MAPBOX_ACCESS_TOKEN } from '../config/apiKeys';

const MAX_DISTANCE_KM = 3000;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getRoute = async (coordinates) => {
  if (!coordinates) throw new Error('No coordinates provided');
  if (!MAPBOX_ACCESS_TOKEN) throw new Error('Mapbox access token is missing');

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Invalid Mapbox access token');
    } else if (response.status === 422) {
      throw new Error('Unable to create route between these locations. Try adding intermediate stops.');
    }
    throw new Error(errorData.message || `Failed to fetch route: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.routes?.length) throw new Error('No routes found between the specified locations');
  
  const route = data.routes[0];
  return {
    routes: [{
      geometry: route.geometry,
      distance: route.distance,
      duration: route.duration,
      legs: route.legs || []
    }]
  };
};

const geocodeAddress = async (address) => {
  if (!address) throw new Error('Address is required');
  
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Geocoding failed: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.features?.length) {
    throw new Error(`No results found for address: ${address}`);
  }
  
  return {
    coordinates: data.features[0].center,
    place_name: data.features[0].place_name
  };
};

const mapboxService = {
  getRoute,
  calculateDistance,
  MAX_DISTANCE_KM,
  geocodeAddress
};

export default mapboxService; 