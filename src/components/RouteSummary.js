import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Badge,
  HStack,
  Divider,
  Spinner,
  useColorModeValue,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { FaRoute, FaClock, FaWind, FaInfoCircle } from 'react-icons/fa';

const RouteSummary = ({ route, stats, locations, isCalculating }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
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

  if (isCalculating) {
    return (
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor} height="100%">
        <VStack spacing={4} align="center" justify="center" height="100%">
          <Spinner size="xl" color="blue.500" />
          <Text>Calculating optimal route...</Text>
        </VStack>
      </Box>
    );
  }

  if (!route) {
    return (
      <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor} height="100%">
        <VStack spacing={4} align="center" justify="center" height="100%">
          <Text>Add at least two locations to see route summary</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={4} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor} height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Heading size="md">Route Summary</Heading>
        
        <HStack width="100%" justify="space-between">
          <Text fontWeight="bold">{route.name}</Text>
          <Badge 
            colorScheme={getSafetyColor(route.safetyPercentage)}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="full"
          >
            {route.safetyPercentage}% Safe
          </Badge>
        </HStack>
        
        <Text fontSize="sm" color="gray.600">{route.description}</Text>
        
        <Divider />
        
        <SimpleGrid columns={2} spacing={4}>
          <Box>
            <HStack>
              <Icon as={FaRoute} color="blue.500" />
              <Text fontWeight="bold">Total Distance</Text>
            </HStack>
            <Text>{formatDistance(route.distance)}</Text>
          </Box>
          <Box>
            <HStack>
              <Icon as={FaClock} color="blue.500" />
              <Text fontWeight="bold">Total Duration</Text>
            </HStack>
            <Text>{formatDuration(Math.round(route.duration / 60))}</Text>
          </Box>
          <Box>
            <HStack>
              <Icon as={FaWind} color="blue.500" />
              <Text fontWeight="bold">Weather Score</Text>
            </HStack>
            <Text>{route.weatherScore}%</Text>
          </Box>
          <Box>
            <HStack>
              <Icon as={FaInfoCircle} color="blue.500" />
              <Text fontWeight="bold">Total Stops</Text>
            </HStack>
            <Text>{route.route.length}</Text>
          </Box>
        </SimpleGrid>
        
        <Divider />
        
        <Box>
          <Text fontWeight="bold">Route Order:</Text>
          <VStack align="start" spacing={1} mt={2}>
            {route.route.map((stop, index) => (
              <HStack key={index} width="100%">
                <Badge colorScheme="blue" borderRadius="full">{index + 1}</Badge>
                <Text fontSize="sm" noOfLines={1}>{stop.address}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>
        
        <Divider />
        
        <Box>
          <Text fontWeight="bold">Weather Highlights:</Text>
          <Text fontSize="sm" mt={1}>{route.weatherHighlights}</Text>
        </Box>
        
        <Box flex={1} />
        
        <Box>
          <Text fontWeight="bold">Location Weather Scores:</Text>
          <VStack align="start" spacing={1} mt={2}>
            {route.weatherScores.map((score, index) => (
              <HStack key={index} width="100%" justify="space-between">
                <Text fontSize="sm" noOfLines={1}>{score.location}</Text>
                <Badge 
                  colorScheme={getSafetyColor(score.score)}
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                >
                  {score.score}%
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default RouteSummary; 