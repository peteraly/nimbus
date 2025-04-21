import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  useToast,
  IconButton,
  HStack,
  List,
  ListItem,
  Spinner,
  Textarea,
  Collapse,
  Divider,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import PropTypes from 'prop-types';
import { MAPBOX_ACCESS_TOKEN } from '../config/apiKeys';

const LocationSearch = ({ locations = [], loading = false, onLocationAdd, onLocationRemove }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [bulkAddresses, setBulkAddresses] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);
  const searchTimeout = useRef(null);
  const toast = useToast();

  const fetchSuggestions = useCallback(
    async query => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      if (!MAPBOX_ACCESS_TOKEN) {
        toast({
          title: 'Configuration Error',
          description: 'Mapbox access token is not configured',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      try {
        setIsSearching(true);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=address,place&limit=5`
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch address suggestions');
        }

        const data = await response.json();
        if (!data.features || !Array.isArray(data.features)) {
          throw new Error('Invalid response format from Mapbox API');
        }

        setSuggestions(data.features);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch address suggestions',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (searchTerm.trim()) {
      searchTimeout.current = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, fetchSuggestions]);

  const handleSuggestionClick = async suggestion => {
    try {
      const location = {
        id: suggestion.id,
        address: suggestion.place_name,
        coordinates: suggestion.geometry.coordinates,
        lat: suggestion.geometry.coordinates[1],
        lng: suggestion.geometry.coordinates[0],
      };
      await onLocationAdd(location);
      setSearchTerm('');
      setSuggestions([]);
      setShowSuggestions(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (suggestions.length > 0) {
      await handleSuggestionClick(suggestions[0]);
    }
  };

  const handleBulkProcess = async () => {
    if (!bulkAddresses.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter addresses to process',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsProcessingBulk(true);
    const addresses = bulkAddresses.split('\n').filter(addr => addr.trim());
    let successCount = 0;
    let failCount = 0;

    for (const address of addresses) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            address.trim()
          )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=address,place&limit=1`
        );

        if (!response.ok) {
          throw new Error(`Failed to geocode: ${address}`);
        }

        const data = await response.json();
        if (!data.features || data.features.length === 0) {
          throw new Error(`No results found for: ${address}`);
        }

        const feature = data.features[0];
        const location = {
          id: feature.id,
          address: feature.place_name,
          coordinates: feature.geometry.coordinates,
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
        };

        await onLocationAdd(location);
        successCount++;
      } catch (error) {
        console.error(`Error processing address: ${address}`, error);
        failCount++;
      }
    }

    setBulkAddresses('');
    setShowBulkInput(false);
    setIsProcessingBulk(false);

    toast({
      title: 'Bulk Processing Complete',
      description: `Successfully added ${successCount} locations. Failed to add ${failCount} locations.`,
      status: successCount > 0 ? 'success' : 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" position="relative">
      <VStack spacing={4} align="stretch">
        <Button
          size="sm"
          rightIcon={showBulkInput ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={() => setShowBulkInput(!showBulkInput)}
          variant="ghost"
          alignSelf="flex-start"
        >
          Bulk Add Addresses
        </Button>

        <Collapse in={showBulkInput}>
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Paste multiple addresses (one per line)
            </Text>
            <Textarea
              value={bulkAddresses}
              onChange={e => setBulkAddresses(e.target.value)}
              placeholder="123 Main St, City, State&#10;456 Oak Ave, City, State&#10;789 Pine Rd, City, State"
              size="sm"
              rows={4}
            />
            <Button
              colorScheme="blue"
              onClick={handleBulkProcess}
              isLoading={isProcessingBulk}
              loadingText="Processing..."
              size="sm"
              alignSelf="flex-end"
            >
              Process Addresses
            </Button>
            <Divider my={2} />
          </VStack>
        </Collapse>

        <form onSubmit={handleSubmit}>
          <HStack>
            <Box position="relative" flex="1">
              <Input
                placeholder="Enter location address..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay hiding suggestions to allow for clicks
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                disabled={loading}
                autoComplete="off"
              />
              {isSearching && (
                <Box position="absolute" right={3} top="50%" transform="translateY(-50%)">
                  <Spinner size="sm" />
                </Box>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <List
                  position="absolute"
                  top="100%"
                  left={0}
                  right={0}
                  bg="white"
                  boxShadow="lg"
                  borderRadius="md"
                  mt={1}
                  maxH="200px"
                  overflowY="auto"
                  zIndex={1000}
                  borderWidth="1px"
                >
                  {suggestions.map(suggestion => (
                    <ListItem
                      key={suggestion.id}
                      p={2}
                      cursor="pointer"
                      _hover={{ bg: 'gray.100' }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion.place_name}
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading || isSearching}
              leftIcon={<AddIcon />}
            >
              Add
            </Button>
          </HStack>
        </form>

        {locations.length > 0 && (
          <VStack align="stretch" spacing={2}>
            {locations.map(location => (
              <HStack
                key={location.id}
                justify="space-between"
                p={2}
                bg="gray.50"
                borderRadius="md"
              >
                <Text>{location.address || 'Unknown location'}</Text>
                <IconButton
                  icon={<DeleteIcon />}
                  aria-label="Remove location"
                  size="sm"
                  colorScheme="red"
                  onClick={() => onLocationRemove(location.id)}
                  isDisabled={loading}
                />
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

LocationSearch.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool,
  onLocationAdd: PropTypes.func.isRequired,
  onLocationRemove: PropTypes.func.isRequired,
};

export default LocationSearch;
