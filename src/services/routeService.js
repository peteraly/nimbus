import mapboxService from './mapboxService';
import { getWeatherData, getSunriseSunset } from './weatherService';
import { MAPBOX_ACCESS_TOKEN } from '../config/apiKeys';

// Constants
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = 3600;
const METERS_PER_KM = 1000;
const DEFAULT_VISIT_DURATION = 30; // minutes
const MAX_DRIVE_HOURS = 8;
const SITE_VISIT_START_HOUR = 7;
const SITE_VISIT_END_HOUR = 19;

// Core MVP constants
const DAILY_DRIVE_HOURS = 8;
const SITE_WORK_HOURS = { start: 7, end: 19 }; // 7 AM to 7 PM for site visits
const SITE_VISIT_MINUTES = DEFAULT_VISIT_DURATION;
const MAX_DRIVE_MINUTES = DAILY_DRIVE_HOURS * MINUTES_PER_HOUR;

// Constants for time calculations
const HOURS_PER_DAY = 24;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;

// Site visit parameters
const WORKING_HOURS_START = 8; // 8 AM
const WORKING_HOURS_END = 18;  // 6 PM
const MAX_DAILY_WORKING_HOURS = WORKING_HOURS_END - WORKING_HOURS_START;
const MIN_VISIT_DURATION = 30; // minutes

// Add new constant at the top with other constants
const MAX_SEGMENT_DISTANCE = 800000; // Maximum distance in meters between locations in a cluster

// Constants for daily limits
const MAX_DAILY_DISTANCE = 800000; // meters (800 km)
const MAX_DAILY_DURATION = 28800; // seconds (8 hours)
const MAX_LOCATIONS_PER_DAY = 10;

// Constants for time and weather calculations
const BUFFER_TIME_MINUTES = 30;
const REST_PERIOD_MINUTES = 45;
const WEATHER_UPDATE_INTERVAL_HOURS = 3;
const SPEED_FACTORS = {
  highway: 65, // mph
  urban: 35,   // mph
  rural: 45    // mph
};

// Weather scoring weights
const WEATHER_WEIGHTS = {
  wind: 0.4,
  precipitation: 0.3,
  visibility: 0.2,
  temperature: 0.1
};

// Constants for weather thresholds
const WEATHER_THRESHOLDS = {
  wind_speed: 15, // m/s (increased from 12)
  precipitation: 0.5, // mm/h (increased from 0.25)
  visibility: 3000, // meters (decreased from 5000)
  temperature: {
    min: -10, // °C (decreased from -5)
    max: 40  // °C (increased from 35)
  }
};

// Constants for route optimization
const OPTIMIZATION_WEIGHTS = {
  weather: 0.6,    // Weather safety is primary concern
  distance: 0.2,   // Distance is secondary
  timing: 0.2      // Timing (how soon we can visit) is equally important
};

// Constants for rest stops and accommodations
const REST_STOP_INTERVAL = 2.5 * 60 * 60; // 2.5 hours in seconds
const MAX_DETOUR_DISTANCE = 5; // miles
const AVERAGE_SPEED = 65; // mph

// Add new constants for route optimization
const MAX_LOCATIONS_PER_REQUEST = 25;
const MAX_WAYPOINTS_PER_ROUTE = 25;
const CHUNK_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Add new constants for clustering
const MAX_CLUSTER_SIZE = 25;
const MIN_CLUSTER_SIZE = 10;
const CLUSTER_DISTANCE_THRESHOLD = 500; // km - increased for cross-country routes

const debug = process.env.NODE_ENV === 'development';

const logDebug = (...args) => {
  if (debug) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

const logError = (...args) => {
  if (debug) {
    console.error(...args);
  }
};

/**
 * Validates a single coordinate value
 * @param {number} value - The coordinate value to validate
 * @param {string} type - Either 'latitude' or 'longitude'
 * @returns {boolean} Whether the coordinate is valid
 */
function isValidCoordinate(value, type) {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }
  
  if (type === 'latitude') {
    return value >= -90 && value <= 90;
  } else if (type === 'longitude') {
    return value >= -180 && value <= 180;
  }
  
  return false;
}

/**
 * Validates a location object has valid coordinates
 * @param {Object} location - The location object to validate
 * @returns {boolean} Whether the location has valid coordinates
 */
function hasValidCoordinates(location) {
  if (!location || typeof location !== 'object') {
    return false;
  }

  // Check for lat/lng or latitude/longitude properties
  const lat = location.lat ?? location.latitude;
  const lng = location.lng ?? location.longitude;

  return isValidCoordinate(lat, 'latitude') && isValidCoordinate(lng, 'longitude');
}

/**
 * Formats coordinates for Mapbox API
 * @param {Array} locations - Array of location objects
 * @returns {string} Formatted coordinates string
 */
