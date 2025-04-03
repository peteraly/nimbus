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
import { FaRoute, FaClock, FaWind, FaInfoCircle } from 'react-icons/fa';

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
      safetyPercentage: route.safetyPercentage,
      distance: route.distance,
      duration: route.duration,
      weatherScore: route.safetyPercentage,
      route: route.route,
      weatherHighlights: `Overall safety score: ${route.safetyPercentage}%`
    }
  ];

  return (
    <Box>
      <Text mb={4} color="gray.600">
        Select your preferred route based on weather conditions and travel distance.
      </Text>
      
      <RadioGroup value={selectedRouteIndex.toString()} onChange={(value) => onSelectRoute(parseInt(value))}>
        <VStack spacing={4} align="stretch">
          {routeOptions.map((option, index) => (
            <Box
              key={index}
              p={4}
              borderWidth={1}
              borderColor={selectedRouteIndex === index ? 'blue.500' : borderColor}
              borderRadius="md"
              bg={selectedRouteIndex === index ? 'blue.50' : bgColor}
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
                  
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} width="100%" mt={2}>
                    <HStack>
                      <Icon as={FaRoute} color="blue.500" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Distance</Text>
                        <Text fontWeight="bold">{formatDistance(option.distance)}</Text>
                      </VStack>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FaClock} color="blue.500" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Duration</Text>
                        <Text fontWeight="bold">{formatDuration(Math.round(option.duration / 60))}</Text>
                      </VStack>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FaWind} color="blue.500" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Weather Score</Text>
                        <Text fontWeight="bold">{option.weatherScore}%</Text>
                      </VStack>
                    </HStack>
                    
                    <HStack>
                      <Icon as={FaInfoCircle} color="blue.500" />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">Stops</Text>
                        <Text fontWeight="bold">{option.route.length}</Text>
                      </VStack>
                    </HStack>
                  </SimpleGrid>
                  
                  <Box width="100%" mt={2}>
                    <Text fontSize="sm" fontWeight="bold">Route Order:</Text>
                    <HStack spacing={2} mt={1} flexWrap="wrap">
                      {option.route.map((stop, i) => (
                        <Badge key={i} colorScheme="blue" borderRadius="full">
                          {i + 1}. {stop.address || `Stop ${i + 1}`}
                        </Badge>
                      ))}
                    </HStack>
                  </Box>
                  
                  <Box width="100%" mt={2}>
                    <Text fontSize="sm" fontWeight="bold">Weather Highlights:</Text>
                    <Text fontSize="sm" mt={1}>{option.weatherHighlights}</Text>
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