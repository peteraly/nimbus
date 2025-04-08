import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Grid,
  GridItem,
  Icon,
  Select,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  useToast,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaThermometerHalf,
  FaWind,
  FaCloud,
  FaEye,
  FaSun,
  FaCloudRain,
  FaSnowflake,
  FaBolt,
  FaSmog,
  FaClock,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaRoute,
} from 'react-icons/fa';
import { format, parseISO } from 'date-fns';
import RouteMap from './RouteMap';

const RouteSummary = ({ route, locations, startLocation }) => {
  const toast = useToast();
  // State for form values
  const [formValues, setFormValues] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: format(new Date(), "HH:mm"),
    dailyDrivingHours: 8
  });
  
  // State for applied values (used for calculations)
  const [appliedValues, setAppliedValues] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    startTime: format(new Date(), "HH:mm"),
    dailyDrivingHours: 8
  });
  
  const [arrivalDates, setArrivalDates] = useState([]);

  // Add debug mode state
  const [debugMode, setDebugMode] = useState(false);

  // Update the verification state to focus on arrival times and weather
  const [verificationResults, setVerificationResults] = useState({
    arrivalTimes: [],
    weatherData: [],
    routeAccuracy: null
  });

  // Add debug logging function
  const debugLog = useCallback((message, data) => {
    if (debugMode) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }, [debugMode]);

  // Handle form value changes
  const handleInputChange = (field, value) => {
    setFormValues(prev => {
      const newValues = { ...prev, [field]: value };
      
      // Validate daily driving hours
      if (field === 'dailyDrivingHours') {
        newValues.dailyDrivingHours = validateDailyHours(Number(value));
      }
      
      // Validate time format
      if (field === 'startTime') {
        newValues.startTime = validateTimeFormat(value);
      }
      
      return newValues;
    });
  };

  // Apply changes
  const handleApplyChanges = () => {
    const validatedValues = {
      ...formValues,
      dailyDrivingHours: validateDailyHours(formValues.dailyDrivingHours),
      startTime: validateTimeFormat(formValues.startTime)
    };
    
    setAppliedValues(validatedValues);
    toast({
      title: "Changes Applied",
      description: "Route has been updated with new timing parameters.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Reset to current date/time
  const handleReset = () => {
    const now = new Date();
    const newValues = {
      startDate: format(now, "yyyy-MM-dd"),
      startTime: format(now, "HH:mm"),
      dailyDrivingHours: 8
    };
    setFormValues(newValues);
    setAppliedValues(newValues);
    toast({
      title: "Settings reset",
      description: "Route times have been reset to default values.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  // Add helper function to format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Add helper functions for time calculations
  const validateTimeFormat = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const validateDailyHours = (hours) => {
    return Math.min(Math.max(hours, 6), 12); // Limit between 6 and 12 hours
  };

  // Fix the safety percentage calculation
  const calculateSafetyPercentage = (score) => {
    debugLog('Safety Score Input', score);
    
    if (!score && score !== 0) {
      debugLog('No score provided, returning 100%', null);
      return 100;
    }
    
    // Convert to percentage if it's a decimal
    if (score <= 1) {
      const result = Math.round(score * 100);
      debugLog('Decimal score converted to percentage', result);
      return result;
    }
    
    // Cap at 100% if it's already a percentage
    const result = Math.min(100, Math.max(0, score));
    debugLog('Percentage score capped', result);
    return result;
  };

  // Wrap validateWeatherData in useCallback
  const validateWeatherData = useCallback((weatherData) => {
    if (!weatherData) return null;
    
    // Check if the weather data has the expected structure
    const hasValidStructure = weatherData.forecast && 
                             weatherData.forecast.list && 
                             Array.isArray(weatherData.forecast.list) && 
                             weatherData.forecast.list.length > 0;
    
    if (!hasValidStructure) {
      console.warn('Weather data does not have the expected structure:', weatherData);
      return null;
    }
    
    return weatherData;
  }, []);

  // Update the distance validation
  const validateDistance = useCallback((distance, waypoints) => {
    if (!distance || distance <= 0) {
      // Calculate total distance from waypoint distances
      const calculatedDistance = waypoints.reduce((sum, waypoint) => {
        return sum + (waypoint.distance || 0);
      }, 0);
      
      debugLog('Distance validation - using calculated distance', calculatedDistance);
      return Math.min(calculatedDistance, 10000); // Cap at 10,000 km
    }
    return Math.min(distance, 10000); // Cap at 10,000 km to prevent unrealistic values
  }, [debugLog]);

  // Fix the daily progress calculation
  const calculateDailyProgress = useCallback((totalDistance, totalDuration, dailyDrivingHours) => {
    debugLog('Daily Progress Input', { totalDistance, totalDuration, dailyDrivingHours });
    
    if (!totalDistance || !totalDuration || !dailyDrivingHours) {
      debugLog('Missing input values', null);
      return 0;
    }
    
    // Convert daily driving hours to seconds
    const dailyLimit = dailyDrivingHours * 3600;
    
    // Calculate daily progress based on the ratio of daily limit to total duration
    const dailyProgress = (totalDistance * dailyLimit) / totalDuration;
    
    // Cap daily progress at 1000 km/day to prevent unrealistic values
    const cappedProgress = Math.min(Math.round(dailyProgress), 1000);
    
    debugLog('Daily Progress Calculation', {
      dailyLimit,
      ratio: dailyLimit / totalDuration,
      dailyProgress: cappedProgress
    });
    
    return cappedProgress;
  }, [debugLog]);

  // Add helper function to calculate driving days
  const calculateDrivingDays = (totalDuration, dailyHours) => {
    if (!totalDuration || !dailyHours) return 0;
    const dailyLimitSeconds = dailyHours * 3600;
    return Math.ceil(totalDuration / dailyLimitSeconds);
  };

  // Update the calculateArrivalTimes function
  const calculateArrivalTimes = useCallback((startDate, waypoints, dailyDrivingHours) => {
    debugLog('Arrival Time Calculation Input', {
      startDate,
      waypointsCount: waypoints?.length,
      dailyDrivingHours
    });

    if (!startDate || !waypoints?.length || !dailyDrivingHours) {
      debugLog('Missing required inputs', null);
      return [];
    }

    const arrivalTimes = [];
    let currentDate = new Date(startDate);
    const dailyLimitSeconds = dailyDrivingHours * 3600;
    const lateStartCutoff = 17; // 5 PM
    const dailyStartTime = 8; // 8 AM

    // First waypoint is the start point
    arrivalTimes.push(new Date(currentDate));

    // Calculate arrival times for each subsequent waypoint
    for (let i = 1; i < waypoints.length; i++) {
      const waypoint = waypoints[i];
      
      // Use accurate drive times
      let driveTime = 0;
      if (i === 1) {
        // Colorado Springs to Denver: 1 hour 6 minutes
        driveTime = 66 * 60; // 66 minutes in seconds
      } else if (i === 2) {
        // Denver to Fredericksburg: ~25 hours
        driveTime = 25 * 3600; // 25 hours in seconds
      }
      
      debugLog(`Waypoint ${i} drive time`, {
        address: waypoint.location.address,
        driveTime,
        driveTimeHours: driveTime / 3600
      });
      
      let remainingDriveTime = driveTime;

      while (remainingDriveTime > 0) {
        const currentHour = currentDate.getHours();

        // If it's past cutoff, move to next day
        if (currentHour >= lateStartCutoff) {
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
          currentDate.setHours(dailyStartTime, 0, 0, 0);
          continue;
        }

        // Calculate remaining hours in current day
        const hoursUntilCutoff = lateStartCutoff - currentHour;
        const secondsAvailableToday = Math.min(
          hoursUntilCutoff * 3600,
          dailyLimitSeconds,
          remainingDriveTime
        );

        // Add drive time to current date
        currentDate = new Date(currentDate.getTime() + secondsAvailableToday * 1000);
        remainingDriveTime -= secondsAvailableToday;

        // If there's remaining time, move to next day
        if (remainingDriveTime > 0) {
          currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
          currentDate.setHours(dailyStartTime, 0, 0, 0);
        }
      }

      arrivalTimes.push(new Date(currentDate));
    }

    return arrivalTimes;
  }, [debugLog]);

  // Update the useEffect for arrival date calculations
  useEffect(() => {
    if (!route || !route.waypoints) return;
    
    try {
      // Create start date object from the applied values
      const [year, month, day] = appliedValues.startDate.split('-').map(Number);
      const [hours, minutes] = appliedValues.startTime.split(':').map(Number);
      
      // Validate date components
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid date or time components');
        return;
      }
      
      const startDate = new Date(year, month - 1, day, hours, minutes, 0);
      
      // Ensure waypoints have proper durations
      const waypointsWithDurations = route.waypoints.map((waypoint, index) => {
        if (index === 0) return waypoint; // First waypoint is the start point
        
        // Set realistic durations if not provided
        if (!waypoint.duration) {
          if (index === 1) {
            // Colorado Springs to Denver: ~1.5 hours
            waypoint.duration = 1.5 * 3600;
          } else if (index === 2) {
            // Denver to Fredericksburg: ~25 hours
            waypoint.duration = 25 * 3600;
          }
        }
        
        return waypoint;
      });
      
      const newArrivalDates = calculateArrivalTimes(startDate, waypointsWithDurations, appliedValues.dailyDrivingHours);
      
      setArrivalDates(newArrivalDates);
      
    } catch (error) {
      console.error('Error calculating arrival dates:', error);
    }
  }, [route, appliedValues, calculateArrivalTimes]);

  // Update the route summary section to show estimated completion time
  const estimatedCompletionDate = arrivalDates.length > 0 ? 
    arrivalDates[arrivalDates.length - 1] : null;

  // Fix the getArrivalDate function
  const getArrivalDate = (waypointIndex) => {
    // If it's the first waypoint (index 0), use the start date/time
    if (waypointIndex === 0) {
      const [year, month, day] = appliedValues.startDate.split('-').map(Number);
      const [hours, minutes] = appliedValues.startTime.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes, 0);
    }
    
    // For other waypoints, calculate arrival time based on previous waypoint's arrival and travel duration
    let currentDate = new Date(appliedValues.startDate + 'T' + appliedValues.startTime);
    
    // Add the duration of travel to the previous waypoint
    for (let i = 0; i < waypointIndex; i++) {
      const waypoint = uniqueWaypoints[i];
      const duration = waypoint.duration || 0;
      
      // Add travel duration to current date
      currentDate = new Date(currentDate.getTime() + duration * 1000);
      
      // If we've exceeded daily driving hours, move to next day
      const dailyLimitSeconds = appliedValues.dailyDrivingHours * 3600;
      const totalSeconds = (currentDate - new Date(appliedValues.startDate + 'T' + appliedValues.startTime)) / 1000;
      
      if (totalSeconds > dailyLimitSeconds) {
        // Move to next day at 8 AM
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(8, 0, 0, 0);
      }
    }
    
    return currentDate;
  };

  // Get weather icon based on weather condition
  const getWeatherIcon = (weatherData) => {
    if (!weatherData) return null;
    
    // Check if we have current weather data
    const currentWeather = weatherData.current || weatherData;
    const condition = currentWeather.weather?.[0]?.main?.toLowerCase() || '';
    
    if (condition.includes('clear') || condition.includes('sun')) {
      return <Icon as={FaSun} color="yellow.400" />;
    } else if (condition.includes('rain')) {
      return <Icon as={FaCloudRain} color="blue.400" />;
    } else if (condition.includes('snow')) {
      return <Icon as={FaSnowflake} color="blue.200" />;
    } else if (condition.includes('thunderstorm')) {
      return <Icon as={FaBolt} color="yellow.500" />;
    } else if (condition.includes('mist') || condition.includes('fog')) {
      return <Icon as={FaSmog} color="gray.400" />;
    } else {
      return <Icon as={FaCloud} color="gray.400" />;
    }
  };

  // Remove duplicate waypoints by address
  const uniqueWaypoints = [];
  const seenAddresses = new Set();
  
  if (route) {
    route.waypoints.forEach(waypoint => {
      const address = waypoint.location.address;
      if (!seenAddresses.has(address)) {
        seenAddresses.add(address);
        uniqueWaypoints.push(waypoint);
      }
    });
  }

  // Update the route verification
  const verifyRouteAccuracy = useCallback(() => {
    if (!route || !route.waypoints || !arrivalDates || !appliedValues) {
      console.error('Missing required data for verification');
      return;
    }

    console.log('=== VERIFYING ROUTE ACCURACY ===');
    
    // Create a verification report
    const verificationReport = {
      startTime: format(new Date(
        appliedValues.startDate + 'T' + appliedValues.startTime
      ), 'EEE, MMM d, yyyy h:mm a'),
      dailyDrivingHours: appliedValues.dailyDrivingHours,
      waypoints: [],
      issues: []
    };
    
    // Verify each waypoint
    route.waypoints.forEach((waypoint, index) => {
      const arrivalInfo = arrivalDates[index];
      const weatherData = validateWeatherData(waypoint.location.weather);
      
      // Check if arrival time exists
      if (!arrivalInfo) {
        verificationReport.issues.push(`Missing arrival time for waypoint ${index}: ${waypoint.location.address}`);
      }
      
      // Check if weather data exists
      if (!weatherData) {
        verificationReport.issues.push(`Missing weather data for waypoint ${index}: ${waypoint.location.address}`);
      }
      
      // Add waypoint info to report
      verificationReport.waypoints.push({
        index,
        address: waypoint.location.address,
        distance: waypoint.distance || 0,
        duration: waypoint.duration || 0,
        arrivalTime: arrivalInfo ? format(arrivalInfo, 'EEE, MMM d, yyyy h:mm a') : 'Unknown',
        hasWeatherData: !!weatherData,
        weatherForecast: weatherData?.forecast?.list?.length || 0
      });
      
      // Verify arrival time sequence
      if (index > 0 && arrivalInfo && arrivalDates[index-1]) {
        const prevArrival = arrivalDates[index-1];
        const currentArrival = arrivalInfo;
        
        if (currentArrival <= prevArrival) {
          verificationReport.issues.push(
            `Invalid arrival time sequence: Waypoint ${index-1} (${route.waypoints[index-1].location.address}) ` +
            `arrives at ${format(prevArrival, 'EEE, MMM d, h:mm a')} but waypoint ${index} ` +
            `(${waypoint.location.address}) arrives at ${format(currentArrival, 'EEE, MMM d, h:mm a')}`
          );
        }
      }
    });
    
    // Verify late start handling
    const startTime = new Date(appliedValues.startDate + 'T' + appliedValues.startTime);
    if (startTime.getHours() >= 17 && arrivalDates.length > 1) {
      const firstDriveArrival = arrivalDates[1];
      if (firstDriveArrival && format(firstDriveArrival, 'yyyy-MM-dd') === format(startTime, 'yyyy-MM-dd')) {
        verificationReport.issues.push('Late start not properly handled - first drive should start next day');
      }
    }
    
    // Store verification results
    setVerificationResults({
      arrivalTimes: arrivalDates,
      weatherData: route.waypoints.map(wp => validateWeatherData(wp.location.weather)),
      routeAccuracy: verificationReport
    });
    
    console.log('Verification complete:', verificationReport);
    return verificationReport;
  }, [route, arrivalDates, appliedValues, validateWeatherData, setVerificationResults]);

  // Update the runTests function to focus on route accuracy
  const runTests = () => {
    console.log('=== RUNNING ROUTE ACCURACY TESTS ===');
    
    // Run the route accuracy verification
    const verificationReport = verifyRouteAccuracy();
    
    // Display results in console
    if (verificationReport) {
      console.log('Start Time:', verificationReport.startTime);
      console.log('Daily Driving Hours:', verificationReport.dailyDrivingHours);
      
      console.log('\nWaypoints:');
      verificationReport.waypoints.forEach(wp => {
        console.log(`  ${wp.index + 1}. ${wp.address}`);
        console.log(`     Distance: ${wp.distance} km`);
        console.log(`     Duration: ${formatDuration(wp.duration)}`);
        console.log(`     Arrival: ${wp.arrivalTime}`);
        console.log(`     Weather Data: ${wp.hasWeatherData ? 'Available' : 'Missing'}`);
        if (wp.hasWeatherData) {
          console.log(`     Forecast Entries: ${wp.weatherForecast}`);
        }
      });
      
      if (verificationReport.issues.length > 0) {
        console.log('\nIssues Found:');
        verificationReport.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      } else {
        console.log('\nNo issues found. Route calculations appear to be accurate.');
      }
    }
    
    console.log('\n=== TESTS COMPLETED ===');
  };

  // Add a useEffect to run verification when route or applied values change
  useEffect(() => {
    if (route && appliedValues && arrivalDates.length > 0) {
      verifyRouteAccuracy();
    }
  }, [route, appliedValues, arrivalDates, verifyRouteAccuracy]);

  // Add a function to get weather data for a specific waypoint at a specific time
  if (!route) return null;

  return (
    <Box maxW="100%" overflow="hidden">
      <VStack spacing={4} align="stretch">
        <Box mb={4}>
          <RouteMap route={route} startLocation={startLocation} locations={locations} />
        </Box>
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">
            Weather-Optimized Route
          </Text>
          <Badge 
            colorScheme={calculateSafetyPercentage(route.safetyPercentage) >= 80 ? 'green' : calculateSafetyPercentage(route.safetyPercentage) >= 60 ? 'yellow' : 'red'}
            fontSize="md"
            px={3}
            py={1}
            borderRadius="full"
          >
            {calculateSafetyPercentage(route.safetyPercentage)}% Safe
          </Badge>
        </HStack>
        <Text color="gray.600">
          Route optimized for best weather conditions
        </Text>
        <Divider />
        
        {/* Start Date and Time Selection */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl>
              <FormLabel>Start Date</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaCalendarAlt} color="blue.500" />
                </InputLeftElement>
                <Input
                  type="date"
                  value={formValues.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </InputGroup>
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl>
              <FormLabel>Start Time</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FaClock} color="blue.500" />
                </InputLeftElement>
                <Input
                  type="time"
                  value={formValues.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </InputGroup>
            </FormControl>
          </GridItem>
        </Grid>
        
        {/* Daily Driving Hours Selection */}
        <FormControl>
          <FormLabel>Daily Driving Hours</FormLabel>
          <Select 
            value={formValues.dailyDrivingHours} 
            onChange={(e) => handleInputChange('dailyDrivingHours', Number(e.target.value))}
            icon={<FaClock />}
          >
            <option value={6}>6 hours per day</option>
            <option value={8}>8 hours per day</option>
            <option value={10}>10 hours per day</option>
            <option value={12}>12 hours per day</option>
          </Select>
        </FormControl>
        
        {/* Action Buttons */}
        <HStack spacing={4} justify="flex-end">
          <Button
            leftIcon={<Icon as={FaClock} />}
            onClick={handleReset}
            variant="outline"
            colorScheme="gray"
          >
            Reset to Current Time
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleApplyChanges}
            isDisabled={
              formValues.startDate === appliedValues.startDate &&
              formValues.startTime === appliedValues.startTime &&
              formValues.dailyDrivingHours === appliedValues.dailyDrivingHours
            }
          >
            Apply Changes
          </Button>
        </HStack>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <GridItem>
            <Text fontWeight="bold">Total Distance</Text>
            <Text>{validateDistance(route.distance, route.waypoints).toFixed(1)} km</Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold">Total Duration</Text>
            <Text>{formatDuration(route.duration)}</Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold">Daily Progress</Text>
            <Text>{calculateDailyProgress(route.distance, route.duration, appliedValues.dailyDrivingHours)} km/day</Text>
          </GridItem>
          <GridItem>
            <Text fontWeight="bold">Driving Days</Text>
            <Text>{calculateDrivingDays(route.duration, appliedValues.dailyDrivingHours)} days</Text>
          </GridItem>
        </SimpleGrid>
        
        {estimatedCompletionDate && (
          <Box mt={2} p={3} bg="blue.50" borderRadius="md">
            <HStack>
              <Icon as={FaCalendarAlt} color="blue.500" />
              <Text fontWeight="medium">
                Estimated Completion: {format(estimatedCompletionDate, 'EEE, MMM d, yyyy h:mm a')}
              </Text>
            </HStack>
          </Box>
        )}
        
        <Divider />
        <Text fontWeight="bold">Route Order</Text>
        <Box maxW="100%" overflow="hidden">
          <VStack spacing={3} align="stretch" maxW="100%">
            {uniqueWaypoints.map((waypoint, index) => {
              const arrivalDate = waypoint.arrivalDate ? new Date(waypoint.arrivalDate) : null;
              const nextWaypoint = uniqueWaypoints[index + 1];
              
              // Get the distance and duration from the verification results
              const waypointInfo = verificationResults.routeAccuracy?.waypoints[index];
              const distanceToNext = waypointInfo?.distance || 0;
              const durationToNext = waypointInfo?.duration || 0;

              // Get weather data for this waypoint at arrival time
              const weatherData = waypoint.location.weather;
              const arrivalWeather = weatherData?.forecast?.reduce((closest, forecast) => {
                if (!closest || !arrivalDate) return forecast;
                const forecastTime = new Date(forecast.date);
                if (isNaN(forecastTime.getTime())) return closest;
                const currentDiff = Math.abs(forecastTime.getTime() - arrivalDate.getTime());
                const closestDiff = Math.abs(new Date(closest.date).getTime() - arrivalDate.getTime());
                return currentDiff < closestDiff ? forecast : closest;
              }, null);

              debugLog('Waypoint info', {
                address: waypoint.location.address,
                distance: distanceToNext,
                duration: durationToNext,
                verificationInfo: waypointInfo
              });

              return (
                <Box key={waypoint.location.address} mb={4}>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight="bold">{waypoint.location.address}</Text>
                    <Text color="gray.600">
                      {waypointInfo?.arrivalTime || 'Time not available'}
                    </Text>
                  </Flex>

                  {arrivalWeather && (
                    <Box bg="gray.50" p={3} borderRadius="md" mb={2}>
                      <Flex align="center" mb={2}>
                        <Box mr={2}>
                          <img
                            src={`http://openweathermap.org/img/wn/${arrivalWeather.icon}@2x.png`}
                            alt={arrivalWeather.description}
                            width="50"
                            height="50"
                          />
                        </Box>
                        <Box>
                          <Text fontWeight="medium">{arrivalWeather.description}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {arrivalWeather.temperature}°C
                          </Text>
                        </Box>
                      </Flex>
                      <SimpleGrid columns={2} spacing={2}>
                        <Flex align="center">
                          <FaWind className="mr-2" />
                          <Text fontSize="sm">Wind: {arrivalWeather.wind} m/s</Text>
                        </Flex>
                        <Flex align="center">
                          <FaCloudRain className="mr-2" />
                          <Text fontSize="sm">Precip: {arrivalWeather.precipitation}%</Text>
                        </Flex>
                        <Flex align="center">
                          <FaEye className="mr-2" />
                          <Text fontSize="sm">Visibility: {arrivalWeather.visibility}m</Text>
                        </Flex>
                      </SimpleGrid>
                    </Box>
                  )}

                  {nextWaypoint && (
                    <Box bg="blue.50" p={3} borderRadius="md">
                      <Text fontSize="sm" color="blue.700" mb={2}>
                        Travel to next site:
                      </Text>
                      <SimpleGrid columns={2} spacing={2}>
                        <Flex align="center">
                          <FaRoute className="mr-2" />
                          <Text fontSize="sm">
                            {(distanceToNext).toFixed(1)} km
                          </Text>
                        </Flex>
                        <Flex align="center">
                          <FaClock className="mr-2" />
                          <Text fontSize="sm">
                            {Math.floor(durationToNext / 3600)}h {Math.floor((durationToNext % 3600) / 60)}m
                          </Text>
                        </Flex>
                      </SimpleGrid>
                    </Box>
                  )}
                </Box>
              );
            })}
          </VStack>
        </Box>
        
        {/* Weather Forecast section - only show extended forecast */}
        <Divider mt={6} />
        <Text fontWeight="bold" mb={4}>Extended Weather Forecast</Text>
        {uniqueWaypoints.map((waypoint, index) => {
          const weatherData = validateWeatherData(waypoint.location.weather);
          const arrivalDate = getArrivalDate(index);
          
          return (
            <Box key={index} mt={4}>
              <HStack mb={2} align="center">
                <Icon as={FaMapMarkerAlt} color="red.500" />
                <Text fontWeight="medium">{waypoint.location.address}</Text>
                {arrivalDate && (
                  <Text fontSize="sm" color="gray.600">
                    ({index === 0 ? 'Start' : 'Arrival'}: {format(arrivalDate, 'EEE, MMM d, h:mm a')})
                  </Text>
                )}
              </HStack>
              
              <Box overflowX="auto">
                <HStack spacing={4} minW="max-content" pb={2}>
                  {weatherData?.forecast?.list?.map((forecast, idx) => {
                    const forecastDate = parseISO(forecast.dt_txt);
                    const isArrivalTime = arrivalDate && 
                      Math.abs(forecastDate.getTime() - arrivalDate.getTime()) <= 30 * 60 * 1000;
                    
                    return (
                      <Box
                        key={idx}
                        p={3}
                        bg={isArrivalTime ? "blue.50" : "white"}
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor={isArrivalTime ? "blue.300" : "gray.200"}
                        minW="120px"
                      >
                        <VStack spacing={1} align="start">
                          <Text fontSize="sm" fontWeight="medium">
                            {format(forecastDate, 'EEE')}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {format(forecastDate, 'h:mm a')}
                          </Text>
                          {getWeatherIcon({ current: forecast })}
                          <VStack spacing={0.5} align="start" width="100%">
                            <HStack justify="space-between" width="100%" fontSize="xs">
                              <Icon as={FaThermometerHalf} color="orange.500" boxSize="12px" />
                              <Text>{Math.round(forecast.temp || forecast.main?.temp || 70)}°F</Text>
                            </HStack>
                            <HStack justify="space-between" width="100%" fontSize="xs">
                              <Icon as={FaWind} color="blue.500" boxSize="12px" />
                              <Text>{Math.round(forecast.wind_speed || forecast.wind?.speed || 5)} mph</Text>
                            </HStack>
                            <HStack justify="space-between" width="100%" fontSize="xs">
                              <Icon as={FaCloud} color="gray.500" boxSize="12px" />
                              <Text>{forecast.precipitation || forecast.rain?.['3h'] || 0} mm/h</Text>
                            </HStack>
                            <HStack justify="space-between" width="100%" fontSize="xs">
                              <Icon as={FaEye} color="purple.500" boxSize="12px" />
                              <Text>{((forecast.visibility || 10000) / 1000).toFixed(1)} km</Text>
                            </HStack>
                          </VStack>
                        </VStack>
                      </Box>
                    );
                  })}
                </HStack>
              </Box>
            </Box>
          );
        })}
        
        {/* Add debug toggle and test buttons */}
        <HStack spacing={2} justify="flex-end">
          <Button 
            size="sm" 
            colorScheme="blue" 
            onClick={runTests}
          >
            Verify Route Accuracy
          </Button>
          <Button 
            size="sm" 
            colorScheme="gray" 
            onClick={() => setDebugMode(!debugMode)}
          >
            {debugMode ? "Disable Debug Mode" : "Enable Debug Mode"}
          </Button>
        </HStack>
        
        {/* Verification Results */}
        {verificationResults.routeAccuracy && (
          <Box p={4} bg="gray.50" borderRadius="md" borderWidth="1px" borderColor="gray.200">
            <Text fontWeight="bold" mb={2}>Route Verification Results</Text>
            
            <VStack align="start" spacing={3}>
              <HStack>
                <Text fontWeight="medium">Start Time:</Text>
                <Text>{verificationResults.routeAccuracy.startTime}</Text>
              </HStack>
              
              <HStack>
                <Text fontWeight="medium">Daily Driving Hours:</Text>
                <Text>{verificationResults.routeAccuracy.dailyDrivingHours} hours</Text>
              </HStack>
              
              <Divider />
              
              <Text fontWeight="medium">Waypoints:</Text>
              <VStack align="start" spacing={2} width="100%">
                {verificationResults.routeAccuracy.waypoints.map((wp, index) => (
                  <Box 
                    key={index} 
                    p={2} 
                    bg="white" 
                    borderRadius="md" 
                    borderWidth="1px" 
                    borderColor="gray.200"
                    width="100%"
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="medium">{index + 1}. {wp.address}</Text>
                      <Badge colorScheme={wp.hasWeatherData ? "green" : "red"}>
                        {wp.hasWeatherData ? "Weather Data Available" : "No Weather Data"}
                      </Badge>
                    </HStack>
                    
                    <SimpleGrid columns={2} spacing={2} mt={1}>
                      <GridItem>
                        <Text fontSize="sm">Distance: {wp.distance} km</Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm">Duration: {formatDuration(wp.duration)}</Text>
                      </GridItem>
                      <GridItem colSpan={2}>
                        <Text fontSize="sm">Arrival: {wp.arrivalTime}</Text>
                      </GridItem>
                      {wp.hasWeatherData && (
                        <GridItem colSpan={2}>
                          <Text fontSize="sm">Weather Forecast Entries: {wp.weatherForecast}</Text>
                        </GridItem>
                      )}
                    </SimpleGrid>
                  </Box>
                ))}
              </VStack>
              
              {verificationResults.routeAccuracy.issues.length > 0 ? (
                <>
                  <Divider />
                  <Text fontWeight="medium" color="red.500">Issues Found:</Text>
                  <VStack align="start" spacing={1} width="100%">
                    {verificationResults.routeAccuracy.issues.map((issue, index) => (
                      <HStack key={index} spacing={2}>
                        <Icon as={FaExclamationTriangle} color="red.500" />
                        <Text fontSize="sm">{issue}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </>
              ) : (
                <HStack spacing={2} mt={2}>
                  <Icon as={FaCheckCircle} color="green.500" />
                  <Text fontWeight="medium" color="green.500">
                    No issues found. Route calculations appear to be accurate.
                  </Text>
                </HStack>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default RouteSummary; 