function formatCoordinatesForMapbox(locations) {
  if (!Array.isArray(locations)) {
    throw new Error('Locations must be an array');
  }

  const validLocations = locations.filter(location => {
    if (!hasValidCoordinates(location)) {
      const address = location.address || 'Unknown address';
      logError(`Invalid coordinates for location: ${address}`);
      return false;
    }
    return true;
  });

  if (validLocations.length < 2) {
    throw new Error('At least 2 valid locations are required for route optimization');
  }

  return validLocations
    .map(location => {
      const lng = location.lng ?? location.longitude;
      const lat = location.lat ?? location.latitude;
      return `${lng.toFixed(6)},${lat.toFixed(6)}`;
    })
    .join(';');
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

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
  if (!weatherData?.current) return { score: 0, isSafe: false, warnings: ['No weather data available'] };

  const conditions = weatherData.current;
  const warnings = [];
  const details = {};
  let score = 100;
  let isSafe = true;
  
  // Wind assessment
  const windScore = assessWindConditions(conditions.wind_speed);
  score -= WEATHER_WEIGHTS.wind * (100 - windScore.score);
  if (!windScore.isSafe && windScore.score === 0) { // Only mark unsafe for severe conditions
    isSafe = false;
    warnings.push(windScore.warning);
  }
  details.wind = windScore;
  
  // Precipitation assessment
  const precipScore = assessPrecipitation(conditions.precipitation);
  score -= WEATHER_WEIGHTS.precipitation * (100 - precipScore.score);
  if (!precipScore.isSafe && precipScore.score === 0) { // Only mark unsafe for severe conditions
    isSafe = false;
    warnings.push(precipScore.warning);
  }
  details.precipitation = precipScore;
  
  // Visibility assessment
  const visibilityScore = assessVisibility(conditions.visibility);
  score -= WEATHER_WEIGHTS.visibility * (100 - visibilityScore.score);
  if (!visibilityScore.isSafe && visibilityScore.score === 0) {
    isSafe = false;
    warnings.push(visibilityScore.warning);
  }
  details.visibility = visibilityScore;
  
  // Temperature assessment
  const tempScore = assessTemperature(conditions.temperature);
  score -= WEATHER_WEIGHTS.temperature * (100 - tempScore.score);
  if (!tempScore.isSafe && tempScore.score === 0) {
    isSafe = false;
    warnings.push(tempScore.warning);
  }
  details.temperature = tempScore;

  return {
    score: Math.max(0, Math.round(score)),
    isSafe,
    warnings,
    details
  };
}

function assessWindConditions(windSpeed) {
  if (windSpeed > WEATHER_THRESHOLDS.wind_speed) {
    return {
      score: 0,
      isSafe: false,
      warning: `Unsafe wind conditions: ${windSpeed} m/s`
    };
  }
  if (windSpeed > WEATHER_THRESHOLDS.wind_speed) {
    return {
      score: 50,
      isSafe: true,
      warning: `High wind speed: ${windSpeed} m/s`
    };
  }
  return {
    score: 100 - (windSpeed / WEATHER_THRESHOLDS.wind_speed) * 50,
    isSafe: true
  };
}

function assessPrecipitation(precipitation) {
  if (precipitation > WEATHER_THRESHOLDS.precipitation) {
    return {
      score: 0,
      isSafe: false,
      warning: `Heavy precipitation: ${precipitation} mm/h`
    };
  }
  if (precipitation > WEATHER_THRESHOLDS.precipitation) {
    return {
      score: 50,
      isSafe: true,
      warning: `Moderate precipitation: ${precipitation} mm/h`
    };
  }
  return {
    score: 100 - (precipitation / WEATHER_THRESHOLDS.precipitation) * 50,
    isSafe: true
  };
}

function assessVisibility(visibility) {
  if (visibility < WEATHER_THRESHOLDS.visibility) {
    return {
      score: 0,
      isSafe: false,
      warning: `Poor visibility: ${visibility} m`
    };
  }
  if (visibility < WEATHER_THRESHOLDS.visibility) {
    return {
      score: 50,
      isSafe: true,
      warning: `Reduced visibility: ${visibility} m`
    };
  }
  return {
    score: 100 - ((WEATHER_THRESHOLDS.visibility - visibility) / WEATHER_THRESHOLDS.visibility) * 50,
    isSafe: true
  };
}

function assessTemperature(temp) {
  if (temp < WEATHER_THRESHOLDS.temperature.min || 
      temp > WEATHER_THRESHOLDS.temperature.max) {
    return {
      score: 0,
      isSafe: false,
      warning: `Extreme temperature: ${temp}°C`
    };
  }
  if (temp < WEATHER_THRESHOLDS.temperature.min) {
    return {
      score: 50,
      isSafe: true,
      warning: `Temperature warning: ${temp}°C`
    };
  }
  const optimalTemp = (WEATHER_THRESHOLDS.temperature.max + 
                      WEATHER_THRESHOLDS.temperature.min) / 2;
  const tempDiff = Math.abs(temp - optimalTemp);
  const maxDiff = WEATHER_THRESHOLDS.temperature.max - optimalTemp;
  return {
    score: 100 - (tempDiff / maxDiff) * 50,
    isSafe: true
  };
}

