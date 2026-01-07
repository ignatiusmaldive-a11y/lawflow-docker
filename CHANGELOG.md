# LawFlow Changelog

All notable changes to LawFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive troubleshooting section in README
- Enhanced API documentation with request/response examples
- Automated deployment script (`deployment-script.sh`)
- Systemd service files for production deployment
- Nginx reverse proxy configuration
- Health check endpoints (`/health`, `/health/detailed`)
- **AI Assistant (Chat)**: Integrated Google Gemini (2.5-flash) for legal & procedural support.
- **Sectorial Reports (Business Intelligence)**: Market analysis for Marbella, Costa del Sol, and luxury sectors with interactive charts.
- **Polish Agency Directory**: Specialized view for Polish investors.
- **Enhanced Timeline (v2)**: 
  - Integrated location-based public holidays.
  - Added visibility for fiscal obligations and recurring rental tasks directly in the Gantt chart.
  - Restored "Alertas de plazos" (Upcoming deadlines) for active project monitoring.
- **High-Fidelity Polish Samples**: Enriched demo data with realistic activities, NIE applications, bilingual contracts, and translation history for Polish-specific matters.
- **General Overview**: New portfolio-wide dashboard.
- **Footer Component**: Standardized footer across new landing views.

### Fixed
- **Connectivity**: Resolved Vite proxy `ECONNREFUSED` by switching from `localhost` to `127.0.0.1` in `vite.config.ts`.
- **UI Stability**: Reverted experimental internal API calls in `Cronograma.tsx` for a more stable prop-driven architecture.
- **Seeding**: Fixed idempotent seeding of Polish projects to ensure data is populated even if the database was partially existing.

### Changed
- Updated deployment documentation to reflect systemd-based setup (replacing Docker instructions)
- Updated prerequisites to require Python 3.11+ and Node.js 18+
- Consolidated deployment information across multiple documents
- Improved README structure and clarity
- Refined the **Agencias Polacas** view: dashboard widgets now stay on the main page and the table spacing/text weight were tuned for a tighter directory layout.

### Fixed
- Database column handling in `main.py` - added error handling for `bg_color` column creation
- Startup sequence ordering to create tables before checking columns
- Added `psycopg2-binary` dependency for PostgreSQL support

### Technical Details

#### Backend Fixes (December 2025)
- **File**: `lawflow_backend/app/main.py`
  - Fixed `ensure_bg_color_column()` function to handle cases where projects table doesn't exist yet
  - Added try/catch block around column alteration
  - Reordered startup sequence: `create_all()` before `ensure_bg_color_column()`

- **File**: `lawflow_backend/pyproject.toml`
  - Added `psycopg2-binary>=2.9` to dependencies for PostgreSQL compatibility

#### Deployment Improvements
- **File**: `production/lawflow-backend.service`
  - Systemd service for backend (port 8000)
  - SQLite database support by default
  - Environment variable configuration

- **File**: `production/lawflow-frontend.service`
  - Systemd service for frontend (port 8080)
  - Node.js preview server configuration

- **File**: `production/nginx.conf`
  - Reverse proxy configuration
  - Routes `/` to frontend, `/api/` to backend

- **File**: `deployment-script.sh`
  - Automated setup script handling dependencies, builds, and service configuration
  - Update functionality for deployment maintenance

## [0.1.0] - 2025-12-XX

### Added
- Initial release of LawFlow CRM
- Matter (project) management with visual context switching
- Task tracking with Kanban board, table, and timeline views
- File room with drag-and-drop uploads and preview
- Calendar integration with ICS export
- Municipality-based templates for Spanish real estate
- Closing pack generation with readiness gating
- Global search across tasks, files, and checklist items
- Bilingual interface (English/Spanish)
- Platform settings for customization
- FastAPI backend with SQLAlchemy ORM
- React/TypeScript frontend with Vite
- SQLite database with PostgreSQL support
- Comprehensive seed data for demonstration

### Technical Stack
- **Backend**: FastAPI, SQLAlchemy, Pydantic, SQLite/PostgreSQL
- **Frontend**: React 18, TypeScript, Vite, DnD Kit
- **Deployment**: Systemd services, Nginx reverse proxy
- **Development**: Automated setup scripts and documentation

---

## Types of changes
- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` in case of vulnerabilities
