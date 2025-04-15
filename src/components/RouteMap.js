import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Text, VStack, Alert, AlertIcon, AlertTitle, AlertDescription, Link, Button } from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { MAPBOX_ACCESS_TOKEN } from '../config/apiKeys';

// Set the Mapbox access token
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const RouteMap = ({
  locations = [],
  route = null,
  onMarkerClick,
  onRouteClick,
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const routeLayer = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if it hasn't been created yet
    if (!map.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-95.7129, 37.0902], // Center of US
          zoom: 3
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add error handling
        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          setError('Failed to load map. Please check your Mapbox access token.');
        });
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map. Please check your Mapbox access token.');
        return;
      }
    }

    // Clean up previous markers and route
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    if (routeLayer.current) {
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
    }

    // Add markers for all locations
    const allLocations = locations;
    
    allLocations.forEach((location, index) => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = index === 0 ? '#4CAF50' : '#2196F3';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 10px;">
            <strong>${index === 0 ? 'Start' : `Stop ${index}`}</strong><br>
            ${location.address}
          </div>
        `);
      
      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.coordinates[0], location.coordinates[1]])
        .setPopup(popup)
        .addTo(map.current);
      
      markers.current.push(marker);
    });

    // Add route line if route exists
    if (route && route.geometry && route.properties) {
      map.current.on('load', () => {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: route.properties,
            geometry: route.geometry
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        route.geometry.coordinates.forEach(coord => {
          bounds.extend([coord[0], coord[1]]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      });
    }

    // Cleanup function
    return () => {
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
      }
    };
  }, [locations, route]);

  if (error) {
    return (
      <Box
        p={4}
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        borderWidth="1px"
        borderColor="gray.200"
        height="500px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Map Error
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {error}
          </AlertDescription>
          <VStack mt={4} spacing={2}>
            <Text fontSize="sm">To fix this issue:</Text>
            <Link href="https://account.mapbox.com/" isExternal color="blue.500">
              <Button size="sm" colorScheme="blue">
                Get a Mapbox Access Token
              </Button>
            </Link>
            <Text fontSize="xs" color="gray.500">
              Then update the token in src/config/apiKeys.js
            </Text>
          </VStack>
        </Alert>
      </Box>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        height: '500px', 
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }} 
    />
  );
};

RouteMap.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
    })
  ).isRequired,
  route: PropTypes.shape({
    geometry: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
  }),
  onMarkerClick: PropTypes.func,
  onRouteClick: PropTypes.func,
};

export default RouteMap; 