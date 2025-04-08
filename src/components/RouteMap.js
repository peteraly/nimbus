import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const RouteMap = ({ route, startLocation, locations }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const routeLayer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map if it hasn't been created yet
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-95.7129, 37.0902], // Center of US
        zoom: 3
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
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
    const allLocations = startLocation ? [startLocation, ...locations] : locations;
    
    allLocations.forEach((location, index) => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = index === 0 && startLocation ? '#4CAF50' : '#2196F3';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 10px;">
            <strong>${index === 0 && startLocation ? 'Start' : `Stop ${index}`}</strong><br>
            ${location.address}
          </div>
        `);
      
      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current);
      
      markers.current.push(marker);
    });

    // Add route line if route exists
    if (route && route.coordinates && route.coordinates.length > 0) {
      map.current.on('load', () => {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates.map(coord => [coord.lng, coord.lat])
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
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        route.coordinates.forEach(coord => {
          bounds.extend([coord.lng, coord.lat]);
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
  }, [route, startLocation, locations]);

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

export default RouteMap; 