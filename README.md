# LawFlow — Real-estate conveyancing CRM (Costa del Sol) · Frontend Demo + FastAPI Backend

LawFlow is a **project-based CRM / matter management** demo tailored for a small real-estate–focused law firm in Spain (purchases & sales, Costa del Sol).  
It combines a modern **Vite + React + TypeScript frontend** with a lightweight **FastAPI + SQLAlchemy + SQLite backend**.

This repo is designed to *look and feel like a polished SaaS*, while keeping implementation simple and easy to extend.

---

## What’s included (demo features)

### Matter (Project) management
- Multiple matters (Purchase/Sale) with realistic seed data
- “Active matter” selector + pinned + recent matters
- Matter header with breadcrumbs + status strip
- **Per-matter background color** (visual context switching)

### Task + process tracking
- Kanban board (drag & drop)
- Table view (filtering + list)
- Timeline view (phases + milestone)
- Deadline KPIs + “Deadline alerts” banner

### Calendar + deadline exports
- Calendar view with upcoming deadlines
- **ICS export** of deadlines + milestones (Google Calendar / Outlook)

### File room
- File list per matter
- Upload via button and **drag & drop**
- **Preview drawer** for PDF / images (for uploaded files)
- Seeded file rows (metadata) to demo list/search (upload real PDFs/images to preview)

### Templates by municipality
- Demo “rules & templates” per municipality:
  - **Marbella**
  - **Mijas**
  - **Estepona**
- Shows checklist overrides + document templates

### Closing pack generation
- “Closing pack” view with:
  - Generate ZIP endpoint
  - **Wizard stepper**: Notary → Taxes → Registry → Utilities
  - **Readiness gating** + auto-suggested missing items (demo logic)

### Global search
- **Ctrl+K / Cmd+K** global search modal across:
  - Tasks
  - Files
  - Checklist items

### Language toggle
- Header toggle switches **EN / ES** (demo i18n)
- Persisted in localStorage

### Platform settings page
- “Settings” view to configure:
  - Default project background color (localStorage)
  - Density (Comfort / Compact) (localStorage)
  - Per-project background color (persisted via backend)

---

## Local development

### 1) Prerequisites
- Python 3.10+ recommended
- Node 18+ recommended
- npm

### 2) Run with the provided script
From repo root (same level as `lawflow_backend/` and `lawflow_frontend/`):

```bash
./run.sh up
```

This will:
- create backend venv (if missing)
- install backend deps (`pip install -e .`)
- install frontend deps (`npm install`)
- start backend on http://localhost:8000 (docs at `/docs`)
- start frontend on http://localhost:5173

### 3) If you need to reseed demo data
The backend seeds only when the DB is empty. To force reseeding:

```bash
rm -f lawflow_backend/lawflow.db
```

Restart `./run.sh up`.

---

## Production Deployment

This repository includes a production-ready setup using Docker (optional), Nginx, and systemd services.

### Deployment Script

A `deployment-script.sh` is provided to automate the setup and update process on a VPS (e.g., Ubuntu).

```bash
# 1. Setup (run once)
./deployment-script.sh setup

# 2. Start services
./deployment-script.sh start

# 3. Update application (pulls git and restarts)
./deployment-script.sh update
```

### Database Support

LawFlow supports both **SQLite** (default) and **PostgreSQL**.

- **SQLite**: Zero-config, data stored in `lawflow_backend/lawflow.db`.
- **PostgreSQL**: Recommended for production. Configure via environment variables:
  ```bash
  export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
  ```

See `config/database/README.md` for detailed database configuration.

### Services

- **Backend**: Runs as a systemd service (`lawflow-backend.service`) or via Docker.
- **Frontend**: Served via Nginx (reverse proxy) or as a service (`lawflow-frontend.service`).
- **Nginx**: Handles routing (`/` -> Frontend, `/api` -> Backend).

---

