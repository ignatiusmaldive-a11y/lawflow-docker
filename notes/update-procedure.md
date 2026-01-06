# LawFlow Update Procedure

## For Maintaining the Optimized Production Setup

This document outlines the proper procedure for updating the LawFlow application while maintaining the optimized production setup we've established.

## Current Optimized Setup

```
┌───────────────────────────────────────────────────────┐
│                    Client Browser                     │
└───────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌───────────────────────────────────────────────────────┐
│                        Nginx (Port 80)                 │
│  ┌─────────────────────────────┐  ┌─────────────────┐  │
│  │  / → Frontend              │  │  /api/ → Backend │  │
│  └─────────────────────────────┘  └─────────────────┘  │
└───────────────────────────────────────────────────────┘
                                    │                      │
                                    ▼                      ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ Python HTTP Server (Port 8080)│  │ FastAPI Backend (Port 8000) │
│  - Serves production build   │  │  - SQLite database         │
│  - Static files             │  │  - API endpoints            │
└─────────────────────────────┘  └─────────────────────────────┘
```

## Standard Update Procedure

### 1. Prepare for Update

```bash
# Navigate to project directory
cd /home/admin-non-root/apps/lawflow-docker

# Check current git status
git status

# Stash any local changes (if needed)
git stash
```

### 2. Pull Latest Code

```bash
# Pull the latest changes from GitHub
git pull origin main

# Check what changed
git log --oneline -5
git diff HEAD~1 HEAD
```

### 3. Update Backend

```bash
# Navigate to backend directory
cd lawflow_backend

# Update Python dependencies (if pyproject.toml changed)
source .venv/bin/activate
pip install -e .

# Check for database migrations (if alembic files changed)
# If there are new migrations, run:
alembic upgrade head

# Restart backend service
pkill -f "uvicorn app.main:app"
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &

# Verify backend is running
curl -s http://localhost:8000/api/projects | jq '.[] | {id, title}' | head -3
```

### 4. Update Frontend

```bash
# Navigate to frontend directory
cd ../lawflow_frontend

# Update Node.js dependencies
npm install

# Build production assets
npm run build

# Restart frontend server
pkill -f "python3 -m http.server"
nohup python3 -m http.server 8080 > /dev/null 2>&1 &

# Verify frontend is serving correctly
curl -s http://localhost:8080 | grep -o '<title>.*</title>'
```

### 5. Verify Full Application

```bash
# Test frontend through Nginx
curl -s http://localhost/ | grep -o '<title>.*</title>'

# Test API through Nginx
curl -s http://localhost/api/projects | jq '.[] | {id, title}' | head -3

# Test specific functionality
curl -s http://localhost/api/tasks?project_id=1 | jq '.[] | {id, title, status}' | head -3
```

## Database Management

### SQLite Database Location

```
Database file: lawflow_backend/lawflow.db
Size: ~94 MB (check with: du -h lawflow_backend/lawflow.db)
Backup: cp lawflow_backend/lawflow.db lawflow_backend/lawflow-backup-$(date +%Y-%m-%d).db
```

### Database Backup Procedure

```bash
# Create backup with timestamp
cd lawflow_backend
cp lawflow.db lawflow-backup-$(date +%Y-%m-%d-%H%M%S).db

# Verify backup
du -h lawflow-backup-*.db

# Clean up old backups (keep last 5)
ls -t lawflow-backup-*.db | tail -n +6 | xargs rm -f
```

### Database Migration (If Schema Changes)

```bash
# If the update includes database schema changes:

# 1. Backup current database
cp lawflow.db lawflow-pre-migration-$(date +%Y-%m-%d).db

# 2. Check alembic migrations
cd lawflow_backend
alembic history

# 3. Run migrations
alembic upgrade head

# 4. Verify data integrity
# Check project count
sqlite3 lawflow.db "SELECT COUNT(*) FROM projects;"

# Check task count
sqlite3 lawflow.db "SELECT COUNT(*) FROM tasks;"

# 5. If issues occur, restore from backup
cp lawflow-pre-migration-$(date +%Y-%m-%d).db lawflow.db
```

## Handling Specific Update Scenarios

### Scenario 1: Frontend-Only Changes

