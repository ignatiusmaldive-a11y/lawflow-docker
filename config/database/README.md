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
