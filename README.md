# Drone Weather Route Planner

A React-based web application that helps drone operators plan optimal routes based on weather conditions. The application uses real-time weather data and Google Maps services to create safe and efficient routes for drone operations.

## Features

- Real-time weather forecasting for multiple locations
- Interactive Google Maps integration
- Route optimization based on weather conditions
- Weather safety scoring system
- Dark mode support
- Customizable weather thresholds
- Weather notifications for unsafe conditions
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Google Maps API key with the following services enabled:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Routes API
- OpenWeather API key

## Project Structure

```
drone-weather-route-planner/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── AddressInput.js
│   │   ├── MapDisplay.js
│   │   ├── RouteSummary.js
│   │   └── WeatherForecast.js
│   ├── pages/            # Page components
│   │   ├── Dashboard.js
│   │   └── Settings.js
│   ├── utils/            # Utility functions
│   │   ├── formatUtils.js
│   │   ├── routeUtils.js
│   │   ├── settingsUtils.js
│   │   └── weatherUtils.js
│   ├── App.js
│   └── index.js
├── .env                  # Environment variables
├── package.json
└── README.md
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

3. Create a `.env` file in the root directory with your API keys:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_GOOGLE_ROUTES_API_KEY=your_google_routes_api_key
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
```

## Dependencies

- @chakra-ui/icons: ^2.1.1
- @chakra-ui/react: ^2.8.2
- @emotion/react: ^11.11.3
- @emotion/styled: ^11.11.0
- @googlemaps/google-maps-services-js: ^3.3.41
- @react-google-maps/api: ^2.19.2
- axios: ^0.27.2
- date-fns: ^3.3.1
- framer-motion: ^11.0.5
- react: ^18.2.0
- react-dom: ^18.2.0
- react-icons: ^5.0.1
- react-router-dom: ^6.22.1
- react-scripts: 5.0.1

## API Requirements

### Google Maps API
1. Create a project in Google Cloud Console
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Routes API
3. Create API credentials
4. Add your domain to the API restrictions

### OpenWeather API
1. Sign up for an account at OpenWeather
2. Generate an API key
3. Enable the following endpoints:
   - 5-day forecast
   - Current weather

## Running the Application

1. Start the development server:
```bash
npm start
```

2. Open your browser and navigate to `http://localhost:3000`

## Building for Production

1. Create a production build:
```bash
npm run build
```

2. The build files will be created in the `build` directory

## Weather Thresholds

Default weather thresholds for safe drone operations:
- Wind Speed: 20 mph
- Precipitation: 0 mm/h
- Visibility: 3 miles
- Temperature: 32°F - 104°F

These thresholds can be customized in the Settings page.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Maps Platform
- OpenWeather API
- Chakra UI
- React Community

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 