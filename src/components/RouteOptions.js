import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Select,
  Button,
  useColorModeValue,
  RadioGroup,
  Radio,
  Stack,
  Flex,
  Divider,
  Icon,
  useToast,
} from '@chakra-ui/react';
import { FaRoute, FaSun } from 'react-icons/fa';
import PropTypes from 'prop-types';

const RouteOptions = ({ 
  locations = [], 
  selectedStartPoint, 
  onStartPointChange,
  onOptimize 
}) => {
  const [optimizationType, setOptimizationType] = React.useState('distance');
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (!selectedStartPoint || locations.length < 2) return;
    
    setLoading(true);
    try {
      onOptimize({
        startPoint: locations.find(loc => loc.id === selectedStartPoint),
        optimizationType
      });
    } catch (error) {
      console.error('Route generation failed:', error);
      toast({
        title: 'Route Generation Failed',
        description: 'Please check your selections and try again.',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={4} align="stretch">
        <Text fontWeight="bold" fontSize="lg">Route Options</Text>
        
        <Box>
          <Text mb={2}>Starting Point</Text>
          <Select
            value={selectedStartPoint}
            onChange={(e) => onStartPointChange(e.target.value)}
            placeholder="Select starting location"
            isDisabled={locations.length === 0}
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.address}
              </option>
            ))}
          </Select>
        </Box>

        <Divider />

        <Box>
          <Text mb={2}>Optimization Strategy</Text>
          <RadioGroup value={optimizationType} onChange={setOptimizationType}>
            <Stack spacing={4}>
              <Radio value="distance">
                <Flex align="center" gap={2}>
                  <Icon as={FaRoute} />
                  <Box>
                    <Text>Most Efficient Route</Text>
                    <Text fontSize="sm" color="gray.500">
                      Optimizes for shortest total distance and driving time
                    </Text>
                  </Box>
                </Flex>
              </Radio>
              <Radio value="weather">
                <Flex align="center" gap={2}>
                  <Icon as={FaSun} />
                  <Box>
                    <Text>Weather-Aware Route</Text>
                    <Text fontSize="sm" color="gray.500">
                      Considers current weather patterns and daylight hours
                    </Text>
                  </Box>
                </Flex>
              </Radio>
            </Stack>
          </RadioGroup>
        </Box>

        <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
          <VStack align="start" spacing={2}>
            <Text fontWeight="medium">Route Constraints:</Text>
            <Text fontSize="sm">• Maximum 8 hours driving per day</Text>
            <Text fontSize="sm">• 30 minutes per site visit</Text>
            <Text fontSize="sm">• Site visits between 7 AM - 7 PM only</Text>
            <Text fontSize="sm">• Weather data used for planning and safety</Text>
          </VStack>
        </Box>

        <Button
          colorScheme="blue"
          onClick={handleOptimize}
          isDisabled={!selectedStartPoint || locations.length < 2}
          size="lg"
          isLoading={loading}
        >
          Generate Route
        </Button>
      </VStack>
    </Box>
  );
};

RouteOptions.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      coordinates: PropTypes.arrayOf(PropTypes.number).isRequired,
    })
  ).isRequired,
  selectedStartPoint: PropTypes.string,
  onStartPointChange: PropTypes.func.isRequired,
  onOptimize: PropTypes.func.isRequired,
};

export default RouteOptions; 