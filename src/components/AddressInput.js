import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  IconButton,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

const AddressInput = ({ onLocationAdd, onLocationRemove, locations }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const initAutocomplete = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        const input = inputRef.current;
        if (input) {
          const autocomplete = new window.google.maps.places.Autocomplete(input, {
            types: ['address'],
            fields: ['geometry', 'formatted_address'],
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry && place.geometry.location) {
              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                address: place.formatted_address,
              };
              onLocationAdd(location);
              setInputValue('');
            } else {
              toast({
                title: 'Invalid location',
                description: 'Please select a valid location from the dropdown.',
                status: 'error',
                duration: 3000,
                isClosable: true,
              });
            }
          });
        }
      }
    };

    // Wait for Google Maps to load
    if (window.google && window.google.maps && window.google.maps.places) {
      initAutocomplete();
    } else {
      window.addEventListener('google-maps-callback', initAutocomplete);
    }

    return () => {
      window.removeEventListener('google-maps-callback', initAutocomplete);
    };
  }, [onLocationAdd, toast]);

  const handleClearAll = () => {
    onLocationRemove(null);
    setInputValue('');
  };

  return (
    <Box w="100%">
      <VStack spacing={4} align="stretch">
        <Input
          ref={inputRef}
          id="location-input"
          name="location"
          placeholder="Enter a location"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          size="lg"
          autoComplete="off"
        />

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