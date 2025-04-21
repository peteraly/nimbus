import React, { useState, useCallback } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
  useColorModeValue,
  Container,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import LocationSearch from './components/LocationSearch';
import WeatherForecast from './components/WeatherForecast';
import RouteSummary from './components/RouteSummary';
import RouteMap from './components/RouteMap';
import RouteOptions from './components/RouteOptions';
import { getOptimizedRoutes } from './services/routeService';
import { getWeatherData } from './services/weatherService';

const App = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routes, setRoutes] = useState({ distanceOptimized: null, weatherOptimized: null });
  const [loading, setLoading] = useState(false);
  const [selectedStartPoint, setSelectedStartPoint] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');

  const optimizeRoute = useCallback(async (options) => {
    if (!options.startPoint || locations.length < 2) {
      setRoutes({ distanceOptimized: null, weatherOptimized: null });
      return;
    }

    try {
      setLoading(true);
      
      // For MVP, we'll focus on current weather conditions and basic route optimization
      const remainingLocations = locations.filter(loc => loc.id !== options.startPoint.id);
      const startPoint = options.startPoint;
      
      // Check if any locations have severe weather warnings
      const locationsWithWarnings = locations.filter(loc => {
        const weather = loc.weather?.current;
        if (!weather) return false;
        
        return (
          weather.wind > 20 || // Wind speed > 20 mph
          weather.precipitation > 0.1 || // Active precipitation
          weather.visibility < 5000 // Poor visibility
        );
      });

      if (locationsWithWarnings.length > 0) {
        toast({
          title: 'Weather Advisory',
          description: `${locationsWithWarnings.length} location(s) currently have weather conditions that may affect drone operations.`,
          status: 'warning',
          duration: 7000,
          isClosable: true,
        });
      }

      // Get optimized routes
      const routeOptions = await getOptimizedRoutes([startPoint, ...remainingLocations], options.optimizationType);
      
      if (routeOptions) {
        setRoutes({
          distanceOptimized: routeOptions,
          weatherOptimized: routeOptions
        });
        
        toast({
          title: 'Route Generated',
          description: `Created a ${options.optimizationType}-optimized route across ${routeOptions.summary.numberOfDays} days.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error optimizing routes:', error);
      
      // Show a more user-friendly error message
      let errorMessage = error.message;
      if (error.message.includes('too far apart')) {
        errorMessage = 'Some locations are too far apart. Please select locations within reasonable driving distance.';
      } else if (error.message.includes('inaccessible')) {
        errorMessage = 'Some locations cannot be reached by road. Please ensure all locations are accessible.';
      } else if (error.message.includes('weather data')) {
        errorMessage = 'Unable to fetch weather data for some locations. Please try again.';
      }
      
      toast({
        title: 'Route Generation Failed',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      setRoutes({ distanceOptimized: null, weatherOptimized: null });
    } finally {
      setLoading(false);
    }
  }, [locations, toast]);

  const handleLocationAdd = useCallback(async (locationData) => {
    try {
      // Check for duplicate locations
      const isDuplicate = locations.some(
        loc => loc.address === locationData.address
      );

      if (isDuplicate) {
        toast({
          title: 'Duplicate location',
          description: 'This location has already been added to your route.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setLoading(true);
      const locationWithId = {
        ...locationData,
        id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      const weatherData = await getWeatherData(locationWithId);
      const newLocation = {
        ...locationWithId,
        weather: weatherData,
      };
      
      setLocations(prev => [...prev, newLocation]);
      
      // If this is the first location, select it as the starting point
      if (locations.length === 0) {
        setSelectedStartPoint(newLocation.id);
      }
      
      // If this is the first location, or no location is selected, select it
      if (locations.length === 0 || !selectedLocation) {
        setSelectedLocation(newLocation);
      }
      
      toast({
        title: 'Location added',
        description: `${locationData.address} has been added to your route.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding location:', error);
      toast({
        title: 'Error adding location',
        description: error.message || 'Failed to add location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [locations, selectedLocation, toast]);

  const handleLocationRemove = useCallback((locationId) => {
    setLocations(prev => {
      const newLocations = prev.filter(loc => loc.id !== locationId);
      
      // If we removed the selected location, select the first available location
      if (selectedLocation && locationId === selectedLocation.id) {
        setSelectedLocation(newLocations[0] || null);
      }

      // If we removed the start point, select the first available location as start
      if (selectedStartPoint === locationId) {
        setSelectedStartPoint(newLocations[0]?.id || '');
      }

      // If we have less than 2 locations, clear the routes
      if (newLocations.length < 2) {
        setRoutes({ distanceOptimized: null, weatherOptimized: null });
      }

      return newLocations;
    });
  }, [selectedLocation, selectedStartPoint]);

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg={bgColor} color={textColor}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box textAlign="center">
              <Heading as="h1" size="xl" mb={2}>
                Drone Weather Route Planner
              </Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                Plan your drone routes with weather-aware optimization
              </Text>
            </Box>

            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={8}>
              <VStack spacing={6} align="stretch">
                <LocationSearch
                  onLocationAdd={handleLocationAdd}
                  onLocationRemove={handleLocationRemove}
                  locations={locations}
                  loading={loading}
                />
                <WeatherForecast
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationChange={setSelectedLocation}
                />
                <RouteOptions
                  locations={locations}
                  selectedStartPoint={selectedStartPoint}
                  onStartPointChange={setSelectedStartPoint}
                  onOptimize={optimizeRoute}
                />
              </VStack>

              <VStack spacing={6} align="stretch">
                <RouteMap
                  locations={locations}
                  routes={routes}
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                />
                <RouteSummary
                  routes={routes}
                  loading={loading}
                />
              </VStack>
            </Grid>
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
};

export default App; 