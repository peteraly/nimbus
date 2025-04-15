import { getRoute } from './mapboxService';
import { getWeatherData, getSunriseSunset } from './weatherService';

// Constants
const SITE_VISIT_MINUTES = 30;
const MAX_DRIVE_MINUTES = 8 * 60; // 8 hours in minutes

// Core MVP constants
const DAILY_DRIVE_HOURS = 8;
const SITE_WORK_HOURS = { start: 7, end: 19 }; // 7 AM to 7 PM for site visits

// Constants for time calculations
const HOURS_PER_DAY = 8;
const SITE_VISIT_DURATION = 30; // minutes
const MAX_SEGMENTS = 100; // Safety limit

// Add new constant at the top with other constants
const MAX_SEGMENT_DISTANCE = 2800000; // 2800 km in meters (leaving buffer below Mapbox's 3000km limit)

/**
 * Validates and formats location coordinates
 * @param {Object} location - Location object
 * @returns {Array} - [longitude, latitude] array
 */
function validateAndFormatCoordinates(location) {
  if (!location) {
    throw new Error('Location object is required');
  }

  try {
    // Handle case where coordinates might be nested in a result object
    const coordsObj = location.coordinates || location;

    // Case 1: Already in [lng, lat] array format
    if (Array.isArray(coordsObj)) {
      if (coordsObj.length === 2 && !isNaN(coordsObj[0]) && !isNaN(coordsObj[1])) {
        return coordsObj;
      }
    }

    // Case 2: String format "lat,lng" or "lng,lat"
    if (typeof coordsObj === 'string') {
      const parts = coordsObj.split(',').map(part => part.trim());
      if (parts.length === 2) {
        const [first, second] = parts.map(Number);
        if (!isNaN(first) && !isNaN(second)) {
          // Assume longitude comes first in our format
          return [first, second];
        }
      }
    }

    // Case 3: Object format
    if (typeof coordsObj === 'object') {
      // Try lat/lng format
      if ('lat' in coordsObj && 'lng' in coordsObj) {
        const lat = parseFloat(coordsObj.lat);
        const lng = parseFloat(coordsObj.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lng, lat];
        }
      }

      // Try latitude/longitude format
      if ('latitude' in coordsObj && 'longitude' in coordsObj) {
        const lat = parseFloat(coordsObj.latitude);
        const lng = parseFloat(coordsObj.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          return [lng, lat];
        }
      }
    }

    console.error('Invalid coordinates format:', location);
    throw new Error(`Invalid coordinates format for location: ${location.name || location.address || 'Unknown'}`);
  } catch (error) {
    console.error('Error processing coordinates:', error);
    throw new Error(`Failed to process coordinates for location: ${location.name || location.address || 'Unknown'}`);
  }
}

/**
 * Format coordinates for Mapbox API
 * @param {Array} locations - Array of location objects
 * @returns {string} Formatted coordinates string
 */
