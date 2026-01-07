from datetime import datetime

from fastapi import FastAPI

from .routers import agencies

app = FastAPI(title="LawFlow Agencies API", version="0.1.0")

app.include_router(agencies.router)


@app.get("/health")
def health():
    return {"ok": True, "timestamp": datetime.now().isoformat(), "version": "0.1.0"}

