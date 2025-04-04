import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Heading,
  useToast,
  Button,
  Link as ChakraLink,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import MapDisplay from '../components/MapDisplay';
import RouteSummary from '../components/RouteSummary';
import WeatherForecast from '../components/WeatherForecast';
import AddressInput from '../components/AddressInput';
import { loadSettings } from '../utils/settingsUtils';
import { getOptimizedRoute, calculateRouteStats, generateRouteOptions } from '../utils/routeUtils';
import { getWeatherForecast } from '../utils/weatherUtils';
import RouteOptions from '../components/RouteOptions';

// Load Google Maps API
const loadGoogleMapsAPI = () => {
  return new Promise((resolve, reject) => {
    console.log('Starting loadGoogleMapsAPI...');
    
    if (window.google && window.google.maps) {
      console.log('Google Maps API already loaded');
      resolve(window.google.maps);
      return;
    }

    // Use the recommended loading pattern
    (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
      key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      v: "weekly",
      libraries: ["places", "directions"]
    });

    // Wait for the API to load
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        console.log('Google Maps API loaded successfully');
        clearInterval(checkGoogleMaps);
        resolve(window.google.maps);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!window.google || !window.google.maps) {
        clearInterval(checkGoogleMaps);
        reject(new Error('Google Maps API failed to load after timeout'));
      }
    }, 10000);
  });
};

