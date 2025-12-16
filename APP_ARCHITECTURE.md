# LawFlow — App Architecture (Frontend + Backend)

This document describes the architecture and how data flows through LawFlow.

---

## 1) System overview

**Frontend**
- Vite + React + TypeScript
- Single-page application with internal “view switching”
- Local UI state stored in React + localStorage (language, pinned/recent, settings)

**Backend**
- FastAPI
- SQLAlchemy ORM
- SQLite database
- Simple routers per domain
- File uploads stored on disk (uploads/) + metadata in DB

---

## 2) Key modules

### Backend module map
- `app/main.py`
  - creates FastAPI app
  - includes routers
- `app/db.py`
  - SQLAlchemy engine/session
- `app/models.py`
  - ORM models (Projects/Tasks/Checklist/Timeline/Files/Activity)
- `app/schemas.py`
  - Pydantic request/response schemas
- `app/seed.py`
  - seeds realistic demo data when DB is empty
- `app/routers/*`
  - `projects.py` — list/create/update matters
  - `tasks.py` — list/create tasks
  - `checklists.py` — list checklist items
  - `timeline.py` — list phases/milestones
  - `activity.py` — activity feed
  - `files.py` — list/upload/download files
  - `templates.py` — municipality “template rules” (demo)
  - `calendar.py` — ICS export
  - `closing_pack.py` — ZIP generation

### Frontend module map
- `src/ui/App.tsx`
  - main shell layout
  - fetches project list and selected matter data
  - controls view selection (Board/Table/Timeline/Calendar/Files/Templates/Closing Pack/Settings)
  - holds modals (New project, Quick add, Global search)
- `src/lib/api.ts`
  - typed helper functions (fetch wrappers)
  - grouped API helpers: `api`, `api2`, `api3`
- `src/lib/i18n.tsx`
  - dictionary-based i18n provider (EN/ES)
- `src/ui/Board.tsx`
  - Kanban DnD board (columns, cards, drag handlers)
- `src/ui/*`
  - `Table.tsx`, `Timeline.tsx`, `CalendarView.tsx`, `FilesRoom.tsx`, `TemplatesView.tsx`
  - `ClosingPackWizard.tsx`, `SettingsView.tsx`
- `src/ui/components/*`
  - `Drawer.tsx`, `Modal.tsx`, `Callout.tsx`

---

## 3) Data model (conceptual)

### Project (Matter)
Fields (representative):
- id, title, transaction_type (Purchase/Sale), location (Marbella/Mijas/Estepona)
- status, risk, start_date, target_close_date
- **bg_color** (per-matter background color)
- client_id relationship

### Task
- id, project_id
- title, status (Backlog/In Progress/Review/Done)
- assignee, due_date, priority, tags, description

### ChecklistItem
- id, project_id
- stage (Intake/DD/Contracts/Notary/Closing/Registry)
- label, is_done, due_date

### TimelineItem
- id, project_id
- label, start_date, end_date
- kind (Phase/Milestone)

### FileItem
- id, project_id
- filename, mime_type, stored_path
- uploader, uploaded_at

### Activity
- id, project_id
- actor, verb, detail, created_at

---

## 4) Core data flows

### Initial load
1. Frontend calls `GET /projects`
2. Select first project as active (or persist last used if desired)
3. For active project, load:
   - `GET /tasks?project_id=...`
   - `GET /checklist?project_id=...`
   - `GET /timeline?project_id=...`
   - `GET /activity?project_id=...`
   - `GET /files?project_id=...`

### Board drag & drop (Kanban)
- UI updates task status locally after DnD.
- (Optional upgrade) persist to backend via PATCH/PUT task endpoint.

### Global search (Ctrl+K)
- Searches across already-loaded datasets:
  - tasks + files + checklist
- Navigates user to the relevant view (Table/Files/Board)

### File upload & preview
- Upload: `POST /files/upload` (multipart)
- Backend stores file content in `uploads/` and inserts FileItem in DB
- Preview/download: `GET /files/download/{file_id}`
- Frontend drawer previews PDF/images inline via iframe/img

### Calendar (ICS)
- `GET /calendar/ics?project_id=...`
- Backend generates text/calendar response containing:
  - Task due dates
  - Timeline milestones

### Templates by municipality
- `GET /templates?municipality=...&transaction_type=...`
- Returns hard-coded demo rule set
- Frontend displays checklist overrides and document templates list

### Closing pack generation
- Frontend wizard computes “readiness” heuristics:
  - overdue task count
  - checklist completion thresholds by stage
- If “ready”, user can download ZIP:
  - `GET /closing-pack/{project_id}`
- Backend generates ZIP with markdown docs + manifest.json

### Settings & appearance
- Platform settings stored in localStorage (default bg color, density)
- Per-project background color persisted via:
  - `PATCH /projects/{id}` with `{ bg_color }`
- App applies background via active project’s `bg_color` fallback to platform default

---

## 5) Extension points (where to add real production logic)

### Municipality templates
Replace hard-coded dictionary with:
- DB-backed templates
- Admin UI editor
- Versioning per municipality + date range
- Support “template packs” per transaction type

### Closing pack content
Current ZIP contains markdown. In production, consider:
- PDF/DOCX generation (server-side)
- Merge fields with client/project data
- Include uploaded files and a manifest

### Search
Current search is in-memory. For production:
- SQLite FTS or Postgres full-text search
- background indexing and ranking
- permission-aware results

### Audit & permissions
Activity feed is a demo. For production:
- RBAC (roles + scopes)
- immutable audit trail
- per-client privacy boundaries

---

## 6) Non-goals (by design)
- No complex auth/OAuth flows (keeps demo friction low)
- No heavy state management library (keeps code approachable)
- No background job queue (though it’s a natural next step for document generation, reminders, etc.)
