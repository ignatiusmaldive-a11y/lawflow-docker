import os
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
    with engine.connect() as conn:
        cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(projects);")]
        if "bg_color" not in cols:
            conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN bg_color VARCHAR(20) DEFAULT '#0b1220'")

@app.on_event("startup")
def on_startup():
    ensure_bg_color_column()
    Base.metadata.create_all(bind=engine)
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
    return {"ok": True}
