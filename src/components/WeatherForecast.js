import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiFog } from 'react-icons/wi';

function WeatherForecast({ locations }) {
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

        {locations.map((location, index) => (
          <Box key={index} p={4} bg={locationBgColor} borderRadius="md">
            <Text fontWeight="bold" mb={2}>{location.address}</Text>
            {location.forecast && Array.isArray(location.forecast) && location.forecast.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {location.forecast.map((day, dayIndex) => (
                  <Box key={dayIndex} p={2}>
                    <Text fontSize="sm" color="gray.500">
                      {format(new Date(day.date), 'MMM d, yyyy')}
                    </Text>
                    <Box display="flex" alignItems="center" gap={2}>
                      {getWeatherIcon(day?.weather)}
                      <Text>{Math.round(day?.temperature || 0)}°F</Text>
                    </Box>
                    <Text fontSize="sm">
                      Wind: {Math.round(day?.wind_speed || 0)} mph
                    </Text>
                    {day?.precipitation > 0 && (
                      <Text fontSize="sm" color="blue.500">
                        Rain: {(day.precipitation || 0).toFixed(1)} mm/h
                      </Text>
                    )}
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Box display="flex" justifyContent="center" p={4}>
                <Spinner />
              </Box>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
}

function getWeatherIcon(condition) {
  if (!condition) return <WiDaySunny size={24} />;
  
  try {
    switch (condition.toLowerCase()) {
      case 'clear':
        return <WiDaySunny size={24} />;
      case 'clouds':
      case 'cloudy':
        return <WiCloudy size={24} />;
      case 'rain':
      case 'drizzle':
        return <WiRain size={24} />;
      case 'snow':
        return <WiSnow size={24} />;
      case 'fog':
      case 'mist':
        return <WiFog size={24} />;
      default:
        return <WiDaySunny size={24} />;
    }
  } catch (error) {
    console.error('Error getting weather icon:', error);
    return <WiDaySunny size={24} />;
  }
}

export default WeatherForecast; 