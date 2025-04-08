import React, { useState, useEffect, useRef } from 'react';
import { Input, Box, List, ListItem, useColorModeValue, VStack, HStack, Text, Button, Spinner } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const mapboxToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `access_token=${mapboxToken}&types=address&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setSuggestions(data.features.map(feature => ({
          id: feature.id,
          text: feature.place_name,
          center: feature.center,
          context: feature.context
        })));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    const locationData = {
      address: suggestion.text,
      lat: suggestion.center[1],
      lng: suggestion.center[0]
    };
    
    setQuery(suggestion.text);
    setShowSuggestions(false);
    
    // Handle both new and old prop patterns
    if (typeof onLocationSelect === 'function') {
      onLocationSelect(locationData);
    } else if (typeof onLocationAdd === 'function') {
      onLocationAdd(locationData);
    } else {
      console.error('No location handler function provided to AddressInput');
    }
  };

  const handleClearAll = () => {
    if (typeof onLocationRemove === 'function') {
      onLocationRemove(null);
    }
    setQuery('');
    setSuggestions([]);
  };

  return (
    <VStack spacing={4} align="stretch">
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
      
      {locations && locations.length > 0 && typeof onLocationRemove === 'function' && (
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