function generateWaypoints(startLat, startLng, endLat, endLng, maxDistance) {
  const totalDistance = calculateDistance(startLat, startLng, endLat, endLng);
  const numSegments = Math.ceil(totalDistance / (maxDistance * 0.8)); // Use 80% of max distance for safety
  const waypoints = [];

  for (let i = 1; i < numSegments; i++) {
    const fraction = i / numSegments;
    
    // Use great circle interpolation for accurate waypoints
    const δ = fraction * Math.acos(
      Math.sin(startLat * Math.PI/180) * Math.sin(endLat * Math.PI/180) +
      Math.cos(startLat * Math.PI/180) * Math.cos(endLat * Math.PI/180) *
      Math.cos((endLng - startLng) * Math.PI/180)
    );
    
    const A = Math.sin((1 - fraction) * δ) / Math.sin(δ);
    const B = Math.sin(fraction * δ) / Math.sin(δ);
    
    const x = A * Math.cos(startLat * Math.PI/180) * Math.cos(startLng * Math.PI/180) +
             B * Math.cos(endLat * Math.PI/180) * Math.cos(endLng * Math.PI/180);
    const y = A * Math.cos(startLat * Math.PI/180) * Math.sin(startLng * Math.PI/180) +
             B * Math.cos(endLat * Math.PI/180) * Math.sin(endLng * Math.PI/180);
    const z = A * Math.sin(startLat * Math.PI/180) + B * Math.sin(endLat * Math.PI/180);
    
    const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180/Math.PI;
    const lng = Math.atan2(y, x) * 180/Math.PI;
    
    waypoints.push({
      coordinates: [lng, lat],
      name: `Waypoint ${i} of ${numSegments-1}`,
      isWaypoint: true,
      type: 'waypoint'
    });
  }

  return waypoints;
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
        const numStops = Math.ceil(closest.distance / 2500000) - 1; // Use 2500km segments to stay well under limit
        
        if (numStops > 0) {
          // Generate intermediate waypoints
          const startLat = currentCoords[1];
          const startLng = currentCoords[0];
          const endCoords = validateAndFormatCoordinates(closest.location);
          const endLat = endCoords[1];
          const endLng = endCoords[0];
          
          // Calculate intermediate points using great circle path
          for (let i = 1; i <= numStops; i++) {
            const fraction = i / (numStops + 1);
            
            // Use spherical interpolation for more accurate waypoints
            const δ = fraction * Math.acos(
              Math.sin(startLat * Math.PI/180) * Math.sin(endLat * Math.PI/180) +
              Math.cos(startLat * Math.PI/180) * Math.cos(endLat * Math.PI/180) *
              Math.cos((endLng - startLng) * Math.PI/180)
            );
            
            const A = Math.sin((1 - fraction) * δ) / Math.sin(δ);
            const B = Math.sin(fraction * δ) / Math.sin(δ);
            
            const x = A * Math.cos(startLat * Math.PI/180) * Math.cos(startLng * Math.PI/180) +
                     B * Math.cos(endLat * Math.PI/180) * Math.cos(endLng * Math.PI/180);
            const y = A * Math.cos(startLat * Math.PI/180) * Math.sin(startLng * Math.PI/180) +
                     B * Math.cos(endLat * Math.PI/180) * Math.sin(endLng * Math.PI/180);
            const z = A * Math.sin(startLat * Math.PI/180) + B * Math.sin(endLat * Math.PI/180);
            
            const intermediateLat = Math.atan2(z, Math.sqrt(x * x + y * y)) * 180/Math.PI;
            const intermediateLng = Math.atan2(y, x) * 180/Math.PI;
            
            // Add intermediate waypoint with more descriptive name
            const distanceKm = Math.round(closest.distance / 1000);
            route.push({
              coordinates: [intermediateLng, intermediateLat],
              name: `Waypoint ${i} of ${numStops} (${distanceKm}km route)`,
              isWaypoint: true,
              type: 'waypoint'
            });

            // Verify distance to next point
            const nextCoords = i === numStops ? endCoords : [
              Math.atan2(y, x) * 180/Math.PI,
              Math.atan2(z, Math.sqrt(x * x + y * y)) * 180/Math.PI
            ];
            
            const segmentDistance = calculateDistance(
              intermediateLat, intermediateLng,
              nextCoords[1], nextCoords[0]
            );
            
            if (segmentDistance > MAX_SEGMENT_DISTANCE) {
              logDebug(`Warning: Generated waypoint still exceeds maximum distance. Adjusting...`);
              // Add an extra waypoint if needed
              const midLat = (intermediateLat + nextCoords[1]) / 2;
              const midLng = (intermediateLng + nextCoords[0]) / 2;
              route.push({
                coordinates: [midLng, midLat],
                name: `Extra Waypoint ${i}-${i+1}`,
                isWaypoint: true,
                type: 'waypoint'
              });
            }
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

      // Verify all segments are within limits
      for (let i = 1; i < route.length; i++) {
        const prevCoords = validateAndFormatCoordinates(route[i-1]);
        const currCoords = validateAndFormatCoordinates(route[i]);
        const segmentDistance = calculateDistance(
          prevCoords[1], prevCoords[0],
          currCoords[1], currCoords[0]
        );
        
        if (segmentDistance > MAX_SEGMENT_DISTANCE) {
          logDebug(`Warning: Found segment exceeding maximum distance. Adding extra waypoint.`);
          const midLat = (prevCoords[1] + currCoords[1]) / 2;
          const midLng = (prevCoords[0] + currCoords[0]) / 2;
          route.splice(i, 0, {
            coordinates: [midLng, midLat],
            name: `Extra Waypoint ${i}`,
            isWaypoint: true,
            type: 'waypoint'
          });
        }
      }
    }
    
    return route;
  } catch (error) {
    logError('Error calculating optimal route:', error);
    throw new Error('Failed to calculate route: ' + error.message);
  }
}

