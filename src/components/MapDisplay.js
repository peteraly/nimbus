import React, { useEffect, useRef, useMemo } from 'react';
import { Box } from '@chakra-ui/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: process.env.REACT_APP_MAPBOX_STYLE_URL,
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

    // Update map when component mounts or when dependencies change
    if (map.current.loaded()) {
      updateMap();
    } else {
      map.current.on('load', updateMap);
    }

    // Cleanup on unmount
    return () => {
      // Safely remove markers
      if (markers.current && markers.current.length > 0) {
        markers.current.forEach(marker => {
          try {
            if (marker && typeof marker.remove === 'function') {
              marker.remove();
            }
          } catch (error) {
            console.error('Error removing marker:', error);
          }
        });
        markers.current = [];
      }
      
      // Safely remove the map
      if (map.current) {
        try {
          // Remove any event listeners first
          map.current.off();
          
          // Remove the map instance
          map.current.remove();
          map.current = null;
        } catch (error) {
          console.error('Error removing map:', error);
        }
      }
    };
  }, [memoizedLocations, route, startLocation]);

  return (
    <Box
      ref={mapContainer}
      h="500px"
      w="100%"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="base"
    />
  );
};

export default React.memo(MapDisplay); 