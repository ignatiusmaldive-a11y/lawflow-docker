# LawFlow Logging System Improvements

## Current Logging Status

### Backend Logging
- **Location**: `lawflow_backend/backend.log`
- **Current Setup**: Uvicorn default logging
- **Content**: Access logs, startup/shutdown events
- **Format**: Basic text format

### Frontend Logging  
- **Location**: `lawflow_frontend/frontend.log`
- **Current Setup**: Vite development server logging
- **Content**: Build information, HMR updates
- **Note**: This is mostly relevant for development

## Easy Logging Improvements

### 1. Enhanced Uvicorn Logging (Immediate Improvement)

**Current command:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Improved command:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-level info --access-log --log-config logging_config.json
```

**Create `logging_config.json`:**
```json
{
  "version": 1,
  "disable_existing_loggers": false,
  "formatters": {
    "default": {
      "()": "uvicorn.logging.DefaultFormatter",
      "fmt": "%(asctime)s - %(levelname)s - %(message)s",
      "use_colors": false
    },
    "access": {
      "()": "uvicorn.logging.AccessFormatter",
      "fmt": "%(asctime)s - %(client_addr)s - \"%(request_line)s\" %(status_code)s"
    }
  },
  "handlers": {
    "default": {
      "formatter": "default",
      "class": "logging.FileHandler",
      "filename": "backend.log"
    },
    "access": {
      "formatter": "access",
      "class": "logging.FileHandler",
      "filename": "access.log"
    }
  },
  "loggers": {
    "uvicorn": {"handlers": ["default"], "level": "info"},
    "uvicorn.error": {"level": "info"},
    "uvicorn.access": {"handlers": ["access"], "level": "info", "propagate": false}
  }
}
```

### 2. Log Rotation Setup

**Install logrotate:**
```bash
sudo apt install logrotate
```

**Create logrotate configuration:**
```bash
sudo nano /etc/logrotate.d/lawflow
```

**Add this configuration:**
```
/home/admin-non-root/apps/lawflow-docker/lawflow_backend/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 admin-non-root admin-non-root
    sharedscripts
    postrotate
        # No need to restart uvicorn as it reopens log files
    endscript
}
```

**Test logrotate:**
```bash
sudo logrotate -d /etc/logrotate.d/lawflow  # Dry run
sudo logrotate -f /etc/logrotate.d/lawflow  # Force rotation
```

### 3. Application-Level Logging

**Add to `lawflow_backend/app/main.py`:**
```python
import logging
from logging.handlers import RotatingFileHandler

# Configure application logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            'application.log',
            maxBytes=5*1024*1024,  # 5 MB
            backupCount=5
        )
    ]
)

logger = logging.getLogger(__name__)

@app.on_event("startup")
def startup_event():
    logger.info("Application startup complete")
    logger.info(f"Database URL: {DATABASE_URL}")
    logger.info("Environment: production")

@app.on_event("shutdown")
def shutdown_event():
    logger.info("Application shutdown initiated")
