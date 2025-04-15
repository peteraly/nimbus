import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  useColorModeValue,
  Badge,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import {
  FaSun,
  FaCloudRain,
  FaSnowflake,
  FaSmog,
  FaWind,
  FaCloud,
  FaTint
} from 'react-icons/fa';
import PropTypes from 'prop-types';

/**
 * WeatherForecast component displays weather information for locations
 * @param {Object} props - Component props
 * @param {Array} props.locations - Array of locations with weather data
 * @param {Object} props.selectedLocation - Selected location with weather data
 * @param {Function} props.onLocationChange - Function to handle location change
 * @returns {JSX.Element} - WeatherForecast component
 */
const WeatherForecast = ({ locations = [], selectedLocation = null, onLocationChange }) => {
  const toast = useToast();
  
  // Move all color mode values to the top
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const currentWeatherBgColor = useColorModeValue('blue.50', 'blue.900');

  // Get weather icon based on condition
  const getWeatherIcon = (description) => {
    if (!description) return <FaCloud />;
    
    const desc = description.toLowerCase();
    
    if (desc.includes('clear') || desc.includes('sun')) {
      return <FaSun color="#FFD700" />;
    } else if (desc.includes('rain') || desc.includes('shower')) {
      return <FaCloudRain color="#4682B4" />;
    } else if (desc.includes('snow') || desc.includes('sleet')) {
      return <FaSnowflake color="#B0C4DE" />;
    } else if (desc.includes('wind')) {
      return <FaWind color="#A9A9A9" />;
    } else if (desc.includes('fog') || desc.includes('mist')) {
      return <FaSmog color="#C0C0C0" />;
    } else {
      return <FaCloud color="#A9A9A9" />;
    }
  };

  // Format temperature with unit
  const formatTemperature = (tempF) => {
    if (typeof tempF !== 'number') return 'N/A';
    return `${Math.round(tempF)}°F`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (err) {
      console.error('Error formatting date:', err);
      return dateString;
    }
  };

  // Handle location selection change
  const handleLocationChange = (event) => {
    try {
      const selectedId = event.target.value;
      const location = locations.find(loc => loc.id === selectedId);
      onLocationChange(location || null);
    } catch (err) {
      console.error('Error changing location:', err);
      toast({
        title: 'Error changing location',
        description: err.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!locations || locations.length === 0) {
    return (
      <Box p={4} borderWidth={1} borderColor={borderColor} borderRadius="md" bg={bgColor}>
        <Alert status="info" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">No Locations Available</AlertTitle>
          <AlertDescription maxWidth="sm">Add locations to see weather forecasts</AlertDescription>
        </Alert>
      </Box>
    );
  }

  if (!selectedLocation?.weather) {
    return (
      <Box p={4} borderWidth={1} borderColor={borderColor} borderRadius="md" bg={bgColor}>
        <Alert status="info" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">No Weather Data</AlertTitle>
          <AlertDescription maxWidth="sm">Select a location to view weather forecast</AlertDescription>
        </Alert>
      </Box>
    );
  }

  const { current, forecast } = selectedLocation.weather;

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold" color={textColor}>
            Weather Forecast
          </Text>
          <Select
            value={selectedLocation?.id || ''}
            onChange={handleLocationChange}
            placeholder="Select location"
            size="sm"
            maxW="200px"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.address}
              </option>
            ))}
          </Select>
        </HStack>

        <Divider />

        <VStack spacing={4} align="stretch">
          <Text fontWeight="bold" color={textColor}>
            {selectedLocation.address}
          </Text>
          
          {/* Current Weather */}
          <Box 
            p={3} 
            borderWidth={1} 
            borderColor={borderColor} 
            borderRadius="md"
            bg={currentWeatherBgColor}
          >
            <HStack justify="space-between">
              <HStack spacing={4}>
                <Box fontSize="3xl">
                  {getWeatherIcon(current.description)}
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>
                    Current Weather
                  </Text>
                  <Text color={subTextColor}>
                    {current.description}
                  </Text>
                </VStack>
              </HStack>
              <VStack align="end" spacing={0}>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {formatTemperature(current.temperature)}
                </Text>
                <HStack spacing={2}>
                  <Tooltip label="Wind Speed">
                    <Badge colorScheme="blue">
                      <HStack spacing={1}>
                        <FaWind />
                        <Text>{Math.round(current.wind_speed)} mph</Text>
                      </HStack>
                    </Badge>
                  </Tooltip>
                  <Tooltip label="Precipitation">
                    <Badge colorScheme="green">
                      <HStack spacing={1}>
                        <FaTint />
                        <Text>{current.precipitation || 0} mm</Text>
                      </HStack>
                    </Badge>
                  </Tooltip>
                </HStack>
              </VStack>
            </HStack>
          </Box>

          {/* Forecast */}
          {forecast && forecast.slice(0, 5).map((item, index) => (
            <Box 
              key={index} 
              p={3} 
              borderWidth={1} 
              borderColor={borderColor} 
              borderRadius="md"
              _hover={{ bg: hoverBgColor }}
            >
              <HStack justify="space-between">
                <HStack spacing={4}>
                  <Box fontSize="2xl">
                    {getWeatherIcon(item.description)}
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold" color={textColor}>
                      {formatDate(item.date)}
                    </Text>
                    <Text fontSize="sm" color={subTextColor}>
                      {item.description}
                    </Text>
                  </VStack>
                </HStack>
                <VStack align="end" spacing={0}>
                  <Text fontWeight="bold" color={textColor}>
                    {formatTemperature(item.temperature)}
                  </Text>
                  <HStack spacing={2}>
                    <Tooltip label="Wind Speed">
                      <Badge colorScheme="blue">
                        <HStack spacing={1}>
                          <FaWind size="12px" />
                          <Text fontSize="xs">{Math.round(item.wind)} mph</Text>
                        </HStack>
                      </Badge>
                    </Tooltip>
                    <Tooltip label="Precipitation">
                      <Badge colorScheme="green">
                        <HStack spacing={1}>
                          <FaTint size="12px" />
                          <Text fontSize="xs">{item.precipitation || 0} mm</Text>
                        </HStack>
                      </Badge>
                    </Tooltip>
                  </HStack>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

WeatherForecast.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      weather: PropTypes.shape({
        current: PropTypes.shape({
          temperature: PropTypes.number,
          wind_speed: PropTypes.number,
          precipitation: PropTypes.number,
          visibility: PropTypes.number,
          description: PropTypes.string,
          icon: PropTypes.string
        }),
        forecast: PropTypes.arrayOf(
          PropTypes.shape({
            date: PropTypes.string,
            temperature: PropTypes.number,
            wind: PropTypes.number,
            precipitation: PropTypes.number,
            visibility: PropTypes.number,
            description: PropTypes.string,
            icon: PropTypes.string
          })
        )
      })
    })
  ),
  selectedLocation: PropTypes.object,
  onLocationChange: PropTypes.func.isRequired
};

export default WeatherForecast; 