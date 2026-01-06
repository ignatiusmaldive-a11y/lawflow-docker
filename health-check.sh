#!/usr/bin/env bash
set -euo pipefail

# LawFlow Health Check Script
# Simplified version that works without sudo

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}🏥 LawFlow Application Health Check${NC}"
echo "======================================"
echo ""

# Test 1: Backend Health Check
echo "${BLUE}🔍 Testing backend health endpoint...${NC}"
if curl -s http://localhost:8000/health | grep -q '"ok":true'; then
    echo "${GREEN}✅ Backend health check passed${NC}"
else
    echo "${RED}❌ Backend health check failed${NC}"
fi

# Test 2: Enhanced Health Check
echo "${BLUE}🔍 Testing enhanced health check...${NC}"
if curl -s http://localhost:8000/health | grep -q '"timestamp"'; then
    echo "${GREEN}✅ Enhanced health check passed${NC}"
else
    echo "${RED}❌ Enhanced health check failed${NC}"
fi

# Test 3: Detailed Health Check
echo "${BLUE}🔍 Testing detailed health check...${NC}"
if curl -s http://localhost:8000/health/detailed | grep -q '"components"'; then
    echo "${GREEN}✅ Detailed health check passed${NC}"
else
    echo "${RED}❌ Detailed health check failed${NC}"
fi

# Test 4: API Health Check through Nginx
echo "${BLUE}🔍 Testing API through Nginx...${NC}"
if curl -s http://localhost/api/health | grep -q '"ok":true'; then
    echo "${GREEN}✅ API health check through Nginx passed${NC}"
else
    echo "${RED}❌ API health check through Nginx failed${NC}"
fi

# Test 5: Projects API Endpoint
echo "${BLUE}🔍 Testing projects API endpoint...${NC}"
if curl -s http://localhost/api/projects | grep -q '"id"'; then
    echo "${GREEN}✅ Projects API endpoint working${NC}"
else
    echo "${RED}❌ Projects API endpoint failed${NC}"
fi

# Test 6: Frontend Access
echo "${BLUE}🔍 Testing frontend access...${NC}"
if curl -s http://localhost/ | grep -q '<title>LawFlow'; then
    echo "${GREEN}✅ Frontend accessible${NC}"
else
    echo "${RED}❌ Frontend not accessible${NC}"
fi

# Test 7: Database Connectivity
echo "${BLUE}🔍 Testing database connectivity...${NC}"
if curl -s http://localhost:8000/health/detailed | grep -q 'database.*ok'; then
    echo "${GREEN}✅ Database connectivity verified${NC}"
else
    echo "${RED}❌ Database connectivity failed${NC}"
fi

echo ""
echo "${BLUE}======================================${NC}"
echo "${GREEN}🎉 Health check complete!${NC}"
echo "${BLUE}======================================${NC}"
echo ""
echo "${YELLOW}Quick Access URLs:${NC}"
echo "- Application: http://localhost"
echo "- Backend Docs: http://localhost:8000/docs"
echo "- Frontend Dev: http://localhost:8080"
echo "- API Health: http://localhost/api/health"
echo "- Detailed Health: http://localhost:8000/health/detailed"
echo ""