async function calculateWeatherOptimalRoute(locations, startingPoint) {
  if (!locations?.length || !startingPoint) {
    throw new Error('Valid locations and starting point required');
  }

  try {
    // Get 7-day weather forecast for all locations
    const weatherData = await Promise.allSettled(
      locations.map(async (loc) => {
        try {
          const coords = validateAndFormatCoordinates(loc);
          const data = await getWeatherData({
            coordinates: coords,
            address: loc.address || loc.name,
            days: 7 // Get full week forecast
          });
          
          // Calculate weather scores for each day
          const dailyScores = data.daily.map(day => {
            const score = calculateWeatherScore({ current: day });
            return {
              date: new Date(day.dt * 1000),
              score: score.score,
              isSafe: score.isSafe,
              warnings: score.warnings,
              conditions: {
                temp: day.temp,
                wind_speed: day.wind_speed,
                precipitation: day.precipitation,
                visibility: day.visibility
              }
            };
          });

          // Find all safe days (score >= 70 and no safety warnings)
          const safeDays = dailyScores.filter(day => day.isSafe && day.score >= 70);

          // Sort safe days by score (best weather first)
          safeDays.sort((a, b) => b.score - a.score);

          return {
            location: loc,
            weather: data,
            dailyScores,
            safeDays,
            hasSafeDays: safeDays.length > 0,
            bestDay: safeDays[0] || null,
            warnings: safeDays.length === 0 ? ['No safe weather days found this week'] : []
          };
        } catch (error) {
          logDebug(`Weather data unavailable for ${loc.name}:`, error);
          return {
            location: loc,
            weather: null,
            dailyScores: [],
            safeDays: [],
            hasSafeDays: false,
            bestDay: null,
            warnings: ['Weather data unavailable']
          };
        }
      })
    );

    // Process weather data results
    const processedLocations = weatherData.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      logError(`Failed to get weather data for location ${index}:`, result.reason);
      return {
        location: locations[index],
        weather: null,
        dailyScores: [],
        safeDays: [],
        hasSafeDays: false,
        bestDay: null,
        warnings: ['Failed to fetch weather data']
      };
    });

    // Filter out locations with no safe days in the week
    const locationsWithSafeDays = processedLocations.filter(item => item.hasSafeDays);
    const unsafeLocations = processedLocations.filter(item => !item.hasSafeDays);
    
    if (locationsWithSafeDays.length === 0) {
      throw new Error('No locations have safe weather conditions for drone operations this week.\nUnsafe conditions:\n' +
        unsafeLocations.map(loc => 
          `${loc.location.name}: ${loc.warnings.join(', ')}`
        ).join('\n')
      );
    }

    // Start with the specified starting point
    const route = [startingPoint];
    const unvisited = locationsWithSafeDays.filter(item => 
      item.location.address !== startingPoint.address
    );

    // Current date for planning
    let currentDate = new Date();
    currentDate.setHours(SITE_WORK_HOURS.start, 0, 0, 0);

    while (unvisited.length > 0) {
      const current = route[route.length - 1];
      const currentCoords = validateAndFormatCoordinates(current);

      // Score remaining locations based on:
      // 1. Weather score on available safe days
      // 2. Distance from current location
      // 3. How soon we can visit (prioritize earlier dates)
      const scoredLocations = unvisited.map(item => {
        const coords = validateAndFormatCoordinates(item.location);
        const distance = calculateDistance(
          currentCoords[1], currentCoords[0],
          coords[1], coords[0]
        );
        
        // Calculate travel time to this location
        const travelHours = distance / (65000); // Assuming 65 km/h average speed
        const estimatedArrival = new Date(
          currentDate.getTime() + travelHours * 60 * 60 * 1000
        );

        // Find the first safe day after our estimated arrival
        const availableDays = item.safeDays.filter(day => 
          day.date > estimatedArrival
        );

        if (availableDays.length === 0) {
          return null; // No safe days available after travel time
        }

        // Calculate distance score (inverse of distance - closer is better)
        const maxDistance = MAX_SEGMENT_DISTANCE;
        const distanceScore = Math.max(0, 100 * (1 - distance / maxDistance));
        
        // Calculate days until we can visit
        const daysUntilVisit = Math.ceil(
          (availableDays[0].date - currentDate) / (1000 * 60 * 60 * 24)
        );
        
        // Penalize locations that we can't visit soon
        const timingPenalty = Math.max(0.5, 1 - (daysUntilVisit * 0.1));
        
        // Combined score weighs:
        // - Weather conditions (50%)
        // - Distance (30%)
        // - Timing of visit (20%)
        const combinedScore = (
          (availableDays[0].score * 0.5) + 
          (distanceScore * 0.3) +
          (timingPenalty * 100 * 0.2)
        );
        
        return {
          ...item,
          distance,
          distanceScore,
          daysUntilVisit,
          plannedDate: availableDays[0].date,
          weatherConditions: availableDays[0].conditions,
          weatherScore: availableDays[0].score,
          warnings: availableDays[0].warnings,
          timingPenalty,
          combinedScore
        };
      }).filter(Boolean); // Remove any locations with no available safe days

      if (scoredLocations.length === 0) {
        throw new Error('No locations can be safely visited after accounting for travel times');
      }

      // Find best next location based on combined score
      const best = scoredLocations.reduce((max, loc) => 
        loc.combinedScore > max.combinedScore ? loc : max
      );

      // Update current date to account for travel time and site visit
      const travelHours = best.distance / (65000); // Assuming 65 km/h average speed
      currentDate = new Date(Math.max(
        currentDate.getTime() + (travelHours + SITE_VISIT_MINUTES/60) * 60 * 60 * 1000,
        best.plannedDate.getTime()
      ));

      // Add location with all weather and scoring details
      route.push({
        ...best.location,
        weather: best.weather,
        weatherScore: {
          score: best.weatherScore,
          isSafe: true, // We know it's safe because we filtered for safe days
          warnings: best.warnings,
          conditions: best.weatherConditions
        },
        plannedDate: best.plannedDate,
        distanceScore: best.distanceScore,
        combinedScore: best.combinedScore
      });

      // Remove selected location from unvisited
      const index = unvisited.findIndex(item => 
        item.location.address === best.location.address
      );
      if (index > -1) {
        unvisited.splice(index, 1);
      }
    }

    return route;
  } catch (error) {
    logError('Error calculating weather optimal route:', error);
    throw new Error('Failed to calculate weather-optimized route: ' + error.message);
  }
}

