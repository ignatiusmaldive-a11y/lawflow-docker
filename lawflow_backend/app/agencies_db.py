import os
from pathlib import Path

from sqlalchemy import create_engine


def _default_agencies_db_path() -> Path:
    # Repo layout: <repo>/lawflow_backend/app/agencies_db.py
    repo_root = Path(__file__).resolve().parents[2]
    return repo_root / "agencies-data" / "agencies.db"


AGENCIES_DB_PATH = Path(os.getenv("AGENCIES_DB_PATH", str(_default_agencies_db_path()))).expanduser().resolve()
AGENCIES_DATABASE_URL = os.getenv("AGENCIES_DATABASE_URL", f"sqlite:///{AGENCIES_DB_PATH}")

agencies_engine = create_engine(
    AGENCIES_DATABASE_URL,
    connect_args={"check_same_thread": False} if AGENCIES_DATABASE_URL.startswith("sqlite") else {},
    future=True,
)

