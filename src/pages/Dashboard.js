import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  useToast,
  Button,
  Link as ChakraLink,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import MapDisplay from '../components/MapDisplay';
import RouteSummary from '../components/RouteSummary';
import WeatherForecast from '../components/WeatherForecast';
import AddressInput from '../components/AddressInput';
import { loadSettings } from '../utils/settingsUtils';
import { getOptimizedRoute, calculateRouteStats, generateRouteOptions } from '../utils/routeUtils';
import { getWeatherForecast } from '../utils/weatherUtils';
import RouteOptions from '../components/RouteOptions';
import RouteExplanation from '../components/RouteExplanation';

function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [startLocation, setStartLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeOptions, setRouteOptions] = useState([]);
  const [routeStats, setRouteStats] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [settings, setSettings] = useState(loadSettings());
  const toast = useToast();
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [dailyTimeLimit, setDailyTimeLimit] = useState('');
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate route when locations change
  useEffect(() => {
    const calculateRouteIfNeeded = async () => {
      if (isCalculating || locations.length < 2) {
        if (locations.length < 2) {
          setRouteOptions([]);
          setRoute(null);
          setRouteStats(null);
        }
        return;
      }

      try {
        setIsCalculating(true);
        // Use the first added location as start if none specified
        const start = startLocation || locations[0];
        const optimizedRoute = await getOptimizedRoute(locations, parseInt(dailyTimeLimit, 10));
        
        if (optimizedRoute) {
          setRoutes([{
            ...optimizedRoute,
            totalDistance: optimizedRoute.totalDistance,
            totalDuration: optimizedRoute.totalDuration,
            numberOfDays: optimizedRoute.numberOfDays
          }]);
          setRouteOptions([optimizedRoute]);
          setRoute(optimizedRoute);
          setRouteStats({
            totalStops: optimizedRoute.route.length,
            safeStops: optimizedRoute.weatherScores.filter(s => s.score > 70).length,
            moderateStops: optimizedRoute.weatherScores.filter(s => s.score > 40 && s.score <= 70).length,
            unsafeStops: optimizedRoute.weatherScores.filter(s => s.score <= 40).length,
            totalDistance: optimizedRoute.totalDistance,
            totalDuration: optimizedRoute.totalDuration,
            safetyPercentage: optimizedRoute.safetyPercentage
          });
          
          toast({
            title: 'Route optimized',
            description: `Route optimized into ${optimizedRoute.numberOfDays} day(s) based on your preferences.`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error('Error optimizing route:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('too far apart')) {
          errorMessage = 'Some locations are too far apart to create a continuous route. Please select locations that are within driving distance of each other.';
        } else if (error.message.includes('inaccessible')) {
          errorMessage = 'Some locations cannot be reached by road. Please ensure all locations are accessible by road.';
        }
        
        toast({
          title: 'Error optimizing route',
          description: errorMessage,
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        setRoutes([]);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateRouteIfNeeded();
  }, [locations, isCalculating, startLocation, dailyTimeLimit, toast]);

  const handleLocationAdd = (location) => {
    // If this is the first location, set it as the start location
    if (locations.length === 0) {
      setStartLocation(location);
    }
    setLocations(prev => [...prev, location]);
  };

  const handleLocationRemove = (locationToRemove) => {
    if (locationToRemove === null) {
      setLocations([]);
      setStartLocation(null);
      return;
    }
    setLocations(prev => prev.filter(loc => loc.address !== locationToRemove.address));
    if (startLocation && startLocation.address === locationToRemove.address) {
      setStartLocation(null);
    }
  };

  const handleSetStartLocation = (location) => {
    setStartLocation(location);
  };

  const handleRouteSelect = (index) => {
    setSelectedRouteIndex(index);
    // Update the main route and stats when a new route is selected
    const selectedRoute = routeOptions[index];
    if (selectedRoute) {
      setRoute(selectedRoute);
      setRouteStats({
        totalStops: selectedRoute.route.length,
        safeStops: selectedRoute.weatherScores.filter(s => s.score > 70).length,
        moderateStops: selectedRoute.weatherScores.filter(s => s.score > 40 && s.score <= 70).length,
        unsafeStops: selectedRoute.weatherScores.filter(s => s.score <= 40).length,
        totalDistance: selectedRoute.totalDistance,
        totalDuration: selectedRoute.totalDuration,
        safetyPercentage: selectedRoute.safetyPercentage
      });
    }
  };

  const handleOptimizeRoute = useCallback(async () => {
    if (locations.length < 2) {
      toast({
        title: 'Not enough locations',
        description: 'Please add at least two locations to optimize a route.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      const routeData = await getOptimizedRoute(locations, parseInt(dailyTimeLimit, 10));
      
      if (routeData) {
        setRoutes([{
          ...routeData,
          totalDistance: routeData.totalDistance,
          totalDuration: routeData.totalDuration,
          numberOfDays: routeData.numberOfDays
        }]);
        
        toast({
          title: 'Route optimized',
          description: `Route optimized into ${routeData.numberOfDays} day(s) based on your preferences.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error optimizing route:', error);
      
      let errorMessage = error.message;
      if (error.message.includes('too far apart')) {
        errorMessage = 'Some locations are too far apart to create a continuous route. Please select locations that are within driving distance of each other.';
      } else if (error.message.includes('inaccessible')) {
        errorMessage = 'Some locations cannot be reached by road. Please ensure all locations are accessible by road.';
      }
      
      toast({
        title: 'Error optimizing route',
        description: errorMessage,
        status: 'error',
        duration: 7000,
        isClosable: true,
      });
      setRoutes([]);
    } finally {
      setIsLoading(false);
    }
  }, [locations, dailyTimeLimit, toast]);

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading mb={4}>Drone Weather Route Planner</Heading>
        <Button as={RouterLink} to="/settings" colorScheme="blue" size="sm">
          Settings
        </Button>
      </Box>

      <Box p={4}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <Box flex={1}>
              <AddressInput
                onLocationAdd={handleLocationAdd}
                onLocationRemove={handleLocationRemove}
                locations={locations}
              />
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={4}>
            <Box>
              <LocationList
                locations={locations}
                onLocationRemove={handleLocationRemove}
                onSetStartLocation={handleSetStartLocation}
                startLocation={startLocation}
              />
              {route && <RouteExplanation route={route} />}
            </Box>
            <Box>
              <MapDisplay
                locations={locations}
                route={route}
                startLocation={startLocation}
              />
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>
    </Container>
  );
}

export default Dashboard; 