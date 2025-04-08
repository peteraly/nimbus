import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Spinner, Center } from '@chakra-ui/react';

// Set Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJhbHkiLCJhIjoiY205N2gzMzU1MDdieDJrcHh3ZnpuNXVteCJ9.8N9ZoaU05cVRUGEGAwA5uw';

const RouteMap = ({ route, startLocation, locations }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to update route on map
  const updateRoute = useCallback((mapInstance) => {
    if (!route?.waypoints) return;
    
    try {
      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Remove existing route layers and sources
      if (mapInstance.getLayer('route')) {
        mapInstance.removeLayer('route');
      }
      if (mapInstance.getSource('route')) {
        mapInstance.removeSource('route');
      }

      // Add markers for each waypoint
      route.waypoints.forEach((waypoint, index) => {
        if (!waypoint.location?.latitude || !waypoint.location?.longitude) {
          console.warn(`Invalid coordinates for waypoint ${index}:`, waypoint);
          return;
        }

        const { latitude, longitude } = waypoint.location;
        
        // Create marker element
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundColor = index === 0 ? '#4CAF50' : '#2196F3';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

        // Create popup content with weather info if available
        const popupContent = `
          <div style="padding: 10px;">
            <strong>${waypoint.location.address}</strong>
            ${waypoint.weather ? `
              <br>Temperature: ${waypoint.weather.temperature}°C
              <br>Wind: ${waypoint.weather.windSpeed} m/s
              <br>Visibility: ${waypoint.weather.visibility}m
            ` : ''}
          </div>
        `;

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(new mapboxgl.Popup().setHTML(popupContent))
          .addTo(mapInstance);
        
        markers.current.push(marker);
      });

      // Add route line if geometry exists
      if (route.geometry?.coordinates?.length > 0) {
        mapInstance.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
          }
        });

        mapInstance.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#2196F3',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        // Fit map to route bounds with padding
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        mapInstance.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          duration: 0
        });
      }
    } catch (error) {
      console.error('Error updating route on map:', error);
    }
  }, [route]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Clean up existing map instance
    if (map.current) {
      markers.current.forEach(marker => marker.remove());
      map.current.remove();
    }

    // Create new map instance
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-95.7129, 37.0902], // Default center
      zoom: 4,
      interactive: false,
      attributionControl: false
    });

    // Add controls when style is loaded
    newMap.on('style.load', () => {
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      newMap.addControl(new mapboxgl.AttributionControl(), 'bottom-right');
      
      // Enable interactions
      newMap.scrollZoom.enable();
      newMap.dragRotate.enable();
      newMap.dragPan.enable();
      newMap.keyboard.enable();
      newMap.doubleClickZoom.enable();
      newMap.touchZoomRotate.enable();
      newMap.interactive = true;
      
      // Update center if we have a start location
      if (startLocation?.longitude && startLocation?.latitude) {
        newMap.setCenter([startLocation.longitude, startLocation.latitude]);
      }
      
      // Update route if available
      if (route?.waypoints) {
        updateRoute(newMap);
      }
      
      setIsLoading(false);
    });

    // Store map reference
    map.current = newMap;

    return () => {
      if (map.current) {
        markers.current.forEach(marker => marker.remove());
        map.current.remove();
        map.current = null;
      }
    };
  }, [startLocation, route, updateRoute]);

  // Update route when route changes
  useEffect(() => {
    if (!map.current || !route?.waypoints) return;
    
    // Only update route if map is loaded
    if (map.current.isStyleLoaded()) {
      updateRoute(map.current);
    } else {
      map.current.once('style.load', () => {
        updateRoute(map.current);
      });
    }
  }, [route, updateRoute]);

  return (
    <Box
      position="relative"
      height="500px"
      width="100%"
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <Box ref={mapContainer} height="100%" width="100%" />
      {isLoading && (
        <Center
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(255, 255, 255, 0.8)"
        >
          <Spinner size="xl" color="blue.500" />
        </Center>
      )}
    </Box>
  );
};

export default RouteMap; 