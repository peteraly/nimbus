import React, { useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Button,
  Text,
  IconButton,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    // Check if the API is already loaded
    if (window.google?.maps) {
      resolve();
      return;
    }

    // Create a callback function
    window.initMap = () => {
      if (window.google?.maps) {
        resolve();
      } else {
        reject(new Error('Google Maps failed to load'));
      }
    };

    // Check if script is already loading
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for the script to load
      const checkInterval = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
};

const AddressInput = ({ onLocationAdd, onLocationRemove, locations }) => {
  const containerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    let isSubscribed = true;
    let autocomplete = null;
    const currentContainer = containerRef.current;

    const initPlacesAutocomplete = async () => {
      try {
        await loadGoogleMapsScript();

        if (!isSubscribed || !currentContainer || !window.google?.maps) return;

        // Create input element
        const input = document.createElement('input');
        input.className = 'chakra-input css-1kp110w';
        input.placeholder = 'Enter a location';
        input.id = 'location-input';
        input.name = 'location';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('aria-label', 'Location search');

        // Clear any existing content
        currentContainer.innerHTML = '';
        currentContainer.appendChild(input);

        // Initialize Autocomplete
        autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ['address']
        });

        // Listen for place selection
        const handlePlaceChange = () => {
          const place = autocomplete.getPlace();
          
          if (place?.geometry?.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address,
            };
            onLocationAdd(location);
            input.value = '';
          } else {
            toast({
              title: 'Invalid location',
              description: 'Please select a valid location from the dropdown.',
              status: 'error',
              duration: 3000,
              isClosable: true,
            });
          }
        };

        autocomplete.addListener('place_changed', handlePlaceChange);
        
        autocompleteRef.current = {
          element: autocomplete,
          handlePlaceChange
        };
      } catch (error) {
        console.error('Error initializing Places Autocomplete:', error);
        if (isSubscribed) {
          toast({
            title: 'Error',
            description: 'Failed to initialize location search. Please try again.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    };

    initPlacesAutocomplete();

    return () => {
      isSubscribed = false;
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current.element);
        if (currentContainer) {
          currentContainer.innerHTML = '';
        }
        autocompleteRef.current = null;
      }
      // Clean up the global callback
      if (window.initMap) {
        window.initMap = null;
      }
    };
  }, [onLocationAdd, toast]);

  const handleClearAll = () => {
    onLocationRemove(null);
    if (containerRef.current) {
      const input = containerRef.current.querySelector('input');
      if (input) {
        input.value = '';
      }
    }
  };

  return (
    <Box w="100%">
      <VStack spacing={4} align="stretch">
        <Box ref={containerRef} w="100%" />

        {locations && locations.length > 0 && (
          <VStack align="stretch" spacing={2}>
            {locations.map((location, index) => (
              <HStack key={index} justify="space-between">
                <Text>{location.address}</Text>
                <IconButton
                  icon={<DeleteIcon />}
                  onClick={() => onLocationRemove(index)}
                  size="sm"
                  colorScheme="red"
                  aria-label="Remove location"
                />
              </HStack>
            ))}
            {locations.length >= 2 && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default AddressInput; 