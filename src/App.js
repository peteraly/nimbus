import React, { useState, useEffect, useRef } from 'react';
import {
  ChakraProvider,
  Box,
  Container,
  VStack,
  Heading,
  useColorModeValue,
  IconButton,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import AddressInput from './components/AddressInput';
import MapDisplay from './components/MapDisplay';
import RouteSummary from './components/RouteSummary';
import WeatherForecast from './components/WeatherForecast';
import Settings from './pages/Settings';
import { getOptimizedRoute } from './utils/routeUtils';
import RouteOptions from './components/RouteOptions';

function App() {
  const [locations, setLocations] = useState([]);
  const [route, setRoute] = useState(null);
  const [settings, setSettings] = useState({
    display: {
      showWeatherOverlay: true,
    },
  });
  const [weatherData, setWeatherData] = useState({});
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const weatherDataRef = useRef(weatherData);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const { colorMode, toggleColorMode } = useColorMode();

  // Transform locations with weather data
  const locationsWithWeather = locations.map(location => ({
    ...location,
    forecast: location && location.address ? weatherData[location.address]?.forecast : undefined
  }));

  // Keep weatherDataRef in sync with weatherData
  useEffect(() => {
    weatherDataRef.current = weatherData;
  }, [weatherData]);

  // Fetch weather data when locations change
  useEffect(() => {
    const fetchWeatherData = async (location) => {
      try {
        // Check if we already have weather data for this location
        if (weatherDataRef.current[location.address]) {
          return;
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${process.env.REACT_APP_OPENWEATHER_API_KEY}&units=imperial`
        );
        const data = await response.json();
        
        if (data.cod === '200') {
          console.log('Weather data received:', data);
          console.log('Number of 3-hour intervals:', data.list.length);
          
          // Process the forecast data to include all necessary information
          // OpenWeather API returns data in 3-hour intervals, so we need to generate hourly data
          const hourlyForecast = [];
          
          // Process each 3-hour interval
          data.list.forEach((item, index) => {
            const currentTime = new Date(item.dt * 1000);
            const nextTime = index < data.list.length - 1 
              ? new Date(data.list[index + 1].dt * 1000) 
              : new Date(currentTime.getTime() + 3 * 3600000); // If last item, add 3 hours
            
            // Generate hourly data for this 3-hour interval
            for (let hour = 0; hour < 3; hour++) {
              const hourTime = new Date(currentTime.getTime() + hour * 3600000);
              
              // Skip if this hour is beyond the next interval
              if (hourTime >= nextTime) continue;
              
              // Interpolate values for this hour
              const progress = hour / 3; // 0 to 1
              const nextItem = index < data.list.length - 1 ? data.list[index + 1] : item;
              
              // Interpolate temperature
              const tempDiff = nextItem.main.temp - item.main.temp;
              const interpolatedTemp = item.main.temp + tempDiff * progress;
              
              // Interpolate wind speed
              const windDiff = nextItem.wind.speed - item.wind.speed;
              const interpolatedWind = item.wind.speed + windDiff * progress;
              
              // For precipitation, divide the 3h value by 3 for hourly
              const hourlyPrecip = (item.rain?.['3h'] || 0) / 3;
              
              // For visibility, use the current value
              const visibility = item.visibility;
              
              // Add the hourly forecast
              hourlyForecast.push({
                date: hourTime.toISOString(),
                temperature: interpolatedTemp,
                wind: interpolatedWind,
                precipitation: hourlyPrecip,
                visibility: visibility,
                humidity: item.main.humidity,
                pressure: item.main.pressure,
                clouds: item.clouds.all,
                description: item.weather[0].description,
                icon: item.weather[0].icon
              });
            }
          });
          
          console.log('Generated hourly forecast with hours:', hourlyForecast.length);
          
          setWeatherData(prev => ({
            ...prev,
            [location.address]: {
              ...location,
              forecast: hourlyForecast
            }
          }));

          // Check for weather alerts
          if (data.alerts) {
            setWeatherAlerts(prev => [...prev, ...data.alerts]);
          }
        } else {
          throw new Error(data.message);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        toast({
          title: 'Error fetching weather data',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // Fetch weather data for new locations
    locations.forEach(location => {
      fetchWeatherData(location);
    });
  }, [locations, toast]); // weatherDataRef is stable, so we don't need it in deps

  // Add this new effect to handle route optimization
  useEffect(() => {
    const optimizeRoute = async () => {
      if (locations.length >= 2) {
        try {
          console.log('Optimizing route for locations:', locations);
          const optimizedRoute = await getOptimizedRoute(locationsWithWeather);
          console.log('Optimized route received:', optimizedRoute);
          setRoute(optimizedRoute);
        } catch (error) {
          console.error('Error optimizing route:', error);
          toast({
            title: 'Error optimizing route',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        setRoute(null);
      }
    };

    optimizeRoute();
  }, [locations, locationsWithWeather, toast]);

  const handleLocationAdd = (location) => {
    setLocations(prev => [...prev, location]);
  };

  const handleLocationRemove = (index) => {
    if (index === null) {
      // Clear all locations
      setLocations([]);
      setWeatherData({});
      setWeatherAlerts([]);
      setRoute(null);
    } else {
      // Remove single location
      setLocations(prev => {
        const newLocations = prev.filter((_, i) => i !== index);
        if (newLocations.length === 0) {
          setRoute(null);
        }
        return newLocations;
      });

      // Remove weather data for the removed location
      setWeatherData(prev => {
        const newData = { ...prev };
        const removedLocation = locations[index];
        if (removedLocation && removedLocation.address) {
          delete newData[removedLocation.address];
        }
        return newData;
      });
    }
  };

  const handleSettingsUpdate = (newSettings) => {
    setSettings(newSettings);
  };

  const handleRouteUpdate = (newRoute) => {
    setRoute(newRoute);
  };

  return (
    <ChakraProvider>
      <Box minH="100vh" bg={bgColor} color={textColor}>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Heading as="h1" size="2xl">
                Drone Weather Route Planner
              </Heading>
              <IconButton
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                aria-label="Toggle color mode"
              />
            </Box>
            
            <AddressInput
              onLocationAdd={handleLocationAdd}
              onLocationRemove={handleLocationRemove}
              locations={locations}
            />

            <MapDisplay
              locations={locations}
              route={route}
              settings={settings}
              onRouteUpdate={handleRouteUpdate}
            />

            <RouteOptions
              route={route}
              onSelectRoute={setSelectedRouteIndex}
              selectedRouteIndex={selectedRouteIndex}
            />

            <RouteSummary
              route={route}
              locations={locations}
            />

            <WeatherForecast
              locations={locationsWithWeather}
              alerts={weatherAlerts}
            />

            <Settings onSettingsUpdate={handleSettingsUpdate} />
          </VStack>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App; 