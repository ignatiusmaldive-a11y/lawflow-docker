from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from zipfile import ZipFile, ZIP_DEFLATED
from datetime import datetime
from ..db import get_db
from ..models import Project, Task, ChecklistItem

router = APIRouter(prefix="/closing-pack", tags=["closing-pack"])

def md(title: str, body: str) -> str:
    return f"# {title}\n\n{body}\n"

@router.get("/{project_id}")
def generate(project_id: int, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        return {"error": "Project not found"}

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    checklist = db.query(ChecklistItem).filter(ChecklistItem.project_id == project_id).all()

    buf = BytesIO()
    with ZipFile(buf, "w", ZIP_DEFLATED) as z:
        z.writestr("00_Project_Summary.md", md("Project summary", f"""**Matter:** {p.title}
**Client:** {(p.client.name if p.client else '—')}
**Type:** {p.transaction_type}
**Location:** {p.location}
**Status:** {p.status}
**Target close:** {p.target_close_date}
"""))

        # Completion agenda
        agenda = "\n".join([
            "- Confirm notary appointment (Escritura) time & attendees",
            "- Confirm funds routing / completion statement approved",
            "- Confirm IDs/NIE and powers of attorney if applicable",
            "- Confirm taxes filing plan (ITP/AJD / Plusvalía)",
            "- Confirm post-completion: Land Registry submission + utilities/HOA notifications",
        ])
        z.writestr("01_Notary_Agenda.md", md("Notary agenda (Escritura)", agenda))

        # Checklist export
        by_stage = {}
        for it in checklist:
            by_stage.setdefault(it.stage, []).append(it)
        lines = []
        for stage, items in by_stage.items():
            lines.append(f"## {stage}")
            for it in items:
                lines.append(f"- [{'x' if it.is_done else ' '}] {it.label} (due: {it.due_date})")
            lines.append("")
        z.writestr("02_Conveyancing_Checklist.md", "# Conveyancing checklist\n\n" + "\n".join(lines))

        # Open tasks
        open_tasks = [t for t in tasks if t.status != "Done"]
        tlines = ["| Task | Assignee | Due | Priority |", "|---|---|---|---|"]
        for t in open_tasks:
            tlines.append(f"| {t.title} | {t.assignee} | {t.due_date} | {t.priority} |")
        z.writestr("03_Open_Tasks.md", "# Open tasks\n\n" + "\n".join(tlines) + "\n")

        # Closing pack manifest
        z.writestr("manifest.json", f"""{{
  "generated_at": "{datetime.utcnow().isoformat()}Z",
  "project_id": {p.id},
  "title": "{p.title.replace('"','\\\"')}",
  "includes": ["00_Project_Summary.md","01_Notary_Agenda.md","02_Conveyancing_Checklist.md","03_Open_Tasks.md"]
}}""")

    buf.seek(0)
    filename = f"closing_pack_project_{project_id}.zip"
    return StreamingResponse(buf, media_type="application/zip", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
