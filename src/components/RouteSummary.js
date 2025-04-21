import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Divider,
  Icon,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Grid,
  GridItem,
  Flex,
  useColorModeValue,
  SimpleGrid,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaRoute, 
  FaCalendarAlt,
  FaThermometerHalf,
  FaWind,
  FaCloudRain,
  FaEye,
  FaExclamationTriangle
} from 'react-icons/fa';
import { formatDistance, formatDuration, formatTime } from '../utils/formatters';
import { format } from 'date-fns';
import { MdLocationOn, MdWarning } from 'react-icons/md';
import { 
  WiDaySunny, 
  WiRain, 
  WiStrongWind, 
  WiThermometer,
  WiDayFog
} from 'react-icons/wi';

const WeatherWarning = ({ warning, severity }) => {
  const bgColor = {
    low: 'yellow.100',
    medium: 'orange.100',
    high: 'red.100'
  }[severity];

  const textColor = {
    low: 'yellow.800',
    medium: 'orange.800',
    high: 'red.800'
  }[severity];

  return (
    <Box 
      p={2} 
      bg={bgColor} 
      color={textColor} 
      borderRadius="md" 
      display="flex" 
      alignItems="center"
      mb={2}
    >
      <Icon as={FaExclamationTriangle} mr={2} />
      <Text fontSize="sm">{warning}</Text>
    </Box>
  );
};

WeatherWarning.propTypes = {
  warning: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(['low', 'medium', 'high']).isRequired
};

const WeatherIcon = ({ condition, value, threshold, warningThreshold }) => {
  let color = 'green.500';
  if (value >= threshold) color = 'red.500';
  else if (value >= warningThreshold) color = 'yellow.500';
  
  return (
    <Tooltip label={`${condition}: ${value}`}>
      <Box color={color} display="inline-block">
        {condition === 'Wind' && <WiStrongWind />}
        {condition === 'Rain' && <WiRain />}
        {condition === 'Temperature' && <WiThermometer />}
        {condition === 'Visibility' && <WiDayFog />}
        {condition === 'Clear' && <WiDaySunny />}
      </Box>
    </Tooltip>
  );
};

WeatherIcon.propTypes = {
  condition: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  threshold: PropTypes.number.isRequired,
  warningThreshold: PropTypes.number.isRequired
};

const WeatherSummary = ({ conditions }) => {
  if (!conditions) return null;
  
  return (
    <HStack spacing={3}>
      <WeatherIcon 
        condition="Wind" 
        value={conditions.wind_speed}
        threshold={12}
        warningThreshold={8}
      />
      <WeatherIcon 
        condition="Rain" 
        value={conditions.precipitation}
        threshold={0.25}
        warningThreshold={0.1}
      />
      <WeatherIcon 
        condition="Temperature" 
        value={conditions.temp}
        threshold={35}
        warningThreshold={30}
      />
      <WeatherIcon 
        condition="Visibility" 
        value={conditions.visibility / 1000}
        threshold={5}
        warningThreshold={8}
      />
    </HStack>
  );
};

WeatherSummary.propTypes = {
  conditions: PropTypes.shape({
    wind_speed: PropTypes.number.isRequired,
    precipitation: PropTypes.number.isRequired,
    temp: PropTypes.number.isRequired,
    visibility: PropTypes.number.isRequired
  }).isRequired
};

const WeatherScore = ({ score }) => {
  let color = 'green.500';
  let label = 'EXCELLENT';
  
  if (score < 40) {
    color = 'red.500';
    label = 'UNSAFE';
  } else if (score < 60) {
    color = 'orange.500';
    label = 'POOR';
  } else if (score < 70) {
    color = 'yellow.500';
    label = 'FAIR';
  } else if (score < 80) {
    color = 'green.400';
    label = 'GOOD';
  }

  return (
    <VStack align="stretch" spacing={1}>
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600">Weather Score:</Text>
        <Badge colorScheme={color.split('.')[0]}>{label}</Badge>
      </HStack>
      <Progress value={score} colorScheme={color.split('.')[0]} size="sm" />
    </VStack>
  );
};

WeatherScore.propTypes = {
  score: PropTypes.number.isRequired
};