```bash
# If only frontend files changed (no backend or database changes)
cd lawflow_frontend
npm install
npm run build
pkill -f "python3 -m http.server"
nohup python3 -m http.server 8080 > /dev/null 2>&1 &
```

### Scenario 2: Backend-Only Changes

```bash
# If only backend files changed
cd lawflow_backend
source .venv/bin/activate
pip install -e .
pkill -f "uvicorn app.main:app"
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
```

### Scenario 3: Database Schema Changes

```bash
# If database schema changed (check for new alembic migrations)
cd lawflow_backend

# Backup database
cp lawflow.db lawflow-backup-$(date +%Y-%m-%d).db

# Run migrations
alembic upgrade head

# Verify data
sqlite3 lawflow.db "SELECT COUNT(*) FROM projects;"

# Restart backend
pkill -f "uvicorn app.main:app"
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
```

### Scenario 4: Major Version Update

```bash
# For major updates with breaking changes

# 1. Backup everything
cd /home/admin-non-root/apps/lawflow-docker
cp -r lawflow_backend lawflow_backend-backup-$(date +%Y-%m-%d)
cp -r lawflow_frontend lawflow_frontend-backup-$(date +%Y-%m-%d)

# 2. Pull update
git pull origin main

# 3. Update backend
cd lawflow_backend
source .venv/bin/activate
pip install -e .

# 4. Handle database migration
alembic upgrade head

# 5. Update frontend
cd ../lawflow_frontend
npm install
npm run build

# 6. Restart services
pkill -f "uvicorn app.main:app"
pkill -f "python3 -m http.server"

nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
nohup python3 -m http.server 8080 > /dev/null 2>&1 &

# 7. Verify thoroughly
curl -s http://localhost/api/projects | jq '.[] | {id, title}' | head -3
curl -s http://localhost/ | grep -o '<title>.*</title>'
```

## Troubleshooting Common Update Issues

### Issue 1: Frontend Build Fails

```bash
# If npm run build fails

# 1. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Try building again
npm run build

# 3. If still failing, check specific errors and fix
# Common issues:
# - TypeScript errors (fix in source files)
# - Missing dependencies (add to package.json)
# - Version conflicts (check package versions)
```

### Issue 2: Backend Won't Start

```bash
# If uvicorn fails to start

# 1. Check backend logs
tail -f lawflow_backend/backend.log

# 2. Try running manually to see errors
cd lawflow_backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Common issues:
# - Missing dependencies (pip install -e .)
# - Database connection issues (check DATABASE_URL)
# - Port conflicts (check with: ss -tuln | grep 8000)
```

### Issue 3: Database Migration Fails

```bash
# If alembic upgrade fails

# 1. Restore from backup
cp lawflow-backup-*.db lawflow.db

# 2. Check migration files
alembic history

# 3. Try running migrations step by step
alembic upgrade +1
alembic current

# 4. If specific migration fails, edit the migration file
# or create a new migration to fix the issue
```

### Issue 4: Application Not Working After Update

```bash
# Systematic troubleshooting

# 1. Check all services are running
ps aux | grep -E "(nginx|python|uvicorn)" | grep -v grep

# 2. Check ports
ss -tuln | grep -E "(80|8000|8080)"

# 3. Test each component individually
curl -s http://localhost:8080  # Frontend
curl -s http://localhost:8000/api/projects  # Backend

# 4. Check Nginx configuration
nginx -t

# 5. Check logs
tail -f lawflow_backend/backend.log

# 6. Rollback if needed
# Restore from backup and restart
```

## Rollback Procedure

```bash
# If update causes critical issues, rollback

# 1. Stop all services
pkill -f "uvicorn app.main:app"
pkill -f "python3 -m http.server"

# 2. Restore from git
git reset --hard HEAD~1

# 3. Restore database (if needed)
cd lawflow_backend
cp lawflow-backup-*.db lawflow.db

# 4. Rebuild frontend
cd ../lawflow_frontend
npm install
npm run build

# 5. Restart services
cd ../lawflow_backend
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &

cd ../lawflow_frontend/dist
nohup python3 -m http.server 8080 > /dev/null 2>&1 &

# 6. Verify rollback
curl -s http://localhost/ | grep -o '<title>.*</title>'
```

