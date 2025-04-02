import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  useToast,
  Button,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import MapDisplay from '../components/MapDisplay';
import RouteSummary from '../components/RouteSummary';
import WeatherForecast from '../components/WeatherForecast';
import AddressInput from '../components/AddressInput';
import { loadSettings } from '../utils/settingsUtils';
import { getOptimizedRoute, calculateRouteStats } from '../utils/routeUtils';
import { getWeatherForecast } from '../utils/weatherUtils';

function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [route, setRoute] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [settings, setSettings] = useState(loadSettings());
  const toast = useToast();

  useEffect(() => {
    const calculateRouteIfNeeded = async () => {
      if (locations.length >= 2 && !isCalculating) {
        setIsCalculating(true);
        try {
          console.log('Calculating route for locations:', JSON.stringify(locations, null, 2));
          const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
          const optimizedRoute = await getOptimizedRoute(locations, apiKey, settings.routePreferences?.mode || 'DRIVING');
          
          console.log('Optimized route received:', JSON.stringify(optimizedRoute, null, 2));
          if (optimizedRoute) {
            console.log('Setting route with directions:', optimizedRoute.directions ? 'present' : 'missing');
            setRoute(optimizedRoute);
            const stats = calculateRouteStats(optimizedRoute);
            console.log('Route stats calculated:', JSON.stringify(stats, null, 2));
            setRouteStats(stats);

            if (settings.notifications?.unsafeConditions && stats?.safetyPercentage < 100) {
              toast({
                title: 'Weather Alert',
                description: 'Some locations have unsafe weather conditions. Consider rerouting.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
              });
            }
          } else {
            console.log('No optimized route returned');
          }
        } catch (error) {
          console.error('Error calculating route:', error);
          toast({
            title: 'Error',
            description: 'Failed to calculate route. Please try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsCalculating(false);
        }
      } else if (locations.length < 2) {
        console.log('Not enough locations for route calculation');
        setRoute(null);
        setRouteStats(null);
      }
    };

    calculateRouteIfNeeded();
  }, [locations, settings, toast]);

  const handleLocationAdd = async (location) => {
    try {
      console.log('Adding new location with structure:', JSON.stringify(location, null, 2));
      const weatherApiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      const forecast = await getWeatherForecast(location, weatherApiKey);
      
      const newLocation = {
        ...location,
        forecast,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      };
      
      console.log('Adding processed location:', JSON.stringify(newLocation, null, 2));
      setLocations(prevLocations => {
        const updatedLocations = [...prevLocations, newLocation];
        console.log('Updated locations array:', JSON.stringify(updatedLocations, null, 2));
        return updatedLocations;
      });
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch weather data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLocationRemove = (index) => {
    console.log('Removing location at index:', index);
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading mb={4}>Drone Weather Route Planner</Heading>
        <Button as={RouterLink} to="/settings" colorScheme="blue" size="sm">
          Settings
        </Button>
      </Box>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        <Box>
          <MapDisplay
            locations={locations}
            route={route}
            settings={settings}
          />
          <Box mt={4}>
            <AddressInput
              onLocationAdd={handleLocationAdd}
              onLocationRemove={handleLocationRemove}
              locations={locations}
            />
          </Box>
        </Box>

        <Box>
          <RouteSummary
            route={route}
            stats={routeStats}
            locations={locations}
            isCalculating={isCalculating}
          />
          <Box mt={4}>
            <WeatherForecast
              locations={locations}
            />
          </Box>
        </Box>
      </Grid>
    </Container>
  );
}

export default Dashboard; 