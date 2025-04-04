import React, { useEffect, useRef } from 'react';
import {
  VStack,
  Button,
  Text,
  useToast,
  HStack,
  Box,
  Input,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const AddressInput = ({ onLocationAdd, onLocationRemove, locations }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const toast = useToast();

  // Initialize Places Autocomplete whenever the input is available
  const initPlacesAutocomplete = async () => {
    try {
      if (!window.google?.maps?.places || !inputRef.current) {
        return;
      }

      // Clean up existing instance if it exists
      if (autocompleteRef.current?.cleanup) {
        autocompleteRef.current.cleanup();
        autocompleteRef.current = null;
      }

      // Initialize the Autocomplete instance
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }
      });

      const handlePlaceChanged = () => {
        const place = autocomplete.getPlace();
        if (place?.geometry?.location) {
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address,
          };
          onLocationAdd(location);
          if (inputRef.current) {
            inputRef.current.value = '';
            // Reinitialize autocomplete after a short delay
            setTimeout(() => {
              initPlacesAutocomplete();
              inputRef.current?.focus();
            }, 100);
          }
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

      autocomplete.addListener('place_changed', handlePlaceChanged);
      
      autocompleteRef.current = {
        instance: autocomplete,
        cleanup: () => {
          window.google?.maps?.event?.clearInstanceListeners(autocomplete);
          // Remove any pac-container elements
          const pacContainers = document.querySelectorAll('.pac-container');
          pacContainers.forEach(container => {
            if (container && container.parentNode) {
              container.parentNode.removeChild(container);
            }
          });
        }
      };
    } catch (error) {
      console.error('Error initializing Places Autocomplete:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize location search. Please refresh the page.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    // Initial setup
    initPlacesAutocomplete();

    // Cleanup on unmount
    return () => {
      if (autocompleteRef.current?.cleanup) {
        autocompleteRef.current.cleanup();
      }
      autocompleteRef.current = null;
    };
  }, []);  // Only run on mount and unmount

  const handleClearAll = () => {
    onLocationRemove(null);
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
      // Reinitialize autocomplete after clearing
      initPlacesAutocomplete();
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Input
        ref={inputRef}
        placeholder="Enter a location"
        aria-label="Location search"
        size="lg"
        autoComplete="off"
      />
      {locations.length > 0 && (
        <HStack spacing={2}>
          <Text>Added Locations: {locations.length}</Text>
          <Button
            size="sm"
            leftIcon={<DeleteIcon />}
            onClick={handleClearAll}
            colorScheme="red"
            variant="ghost"
          >
            Clear All
          </Button>
        </HStack>
      )}
    </VStack>
  );
};

export default AddressInput; 