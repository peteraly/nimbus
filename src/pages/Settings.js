import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Button,
  useToast,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { saveSettings, loadSettings } from '../utils/settingsUtils';

function Settings({ onSettingsUpdate }) {
  const [settings, setSettings] = useState({
    windSpeedThreshold: 20,
    precipitationThreshold: 0.1,
    visibilityThreshold: 5000,
    temperatureMin: 32,
    temperatureMax: 95,
    notifications: true,
    darkMode: false,
    display: {
      showWeatherOverlay: true,
    },
  });

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const savedSettings = loadSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleChange = (field, value) => {
    const newSettings = {
      ...settings,
      [field]: value
    };
    setSettings(newSettings);
    onSettingsUpdate(newSettings);
  };

  const handleSave = () => {
    saveSettings(settings);
    toast({
      title: 'Settings saved',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        <Heading size="md">Weather Thresholds</Heading>

        <FormControl>
          <FormLabel>Wind Speed Threshold (mph)</FormLabel>
          <NumberInput
            value={settings.windSpeedThreshold}
            onChange={(value) => handleChange('windSpeedThreshold', Number(value))}
            min={0}
            max={50}
            step={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Precipitation Threshold (inches/hour)</FormLabel>
          <NumberInput
            value={settings.precipitationThreshold}
            onChange={(value) => handleChange('precipitationThreshold', Number(value))}
            min={0}
            max={5}
            step={0.1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Visibility Threshold (meters)</FormLabel>
          <NumberInput
            value={settings.visibilityThreshold}
            onChange={(value) => handleChange('visibilityThreshold', Number(value))}
            min={0}
            max={10000}
            step={100}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Temperature Range (°F)</FormLabel>
          <NumberInput
            value={settings.temperatureMin}
            onChange={(value) => handleChange('temperatureMin', Number(value))}
            min={-40}
            max={120}
            step={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text mt={2}>to</Text>
          <NumberInput
            value={settings.temperatureMax}
            onChange={(value) => handleChange('temperatureMax', Number(value))}
            min={-40}
            max={120}
            step={1}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Enable Notifications</FormLabel>
          <Switch
            isChecked={settings.notifications}
            onChange={(e) => handleChange('notifications', e.target.checked)}
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Dark Mode</FormLabel>
          <Switch
            isChecked={settings.darkMode}
            onChange={(e) => handleChange('darkMode', e.target.checked)}
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Show Weather Overlay</FormLabel>
          <Switch
            isChecked={settings.display.showWeatherOverlay}
            onChange={(e) => handleChange('display', {
              ...settings.display,
              showWeatherOverlay: e.target.checked
            })}
          />
        </FormControl>

        <Button colorScheme="blue" onClick={handleSave}>
          Save Settings
        </Button>
      </VStack>
    </Box>
  );
}

export default Settings; 