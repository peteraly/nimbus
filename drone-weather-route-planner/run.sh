#!/bin/bash

# Check if running in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists and has API keys
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one with your API keys"
    exit 1
fi

# Start the development server
echo "🚀 Starting Drone Weather Route Planner..."
npm start 