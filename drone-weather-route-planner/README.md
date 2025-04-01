# Drone Weather Route Planner

A React-based dashboard for planning drone routes based on weather conditions. The application helps drone operators optimize their flight paths by considering weather forecasts, wind conditions, and other environmental factors.

## Features

- Multi-location route planning with Google Maps integration
- Real-time weather data from multiple sources (OpenWeatherMap, WeatherAPI, NWS)
- 7-day weather forecast for each location
- Weather-based route optimization
- Configurable weather thresholds for drone operations
- Interactive map with weather overlays
- Clean, intuitive user interface

## Prerequisites

- Node.js (v16.0.0 or later)
- npm (v7.0.0 or later)
- Google Maps API key
- Weather API keys (OpenWeatherMap, WeatherAPI.com)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
REACT_APP_WEATHERAPI_KEY=your_weatherapi_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/drone-weather-route-planner.git
cd drone-weather-route-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
/drone-weather-route-planner
├── /src
│   ├── /components
│   │   ├── MapDisplay.js
│   │   ├── RouteSummary.js
│   │   ├── WeatherForecast.js
│   │   ├── AddressInput.js
│   │   └── Settings.js
│   ├── /utils
│   │   ├── weatherUtils.js
│   │   ├── routeUtils.js
│   │   └── settingsUtils.js
│   ├── /pages
│   │   ├── Dashboard.js
│   │   └── Settings.js
│   └── App.js
├── package.json
└── README.md
```

## Default Weather Thresholds

The application comes with default weather thresholds based on industry best practices:

- Wind Speed: 20 mph
- Precipitation: 0 mm/h
- Visibility: 3 miles
- Temperature Range: 32°F to 104°F

These thresholds can be customized in the Settings page.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 