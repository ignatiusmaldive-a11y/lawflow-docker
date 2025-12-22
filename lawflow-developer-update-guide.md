# LawFlow Developer Update Guide

This guide is for developers who will be updating the GitHub repository and need to understand what changes were made to get the application running on the VPS.

## 📋 Summary of Changes

### ✅ Changes Made to Get the Application Running

#### 1. **Backend Code Fixes**

**File**: `lawflow_backend/app/main.py`

**Issue**: The `ensure_bg_color_column()` function was trying to alter a table that didn't exist yet during startup.

**Fix Applied**:
```python
# BEFORE (line 26):
conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN bg_color VARCHAR(20) DEFAULT '#0b1220'")

# AFTER (lines 26-30):
try:
    with engine.connect() as conn:
        cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(projects);")]
        if "bg_color" not in cols:
            conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN bg_color VARCHAR(20) DEFAULT '#0b1220'")
except Exception:
    # Table doesn't exist yet, which is fine - it will be created by create_all
    pass
```

**Additional Fix**: Reordered the startup sequence to call `Base.metadata.create_all(bind=engine)` before `ensure_bg_color_column()`.

#### 2. **Backend Dependencies**

**File**: `lawflow_backend/pyproject.toml`

**Change**: Added `psycopg2-binary>=2.9` to the dependencies list for PostgreSQL support.

```python
# ADDED to dependencies list:
"psycopg2-binary>=2.9",
```

#### 3. **Docker Configuration**

**File**: `docker-compose.yml`

**Change**: Modified the backend build context to work correctly:

```yaml
# CHANGED FROM:
backend:
  build:
    context: .
    dockerfile: lawflow_backend/Dockerfile

# TO (for Docker production build):
backend:
  build:
    context: ./lawflow_backend
    dockerfile: Dockerfile
```

**Note**: The Docker build was not ultimately used due to timeout issues, but this fix would be needed for Docker deployment.

## 🚀 Deployment Flow Improvements

### Current Deployment Process

1. **Clone repository** to `/home/admin-non-root/apps/lawflow-docker/`
2. **Install dependencies** using `./run.sh setup`
3. **Start services manually** or via systemd
4. **Configure Nginx** as reverse proxy
5. **Set up systemd services** for automatic startup

### Recommended Improvements for Future Deployments

#### 1. **Fix Docker Build Issues**

**Problem**: Docker build times out on the VPS due to resource constraints.

**Recommended Solutions**:
- **Option A**: Optimize Dockerfiles for faster builds
- **Option B**: Use pre-built images or multi-stage builds
- **Option C**: Build images on a more powerful machine and push to registry

**Specific Dockerfile Improvements Needed**:

In `lawflow_backend/Dockerfile`:
```dockerfile
# Current issue: The build context and COPY commands need alignment
# Recommendation: Use the fixed build context approach

FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy entire backend directory
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -e .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. **Create Production-Ready Configuration**

**Recommendation**: Add production configuration files to the repository:

```
lawflow-deployment/
├── production/
│   ├── nginx.conf              # Production Nginx config
│   ├── lawflow-backend.service # Systemd service file
│   ├── lawflow-frontend.service # Systemd service file
│   └── deployment-script.sh    # Automated deployment script
└── README.md                   # Deployment instructions
```

#### 3. **Add Deployment Script**

**File**: `deployment-script.sh`

```bash
#!/usr/bin/env bash
set -euo pipefail

# LawFlow Deployment Script
# Usage: ./deployment-script.sh [setup|start|stop|restart|update]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/lawflow_backend"
FRONTEND_DIR="$ROOT_DIR/lawflow_frontend"

print_help() {
  echo "Usage: $0 [setup|start|stop|restart|update|help]"
  echo ""
  echo "setup     - Install dependencies and configure services"
  echo "start     - Start all services"
  echo "stop      - Stop all services"
  echo "restart   - Restart all services"
  echo "update    - Update code and restart services"
  echo "help      - Show this help message"
}

