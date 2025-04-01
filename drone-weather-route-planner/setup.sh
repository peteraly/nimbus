#!/bin/bash

# Drone Weather Route Planner - One-click setup script
echo "🚁 Setting up Drone Weather Route Planner..."

# Check for Node.js and npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo "❌ Node.js and npm are required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Create project structure
echo "📁 Creating project structure..."
mkdir -p src/components src/utils src/pages

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔑 Creating .env file..."
    cat > .env << EOL
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key
REACT_APP_WEATHERAPI_KEY=your_weatherapi_key
EOL
    echo "⚠️ Please update the API keys in .env file"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories if they don't exist
echo "📁 Creating necessary directories..."
mkdir -p public

# Create index.html
echo "📄 Creating index.html..."
cat > public/index.html << EOL
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Drone Weather Route Planner" />
    <title>Drone Weather Route Planner</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOL

# Create index.js
echo "📄 Creating index.js..."
cat > src/index.js << EOL
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL

echo "✅ Setup complete!"
echo "🚀 To start the application:"
echo "1. Update the API keys in .env file"
echo "2. Run 'npm start'"
echo "3. Open http://localhost:3000 in your browser" 