const WeatherDisplay = ({ conditions, score, arrivalTime }) => {
  if (!conditions || !score) return null;

  const getFlightStatus = (score, conditions) => {
    if (score.score >= 80) return { label: 'OPTIMAL FOR FLIGHT', color: 'green', icon: WiDaySunny };
    if (score.score >= 60) return { label: 'FLYABLE WITH CAUTION', color: 'yellow', icon: WiDaySunny };
    return { label: 'UNSAFE FOR FLIGHT', color: 'red', icon: getWeatherIcon(conditions) };
  };

  const getWeatherIcon = (conditions) => {
    if (conditions.wind_speed > 10) return WiStrongWind;
    if (conditions.precipitation > 0.5) return WiRain;
    if (conditions.visibility < 5000) return WiDayFog;
    return WiDaySunny;
  };

  const getPrimaryWarning = (conditions) => {
    if (conditions.wind_speed > 10) return 'High winds';
    if (conditions.precipitation > 0.5) return 'Rain';
    if (conditions.visibility < 5000) return 'Poor visibility';
    return 'Clear conditions';
  };

  const status = getFlightStatus(score, conditions);

  return (
    <Box 
      p={3} 
      bg="white" 
      borderRadius="lg" 
      border="1px" 
      borderColor={`${status.color}.200`}
      position="relative"
      overflow="hidden"
    >
      {/* Status Banner */}
      <Box 
        bg={`${status.color}.100`} 
        p={2} 
        mb={3} 
        mx={-3} 
        mt={-3}
        borderBottom="1px"
        borderColor={`${status.color}.200`}
      >
        <VStack spacing={1}>
          <HStack spacing={2} justify="center">
            <Icon as={status.icon} boxSize={5} color={`${status.color}.500`} />
            <Text fontWeight="bold" color={`${status.color}.700`}>
              {status.label}
              </Text>
            </HStack>
          {arrivalTime && (
            <Text fontSize="sm" color={`${status.color}.600`}>
              at {format(new Date(arrivalTime), 'h:mm a')}
            </Text>
          )}
        </VStack>
      </Box>

      <VStack spacing={3} align="stretch">
        {/* Primary Weather Info */}
        <HStack justify="space-between">
          <Text fontSize="2xl" fontWeight="bold">
            {conditions.temp}°C
          </Text>
          <Text color="gray.600" fontSize="md">
            {getPrimaryWarning(conditions)}
          </Text>
                    </HStack>
                    
        {/* Key Flight Conditions */}
        <SimpleGrid columns={2} spacing={3}>
                            <HStack>
            <Icon as={FaWind} color={conditions.wind_speed > 10 ? "red.500" : "gray.500"} />
            <VStack spacing={0} align="start">
              <Text fontSize="sm">Wind Speed</Text>
              <Text fontSize="sm" fontWeight="medium">
                {conditions.wind_speed} m/s
                {conditions.wind_speed > 10 && " ⚠️"}
              </Text>
            </VStack>
                            </HStack>
                            <HStack>
            <Icon as={FaCloudRain} color={conditions.precipitation > 0.5 ? "red.500" : "gray.500"} />
            <VStack spacing={0} align="start">
              <Text fontSize="sm">Precipitation</Text>
              <Text fontSize="sm" fontWeight="medium">
                {conditions.precipitation} mm
                {conditions.precipitation > 0.5 && " ⚠️"}
              </Text>
            </VStack>
                            </HStack>
                            <HStack>
            <Icon as={FaEye} color={conditions.visibility < 5000 ? "red.500" : "gray.500"} />
            <VStack spacing={0} align="start">
              <Text fontSize="sm">Visibility</Text>
              <Text fontSize="sm" fontWeight="medium">
                {(conditions.visibility/1000).toFixed(1)} km
                {conditions.visibility < 5000 && " ⚠️"}
              </Text>
            </VStack>
                            </HStack>
                            <HStack>
            <Icon as={FaThermometerHalf} color={Math.abs(conditions.temp) > 30 ? "red.500" : "gray.500"} />
            <VStack spacing={0} align="start">
              <Text fontSize="sm">Temperature</Text>
              <Text fontSize="sm" fontWeight="medium">
                {conditions.temp}°C
                {Math.abs(conditions.temp) > 30 && " ⚠️"}
              </Text>
            </VStack>
                            </HStack>
                          </SimpleGrid>

        {/* Flight Recommendations */}
        {score.warnings?.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>
              Flight Recommendations:
                              </Text>
            <VStack align="start" spacing={1}>
              {score.warnings.map((warning, idx) => (
                <HStack key={idx} spacing={2} color="gray.600">
                  <Text as="span" color="red.500">•</Text>
                  <Text fontSize="sm">{warning}</Text>
                            </HStack>
              ))}
                        </VStack>
                      </Box>
                    )}
                    
        {/* Alternative Times */}
        {score.score < 60 && score.betterTimes && (
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="green.600" mb={1}>
              Better Flight Times Today:
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {score.betterTimes.map((time, idx) => (
                <Badge key={idx} colorScheme="green" variant="subtle">
                  {format(new Date(time), 'h:mm a')}
                </Badge>
              ))}
                            </HStack>
                      </Box>
                    )}
                  </VStack>
                </Box>
              );
};

