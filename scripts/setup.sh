#!/bin/bash

set -e

echo "========================================="
echo "  NRF Project Setup Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}➜${NC} $1"
}

# Check if Node.js is installed
print_info "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js found: $NODE_VERSION"

# Check if npm is installed
print_info "Checking for npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_success "npm found: $NPM_VERSION"

echo ""
echo "========================================="
echo "  Step 1: Installing Dependencies"
echo "========================================="
echo ""

print_info "Running npm install..."
npm install
print_success "Dependencies installed successfully"

echo ""
echo "========================================="
echo "  Step 2: Creating Configuration File"
echo "========================================="
echo ""

# Check if config.yaml already exists
if [ -f "config.yaml" ]; then
    print_info "config.yaml already exists."
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp config.example.yaml config.yaml
        print_success "config.yaml overwritten from example"
    else
        print_info "Keeping existing config.yaml"
    fi
else
    cp config.example.yaml config.yaml
    print_success "Created config.yaml from example"
fi

echo ""
print_info "Would you like to configure MongoDB now? (y/N)"
read -p "Your choice: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Please enter your MongoDB connection details:"
    read -p "MongoDB URI (e.g., mongodb+srv://user:pass@cluster.mongodb.net/): " MONGODB_URI
    read -p "Database name (default: nrf): " MONGODB_DB
    MONGODB_DB=${MONGODB_DB:-nrf}

    # Update config.yaml with MongoDB settings
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|type: memory|type: mongodb|" config.yaml
        sed -i '' "s|uri: .*|uri: $MONGODB_URI|" config.yaml
        sed -i '' "s|name: .*|name: $MONGODB_DB|" config.yaml
    else
        # Linux
        sed -i "s|type: memory|type: mongodb|" config.yaml
        sed -i "s|uri: .*|uri: $MONGODB_URI|" config.yaml
        sed -i "s|name: .*|name: $MONGODB_DB|" config.yaml
    fi
    print_success "MongoDB configuration updated"
else
    print_info "Skipping MongoDB configuration. Using in-memory database."
    print_info "You can configure MongoDB later by editing config.yaml"
fi

echo ""
echo "========================================="
echo "  Step 3: Building TypeScript Project"
echo "========================================="
echo ""

print_info "Running npm run build..."
npm run build
print_success "TypeScript compiled successfully"

echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
print_success "NRF project is ready to use"
echo ""
echo "Next steps:"
echo "  • Development mode: npm run dev"
echo "  • Production mode:  npm start"
echo "  • View setup docs:  cat SETUP.md"
echo ""
print_info "Server will run on http://127.0.0.1:8080 by default"
print_info "Edit config.yaml to customize settings"
echo ""