function Dashboard() {
  const [locations, setLocations] = useState([]);
  const [route, setRoute] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [settings, setSettings] = useState(loadSettings());
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState(null);
  const toast = useToast();
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  // Load Google Maps API on component mount
  useEffect(() => {
    let mounted = true;

    const loadMaps = async () => {
      try {
        await loadGoogleMapsAPI();
        if (mounted) {
          setMapsLoaded(true);
          setMapsError(null);
        }
      } catch (error) {
        if (mounted) {
          setMapsError(error.message);
          toast({
            title: 'Error',
            description: 'Failed to load Google Maps API. Please refresh the page.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    loadMaps();

    return () => {
      mounted = false;
    };
  }, [toast]);

  // Calculate route when locations change
  useEffect(() => {
    const calculateRouteIfNeeded = async () => {
      if (!mapsLoaded) {
        return;
      }

      if (mapsError) {
        return;
      }

      if (isCalculating) {
        return;
      }

      if (locations.length < 2) {
        setRouteOptions([]);
        setRoute(null);
        setRouteStats(null);
        return;
      }

      try {
        setIsCalculating(true);
        const optimizedRoute = await getOptimizedRoute(locations);
        
        if (optimizedRoute) {
          setRouteOptions([optimizedRoute]);
          setRoute(optimizedRoute);
          setRouteStats({
            totalStops: optimizedRoute.route.length,
            safeStops: optimizedRoute.weatherScores.filter(s => s.score > 70).length,
            moderateStops: optimizedRoute.weatherScores.filter(s => s.score > 40 && s.score <= 70).length,
            unsafeStops: optimizedRoute.weatherScores.filter(s => s.score <= 40).length,
            totalDistance: optimizedRoute.distance,
            totalDuration: optimizedRoute.duration,
            safetyPercentage: optimizedRoute.safetyPercentage
          });
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to calculate route. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsCalculating(false);
      }
    };

    calculateRouteIfNeeded();
  }, [locations, mapsLoaded, mapsError, isCalculating, toast]);

  const handleLocationAdd = async (location) => {
    try {
      const weatherApiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      
      if (!weatherApiKey) {
        // Create mock hourly forecast data for 7 days
        const mockForecast = Array(7).fill().map((_, dayIndex) => {
          const dayForecast = Array(24).fill().map((_, hourIndex) => ({
            date: new Date(Date.now() + dayIndex * 86400000 + hourIndex * 3600000).toISOString(),
            temperature: 70 + Math.random() * 20 - 10,
            wind: Math.random() * 25,
            precipitation: Math.random() < 0.3 ? Math.random() * 2 : 0,
            visibility: 10000 - Math.random() * 5000,
            humidity: Math.random() * 100,
            pressure: 1000 + Math.random() * 20,
            clouds: Math.random() * 100
          }));
          return dayForecast;
        }).flat();
        
        const newLocation = {
          ...location,
          forecast: mockForecast,
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng)
        };
        
        setLocations(prevLocations => [...prevLocations, newLocation]);
        return;
      }

      // Get real forecast data with hourly intervals
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=${weatherApiKey}&units=imperial`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      // Process the forecast data to include all necessary information
      const hourlyForecast = [];
      
      data.list.forEach((item, index) => {
        const currentTime = new Date(item.dt * 1000);
        
        // Interpolate data for each hour
        for (let hour = 0; hour < 3; hour++) {
          const hourTime = new Date(currentTime.getTime() + hour * 3600000);
          
          // Interpolate temperature
          const nextItem = data.list[index + 1];
          const interpolatedTemp = nextItem ? 
            item.main.temp + (nextItem.main.temp - item.main.temp) * (hour / 3) :
            item.main.temp;
          
          // Interpolate wind speed
          const interpolatedWind = nextItem ?
            item.wind.speed + (nextItem.wind.speed - item.wind.speed) * (hour / 3) :
            item.wind.speed;
          
          // Calculate hourly precipitation
          const hourlyPrecip = item.rain ? (item.rain['3h'] || 0) / 3 : 0;
          
          // Get visibility (in meters)
          const visibility = item.visibility || 10000;
          
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
      
      const newLocation = {
        ...location,
        forecast: hourlyForecast,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      };
      
      setLocations(prevLocations => [...prevLocations, newLocation]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add location. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLocationRemove = (index) => {
    const newLocations = locations.filter((_, i) => i !== index);
    setLocations(newLocations);
  };

  const handleRouteSelect = (index) => {
    setSelectedRouteIndex(index);
    // Update the main route and stats when a new route is selected
    const selectedRoute = routeOptions[index];
    if (selectedRoute) {
      setRoute(selectedRoute);
      setRouteStats({
        totalStops: selectedRoute.route.length,
        safeStops: selectedRoute.weatherScores.filter(s => s.score > 70).length,
        moderateStops: selectedRoute.weatherScores.filter(s => s.score > 40 && s.score <= 70).length,
        unsafeStops: selectedRoute.weatherScores.filter(s => s.score <= 40).length,
        totalDistance: selectedRoute.distance,
        totalDuration: selectedRoute.duration,
        safetyPercentage: selectedRoute.safetyPercentage
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Heading mb={4}>Drone Weather Route Planner</Heading>
        <Button as={RouterLink} to="/settings" colorScheme="blue" size="sm">
          Settings
        </Button>
      </Box>

      <Box p={4}>
        <VStack spacing={4} align="stretch">
          <AddressInput
            onLocationAdd={handleLocationAdd}
            onLocationRemove={handleLocationRemove}
            locations={locations}
          />
          
          {locations.length > 0 && (
            <WeatherForecast locations={locations} />
          )}
          
          {routeOptions.length > 0 && (
            <Box mt={6} p={4} bg="white" borderRadius="lg" boxShadow="md">
              <Heading size="md" mb={4}>Recommended Routes</Heading>
              <RouteOptions
                routeOptions={routeOptions}
                onSelectRoute={handleRouteSelect}
                selectedRouteIndex={selectedRouteIndex}
              />
            </Box>
          )}
          
          <HStack spacing={4} align="stretch">
            <Box flex={1}>
              <MapDisplay
                locations={locations}
                route={route}
                settings={settings}
              />
            </Box>
            <Box w="400px">
              <RouteSummary
                route={route}
                stats={routeStats}
                locations={locations}
                isCalculating={isCalculating}
              />
            </Box>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
}

export default Dashboard; 