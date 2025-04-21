import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  Divider,
  Icon,
  List,
  ListItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Spacer,
} from '@chakra-ui/react';
import {
  FaUtensils,
  FaToilet,
  FaCar,
  FaParking,
  FaMapMarkerAlt,
  FaClock,
  FaRoute,
} from 'react-icons/fa';
import PropTypes from 'prop-types';
import { formatTime, formatDuration } from '../utils/formatters';
import { MIN_REST_DURATION_MINUTES } from '../services/routeService';

const FacilityIcon = ({ type }) => {
  switch (type) {
    case 'Restaurants':
      return <Icon as={FaUtensils} color="orange.500" />;
    case 'Restrooms':
      return <Icon as={FaToilet} color="blue.500" />;
    case 'Parking':
      return <Icon as={FaParking} color="green.500" />;
    default:
      return null;
  }
};

FacilityIcon.propTypes = {
  type: PropTypes.string.isRequired,
};

const RestStop = ({ stop }) => (
  <Box p={3} bg="gray.50" borderRadius="md" shadow="sm">
    <VStack align="stretch" spacing={2}>
      <HStack>
        <Icon as={FaMapMarkerAlt} color="red.500" />
        <Text fontWeight="bold">{stop.name}</Text>
        <Spacer />
        <Badge colorScheme="blue">Rest Stop</Badge>
      </HStack>

      <Text fontSize="sm" color="gray.600">
        {stop.place_name}
      </Text>

      <HStack spacing={2}>
        <Icon as={FaClock} color="gray.500" />
        <Text fontSize="sm">Arrival: {formatTime(stop.arrivalTime)}</Text>
        <Text fontSize="sm" color="gray.600">
          ({formatDuration(MIN_REST_DURATION_MINUTES * 60)} rest)
        </Text>
      </HStack>

      <HStack spacing={3}>
        {stop.facilities.map((facility, index) => (
          <HStack key={index} spacing={1}>
            <FacilityIcon type={facility} />
            <Text fontSize="sm">{facility}</Text>
          </HStack>
        ))}
      </HStack>
    </VStack>
  </Box>
);

RestStop.propTypes = {
  stop: PropTypes.shape({
    name: PropTypes.string.isRequired,
    place_name: PropTypes.string.isRequired,
    facilities: PropTypes.arrayOf(PropTypes.string).isRequired,
    arrivalTime: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
};

const LocationStop = ({ location, isStart, isEnd }) => (
  <Box p={3} borderRadius="md" bg={isStart || isEnd ? 'blue.50' : 'white'}>
    <HStack spacing={3}>
      <Icon
        as={FaMapMarkerAlt}
        color={isStart ? 'green.500' : isEnd ? 'red.500' : 'blue.500'}
        boxSize={5}
      />
      <VStack align="start" spacing={1}>
        <HStack>
          <Text fontWeight="bold">{location.name || location.address}</Text>
          <Badge colorScheme={isStart ? 'green' : isEnd ? 'red' : 'blue'}>
            {isStart ? 'Start' : isEnd ? 'End' : 'Stop'}
          </Badge>
        </HStack>
        {location.weatherScore && (
          <HStack spacing={2} fontSize="sm" color="gray.600">
            <Text>{Math.round(location.weatherScore.conditions.temp)}°C</Text>
            <Text>{location.weatherScore.conditions.wind_speed.toFixed(1)} m/s wind</Text>
            <Text>{location.weatherScore.conditions.visibility}km visibility</Text>
          </HStack>
        )}
      </VStack>
    </HStack>
  </Box>
);

LocationStop.propTypes = {
  location: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    weatherScore: PropTypes.object,
  }).isRequired,
  isStart: PropTypes.bool,
  isEnd: PropTypes.bool,
};

