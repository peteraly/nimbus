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

  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const { colorMode, toggleColorMode } = useColorMode();

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
          // Process 5-day forecast data
          const forecast = data.list
            .filter((item, index) => index % 8 === 0) // Get one reading per day
            .map(item => ({
              date: new Date(item.dt * 1000),
              temperature: item.main.temp,
              condition: item.weather[0].main,
              windSpeed: item.wind.speed,
              precipitation: item.rain ? item.rain['3h'] : 0,
              visibility: item.visibility
            }));

          setWeatherData(prev => ({
            ...prev,
            [location.address]: {
              ...location,
              forecast
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

  // Transform locations with weather data
  const locationsWithWeather = locations.map(location => ({
    ...location,
    forecast: location && location.address ? weatherData[location.address]?.forecast : undefined
  }));

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