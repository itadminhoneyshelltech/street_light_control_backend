#!/bin/bash
# START_SERVERS.sh
# This script starts all required servers for the Street Light Control System

echo "🚦 Starting Street Light Control System..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to start a service in background
start_service() {
    local name=$1
    local cmd=$2
    local port=$3
    
    echo -e "${YELLOW}Starting ${name}...${NC}"
    $cmd &
    sleep 3
    echo -e "${GREEN}✓ ${name} started on port ${port}${NC}"
    echo ""
}

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}Starting Services${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""

# Start PHP Backend
echo -e "${YELLOW}[1/2] PHP Backend${NC}"
cd "$SCRIPT_DIR/street_light_control_backend"
php -S localhost:8000 index.php &
PHP_PID=$!
sleep 2
echo -e "${GREEN}✓ PHP Backend running on localhost:8000${NC}"
echo ""

# Start React Frontend
echo -e "${YELLOW}[2/2] React Frontend${NC}"
cd "$SCRIPT_DIR/street_light_control_frontend"
npx react-scripts start &
REACT_PID=$!
sleep 5
echo -e "${GREEN}✓ React Frontend running on localhost:3001${NC}"
echo ""

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}All Services Started!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}📱 Frontend:${NC}  http://localhost:3001"
echo -e "${YELLOW}🔌 Backend API:${NC} http://localhost:8000/api"
echo -e "${YELLOW}🧪 API Tester:${NC} http://localhost:8000/TEST_API_FLOW.html"
echo ""
echo -e "${YELLOW}📝 Credentials:${NC}"
echo -e "   Email: admin@streetlight.com"
echo -e "   Password: admin123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