const DailyRouteDetails = ({ day, segment }) => {
  if (!segment?.startTime || !segment?.endTime) return null;

  const sunrise = new Date(segment.startTime);
  sunrise.setHours(7, 0, 0, 0);

  const sunset = new Date(segment.startTime);
  sunset.setHours(19, 0, 0, 0);

  return (
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <HStack spacing={4}>
            <Text fontWeight="bold">Day {day}</Text>
            <HStack spacing={2}>
              <Icon as={FaRoute} color="blue.500" />
              <Text>{Math.round(segment.distance / 1609.34)} mi</Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FaClock} color="green.500" />
              <Text>{formatDuration(segment.duration)}</Text>
            </HStack>
            <Text color="gray.600">({segment.locations.length} locations)</Text>
          </HStack>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <VStack spacing={4} align="stretch">
          {/* Daily Schedule */}
          <Box>
            <Heading size="sm" mb={3}>
              Schedule
            </Heading>
            <HStack spacing={6} bg="gray.50" p={3} borderRadius="md">
              <HStack>
                <Icon as={FaClock} color="green.500" />
                <Text>Start: {formatTime(segment.startTime)}</Text>
              </HStack>
              <HStack>
                <Icon as={FaClock} color="red.500" />
                <Text>End: {formatTime(segment.endTime)}</Text>
              </HStack>
              <HStack>
                <Icon as={FaRoute} color="blue.500" />
                <Text>{formatDuration(segment.duration)} total</Text>
              </HStack>
            </HStack>
          </Box>

          <Divider />

          {/* Route Sequence */}
          <Box>
            <Heading size="sm" mb={3}>
              Route Sequence
            </Heading>
            <VStack spacing={3} align="stretch">
              {segment.locations.map((location, index) => (
                <React.Fragment key={index}>
                  <LocationStop
                    location={location}
                    isStart={index === 0}
                    isEnd={index === segment.locations.length - 1}
                  />
                  {segment.restStops
                    .filter(
                      stop =>
                        stop.arrivalTime >
                          (index === 0 ? segment.startTime : new Date(location.plannedDate)) &&
                        (index < segment.locations.length - 1
                          ? stop.arrivalTime < new Date(segment.locations[index + 1].plannedDate)
                          : true)
                    )
                    .map((stop, stopIndex) => (
                      <RestStop key={`stop-${stopIndex}`} stop={stop} />
                    ))}
                </React.Fragment>
              ))}
            </VStack>
          </Box>

          {/* Weather Summary */}
          {segment.weatherSummary && (
            <>
              <Divider />
              <Box>
                <Heading size="sm" mb={3}>
                  Weather Conditions
                </Heading>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <HStack spacing={6}>
                    <Text>Temperature: {Math.round(segment.weatherSummary.temperature)}°C</Text>
                    <Text>Wind: {segment.weatherSummary.wind_speed.toFixed(1)} m/s</Text>
                    <Text>Visibility: {segment.weatherSummary.visibility}km</Text>
                    <Badge
                      colorScheme={segment.weatherSummary.status === 'safe' ? 'green' : 'yellow'}
                    >
                      {segment.weatherSummary.status}
                    </Badge>
                  </HStack>
                </Box>
              </Box>
            </>
          )}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

DailyRouteDetails.propTypes = {
  day: PropTypes.number.isRequired,
  segment: PropTypes.shape({
    startTime: PropTypes.instanceOf(Date),
    endTime: PropTypes.instanceOf(Date),
    duration: PropTypes.number,
    distance: PropTypes.number,
    locations: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        address: PropTypes.string,
        weatherScore: PropTypes.object,
        plannedDate: PropTypes.instanceOf(Date),
      })
    ),
    restStops: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        place_name: PropTypes.string,
        facilities: PropTypes.arrayOf(PropTypes.string),
        arrivalTime: PropTypes.instanceOf(Date),
      })
    ),
    weatherSummary: PropTypes.shape({
      temperature: PropTypes.number,
      wind_speed: PropTypes.number,
      visibility: PropTypes.number,
      status: PropTypes.string,
    }),
  }),
};

const RouteDetails = ({ route }) => {
  if (!route?.segments) return null;

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Heading size="md">Route Details</Heading>
          <HStack spacing={4}>
            <Badge colorScheme="blue">{route.segments.length} Days</Badge>
            <Badge colorScheme="green">
              {route.segments.reduce((total, segment) => total + segment.locations.length, 0)} Stops
            </Badge>
            <Badge colorScheme="purple">
              {Math.round(
                route.segments.reduce((total, segment) => total + segment.distance, 0) / 1609.34
              )}{' '}
              Total Miles
            </Badge>
          </HStack>
        </HStack>
        <Accordion defaultIndex={[0]} allowMultiple>
          {route.segments.map((segment, index) => (
            <DailyRouteDetails key={index} day={index + 1} segment={segment} />
          ))}
        </Accordion>
      </VStack>
    </Box>
  );
};

RouteDetails.propTypes = {
  route: PropTypes.shape({
    segments: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default RouteDetails;
