import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Spinner,
  HStack,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { format, isToday, isTomorrow } from 'date-fns';

function WeatherForecast({ locations }) {
  console.log('WeatherForecast received locations:', locations);
  
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

  // Group forecast data by day for each location
  const getDailyForecasts = (forecast) => {
    console.log('Processing forecast data:', forecast);
    const dailyForecasts = {};
    forecast.forEach(item => {
      const date = new Date(item.date);
      const dateKey = date.toISOString().split('T')[0]; // Use YYYY-MM-DD format for consistent sorting
      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = [];
      }
      dailyForecasts[dateKey].push(item);
    });
    
    console.log('Grouped forecasts by day:', dailyForecasts);
    
    // Sort days chronologically
    return Object.keys(dailyForecasts)
      .sort()
      .reduce((result, key) => {
        result[key] = dailyForecasts[key].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        return result;
      }, {});
  };

  // Get day label (Today, Tomorrow, or date)
  const getDayLabel = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  // Format wind speed to handle NaN values
  const formatWindSpeed = (wind) => {
    if (wind === undefined || wind === null || isNaN(wind)) {
      return 'N/A';
    }
    return `${Math.round(wind)} mph`;
  };

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <Heading size="md">Weather Forecast</Heading>

        {locations.map((location, index) => {
          console.log(`Processing location ${index}:`, location.address);
          const dailyForecasts = location.forecast ? getDailyForecasts(location.forecast) : {};
          const sortedDays = Object.keys(dailyForecasts).slice(0, 6); // Get current day + 5 days
          console.log(`Sorted days for ${location.address}:`, sortedDays);
          
          return (
            <Box key={index} p={4} bg={locationBgColor} borderRadius="md">
              <Text fontWeight="bold" mb={4}>{location.address}</Text>
              {location.forecast && Array.isArray(location.forecast) && location.forecast.length > 0 ? (
                <VStack spacing={4} align="stretch">
                  {sortedDays.map((dateKey) => {
                    const hours = dailyForecasts[dateKey];
                    const isCurrentDay = isToday(new Date(dateKey));
                    console.log(`Hours for ${dateKey}:`, hours.length);
                    
                    return (
                      <Box key={dateKey}>
                        <HStack mb={2}>
                          <Text fontSize="sm" fontWeight="medium">
                            {getDayLabel(dateKey)}
                          </Text>
                          {isCurrentDay && (
                            <Badge colorScheme="blue">Current Day</Badge>
                          )}
                        </HStack>
                        <Box overflowX="auto">
                          <Flex wrap="wrap" gap={1}>
                            {hours.map((hour, hourIndex) => (
                              <Box 
                                key={hourIndex} 
                                p={1} 
                                bg={hour.wind > 20 || hour.visibility < 5000 ? 'red.50' : 'gray.50'}
                                borderRadius="sm"
                                borderWidth={isCurrentDay ? 1 : 0}
                                borderColor="blue.200"
                                fontSize="xs"
                                minW="60px"
                                flex="0 0 auto"
                              >
                                <Text fontWeight={isCurrentDay ? "medium" : "normal"}>
                                  {format(new Date(hour.date), 'h a')}
                                </Text>
                                <Text>{Math.round(hour.temperature)}°F</Text>
                                <Text color={hour.wind > 20 ? 'red.500' : 'gray.500'}>
                                  {formatWindSpeed(hour.wind)}
                                </Text>
                                {hour.precipitation > 0 && (
                                  <Text color="blue.500">
                                    {hour.precipitation.toFixed(1)} mm/h
                                  </Text>
                                )}
                                <Text color={hour.visibility < 5000 ? 'red.500' : 'gray.500'}>
                                  {(hour.visibility / 1000).toFixed(1)} km
                                </Text>
                              </Box>
                            ))}
                          </Flex>
                        </Box>
                      </Box>
                    );
                  })}
                </VStack>
              ) : (
                <Box display="flex" justifyContent="center" p={4}>
                  <Spinner />
                </Box>
              )}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}

export default WeatherForecast; 