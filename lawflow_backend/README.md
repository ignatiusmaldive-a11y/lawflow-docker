# LawFlow Backend (FastAPI)

## Run
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -U pip
pip install -e .
uvicorn app.main:app --reload --port 8000
```

- Swagger: http://localhost:8000/docs
- Health: http://localhost:8000/health

SQLite DB file is created in this folder: `lawflow.db`.
Seeds demo data on first run.

## New endpoints
- GET /files?project_id=
- POST /files/upload (multipart)
- GET /templates?municipality=&transaction_type=
- GET /calendar/ics?project_id=
- GET /closing-pack/{project_id}
