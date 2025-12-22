# LawFlow Deployment Guide

This document outlines the Docker-based deployment setup for the LawFlow application (Frontend + Backend + Database) and provides instructions for deploying it to a VPS.

## Architecture Overview

The application is containerized using Docker and orchestrated with Docker Compose. It consists of four main services:

1.  **Nginx (Reverse Proxy)**:
    *   Listens on port `80`.
    *   Serves the Frontend at the root path `/`.
    *   Proxies API requests from `/api/*` to the Backend.
2.  **Frontend**:
    *   A React/Vite application served by an internal Nginx instance.
    *   Built using a multi-stage Dockerfile.
3.  **Backend**:
    *   A FastAPI (Python) application.
    *   Connects to the PostgreSQL database.
    *   Stores uploaded files in a persistent Docker volume.
4.  **Database**:
    *   PostgreSQL 15.
    *   Data is persisted in a Docker volume.

## Project Structure Changes

*   **`docker-compose.yml`**: Orchestrates the services, networks, and volumes.
*   **`nginx/default.conf`**: Configuration for the main Nginx reverse proxy.
*   **`lawflow_backend/Dockerfile`**: Python environment setup.
*   **`lawflow_frontend/Dockerfile`**: Node.js build and Nginx static serve setup.

## Prerequisites

*   A VPS running Linux (e.g., Ubuntu, Debian).
*   **Docker Engine** and **Docker Compose** installed on the VPS.

## Deployment Instructions

### 1. Transfer Code to VPS

You can transfer the project files to your VPS using `scp` or by cloning your Git repository.

**Option A: Using Git (Recommended)**
```bash
# On your VPS
git clone <your-repo-url> lawflow
cd lawflow
```

**Option B: Using SCP**
```bash
# From your local machine
scp -r /path/to/project user@your-vps-ip:/home/user/lawflow
```

### 2. Configure Environment (Optional)

The `docker-compose.yml` file comes with default environment variables for the database and backend.
*   **Database Credentials**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` in `docker-compose.yml`.
*   **Backend Connection**: `DATABASE_URL` in the `backend` service is pre-configured to talk to the `db` service.

If you wish to change passwords, edit `docker-compose.yml` before running.

### 3. Build and Start Services

Navigate to the project directory on your VPS and run:

```bash
docker compose up -d --build
```

*   `up`: Creates and starts containers.
*   `-d`: Runs in detached mode (in the background).
*   `--build`: Forces a rebuild of the images to ensure the latest code is used.

### 4. Verify Deployment

Open your web browser and navigate to:

```
http://<your-vps-ip>
```

*   You should see the LawFlow frontend.
*   The application should automatically connect to the backend APIs.

### 5. Management & Maintenance

**View Logs:**
To see logs from all services:
```bash
docker compose logs -f
```
To see logs from a specific service (e.g., backend):
```bash
docker compose logs -f backend
```

**Stop Services:**
```bash
docker compose down
```

**Update Application:**
1.  Pull the latest code (`git pull`).
2.  Rebuild and restart:
    ```bash
    docker compose up -d --build
    ```

**Data Persistence:**
*   Database data is stored in the `postgres_data` volume.
*   Uploaded files are stored in the `uploads_data` volume.
*   These volumes persist even if containers are destroyed. To remove them (and lose all data), use `docker compose down -v`.

## Troubleshooting

*   **Port Conflicts**: Ensure port `80` is not used by another service on your VPS.
*   **Database Connection**: If the backend fails to connect to the DB, check the `docker compose logs backend` output. The `depends_on` condition in `docker-compose.yml` waits for the DB to be healthy, but startup issues can still occur.
*   **Permissions**: If you encounter permission errors with uploads, ensure the Docker user has write access to the volume mount point (handled automatically by standard Docker volume behavior usually).
