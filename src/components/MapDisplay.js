import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { Box, Spinner, useColorModeValue } from '@chakra-ui/react';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

function MapDisplay({ locations, route, settings, onRouteUpdate, isLoaded, loadError }) {
  const [map, setMap] = useState(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((location) => {
        bounds.extend(location);
      });
      map.fitBounds(bounds);
    }
  }, [map, locations]);

  useEffect(() => {
    if (map && locations.length >= 2) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
      });

      const waypoints = locations.slice(1, -1).map(location => ({
        location: new window.google.maps.LatLng(location.lat, location.lng),
        stopover: true,
      }));

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(locations[0].lat, locations[0].lng),
          destination: new window.google.maps.LatLng(
            locations[locations.length - 1].lat,
            locations[locations.length - 1].lng
          ),
          waypoints,
          optimizeWaypoints: true,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            onRouteUpdate(result.routes[0].overview_path);
          }
        }
      );

      return () => {
        directionsRenderer.setMap(null);
      };
    }
  }, [map, locations, onRouteUpdate]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <Spinner />;

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={10}
        center={defaultCenter}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#000000' }]
            }
          ],
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true
        }}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={location}
            label={(index + 1).toString()}
          />
        ))}

        {route && route.length > 0 && (
          <Polyline
            path={route}
            options={{
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 2
            }}
          />
        )}

        {settings?.display?.showWeatherOverlay && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              background: 'white',
              padding: '10px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            <div>Weather Overlay</div>
            {/* Add weather layer controls here */}
          </div>
        )}
      </GoogleMap>
    </Box>
  );
}

export default MapDisplay; 