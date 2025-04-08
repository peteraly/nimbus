import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Radio,
  RadioGroup,
  SimpleGrid,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { FaRoute, FaClock, FaInfoCircle } from 'react-icons/fa';

const RouteOptions = ({ route, onSelectRoute, selectedRouteIndex }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  
  // Function to get color based on safety percentage
  const getSafetyColor = (percentage) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    if (percentage >= 40) return 'orange';
    return 'red';
  };
  
  // Function to format duration in minutes to hours and minutes
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  // Function to format distance in meters to kilometers
  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(1) + ' km';
  };

  if (!route) {
    return (
      <Box p={4} borderWidth={1} borderColor={borderColor} borderRadius="md" bg={bgColor}>
        <Text>Add at least two locations to see route options.</Text>
      </Box>
    );
  }

  // Create route options based on the optimized route
  const routeOptions = [
    {
      name: 'Weather-Optimized Route',
      description: 'Route optimized for best weather conditions',
      safetyPercentage: route.safetyPercentage || 0,
      distance: route.distance || 0,
      duration: route.duration || 0,
      weatherScore: route.safetyPercentage || 0,
      route: route.route || [],
      weatherHighlights: `Overall safety score: ${route.safetyPercentage || 0}%`
    }
  ];

  // Ensure selectedRouteIndex is valid
  const validSelectedIndex = selectedRouteIndex !== undefined && 
                            selectedRouteIndex >= 0 && 
                            selectedRouteIndex < routeOptions.length ? 
                            selectedRouteIndex : 0;

  return (
    <Box>
      <Text mb={4} color="gray.600">
        Select your preferred route based on weather conditions and travel distance.
      </Text>
      
      <RadioGroup value={validSelectedIndex.toString()} onChange={(value) => onSelectRoute(parseInt(value))}>
        <VStack spacing={4} align="stretch">
          {routeOptions.map((option, index) => (
            <Box
              key={index}
              p={4}
              borderWidth={1}
              borderColor={validSelectedIndex === index ? 'blue.500' : borderColor}
              borderRadius="md"
              bg={validSelectedIndex === index ? 'blue.50' : bgColor}
              _hover={{ bg: hoverBgColor }}
              transition="all 0.2s"
              cursor="pointer"
              onClick={() => onSelectRoute(index)}
            >
              <HStack align="start" spacing={4}>
                <Radio value={index.toString()} size="lg" mt={1} />
                
                <VStack align="start" spacing={2} flex={1}>
                  <HStack justify="space-between" width="100%">
                    <Heading size="sm">{option.name}</Heading>
                    <Badge 
                      colorScheme={getSafetyColor(option.safetyPercentage)}
                      fontSize="sm"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      {option.safetyPercentage}% Safe
                    </Badge>
                  </HStack>
                  
                  <Text fontSize="sm" color="gray.600">{option.description}</Text>
                  
                  <SimpleGrid columns={2} spacing={4} width="100%">
                    <Box>
                      <HStack>
                        <Icon as={FaRoute} color="blue.500" />
                        <Text fontWeight="bold">Distance</Text>
                      </HStack>
                      <Text>{formatDistance(option.distance)}</Text>
                    </Box>
                    <Box>
                      <HStack>
                        <Icon as={FaClock} color="blue.500" />
                        <Text fontWeight="bold">Duration</Text>
                      </HStack>
                      <Text>{formatDuration(Math.round(option.duration / 60))}</Text>
                    </Box>
                  </SimpleGrid>
                  
                  <Box width="100%">
                    <HStack>
                      <Icon as={FaInfoCircle} color="blue.500" />
                      <Text fontWeight="bold">Weather Highlights</Text>
                    </HStack>
                    <Text fontSize="sm">{option.weatherHighlights}</Text>
                  </Box>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </RadioGroup>
    </Box>
  );
};

export default RouteOptions; 