setup() {
  echo "📦 Setting up LawFlow application..."
  
  # Install system dependencies
  echo "🔧 Installing system dependencies..."
  sudo apt update
  sudo apt install -y nginx
  
  # Setup backend
  echo "🐍 Setting up backend..."
  cd "$BACKEND_DIR"
  if [ ! -d ".venv" ]; then
    python3 -m venv .venv
  fi
  . .venv/bin/activate
  pip install -e .
  
  # Setup frontend
  echo "📦 Setting up frontend..."
  cd "$FRONTEND_DIR"
  npm install
  
  # Configure systemd services
  echo "🔧 Setting up systemd services..."
  sudo cp "$ROOT_DIR/production/lawflow-backend.service" /etc/systemd/system/
  sudo cp "$ROOT_DIR/production/lawflow-frontend.service" /etc/systemd/system/
  sudo cp "$ROOT_DIR/production/nginx.conf" /etc/nginx/conf.d/lawflow.conf
  
  sudo systemctl enable lawflow-backend.service
  sudo systemctl enable lawflow-frontend.service
  
  # Configure firewall
  echo "🔥 Configuring firewall..."
  sudo ufw allow 80/tcp
  
  echo "✅ Setup complete!"
}

start() {
  echo "🚀 Starting services..."
  sudo systemctl start lawflow-backend.service
  sudo systemctl start lawflow-frontend.service
  sudo systemctl restart nginx.service
  echo "✅ Services started!"
}

stop() {
  echo "🛑 Stopping services..."
  sudo systemctl stop lawflow-backend.service
  sudo systemctl stop lawflow-frontend.service
  echo "✅ Services stopped!"
}

restart() {
  echo "🔄 Restarting services..."
  sudo systemctl restart lawflow-backend.service
  sudo systemctl restart lawflow-frontend.service
  sudo systemctl restart nginx.service
  echo "✅ Services restarted!"
}

update() {
  echo "🔄 Updating LawFlow application..."
  
  # Pull latest code
  cd "$ROOT_DIR"
  git pull origin master
  
  # Update backend dependencies
  cd "$BACKEND_DIR"
  . .venv/bin/activate
  pip install -e .
  
  # Update frontend dependencies
  cd "$FRONTEND_DIR"
  npm install
  
  # Restart services
  restart
  
  echo "✅ Update complete!"
}

main() {
  ACTION="${1:-help}"
  
  case "$ACTION" in
    setup) setup ;;
    start) start ;;
    stop) stop ;;
    restart) restart ;;
    update) update ;;
    help|--help|-h) print_help ;;
    *) 
      echo "Unknown action: $ACTION"
      print_help
      exit 1
      ;;
  esac
}

main "$@"
```

#### 4. **Document Database Configuration**

**Recommendation**: Clarify database configuration in the repository.

Add a `config` directory with database configuration examples:

```
config/
├── database/
│   ├── sqlite.example.env      # SQLite configuration
│   ├── postgres.example.env     # PostgreSQL configuration
│   └── README.md                # Database setup instructions
└── README.md
```

**Content for `config/database/README.md`**:

```markdown
# Database Configuration

LawFlow supports multiple database backends.

## SQLite (Default - Development)

No configuration needed. The application will automatically create a SQLite database file.

```bash
DATABASE_URL="sqlite:///./lawflow.db"
```

## PostgreSQL (Recommended - Production)

For production deployments, we recommend PostgreSQL.

### Configuration

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Setup Instructions

1. Install PostgreSQL:
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

2. Create database and user:
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE lawflow;"
   sudo -u postgres psql -c "CREATE USER lawflow WITH PASSWORD 'your_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lawflow TO lawflow;"
   ```

3. Update your environment:
   ```bash
   export DATABASE_URL="postgresql://lawflow:your_password@localhost:5432/lawflow"
   ```

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: Database connection string
- `ALLOWED_ORIGINS`: CORS allowed origins (default: "*")
- `API_BASE`: Frontend API base URL (default: "/api")
```

#### 5. **Add Health Check Endpoints**

**Recommendation**: The backend already has a health check endpoint, but consider adding more comprehensive health checks.

**Current**: `GET /health` returns `{"ok": true}`

**Enhanced Recommendation**:

