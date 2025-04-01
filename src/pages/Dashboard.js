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
import { getWeatherAlerts } from '../utils/weatherUtils';

function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [route, setRoute] = useState(null);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [routeStats, setRouteStats] = useState(null);
  const [settings, setSettings] = useState(loadSettings());
  const toast = useToast();

  useEffect(() => {
    if (locations.length >= 2) {
      calculateRoute();
    }
  }, [locations]);

  const calculateRoute = async () => {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      const optimizedRoute = await getOptimizedRoute(locations, apiKey, settings.routePreferences.mode);
      setRoute(optimizedRoute);
      setRouteStats(calculateRouteStats(optimizedRoute));

      // Get weather alerts for all locations
      const alerts = await Promise.all(
        locations.map(loc => getWeatherAlerts(loc, process.env.REACT_APP_WEATHERAPI_KEY))
      );
      setWeatherAlerts(alerts.flat());

      if (settings.notifications.unsafeConditions && routeStats?.safetyPercentage < 100) {
        toast({
          title: 'Weather Alert',
          description: 'Some locations have unsafe weather conditions. Consider rerouting.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to calculate route. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLocationAdd = (location) => {
    setLocations([...locations, location]);
  };

  const handleLocationRemove = (index) => {
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
          />
          <Box mt={4}>
            <WeatherForecast
              locations={locations}
              alerts={weatherAlerts}
            />
          </Box>
        </Box>
      </Grid>
    </Container>
  );
}

export default Dashboard; 