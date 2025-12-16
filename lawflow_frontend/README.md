# LawFlow Frontend (React + TypeScript)

A UX-polished prototype for a small law firm managing **property purchases & sales in Costa del Sol**.

## Views
- **Board**: drag & drop Kanban
- **Table**: editable monday-style table
- **Timeline**: lightweight Gantt phases + milestones
- **Checklist**: Spanish conveyancing templates (purchase/sale)
- **Activity**: audit-like feed

## Run
```bash
npm install
npm run dev
```
Optional API base:
```bash
# mac/linux
export VITE_API_BASE=http://localhost:8000
# windows (powershell)
$env:VITE_API_BASE="http://localhost:8000"
```

## New in v4
- Calendar + ICS export + deadline alerts
- File room (upload + list)
- Templates by municipality (Marbella/Mijas/Estepona)
- Closing pack generation UX (downloads ZIP from backend)

## New in v5
- Drag & drop uploads + file preview drawer (PDF/images)
- Global search modal (Ctrl+K) across tasks/files/checklist
- Closing pack wizard (Notary → Taxes → Registry → Utilities) with readiness gating + suggested missing items
- Language toggle (EN/ES)
- Improved demo microcopy + callouts