/**
 * Calculate time windows for site visits based on sunrise/sunset
 * @param {Object} location - Location object with coordinates
 * @param {Date} date - Date to calculate for
 * @returns {Object} - Available time windows
 */
async function calculateDaylightWindow(location, date) {
  const { sunrise, sunset } = await getSunriseSunset(location, date);
  return {
    start: sunrise,
    end: sunset
  };
}

async function findRestStops(route) {
  try {
    const segments = [];
    let totalTime = 0;
    let totalDistance = 0;

    // Calculate rest stops based on driving time
    for (let i = 0; i < route.legs.length; i++) {
      const leg = route.legs[i];
      const legDuration = leg.duration / 3600; // Convert to hours
      const legDistance = leg.distance / 1609.34; // Convert to miles

      // Add intermediate rest stops if leg is long
      const numStops = Math.floor(legDuration / 2.5);
      for (let j = 0; j < numStops; j++) {
        const stopPoint = {
          lat: leg.steps[Math.floor((j + 1) * leg.steps.length / (numStops + 1))].location[1],
          lng: leg.steps[Math.floor((j + 1) * leg.steps.length / (numStops + 1))].location[0]
        };

        // Simulate finding facilities (would be replaced with actual API calls)
        const facilities = ['Restrooms', 'Food', 'Parking'];
        if (Math.random() > 0.5) facilities.push('Gas Station');
        if (Math.random() > 0.7) facilities.push('EV Charging');

        segments.push({
          name: `Rest Stop ${segments.length + 1}`,
          restStop: {
            name: `Service Area ${segments.length + 1}`,
            facilities: facilities,
          },
          timeFromStart: totalTime + (legDuration * (j + 1) / (numStops + 1)) * 3600,
          distanceFromStart: totalDistance + (legDistance * (j + 1) / (numStops + 1)),
          alerts: []
        });
      }

      totalTime += legDuration * 3600;
      totalDistance += legDistance;
    }

    return segments;
  } catch (error) {
    console.error('Error finding rest stops:', error);
    return [];
  }
}

async function findAccommodations(location) {
  // Simulate finding accommodations (would be replaced with actual API calls)
  return [
    {
      name: 'Comfort Inn',
      distance: 0.8,
      price: 89
    },
    {
      name: 'Holiday Inn Express',
      distance: 1.2,
      price: 119
    },
    {
      name: 'Best Western',
      distance: 2.5,
      price: 99
    }
  ];
}

async function getTrafficAlerts(route) {
  // Simulate traffic alerts (would be replaced with actual API calls)
  const alerts = [];
  
  route.legs.forEach((leg, index) => {
    if (Math.random() > 0.7) {
      alerts.push({
        type: 'Construction',
        severity: 'medium',
        description: `Road work between mile ${Math.floor(Math.random() * 100)} and ${Math.floor(Math.random() * 100)}`,
        segment: index
      });
    }
    if (Math.random() > 0.8) {
      alerts.push({
        type: 'Traffic',
        severity: 'high',
        description: 'Heavy traffic expected during rush hour',
        segment: index
      });
    }
  });

  return alerts;
}

async function splitIntoDaily(routeData, locations) {
  try {
    if (!routeData?.routes?.[0]?.legs || !locations) {
      return {
        segments: [],
        summary: {
          totalLocations: 0,
          numberOfDays: 0,
          totalDistance: 0,
          totalDuration: 0,
          weatherSafety: true,
          weatherWarnings: []
        }
      };
    }

    const legs = routeData.routes[0].legs;
    const segments = [];
    let currentSegment = {
      dayNumber: 1,
      startTime: new Date(),
      endTime: new Date(),
      distance: 0,
      duration: 0,
      locations: [],
      weatherWarnings: []
    };

    let currentDistance = 0;
    let currentDuration = 0;
    let currentLocations = [];
    let weatherWarnings = [];

    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      const location = locations[i];
      
      // Get weather data for current location
      const weather = await getWeatherForecast(location.lat, location.lng);
      if (weather?.warnings?.length > 0) {
        weatherWarnings.push(...weather.warnings);
      }

      currentDistance += leg.distance;
      currentDuration += leg.duration;
      currentLocations.push(location);

      // Check if we should start a new segment (e.g., based on max daily distance or time)
      if (currentDistance >= MAX_DAILY_DISTANCE || currentDuration >= MAX_DAILY_DURATION) {
        segments.push({
          ...currentSegment,
          distance: currentDistance,
          duration: currentDuration,
          locations: [...currentLocations],
          weatherWarnings: [...weatherWarnings]
        });

        // Reset for next segment
        currentSegment.dayNumber++;
        currentDistance = 0;
        currentDuration = 0;
        currentLocations = [];
        weatherWarnings = [];
      }
    }

    // Add remaining locations to the last segment
    if (currentLocations.length > 0) {
      segments.push({
        ...currentSegment,
        distance: currentDistance,
        duration: currentDuration,
        locations: [...currentLocations],
        weatherWarnings: [...weatherWarnings]
      });
    }

    const summary = {
      totalLocations: locations.length,
      numberOfDays: segments.length,
      totalDistance: routeData.routes[0].distance,
      totalDuration: routeData.routes[0].duration,
      weatherSafety: weatherWarnings.length === 0,
      weatherWarnings: [...new Set(weatherWarnings)]
    };

    return { segments, summary };
  } catch (error) {
    logError('Error splitting route into daily segments:', error);
    throw error;
  }
}

