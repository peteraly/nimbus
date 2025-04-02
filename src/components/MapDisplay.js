import React, { useCallback, useEffect, useState } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { Box, Spinner, useColorModeValue } from '@chakra-ui/react';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

const libraries = ['places', 'directions'];

function MapDisplay({ locations, route, settings }) {
  const [map, setMap] = useState(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onLoad = useCallback((map) => {
    console.log('Map loaded');
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    console.log('Map unmounted');
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && locations.length > 0) {
      console.log('Adjusting map bounds for locations:', locations);
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach((location) => {
        console.log('Extending bounds for location:', location);
        bounds.extend({ lat: parseFloat(location.lat), lng: parseFloat(location.lng) });
      });
      map.fitBounds(bounds);
    }
  }, [map, locations]);

  useEffect(() => {
    console.log('Route updated:', route);
    if (route?.directions) {
      console.log('Route directions present:', route.directions);
    }
  }, [route]);

  if (loadError) {
    console.error('Error loading maps:', loadError);
    return <Box p={6}>Error loading maps</Box>;
  }

  if (!isLoaded) {
    return <Box p={6}><Spinner /></Box>;
  }

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
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true
        }}
      >
        {!route && locations.map((location, index) => {
          console.log('Rendering marker for location:', location);
          return (
            <Marker
              key={index}
              position={{ 
                lat: parseFloat(location.lat), 
                lng: parseFloat(location.lng) 
              }}
              label={(index + 1).toString()}
            />
          );
        })}

        {route?.directions && (
          <DirectionsRenderer
            directions={route.directions}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 3
              }
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