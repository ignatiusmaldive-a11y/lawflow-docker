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
- Python 3.11+ (required by pyproject.toml)
- Node.js 18+
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

This repository includes a production-ready setup using systemd services and Nginx reverse proxy.

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

This script handles:
- System dependency installation (nginx)
- Python virtual environment setup
- Node.js dependencies and frontend build
- Systemd service configuration
- Nginx reverse proxy setup

### Database Support

LawFlow supports both **SQLite** (default) and **PostgreSQL**.

- **SQLite**: Zero-config, data stored in `lawflow_backend/lawflow.db`.
- **PostgreSQL**: Recommended for production. Configure via environment variables:
  ```bash
  export DATABASE_URL="postgresql://user:pass@host:5432/dbname"
  ```

See `config/database/README.md` for detailed database configuration.

### Services

- **Backend**: Runs as a systemd service (`production/lawflow-backend.service`)
- **Frontend**: Runs as a systemd service (`production/lawflow-frontend.service`)
- **Nginx**: Handles routing (`/` -> Frontend on port 8080, `/api` -> Backend on port 8000)

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
Health check: `http://localhost:8000/health`

### Core endpoints

#### Projects (Matters)
- `GET /projects` — list all matters
- `POST /projects` — create new matter
  ```json
  {
    "title": "Purchase - Villa Marina, Marbella",
    "transaction_type": "Purchase",
    "location": "Marbella",
    "status": "Due Diligence",
    "client_id": 1
  }
  ```
- `GET /projects/{id}` — get matter details
- `PATCH /projects/{id}` — update matter (e.g., background color)
  ```json
  {
    "bg_color": "#1a365d"
  }
  ```

#### Tasks
- `GET /tasks?project_id=1` — list tasks for a matter
- `POST /tasks` — create new task
  ```json
  {
    "project_id": 1,
    "title": "Obtain NIE certificate",
    "status": "In Progress",
    "assignee": "Ana López",
    "due_date": "2025-12-31"
  }
  ```
- `PATCH /tasks/{id}` — update task status/fields

#### Checklist
- `GET /checklist?project_id=1` — get checklist items
- `PATCH /checklist/{id}` — toggle checklist item completion

#### Timeline
- `GET /timeline?project_id=1` — get phases and milestones

#### Activity Feed
- `GET /activity?project_id=1` — get recent activity

### Calendar
- `GET /calendar/ics?project_id=1` — download ICS file for calendar integration

### Files
- `GET /files?project_id=1` — list file metadata
- `POST /files/upload` — upload file (multipart/form-data)
  - Form fields: `file`, `project_id`
- `GET /files/download/{file_id}` — download/preview file

### Templates (Municipality Rules)
- `GET /templates?municipality=Marbella&transaction_type=Purchase` — get rules and templates

### Closing Pack
- `GET /closing-pack/{project_id}` — generate and download ZIP file

### Health & Monitoring
- `GET /health` — basic health check
- `GET /health/detailed` — detailed health with component status

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

## Troubleshooting

### Development Issues

**Backend won't start:**
- Check Python version: `python --version` (requires 3.11+)
- Activate virtual environment: `source lawflow_backend/.venv/bin/activate`
- Install dependencies: `pip install -e .`
- Check database: ensure `lawflow_backend/lawflow.db` exists or delete it to reseed

**Frontend won't start:**
- Check Node version: `node --version` (requires 18+)
- Install dependencies: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

**API connection issues:**
- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- Check CORS settings in backend if needed

### Production Issues

**Services won't start:**
```bash
# Check service status
sudo systemctl status lawflow-backend
sudo systemctl status lawflow-frontend
sudo systemctl status nginx

# Check logs
sudo journalctl -u lawflow-backend -f
sudo journalctl -u lawflow-frontend -f
sudo tail -f /var/log/nginx/error.log
```

**Database issues:**
- SQLite: Check file permissions on `lawflow_backend/lawflow.db`
- PostgreSQL: Verify connection string and credentials

**File upload issues:**
- Check permissions on `lawflow_backend/uploads/` directory
- Ensure sufficient disk space

### Common Fixes

**Reset demo data:**
```bash
rm -f lawflow_backend/lawflow.db
# Restart backend to reseed
```

**Update deployment:**
```bash
./deployment-script.sh update
```

**Check system resources:**
```bash
df -h  # Disk space
free -h  # Memory
sudo systemctl status nginx  # Web server
```

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

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and updates.

## License
Demo code — adapt as needed for your project.