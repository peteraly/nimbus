import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Badge,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import { FaBed, FaGasPump, FaClock, FaSun, FaMoon, FaCoffee, FaExclamationTriangle } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { formatTime, formatDuration } from '../utils/formatters';

const RestStop = ({ location, facilities, timeFromStart, distanceFromStart }) => (
  <HStack spacing={4} p={2}>
    <Icon as={FaCoffee} color="brown.500" />
    <VStack align="start" spacing={1}>
      <Text fontWeight="bold">{location}</Text>
      <Text fontSize="sm" color="gray.600">
        {facilities.join(' • ')}
      </Text>
    </VStack>
    <Spacer />
    <VStack align="end" spacing={1}>
      <Text fontSize="sm">{formatDuration(timeFromStart)}</Text>
      <Text fontSize="sm" color="gray.600">{distanceFromStart} mi</Text>
    </VStack>
  </HStack>
);

RestStop.propTypes = {
  location: PropTypes.string.isRequired,
  facilities: PropTypes.arrayOf(PropTypes.string).isRequired,
  timeFromStart: PropTypes.number.isRequired,
  distanceFromStart: PropTypes.number.isRequired
};

const DailyRouteDetails = ({ day, segments = [], startTime, endTime }) => {
  if (!startTime || !endTime) return null;

  const sunrise = new Date(startTime);
  sunrise.setHours(7, 0, 0, 0);
  
  const sunset = new Date(startTime);
  sunset.setHours(19, 0, 0, 0);

  // Ensure segments is always an array
  const safeSegments = Array.isArray(segments) ? segments : [];

  return (
    <AccordionItem>
      <AccordionButton>
        <Box flex="1" textAlign="left">
          <Text fontWeight="bold">Day {day}</Text>
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4}>
        <VStack spacing={4} align="stretch">
          {/* Daily Schedule */}
          <Box>
            <Heading size="sm" mb={2}>Schedule</Heading>
            <HStack spacing={4}>
              <HStack>
                <Icon as={FaClock} />
                <Text>Start: {formatTime(startTime)}</Text>
              </HStack>
              <HStack>
                <Icon as={FaClock} />
                <Text>End: {formatTime(endTime)}</Text>
              </HStack>
            </HStack>
            <HStack mt={2}>
              <Icon as={FaSun} color="yellow.500" />
              <Text>Sunrise: {formatTime(sunrise)}</Text>
              <Icon as={FaMoon} ml={4} />
              <Text>Sunset: {formatTime(sunset)}</Text>
            </HStack>
          </Box>

          <Divider />

          {/* Rest Stops */}
          {safeSegments.length > 0 && safeSegments.some(segment => segment?.restStop) && (
            <>
              <Box>
                <Heading size="sm" mb={2}>Recommended Stops</Heading>
                <VStack spacing={2} align="stretch">
                  {safeSegments.map((segment, index) => (
                    segment?.restStop && (
                      <RestStop
                        key={index}
                        location={segment.restStop.name || `Stop ${index + 1}`}
                        facilities={segment.restStop.facilities || []}
                        timeFromStart={segment.timeFromStart || 0}
                        distanceFromStart={segment.distanceFromStart || 0}
                      />
                    )
                  ))}
                </VStack>
              </Box>
              <Divider />
            </>
          )}

          {/* Accommodation */}
          {safeSegments.length > 0 && safeSegments[safeSegments.length - 1]?.accommodations?.length > 0 && (
            <>
              <Box>
                <Heading size="sm" mb={2}>
                  <HStack>
                    <Icon as={FaBed} />
                    <Text>Recommended Accommodation</Text>
                  </HStack>
                </Heading>
                <VStack spacing={2} align="stretch">
                  {safeSegments[safeSegments.length - 1].accommodations.map((hotel, index) => (
                    <HStack key={index} spacing={4} p={2}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">{hotel.name || `Hotel ${index + 1}`}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {hotel.distance || 0} mi from route • ${hotel.price || 'N/A'} avg/night
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
              <Divider />
            </>
          )}

          {/* Traffic & Alerts */}
          {safeSegments.some(segment => segment?.alerts?.length > 0) && (
            <Box>
              <Heading size="sm" mb={2}>
                <HStack>
                  <Icon as={FaExclamationTriangle} />
                  <Text>Traffic & Alerts</Text>
                </HStack>
              </Heading>
              <VStack spacing={2} align="stretch">
                {safeSegments.map((segment, index) => (
                  segment?.alerts?.length > 0 && (
                    <Box key={index} p={2}>
                      <Text fontWeight="bold">{segment.name || `Location ${index + 1}`}</Text>
                      {segment.alerts.map((alert, alertIndex) => (
                        <HStack key={alertIndex} mt={1}>
                          <Badge colorScheme={alert.severity === 'high' ? 'red' : 'yellow'}>
                            {alert.type || 'Alert'}
                          </Badge>
                          <Text fontSize="sm">{alert.description || 'No description available'}</Text>
                        </HStack>
                      ))}
                    </Box>
                  )
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

DailyRouteDetails.propTypes = {
  day: PropTypes.number.isRequired,
  segments: PropTypes.array,
  startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  endTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
};

const RouteDetails = ({ route }) => {
  if (!route?.segments) return null;

  // Ensure route.segments is an array
  const safeSegments = Array.isArray(route.segments) ? route.segments : [];

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <Heading size="md" mb={4}>Detailed Route Information</Heading>
      <Accordion allowMultiple>
        {safeSegments.map((daySegment, index) => (
          <DailyRouteDetails
            key={index}
            day={index + 1}
            segments={daySegment?.segments || []}
            startTime={daySegment?.startTime}
            endTime={daySegment?.endTime}
          />
        ))}
      </Accordion>
    </Box>
  );
};

RouteDetails.propTypes = {
  route: PropTypes.shape({
    segments: PropTypes.arrayOf(PropTypes.shape({
      startTime: PropTypes.instanceOf(Date),
      endTime: PropTypes.instanceOf(Date),
      segments: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        restStop: PropTypes.shape({
          name: PropTypes.string,
          facilities: PropTypes.arrayOf(PropTypes.string),
        }),
        timeFromStart: PropTypes.number,
        distanceFromStart: PropTypes.number,
        alerts: PropTypes.arrayOf(PropTypes.shape({
          type: PropTypes.string,
          severity: PropTypes.string,
          description: PropTypes.string,
        })),
        accommodations: PropTypes.arrayOf(PropTypes.shape({
          name: PropTypes.string,
          distance: PropTypes.number,
          price: PropTypes.number,
        })),
      })),
    })),
  }),
};

export default RouteDetails; 