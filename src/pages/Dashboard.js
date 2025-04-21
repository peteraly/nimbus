import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  useToast,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import MapDisplay from '../components/MapDisplay';
import RouteComparison from '../components/RouteSummary';
import WeatherForecast from '../components/WeatherForecast';
import LocationSearch from '../components/LocationSearch';
import { getOptimizedRoutes } from '../services/routeService';

function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleLocationAdd = useCallback((location) => {
    setLocations(prev => [...prev, location]);
  }, []);

  const handleLocationRemove = useCallback((locationId) => {
    setLocations(prev => prev.filter(loc => loc.id !== locationId));
  }, []);

  useEffect(() => {
    const generateRoutes = async () => {
      if (locations.length < 2) {
        setRoutes(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const optimizedRoute = await getOptimizedRoutes(locations);
        setRoutes({
          distanceOptimized: optimizedRoute
        });
        
        toast({
          title: 'Route generated',
          description: 'Your optimized route is ready.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error generating route:', error);
        setError(error.message);
        
        toast({
          title: 'Route generation failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    generateRoutes();
  }, [locations, toast]);

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Drone Weather Route Planner
        </Heading>
        
        <LocationSearch 
          onLocationAdd={handleLocationAdd}
          onLocationRemove={handleLocationRemove}
          locations={locations}
        />

        {loading && (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        )}

        {error && (
          <Box p={4} bg="red.100" color="red.700" borderRadius="md">
            {error}
          </Box>
        )}

        {routes && !loading && (
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
            <Box>
              <MapDisplay locations={locations} route={routes.distanceOptimized} />
            </Box>
            <Box>
              <WeatherForecast locations={locations} />
            </Box>
          </Grid>
        )}

        {routes && !loading && (
          <RouteComparison routes={routes} />
        )}
      </VStack>
    </Container>
  );
}

export default Dashboard; 