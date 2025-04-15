import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  Divider,
  Badge,
  Spinner
} from '@chakra-ui/react';

// Helper functions
const formatDistance = (meters) => {
  if (!meters && meters !== 0) return 'N/A';
  return `${(meters / 1609.34).toFixed(1)} mi`;
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const formatTime = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Date';
  }
};

const WeatherBadge = ({ weather }) => {
  if (!weather) return null;

  const getWeatherColor = (conditions) => {
    if (conditions.wind_speed > 15) return 'red';
    if (conditions.precipitation > 0) return 'yellow';
    if (conditions.visibility < 5000) return 'orange';
    return 'green';
  };

  const getWeatherIcon = (conditions) => {
    if (conditions.condition?.toLowerCase().includes('rain')) return '🌧';
    if (conditions.condition?.toLowerCase().includes('cloud')) return '☁️';
    if (conditions.condition?.toLowerCase().includes('clear')) return '☀️';
    if (conditions.condition?.toLowerCase().includes('snow')) return '❄️';
    return '🌤';
  };

  const getDroneStatus = (conditions) => {
    if (conditions.wind_speed > 15) return 'No-Fly: High Winds';
    if (conditions.precipitation > 0) return 'No-Fly: Precipitation';
    if (conditions.visibility < 5000) return 'No-Fly: Poor Visibility';
    if (conditions.temp < 0 || conditions.temp > 35) return 'Caution: Temperature';
    return 'Safe to Fly';
  };

  return (
    <HStack spacing={2} mt={2} p={2} bg="gray.50" borderRadius="md">
      <Badge colorScheme={getWeatherColor(weather.current)}>
        {getDroneStatus(weather.current)}
      </Badge>
      <Text>{getWeatherIcon(weather.current)} {weather.current.condition}</Text>
      <Text>{weather.current.temp}°F</Text>
      <Text>💨 {weather.current.wind_speed} MPH</Text>
      {weather.current.precipitation > 0 && (
        <Text>🌧 {weather.current.precipitation}mm</Text>
      )}
    </HStack>
  );
};

const RouteDetails = ({ route, title }) => {
  if (!route || !route.segments) return null;

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Invalid Date';
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" width="100%">
      <Heading size="md" mb={4}>{title}</Heading>
      <HStack spacing={4} mb={4}>
        <Box>
          <Text fontSize="sm" color="gray.500">Total Distance</Text>
          <Text fontWeight="bold">{formatDistance(route.totalDistance)}</Text>
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.500">Driving Time</Text>
          <Text fontWeight="bold">{formatDuration(route.totalDuration)}</Text>
        </Box>
        <Box>
          <Text fontSize="sm" color="gray.500">Days</Text>
          <Text fontWeight="bold">{route.numberOfDays}</Text>
        </Box>
      </HStack>
      <Divider mb={4} />
      <VStack spacing={4} align="stretch">
        {route.segments.map((segment, segmentIndex) => (
          <Box key={segmentIndex} p={4} bg="gray.50" borderRadius="md">
            <HStack justify="space-between" mb={3}>
              <Heading size="sm">Day {segment.dayNumber}</Heading>
              <Text fontSize="sm" color="gray.600">
                {formatDateTime(segment.startTime)}
              </Text>
            </HStack>
            <VStack spacing={3} align="stretch">
              {segment.locations.map((location, locationIndex) => (
                <Box key={locationIndex} p={3} bg="white" borderRadius="md" shadow="sm">
                  <HStack justify="space-between" mb={2}>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">
                        {location.name || location.address || `Location ${locationIndex + 1}`}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Arrive: {formatDateTime(location.arrivalTime)}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Depart: {formatDateTime(location.departureTime)}
                      </Text>
                    </VStack>
                    <Badge colorScheme="blue" fontSize="sm">
                      {formatDistance(location.distanceToNext)}
                    </Badge>
                  </HStack>
                  <WeatherBadge weather={location.weather} />
                </Box>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

RouteDetails.propTypes = {
  route: PropTypes.shape({
    segments: PropTypes.arrayOf(PropTypes.shape({
      startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      endTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      locations: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        address: PropTypes.string,
        distanceToNext: PropTypes.number
      }))
    })),
    totalDistance: PropTypes.number,
    totalDuration: PropTypes.number,
    numberOfDays: PropTypes.number
  }),
  title: PropTypes.string.isRequired
};

const RouteSummary = ({ routes = null, loading = false, error = null }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={8}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.50" color="red.500" borderRadius="md">
        <Text>Error: {error}</Text>
      </Box>
    );
  }

  if (!routes) {
    return (
      <Box p={4} bg="gray.50" borderRadius="md">
        <Text>No routes available. Generate a route to see the summary.</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={6} width="100%">
      <RouteDetails
        route={routes.distanceOptimized}
        title="Distance Optimized Route"
      />
      <RouteDetails
        route={routes.weatherOptimized}
        title="Weather Optimized Route"
      />
    </VStack>
  );
};

RouteSummary.propTypes = {
  routes: PropTypes.shape({
    distanceOptimized: PropTypes.object,
    weatherOptimized: PropTypes.object
  }),
  loading: PropTypes.bool,
  error: PropTypes.string
};

WeatherBadge.propTypes = {
  weather: PropTypes.shape({
    current: PropTypes.shape({
      temp: PropTypes.number,
      condition: PropTypes.string,
      wind_speed: PropTypes.number,
      precipitation: PropTypes.number,
      visibility: PropTypes.number
    })
  })
};

export default RouteSummary; 