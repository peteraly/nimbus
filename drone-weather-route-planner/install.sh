#!/bin/bash

# Drone Weather Route Planner - One-click installation script
echo "🚀 Starting Drone Weather Route Planner installation..."

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detected macOS"
    
    # Check for Homebrew
    if ! command -v brew &> /dev/null; then
        echo "📦 Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        echo "📦 Installing Node.js..."
        brew install node
    fi
else
    echo "❌ This script is currently only supported on macOS"
    exit 1
fi

# Create project directory
echo "📁 Creating project directory..."
mkdir -p drone-weather-route-planner
cd drone-weather-route-planner

# Copy all necessary files
echo "📄 Copying project files..."
cp ../package.json .
cp ../README.md .
cp ../setup.sh .

# Make setup script executable
chmod +x setup.sh

# Run setup script
echo "⚙️ Running setup script..."
./setup.sh

echo "✅ Installation complete!"
echo "🚀 To start using the application:"
echo "1. cd drone-weather-route-planner"
echo "2. Update the API keys in .env file"
echo "3. Run 'npm start'"
echo "4. Open http://localhost:3000 in your browser" 