# LawFlow Logging Guidelines

## Complete Logging Best Practices and Implementation Guide

## Table of Contents

1. [Logging Philosophy](#logging-philosophy)
2. [Current Logging Setup](#current-logging-setup)
3. [Logging Levels and Usage](#logging-levels-and-usage)
4. [What to Log](#what-to-log)
5. [What NOT to Log](#what-not-to-log)
6. [Log Format Standards](#log-format-standards)
7. [Implementation Guidelines](#implementation-guidelines)
8. [Error Handling and Logging](#error-handling-and-logging)
9. [Performance Considerations](#performance-considerations)
10. [Log Rotation and Retention](#log-rotation-and-retention)
11. [Monitoring and Alerting](#monitoring-and-alerting)
12. [Security Considerations](#security-considerations)
13. [Development vs Production Logging](#development-vs-production-logging)
14. [Troubleshooting Logging Issues](#troubleshooting-logging-issues)
15. [Future Improvements](#future-improvements)

## Logging Philosophy

### Core Principles

1. **Purposeful Logging**: Every log entry should have a clear purpose
2. **Consistency**: Use consistent formats and patterns throughout
3. **Minimal Impact**: Logging should not significantly impact performance
4. **Actionable**: Logs should provide information that can be acted upon
5. **Secure**: Never log sensitive information

### Logging Goals

- **Debugging**: Help developers identify and fix issues
- **Monitoring**: Track application health and performance
- **Auditing**: Maintain records of important events
- **Analytics**: Understand usage patterns and performance
- **Alerting**: Detect and respond to problems quickly

## Current Logging Setup

### Log Files

```
lawflow_backend/
├── backend.log      # Uvicorn access logs
├── application.log  # Application events
├── access.log       # Detailed access logs
└── error.log        # Error logs
```

### Logging Components

1. **Uvicorn Logging**: Basic access logging
2. **Application Logging**: Custom application events
3. **Error Middleware**: Exception handling and logging
4. **Request Middleware**: Request/response tracking

### Current Configuration

**`logging_config.json`:**
```json
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
      "filename": "backend.log",
      "encoding": "utf-8"
    }
  },
  "loggers": {
    "uvicorn": {"handlers": ["default"], "level": "info"}
  }
}
```

**Application logging in `main.py`:**
```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('application.log'),
        logging.StreamHandler()
    ]
)
```

## Logging Levels and Usage

### Standard Logging Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| **DEBUG** | Detailed debugging information | `logger.debug("Processing project ID: %s", project_id)` |
| **INFO** | Normal application events | `logger.info("Project created successfully")` |
| **WARNING** | Potential issues, non-critical | `logger.warning("Project missing required field: %s", field)` |
| **ERROR** | Failed operations, recoverable | `logger.error("Failed to save project: %s", error)` |
| **CRITICAL** | Severe errors, application may crash | `logger.critical("Database connection lost")` |

### Level Usage Guidelines

**DEBUG:**
- Development and troubleshooting only
- Detailed technical information
- Should be disabled in production for performance

**INFO:**
- Normal application flow
- Important business events
- Startup/shutdown events
- API calls and responses

**WARNING:**
- Unexpected but non-fatal conditions
- Deprecated API usage
- Configuration issues
- Resource constraints

**ERROR:**
- Failed operations
- Database errors
- API call failures
- Validation errors

**CRITICAL:**
- Application crashes
- Database connection failures
- Security breaches
- Critical resource exhaustion

## What to Log

### Application Lifecycle

```python
# Startup events
logger.info("Application startup initiated")
logger.info("Database connection established")
logger.info("Cache initialized")
logger.info("Application ready to accept connections")

# Shutdown events
logger.info("Shutdown signal received")
logger.info("Closing database connections")
logger.info("Application shutdown complete")
```

### API Endpoints

```python
# Request logging (automatic via middleware)
# Response logging (automatic via middleware)

# Business logic logging
logger.info(f"Fetching {resource_type} for user {user_id}")
logger.info(f"Creating new {resource_type} with title: {title}")
logger.info(f"Updating {resource_type} ID {resource_id}")
logger.info(f"Deleting {resource_type} ID {resource_id}")
```

### Database Operations

```python
# Successful operations
logger.info(f"Saved {entity_type} to database, ID: {entity_id}")
logger.info(f"Loaded {count} records from {table_name}")

# Performance-sensitive operations
logger.debug(f"Database query executed in {duration}ms: {query}")

# Warnings
logger.warning(f"No records found for query: {query_summary}")
logger.warning(f"Database query took {duration}ms (threshold: {threshold}ms)")
```

### External Service Calls

```python
# Outbound API calls
logger.info(f"Calling external service: {service_name}")
logger.info(f"External API response: {status_code} - {response_summary}")

# Errors
logger.error(f"External service failed: {service_name} - {error}")
logger.error(f"Retry attempt {attempt}/{max_attempts} for {service_name}")
```

### Authentication and Security

```python
# Successful authentication
logger.info(f"User authenticated: {user_id}")
logger.info(f"Session created: {session_id}")

# Failed authentication (be careful with sensitive data)
logger.warning(f"Failed login attempt for user: {username}")
logger.warning(f"Invalid API key from IP: {client_ip}")

# Security events
logger.warning(f"Rate limit exceeded for IP: {client_ip}")
logger.warning(f"Suspicious activity detected: {activity_type}")
```

### Performance Metrics

```python
# Slow operations
logger.warning(f"Slow operation: {operation_name} took {duration}ms")

# Resource usage
logger.info(f"Memory usage: {memory_mb}MB")
logger.info(f"Active connections: {connection_count}")

# Cache statistics
logger.info(f"Cache hit rate: {hit_rate}%")
logger.info(f"Cache evictions: {eviction_count}")
```

## What NOT to Log

### Sensitive Information

❌ **Never log:**
- Passwords or API keys
- Credit card numbers
- Personal identification numbers (SSN, etc.)
- Authentication tokens
- Session cookies
- Full database queries with sensitive data

✅ **Safe alternatives:**
```python
# Instead of:
logger.debug(f"User credentials: {username}/{password}")

# Use:
logger.debug(f"Authenticating user: {username}")
logger.info("User authentication successful")
```

### Excessive Data

❌ **Avoid:**
- Large data structures (full JSON objects)
- Binary data
- File contents
- Complete database dumps

✅ **Better approach:**
```python
# Instead of:
logger.debug(f"Full user object: {user.__dict__}")

# Use:
logger.debug(f"User ID: {user.id}, Name: {user.name}")
logger.debug(f"Processing user with {len(user.orders)} orders")
```

### Redundant Information

❌ **Avoid:**
- Logging the same information multiple times
- Logging in multiple layers for the same event
- Logging framework/internal operations

✅ **Better approach:**
```python
# Instead of logging in every layer:
# Service layer: logger.info("Creating project")
# Repository layer: logger.info("Saving project to DB")
# Controller layer: logger.info("Project created")

# Use: Log at the most appropriate layer only
logger.info("Project created successfully", extra={"project_id": project.id})
```

### High-Frequency Events

❌ **Avoid in production:**
- Logging every database query
- Logging every cache access
- Logging every internal method call

✅ **Better approach:**
```python
# Use DEBUG level for high-frequency events
logger.debug(f"Database query: {query_summary}")

# Or use sampling
if random.random() < 0.01:  # 1% sampling
    logger.debug(f"Detailed request processing: {request_details}")
```

## Log Format Standards

### Timestamp Format

```
# Standard format: YYYY-MM-DD HH:MM:SS,mmm
2025-12-24 13:30:15,446 - app.main - INFO - Application startup complete
```

### Log Message Structure

```
[TIMESTAMP] - [MODULE] - [LEVEL] - [MESSAGE]
```

### Best Practices for Log Messages

1. **Be concise but descriptive**
   ```python
   # Good
   logger.info("Project created successfully")
   
   # Bad
   logger.info("P")
   logger.info("The project creation operation has been completed without errors")
   ```

2. **Use consistent terminology**
   ```python
   # Good - consistent
   logger.info("Fetching projects")
   logger.info("Creating project")
   logger.info("Updating project")
   
   # Bad - inconsistent
   logger.info("Get projects")
   logger.info("Create new project")
   logger.info("Project update")
   ```

3. **Include relevant context**
   ```python
   # Good
   logger.info(f"Project created: {project_id}")
   logger.warning(f"Project not found: {project_id}")
   
   # Bad
   logger.info("Project created")
   logger.warning("Project not found")
   ```

4. **Use present tense**
   ```python
   # Good
   logger.info("Processing request")
   logger.error("Failed to connect")
   
   # Bad
   logger.info("Request was processed")
   logger.error("Connection failed")
   ```

5. **Avoid logging exceptions twice**
   ```python
   # Good
   try:
       risky_operation()
   except Exception as e:
       logger.error("Operation failed", exc_info=True)
       raise
   
   # Bad (logs exception twice)
   try:
       risky_operation()
   except Exception as e:
       logger.error(f"Operation failed: {str(e)}")
       logger.error("Operation failed", exc_info=True)
       raise
   ```

## Implementation Guidelines

### Python Logging Setup

```python
import logging
from logging.handlers import RotatingFileHandler

# Basic configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            'application.log',
            maxBytes=5*1024*1024,  # 5 MB
            backupCount=5
        ),
        logging.StreamHandler()  # Console output
    ]
)

# Module-specific logger
logger = logging.getLogger(__name__)
```

### FastAPI Integration

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# Startup/shutdown events
@app.on_event("startup")
def startup():
    logger.info("Application startup")

@app.on_event("shutdown")
def shutdown():
    logger.info("Application shutdown")

# Error handling middleware
@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", exc_info=True)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response: {response.status_code}")
    return response
```

### Router-Level Logging

```python
from fastapi import APIRouter, Depends
from ..db import get_db
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    logger.info("Fetching all projects")
    try:
        projects = db.query(Project).all()
        logger.info(f"Returning {len(projects)} projects")
        return projects
    except Exception as e:
        logger.error("Failed to fetch projects", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/projects")
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating project: {project.title}")
    try:
        db_project = create_project_in_db(db, project)
        logger.info(f"Project created: {db_project.id}")
        return db_project
    except Exception as e:
        logger.error(f"Failed to create project: {project.title}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Database Operation Logging

```python
from sqlalchemy import text
from ..db import engine

logger = logging.getLogger(__name__)

def execute_query(query, params=None):
    logger.debug(f"Executing query: {query}")
    
    start_time = time.time()
    try:
        with engine.connect() as conn:
            result = conn.execute(text(query), params or {})
            duration = time.time() - start_time
            
            if duration > 1.0:  # Slow query
                logger.warning(f"Slow query ({duration:.2f}s): {query}")
            else:
                logger.debug(f"Query executed in {duration:.2f}s")
            
            return result.fetchall()
    except Exception as e:
        logger.error(f"Query failed: {query}", exc_info=True)
        raise
```

## Error Handling and Logging

### Exception Logging Patterns

```python
# Basic exception logging
try:
    risky_operation()
except Exception as e:
    logger.error("Operation failed", exc_info=True)
    raise

# Context-rich exception logging
try:
    process_user_data(user_id, data)
except ValidationError as e:
    logger.error(f"Validation failed for user {user_id}: {str(e)}")
    raise HTTPException(status_code=400, detail="Validation error")
except DatabaseError as e:
    logger.error(f"Database error for user {user_id}", exc_info=True)
    raise HTTPException(status_code=500, detail="Database error")
except Exception as e:
    logger.error(f"Unexpected error processing user {user_id}", exc_info=True)
    raise HTTPException(status_code=500, detail="Internal server error")

# Retry logic with logging
max_retries = 3
for attempt in range(max_retries):
    try:
        call_external_service()
        break
    except ServiceUnavailable as e:
        if attempt == max_retries - 1:
            logger.error(f"Service unavailable after {max_retries} attempts", exc_info=True)
            raise
        logger.warning(f"Service unavailable, retry {attempt + 1}/{max_retries}")
        time.sleep(2 ** attempt)  # Exponential backoff
```

### Common Error Scenarios

```python
# Database connection errors
try:
    db.execute(query)
except SQLAlchemyError as e:
    logger.error("Database connection failed", exc_info=True)
    # Implement retry logic or circuit breaker
    raise

# External API failures
try:
    response = requests.get(external_url, timeout=10)
    response.raise_for_status()
except requests.Timeout:
    logger.error(f"External API timeout: {external_url}")
    raise HTTPException(status_code=504, detail="External service timeout")
except requests.HTTPError as e:
    logger.error(f"External API error: {external_url} - {response.status_code}")
    raise HTTPException(status_code=502, detail="External service error")

# Authentication failures
try:
    authenticate_user(username, password)
except AuthenticationError:
    logger.warning(f"Failed login attempt: {username}")
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Authorization failures
try:
    check_permission(user, resource, action)
except PermissionError:
    logger.warning(f"Permission denied: {user.id} - {action} on {resource}")
    raise HTTPException(status_code=403, detail="Permission denied")

# Validation errors
try:
    validate_input(data)
except ValidationError as e:
    logger.info(f"Validation failed: {str(e)}")
    raise HTTPException(status_code=422, detail=e.errors())
```

## Performance Considerations

### Logging Performance Impact

```python
# Avoid expensive operations in log messages
# Bad - string concatenation always happens
logger.debug("User data: " + str(user.__dict__))

# Good - lazy evaluation
logger.debug("User data: %s", user.__dict__)

# Avoid complex computations in log calls
# Bad - computation happens even if DEBUG is disabled
logger.debug(f"Complex calculation result: {expensive_calculation()}")

# Good - only compute if needed
if logger.isEnabledFor(logging.DEBUG):
    result = expensive_calculation()
    logger.debug(f"Complex calculation result: {result}")
```

### Asynchronous Logging

```python
# Use QueueHandler for async logging in high-volume applications
from logging.handlers import QueueHandler, QueueListener
import logging.handlers

# Create queue
log_queue = logging.handlers.QueueHandler(queue)

# Set up handlers
file_handler = logging.FileHandler('application.log')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))

# Create listener
listener = QueueListener(queue, file_handler)
listener.start()

# Configure logger
logger = logging.getLogger(__name__)
logger.addHandler(log_queue)
logger.setLevel(logging.INFO)
```

### Log Sampling

```python
# Sample high-frequency logs
import random

if random.random() < 0.1:  # 10% sampling
    logger.debug("Detailed debug information")

# Time-based sampling
last_log_time = 0
current_time = time.time()
if current_time - last_log_time > 60:  # Once per minute
    logger.info("Periodic status update")
    last_log_time = current_time
```

### Batch Logging

```python
# Instead of logging each item individually
for item in large_collection:
    logger.info(f"Processing item: {item.id}")  # Too many logs!

# Batch logging approach
batch_size = 100
for i, item in enumerate(large_collection):
    process_item(item)
    if (i + 1) % batch_size == 0:
        logger.info(f"Processed {i + 1} items")

logger.info(f"Completed processing {len(large_collection)} items")
```

## Log Rotation and Retention

### Manual Log Rotation

```bash
# Rotate logs manually
mv backend.log backend.log.1
touch backend.log

# Compress old logs
gzip backend.log.1

# Clean up old logs
find . -name "*.log.*" -mtime +30 -delete
```

### Logrotate Configuration

```bash
# Install logrotate
sudo apt install logrotate

# Create configuration
sudo nano /etc/logrotate.d/lawflow
```

**Recommended configuration:**
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

### Log Retention Policy

| Log Type | Retention Period | Rotation Frequency |
|----------|------------------|-------------------|
| Access logs | 30 days | Daily |
| Application logs | 14 days | Daily |
| Error logs | 90 days | Daily |
| Debug logs | 7 days | Daily |

### Log File Management

```bash
# Check log file sizes
ls -lh lawflow_backend/*.log

# Find large log files
find . -name "*.log" -size +10M

# Compress old logs
find . -name "*.log" -mtime +7 -exec gzip {} \;

# Clean up old logs
find . -name "*.log.gz" -mtime +30 -delete
```

## Monitoring and Alerting

### Basic Log Monitoring

```bash
# Monitor logs in real-time
tail -f lawflow_backend/application.log

# Filter for errors
tail -f lawflow_backend/application.log | grep -i error

# Count errors in last hour
grep -c "ERROR" lawflow_backend/application.log

# Monitor error rate
watch "tail -100 lawflow_backend/application.log | grep -i error | wc -l"
```

### Log Analysis Scripts

```bash
#!/bin/bash
# analyze_logs.sh

echo "=== Log Analysis Report ==="
echo "Generated: $(date)"
echo

echo "1. Error Count (last 24h):"
grep -c "ERROR" lawflow_backend/application.log
echo

echo "2. Warning Count (last 24h):"
grep -c "WARNING" lawflow_backend/application.log
echo

echo "3. Recent Errors:"
tail -10 lawflow_backend/application.log | grep "ERROR" || echo "   None found"
echo

echo "4. Request Statistics:"
echo "   Total requests: $(grep -c "Incoming request" lawflow_backend/application.log)"
echo "   Successful (200): $(grep -c "Response: 200" lawflow_backend/application.log)"
echo "   Not Found (404): $(grep -c "Response: 404" lawflow_backend/application.log)"
echo "   Server Errors (500): $(grep -c "Response: 500" lawflow_backend/application.log)"
echo

echo "5. Top Endpoints:"
grep "Incoming request" lawflow_backend/application.log | 
  sed 's/.*GET \([^ ]*\).*/\1/' | 
  sort | uniq -c | sort -nr | head -5
echo

echo "6. Log File Sizes:"
ls -lh lawflow_backend/*.log | awk '{print $9, $5}'
```

### Alerting Script

```bash
#!/bin/bash
# log_alert.sh

LOG_FILE="lawflow_backend/application.log"
ERROR_THRESHOLD=5
WARN_THRESHOLD=10
TIME_WINDOW=300  # 5 minutes

# Count errors in time window
ERROR_COUNT=$(tail -1000 "$LOG_FILE" | grep -i "error" | wc -l)
WARN_COUNT=$(tail -1000 "$LOG_FILE" | grep -i "warning" | wc -l)

if [ "$ERROR_COUNT" -ge "$ERROR_THRESHOLD" ]; then
    echo "ALERT: High error rate detected ($ERROR_COUNT errors in last 5 minutes)"
    # Send email/Slack notification here
    exit 1
fi

if [ "$WARN_COUNT" -ge "$WARN_THRESHOLD" ]; then
    echo "WARNING: High warning rate detected ($WARN_COUNT warnings in last 5 minutes)"
    exit 1
fi

echo "OK: Log levels normal"
exit 0
```

### Performance Monitoring

```bash
# Monitor response times
tail -1000 lawflow_backend/application.log | 
grep "Response:" | 
awk '{print $NF}' | 
sed 's/ms//' | 
sort -n | 
tail -10

# Calculate average response time
tail -1000 lawflow_backend/application.log | 
grep "Response:" | 
awk '{print $NF}' | 
sed 's/ms//' | 
awk '{sum+=$1; count++} END {print sum/count "ms average"}'
```

## Security Considerations

### Sensitive Data Protection

```python
# Never log sensitive information

# Bad examples:
logger.debug(f"User password: {password}")
logger.debug(f"API key: {api_key}")
logger.debug(f"Credit card: {credit_card_number}")

# Good examples:
logger.debug("User authentication attempt")
logger.info("User authenticated successfully")
logger.warning("Failed authentication attempt")
```

### Log File Security

```bash
# Set proper permissions
chmod 640 lawflow_backend/*.log
chown admin-non-root:admin-non-root lawflow_backend/*.log

# Prevent log tampering
chattr +a lawflow_backend/*.log  # Append-only mode

# Monitor log file access
sudo auditctl -w /home/admin-non-root/apps/lawflow-docker/lawflow_backend/*.log -p wa -k lawflow_logs
```

### PII (Personally Identifiable Information)

```python
# Mask PII in logs
def mask_pii(data):
    """Mask sensitive information in log data"""
    if not data:
        return data
    
    masked = str(data)
    
    # Mask email addresses
    masked = re.sub(r'\b[\w.-]+@[\w.-]+\.\w+\b', '[EMAIL]', masked)
    
    # Mask phone numbers
    masked = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', masked)
    
    # Mask credit card numbers
    masked = re.sub(r'\b\d{4}[-.]?\d{4}[-.]?\d{4}[-.]?\d{4}\b', '[CC]', masked)
    
    return masked

# Usage
logger.debug(f"User data: {mask_pii(user_data)}")
```

### Log Injection Prevention

```python
# Prevent log injection attacks

# Bad - vulnerable to injection
logger.info(f"User input: {user_input}")

# Good - parameterized logging
logger.info("User input: %s", user_input)

# Good - structured logging
logger.info("User input", extra={"input": user_input})
```

## Development vs Production Logging

### Development Environment

```python
# More verbose logging for development
logging.basicConfig(
    level=logging.DEBUG,  # More detailed
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # Console output
        logging.FileHandler('development.log')
    ]
)

# Enable SQL query logging
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# Detailed error information
@app.exception_handler(Exception)
async def dev_exception_handler(request: Request, exc: Exception):
    logger.error("Detailed error information", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": str(exc),
            "traceback": traceback.format_exc()
        }
    )
```

### Production Environment

```python
# Production logging - less verbose
logging.basicConfig(
    level=logging.INFO,  # Less detailed
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler(
            'application.log',
            maxBytes=5*1024*1024,
            backupCount=5
        )
    ]
)

# Disable SQL query logging in production
logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)

# Secure error handling
@app.exception_handler(Exception)
async def prod_exception_handler(request: Request, exc: Exception):
    logger.error("Production error", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )
```

### Environment-Specific Configuration

```python
import os

def configure_logging():
    env = os.getenv('ENVIRONMENT', 'development')
    
    if env == 'production':
        # Production logging
        logging.basicConfig(
            level=logging.INFO,
            handlers=[
                RotatingFileHandler('application.log', maxBytes=5*1024*1024, backupCount=5)
            ]
        )
        # Disable debug logging
        logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
        
    else:
        # Development logging
        logging.basicConfig(
            level=logging.DEBUG,
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler('development.log')
            ]
        )
        # Enable debug logging
        logging.getLogger('sqlalchemy').setLevel(logging.INFO)
```

## Troubleshooting Logging Issues

### Common Problems and Solutions

**Problem: Logs not appearing**
```bash
# Check file permissions
ls -la lawflow_backend/*.log

# Check if logging is configured
grep -r "logging.basicConfig" lawflow_backend/

# Test logging manually
python -c "import logging; logging.basicConfig(); logging.info('Test')"

# Check log level
python -c "import logging; print(logging.getLogger().getEffectiveLevel())"
```

**Problem: Logs growing too large**
```bash
# Implement log rotation
sudo apt install logrotate

# Manual rotation
mv backend.log backend.log.1
touch backend.log

# Compress old logs
gzip backend.log.1
```

**Problem: Too much logging**
```bash
# Increase log level
logging.basicConfig(level=logging.WARNING)

# Disable specific loggers
logging.getLogger('verbose.module').setLevel(logging.WARNING)

# Use log sampling
if random.random() < 0.1:
    logger.debug("Sampled debug message")
```

**Problem: Performance impact from logging**
```bash
# Use lazy evaluation
logger.debug("Message: %s", expensive_function())

# Check log level before expensive operations
if logger.isEnabledFor(logging.DEBUG):
    result = expensive_function()
    logger.debug("Result: %s", result)

# Use async logging
from logging.handlers import QueueHandler, QueueListener
```

**Problem: Logs not rotating**
```bash
# Check logrotate configuration
sudo logrotate -d /etc/logrotate.d/lawflow  # Dry run

# Force rotation
sudo logrotate -f /etc/logrotate.d/lawflow

# Check cron job
ls -la /etc/cron.daily/logrotate
```

## Future Improvements

### Structured Logging

```python
# Implement structured logging with JSON format
import json
import logging

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': self.formatTime(record),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        if hasattr(record, 'extra'):
            log_data.update(record.extra)
        
        return json.dumps(log_data)

# Usage
handler = logging.FileHandler('structured.log')
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)

# Log with extra context
logger.info("User login", extra={"user_id": 123, "ip": "192.168.1.1"})
```

### Centralized Logging

```python
# Send logs to centralized logging system

# Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)
# Option 2: Graylog
# Option 3: AWS CloudWatch
# Option 4: Datadog

# Example: Logging to syslog for central collection
from logging.handlers import SysLogHandler

syslog_handler = SysLogHandler(address='/dev/log')
syslog_handler.setFormatter(logging.Formatter('%(name)s: %(message)s'))
logger.addHandler(syslog_handler)
```

### Log Correlation

```python
# Add correlation IDs to track requests across services
import uuid
from contextvars import ContextVar

# Create context variable for correlation ID
correlation_id_var = ContextVar('correlation_id')

def get_correlation_id():
    """Get current correlation ID, creating one if needed"""
    correlation_id = correlation_id_var.get(None)
    if correlation_id is None:
        correlation_id = str(uuid.uuid4())
        correlation_id_var.set(correlation_id)
    return correlation_id

# Middleware to set correlation ID
@app.middleware("http")
async def correlation_id_middleware(request: Request, call_next):
    correlation_id = request.headers.get('X-Correlation-ID', str(uuid.uuid4()))
    correlation_id_var.set(correlation_id)
    
    response = await call_next(request)
    response.headers['X-Correlation-ID'] = correlation_id
    
    return response

# Custom filter to add correlation ID to logs
class CorrelationIdFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = correlation_id_var.get("N/A")
        return True

# Add filter to logger
logger.addFilter(CorrelationIdFilter())

# Custom formatter to include correlation ID
class CorrelationFormatter(logging.Formatter):
    def format(self, record):
        return f"[{record.correlation_id}] {super().format(record)}"

# Apply formatter
handler.setFormatter(CorrelationFormatter())
```

### Performance Monitoring

```python
# Add performance metrics to logs
import time
from functools import wraps

def log_performance(func):
    """Decorator to log function performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            duration = time.time() - start_time
            
            if duration > 1.0:  # Slow operation
                logger.warning(f"Slow {func.__name__}: {duration:.2f}s")
            else:
                logger.debug(f"{func.__name__} completed in {duration:.2f}s")
            
            return result
        except Exception as e:
            duration = time.time() - start_time
            logger.error(f"{func.__name__} failed after {duration:.2f}s", exc_info=True)
            raise
    
    return wrapper

# Usage
@log_performance
def process_large_dataset(data):
    # ... processing code
    return result
```

### Health Check Endpoint

```python
# Add health check endpoint with logging
@app.get("/health")
def health_check():
    try:
        # Check database
        db.execute("SELECT 1")
        
        # Check cache
        cache.ping()
        
        # Check external services
        external_service.health()
        
        logger.info("Health check passed")
        return {"status": "healthy"}
        
    except Exception as e:
        logger.error("Health check failed", exc_info=True)
        return {"status": "unhealthy", "error": str(e)}, 500
```

## Conclusion

This comprehensive logging guide provides best practices for implementing and maintaining an effective logging system for the LawFlow application. Key takeaways:

1. **Be intentional**: Every log entry should serve a purpose
2. **Balance detail and performance**: Log enough to debug, but not so much it impacts performance
3. **Protect sensitive data**: Never log passwords, API keys, or PII
4. **Use consistent formats**: Makes logs easier to parse and analyze
5. **Monitor and rotate**: Regularly check logs and implement rotation to prevent disk space issues
6. **Plan for production**: Development and production logging should be different

By following these guidelines, the LawFlow application will have robust, secure, and maintainable logging that supports debugging, monitoring, and operational excellence.