/**
 * Split locations into smaller chunks for API requests
 */
function chunkLocations(locations, size = MAX_WAYPOINTS_PER_ROUTE) {
  const chunks = [];
  for (let i = 0; i < locations.length; i += size - 1) {
    const chunk = locations.slice(i, i + size);
    if (i > 0) {
      // Add the last location from previous chunk as first location in this chunk
      chunk.unshift(locations[i - 1]);
    }
    chunks.push(chunk);
  }
  return chunks;
}

/**
 * Calculate total distance for a sequence of locations
 */
function calculateTotalDistance(sequence) {
  if (!sequence || sequence.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < sequence.length - 1; i++) {
    const coords1 = validateAndFormatCoordinates(sequence[i]);
    const coords2 = validateAndFormatCoordinates(sequence[i + 1]);
    totalDistance += calculateDistance(coords1[1], coords1[0], coords2[1], coords2[0]);
  }
  
  return totalDistance;
}

/**
 * Calculate total time for a sequence of locations
 */
function calculateTotalTime(sequence) {
  if (!sequence || sequence.length < 2) return 0;
  
  let totalTime = 0;
  // Add visit duration for each location
  totalTime += sequence.length * DEFAULT_VISIT_DURATION;
  
  // Add travel time between locations
  const totalDistance = calculateTotalDistance(sequence);
  const travelTimeMinutes = totalDistance / (AVERAGE_SPEED * 1609.34); // Convert miles to meters
  
  return totalTime + travelTimeMinutes;
}

/**
 * Get route data for a sequence of locations with improved chunking
 */
async function getRouteData(locations) {
  if (!locations?.length) {
    throw new Error('No locations provided');
  }

  if (locations.length < 2) {
    throw new Error('At least two locations are required');
  }

  try {
    // Validate and format all coordinates first
    const validatedLocations = locations.map(location => {
      if (!location) {
        throw new Error('Invalid location object');
      }
      return {
        ...location,
        coordinates: validateAndFormatCoordinates(location)
      };
    });

    // Sort locations from west to east to help with routing
    const sortedLocations = [...validatedLocations].sort((a, b) => {
      return a.coordinates[0] - b.coordinates[0];
    });

    // Split into smaller chunks that Mapbox can handle
    const chunks = [];
    let currentChunk = [];

    for (let i = 0; i < sortedLocations.length; i++) {
      const location = sortedLocations[i];
      
      if (currentChunk.length === 0) {
        currentChunk.push(location);
        continue;
      }

      const lastLocation = currentChunk[currentChunk.length - 1];
      const distance = calculateDistance(
        lastLocation.coordinates[1], lastLocation.coordinates[0],
        location.coordinates[1], location.coordinates[0]
      );

      if (currentChunk.length >= MAX_WAYPOINTS_PER_ROUTE || distance > MAX_SEGMENT_DISTANCE) {
        if (currentChunk.length >= 2) {
          chunks.push([...currentChunk]);
        }
        currentChunk = [lastLocation, location];
      } else {
        currentChunk.push(location);
      }
    }

    if (currentChunk.length >= 2) {
      chunks.push([...currentChunk]);
    }

    // Ensure we have at least one valid chunk
    if (chunks.length === 0) {
      if (sortedLocations.length >= 2) {
        chunks.push(sortedLocations);
      } else {
        throw new Error('Not enough valid locations to create a route');
      }
    }

    // Process each chunk and combine routes
    let combinedRoute = {
      geometry: { coordinates: [] },
      legs: [],
      distance: 0,
      duration: 0
    };

    for (const chunk of chunks) {
      if (chunk.length < 2) continue;

      // Format coordinates for Mapbox
      const coordString = chunk
        .map(loc => loc.coordinates.join(','))
        .join(';');

      const chunkRoute = await mapboxService.getRoute(coordString);

      // Combine routes
      if (combinedRoute.geometry.coordinates.length > 0) {
        combinedRoute.geometry.coordinates.push(...chunkRoute.routes[0].geometry.coordinates.slice(1));
      } else {
        combinedRoute.geometry.coordinates = chunkRoute.routes[0].geometry.coordinates;
      }

      combinedRoute.legs.push(...chunkRoute.routes[0].legs);
      combinedRoute.distance += chunkRoute.routes[0].distance;
      combinedRoute.duration += chunkRoute.routes[0].duration;
    }

    if (combinedRoute.legs.length === 0) {
      throw new Error('Failed to generate any valid route segments');
    }

    return combinedRoute;
  } catch (error) {
    console.error('Error getting route:', error);
    throw new Error(`Failed to get route: ${error.message}`);
  }
}

/**
 * Generate a simple distance-optimized sequence using nearest neighbor
 */
function generateSimpleDistanceSequence(locations) {
  if (!locations?.length) return [];
  
  const sequence = [locations[0]];
  const remaining = locations.slice(1);

  while (remaining.length > 0) {
    const current = sequence[sequence.length - 1];
    const currentCoords = validateAndFormatCoordinates(current);

    // Find nearest location
    let nearest = null;
    let minDistance = Infinity;

    for (const location of remaining) {
      const coords = validateAndFormatCoordinates(location);
      const distance = calculateDistance(
        currentCoords[1], currentCoords[0],
        coords[1], coords[0]
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = location;
      }
    }

    sequence.push(nearest);
    const index = remaining.findIndex(loc => loc.address === nearest.address);
    remaining.splice(index, 1);
  }

  return sequence;
}

