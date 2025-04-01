import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiFog } from 'react-icons/wi';

function WeatherForecast({ locations, alerts }) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const locationBgColor = useColorModeValue('gray.50', 'gray.700');

  if (!locations || locations.length === 0) {
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <Text>Add locations to see weather forecasts</Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <Heading size="md">Weather Forecast</Heading>

        {alerts && alerts.length > 0 && (
          <Box>
            <Heading size="sm" mb={4}>Weather Alerts</Heading>
            {alerts.map((alert, index) => (
              <Alert key={index} status="warning" mb={2}>
                <AlertIcon />
                <Box>
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Box>
              </Alert>
            ))}
          </Box>
        )}

        <Box>
          <Heading size="sm" mb={4}>Location Forecasts</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {locations.map((location, index) => (
              <Box key={index} p={4} bg={locationBgColor} borderRadius="md">
                <Text fontWeight="bold" mb={2}>{location.address}</Text>
                {location.forecast ? (
                  <SimpleGrid columns={5} spacing={2}>
                    {location.forecast.map((day, dayIndex) => (
                      <Box key={dayIndex} textAlign="center">
                        <Text fontSize="sm" color="gray.500">
                          {format(new Date(day.date), 'EEE')}
                        </Text>
                        {getWeatherIcon(day.condition)}
                        <Text fontSize="sm">{Math.round(day.temperature)}°F</Text>
                        <Text fontSize="xs" color="gray.500">
                          {Math.round(day.windSpeed)} mph
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Spinner size="sm" mr={2} />
                    <Text display="inline">Loading forecast...</Text>
                  </Box>
                )}
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}

function getWeatherIcon(condition) {
  const iconSize = 24;
  switch (condition?.toLowerCase()) {
    case 'clear':
      return <WiDaySunny size={iconSize} />;
    case 'cloudy':
      return <WiCloudy size={iconSize} />;
    case 'rain':
      return <WiRain size={iconSize} />;
    case 'snow':
      return <WiSnow size={iconSize} />;
    case 'fog':
      return <WiFog size={iconSize} />;
    default:
      return <WiDaySunny size={iconSize} />;
  }
}

export default WeatherForecast; 