WeatherDisplay.propTypes = {
  conditions: PropTypes.shape({
    temp: PropTypes.number.isRequired,
    wind_speed: PropTypes.number.isRequired,
    precipitation: PropTypes.number.isRequired,
    visibility: PropTypes.number.isRequired
  }).isRequired,
  score: PropTypes.shape({
    score: PropTypes.number.isRequired,
    warnings: PropTypes.arrayOf(PropTypes.string),
    betterTimes: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  arrivalTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
};

const RouteLocation = ({ location, isLast }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
          
          return (
    <Box 
      borderBottom={!isLast ? `1px solid` : 'none'} 
      borderColor={borderColor} 
      pb={4}
      _hover={{ bg: 'gray.50' }}
      borderRadius="md"
      transition="all 0.2s"
    >
      <Grid templateColumns="1fr auto" gap={4}>
        <Box>
          <HStack spacing={4} mb={2}>
            <Icon as={MdLocationOn} color="blue.500" boxSize={5} />
            <Box>
              <Text fontWeight="medium">{location.name || location.address}</Text>
              {location.address && location.name && (
                <Text fontSize="sm" color="gray.600">{location.address}</Text>
              )}
            </Box>
          </HStack>

          <Box ml={8}>
            <Text fontSize="sm" color="gray.600" mb={1}>Arrival Time:</Text>
            <Text fontSize="md">
              {location.plannedDate ? (
                <>
                  {format(new Date(location.plannedDate), 'PPP')}
                  <Text fontSize="sm" color="gray.600">
                    {format(new Date(location.plannedDate), 'p')}
                  </Text>
                </>
              ) : (
                'Not scheduled'
              )}
            </Text>
          </Box>
        </Box>

        {location.weatherScore && (
          <Box width="350px">
            <WeatherDisplay 
              conditions={location.weatherScore.conditions}
              score={location.weatherScore}
              arrivalTime={location.plannedDate}
            />
          </Box>
        )}
      </Grid>

      {!isLast && location.distanceToNext && location.durationToNext && (
        <HStack spacing={2} mt={3} pl={8} color="gray.600">
          <Icon as={FaRoute} />
          <Text fontSize="sm">
            Next stop: {formatDistance(location.distanceToNext)} • {formatDuration(location.durationToNext)}
          </Text>
              </HStack>
      )}
    </Box>
  );
};

RouteLocation.propTypes = {
  location: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    plannedDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    weatherScore: PropTypes.shape({
      score: PropTypes.number,
      warnings: PropTypes.arrayOf(PropTypes.string),
      conditions: PropTypes.shape({
        temp: PropTypes.number.isRequired,
        wind_speed: PropTypes.number.isRequired,
        precipitation: PropTypes.number.isRequired,
        visibility: PropTypes.number.isRequired
      })
    })
  }).isRequired,
  isLast: PropTypes.bool
};

