---
sidebar_position: 3
---

# Technical Setup

This section provides comprehensive guides for setting up and configuring LawFlow for development and deployment.

## Development Environment

Get started with developing LawFlow on your local machine:

- **[Local Development Setup](./local-development.md)** - Complete guide for setting up the development environment, including Docker and manual setup options

- **[Troubleshooting](./troubleshooting.md)** - Solutions to common setup issues and debugging tips

## System Architecture

LawFlow consists of three main components:

### Frontend (React/TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Custom components with Tailwind CSS
- **State Management**: React hooks and context

### Backend (FastAPI/Python)
- **Framework**: FastAPI with async support
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy with Alembic migrations
- **Authentication**: JWT tokens

### Infrastructure
- **Reverse Proxy**: Nginx
- **Containerization**: Docker & Docker Compose
- **Database**: SQLite/PostgreSQL
- **File Storage**: Local filesystem with cloud storage options

## Quick Setup Options

### Docker (Recommended)
```bash
git clone https://github.com/lawflow/lawflow.git
cd lawflow
docker-compose up -d
```

### Manual Setup
```bash
# Backend
cd lawflow_backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd lawflow_frontend
npm install
npm run dev
```

## Configuration

### Environment Variables

**Backend (.env)**:
```bash
DATABASE_URL="sqlite:///./lawflow.db"
SECRET_KEY="your-secret-key"
BACKEND_CORS_ORIGINS="http://localhost:8080"
```

**Frontend (.env.local)**:
```bash
VITE_API_BASE_URL="http://localhost:8000"
VITE_ENABLE_DEBUG=true
```

### Database Setup

**SQLite (Development)**:
- Automatic setup with Docker
- File-based database (`lawflow.db`)

**PostgreSQL (Production)**:
- Container: `docker run -d -p 5432:5432 postgres:13`
- Connection: `postgresql://user:pass@localhost:5432/lawflow`

## Development Workflow

1. **Clone Repository**
2. **Set Environment Variables**
3. **Install Dependencies**
4. **Run Database Migrations**: `alembic upgrade head`
5. **Start Services**: Frontend + Backend
6. **Access Application**: http://localhost:8080

## Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Nginx configuration updated
- [ ] Firewall rules set
- [ ] Monitoring tools configured

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

Common issues and solutions:

### Port Conflicts
```bash
# Find process using port
lsof -i :8000
kill -9 <PID>
```

### Database Issues
```bash
# Reset database
alembic downgrade base
alembic upgrade head
```

### Build Errors
```bash
# Clear caches
rm -rf node_modules package-lock.json
npm install
```

## Advanced Topics

- **API Documentation**: Available at `/docs` when backend is running
- **Database Schema**: Auto-generated from SQLAlchemy models
- **File Uploads**: Configurable storage backends
- **Email Integration**: SMTP configuration for notifications
- **External APIs**: Google Calendar, payment processors

## Contributing

- Follow the [development setup guide](./local-development.md)
- Use pre-commit hooks for code quality
- Write tests for new features
- Update documentation for API changes

---

:::info Development Setup
For the best development experience, use Docker with hot reload enabled.
:::

:::tip Production Deployment
Always test your deployment in a staging environment before going live.
:::
