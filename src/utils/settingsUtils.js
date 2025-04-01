// Default settings
const DEFAULT_SETTINGS = {
  weatherThresholds: {
    windSpeed: 20, // mph
    precipitation: 0, // mm/h
    visibility: 3, // miles
    temperature: {
      min: 32, // °F
      max: 104 // °F
    }
  },
  routePreferences: {
    mode: 'fastest', // 'fastest' or 'shortest'
    avoidHighways: false,
    avoidTolls: false
  },
  notifications: {
    weatherAlerts: true,
    routeChanges: true,
    unsafeConditions: true
  },
  display: {
    showWeatherOverlay: true,
    showTraffic: true,
    showAlternativeRoutes: true
  }
};

const SETTINGS_KEY = 'drone_weather_route_planner_settings';

// Load settings from localStorage
export const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    return savedSettings ? JSON.parse(savedSettings) : null;
  } catch (error) {
    console.error('Error loading settings:', error);
    return null;
  }
};

// Save settings to localStorage
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Update specific setting
export const updateSetting = (key, value) => {
  const settings = loadSettings();
  const newSettings = {
    ...settings,
    [key]: value
  };
  return saveSettings(newSettings);
};

// Reset settings to defaults
export const resetSettings = () => {
  return saveSettings(DEFAULT_SETTINGS);
};

// Validate weather thresholds
export const validateWeatherThresholds = (thresholds) => {
  const errors = [];

  if (thresholds.windSpeed < 0) {
    errors.push('Wind speed cannot be negative');
  }

  if (thresholds.precipitation < 0) {
    errors.push('Precipitation cannot be negative');
  }

  if (thresholds.visibility < 0) {
    errors.push('Visibility cannot be negative');
  }

  if (thresholds.temperature.min > thresholds.temperature.max) {
    errors.push('Minimum temperature cannot be greater than maximum temperature');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get formatted weather threshold display
export const formatWeatherThreshold = (key, value) => {
  switch (key) {
    case 'windSpeed':
      return `${value} mph`;
    case 'precipitation':
      return `${value} mm/h`;
    case 'visibility':
      return `${value} miles`;
    case 'temperature':
      return `${value.min}°F - ${value.max}°F`;
    default:
      return value;
  }
};

// Get weather threshold description
export const getWeatherThresholdDescription = (key) => {
  switch (key) {
    case 'windSpeed':
      return 'Maximum wind speed for safe drone operation';
    case 'precipitation':
      return 'Maximum precipitation rate for safe drone operation';
    case 'visibility':
      return 'Minimum visibility required for safe drone operation';
    case 'temperature':
      return 'Temperature range for safe drone operation';
    default:
      return '';
  }
};

// Get notification settings
export const getNotificationSettings = () => {
  const settings = loadSettings();
  return settings.notifications;
};

// Update notification settings
export const updateNotificationSettings = (notifications) => {
  return updateSetting('notifications', notifications);
};

// Get route preferences
export const getRoutePreferences = () => {
  const settings = loadSettings();
  return settings.routePreferences;
};

// Update route preferences
export const updateRoutePreferences = (preferences) => {
  return updateSetting('routePreferences', preferences);
};

// Get display settings
export const getDisplaySettings = () => {
  const settings = loadSettings();
  return settings.display;
};

// Update display settings
export const updateDisplaySettings = (display) => {
  return updateSetting('display', display);
};

// Export default settings for use in other components
export { DEFAULT_SETTINGS }; 