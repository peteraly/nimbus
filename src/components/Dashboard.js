import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import AddressInput from './AddressInput';

const Dashboard = () => {
  const [locations, setLocations] = useState([]);
  const [startLocation, setStartLocation] = useState(null);

  const handleLocationAdd = (location) => {
    setLocations(prevLocations => [...prevLocations, location]);
    setStartLocation(location);
  };

  const handleLocationRemove = (locationToRemove) => {
    setLocations(prevLocations => {
      const newLocations = prevLocations.filter(loc => loc !== locationToRemove);
      if (newLocations.length > 0) {
        setStartLocation(newLocations[0]);
      } else {
        setStartLocation(null);
      }
      return newLocations;
    });
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <AddressInput
          onLocationSelect={handleLocationAdd}
          placeholder="Enter a location to add to your route..."
        />
        
        {locations.length > 0 && (
          <HStack spacing={2}>
            <Text>Added Locations: {locations.length}</Text>
            <Button
              size="sm"
              leftIcon={<DeleteIcon />}
              onClick={() => handleLocationRemove(null)}
              colorScheme="red"
              variant="ghost"
            >
              Clear All
            </Button>
          </HStack>
        )}
        
        {/* Rest of your component */}
      </VStack>
    </Box>
  );
};

export default Dashboard; 