from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from datetime import datetime
from ..db import get_db
from ..models import Task, TimelineItem, Project

router = APIRouter(prefix="/calendar", tags=["calendar"])

def ics_escape(s: str) -> str:
    return s.replace('\\', '\\\\').replace(';','\\;').replace(',','\\,').replace('\n','\\n')

@router.get("/ics")
def project_ics(project_id: int, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    milestones = db.query(TimelineItem).filter(TimelineItem.project_id == project_id).all()

    now = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LawFlow//Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]

    def add_event(uid: str, title: str, date_str: str):
        # All-day event
        ds = date_str.replace("-", "")
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{now}",
            f"DTSTART;VALUE=DATE:{ds}",
            f"DTEND;VALUE=DATE:{ds}",
            f"SUMMARY:{ics_escape(title)}",
            "END:VEVENT",
        ])

    if p:
        for t in tasks:
            if t.due_date:
                add_event(f"task-{t.id}@lawflow", f"[Task] {t.title} · {t.assignee}", str(t.due_date))
        for m in milestones:
            if m.kind == "Milestone" and m.start_date:
                add_event(f"milestone-{m.id}@lawflow", f"[Milestone] {m.label}", str(m.start_date))

    lines.append("END:VCALENDAR")
    ics = "\r\n".join(lines) + "\r\n"
    return Response(content=ics, media_type="text/calendar")
