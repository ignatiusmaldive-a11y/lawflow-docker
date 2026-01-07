import os
import logging
from datetime import datetime
from sqlalchemy import text
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, SessionLocal
from .models import Base
from .seed import seed_if_empty, normalize_legacy_demo_data
from .routers import projects, tasks, checklists, timeline, activity, files, templates, calendar, closing_pack, chat, fiscal, recurring_tasks, rental, checklist_templates, agencies

# Configure logging
logger = logging.getLogger(__name__)

app = FastAPI(title="LawFlow API", version="0.1.0")

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to log client IP addresses
@app.middleware("http")
async def log_client_ip(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    forward_ip = request.headers.get("X-Forwarded-For", "").split(",")[0] if request.headers.get("X-Forwarded-For") else ""
    actual_ip = forward_ip if forward_ip else client_ip
    
    logger.info(f"Request from IP: {actual_ip} - {request.method} {request.url}")
    
    response = await call_next(request)
    logger.info(f"Response to IP: {actual_ip} - {response.status_code} - {request.method} {request.url}")
    
    return response

def ensure_bg_color_column():
    # Add the bg_color column on existing SQLite DBs without recreating tables.
    try:
        with engine.connect() as conn:
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(projects);")]
            if "bg_color" not in cols:
                conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN bg_color VARCHAR(20) DEFAULT '#0b1220'")
    except Exception:
        # Table doesn't exist yet, which is fine - it will be created by create_all
        pass

def ensure_dropbox_folder_column():
    # Add the dropbox_folder column on existing SQLite DBs without recreating tables.
    try:
        with engine.connect() as conn:
            cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(projects);")]
            if "dropbox_folder" not in cols:
                conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN dropbox_folder VARCHAR(520)")
    except Exception:
        # Table doesn't exist yet, which is fine - it will be created by create_all
        pass

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_bg_color_column()
    ensure_dropbox_folder_column()
    db = SessionLocal()
    try:
        seed_if_empty(db)
        normalize_legacy_demo_data(db)
    finally:
        db.close()

app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(checklists.router)
app.include_router(timeline.router)
app.include_router(activity.router)
app.include_router(files.router)
app.include_router(templates.router)
app.include_router(calendar.router)
app.include_router(closing_pack.router)
app.include_router(chat.router)
app.include_router(fiscal.router)
app.include_router(recurring_tasks.router)
app.include_router(rental.router)
app.include_router(checklist_templates.router)
app.include_router(agencies.router)

@app.get("/health")
def health():
    return {
        "ok": True,
        "timestamp": datetime.now().isoformat(),
        "version": "0.1.0",
        "database": "ok"
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
