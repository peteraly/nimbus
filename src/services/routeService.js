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
const WORKING_HOURS_END = 18; // 6 PM
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
  urban: 35, // mph
  rural: 45, // mph
};

// Weather scoring weights
const WEATHER_WEIGHTS = {
  wind: 0.4,
  precipitation: 0.3,
  visibility: 0.2,
  temperature: 0.1,
};

// Constants for weather thresholds
const WEATHER_THRESHOLDS = {
  wind_speed: 15, // m/s
  precipitation: 0.5, // mm/h
  visibility: 3000, // meters
  temperature: {
    min: -10, // °C
    max: 40, // °C
  },
};

// Constants for route optimization
const OPTIMIZATION_WEIGHTS = {
  weather: 0.6, // Weather safety is primary concern
  distance: 0.2, // Distance is secondary
  timing: 0.2, // Timing (how soon we can visit) is equally important
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

// Constants for route planning
const MAX_DAILY_DRIVE_HOURS = 8;
const MAX_DAILY_DRIVE_SECONDS = MAX_DAILY_DRIVE_HOURS * 3600;
const REST_STOP_INTERVAL_HOURS = 4; // Recommend rest stop every 4 hours
const REST_STOP_INTERVAL_SECONDS = REST_STOP_INTERVAL_HOURS * 3600;
const MIN_REST_DURATION_MINUTES = 30;

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
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Calculate weather score based on conditions
 */
function calculateWeatherScore(weatherData) {
  if (!weatherData?.current)
    return { score: 0, isSafe: false, warnings: ['No weather data available'] };

  const conditions = weatherData.current;
  const warnings = [];
  const details = {};
  let score = 100;
  let isSafe = true;

  // Wind assessment
  const windScore = assessWindConditions(conditions.wind_speed);
  score -= WEATHER_WEIGHTS.wind * (100 - windScore.score);
  if (!windScore.isSafe && windScore.score === 0) {
    // Only mark unsafe for severe conditions
    isSafe = false;
    warnings.push(windScore.warning);
  }
  details.wind = windScore;

  // Precipitation assessment
  const precipScore = assessPrecipitation(conditions.precipitation);
  score -= WEATHER_WEIGHTS.precipitation * (100 - precipScore.score);
  if (!precipScore.isSafe && precipScore.score === 0) {
    // Only mark unsafe for severe conditions
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
    details,
  };
}

function assessWindConditions(windSpeed) {
  if (windSpeed > WEATHER_THRESHOLDS.wind_speed) {
    return {
      score: 0,
      isSafe: false,
      warning: `Unsafe wind conditions: ${windSpeed} m/s`,
    };
  }
  if (windSpeed > WEATHER_THRESHOLDS.wind_speed) {
    return {
      score: 50,
      isSafe: true,
      warning: `High wind speed: ${windSpeed} m/s`,
    };
  }
  return {
    score: 100 - (windSpeed / WEATHER_THRESHOLDS.wind_speed) * 50,
    isSafe: true,
  };
}

function assessPrecipitation(precipitation) {
  if (precipitation > WEATHER_THRESHOLDS.precipitation) {
    return {
      score: 0,
      isSafe: false,
      warning: `Heavy precipitation: ${precipitation} mm/h`,
    };
  }
  if (precipitation > WEATHER_THRESHOLDS.precipitation) {
    return {
      score: 50,
      isSafe: true,
      warning: `Moderate precipitation: ${precipitation} mm/h`,
    };
  }
  return {
    score: 100 - (precipitation / WEATHER_THRESHOLDS.precipitation) * 50,
    isSafe: true,
  };
}

function assessVisibility(visibility) {
  if (visibility < WEATHER_THRESHOLDS.visibility) {
    return {
      score: 0,
      isSafe: false,
      warning: `Poor visibility: ${visibility} m`,
    };
  }
  if (visibility < WEATHER_THRESHOLDS.visibility) {
    return {
      score: 50,
      isSafe: true,
      warning: `Reduced visibility: ${visibility} m`,
    };
  }
  return {
    score:
      100 - ((WEATHER_THRESHOLDS.visibility - visibility) / WEATHER_THRESHOLDS.visibility) * 50,
    isSafe: true,
  };
}

function assessTemperature(temp) {
  if (temp < WEATHER_THRESHOLDS.temperature.min || temp > WEATHER_THRESHOLDS.temperature.max) {
    return {
      score: 0,
      isSafe: false,
      warning: `Extreme temperature: ${temp}°C`,
    };
  }
  if (temp < WEATHER_THRESHOLDS.temperature.min) {
    return {
      score: 50,
      isSafe: true,
      warning: `Temperature warning: ${temp}°C`,
    };
  }
  const optimalTemp = (WEATHER_THRESHOLDS.temperature.max + WEATHER_THRESHOLDS.temperature.min) / 2;
  const tempDiff = Math.abs(temp - optimalTemp);
  const maxDiff = WEATHER_THRESHOLDS.temperature.max - optimalTemp;
  return {
    score: 100 - (tempDiff / maxDiff) * 50,
    isSafe: true,
  };
}

function generateWaypoints(startLat, startLng, endLat, endLng, maxDistance) {
  const totalDistance = calculateDistance(startLat, startLng, endLat, endLng);
  const numSegments = Math.ceil(totalDistance / (maxDistance * 0.8)); // Use 80% of max distance for safety
  const waypoints = [];

  for (let i = 1; i < numSegments; i++) {
    const fraction = i / numSegments;

    // Use great circle interpolation for accurate waypoints
    const δ =
      fraction *
      Math.acos(
        Math.sin((startLat * Math.PI) / 180) * Math.sin((endLat * Math.PI) / 180) +
          Math.cos((startLat * Math.PI) / 180) *
            Math.cos((endLat * Math.PI) / 180) *
            Math.cos(((endLng - startLng) * Math.PI) / 180)
      );

    const A = Math.sin((1 - fraction) * δ) / Math.sin(δ);
    const B = Math.sin(fraction * δ) / Math.sin(δ);

    const x =
      A * Math.cos((startLat * Math.PI) / 180) * Math.cos((startLng * Math.PI) / 180) +
      B * Math.cos((endLat * Math.PI) / 180) * Math.cos((endLng * Math.PI) / 180);
    const y =
      A * Math.cos((startLat * Math.PI) / 180) * Math.sin((startLng * Math.PI) / 180) +
      B * Math.cos((endLat * Math.PI) / 180) * Math.sin((endLng * Math.PI) / 180);
    const z = A * Math.sin((startLat * Math.PI) / 180) + B * Math.sin((endLat * Math.PI) / 180);

    const lat = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI;
    const lng = (Math.atan2(y, x) * 180) / Math.PI;

    waypoints.push({
      coordinates: [lng, lat],
      name: `Waypoint ${i} of ${numSegments - 1}`,
      isWaypoint: true,
      type: 'waypoint',
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
    const unvisited = locations.filter(loc => loc.address !== startingPoint.address);

    // Calculate daily segments based on constraints
    while (unvisited.length > 0) {
      const current = route[route.length - 1];
      const currentCoords = validateAndFormatCoordinates(current);

      // Find locations reachable within distance and time constraints
      const reachableLocations = unvisited
        .map(loc => {
          const coords = validateAndFormatCoordinates(loc);
          const distance = calculateDistance(
            currentCoords[1],
            currentCoords[0],
            coords[1],
            coords[0]
          );
          const estimatedDriveTime = distance / 65000; // Rough estimate: 65 km/h average speed
          return {
            location: loc,
            distance,
            driveTime: estimatedDriveTime,
          };
        })
        .filter(
          loc =>
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
              distance: calculateDistance(currentCoords[1], currentCoords[0], coords[1], coords[0]),
            };
          })
          .reduce((min, loc) => (loc.distance < min.distance ? loc : min));

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
            const δ =
              fraction *
              Math.acos(
                Math.sin((startLat * Math.PI) / 180) * Math.sin((endLat * Math.PI) / 180) +
                  Math.cos((startLat * Math.PI) / 180) *
                    Math.cos((endLat * Math.PI) / 180) *
                    Math.cos(((endLng - startLng) * Math.PI) / 180)
              );

            const A = Math.sin((1 - fraction) * δ) / Math.sin(δ);
            const B = Math.sin(fraction * δ) / Math.sin(δ);

            const x =
              A * Math.cos((startLat * Math.PI) / 180) * Math.cos((startLng * Math.PI) / 180) +
              B * Math.cos((endLat * Math.PI) / 180) * Math.cos((endLng * Math.PI) / 180);
            const y =
              A * Math.cos((startLat * Math.PI) / 180) * Math.sin((startLng * Math.PI) / 180) +
              B * Math.cos((endLat * Math.PI) / 180) * Math.sin((endLng * Math.PI) / 180);
            const z =
              A * Math.sin((startLat * Math.PI) / 180) + B * Math.sin((endLat * Math.PI) / 180);

            const intermediateLat = (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI;
            const intermediateLng = (Math.atan2(y, x) * 180) / Math.PI;

            // Add intermediate waypoint with more descriptive name
            const distanceKm = Math.round(closest.distance / 1000);
            route.push({
              coordinates: [intermediateLng, intermediateLat],
              name: `Waypoint ${i} of ${numStops} (${distanceKm}km route)`,
              isWaypoint: true,
              type: 'waypoint',
            });

            // Verify distance to next point
            const nextCoords =
              i === numStops
                ? endCoords
                : [
                    (Math.atan2(y, x) * 180) / Math.PI,
                    (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI,
                  ];

            const segmentDistance = calculateDistance(
              intermediateLat,
              intermediateLng,
              nextCoords[1],
              nextCoords[0]
            );

            if (segmentDistance > MAX_SEGMENT_DISTANCE) {
              logDebug(`Warning: Generated waypoint still exceeds maximum distance. Adjusting...`);
              // Add an extra waypoint if needed
              const midLat = (intermediateLat + nextCoords[1]) / 2;
              const midLng = (intermediateLng + nextCoords[0]) / 2;
              route.push({
                coordinates: [midLng, midLat],
                name: `Extra Waypoint ${i}-${i + 1}`,
                isWaypoint: true,
                type: 'waypoint',
              });
            }
          }
        }

        // Add the destination after waypoints
        route.push(closest.location);
        unvisited.splice(
          unvisited.findIndex(loc => loc.address === closest.location.address),
          1
        );
      } else {
        // Find nearest reachable location
        const nearest = reachableLocations.reduce((min, loc) =>
          loc.distance < min.distance ? loc : min
        );

        route.push(nearest.location);
        unvisited.splice(
          unvisited.findIndex(loc => loc.address === nearest.location.address),
          1
        );
      }

      // Verify all segments are within limits
      for (let i = 1; i < route.length; i++) {
        const prevCoords = validateAndFormatCoordinates(route[i - 1]);
        const currCoords = validateAndFormatCoordinates(route[i]);
        const segmentDistance = calculateDistance(
          prevCoords[1],
          prevCoords[0],
          currCoords[1],
          currCoords[0]
        );

        if (segmentDistance > MAX_SEGMENT_DISTANCE) {
          logDebug(`Warning: Found segment exceeding maximum distance. Adding extra waypoint.`);
          const midLat = (prevCoords[1] + currCoords[1]) / 2;
          const midLng = (prevCoords[0] + currCoords[0]) / 2;
          route.splice(i, 0, {
            coordinates: [midLng, midLat],
            name: `Extra Waypoint ${i}`,
            isWaypoint: true,
            type: 'waypoint',
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
      locations.map(async loc => {
        try {
          const coords = validateAndFormatCoordinates(loc);
          const data = await getWeatherData({
            coordinates: coords,
            address: loc.address || loc.name,
            days: 7, // Get full week forecast
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
                visibility: day.visibility,
              },
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
            warnings: safeDays.length === 0 ? ['No safe weather days found this week'] : [],
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
            warnings: ['Weather data unavailable'],
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
        warnings: ['Failed to fetch weather data'],
      };
    });

    // Filter out locations with no safe days in the week
    const locationsWithSafeDays = processedLocations.filter(item => item.hasSafeDays);
    const unsafeLocations = processedLocations.filter(item => !item.hasSafeDays);

    if (locationsWithSafeDays.length === 0) {
      throw new Error(
        'No locations have safe weather conditions for drone operations this week.\nUnsafe conditions:\n' +
          unsafeLocations.map(loc => `${loc.location.name}: ${loc.warnings.join(', ')}`).join('\n')
      );
    }

    // Start with the specified starting point
    const route = [startingPoint];
    const unvisited = locationsWithSafeDays.filter(
      item => item.location.address !== startingPoint.address
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
      const scoredLocations = unvisited
        .map(item => {
          const coords = validateAndFormatCoordinates(item.location);
          const distance = calculateDistance(
            currentCoords[1],
            currentCoords[0],
            coords[1],
            coords[0]
          );

          // Calculate travel time to this location
          const travelHours = distance / 65000; // Assuming 65 km/h average speed
          const estimatedArrival = new Date(currentDate.getTime() + travelHours * 60 * 60 * 1000);

          // Find the first safe day after our estimated arrival
          const availableDays = item.safeDays.filter(day => day.date > estimatedArrival);

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
          const timingPenalty = Math.max(0.5, 1 - daysUntilVisit * 0.1);

          // Combined score weighs:
          // - Weather conditions (50%)
          // - Distance (30%)
          // - Timing of visit (20%)
          const combinedScore =
            availableDays[0].score * 0.5 + distanceScore * 0.3 + timingPenalty * 100 * 0.2;

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
            combinedScore,
          };
        })
        .filter(Boolean); // Remove any locations with no available safe days

      if (scoredLocations.length === 0) {
        throw new Error('No locations can be safely visited after accounting for travel times');
      }

      // Find best next location based on combined score
      const best = scoredLocations.reduce((max, loc) =>
        loc.combinedScore > max.combinedScore ? loc : max
      );

      // Update current date to account for travel time and site visit
      const travelHours = best.distance / 65000; // Assuming 65 km/h average speed
      currentDate = new Date(
        Math.max(
          currentDate.getTime() + (travelHours + SITE_VISIT_MINUTES / 60) * 60 * 60 * 1000,
          best.plannedDate.getTime()
        )
      );

      // Add location with all weather and scoring details
      route.push({
        ...best.location,
        weather: best.weather,
        weatherScore: {
          score: best.weatherScore,
          isSafe: true, // We know it's safe because we filtered for safe days
          warnings: best.warnings,
          conditions: best.weatherConditions,
        },
        plannedDate: best.plannedDate,
        distanceScore: best.distanceScore,
        combinedScore: best.combinedScore,
      });

      // Remove selected location from unvisited
      const index = unvisited.findIndex(item => item.location.address === best.location.address);
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
    end: sunset,
  };
}

/**
 * Find suitable rest stops along a route segment
 */
async function findRestStops(origin, destination, departureTime) {
  try {
    // Calculate the direct route first
    const directRoute = await getRouteDataWithRetry([origin, destination]);
    const totalDuration = directRoute.route.duration;

    // If the total duration is within daily limit, no rest stops needed
    if (totalDuration <= MAX_DAILY_DRIVE_SECONDS) {
      return { route: directRoute, restStops: [] };
    }

    // Calculate how many rest stops we need
    const numberOfStops = Math.ceil(totalDuration / REST_STOP_INTERVAL_SECONDS) - 1;
    const restStops = [];

    // Get cities along the route
    const coordinates = directRoute.route.geometry.coordinates;
    const potentialStops = [];

    // Sample points along the route where we might need rest stops
    for (let i = 1; i < numberOfStops + 1; i++) {
      const progress = i / (numberOfStops + 1);
      const index = Math.floor(progress * coordinates.length);
      const [lng, lat] = coordinates[index];

      // Find nearest city using Mapbox geocoding
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?types=place&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const city = data.features[0];
        potentialStops.push({
          name: city.text,
          coordinates: city.center,
          place_name: city.place_name,
          duration: progress * totalDuration,
        });
      }
    }

    // Add rest stops with facilities information
    for (const stop of potentialStops) {
      const facilities = ['Parking', 'Restrooms'];
      // Add food options during meal times
      const arrivalTime = new Date(departureTime.getTime() + stop.duration * 1000);
      const hour = arrivalTime.getHours();
      if ((hour >= 11 && hour <= 14) || (hour >= 17 && hour <= 20)) {
        facilities.push('Restaurants');
      }
      if (hour >= 22 || hour <= 6) {
        facilities.push('Lodging');
      }

      restStops.push({
        ...stop,
        facilities,
        arrivalTime,
        departureTime: new Date(arrivalTime.getTime() + MIN_REST_DURATION_MINUTES * 60000),
      });
    }

    return { restStops, originalRoute: directRoute };
  } catch (error) {
    console.error('Error finding rest stops:', error);
    throw error;
  }
}

/**
 * Split route into daily segments with rest stops
 */
async function splitIntoDaily(routeData, locations) {
  if (!locations || locations.length < 2) {
    throw new Error('At least 2 locations required for route segmentation');
  }

  const segments = [];
  let currentSegment = {
    locations: [],
    restStops: [],
    duration: 0,
    distance: 0,
    startTime: new Date(),
    endTime: new Date(),
    weatherWarnings: [],
    weatherSummary: {
      temperature: 0,
      wind_speed: 0,
      precipitation: 0,
      visibility: 0,
      status: 'unknown',
    },
  };

  let currentTime = new Date();
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM
  currentSegment.startTime = new Date(currentTime.getTime());

  for (let i = 0; i < locations.length - 1; i++) {
    const origin = locations[i];
    const destination = locations[i + 1];

    try {
      // Get route data for this segment
      const segmentRoute = await getRouteDataWithRetry([origin, destination]);
      const { restStops } = await findRestStops(origin, destination, currentTime);

      // Check if adding this leg would exceed daily limit
      if (currentSegment.duration + segmentRoute.route.duration > MAX_DAILY_DRIVE_SECONDS) {
        // Finalize current segment
        currentSegment.endTime = new Date(currentTime.getTime());
        segments.push(currentSegment);

        // Start new segment next day at 9 AM
        currentTime = new Date(currentTime.getTime());
        currentTime.setDate(currentTime.getDate() + 1);
        currentTime.setHours(9, 0, 0, 0);

        currentSegment = {
          locations: [],
          restStops: [],
          duration: 0,
          distance: 0,
          startTime: new Date(currentTime.getTime()),
          weatherWarnings: [],
          weatherSummary: {
            temperature: 0,
            wind_speed: 0,
            precipitation: 0,
            visibility: 0,
            status: 'unknown',
          },
        };
      }

      // Add location and update segment data
      currentSegment.locations.push(origin);
      currentSegment.restStops.push(...restStops);
      currentSegment.duration += segmentRoute.route.duration;
      currentSegment.distance += segmentRoute.route.distance;

      // Update weather summary if location has weather data
      if (origin.weatherScore) {
        const conditions = origin.weatherScore.conditions;
        if (conditions) {
          // Update running averages
          const count = currentSegment.locations.length;
          currentSegment.weatherSummary = {
            temperature:
              (currentSegment.weatherSummary.temperature * (count - 1) + conditions.temp) / count,
            wind_speed:
              (currentSegment.weatherSummary.wind_speed * (count - 1) + conditions.wind_speed) /
              count,
            precipitation:
              (currentSegment.weatherSummary.precipitation * (count - 1) +
                conditions.precipitation) /
              count,
            visibility:
              (currentSegment.weatherSummary.visibility * (count - 1) + conditions.visibility) /
              count,
            status: origin.weatherScore.isSafe ? 'safe' : 'warning',
          };
        }
        if (origin.weatherScore.warnings && origin.weatherScore.warnings.length > 0) {
          currentSegment.weatherWarnings.push(...origin.weatherScore.warnings);
        }
      }

      // Update current time including rest stops
      for (const stop of restStops) {
        currentTime = new Date(stop.departureTime);
      }
      currentTime = new Date(currentTime.getTime() + segmentRoute.route.duration * 1000);
    } catch (error) {
      logError(`Error processing segment from ${origin.address} to ${destination.address}:`, error);
      throw new Error(`Failed to process route segment: ${error.message}`);
    }
  }

  // Add final location to last segment
  currentSegment.locations.push(locations[locations.length - 1]);

  // Update weather summary with final location if it has weather data
  const finalLocation = locations[locations.length - 1];
  if (finalLocation.weatherScore?.conditions) {
    const conditions = finalLocation.weatherScore.conditions;
    const count = currentSegment.locations.length;
    currentSegment.weatherSummary = {
      temperature:
        (currentSegment.weatherSummary.temperature * (count - 1) + conditions.temp) / count,
      wind_speed:
        (currentSegment.weatherSummary.wind_speed * (count - 1) + conditions.wind_speed) / count,
      precipitation:
        (currentSegment.weatherSummary.precipitation * (count - 1) + conditions.precipitation) /
        count,
      visibility:
        (currentSegment.weatherSummary.visibility * (count - 1) + conditions.visibility) / count,
      status: finalLocation.weatherScore.isSafe ? 'safe' : 'warning',
    };
    if (finalLocation.weatherScore.warnings && finalLocation.weatherScore.warnings.length > 0) {
      currentSegment.weatherWarnings.push(...finalLocation.weatherScore.warnings);
    }
  }

  currentSegment.endTime = new Date(currentTime.getTime());
  segments.push(currentSegment);

  return segments;
}

/**
 * Get optimized routes with rest stops and daily segments
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
    const validLocations = locations
      .map(location => {
        try {
          const [lng, lat] = validateAndFormatCoordinates(location);
          includedLocations.add(location.id);
          return {
            ...location,
            coordinates: [lng, lat],
          };
        } catch (error) {
          logError(`Invalid location skipped: ${location.address}`, error);
          missingLocations.push(location.address);
          return null;
        }
      })
      .filter(Boolean);

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
          currentCoords[1],
          currentCoords[0],
          coords[1],
          coords[0]
        );

        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestLocation = location;
        }
      }

      // Add nearest location to sequence
      optimizedSequence.push(nearestLocation);

      // Remove from unvisited
      const index = unvisited.findIndex(loc => loc.address === nearestLocation.address);
      unvisited.splice(index, 1);
    }

    // Split into daily segments with rest stops
    const dailySegments = await splitIntoDaily(null, optimizedSequence);

    // Create summary
    const summary = {
      totalLocations: validLocations.length,
      includedLocations: Array.from(includedLocations),
      missingLocations,
      numberOfDays: dailySegments.length,
      totalDistance: dailySegments.reduce((sum, segment) => sum + segment.distance, 0),
      totalDuration: dailySegments.reduce((sum, segment) => sum + segment.duration, 0),
    };

    return {
      segments: dailySegments,
      summary,
      error:
        missingLocations.length > 0
          ? `Some locations could not be included: ${missingLocations.join(', ')}`
          : null,
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
          throw new Error(
            `Invalid coordinates for location ${index + 1}: ${location?.address || 'Unknown location'}`
          );
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
        annotations: 'distance,duration',
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
          legs: data.routes[0].legs,
        },
        waypoints: data.waypoints,
        summary: {
          totalLocations: locations.length,
          includedLocations: locations.length,
          totalDistance: data.routes[0].distance,
          totalDuration: data.routes[0].duration,
          numberOfDays: 1,
        },
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
      warnings,
    };
  } catch (error) {
    logError('Error fetching weather data:', error);
    return {
      warnings: ['Weather data unavailable'],
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
  } else {
    throw new Error(`Invalid coordinates for location: ${location.address || 'Unknown location'}`);
  }

  // Validate coordinate values
  if (!isValidCoordinate(lng, 'longitude') || !isValidCoordinate(lat, 'latitude')) {
    throw new Error(
      `Invalid coordinate values for location: ${location.address || 'Unknown location'}`
    );
  }

  return [lng, lat];
}

export { getOptimizedRoutes, calculateDistance, MIN_REST_DURATION_MINUTES };
