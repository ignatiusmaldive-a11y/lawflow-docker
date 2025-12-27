---
sidebar_position: 5
---

# Troubleshooting Guide

Common issues and solutions for LawFlow deployment and usage.

## Installation Issues

### Docker Compose Fails to Start

**Error:** `ERROR: Couldn't connect to Docker daemon`

**Solution:**
```bash
# Check Docker service status
sudo systemctl status docker

# Start Docker service
sudo systemctl start docker

# Add user to docker group (Linux)
sudo usermod -aG docker $USER
# Logout and login again for group changes to take effect
```

**Error:** `Port already in use`

**Solution:**
```bash
# Find process using the port
lsof -i :8000  # or :8080

# Kill the process
kill -9 <PID>

# Or change ports in docker-compose.yml
```

### npm Install Fails

**Error:** `npm ERR! code ENOTFOUND`

**Solution:**
```bash
# Check internet connection
ping registry.npmjs.org

# Clear npm cache
npm cache clean --force

# Use different registry
npm config set registry https://registry.npmjs.org/

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### Python Virtual Environment Issues

**Error:** `ModuleNotFoundError`

**Solution:**
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Runtime Issues

### Application Won't Load

**Symptoms:**
- Browser shows blank page
- Console shows network errors
- API calls fail

**Solutions:**

**Check service status:**
```bash
# Docker containers
docker-compose ps

# Restart services
docker-compose restart

# Check logs
docker-compose logs lawflow-frontend
docker-compose logs lawflow-backend
```

**Clear browser cache:**
- Hard refresh: `Ctrl+Shift+R` (Linux/Windows), `Cmd+Shift+R` (Mac)
- Clear all data for localhost

**Check network connectivity:**
```bash
# Test API endpoint
curl http://localhost:8000/health

# Test frontend
curl http://localhost:8080
```

### Database Connection Errors

**Error:** `Connection refused` or `Database does not exist`

**Solutions:**

**For SQLite:**
```bash
# Check file permissions
ls -la lawflow_backend/lawflow.db

# Recreate database
rm lawflow_backend/lawflow.db
alembic upgrade head
```

**For PostgreSQL:**
```bash
# Check PostgreSQL container
docker ps | grep postgres

# Check connection
psql -h localhost -U lawflow -d lawflow

# Reset database
docker-compose down
docker volume rm lawflow_postgres_data
docker-compose up -d postgres
```

### Authentication Problems

**Symptoms:**
- Can't log in
- Session expires immediately
- Password reset not working

**Solutions:**

**Reset admin user:**
```bash
# Access database directly
docker exec -it lawflow-postgres psql -U lawflow -d lawflow

# Reset password (PostgreSQL)
UPDATE users SET password_hash = '$2b$12$...' WHERE email = 'admin@lawflow.app';

# Or recreate user
DELETE FROM users WHERE email = 'admin@lawflow.app';
INSERT INTO users (email, password_hash, is_active) VALUES ('admin@lawflow.app', '$2b$12$...', true);
```

**Check environment variables:**
```bash
# Verify SECRET_KEY is set
echo $SECRET_KEY

# Check JWT settings
echo $ACCESS_TOKEN_EXPIRE_MINUTES
```

### File Upload Issues

**Error:** `File too large` or `Upload failed`

**Solutions:**

**Check upload limits:**
```bash
# Backend limits
grep MAX_UPLOAD_SIZE lawflow_backend/.env

# Nginx limits (if used)
grep client_max_body_size nginx/default.conf
```

**Increase limits:**
```bash
# In .env file
MAX_UPLOAD_SIZE=209715200  # 200MB

# In nginx config
client_max_body_size 200M;
```

**Check disk space:**
```bash
df -h
du -sh uploads/
```

## Performance Issues

### Slow Page Loads

**Symptoms:**
- Pages take long to load
- API calls are slow
- Database queries timeout

**Solutions:**

**Database optimization:**
```bash
# Check slow queries
# Enable query logging in PostgreSQL

