import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Input, 
  Box, 
  List, 
  ListItem, 
  useColorModeValue, 
  VStack, 
  Text, 
  Button, 
  Spinner,
  IconButton,
  Flex,
  useToast
} from '@chakra-ui/react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { DeleteIcon } from '@chakra-ui/icons';

const AddressInput = ({ 
  onLocationSelect, 
  onLocationAdd, 
  onLocationRemove, 
  locations = [], 
  placeholder = 'Enter address...' 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const locationBgColor = useColorModeValue('gray.50', 'gray.700');

  // Memoize the click outside handler
  const handleClickOutside = useCallback((event) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
        inputRef.current && !inputRef.current.contains(event.target)) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Memoize the fetch suggestions function
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const mapboxToken = 'pk.eyJ1IjoicGV0ZXJhbHkiLCJhIjoiY205N2gzMzU1MDdieDJrcHh3ZnpuNXVteCJ9.8N9ZoaU05cVRUGEGAwA5uw';
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${mapboxToken}&types=address&limit=5`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const newSuggestions = data.features.map(feature => ({
          id: feature.id,
          text: feature.place_name,
          center: feature.center,
          context: feature.context
        }));
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      toast({
        title: 'Error fetching suggestions',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Memoize the input change handler
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  }, [fetchSuggestions]);

  // Memoize the suggestion click handler
  const handleSuggestionClick = useCallback((suggestion) => {
    try {
      const locationData = {
        address: suggestion.text,
        lat: suggestion.center[1],
        lng: suggestion.center[0]
      };
      
      setQuery('');
      setShowSuggestions(false);
      
      if (typeof onLocationAdd === 'function') {
        onLocationAdd(locationData);
      } else if (typeof onLocationSelect === 'function') {
        onLocationSelect(locationData);
      }
    } catch (error) {
      console.error('Error handling suggestion click:', error);
      toast({
        title: 'Error adding location',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [onLocationAdd, onLocationSelect, toast]);

  // Memoize the remove location handler
  const handleRemoveLocation = useCallback((locationId) => {
    try {
      if (typeof onLocationRemove === 'function') {
        onLocationRemove(locationId);
      }
    } catch (error) {
      console.error('Error removing location:', error);
      toast({
        title: 'Error removing location',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [onLocationRemove, toast]);

  // Memoize the clear all handler
  const handleClearAll = useCallback(() => {
    try {
      if (typeof onLocationRemove === 'function') {
        onLocationRemove(null);
      }
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error clearing all locations:', error);
      toast({
        title: 'Error clearing locations',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [onLocationRemove, toast]);

  return (
    <VStack spacing={4} align="stretch" width="100%">
      <Box position="relative" width="100%">
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          size="lg"
          pl={10}
          pr={4}
          borderColor={borderColor}
          _hover={{ borderColor: 'blue.400' }}
          _focus={{ borderColor: 'blue.500', boxShadow: 'outline' }}
          isDisabled={isLoading}
          autoComplete="off"
        />
        <Box
          position="absolute"
          left={3}
          top="50%"
          transform="translateY(-50%)"
          color="gray.500"
        >
          {isLoading ? <Spinner size="sm" /> : <FaSearch />}
        </Box>
        
        {showSuggestions && suggestions.length > 0 && (
          <Box
            ref={suggestionsRef}
            position="absolute"
            top="100%"
            left={0}
            right={0}
            zIndex={1000}
            mt={1}
            bg={bgColor}
            borderRadius="md"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            maxH="300px"
            overflowY="auto"
          >
            <List spacing={0}>
              {suggestions.map((suggestion) => (
                <ListItem
                  key={suggestion.id}
                  px={4}
                  py={2}
                  cursor="pointer"
                  _hover={{ bg: hoverBgColor }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.text}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
      
      {locations && locations.length > 0 && (
        <VStack spacing={2} align="stretch">
          <Flex justify="space-between" align="center">
            <Text fontWeight="medium">Added Locations ({locations.length})</Text>
            <Button
              size="sm"
              leftIcon={<DeleteIcon />}
              onClick={handleClearAll}
              colorScheme="red"
              variant="ghost"
            >
              Clear All
            </Button>
          </Flex>
          <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
            {locations.map((location, index) => (
              <Flex
                key={`${location.id || location.address}-${index}`}
                justify="space-between"
                align="center"
                p={2}
                bg={locationBgColor}
                borderRadius="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <Text fontSize="sm" noOfLines={1}>{location.address}</Text>
                <IconButton
                  icon={<FaTimes />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleRemoveLocation(location.id)}
                  aria-label="Remove location"
                />
              </Flex>
            ))}
          </VStack>
        </VStack>
      )}
    </VStack>
  );
};

export default AddressInput; 