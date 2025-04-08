# Drone Weather Route Planner

A React application for planning drone routes with weather considerations using Mapbox services.

## Features

- Interactive Mapbox integration
- Multi-location route planning
- Weather-based route optimization
- Real-time weather data from OpenWeather
- Address search and autocomplete
- Route visualization with weather overlays

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Mapbox access token
- OpenWeather API key

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   REACT_APP_MAPBOX_STYLE_URL=mapbox://styles/mapbox/streets-v12
   REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
   ```

## Usage

1. Start the development server:
   ```bash
   npm start
   ```
2. Open http://localhost:3000 in your browser
3. Enter locations to plan your route
4. View weather information and optimized routes

## Mapbox Services Used

- Maps JavaScript API
- Directions API
- Geocoding API
- Places API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Mapbox
- OpenWeather API
- Chakra UI
- React Community

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 