import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Divider,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { formatDistance, formatDuration } from '../utils/formatUtils';

function RouteSummary({ route, stats, locations }) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!route || !stats) {
    return (
      <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
        <Text>Add at least two locations to see route summary</Text>
      </Box>
    );
  }

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <Heading size="md">Route Summary</Heading>
        
        <Stat>
          <StatLabel>Total Distance</StatLabel>
          <StatNumber>{formatDistance(stats.totalDistance)}</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            Estimated duration: {formatDuration(stats.totalDuration)}
          </StatHelpText>
        </Stat>

        <Divider />

        <Box>
          <Text mb={2}>Safety Score</Text>
          <Progress value={stats.safetyScore} colorScheme="green" size="sm" />
          <Text mt={2} fontSize="sm" color="gray.500">
            {stats.safetyScore}% of stops are safe for drone operations
          </Text>
        </Box>

        <Divider />

        <Box>
          <Heading size="sm" mb={4}>Stops</Heading>
          <List spacing={3}>
            {locations.map((location, index) => (
              <ListItem key={index} display="flex" alignItems="center">
                <ListIcon as={location.isSafe ? CheckIcon : WarningIcon} 
                         color={location.isSafe ? 'green.500' : 'red.500'} />
                <Box>
                  <Text>{location.address}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {formatDistance(location.distance)} • {formatDuration(location.duration)}
                  </Text>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>

        {stats.unsafeStops > 0 && (
          <Box p={4} bg="red.50" borderRadius="md">
            <Text color="red.700">
              Warning: {stats.unsafeStops} stop{stats.unsafeStops > 1 ? 's' : ''} have unsafe weather conditions.
              Consider rescheduling or finding alternative locations.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

export default RouteSummary; 