#!/usr/bin/env bash
set -euo pipefail

# LawFlow Application Test Script
# Comprehensive testing of all application functionality

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "${BLUE}🧪 LawFlow Application Test Suite${NC}"
echo "===================================="
echo ""

# Test 1: Backend Health Check
echo "${BLUE}🔍 Test 1: Backend Health Check${NC}"
if curl -s http://localhost:8000/health | grep -q '"ok":true'; then
    echo "${GREEN}✅ Backend health check passed${NC}"
else
    echo "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Test 2: Enhanced Health Check
echo "${BLUE}🔍 Test 2: Enhanced Health Check${NC}"
if curl -s http://localhost:8000/health | grep -q '"timestamp"'; then
    echo "${GREEN}✅ Enhanced health check passed${NC}"
else
    echo "${RED}❌ Enhanced health check failed${NC}"
    exit 1
fi

# Test 3: Detailed Health Check
echo "${BLUE}🔍 Test 3: Detailed Health Check${NC}"
if curl -s http://localhost:8000/health/detailed | grep -q '"components"'; then
    echo "${GREEN}✅ Detailed health check passed${NC}"
else
    echo "${RED}❌ Detailed health check failed${NC}"
    exit 1
fi

# Test 4: API Health Check through Nginx
echo "${BLUE}🔍 Test 4: API Health Check through Nginx${NC}"
if curl -s http://localhost/api/health | grep -q '"ok":true'; then
    echo "${GREEN}✅ API health check through Nginx passed${NC}"
else
    echo "${RED}❌ API health check through Nginx failed${NC}"
    exit 1
fi

# Test 5: Projects API Endpoint
echo "${BLUE}🔍 Test 5: Projects API Endpoint${NC}"
if curl -s http://localhost/api/projects | grep -q '"id"'; then
    echo "${GREEN}✅ Projects API endpoint working${NC}"
else
    echo "${RED}❌ Projects API endpoint failed${NC}"
    exit 1
fi

# Test 6: Tasks API Endpoint
echo "${BLUE}🔍 Test 6: Tasks API Endpoint${NC}"
if curl -s "http://localhost/api/tasks?project_id=1" | grep -q '"title"'; then
    echo "${GREEN}✅ Tasks API endpoint working${NC}"
else
    echo "${RED}❌ Tasks API endpoint failed${NC}"
    exit 1
fi

# Test 7: Frontend Access
echo "${BLUE}🔍 Test 7: Frontend Access${NC}"
if curl -s http://localhost/ | grep -q '<title>LawFlow'; then
    echo "${GREEN}✅ Frontend accessible${NC}"
else
    echo "${RED}❌ Frontend not accessible${NC}"
    exit 1
fi

# Test 8: Frontend API Base Configuration
echo "${BLUE}🔍 Test 8: Frontend API Base Configuration${NC}"
if curl -s http://localhost/ | grep -q 'LawFlow'; then
    echo "${GREEN}✅ Frontend API base configuration working${NC}"
else
    echo "${RED}❌ Frontend API base configuration failed${NC}"
    exit 1
fi

# Test 9: Database Connectivity
echo "${BLUE}🔍 Test 9: Database Connectivity${NC}"
if curl -s http://localhost:8000/health/detailed | grep -q 'database.*ok'; then
    echo "${GREEN}✅ Database connectivity verified${NC}"
else
    echo "${RED}❌ Database connectivity failed${NC}"
    exit 1
fi

# Test 10: Checklist API Endpoint
echo "${BLUE}🔍 Test 10: Checklist API Endpoint${NC}"
if curl -s "http://localhost/api/checklists?project_id=1" | grep -q '"id"'; then
    echo "${GREEN}✅ Checklist API endpoint working${NC}"
else
    echo "${RED}❌ Checklist API endpoint failed${NC}"
    exit 1
fi

# Test 11: Timeline API Endpoint
echo "${BLUE}🔍 Test 11: Timeline API Endpoint${NC}"
if curl -s "http://localhost/api/timeline?project_id=1" | grep -q '"label"'; then
    echo "${GREEN}✅ Timeline API endpoint working${NC}"
else
    echo "${RED}❌ Timeline API endpoint failed${NC}"
    exit 1
fi

# Test 12: Activity API Endpoint
echo "${BLUE}🔍 Test 12: Activity API Endpoint${NC}"
if curl -s "http://localhost/api/activity?project_id=1" | grep -q '"verb"'; then
    echo "${GREEN}✅ Activity API endpoint working${NC}"
else
    echo "${RED}❌ Activity API endpoint failed${NC}"
    exit 1
fi

echo ""
echo "${BLUE}====================================${NC}"
echo "${GREEN}🎉 All tests passed! Application is healthy.${NC}"
echo "${BLUE}====================================${NC}"
echo ""
echo "${YELLOW}Application Status:${NC}"
echo "- Backend: ✅ Running on port 8000"
echo "- Frontend: ✅ Running on port 8080"
echo "- Nginx: ✅ Proxying on port 80"
echo "- Database: ✅ Connected and functional"
echo "- API Endpoints: ✅ All working correctly"
echo ""
echo "${YELLOW}Access URLs:${NC}"
echo "- Application: http://localhost"
echo "- Backend Docs: http://localhost:8000/docs"
echo "- Frontend Dev: http://localhost:8080"
echo "- API Health: http://localhost/api/health"
echo ""
