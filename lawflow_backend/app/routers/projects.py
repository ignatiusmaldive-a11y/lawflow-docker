import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Activity, Project
from ..schemas import ProjectOut, ProjectCreate, ProjectUpdate, ProjectDetail

router = APIRouter(prefix="/projects", tags=["projects"])

def _slugify(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"[^a-z0-9 _-]", "", s)
    s = s.replace(" ", "-")
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "project"

@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.id.desc()).all()

@router.get("/{project_id}", response_model=ProjectDetail)
def get_project(project_id: int, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Asunto no encontrado")
    return p

@router.post("", response_model=ProjectOut)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    p = Project(**payload.model_dump())
    db.add(p)
    db.add(Activity(project_id=0, actor="System", verb="Asunto creado", detail=p.title))
    db.commit()
    db.refresh(p)
    return p

@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Asunto no encontrado")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(p, k, v)
    db.add(Activity(project_id=p.id, actor="System", verb="Asunto actualizado", detail=", ".join(data.keys()) or "—"))
    db.commit()
    db.refresh(p)
    return p

@router.post("/{project_id}/dropbox/create", response_model=ProjectOut)
def create_or_assign_dropbox_folder(project_id: int, force: bool = False, db: Session = Depends(get_db)):
    p = db.get(Project, project_id)
    if not p:
        raise HTTPException(status_code=404, detail="Asunto no encontrado")

    if p.dropbox_folder and not force:
        return p

    slug = _slugify(p.title)
    p.dropbox_folder = f"Dropbox/LawFlow/{project_id:04d}-{slug}"
    db.add(Activity(project_id=p.id, actor="System", verb="Dropbox asignado", detail=p.dropbox_folder))
    db.commit()
    db.refresh(p)
    return p
