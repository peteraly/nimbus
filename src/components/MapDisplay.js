import React, { useEffect, useRef, useMemo } from 'react';
import { Box, Spinner, Text, Center, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PropTypes from 'prop-types';

const MapDisplay = ({ locations, route, startLocation }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const routeLayer = useRef(null);

  // Memoize locations to prevent unnecessary updates
  const memoizedLocations = useMemo(() => locations, [locations]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if not already initialized
    if (!map.current) {
      // Use hardcoded token instead of environment variable
      mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJhbHkiLCJhIjoiY205N2gzMzU1MDdieDJrcHh3ZnpuNXVteCJ9.8N9ZoaU05cVRUGEGAwA5uw';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-104.8214, 38.8339], // Colorado Springs center
        zoom: 12
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    }

    // Update markers and route when locations or route change
    const updateMap = () => {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Clear existing route layer
      if (routeLayer.current) {
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
      }

      // Add markers for each location
      const bounds = new mapboxgl.LngLatBounds();
      
      memoizedLocations.forEach((location, index) => {
        const isStart = startLocation && startLocation.address === location.address;
        const coordinates = [parseFloat(location.lng), parseFloat(location.lat)];
        
        // Create marker element
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = isStart ? '#48BB78' : '#3182CE';
        el.style.border = '2px solid white';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.color = 'white';
        el.style.fontWeight = 'bold';
        el.style.fontSize = '12px';
        el.textContent = isStart ? 'S' : (index + 1).toString();

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 8px;">
              <strong>${isStart ? 'Start: ' : ''}${location.address}</strong>
              ${location.forecast ? `
                <br>Temperature: ${location.forecast[0].temperature}°F
                <br>Wind: ${location.forecast[0].wind} mph
                <br>Visibility: ${location.forecast[0].visibility / 1000} km
              ` : ''}
            </div>
          `);

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map.current);

        markers.current.push(marker);
        bounds.extend(coordinates);
      });

      // Add route if available
      if (route && route.directions) {
        const coordinates = route.directions.routes[0].overview_path.map(point => [point.lng(), point.lat()]);
        
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
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
            'line-color': '#3182CE',
            'line-width': 4
          }
        });

        routeLayer.current = true;
      }

      // Fit map to show all markers
      if (memoizedLocations.length > 0) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    };

    // Call updateMap when locations or route change
    updateMap();
  }, [memoizedLocations, route, startLocation]);

  // Handle loading state
  if (route && route.isLoading) {
    return (
      <Box 
        height="500px" 
        width="100%" 
        position="relative" 
        borderRadius="lg" 
        overflow="hidden"
        bg="gray.100"
      >
        <Center height="100%">
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text ml={4} fontSize="lg">Optimizing route...</Text>
        </Center>
      </Box>
    );
  }

  // Handle error state
  if (route && route.error) {
    return (
      <Box 
        height="500px" 
        width="100%" 
        position="relative" 
        borderRadius="lg" 
        overflow="hidden"
        bg="gray.100"
      >
        <Center height="100%">
          <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" borderRadius="md">
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {route.error.includes('Not enough input coordinates') ? 'Not Enough Locations' : 'Route Optimization Error'}
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {route.error.includes('Not enough input coordinates') 
                ? 'Add at least two locations to optimize a route.' 
                : route.error}
            </AlertDescription>
          </Alert>
        </Center>
      </Box>
    );
  }

  return (
    <Box 
      ref={mapContainer} 
      height="500px" 
      width="100%" 
      borderRadius="lg" 
      overflow="hidden"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
    />
  );
};

MapDisplay.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      location: PropTypes.shape({
        address: PropTypes.string,
        lat: PropTypes.number,
        lng: PropTypes.number
      }).isRequired
    })
  ).isRequired,
  route: PropTypes.shape({
    directions: PropTypes.shape({
      routes: PropTypes.arrayOf(
        PropTypes.shape({
          overview_path: PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.number)
          )
        })
      )
    }),
    isLoading: PropTypes.bool,
    error: PropTypes.string
  }),
  startLocation: PropTypes.shape({
    address: PropTypes.string,
    location: PropTypes.shape({
      lat: PropTypes.number,
      lng: PropTypes.number
    })
  })
};

export default MapDisplay; 