function formatCoordinatesForMapbox(locations) {
  if (!locations || !Array.isArray(locations) || locations.length < 2) {
    throw new Error('At least two valid locations are required');
  }

  try {
    const validLocations = locations.filter(loc => loc && (loc.coordinates || (loc.lat && loc.lng) || (loc.latitude && loc.longitude)));
    
    if (validLocations.length < 2) {
      throw new Error('At least two locations with valid coordinates are required');
    }

    const coordinateString = validLocations
      .map(location => {
        const coords = validateAndFormatCoordinates(location);
        return coords.join(',');
      })
      .join(';');

    if (!coordinateString.includes(';')) {
      throw new Error('Failed to generate valid coordinate string');
    }

    return coordinateString;
  } catch (error) {
    console.error('Error formatting coordinates:', error);
    throw new Error('Failed to format coordinates: ' + error.message);
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
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
}

/**
 * Calculate weather score based on conditions
 */
function calculateWeatherScore(weatherData) {
  if (!weatherData || !weatherData.current) {
    return 0;
  }

  const conditions = weatherData.current;
  let score = 100;
  
  // Reduce score for adverse conditions
  if (conditions.wind_speed > 15) score -= 20;
  if (conditions.rain > 0) score -= 30;
  if (conditions.visibility < 5000) score -= 25;
  if (conditions.temp < 0 || conditions.temp > 35) score -= 15;
  
  return Math.max(0, score);
}

async function calculateDistanceOptimalRoute(locations, startingPoint) {
  if (!locations?.length || !startingPoint) {
    throw new Error('Valid locations and starting point required');
  }

  try {
    // Start with the specified starting point
    const route = [startingPoint];
    const unvisited = locations.filter(loc => 
      loc.address !== startingPoint.address
    );

    // Calculate daily segments based on constraints
    while (unvisited.length > 0) {
      const current = route[route.length - 1];
      const currentCoords = validateAndFormatCoordinates(current);
      
      // Find locations reachable within distance and time constraints
      const reachableLocations = unvisited.map(loc => {
        const coords = validateAndFormatCoordinates(loc);
        const distance = calculateDistance(
          currentCoords[1], currentCoords[0],
          coords[1], coords[0]
        );
        const estimatedDriveTime = distance / 65000; // Rough estimate: 65 km/h average speed
        return {
          location: loc,
          distance,
          driveTime: estimatedDriveTime
        };
      }).filter(loc => 
        loc.distance <= MAX_SEGMENT_DISTANCE && // Check distance constraint
        loc.driveTime <= DAILY_DRIVE_HOURS * 60 // Check time constraint
      );

      if (reachableLocations.length === 0) {
        // Find closest unreachable location
        const closest = unvisited
          .map(loc => {
            const coords = validateAndFormatCoordinates(loc);
            return {
              location: loc,
              distance: calculateDistance(
                currentCoords[1], currentCoords[0],
                coords[1], coords[0]
              )
            };
          })
          .reduce((min, loc) => loc.distance < min.distance ? loc : min);

        // Calculate number of needed intermediate stops
        const numStops = Math.ceil(closest.distance / MAX_SEGMENT_DISTANCE) - 1;
        
        if (numStops > 0) {
          // Generate intermediate waypoints
          const startLat = currentCoords[1];
          const startLng = currentCoords[0];
          const endCoords = validateAndFormatCoordinates(closest.location);
          const endLat = endCoords[1];
          const endLng = endCoords[0];
          
          for (let i = 1; i <= numStops; i++) {
            const fraction = i / (numStops + 1);
            const intermediateLat = startLat + (endLat - startLat) * fraction;
            const intermediateLng = startLng + (endLng - startLng) * fraction;
            
            // Add intermediate waypoint
            route.push({
              coordinates: [intermediateLng, intermediateLat],
              name: `Waypoint ${i}`,
              isWaypoint: true
            });
          }
        }

        // Add the destination after waypoints
        route.push(closest.location);
        unvisited.splice(unvisited.findIndex(loc => 
          loc.address === closest.location.address
        ), 1);
      } else {
        // Find nearest reachable location
        const nearest = reachableLocations.reduce((min, loc) => 
          loc.distance < min.distance ? loc : min
        );
        
        route.push(nearest.location);
        unvisited.splice(unvisited.findIndex(loc => 
          loc.address === nearest.location.address
        ), 1);
      }
    }
    
    return route;
  } catch (error) {
    console.error('Error calculating optimal route:', error);
    throw new Error('Failed to calculate route: ' + error.message);
  }
}

async function calculateWeatherOptimalRoute(locations, startingPoint) {
  if (!locations?.length || !startingPoint) {
    throw new Error('Valid locations and starting point required');
  }

  try {
    // Get weather data for all locations
    const weatherData = await Promise.all(
      locations.map(async (loc) => {
        try {
          const coords = validateAndFormatCoordinates(loc);
          const data = await getWeatherData({
            coordinates: coords,
            address: loc.address || loc.name
          });
          return {
            location: loc,
            weather: data
          };
        } catch (error) {
          console.warn(`Weather data unavailable for ${loc.name}:`, error);
          return {
            location: loc,
            weather: null
          };
        }
      })
    );

    // Start with the specified starting point
    const route = [startingPoint];
    const unvisited = weatherData.filter(item => 
      item.location.address !== startingPoint.address
    );

    while (unvisited.length > 0) {
      const current = route[route.length - 1];
      const currentCoords = validateAndFormatCoordinates(current);

      // Score each remaining location based on weather and distance
      const scoredLocations = unvisited.map(item => {
        const coords = validateAndFormatCoordinates(item.location);
        const distance = calculateDistance(
          currentCoords[1], currentCoords[0],
          coords[1], coords[0]
        );
        
        // Calculate weather score
        const weatherScore = item.weather ? calculateWeatherScore(item.weather) : 50;
        
        // Calculate distance score (inverse of distance - closer is better)
        const maxDistance = MAX_SEGMENT_DISTANCE;
        const distanceScore = Math.max(0, 100 * (1 - distance / maxDistance));
        
        // Heavily penalize distances over the maximum
        const distancePenalty = distance > MAX_SEGMENT_DISTANCE ? 0.1 : 1;
        
        // Combined score weighs both weather and distance
        const combinedScore = (weatherScore * 0.7 + distanceScore * 0.3) * distancePenalty;
        
        return {
          location: item.location,
          distance,
          weatherScore,
          distanceScore,
          combinedScore
        };
      });

      // Find best next location based on combined score
      const best = scoredLocations.reduce((max, loc) => 
        loc.combinedScore > max.combinedScore ? loc : max
      );

      // If best location is too far, add intermediate waypoints
      if (best.distance > MAX_SEGMENT_DISTANCE) {
        const endCoords = validateAndFormatCoordinates(best.location);
        const numStops = Math.ceil(best.distance / MAX_SEGMENT_DISTANCE) - 1;
        
        for (let i = 1; i <= numStops; i++) {
          const fraction = i / (numStops + 1);
          const intermediateLat = currentCoords[1] + (endCoords[1] - currentCoords[1]) * fraction;
          const intermediateLng = currentCoords[0] + (endCoords[0] - currentCoords[0]) * fraction;
          
          route.push({
            coordinates: [intermediateLng, intermediateLat],
            name: `Waypoint ${i}`,
            isWaypoint: true
          });
        }
      }

      route.push(best.location);
      unvisited.splice(unvisited.findIndex(item => 
        item.location.address === best.location.address
      ), 1);
    }

    return route;
  } catch (error) {
    console.error('Error calculating weather optimal route:', error);
    throw new Error('Failed to calculate weather-optimized route: ' + error.message);
  }
}

/**
 * Calculate time windows for site visits based on sunrise/sunset
 * @param {Object} location - Location object with coordinates
 * @param {Date} date - Date to calculate for
 * @returns {Object} - Available time windows
 */
export async function calculateDaylightWindow(location, date) {
  const { sunrise, sunset } = await getSunriseSunset(location, date);
  return {
    start: sunrise,
    end: sunset
  };
}

function splitIntoDaily(routeData, locations) {
  if (!routeData || !locations || !Array.isArray(locations)) {
    throw new Error('Invalid input data for splitting route');
  }

  const segments = [];
  let currentSegment = {
    locations: [],
    distance: 0,
    duration: 0,
    startTime: null,
    endTime: null,
    dayNumber: 1
  };

  let locationIndex = 0;
  let segmentCount = 0;
  const visitDurationMs = SITE_VISIT_DURATION * 60 * 1000; // Convert to milliseconds
  const maxDailyDriveMs = DAILY_DRIVE_HOURS * 60 * 60 * 1000; // 8 hours in milliseconds

  while (locationIndex < locations.length && segmentCount < MAX_SEGMENTS) {
    const currentLocation = locations[locationIndex];
    
    if (!currentLocation) {
      throw new Error(`Invalid location at index ${locationIndex}`);
    }

    // Get the route leg for distance/duration info
    const leg = routeData.legs?.[locationIndex > 0 ? locationIndex - 1 : 0];
    const nextLeg = routeData.legs?.[locationIndex];

    // Initialize start time for first segment
    if (segmentCount === 0 && locationIndex === 0) {
      const sunrise = new Date(currentLocation.sunrise || new Date().setHours(7, 0, 0, 0));
      currentSegment.startTime = sunrise;
      currentSegment.locations.push({
        ...currentLocation,
        distanceToNext: nextLeg?.distance || 0,
        durationToNext: nextLeg?.duration || 0,
        arrivalTime: sunrise,
        departureTime: new Date(sunrise.getTime() + visitDurationMs),
        weather: currentLocation.weather || null
      });
      locationIndex++;
      continue;
    }

    // Calculate time needed for next location
    const travelTime = leg?.duration || 0;
    const totalTimeNeeded = travelTime + visitDurationMs;

    // Get current time in segment
    const currentTime = new Date(currentSegment.startTime);
    currentTime.setMilliseconds(currentTime.getMilliseconds() + currentSegment.duration);

    // Calculate arrival and departure times
    const arrivalTime = new Date(currentTime.getTime() + (leg?.duration || 0) * 1000);
    const departureTime = new Date(arrivalTime.getTime() + visitDurationMs);

    // Check if we can fit this location in current day
    const dayStartTime = new Date(currentSegment.startTime);
    const dayEndTime = new Date(dayStartTime.getTime() + maxDailyDriveMs);

    if (departureTime > dayEndTime || currentSegment.duration + totalTimeNeeded > maxDailyDriveMs) {
      // Start new segment
      if (currentSegment.locations.length > 0) {
        segments.push({
          ...currentSegment,
          endTime: new Date(currentTime)
        });
        segmentCount++;
      }

      // Initialize next segment
      const nextDayStart = new Date(currentLocation.sunrise || new Date(currentTime).setHours(7, 0, 0, 0));
      nextDayStart.setDate(currentTime.getDate() + 1);
      
      currentSegment = {
        locations: [{
          ...currentLocation,
          distanceToNext: nextLeg?.distance || 0,
          durationToNext: nextLeg?.duration || 0,
          arrivalTime: nextDayStart,
          departureTime: new Date(nextDayStart.getTime() + visitDurationMs),
          weather: currentLocation.weather || null
        }],
        distance: 0,
        duration: visitDurationMs,
        startTime: nextDayStart,
        dayNumber: segments.length + 1
      };
    } else {
      // Add location to current segment
      currentSegment.locations.push({
        ...currentLocation,
        distanceToNext: nextLeg?.distance || 0,
        durationToNext: nextLeg?.duration || 0,
        arrivalTime,
        departureTime,
        weather: currentLocation.weather || null
      });
      currentSegment.distance += leg?.distance || 0;
      currentSegment.duration += totalTimeNeeded;
    }

    locationIndex++;
  }

  // Add final segment
  if (currentSegment.locations.length > 0) {
    const finalTime = new Date(currentSegment.startTime);
    finalTime.setMilliseconds(finalTime.getMilliseconds() + currentSegment.duration);
    
    // Update the last location to show 0 for next distance/duration
    const lastLocationIndex = currentSegment.locations.length - 1;
    if (lastLocationIndex >= 0) {
      currentSegment.locations[lastLocationIndex] = {
        ...currentSegment.locations[lastLocationIndex],
        distanceToNext: 0,
        durationToNext: 0
      };
    }
    
    segments.push({
      ...currentSegment,
      endTime: finalTime
    });
  }

  if (segmentCount >= MAX_SEGMENTS) {
    throw new Error('Route exceeds maximum number of segments');
  }

  // Calculate actual driving hours (excluding site visits)
  const actualDrivingDuration = segments.reduce((total, segment) => {
    const segmentDriveTime = segment.locations.reduce((sum, loc) => 
      sum + (loc.durationToNext || 0), 0);
    return total + segmentDriveTime;
  }, 0);

  return {
    segments,
    totalDistance: segments.reduce((sum, seg) => sum + seg.distance, 0),
    totalDuration: actualDrivingDuration,
    numberOfDays: segments.length
  };
}

/**
 * Get optimized routes with both distance and weather options
 * @param {Array} locations - Array of location objects
 * @returns {Promise<Object>} - Object containing both route options
 */
export async function getOptimizedRoutes(locations) {
  if (!locations?.length || locations.length < 2) {
    throw new Error('At least 2 valid locations are required');
  }

  if (locations.length > 50) {
    throw new Error('Maximum number of locations exceeded (limit: 50)');
  }

  try {
    // Use first location as starting point
    const startingPoint = locations[0];

    // Calculate distance-optimized route
    const distanceRoute = await calculateDistanceOptimalRoute(locations, startingPoint);
    const distanceRouteString = formatCoordinatesForMapbox(distanceRoute);
    const distanceRouteData = await getRoute(distanceRouteString);
    
    if (!distanceRouteData?.routes?.[0]) {
      throw new Error('Failed to get distance-optimized route data');
    }

    // Calculate weather-optimized route
    const weatherRoute = await calculateWeatherOptimalRoute(locations, startingPoint);
    const weatherRouteString = formatCoordinatesForMapbox(weatherRoute);
    const weatherRouteData = await getRoute(weatherRouteString);
    
    if (!weatherRouteData?.routes?.[0]) {
      throw new Error('Failed to get weather-optimized route data');
    }

    // Split routes into daily segments
    const distanceSegments = splitIntoDaily(distanceRouteData.routes[0], distanceRoute);
    const weatherSegments = splitIntoDaily(weatherRouteData.routes[0], weatherRoute);

    return {
      distanceOptimized: {
        segments: distanceSegments.segments,
        totalDistance: distanceSegments.totalDistance,
        totalDuration: distanceSegments.totalDuration,
        numberOfDays: distanceSegments.numberOfDays,
        geometry: distanceRouteData.routes[0].geometry
      },
      weatherOptimized: {
        segments: weatherSegments.segments,
        totalDistance: weatherSegments.totalDistance,
        totalDuration: weatherSegments.totalDuration,
        numberOfDays: weatherSegments.numberOfDays,
        geometry: weatherRouteData.routes[0].geometry
      }
    };
  } catch (error) {
    console.error('Error optimizing routes:', error);
    throw new Error(`Route generation failed: ${error.message}`);
  }
}

export {
  DAILY_DRIVE_HOURS,
  SITE_VISIT_MINUTES,
  SITE_WORK_HOURS,
  MAX_DRIVE_MINUTES
}; 