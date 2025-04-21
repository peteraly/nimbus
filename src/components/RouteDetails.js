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
  Tooltip,
  Spacer,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaUtensils, FaToilet, FaCar, FaParking } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { formatTime, formatDuration } from '../utils/formatters';
import { MIN_REST_DURATION_MINUTES } from '../services/routeService';

const RestStop = ({ stop }) => (
  <HStack spacing={4} p={2} bg="gray.50" borderRadius="md">
    <Icon as={FaUtensils} color="brown.500" />
    <VStack align="start" spacing={1}>
      <Text fontWeight="bold">{stop.name}</Text>
      <Text fontSize="sm" color="gray.600">
        {stop.place_name}
      </Text>
      <Text fontSize="sm" color="gray.600">
        {stop.facilities.join(' • ')}
      </Text>
    </VStack>
    <Spacer />
    <VStack align="end" spacing={1}>
      <Text fontSize="sm">{formatTime(stop.arrivalTime)}</Text>
      <Text fontSize="sm" color="gray.600">
        {formatDuration(MIN_REST_DURATION_MINUTES * 60)} rest
      </Text>
    </VStack>
  </HStack>
);

RestStop.propTypes = {
  stop: PropTypes.shape({
    name: PropTypes.string.isRequired,
    place_name: PropTypes.string.isRequired,
    facilities: PropTypes.arrayOf(PropTypes.string).isRequired,
    arrivalTime: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
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
          <HStack>
            <Text fontWeight="bold">Day {day}</Text>
            <Text color="gray.600">
              ({segment.locations.length} locations, {Math.round(segment.distance / 1609.34)} mi)
            </Text>
          </HStack>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <VStack spacing={4} align="stretch">
          {/* Daily Schedule */}
          <Box>
            <Heading size="sm" mb={2}>
              Schedule
            </Heading>
            <HStack spacing={4}>
              <HStack>
                <Icon as={FaCar} />
                <Text>Start: {formatTime(segment.startTime)}</Text>
              </HStack>
              <HStack>
                <Icon as={FaCar} />
                <Text>End: {formatTime(segment.endTime)}</Text>
              </HStack>
            </HStack>
            <HStack mt={2}>
              <Icon as={FaCar} color="yellow.500" />
              <Text>Sunrise: {formatTime(sunrise)}</Text>
              <Icon as={FaCar} ml={4} />
              <Text>Sunset: {formatTime(sunset)}</Text>
            </HStack>
          </Box>

          <Divider />

          {/* Locations */}
          <Box>
            <Heading size="sm" mb={2}>
              Locations
            </Heading>
            <VStack spacing={2} align="stretch">
              {segment.locations.map((location, index) => (
                <HStack key={index} p={2}>
                  <Text fontWeight={index === 0 ? 'bold' : 'normal'}>
                    {location.name || location.address}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Rest Stops */}
          {segment.restStops && segment.restStops.length > 0 && (
            <>
              <Divider />
              <Box>
                <Heading size="sm" mb={2}>
                  Recommended Stops
                </Heading>
                <VStack spacing={2} align="stretch">
                  {segment.restStops.map((stop, index) => (
                    <RestStop key={index} stop={stop} />
                  ))}
                </VStack>
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
    locations: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        address: PropTypes.string,
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
    distance: PropTypes.number,
  }),
};

const RouteDetails = ({ route }) => {
  if (!route?.segments) return null;

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <Heading size="md" mb={4}>
        Route Details
      </Heading>
      <Accordion allowMultiple>
        {route.segments.map((segment, index) => (
          <DailyRouteDetails key={index} day={index + 1} segment={segment} />
        ))}
      </Accordion>
    </Box>
  );
};

RouteDetails.propTypes = {
  route: PropTypes.shape({
    segments: PropTypes.arrayOf(PropTypes.object),
  }),
};

export default RouteDetails;