# Add indexes
CREATE INDEX CONCURRENTLY idx_matters_status ON matters(status);
CREATE INDEX CONCURRENTLY idx_tasks_due_date ON tasks(due_date);
```

**Cache configuration:**
```bash
# Enable Redis (if available)
export REDIS_URL="redis://localhost:6379"

# Static file caching
# Configure nginx caching headers
```

**Resource monitoring:**
```bash
# Check memory usage
docker stats

# Monitor database connections
# Use pg_stat_activity in PostgreSQL
```

### High Memory Usage

**Solutions:**

**Optimize Docker resources:**
```yaml
# In docker-compose.yml
services:
  lawflow-backend:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

**Database connection pooling:**
```python
# In database configuration
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 10,
    "max_overflow": 20,
}
```

## Networking Issues

### External Access Problems

**Error:** `Connection refused from external IP`

**Solutions:**

**Firewall configuration:**
```bash
# Check firewall status
sudo ufw status

# Allow ports
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8080
```

**Docker networking:**
```bash
# Check Docker networks
docker network ls

# Restart with proper networking
docker-compose down
docker-compose up -d
```

### SSL/HTTPS Issues

**Solutions:**

**SSL certificate setup:**
```bash
# Using Let's Encrypt
certbot --nginx -d yourdomain.com

# Manual certificate
# Place certificates in nginx/ssl/
```

**Redirect HTTP to HTTPS:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Backup and Recovery

### Database Backup

**SQLite:**
```bash
# Stop application
docker-compose stop

# Copy database file
cp lawflow_backend/lawflow.db lawflow_backend/lawflow.db.backup

# Restart application
docker-compose start
```

**PostgreSQL:**
```bash
# Create backup
docker exec lawflow-postgres pg_dump -U lawflow lawflow > backup.sql

# Restore backup
docker exec -i lawflow-postgres psql -U lawflow lawflow < backup.sql
```

### File Recovery

**Recover uploaded files:**
```bash
# Check backup directory
ls -la backups/uploads/

# Restore from backup
cp -r backups/uploads/ uploads/
```

## Monitoring and Logs

### Application Logs

**View logs:**
```bash
# Docker logs
docker-compose logs -f lawflow-backend
docker-compose logs -f lawflow-frontend

# System logs
sudo journalctl -u lawflow-backend
sudo journalctl -u lawflow-frontend
```

### Database Logs

**PostgreSQL logs:**
```bash
# Docker logs
docker logs lawflow-postgres

# Inside container
docker exec lawflow-postgres tail -f /var/log/postgresql/postgresql-13-main.log
```

### Performance Monitoring

**Basic monitoring:**
```bash
# System resources
top
htop
iotop

# Network monitoring
nload
iftop

# Database monitoring
pg_top
```

## Emergency Procedures

### Complete System Reset

**Last resort - destroys all data:**
```bash
# Stop everything
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Rebuild from scratch
docker-compose up --build -d
```

### Data Recovery from Backups

```bash
# Restore database
docker exec -i lawflow-postgres psql -U lawflow lawflow < latest_backup.sql

# Restore files
tar -xzf uploads_backup.tar.gz -C uploads/
```

## Getting Help

### Community Support

- **Discord:** Real-time help from community
- **GitHub Issues:** Bug reports and feature requests
- **Documentation:** Check related guides

### Professional Support

- **Email:** support@lawflow.app
- **Priority Support:** For enterprise customers
- **On-site Consulting:** For complex deployments

### Diagnostic Information

When reporting issues, include:

```bash
# System information
uname -a
docker --version
docker-compose --version

# Application versions
git log --oneline -5

# Environment variables (redacted)
env | grep -E "(DATABASE|SECRET|API)" | head -10

# Recent logs
docker-compose logs --tail=50
```

---

:::warning Data Loss Warning
Some troubleshooting steps may result in data loss. Always backup before attempting fixes.
:::

:::info Prevention
Regular backups and monitoring can prevent most issues. Set up automated backups weekly.
:::
