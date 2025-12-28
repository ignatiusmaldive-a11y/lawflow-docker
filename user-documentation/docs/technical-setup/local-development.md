---
sidebar_position: 1
---

# Local Development Setup

Complete guide for setting up LawFlow development environment on your local machine.

## System Architecture Overview

Before diving into setup, understand LawFlow's architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │────│   Nginx Proxy   │────│  LawFlow App    │
│                 │    │   (Port 80)     │    │                 │
│  ┌────────────┐ │    │                 │    │  ┌────────────┐ │
│  │ React App  │ │    │  /api/* → :8000 │    │  │ FastAPI    │ │
│  │ (Port 8080)│ │    │  /* → :8080     │    │  │ Backend    │ │
│  └────────────┘ │    └─────────────────┘    │  │ (Port 8000)│ │
└─────────────────┘                           │  └────────────┘ │
                                              │                 │
                                              │  ┌────────────┐ │
                                              │  │ SQLite DB  │ │
                                              │  └────────────┘ │
                                              └─────────────────┘
```

**Data Flow:**
```
User Action → React Component → API Call → FastAPI Router → Database
      ↓              ↓              ↓            ↓            ↓
   UI Update ← State Update ← Response ← Business Logic ← SQL Query
```

## Prerequisites

### Required Software

**Core Dependencies:**
- **Node.js 18+** with npm
- **Python 3.9+** with pip
- **Git** for version control

**Optional but Recommended:**
- **Docker & Docker Compose** - For containerized development
- **PostgreSQL** - For production-like database setup
- **VS Code** - Recommended IDE with extensions

### System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **OS**: macOS 10.15+, Windows 10+, Ubuntu 18.04+

## Development Environment Setup

### Option 1: Docker Development (Recommended)

The fastest way to get started with all dependencies:

#### 1. Clone Repository

```bash
git clone https://github.com/lawflow/lawflow.git
cd lawflow
```

#### 2. Environment Configuration

Create environment files:

```bash
# Copy example configs
cp lawflow_backend/.env.example lawflow_backend/.env
cp docker-compose.override.yml.example docker-compose.override.yml
```

#### 3. Start Development Environment

```bash
# Start all services with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Or for production-like setup
docker-compose up -d
```

#### 4. Access Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database Admin**: http://localhost:8080/admin

### Option 2: Manual Setup

For advanced development and debugging:

#### Backend Setup

```bash
# Navigate to backend
cd lawflow_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt

# Set environment variables
export DATABASE_URL="sqlite:///./dev.db"
export SECRET_KEY="your-development-secret-key"
export DEBUG=1

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
# Navigate to frontend
cd lawflow_frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Application available at http://localhost:8080
```

#### Nginx Proxy (Optional)

For production-like routing:

```bash
# From project root
docker run -d \
  --name lawflow-nginx-dev \
  -p 80:80 \
  -v $(pwd)/nginx/dev.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine
```

## Database Configuration

### SQLite (Development Default)

Best for getting started quickly:

```bash
# Automatic setup with Docker
# Or manual:
export DATABASE_URL="sqlite:///./lawflow.db"
```

### PostgreSQL (Production-like)

For advanced development:

```bash
# Start PostgreSQL container
docker run -d \
  --name lawflow-postgres \
  -e POSTGRES_DB=lawflow \
  -e POSTGRES_USER=lawflow \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:13

# Update environment
export DATABASE_URL="postgresql://lawflow:password@localhost:5432/lawflow"
```

## Environment Variables

### Backend Configuration

Create `lawflow_backend/.env`:

```bash
# Database
DATABASE_URL="sqlite:///./dev.db"

# Security
SECRET_KEY="your-development-secret-key-here"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
BACKEND_CORS_ORIGINS="http://localhost:8080,http://localhost:3000"

# File Upload
MAX_UPLOAD_SIZE=104857600  # 100MB
UPLOAD_PATH="./uploads"

# Email (optional)
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME=""
SMTP_PASSWORD=""

# External APIs
GOOGLE_CALENDAR_CLIENT_ID=""
GOOGLE_CALENDAR_CLIENT_SECRET=""
```

### Frontend Configuration

Create `lawflow_frontend/.env.local`:

```bash
# API Configuration
VITE_API_BASE_URL="http://localhost:8000"

# Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# External Services
VITE_GOOGLE_CALENDAR_CLIENT_ID=""
VITE_STRIPE_PUBLISHABLE_KEY=""
```

## Development Workflow

### Code Changes

**Frontend Hot Reload:**
- Changes automatically reload in browser
- State preserved during development
- Error overlays for debugging

**Backend Hot Reload:**
- Server restarts automatically on code changes
- Database migrations run on startup
- API documentation updates live

### Testing

```bash
# Backend tests
cd lawflow_backend
pytest

# Frontend tests
cd lawflow_frontend
npm test

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Lint and format
npm run lint
npm run format

# Type checking
npm run type-check

# Security audit
npm audit
```

## Debugging

### Frontend Debugging

- **React DevTools** - Component inspection
- **Browser Console** - JavaScript errors and logs
- **Network Tab** - API request monitoring
- **Redux DevTools** - State management debugging

### Backend Debugging

- **API Documentation** - Interactive endpoint testing at `/docs`
- **Database Browser** - SQLite browser or pgAdmin
- **Logging** - Structured logs with different levels
- **Debug Mode** - Enhanced error messages

### Common Issues

**Port conflicts:**
```bash
# Find process using port
lsof -i :8000
kill -9 <PID>
```

**Database migrations:**
```bash
# Reset database
alembic downgrade base
alembic upgrade head
```

**Dependency issues:**
```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install

# Python virtual env
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Advanced Development

### Running with Different Configurations

```bash
# Development mode
npm run dev

# Production build preview
npm run build
npm run serve

# With different environment
NODE_ENV=staging npm run dev
```

### Database Seeding

Populate with sample data:

```bash
# Backend seed script
python -m app.seed

# Or via API
curl -X POST http://localhost:8000/api/seed
```

### Performance Monitoring

```bash
# Bundle analyzer
npm run analyze

# Lighthouse audit
npm run lighthouse
```

## Contributing

### Code Standards

- **ESLint/Prettier** for JavaScript/TypeScript
- **Black/isort** for Python
- **Conventional commits** for git messages
- **Pre-commit hooks** for quality checks

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes with tests
# Commit with conventional format
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

## Deployment

### Local Production Test

```bash
# Build and test production
npm run build
npm run serve

# Test with production database
export NODE_ENV=production
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Support

- 📖 [Documentation](../intro.md)
- 💬 [Discord Community](https://discord.gg/lawflow)
- 🐛 [GitHub Issues](https://github.com/lawflow/lawflow/issues)
- 📧 [Email Support](mailto:support@lawflow.app)

---

:::info Environment Setup
For the quickest start, use Docker. Manual setup gives you more control for advanced development.
:::

:::tip Development Tips
- Use VS Code with recommended extensions
- Enable git hooks for automatic quality checks
- Keep your development environment updated regularly
:::
