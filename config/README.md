# Configuration Files

This directory contains configuration examples and documentation for LawFlow deployment.

## Directory Structure

```
config/
├── database/              # Database configuration examples
│   ├── sqlite.example.env  # SQLite configuration
│   ├── postgres.example.env # PostgreSQL configuration
│   └── README.md           # Database setup instructions
└── README.md              # Configuration overview
```

## Usage

1. **Database Configuration**: Choose between SQLite (development) or PostgreSQL (production)
2. **Environment Variables**: Configure application settings through environment variables
3. **Systemd Services**: Update service files with appropriate database URLs

## Production Recommendations

1. **Use PostgreSQL** for better performance and reliability
2. **Configure proper environment variables** for security
3. **Set up monitoring** for database connections and performance
4. **Implement regular backups** for your database

## See Also

- `production/` directory for systemd service files and Nginx configuration
- `deployment-script.sh` for automated deployment and management
- Main README.md for overall application documentation