## Quick tour (how to demo in 2 minutes)

1. **Switch matters** using “Active matter” (sidebar).
2. Open **Files**:
   - drag & drop a PDF → click the row → preview drawer opens.
3. Open **Templates**:
   - switch municipality (Marbella/Mijas/Estepona) and compare rules.
4. Open **Closing pack**:
   - click through the wizard steps and see readiness gating.
5. Press **Ctrl+K** and search for: “NIE”, “Registry”, “Notary”.
6. Toggle **EN/ES** in the header.
7. Open **Settings** and change the project background colors.

---

## Backend API (FastAPI)

Base: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### Core endpoints
- `GET /projects` — list matters
- `POST /projects` — create matter
- `PATCH /projects/{id}` — update matter (e.g. `bg_color`)

- `GET /tasks?project_id=...` — list tasks
- `POST /tasks` — create task

- `GET /checklist?project_id=...` — checklist items
- `GET /timeline?project_id=...` — phases + milestones
- `GET /activity?project_id=...` — activity feed

### Calendar
- `GET /calendar/ics?project_id=...` — ICS file (deadlines + milestones)

### Files
- `GET /files?project_id=...` — list file metadata
- `POST /files/upload` — multipart upload
- `GET /files/download/{file_id}` — download (and preview) uploaded file

### Templates (demo rules)
- `GET /templates?municipality=Marbella&transaction_type=Purchase`

### Closing pack
- `GET /closing-pack/{project_id}` — returns a ZIP (markdown pack + manifest)

---

## Frontend (Vite + React + TypeScript)

Base: `http://localhost:5173`

Key UX patterns included:
- Sidebar + view switch (Board/Table/Timeline/Calendar/Files/Templates/Closing pack/Settings)
- Drawers and modals (preview drawer, global search, new project, quick add)
- Local persistence for UI preferences (language, pinned/recent matters, settings)

---

## Folder structure (high-level)

### Backend (`lawflow_backend/`)
- `app/main.py` — FastAPI app + router registration
- `app/models.py` — SQLAlchemy ORM models
- `app/schemas.py` — Pydantic schemas
- `app/db.py` — SQLAlchemy session + engine
- `app/seed.py` — demo seed data
- `app/routers/` — route modules:
  - `projects.py`, `tasks.py`, `checklists.py`, `timeline.py`, `activity.py`
  - `files.py`, `templates.py`, `calendar.py`, `closing_pack.py`
- `uploads/` — uploaded file storage (created at runtime)

### Frontend (`lawflow_frontend/`)
- `src/ui/App.tsx` — main shell + routing between views
- `src/ui/Board.tsx` — Kanban board (DnD)
- `src/ui/*View.tsx` — table/timeline/calendar/templates/closing pack/settings/etc.
- `src/ui/components/` — Drawer, Modal, Callout
- `src/lib/api.ts` — typed API helpers
- `src/lib/i18n.tsx` — minimal EN/ES i18n provider

---

## Implementation notes (intentional demo tradeoffs)
- **Database**: SQLite is used by default for simplicity (single-file DB), but the app is fully compatible with **PostgreSQL** for production.
- File uploads store content in `uploads/` and metadata in DB.
- Some seeded files are “metadata-only” (no real content) to demo UI.
- The i18n system is intentionally minimal (key-based dictionary).
- The closing-pack “readiness” is a **demo heuristic** (easy to swap for real logic).

---

## Next upgrades (optional roadmap)
- Persist Kanban DnD updates to backend (task status changes)
- Multi-file upload queue + progress + server-side virus scanning hooks
- Real document templates storage (DOCX/PDF) + merge fields
- Calendar sync via OAuth (Google/Microsoft) instead of ICS
- Role-based permissions + audit trails
- Full-text search (SQLite FTS / Postgres) + global index
- Document checklists per municipality editable via admin UI

---

## License
Demo code — adapt as needed for your project.