```

### 4. Structured Logging for Important Events

**Add to key endpoints in routers:**
```python
from fastapi import APIRouter, Depends, HTTPException
from ..db import get_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    try:
        projects = db.query(Project).all()
        logger.info(f"Fetched {len(projects)} projects")
        return projects
    except Exception as e:
        logger.error(f"Error fetching projects: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
```

### 5. Error Logging Enhancement

**Add error middleware in `main.py`:**
```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    logger.error(f"Endpoint: {request.url}")
    logger.error(f"Method: {request.method}")
    logger.error(f"Headers: {dict(request.headers)}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )
```

### 6. Request Logging Middleware

**Add request logging middleware:**
```python
from fastapi import Request

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    logger.info(f"Response: {response.status_code} - {request.method} {request.url}")
    
    return response
```

### 7. Database Query Logging

**Add to `lawflow_backend/app/db.py`:**
```python
# Enable SQL query logging for debugging (use sparingly in production)
import logging
from sqlalchemy import event

# Uncomment for debugging
# logging.basicConfig()
# logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

## Implementation Plan

### Phase 1: Basic Improvements (5 minutes)
```bash
# 1. Stop current backend
pkill -f "uvicorn app.main:app"

# 2. Create logging config
cd lawflow_backend
cat > logging_config.json << 'EOF'
{
  "version": 1,
  "disable_existing_loggers": false,
  "formatters": {
    "default": {
      "()": "uvicorn.logging.DefaultFormatter",
      "fmt": "%(asctime)s - %(levelname)s - %(message)s",
      "use_colors": false
    }
  },
  "handlers": {
    "default": {
      "formatter": "default",
      "class": "logging.FileHandler",
      "filename": "backend.log"
    }
  },
  "loggers": {
    "uvicorn": {"handlers": ["default"], "level": "info"}
  }
}
EOF

# 3. Restart with improved logging
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-config logging_config.json > backend.log 2>&1 &
```

### Phase 2: Application Logging (10 minutes)
```bash
# 1. Add logging imports to main.py
# 2. Add startup/shutdown event logging
# 3. Add error handling middleware
# 4. Restart backend
```

### Phase 3: Advanced Logging (Optional)
```bash
# 1. Install logrotate
# 2. Configure log rotation
# 3. Add structured logging to key endpoints
# 4. Add request logging middleware
```

## Log Management Best Practices

### Log Retention Policy
- **Backend logs**: Keep 14 days of daily logs
- **Access logs**: Keep 30 days for analytics
- **Error logs**: Keep 90 days for debugging
- **Database**: Rotate SQLite logs weekly

### Log Monitoring Commands
```bash
# Check recent backend logs
tail -50 lawflow_backend/backend.log

# Monitor logs in real-time
tail -f lawflow_backend/backend.log

# Search for errors
grep -i "error" lawflow_backend/backend.log

# Check log file sizes
ls -lh lawflow_backend/*.log

# Find large log files
find . -name "*.log" -size +10M -exec ls -lh {} \;
```

### Log Analysis Tools
```bash
# Count requests by endpoint
cat backend.log | grep "GET\|POST\|PUT\|DELETE" | awk '{print $7}' | sort | uniq -c | sort -nr

# Find slow responses
cat backend.log | grep "ms" | awk '{print $NF}' | sed 's/ms//' | sort -n | tail -10

# Count errors
cat backend.log | grep -i "error\|500" | wc -l

# Monitor error rate
watch "tail -100 backend.log | grep -i error | wc -l"
```

## Troubleshooting Logging Issues

### Issue: Logs not appearing
```bash
# 1. Check file permissions
ls -la lawflow_backend/*.log

# 2. Check uvicorn process
ps aux | grep uvicorn

# 3. Test logging manually
cd lawflow_backend
source .venv/bin/activate
python -c "import logging; logging.basicConfig(filename='test.log'); logging.info('Test message')"
cat test.log
```

### Issue: Logs growing too large
```bash
# 1. Implement log rotation
sudo apt install logrotate

# 2. Add log rotation config as shown above

# 3. Manually rotate logs if needed
cp backend.log backend.log.1
echo "" > backend.log
```

### Issue: Too much logging
```bash
# 1. Adjust log level
# Change "level": "info" to "level": "warning" in logging_config.json

# 2. Restart backend
pkill -f uvicorn
nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --log-config logging_config.json > backend.log 2>&1 &
```

## Recommended Logging Configuration

### Production Setup
```json
{
  "version": 1,
  "disable_existing_loggers": false,
  "formatters": {
    "default": {
      "()": "uvicorn.logging.DefaultFormatter",
      "fmt": "%(asctime)s - %(levelname)s - %(message)s"
    },
    "access": {
      "()": "uvicorn.logging.AccessFormatter",
      "fmt": "%(asctime)s - %(client_addr)s - \"%(request_line)s\" %(status_code)s - %(bytes_sent)s bytes - %(duration).2fms"
    }
  },
  "handlers": {
    "default": {
      "formatter": "default",
      "class": "logging.FileHandler",
      "filename": "backend.log",
      "encoding": "utf-8"
    },
    "access": {
      "formatter": "access",
      "class": "logging.FileHandler",
      "filename": "access.log",
      "encoding": "utf-8"
    },
    "error": {
      "formatter": "default",
      "class": "logging.FileHandler",
      "filename": "error.log",
      "level": "ERROR",
      "encoding": "utf-8"
    }
  },
  "loggers": {
    "uvicorn": {"handlers": ["default"], "level": "info"},
    "uvicorn.error": {"handlers": ["error"], "level": "error"},
    "uvicorn.access": {"handlers": ["access"], "level": "info"}
  }
}
```

### Development Setup
```json
{
  "version": 1,
  "disable_existing_loggers": false,
  "formatters": {
    "default": {
      "()": "uvicorn.logging.DefaultFormatter",
      "fmt": "%(asctime)s - %(levelname)s - %(message)s",
      "use_colors": true
    }
  },
  "handlers": {
    "default": {
      "formatter": "default",
      "class": "logging.StreamHandler"
    }
  },
  "loggers": {
    "uvicorn": {"handlers": ["default"], "level": "debug"}
  }
}
```

## Monitoring and Alerting

### Basic Monitoring Script
```bash
#!/bin/bash
# monitor_logs.sh

LOG_FILE="lawflow_backend/backend.log"
ERROR_THRESHOLD=5
WARN_THRESHOLD=10

# Count errors in last 5 minutes
ERROR_COUNT=$(tail -1000 "$LOG_FILE" | grep -i "error\|500" | wc -l)
WARN_COUNT=$(tail -1000 "$LOG_FILE" | grep -i "warning\|404" | wc -l)

if [ "$ERROR_COUNT" -ge "$ERROR_THRESHOLD" ]; then
    echo "ALERT: High error rate detected ($ERROR_COUNT errors)"
    # Add notification here (email, Slack, etc.)
fi

if [ "$WARN_COUNT" -ge "$WARN_THRESHOLD" ]; then
    echo "WARNING: High warning rate detected ($WARN_COUNT warnings)"
fi
```

### Log Analysis Dashboard
```bash
#!/bin/bash
# log_dashboard.sh

echo "=== LawFlow Log Dashboard ==="
echo "Generated: $(date)"
echo

echo "1. Recent Errors:"
tail -20 lawflow_backend/backend.log | grep -i "error\|500" || echo "   None found"
echo

echo "2. Request Statistics:"
echo "   Total requests: $(cat lawflow_backend/backend.log | grep "GET\|POST\|PUT\|DELETE" | wc -l)"
echo "   Error rate: $(cat lawflow_backend/backend.log | grep "500" | wc -l) errors"
echo "   Warning rate: $(cat lawflow_backend/backend.log | grep "404" | wc -l) not found"
echo

echo "3. Top Endpoints:"
cat lawflow_backend/backend.log | grep "GET\|POST\|PUT\|DELETE" | awk '{print $7}' | sort | uniq -c | sort -nr | head -5
echo

echo "4. Log File Sizes:"
ls -lh lawflow_backend/*.log 2>/dev/null || echo "   No log files found"
```

## Conclusion

The current logging system is functional but could be significantly improved with:

1. **Better log organization** (separate access logs, error logs)
2. **Log rotation** to prevent large log files
3. **Structured logging** for easier analysis
4. **Application-level logging** for business events
5. **Error tracking** for debugging

**Recommended immediate actions:**
1. ✅ Implement basic Uvicorn logging config (5 minutes)
2. ✅ Add application startup/shutdown logging (5 minutes)
3. ✅ Set up log rotation (10 minutes)
4. ⚠️ Add error handling middleware (optional but recommended)
5. ⚠️ Implement request logging middleware (optional)

These improvements will make the application much easier to monitor, debug, and maintain while adding minimal overhead.
