# Drone Weather Route Planner

A React application for planning drone routes with weather considerations using Mapbox services.

## Features

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
   REACT_APP_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
   REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```

## Mapbox Services Used

- Maps JavaScript API: For displaying maps and routes
- Directions API: For calculating optimized routes
- Geocoding API: For address search and autocomplete
- Places API: For finding nearby points of interest

## Development

```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 