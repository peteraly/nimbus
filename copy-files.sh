#!/bin/bash

# Create necessary directories
mkdir -p src/components src/utils src/pages

# Copy component files
echo "📄 Copying component files..."
cp ../components/MapDisplay.js src/components/
cp ../components/RouteSummary.js src/components/
cp ../components/WeatherForecast.js src/components/
cp ../components/AddressInput.js src/components/
cp ../components/Settings.js src/components/

# Copy utility files
echo "📄 Copying utility files..."
cp ../utils/weatherUtils.js src/utils/
cp ../utils/routeUtils.js src/utils/
cp ../utils/settingsUtils.js src/utils/

# Copy page files
echo "📄 Copying page files..."
cp ../pages/Dashboard.js src/pages/
cp ../pages/Settings.js src/pages/

# Copy App.js
echo "📄 Copying App.js..."
cp ../App.js src/

echo "✅ File copying complete!" 