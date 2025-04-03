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
        console.log('Starting to load Google Maps API...');
        await loadGoogleMapsAPI();
        if (mounted) {
          console.log('Setting mapsLoaded to true');
          setMapsLoaded(true);
          setMapsError(null);
        }
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
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
    console.log('=== Route Calculation Effect ===');
    console.log('Effect triggered with:', {
      locationsCount: locations.length,
      isCalculating,
      mapsLoaded,
      mapsError,
      hasRoute: !!route,
      hasStats: !!routeStats,
      locations: locations.map(l => ({
        address: l.address,
        hasForecast: !!l.forecast,
        hasCoords: !!l.lat && !!l.lng
      }))
    });

    const calculateRouteIfNeeded = async () => {
      console.log('=== calculateRouteIfNeeded Debug ===');
      console.log('Current state:', {
        locationsCount: locations.length,
        isCalculating,
        mapsLoaded,
        mapsError,
        hasRoute: !!route,
        hasStats: !!routeStats,
        locations: locations.map(l => ({
          address: l.address,
          hasForecast: !!l.forecast,
          hasCoords: !!l.lat && !!l.lng
        }))
      });

      if (!mapsLoaded) {
        console.log('Google Maps API not loaded yet');
        return;
      }

      if (mapsError) {
        console.log('Google Maps API error:', mapsError);
        return;
      }

      if (isCalculating) {
        console.log('Route calculation already in progress');
        return;
      }

      if (locations.length < 2) {
        console.log('Not enough locations for route calculation');
        setRouteOptions([]);
        setRoute(null);
        setRouteStats(null);
        return;
      }

      try {
        setIsCalculating(true);
        console.log('Starting route calculation with locations:', locations.map(l => ({
          address: l.address,
          hasForecast: !!l.forecast,
          hasCoords: !!l.lat && !!l.lng
        })));

        // Generate route options first
        const options = await generateRouteOptions(locations);
        console.log('Generated route options:', options);
        setRouteOptions(options);
        
        // Select the first option by default (usually the safety-first option)
        if (options.length > 0) {
          setSelectedRouteIndex(0);
          const optimizedRoute = options[0];
          console.log('Using first route option:', optimizedRoute);

          const stats = {
            totalStops: optimizedRoute.route.length,
            safeStops: optimizedRoute.weatherScores.filter(s => s.score > 70).length,
            moderateStops: optimizedRoute.weatherScores.filter(s => s.score > 40 && s.score <= 70).length,
            unsafeStops: optimizedRoute.weatherScores.filter(s => s.score <= 40).length,
            totalDistance: optimizedRoute.distance,
            totalDuration: optimizedRoute.duration,
            safetyPercentage: optimizedRoute.safetyPercentage
          };

          console.log('Setting route and stats:', {
            route: optimizedRoute,
            stats
          });

          setRoute(optimizedRoute);
          setRouteStats(stats);
        } else {
          console.log('No route options generated');
          setRoute(null);
          setRouteStats(null);
        }
      } catch (error) {
        console.error('Error calculating route:', error);
        toast({
          title: 'Error calculating route',
          description: 'Failed to calculate the optimal route. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setRouteOptions([]);
        setRoute(null);
        setRouteStats(null);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateRouteIfNeeded();
  }, [locations, mapsLoaded, mapsError, isCalculating, toast]);

  const handleLocationAdd = async (location) => {
    try {
      console.log('Adding new location:', location);
      const weatherApiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
      
      if (!weatherApiKey) {
        console.log('No OpenWeather API key, using mock data');
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
        
        console.log('Generated mock forecast with hours:', mockForecast.length);
        
        const newLocation = {
          ...location,
          forecast: mockForecast,
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng)
        };
        
        console.log('Adding location with mock forecast:', newLocation);
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
      console.log('Weather forecast received:', data);
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
      
      const newLocation = {
        ...location,
        forecast: hourlyForecast,
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      };
      
      console.log('Adding location with real forecast:', newLocation);
      setLocations(prevLocations => [...prevLocations, newLocation]);
    } catch (error) {
      console.error('Error adding location:', error);
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