const LocationWeatherForecast = ({ weatherData }) => {
  if (!weatherData?.forecasts) return null;
                    
                    return (
    <Accordion allowToggle>
      <AccordionItem border="none">
        <AccordionButton px={0}>
          <Box flex="1" textAlign="left">
            <Text fontSize="sm" fontWeight="medium">7-Day Forecast</Text>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4} px={0}>
          <Table size="sm" variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Conditions</Th>
                <Th>Score</Th>
              </Tr>
            </Thead>
            <Tbody>
              {weatherData.forecasts.map((day, idx) => (
                <Tr key={idx}>
                  <Td>{format(new Date(day.date), 'MMM d')}</Td>
                  <Td><WeatherSummary conditions={day.conditions} /></Td>
                  <Td>
                    <Badge 
                      colorScheme={day.score.isSafe ? 'green' : 'red'}
                      variant="subtle"
                    >
                      {day.score.score}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

LocationWeatherForecast.propTypes = {
  weatherData: PropTypes.shape({
    forecasts: PropTypes.arrayOf(PropTypes.shape({
      date: PropTypes.string.isRequired,
      conditions: PropTypes.shape({
        wind_speed: PropTypes.number.isRequired,
        precipitation: PropTypes.number.isRequired,
        temp: PropTypes.number.isRequired,
        visibility: PropTypes.number.isRequired
      }).isRequired,
      score: PropTypes.shape({
        score: PropTypes.number.isRequired,
        isSafe: PropTypes.bool.isRequired
      }).isRequired
    })).isRequired
  }).isRequired
};

const DailyWeatherSummary = ({ segment }) => {
  if (!segment?.weatherSummary) return null;

  const { conditions } = segment.weatherSummary;
  const getConditionColor = (value, threshold) => value >= threshold ? "red.500" : "gray.500";

  return (
    <HStack spacing={4} ml={4}>
      <HStack spacing={2}>
        <Icon 
          as={FaThermometerHalf} 
          color={getConditionColor(Math.abs(conditions.temp), 30)} 
        />
        <Text fontSize="sm">{conditions.temp}°C</Text>
                            </HStack>
      <HStack spacing={2}>
        <Icon 
          as={FaWind} 
          color={getConditionColor(conditions.wind_speed, 10)}
        />
        <Text fontSize="sm">{conditions.wind_speed}m/s</Text>
                            </HStack>
      <HStack spacing={2}>
        <Icon 
          as={FaCloudRain} 
          color={getConditionColor(conditions.precipitation, 0.5)}
        />
        <Text fontSize="sm">{conditions.precipitation}mm</Text>
                            </HStack>
      <HStack spacing={2}>
        <Icon 
          as={FaEye} 
          color={getConditionColor(5000 / conditions.visibility, 1)}
        />
        <Text fontSize="sm">{(conditions.visibility/1000).toFixed(1)}km</Text>
                            </HStack>
                </HStack>
  );
};

DailyWeatherSummary.propTypes = {
  segment: PropTypes.shape({
    weatherSummary: PropTypes.shape({
      conditions: PropTypes.shape({
        temp: PropTypes.number.isRequired,
        wind_speed: PropTypes.number.isRequired,
        precipitation: PropTypes.number.isRequired,
        visibility: PropTypes.number.isRequired
      }).isRequired
    })
  })
};

const DailySegment = ({ segment, dayNumber }) => {
  if (!segment) return null;

  const getDayStatus = () => {
    if (!segment.weatherWarnings?.length) return { color: 'green', text: 'All Clear' };
    if (segment.weatherWarnings.length <= 1) return { color: 'yellow', text: 'Minor Issues' };
    return { color: 'red', text: 'Weather Alerts' };
  };

  const status = getDayStatus();
  const weatherSummary = segment.weatherSummary?.conditions;

  return (
    <AccordionItem>
      <AccordionButton py={3}>
        <Grid templateColumns="auto 1fr auto" width="100%" gap={6} alignItems="center">
          <HStack spacing={3}>
            <Icon as={FaCalendarAlt} color="purple.500" />
            <Text fontWeight="bold">Day {dayNumber}</Text>
              </HStack>
              
          {weatherSummary && (
            <HStack spacing={6} flex={1}>
              <Text fontSize="sm" color="gray.600">
                🌡️ {weatherSummary.temp}°C
              </Text>
              <Text fontSize="sm" color="gray.600">
                💨 {weatherSummary.wind_speed}m/s
              </Text>
              <Text fontSize="sm" color="gray.600">
                🌧️ {weatherSummary.precipitation}mm
              </Text>
              <Text fontSize="sm" color="gray.600">
                👁️ {(weatherSummary.visibility/1000).toFixed(1)}km
              </Text>
              <Badge colorScheme={status.color} variant="subtle">
                {status.text}
                      </Badge>
              <Text fontSize="sm" color="gray.600">
                {formatDistance(segment.distance || 0)} • {formatDuration(segment.duration || 0)}
              </Text>
                    </HStack>
          )}

          <AccordionIcon />
        </Grid>
      </AccordionButton>
      <AccordionPanel pb={4}>
        <VStack spacing={4} align="stretch">
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <Box>
              <Text fontSize="sm" color="gray.600">Start Time</Text>
              <Text fontWeight="medium">{formatTime(segment.startTime)}</Text>
              </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">End Time</Text>
              <Text fontWeight="medium">{formatTime(segment.endTime)}</Text>
        </Box>
          </Grid>
          
          {segment.weatherWarnings?.length > 0 && (
            <Box>
              {segment.weatherWarnings.map((warning, idx) => (
                <WeatherWarning key={idx} warning={warning} severity="high" />
              ))}
            </Box>
          )}
          
          <Box>
            <VStack spacing={3} align="stretch">
              {segment.locations?.map((location, idx) => (
                <Box key={`${location.name || idx}-${idx}`}>
                  <RouteLocation 
                    location={location}
                    isLast={idx === (segment.locations?.length || 0) - 1}
                  />
                  </Box>
                ))}
              </VStack>
          </Box>
        </VStack>
      </AccordionPanel>
    </AccordionItem>
  );
};

DailySegment.propTypes = {
  segment: PropTypes.shape({
    startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    endTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    distance: PropTypes.number,
    duration: PropTypes.number,
    weatherWarnings: PropTypes.arrayOf(PropTypes.string),
    locations: PropTypes.arrayOf(PropTypes.object),
    weatherSummary: PropTypes.shape({
      conditions: PropTypes.shape({
        temp: PropTypes.number.isRequired,
        wind_speed: PropTypes.number.isRequired,
        precipitation: PropTypes.number.isRequired,
        visibility: PropTypes.number.isRequired
      })
    })
  }),
  dayNumber: PropTypes.number.isRequired
};

const RouteSummary = ({ route, title, isWeatherOptimized = false }) => {
  if (!route?.summary) return null;

  const {
    totalLocations,
    totalDistance,
    totalDuration,
    numberOfDays,
    weatherSafety,
    weatherWarnings = [],
    missingLocations = []
  } = route.summary;

  // Ensure we have valid segments
  const safeSegments = route.segments || [];

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <VStack spacing={4} align="stretch">
        <Heading size="md">{title || 'Route Summary'}</Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem colSpan={2}>
            <Progress 
              value={weatherSafety ? 100 : 0} 
              colorScheme={weatherSafety ? 'green' : 'red'}
              size="sm" 
              borderRadius="full"
            />
          </GridItem>

          <Box>
            <Text fontSize="sm" color="gray.600">Total Distance</Text>
            <Text fontSize="xl" fontWeight="bold">{formatDistance(totalDistance)}</Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.600">Total Duration</Text>
            <Text fontSize="xl" fontWeight="bold">{formatDuration(totalDuration)}</Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.600">Stops</Text>
            <Text fontSize="xl" fontWeight="bold">{totalLocations}</Text>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.600">Days</Text>
            <Text fontSize="xl" fontWeight="bold">{numberOfDays}</Text>
          </Box>
        </Grid>

        {weatherWarnings.length > 0 && (
          <Box mt={2}>
            {weatherWarnings.map((warning, idx) => (
              <WeatherWarning key={idx} warning={warning} severity="high" />
            ))}
          </Box>
        )}

        {missingLocations.length > 0 && (
          <Alert status="warning" mt={2}>
            <AlertIcon />
            <Box>
              <AlertTitle>Some locations could not be included in the route</AlertTitle>
              <AlertDescription>
                The following locations were not included: {missingLocations.join(', ')}
              </AlertDescription>
        </Box>
          </Alert>
        )}

        <Divider />

        <Accordion defaultIndex={[0]} allowMultiple>
          {safeSegments.map((segment, idx) => (
            <DailySegment 
              key={idx} 
              segment={segment}
              dayNumber={idx + 1} 
            />
          ))}
        </Accordion>
      </VStack>
    </Box>
  );
};

RouteSummary.propTypes = {
  route: PropTypes.shape({
    summary: PropTypes.shape({
      totalLocations: PropTypes.number,
      totalDistance: PropTypes.number,
      totalDuration: PropTypes.number,
      numberOfDays: PropTypes.number,
      weatherSafety: PropTypes.bool,
      weatherWarnings: PropTypes.arrayOf(PropTypes.string),
      missingLocations: PropTypes.arrayOf(PropTypes.string)
    }),
    segments: PropTypes.arrayOf(PropTypes.shape({
      locations: PropTypes.arrayOf(PropTypes.object),
      distance: PropTypes.number,
      duration: PropTypes.number,
      startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      endTime: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
      dayNumber: PropTypes.number,
      weatherWarnings: PropTypes.arrayOf(PropTypes.string)
    }))
  }),
  title: PropTypes.string,
  isWeatherOptimized: PropTypes.bool
};

const RouteComparison = ({ routes }) => {
  if (!routes?.distanceOptimized) {
    return null;
  }

  return (
    <Box>
      <RouteSummary 
        route={routes.distanceOptimized} 
        title="Optimized Route"
        isWeatherOptimized={false}
      />
    </Box>
  );
};

RouteComparison.propTypes = {
  routes: PropTypes.shape({
    distanceOptimized: PropTypes.object
  })
};

const priority = {
  'EXCELLENT': 5,
  'GOOD': 4,
  'FAIR': 3,
  'POOR': 2,
  'UNSAFE': 1,
  'unavailable': 0
};

export { RouteComparison as default, RouteSummary }; 