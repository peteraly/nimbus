import React, { useEffect, useRef } from 'react';
import { Box } from '@chakra-ui/react';

const MapDisplay = ({ locations, route, settings }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const directionsRendererRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.log('Map container or Google Maps API not ready');
      return;
    }

    try {
      console.log('Initializing map...');
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
        zoom: 4,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: settings.darkMode ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }]
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }]
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }]
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }]
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }]
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }]
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }]
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }]
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }]
          }
        ] : []
      });

      mapInstanceRef.current = map;

      // Create directions renderer
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3182CE',
          strokeWeight: 5
        }
      });
      directionsRendererRef.current = directionsRenderer;

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
    };
  }, [settings.darkMode]);

  // Update markers and route when locations or route change
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) {
      console.log('Map or Google Maps API not ready');
      return;
    }

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add markers for each location
      locations.forEach((location, index) => {
        console.log('Rendering marker for location:', location);
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
          map: mapInstanceRef.current,
          title: `${index + 1}. ${location.address}`,
          label: (index + 1).toString(),
          animation: window.google.maps.Animation.DROP
        });
        markersRef.current.push(marker);
      });

      // Update route if available
      if (route && route.directions) {
        console.log('Route updated:', route);
        directionsRendererRef.current.setDirections(route.directions);
      } else {
        directionsRendererRef.current.setDirections({ routes: [] });
      }

      // Adjust map bounds to show all markers
      if (locations.length > 0) {
        console.log('Adjusting map bounds for locations:', locations);
        const bounds = new window.google.maps.LatLngBounds();
        locations.forEach(location => {
          console.log('Extending bounds for location:', location);
          bounds.extend(new window.google.maps.LatLng(
            parseFloat(location.lat),
            parseFloat(location.lng)
          ));
        });
        mapInstanceRef.current.fitBounds(bounds);
      }
    } catch (error) {
      console.error('Error updating map:', error);
    }
  }, [locations, route]);

  return (
    <Box
      ref={mapRef}
      height="500px"
      width="100%"
      borderRadius="md"
      overflow="hidden"
      boxShadow="md"
    />
  );
};

export default MapDisplay; 