/**
 * Format distance in meters to a human-readable string
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
  if (!meters && meters !== 0) return 'N/A';
  
  // Convert to miles
  const miles = meters / 1609.34;
  
  if (miles < 0.1) {
    // Show in feet for very short distances
    const feet = meters * 3.28084;
    return `${Math.round(feet)} ft`;
  } else if (miles < 10) {
    // Show one decimal for shorter distances
    return `${miles.toFixed(1)} mi`;
  } else {
    // Round to whole number for longer distances
    return `${Math.round(miles)} mi`;
  }
};

/**
 * Format duration in seconds to a human-readable string
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
};

/**
 * Format a date to a human-readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a time to a human-readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted time string
 */
export const formatTime = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a datetime to a human-readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid Date';
  }
}; 