function clusterLocations(locations) {
  if (!locations || locations.length < 2) return [locations];

  // Sort locations by longitude to create geographical clusters
  const sortedLocations = [...locations].sort((a, b) => a.lng - b.lng);
  const clusters = [];
  let currentCluster = [sortedLocations[0]];
  
  for (let i = 1; i < sortedLocations.length; i++) {
    const current = sortedLocations[i];
    const prev = sortedLocations[i - 1];
    
    // Calculate distance between consecutive points
    const distance = calculateDistance(
      prev.lat, prev.lng,
      current.lat, current.lng
    );
    
    if (distance <= CLUSTER_DISTANCE_THRESHOLD) {
      currentCluster.push(current);
    } else {
      clusters.push(currentCluster);
      currentCluster = [current];
    }
  }
  
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  return clusters;
}

function optimizeClusterOrder(clusters, startLocation) {
  if (clusters.length <= 1) return clusters;

  // Calculate cluster centroids
  const centroids = clusters.map(cluster => {
    const avgLat = cluster.reduce((sum, loc) => sum + loc.lat, 0) / cluster.length;
    const avgLng = cluster.reduce((sum, loc) => sum + loc.lng, 0) / cluster.length;
    return { lat: avgLat, lng: avgLng };
  });

  // Sort clusters based on distance from start location and geographical progression
  return clusters.sort((a, b) => {
    const centroidA = centroids[clusters.indexOf(a)];
    const centroidB = centroids[clusters.indexOf(b)];
    
    // Consider both distance from start and longitude progression
    const distA = calculateDistance(startLocation.lat, startLocation.lng, centroidA.lat, centroidA.lng);
    const distB = calculateDistance(startLocation.lat, startLocation.lng, centroidB.lat, centroidB.lng);
    
    // Weight longitudinal progression more heavily for cross-country routes
    const longDiff = centroidA.lng - centroidB.lng;
    
    return distA + (longDiff * 100) - distB;
  });
}

function optimizeLocationsWithinCluster(locations, startLocation) {
  if (locations.length <= 2) return locations;

  // Initialize with start location
  const result = [startLocation];
  const remaining = locations.filter(loc => loc.id !== startLocation.id);
  
  while (remaining.length > 0) {
    const current = result[result.length - 1];
    let bestNext = null;
    let minIncrease = Infinity;
    
    // Find the location that adds minimum distance to the route
    for (const candidate of remaining) {
      let increase = calculateDistance(
        current.lat, current.lng,
        candidate.lat, candidate.lng
      );
      
      // If this isn't the last point, consider the impact on the total route
      if (remaining.length > 1) {
        const avgDistToOthers = remaining
          .filter(loc => loc !== candidate)
          .reduce((sum, loc) => sum + calculateDistance(
            candidate.lat, candidate.lng,
            loc.lat, loc.lng
          ), 0) / (remaining.length - 1);
        increase += avgDistToOthers * 0.5; // Weight factor for looking ahead
      }
      
      if (increase < minIncrease) {
        minIncrease = increase;
        bestNext = candidate;
      }
    }
    
    result.push(bestNext);
    remaining.splice(remaining.indexOf(bestNext), 1);
  }
  
  return result;
}

/**
 * Get optimized routes for a set of locations using nearest neighbor algorithm
 */
async function getOptimizedRoutes(locations) {
  if (!locations || locations.length < 2) {
    throw new Error('At least 2 locations are required for route optimization');
  }

  try {
    // Track included locations
    const includedLocations = new Set();
    const missingLocations = [];

    // Validate and format all locations upfront
    const validLocations = locations.map(location => {
      try {
        const [lng, lat] = validateAndFormatCoordinates(location);
        includedLocations.add(location.id);
        return {
          ...location,
          coordinates: [lng, lat]
        };
      } catch (error) {
        logError(`Invalid location skipped: ${location.address}`, error);
        missingLocations.push(location.address);
        return null;
      }
    }).filter(Boolean);

    if (validLocations.length < 2) {
      throw new Error('Not enough valid locations for route optimization');
    }

    // Find starting point (first location in the list)
    const startingPoint = validLocations[0];
    const unvisited = validLocations.slice(1);
    const optimizedSequence = [startingPoint];

    // Build route using nearest neighbor algorithm
    while (unvisited.length > 0) {
      const currentLocation = optimizedSequence[optimizedSequence.length - 1];
      const currentCoords = validateAndFormatCoordinates(currentLocation);
      
      // Find nearest unvisited location
      let nearestLocation = null;
      let shortestDistance = Infinity;

      for (const location of unvisited) {
        const coords = validateAndFormatCoordinates(location);
        const distance = calculateDistance(
          currentCoords[1], currentCoords[0],
          coords[1], coords[0]
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestLocation = location;
        }
      }

      // Add nearest location to sequence
      optimizedSequence.push(nearestLocation);
      
      // Remove from unvisited
      const index = unvisited.findIndex(loc => 
        loc.address === nearestLocation.address
      );
      unvisited.splice(index, 1);
    }

    // Get route data for optimized sequence
    const routeData = await getRouteDataWithRetry(optimizedSequence);
    
    // Create a single segment with all locations in optimized order
    const segment = {
      dayNumber: 1,
      startTime: new Date(),
      endTime: new Date(),
      distance: routeData.route.distance,
      duration: routeData.route.duration,
      locations: optimizedSequence
    };

    // Create summary
    const summary = {
      totalLocations: validLocations.length,
      includedLocations: Array.from(includedLocations),
      missingLocations,
      numberOfDays: 1,
      totalDistance: routeData.route.distance,
      totalDuration: routeData.route.duration
    };

    return {
      segments: [segment],
      summary,
      error: missingLocations.length > 0 ? 
        `Some locations could not be included: ${missingLocations.join(', ')}` : 
        null
    };
  } catch (error) {
    logError('Route optimization failed:', error);
    throw new Error(`Failed to optimize route: ${error.message}`);
  }
}

