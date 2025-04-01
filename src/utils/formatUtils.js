// Format distance in meters to miles
export const formatDistance = (meters) => {
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
};

// Format duration in seconds to hours and minutes
export const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Format temperature in Fahrenheit
export const formatTemperature = (celsius) => {
  const fahrenheit = (celsius * 9/5) + 32;
  return `${Math.round(fahrenheit)}°F`;
};

// Format wind speed in m/s to mph
export const formatWindSpeed = (mps) => {
  const mph = mps * 2.237;
  return `${Math.round(mph)} mph`;
};

// Format precipitation in mm/h
export const formatPrecipitation = (mmh) => {
  return `${mmh.toFixed(1)} mm/h`;
};

// Format visibility in meters to miles
export const formatVisibility = (meters) => {
  const miles = meters / 1609.34;
  return `${miles.toFixed(1)} mi`;
};

// Format date to a readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Format time to a readable string
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}; 