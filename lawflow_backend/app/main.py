import os
from datetime import datetime
from sqlalchemy import text
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, SessionLocal
from .models import Base
from .seed import seed_if_empty
from .routers import projects, tasks, checklists, timeline, activity, files, templates, calendar, closing_pack

app = FastAPI(title="LawFlow API", version="0.1.0")

origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_bg_color_column()
    db = SessionLocal()
    try:
        seed_if_empty(db)
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
