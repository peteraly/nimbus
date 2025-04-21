# NIMUBS Dashboard

A React-based dashboard application for route optimization with weather integration.

## Features

- Route optimization with multiple waypoints
- Weather forecasting for route locations
- Interactive map visualization
- Responsive design for all devices
- Accessibility compliant

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nimubsdashboard.git
   cd nimubsdashboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_MAPBOX_TOKEN=your_mapbox_token
   REACT_APP_WEATHER_API_KEY=your_weather_api_key
   ```

4. Start the development server:
   ```
   npm start
   ```

## Development

### Code Quality

This project uses ESLint and Prettier for code quality and formatting:

- Run linting:
  ```
  npm run lint
  ```

- Fix linting issues:
  ```
  npm run lint:fix
  ```

- Format code:
  ```
  npm run format
  ```

### Git Hooks

The project uses Husky and lint-staged to run linting and formatting before commits.

## Project Structure

```
nimubsdashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── AddressInput.js
│   │   ├── Map.js
│   │   ├── RouteOptions.js
│   │   └── WeatherForecast.js
│   ├── pages/
│   │   ├── Dashboard.js
│   │   └── Settings.js
│   ├── services/
│   │   ├── mapService.js
│   │   └── weatherService.js
│   ├── utils/
│   │   └── routeUtils.js
│   ├── App.js
│   └── index.js
├── .env
├── .eslintrc.js
├── .prettierrc
└── package.json
```

## API Keys

This project requires the following API keys:

- Mapbox API key for map and routing functionality
- Weather API key for weather forecasting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Mapbox for mapping and routing APIs
- Weather API for weather forecasting
- React and Chakra UI for the frontend framework 