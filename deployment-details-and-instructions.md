# LawFlow Deployment Guide

This document outlines the production deployment setup for the LawFlow application using systemd services and Nginx reverse proxy.

## Architecture Overview

The application runs as native system services on Linux (tested on Ubuntu). It consists of three main components:

1. **Nginx (Reverse Proxy)**:
   * Listens on port `80`
   * Serves the Frontend at the root path `/`
   * Proxies API requests from `/api/*` to the Backend

2. **Frontend**:
   * React/Vite application served by Node.js preview server
   * Runs on port `8080`
   * Built for production with `npm run build`

3. **Backend**:
   * FastAPI (Python) application
   * Runs on port `8000`
   * Uses SQLite database (configurable to PostgreSQL)
   * Stores uploaded files in `lawflow_backend/uploads/`

## Prerequisites

* Linux VPS (Ubuntu/Debian recommended)
* Python 3.11+
* Node.js 18+
* Nginx
* Git

## Quick Deployment Script

LawFlow includes an automated deployment script that handles the entire setup process.

### 1. Transfer Code to VPS

```bash
# Clone the repository
git clone <your-repo-url> lawflow
cd lawflow
```

### 2. Run Initial Setup

```bash
# Make script executable and run setup
chmod +x deployment-script.sh
./deployment-script.sh setup
```

This will:
- Install system dependencies (nginx)
- Set up Python virtual environment and install backend dependencies
- Install frontend dependencies and build the application
- Configure systemd services
- Set up Nginx reverse proxy

### 3. Start Services

```bash
./deployment-script.sh start
```

### 4. Verify Deployment

Open your browser and navigate to `http://your-vps-ip`

## Manual Deployment (Alternative)

If you prefer manual setup:

### Backend Setup

```bash
cd lawflow_backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .

# Configure database (optional - defaults to SQLite)
export DATABASE_URL="sqlite:///./lawflow.db"
# OR for PostgreSQL:
# export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

### Frontend Setup

```bash
cd lawflow_frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### Systemd Services

Copy the service files and enable them:

```bash
sudo cp production/lawflow-backend.service /etc/systemd/system/
sudo cp production/lawflow-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable lawflow-backend.service
sudo systemctl enable lawflow-frontend.service
```

### Nginx Configuration

```bash
sudo cp production/nginx.conf /etc/nginx/conf.d/lawflow.conf
sudo systemctl restart nginx
```

## Database Configuration

### SQLite (Default - Recommended for Small Deployments)

No additional setup required. The database file `lawflow_backend/lawflow.db` will be created automatically.

### PostgreSQL (For Production Scale)

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE lawflow;
CREATE USER lawflow WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE lawflow TO lawflow;
\q

# Update backend service environment
# Edit /etc/systemd/system/lawflow-backend.service
Environment="DATABASE_URL=postgresql://lawflow:your_password@localhost:5432/lawflow"

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart lawflow-backend
```

## Service Management

### Using the Deployment Script

```bash
# Start all services
./deployment-script.sh start

# Stop all services
./deployment-script.sh stop

# Restart all services
./deployment-script.sh restart

# Update application
./deployment-script.sh update
```

### Manual Service Control

```bash
# Backend
sudo systemctl start lawflow-backend
sudo systemctl stop lawflow-backend
sudo systemctl restart lawflow-backend

# Frontend
sudo systemctl start lawflow-frontend
sudo systemctl stop lawflow-frontend
sudo systemctl restart lawflow-frontend

# Nginx
sudo systemctl restart nginx
```

### Viewing Logs

```bash
# Backend logs
sudo journalctl -u lawflow-backend -f

# Frontend logs
sudo journalctl -u lawflow-frontend -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## File Uploads and Data Persistence

* **Database**: SQLite file stored at `lawflow_backend/lawflow.db`
* **Uploads**: Files stored in `lawflow_backend/uploads/`
* **Configuration**: Service configurations in `/etc/systemd/system/`
* **Nginx Config**: Reverse proxy config in `/etc/nginx/conf.d/lawflow.conf`

## Environment Variables

Configure these in the systemd service files:

### Backend Service (`/etc/systemd/system/lawflow-backend.service`)

```ini
Environment="DATABASE_URL=sqlite:///./lawflow.db"
Environment="ALLOWED_ORIGINS=*"
Environment="GOOGLE_API_KEY=your_gemini_api_key_here"
```

> [!IMPORTANT]
> A valid `GOOGLE_API_KEY` is required for the AI Assistant component (Chat) to function. You can obtain one from the [Google AI Studio](https://aistudio.google.com/).
```

### Frontend Service

No environment variables required for basic setup.

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs
sudo journalctl -u lawflow-backend -f

# Common issues:
# - Missing dependencies: Run pip install -e . in backend directory
# - Database connection: Check DATABASE_URL
# - Port conflict: Ensure port 8000 is free
```

**Frontend won't start:**
```bash
# Check logs
sudo journalctl -u lawflow-frontend -f

# Common issues:
# - Build failed: Run npm run build in frontend directory
# - Port conflict: Ensure port 8080 is free
```

**Nginx errors:**
```bash
# Check config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/error.log

# Common issues:
# - Upstream connection failed: Check if backend/frontend services are running
# - Permission denied: Check file permissions
```

**Application not accessible:**
- Check firewall: `sudo ufw status`
- Check services: `sudo systemctl status lawflow-backend lawflow-frontend nginx`
- Check ports: `sudo netstat -tlnp | grep :80`

### Database Issues

**SQLite corruption:**
```bash
# Stop backend service
sudo systemctl stop lawflow-backend

# Remove corrupted database (WARNING: loses all data)
rm lawflow_backend/lawflow.db

# Restart (will recreate with seed data)
sudo systemctl start lawflow-backend
```

**PostgreSQL connection issues:**
- Verify DATABASE_URL format
- Check PostgreSQL service: `sudo systemctl status postgresql`
- Test connection: `psql -U lawflow -d lawflow -h localhost`

## Updates and Maintenance

### Automated Updates

```bash
./deployment-script.sh update
```

This will:
- Pull latest code from git
- Update backend dependencies
- Rebuild frontend
- Restart all services

### Manual Updates

```bash
# Pull changes
git pull origin main

# Update backend
cd lawflow_backend
source .venv/bin/activate
pip install -e .

# Update frontend
cd ../lawflow_frontend
npm install
npm run build

# Restart services
sudo systemctl restart lawflow-backend lawflow-frontend nginx
```

## Security Considerations

* **Firewall**: Configure ufw to only allow necessary ports
* **User Permissions**: Services run as root (consider creating dedicated user)
* **Environment Variables**: Store sensitive data securely
* **SSL/TLS**: Consider adding HTTPS with Let's Encrypt
* **Database**: Use strong passwords for PostgreSQL
* **File Permissions**: Restrict access to uploads directory