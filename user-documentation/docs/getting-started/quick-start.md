---
sidebar_position: 1
---

# Quick Start Guide

Get LawFlow running locally in 5 minutes with this streamlined setup guide.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker & Docker Compose** (recommended for easiest setup)
- **Node.js 18+** and **npm** (for frontend development)
- **Python 3.9+** (for backend development)

:::info System Requirements
- **OS**: Linux, macOS, or Windows (with WSL2)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
:::

## Option 1: Docker Setup (Recommended)

The fastest way to get LawFlow running is using Docker Compose.

### Step 1: Clone the Repository

```bash
git clone https://github.com/lawflow/lawflow.git
cd lawflow
```

### Step 2: Start the Application

```bash
# Start all services (frontend, backend, database)
docker-compose up -d

# Or for development with hot reload:
docker-compose -f docker-compose.dev.yml up -d
```

### Step 3: Access LawFlow

Open your browser and navigate to:
- **LawFlow App**: http://localhost:8080
- **API Documentation**: http://localhost:8000/docs
- **Database Admin**: http://localhost:8080/admin (if configured)

### Step 4: First Login

Use these default credentials:
- **Username**: admin@lawflow.app
- **Password**: admin123

:::warning Security Note
Change the default password immediately after first login in Settings > Security.
:::

## Option 2: Manual Development Setup

For developers who want to contribute or customize LawFlow.

### Backend Setup

```bash
# Navigate to backend directory
cd lawflow_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up database
# For SQLite (development):
export DATABASE_URL="sqlite:///./lawflow.db"

# For PostgreSQL (production):
export DATABASE_URL="postgresql://user:password@localhost/lawflow"

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd lawflow_frontend

# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:8080
```

### Nginx Proxy (Optional)

For production-like setup with proper routing:

```bash
# Start nginx proxy
docker run -d \
  --name lawflow-nginx \
  -p 80:80 \
  -v $(pwd)/nginx/default.conf:/etc/nginx/conf.d/default.conf \
  nginx:alpine
```

## Verify Installation

Once running, verify your setup:

1. **Access the application** at http://localhost:8080
2. **Check API health** at http://localhost:8000/health
3. **View API documentation** at http://localhost:8000/docs
4. **Test database connection** in the admin panel

## Next Steps

Now that LawFlow is running:

1. **Create your first matter** - Try creating a sample property purchase
2. **Explore the interface** - Familiarize yourself with the task board and file room
3. **Configure settings** - Set up your municipality templates and preferences
4. **Import sample data** - Use the seed script to populate test data

## Troubleshooting

### Common Issues

**Port already in use?**
```bash
# Find process using port 8000
lsof -i :8000
# Kill the process
kill -9 <PID>
```

**Database connection failed?**
- Check DATABASE_URL environment variable
- Ensure PostgreSQL is running (if using PostgreSQL)
- Verify database credentials

**Frontend not loading?**
- Clear browser cache and cookies
- Check browser console for JavaScript errors
- Verify backend API is accessible

**Docker containers not starting?**
```bash
# Check container logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up --build
```

### Getting Help

- 📖 Check the [full setup guide](../technical-setup/local-development.md)
- 💬 Join our [Discord community](https://discord.gg/lawflow)
- 🐛 Report issues on [GitHub](https://github.com/lawflow/lawflow/issues)

## What's Next?

🎉 **Congratulations!** LawFlow is now running locally.

**Recommended next steps:**
1. [Create your first matter](../core-workflows/matters.md)
2. [Explore the task management system](../core-workflows/tasks.md)
3. [Manage your documents](../core-workflows/documents.md)
4. [Set up development environment](../technical-setup/local-development.md)
