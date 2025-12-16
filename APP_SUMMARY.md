# LawFlow — App Summary

LawFlow is a **matter-centric workflow CRM** for a small legal team handling **Spanish real-estate purchases and sales** (Costa del Sol).  
It is built to showcase an **innovative, modern SaaS UI** (Monday/Asana-inspired) while remaining straightforward to extend.

## Target users
- Small law firm team (≈ 5 users)
- Conveyancing / property transaction workflows:
  - Purchase (buyer-side)
  - Sale (seller-side)
  - Post-completion work (taxes, registry, utilities/HOA)

## Core concepts
- **Project (Matter):** a single property transaction case
- **Tasks:** operational steps, assigned to staff, with due dates and priorities
- **Checklist:** standardized Spanish legal checklists per transaction type
- **Timeline:** phases (Intake/DD/Contracts/Notary/Registry) + milestone (target completion)
- **Files:** a “file room” per matter (uploads + preview)
- **Templates:** municipality-based rules & document template lists
- **Closing Pack:** a generated ZIP summarizing the transaction readiness + documents
- **Activity:** audit-ish feed for major actions/events

## Key UX flows
1. **Pick an active matter** → pinned/recent items help you navigate quickly.
2. Work is shown in multiple views:
   - Board (Kanban)
   - Table
   - Timeline
   - Calendar (deadlines + alerts)
3. Upload and review documents in **Files** (drag & drop + preview drawer).
4. Use **Templates** to see municipality-specific requirements.
5. Generate a **Closing Pack** using a stepper wizard with readiness gating.
6. Use **Ctrl+K** global search across tasks/files/checklist.
7. Switch UI language EN/ES and tweak platform visuals in **Settings**.

## What’s “demo-realistic” vs. “production-ready”
- UI patterns and flows are production-like.
- Data persistence is real (SQLite) and endpoints are functional.
- Some seeded items are intentionally simplified:
  - municipality templates are hard-coded demo rules
  - closing-pack readiness is heuristic, not a full legal engine
  - seeded files may be metadata-only (upload real content to preview)

## Why this architecture works
- **Fast iteration**: SQLite + simple routers + typed API calls
- **Extensible**: easy to add more workflows (tax filing, registry submissions, utilities transfers)
- **Demo-friendly**: the seed data intentionally triggers:
  - overdue tasks (alerts)
  - different phases and risks
  - different municipalities for template comparison
