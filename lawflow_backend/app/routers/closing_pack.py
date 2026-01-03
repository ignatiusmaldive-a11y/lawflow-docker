from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from zipfile import ZipFile, ZIP_DEFLATED
from datetime import datetime
import json
from ..db import get_db
from ..models import Project, Task, ChecklistItem

router = APIRouter(prefix="/closing-pack", tags=["closing-pack"])

def md(title: str, body: str) -> str:
    return f"# {title}\n\n{body}\n"

@router.get("/{project_id}")
def generate(project_id: int, lang: str = "es", db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        return {"error": "Proyecto no encontrado" if lang != "en" else "Project not found"}

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    checklist = db.query(ChecklistItem).filter(ChecklistItem.project_id == project_id).all()

    is_en = lang == "en"

    fn_summary = "00_Project_Summary.md" if is_en else "00_Resumen_Asunto.md"
    fn_agenda = "01_Notary_Agenda.md" if is_en else "01_Agenda_Notaria.md"
    fn_checklist = "02_Conveyancing_Checklist.md" if is_en else "02_Checklist_Compraventa.md"
    fn_tasks = "03_Open_Tasks.md" if is_en else "03_Tareas_Abiertas.md"

    buf = BytesIO()
    with ZipFile(buf, "w", ZIP_DEFLATED) as z:
        z.writestr(
            fn_summary,
            md(
                "Project summary" if is_en else "Resumen del asunto",
                f"""**{'Matter' if is_en else 'Asunto'}:** {p.title}
**{'Client' if is_en else 'Cliente'}:** {(p.client.name if p.client else '—')}
**{'Type' if is_en else 'Tipo'}:** {p.transaction_type}
**{'Location' if is_en else 'Ubicación'}:** {p.location}
**{'Status' if is_en else 'Estado'}:** {p.status}
**{'Target close' if is_en else 'Objetivo cierre'}:** {p.target_close_date}
""",
            ),
        )

        # Completion agenda
        agenda = "\n".join(
            [
                "- Confirm notary appointment (Escritura) time & attendees"
                if is_en
                else "- Confirmar hora y asistentes de la cita notarial (Escritura)",
                "- Confirm funds routing / completion statement approved"
                if is_en
                else "- Confirmar ruta de fondos / estado de liquidación aprobado",
                "- Confirm IDs/NIE and powers of attorney if applicable"
                if is_en
                else "- Confirmar IDs/NIE y poderes si aplica",
                "- Confirm taxes filing plan (ITP/AJD / Plusvalía)"
                if is_en
                else "- Confirmar plan de impuestos (ITP/AJD / Plusvalía)",
                "- Confirm post-completion: Land Registry submission + utilities/HOA notifications"
                if is_en
                else "- Confirmar post-cierre: presentación en Registro + avisos a suministros/comunidad",
            ]
        )
        z.writestr(fn_agenda, md("Notary agenda (Escritura)" if is_en else "Agenda notarial (Escritura)", agenda))

        # Checklist export
        by_stage = {}
        for it in checklist:
            by_stage.setdefault(it.stage, []).append(it)
        lines = []
        for stage, items in by_stage.items():
            lines.append(f"## {stage}")
            for it in items:
                if is_en:
                    lines.append(f"- [{'x' if it.is_done else ' '}] {it.label} (due: {it.due_date})")
                else:
                    lines.append(f"- [{'x' if it.is_done else ' '}] {it.label} (vence: {it.due_date})")
            lines.append("")
        z.writestr(
            fn_checklist,
            ("# Conveyancing checklist\n\n" if is_en else "# Checklist de compraventa\n\n") + "\n".join(lines),
        )

        # Open tasks
        open_tasks = [t for t in tasks if t.status != ("Done" if is_en else "Hecho")]
        tlines = [
            "| Task | Assignee | Due | Priority |" if is_en else "| Tarea | Responsable | Vence | Prioridad |",
            "|---|---|---|---|",
        ]
        for t in open_tasks:
            tlines.append(f"| {t.title} | {t.assignee} | {t.due_date} | {t.priority} |")
        z.writestr(fn_tasks, ("# Open tasks\n\n" if is_en else "# Tareas abiertas\n\n") + "\n".join(tlines) + "\n")

        # Closing pack manifest
        includes = [fn_summary, fn_agenda, fn_checklist, fn_tasks]
        z.writestr("manifest.json", f"""{{
  "generated_at": "{datetime.utcnow().isoformat()}Z",
  "project_id": {p.id},
  "title": "{p.title.replace('"','\\\"')}",
  "includes": {json.dumps(includes)}
}}""")

    buf.seek(0)
    filename = f"closing_pack_project_{project_id}.zip"
    return StreamingResponse(buf, media_type="application/zip", headers={"Content-Disposition": f'attachment; filename="{filename}"'})