async function getRouteDataWithRetry(locations, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logDebug(`Retrying route calculation (attempt ${attempt}/${maxRetries})...`);
      
      // Validate locations
      if (!Array.isArray(locations) || locations.length < 2) {
        throw new Error('At least two valid locations are required for route calculation');
      }

      // Validate each location
      locations.forEach((location, index) => {
        logDebug('Validating location:', location);
        if (!location || typeof location.lng !== 'number' || typeof location.lat !== 'number') {
          throw new Error(`Invalid coordinates for location ${index + 1}: ${location?.address || 'Unknown location'}`);
        }
      });

      // Format coordinates string - Mapbox expects format: lng,lat;lng,lat
      const coordinates = locations
        .map(loc => `${loc.lng.toFixed(6)},${loc.lat.toFixed(6)}`)
        .join(';');

      // Build the Mapbox Directions API URL with minimal required parameters
      const baseUrl = 'https://api.mapbox.com/directions/v5/mapbox/driving/';
      const params = new URLSearchParams({
        access_token: MAPBOX_ACCESS_TOKEN,
        geometries: 'geojson',
        overview: 'full',
        steps: 'true',
        annotations: 'distance,duration'
      });

      const response = await fetch(`${baseUrl}${coordinates}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${data.message || response.statusText}`);
      }

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No routes found between the specified locations');
      }

      return {
        route: {
          geometry: data.routes[0].geometry,
          distance: data.routes[0].distance,
          duration: data.routes[0].duration,
          legs: data.routes[0].legs
        },
        waypoints: data.waypoints,
        summary: {
          totalLocations: locations.length,
          includedLocations: locations.length,
          totalDistance: data.routes[0].distance,
          totalDuration: data.routes[0].duration,
          numberOfDays: 1
        }
      };

    } catch (error) {
      lastError = error;
      logDebug(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to get route after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  throw lastError;
}

/**
 * Get weather forecast for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather forecast data
 */
async function getWeatherForecast(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=imperial`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Process weather data and extract warnings
    const warnings = [];
    
    // Check wind speed (over 20 mph is a warning)
    if (data.wind?.speed > 20) {
      warnings.push(`High winds: ${Math.round(data.wind.speed)} mph`);
    }
    
    // Check visibility (less than 5000 meters is a warning)
    if (data.visibility && data.visibility < 5000) {
      warnings.push(`Low visibility: ${(data.visibility / 1000).toFixed(1)} km`);
    }
    
    // Check temperature (below 32°F or above 95°F is a warning)
    if (data.main?.temp) {
      if (data.main.temp < 32) {
        warnings.push(`Low temperature: ${Math.round(data.main.temp)}°F`);
      } else if (data.main.temp > 95) {
        warnings.push(`High temperature: ${Math.round(data.main.temp)}°F`);
      }
    }
    
    // Check precipitation
    if (data.rain?.['1h'] > 0.1 || data.snow?.['1h'] > 0.1) {
      warnings.push('Precipitation detected');
    }

    return {
      temperature: data.main?.temp,
      wind: data.wind?.speed,
      visibility: data.visibility,
      description: data.weather?.[0]?.description,
      warnings
    };
  } catch (error) {
    logError('Error fetching weather data:', error);
    return {
      warnings: ['Weather data unavailable']
    };
  }
}

/**
 * Validates and formats coordinates for a location
 * @param {Object} location - Location object with coordinates
 * @returns {Array} [longitude, latitude] array
 */
function validateAndFormatCoordinates(location) {
  if (!location) {
    throw new Error('Location is required');
  }

  // Try different coordinate formats
  let lng, lat;

  // Check for lat/lng format
  if (typeof location.lng !== 'undefined' && typeof location.lat !== 'undefined') {
    lng = location.lng;
    lat = location.lat;
  }
  // Check for latitude/longitude format
  else if (typeof location.longitude !== 'undefined' && typeof location.latitude !== 'undefined') {
    lng = location.longitude;
    lat = location.latitude;
  }
  // Check for coordinates array format
  else if (Array.isArray(location.coordinates) && location.coordinates.length === 2) {
    [lng, lat] = location.coordinates;
  }
  else {
    throw new Error(`Invalid coordinates for location: ${location.address || 'Unknown location'}`);
  }

  // Validate coordinate values
  if (!isValidCoordinate(lng, 'longitude') || !isValidCoordinate(lat, 'latitude')) {
    throw new Error(`Invalid coordinate values for location: ${location.address || 'Unknown location'}`);
  }

  return [lng, lat];
}

export {
  getOptimizedRoutes,
  calculateDistance,
  calculateTotalDistance,
  calculateTotalTime
}; 