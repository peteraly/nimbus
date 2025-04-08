import { calculateWeatherScore } from '../services/weatherService';

export const calculateLocationWeatherScore = (weatherData) => {
  if (!weatherData) return 0;
  return calculateWeatherScore(weatherData.current || weatherData);
};

export const calculateWaypointDistances = (directionsData) => {
  if (!directionsData || !directionsData.routes || !directionsData.routes[0] || !directionsData.routes[0].legs) {
    return [];
  }

  // Extract distances and durations from route legs
  return directionsData.routes[0].legs.map(leg => ({
    distance: leg.distance / 1000, // Convert meters to kilometers
    duration: leg.duration // Duration in seconds
  }));
};

export const getOptimizedRoute = async (locations, weatherData, startLocation = null) => {
  try {
    // Ensure weatherData is an object
    const weatherDataObj = weatherData || {};
    
    // Remove duplicate locations by address
    const uniqueLocations = [];
    const seenAddresses = new Set();
    
    // Add start location to seen addresses if it exists
    if (startLocation && startLocation.address) {
      seenAddresses.add(startLocation.address);
    }
    
    // Filter out duplicate locations
    locations.forEach(location => {
      if (!seenAddresses.has(location.address)) {
        seenAddresses.add(location.address);
        uniqueLocations.push({
          ...location,
          weather: weatherDataObj[location.address] // Attach weather data to location
        });
      }
    });
    
    // Calculate weather scores for each location
    const locationsWithScores = uniqueLocations.map(location => ({
      ...location,
      weatherScore: calculateLocationWeatherScore(weatherDataObj[location.address])
    }));

    // Sort locations by weather score (highest to lowest)
    const sortedLocations = [...locationsWithScores].sort((a, b) => b.weatherScore - a.weatherScore);

    // Construct waypoints string for Mapbox Directions API
    let waypoints = '';
    
    // Add start location if provided
    if (startLocation) {
      waypoints = `${startLocation.lng},${startLocation.lat}`;
    }
    
    // Add destination locations
    const destinationWaypoints = sortedLocations.map(loc => `${loc.lng},${loc.lat}`).join(';');
    
    // Combine start and destinations
    waypoints = waypoints ? `${waypoints};${destinationWaypoints}` : destinationWaypoints;
    
    const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

    // Get directions from Mapbox
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&overview=full&annotations=distance,duration&access_token=${mapboxToken}`
    );
    const data = await response.json();

    if (data.code !== 'Ok') {
      throw new Error('Failed to get directions from Mapbox');
    }

    // Calculate distances between waypoints
    const waypointDistances = calculateWaypointDistances(data);

    // Transform the route data to match our application's format
    const route = {
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
      coordinates: data.routes[0].geometry.coordinates.map(coord => ({
        lat: coord[1],
        lng: coord[0]
      })),
      waypoints: []
    };

    // Add start location as first waypoint if provided
    if (startLocation) {
      route.waypoints.push({
        location: {
          ...startLocation,
          weather: weatherDataObj[startLocation.address] // Attach weather data to start location
        },
        weatherScore: calculateLocationWeatherScore(weatherDataObj[startLocation.address]),
        distance: 0,
        duration: 0
      });
    }

    // Add destination locations with their distances and weather data
    sortedLocations.forEach((loc, index) => {
      const distanceData = waypointDistances[index] || { distance: 0, duration: 0 };
      route.waypoints.push({
        location: {
          ...loc,
          weather: weatherDataObj[loc.address] // Attach weather data to location
        },
        weatherScore: loc.weatherScore,
        distance: distanceData.distance,
        duration: distanceData.duration
      });
    });

    // Calculate safety percentage based on weather scores
    const avgWeatherScore = route.waypoints.reduce((sum, wp) => sum + wp.weatherScore, 0) / route.waypoints.length;
    route.safetyPercentage = Math.round(avgWeatherScore * 100);

    return route;
  } catch (error) {
    console.error('Error calculating optimized route:', error);
    throw error;
  }
};

export const getNearbyPlaces = async (location, radius = 1000) => {
  try {
    const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?types=poi&radius=${radius}&access_token=${mapboxToken}`
    );
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