## Maintenance Checklist

### Weekly Maintenance

```bash
# 1. Check application logs
cd /home/admin-non-root/apps/lawflow-docker
tail -100 lawflow_backend/backend.log

# 2. Check disk space
df -h

# 3. Check memory usage
free -h

# 4. Test critical functionality
curl -s http://localhost/api/projects | jq '.[] | {id, title}' | head -3

# 5. Backup database
cd lawflow_backend
cp lawflow.db lawflow-backup-$(date +%Y-%m-%d).db

# 6. Clean up old backups
ls -t lawflow-backup-*.db | tail -n +6 | xargs rm -f
```

### Monthly Maintenance

```bash
# 1. Update system packages
sudo apt update
sudo apt upgrade -y

# 2. Update Node.js packages
cd lawflow_frontend
npm outdated
npm update

# 3. Update Python packages
cd ../lawflow_backend
source .venv/bin/activate
pip list --outdated
pip install -U $(pip list --outdated | awk 'NR>2 {print $1}')

# 4. Rebuild frontend
npm run build

# 5. Restart services
pkill -f "python3 -m http.server"
nohup python3 -m http.server 8080 > /dev/null 2>&1 &

# 6. Test thoroughly
curl -s http://localhost/ | grep -o '<title>.*</title>'
curl -s http://localhost/api/projects | jq '.[] | {id, title}' | head -3
```

## Performance Monitoring

### Check Application Performance

```bash
# Check response times
time curl -s http://localhost/api/projects > /dev/null

# Check memory usage
ps aux | grep uvicorn | grep -v grep | awk '{print $4, $11}'
ps aux | grep "python3 -m http.server" | grep -v grep | awk '{print $4, $11}'

# Check CPU usage
top -b -n 1 | grep -E "(uvicorn|python3)"
```

### Optimize Performance

```bash
# If performance is slow:

# 1. Check for memory leaks
# Monitor memory usage over time

# 2. Optimize database
cd lawflow_backend
sqlite3 lawflow.db "VACUUM;"
sqlite3 lawflow.db "ANALYZE;"

# 3. Consider adding caching
# Can add Redis or similar for session caching

# 4. Review Nginx configuration
# Consider adding caching headers, gzip compression, etc.
```

## Important Notes

### Database Considerations

1. **SQLite Limitations**:
   - SQLite works well for small to medium workloads
   - For high traffic, consider migrating to PostgreSQL
   - SQLite has connection limits (not ideal for many concurrent users)

2. **Backup Strategy**:
   - Always backup before updates
   - Keep multiple backup versions
   - Test backups periodically

3. **Performance Tips**:
   - Run `VACUUM` periodically to optimize SQLite database
   - Monitor database size growth
   - Consider database indexing for large datasets

### Frontend Considerations

1. **Production Build**:
   - Always use `npm run build` for production
   - Never run `npm run dev` on production server
   - Production build is optimized and minified

2. **Caching**:
   - Production assets should be cached aggressively
   - Consider adding CDN for static assets if global audience

3. **Updates**:
   - Test frontend changes locally before deploying
   - Check browser console for errors after updates
   - Verify all views work correctly

### Backend Considerations

1. **Restart Strategy**:
   - Uvicorn should be restarted after code changes
   - Consider using systemd for automatic restarts
   - Monitor backend logs regularly

2. **Error Handling**:
   - Ensure proper error logging
   - Set up monitoring for 500 errors
   - Consider adding health check endpoints

3. **Security**:
   - Keep dependencies updated
   - Monitor for security vulnerabilities
   - Consider adding rate limiting

## Conclusion

This update procedure ensures that the LawFlow application can be safely updated while maintaining the optimized production setup. The key principles are:

1. **Backup first**: Always backup database before updates
2. **Test changes**: Verify each component after updating
3. **Incremental updates**: Update frontend and backend separately when possible
4. **Monitor**: Check logs and performance after updates
5. **Rollback plan**: Know how to revert if issues occur

By following this procedure, updates should be smooth and minimize downtime while maintaining the performance and security benefits of the production setup.
