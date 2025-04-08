import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  VStack,
  Heading,
  useColorModeValue,
  IconButton,
  useColorMode,
  useToast,
  HStack,
  Text,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import AddressInput from './components/AddressInput';
import MapDisplay from './components/MapDisplay';
import RouteSummary from './components/RouteSummary';
import WeatherForecast from './components/WeatherForecast';
import Settings from './pages/Settings';
import { getOptimizedRoute } from './utils/routeUtils';
import RouteOptions from './components/RouteOptions';
import { getWeatherData } from './services/weatherService';

function App() {
  const [locations, setLocations] = useState([]);
  const [startLocation, setStartLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [settings, setSettings] = useState({
    display: {
      showWeatherOverlay: true,
    },
  });
  const [weatherData, setWeatherData] = useState({});
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const weatherDataRef = useRef(weatherData);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const { colorMode, toggleColorMode } = useColorMode();

  // Keep weatherDataRef in sync with weatherData
  useEffect(() => {
    weatherDataRef.current = weatherData;
  }, [weatherData]);

  // Fetch weather data when locations or startLocation change
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Create a map of existing weather data
        const newWeatherData = { ...weatherData };
        let hasUpdates = false;

        // Fetch weather data for start location if it doesn't have it yet
        if (startLocation && startLocation.address && !newWeatherData[startLocation.address]) {
          console.log(`Fetching weather data for start location: ${startLocation.address}`);
          const data = await getWeatherData(startLocation);
          if (data) {
            console.log(`Received weather data for start location: ${startLocation.address}`, data);
            newWeatherData[startLocation.address] = data;
            hasUpdates = true;
          }
        }

        // Fetch weather data for each location that doesn't have it yet
        for (const location of locations) {
          if (!location.address || newWeatherData[location.address]) {
            continue;
          }

          console.log(`Fetching weather data for: ${location.address}`);
          const data = await getWeatherData(location);
          if (data) {
            console.log(`Received weather data for: ${location.address}`, data);
            newWeatherData[location.address] = data;
            hasUpdates = true;
          }
        }

        // Only update state if we have new weather data
        if (hasUpdates) {
          console.log('Updating weather data state with new data');
          setWeatherData(newWeatherData);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        toast({
          title: 'Error fetching weather data',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchWeatherData();
  }, [locations, startLocation, toast, weatherData]);

  // Add this new effect to handle route optimization
  const optimizeRoute = useCallback(async () => {
    if (locations.length < 1) return;
    
    try {
      // Check if we have weather data for all locations
      const allLocations = startLocation ? [startLocation, ...locations] : locations;
      const hasAllWeatherData = allLocations.every(loc => weatherData[loc.address]);
      
      if (!hasAllWeatherData) {
        console.log('Waiting for weather data...');
        return;
      }
      
      console.log('Optimizing route with locations:', allLocations);
      const optimizedRoute = await getOptimizedRoute(locations, weatherData, startLocation);
      setRoute(optimizedRoute);
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: 'Error optimizing route',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [locations, weatherData, startLocation, toast]);

  useEffect(() => {
    optimizeRoute();
  }, [optimizeRoute]);

  // Memoize locationsWithWeather to prevent unnecessary recalculations
  const locationsWithWeather = React.useMemo(() => {
    const allLocations = startLocation 
      ? [startLocation, ...locations]
      : locations;
    
    return allLocations.map(location => ({
      ...location,
      weather: location && location.address ? weatherData[location.address]?.current : undefined,
      forecast: location && location.address ? weatherData[location.address]?.forecast : undefined
    }));
  }, [locations, startLocation, weatherData]);

  const handleLocationAdd = (location) => {
    // Check if location already exists
    const isDuplicate = locations.some(
      loc => loc.address === location.address
    );
    
    // Check if location is the same as start location
    const isStartLocation = startLocation && startLocation.address === location.address;
    
    if (isDuplicate || isStartLocation) {
      toast({
        title: 'Location already added',
        description: 'This location is already in your route.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setLocations(prev => [...prev, location]);
  };

  const handleStartLocationAdd = (location) => {
    setStartLocation(location);
  };

  const handleLocationRemove = (index) => {
    if (index === null) {
      // Clear all locations
      setLocations([]);
      setStartLocation(null);
      setWeatherData({});
      setWeatherAlerts([]);
      setRoute(null);
    } else {
      // Remove single location
      setLocations(prev => {
        const newLocations = prev.filter((_, i) => i !== index);
        if (newLocations.length === 0) {
          setRoute(null);
        }
        return newLocations;
      });

      // Remove weather data for the removed location
      setWeatherData(prev => {
        const newData = { ...prev };
        const removedLocation = locations[index];
        if (removedLocation && removedLocation.address) {
          delete newData[removedLocation.address];
        }
        return newData;
      });
    }
  };

  const handleStartLocationRemove = () => {
    setStartLocation(null);
  };

  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings);
  };

  const handleRouteUpdate = (newRoute) => {
    setRoute(newRoute);
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" bg={bgColor} color={textColor}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Heading as="h1" size="2xl">
                Drone Weather Route Planner
              </Heading>
              <IconButton
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
              />
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={2}>Starting Point</Text>
              <AddressInput
                onLocationAdd={handleStartLocationAdd}
                onLocationRemove={handleStartLocationRemove}
                locations={startLocation ? [startLocation] : []}
                placeholder="Enter starting point address..."
              />
              {startLocation && (
                <HStack mt={2} spacing={2}>
                  <Badge colorScheme="green">Start</Badge>
                  <Text fontSize="sm">{startLocation.address}</Text>
                </HStack>
              )}
            </Box>
            
            <Divider />
            
            <Box>
              <Text fontWeight="bold" mb={2}>Destination Points</Text>
              <AddressInput
                onLocationAdd={handleLocationAdd}
                onLocationRemove={handleLocationRemove}
                locations={locations}
                placeholder="Enter destination address..."
              />
            </Box>

            <MapDisplay
              locations={locations}
              startLocation={startLocation}
              route={route}
              settings={settings}
              onRouteUpdate={handleRouteUpdate}
            />

            <RouteOptions
              route={route}
              onSelectRoute={setSelectedRouteIndex}
              selectedRouteIndex={selectedRouteIndex}
            />

            <RouteSummary
              route={route}
              locations={locations}
              startLocation={startLocation}
            />

            <WeatherForecast
              locations={locationsWithWeather}
              alerts={weatherAlerts}
            />

            <Settings onSettingsUpdate={handleSettingsUpdate} />
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 