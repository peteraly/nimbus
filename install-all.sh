#!/bin/bash

# Drone Weather Route Planner - Complete installation script
echo "🚀 Starting complete installation of Drone Weather Route Planner..."

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
cp ../install.sh .
cp ../copy-files.sh .
cp ../run.sh .
cp ../.gitignore .

# Make all scripts executable
echo "⚙️ Making scripts executable..."
chmod +x setup.sh install.sh copy-files.sh run.sh

# Run setup script
echo "⚙️ Running setup script..."
./setup.sh

# Run copy-files script
echo "📄 Copying component files..."
./copy-files.sh

echo "✅ Installation complete!"
echo "🚀 To start using the application:"
echo "1. cd drone-weather-route-planner"
echo "2. Update the API keys in .env file"
echo "3. Run './run.sh'"
echo "4. Open http://localhost:3000 in your browser" 