```python
@app.get("/health")
def health():
    return {
        "ok": True,
        "timestamp": datetime.now().isoformat(),
        "version": "0.1.0",
        "database": "ok"  # Could add database connection check
    }

@app.get("/health/detailed")
def detailed_health():
    # Check database connection
    db_status = "ok"
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "ok": db_status == "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "0.1.0",
        "components": {
            "database": db_status,
            "api": "ok"
        }
    }
```

## 📝 Changes Summary for Repository

### Files That Need to Be Updated in GitHub

1. **`lawflow_backend/app/main.py`**
   - ✅ **REQUIRED**: Fix the `ensure_bg_color_column()` function with error handling
   - ✅ **REQUIRED**: Reorder startup sequence

2. **`lawflow_backend/pyproject.toml`**
   - ✅ **REQUIRED**: Add `psycopg2-binary>=2.9` to dependencies

3. **`docker-compose.yml`**
   - ⚠️ **OPTIONAL**: Fix build context (only needed if using Docker)

### Files That Should Be Added to Repository

1. **`deployment-script.sh`** - Automated deployment script
2. **`production/`** directory with:
   - Systemd service files
   - Nginx configuration
   - Deployment documentation
3. **`config/`** directory with:
   - Database configuration examples
   - Environment variable documentation

## 🔄 Recommended Workflow for Future Updates

### For Developers

1. **Make code changes** in your local environment
2. **Test thoroughly** with both SQLite and PostgreSQL
3. **Update documentation** if any configuration changes are needed
4. **Push changes** to GitHub
5. **Update deployment guide** if new dependencies or setup steps are required

### For Deployment

1. **Pull latest changes**: `git pull origin master`
2. **Update dependencies**:
   ```bash
   cd lawflow_backend && . .venv/bin/activate && pip install -e .
   cd ../lawflow_frontend && npm install
   ```
3. **Restart services**:
   ```bash
   sudo systemctl restart lawflow-backend.service
   sudo systemctl restart lawflow-frontend.service
   ```
4. **Verify deployment**:
   ```bash
   curl http://localhost/api/health
   ```

## 🛠️ Testing Recommendations

### Pre-Deployment Testing

1. **Test with SQLite** (current setup)
2. **Test with PostgreSQL** (recommended for production)
3. **Test API endpoints** thoroughly
4. **Test frontend functionality**
5. **Test error handling** and edge cases

### Test Cases to Verify

```bash
# Test backend health
curl http://localhost:8000/health

# Test API endpoints
curl http://localhost:8000/api/projects
curl http://localhost:8000/api/tasks?project_id=1

# Test frontend
curl http://localhost:8080/

# Test through Nginx
curl http://localhost/api/health
curl http://localhost/api/projects
```

## 🎯 Key Takeaways for Developers

### ✅ What Worked Well

1. **Vite frontend configuration** - Already had proper API proxy setup
2. **FastAPI backend** - Well-structured and easy to configure
3. **Systemd integration** - Services work well for automatic management
4. **Nginx reverse proxy** - Effective for port 80 access

### ⚠️ Areas Needing Attention

1. **Docker build issues** - Needs optimization for VPS deployment
2. **Database migration** - Consider adding proper migration scripts
3. **Production build** - Frontend should be built for production
4. **Error handling** - Could be enhanced in some areas

### 🚀 Recommendations for Future Development

1. **Add proper database migrations** using Alembic
2. **Create production build scripts** for frontend
3. **Optimize Docker setup** for easier deployment
4. **Add comprehensive testing** (unit, integration tests)
5. **Implement CI/CD pipeline** for automated testing and deployment

## 📚 Reference Documentation

- **Original Deployment Guide**: https://github.com/ignatiusmaldive-a11y/lawflow-docker/blob/master/deployment-details-and-instructions.md
- **Application Architecture**: https://github.com/ignatiusmaldive-a11y/lawflow-docker/blob/master/APP_ARCHITECTURE.md
- **Current Deployment Guide**: `/home/admin-non-root/notes/lawflow-deployment-guide.md`

---

**Last Updated**: December 22, 2025
**Prepared For**: LawFlow Development Team
**Purpose**: Ease future deployment and updates
**Status**: ✅ Complete