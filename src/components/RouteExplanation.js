import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
  Divider,
  useColorModeValue,
  Tooltip,
  List,
  ListItem,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { 
  FaSun, 
  FaCloud, 
  FaWind, 
  FaEye, 
  FaThermometerHalf, 
  FaRoute, 
  FaClock, 
  FaMapMarkerAlt,
  FaArrowRight,
  FaExclamationTriangle,
  FaShieldAlt
} from 'react-icons/fa';

const RouteExplanation = ({ route }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const warningColor = useColorModeValue('orange.500', 'orange.300');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');

  if (!route) return null;

  // Helper function to get color scheme based on score
  const getScoreColorScheme = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  // Format distance to km
  const formatDistance = (meters) => {
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Format duration to hours and minutes
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getWeatherWarnings = (forecast) => {
    const warnings = [];
    if (forecast.temperature < 32 || forecast.temperature > 95) {
      warnings.push('Temperature risk');
    }
    if (forecast.wind > 20) {
      warnings.push('High winds');
    }
    if (forecast.precipitation > 0.1) {
      warnings.push('Rain');
    }
    if (forecast.visibility < 5000) {
      warnings.push('Poor visibility');
    }
    return warnings;
  };

  return (
    <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
      <VStack spacing={4} align="stretch">
        {/* Route Summary Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="lg" fontWeight="bold">Optimized Route Plan</Text>
            <HStack>
              <Icon as={FaShieldAlt} color={getScoreColorScheme(route.safetyPercentage)} />
              <Text fontSize="sm">Overall Safety Score: {route.safetyPercentage}%</Text>
            </HStack>
          </VStack>
          <VStack align="end" spacing={1}>
            <HStack>
              <Icon as={FaRoute} />
              <Text fontSize="sm">{formatDistance(route.distance)}</Text>
            </HStack>
            <HStack>
              <Icon as={FaClock} />
              <Text fontSize="sm">{formatDuration(route.duration)}</Text>
            </HStack>
          </VStack>
        </HStack>

        <Divider />

        {/* Route Sequence with Weather */}
        <VStack spacing={3} align="stretch">
          <Text fontWeight="semibold">Route Order with Current Weather:</Text>
          
          {route.route.map((location, index) => {
            const weatherScore = route.weatherScores.find(ws => ws.location === location.address);
            const forecast = location.forecast?.[0];
            const legDistance = index < route.route.length - 1 ? route.legs?.[index] : null;
            if (!forecast) return null;

            const warnings = getWeatherWarnings(forecast);

            return (
              <Box key={location.address}>
                <Grid 
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }} 
                  gap={3}
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor={borderColor}
                  bg={cardBgColor}
                >
                  {/* Location Info */}
                  <GridItem>
                    <VStack align="stretch" spacing={2}>
                      <HStack>
                        <Badge colorScheme="blue">{index + 1}</Badge>
                        <Text fontWeight="medium" fontSize="sm">
                          {location.address}
                          {index === 0 && <Badge ml={2} colorScheme="green">Start</Badge>}
                        </Text>
                      </HStack>
                      
                      <HStack>
                        <Tooltip label="Weather safety score">
                          <Badge colorScheme={getScoreColorScheme(weatherScore?.score)}>
                            {weatherScore?.score}% Safe
                          </Badge>
                        </Tooltip>
                      </HStack>
                    </VStack>
                  </GridItem>

                  {/* Current Weather */}
                  <GridItem>
                    <VStack align="stretch" spacing={2}>
                      <Text fontSize="sm" fontWeight="medium">Current Weather:</Text>
                      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                        <HStack>
                          <Icon as={FaThermometerHalf} />
                          <Text fontSize="sm">{forecast.temperature}°F</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaWind} />
                          <Text fontSize="sm">{forecast.wind} mph</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaCloud} />
                          <Text fontSize="sm">{forecast.precipitation} mm/h</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FaEye} />
                          <Text fontSize="sm">{(forecast.visibility / 1000).toFixed(1)} km</Text>
                        </HStack>
                      </Grid>

                      {/* Weather Warnings */}
                      {warnings.length > 0 && (
                        <HStack spacing={2} fontSize="xs" color={warningColor}>
                          <Icon as={FaExclamationTriangle} />
                          <Text>{warnings.join(' • ')}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </GridItem>
                </Grid>

                {/* Distance to Next Stop */}
                {legDistance && (
                  <HStack 
                    justify="center" 
                    fontSize="sm" 
                    color="gray.500" 
                    my={2}
                    spacing={2}
                  >
                    <Icon as={FaArrowRight} />
                    <Text>{formatDistance(legDistance.distance)}</Text>
                    <Text>({formatDuration(legDistance.duration)})</Text>
                  </HStack>
                )}
              </Box>
            );
          })}
        </VStack>

        <Divider />

        {/* Route Details Accordion */}
        <Accordion allowMultiple>
          <AccordionItem border="none">
            <AccordionButton px={0}>
              <Box flex="1" textAlign="left">
                <Text fontWeight="semibold">Route Details</Text>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} px={0}>
              <VStack spacing={3} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Weather Safety Scoring:</Text>
                  <Text fontSize="sm" ml={4}>
                    • Optimal conditions: {'>'}80% safety score
                    <br />
                    • Moderate risk: 60-80% safety score
                    <br />
                    • High risk: {'<'}60% safety score
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium">Route Statistics:</Text>
                  <Text fontSize="sm" ml={4}>
                    • Average distance between stops: {formatDistance(route.distance / (route.route.length - 1))}
                    <br />
                    • Locations with good weather: {route.weatherScores.filter(s => s.score >= 70).length}
                    <br />
                    • Locations with weather risks: {route.weatherScores.filter(s => s.score < 60).length}
                  </Text>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </VStack>
    </Box>
  );
};

export default RouteExplanation; 