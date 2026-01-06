import re
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Activity, Project, Client, RentalManagement
from ..schemas import ProjectOut, ProjectCreate, ProjectUpdate, ProjectDetail
from ..services.checklist_engine import auto_populate_checklist, create_linked_tasks
from ..services.fiscal_engine import (
    create_purchase_fiscal_obligations, 
    create_sale_fiscal_obligations,
    create_rental_fiscal_obligations,
    create_ongoing_ibi_obligation
)

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
    # 1. Create the project
    project_data = payload.model_dump()
    is_rental = project_data.pop("is_rental", False)
    
    p = Project(**project_data)
    db.add(p)
    db.flush()  # Get p.id
    
    # 2. Log activity
    db.add(Activity(project_id=p.id, actor="System", verb="Asunto creado", detail=p.title))
    
    # 3. Fetch client for nationality info
    client = db.get(Client, p.client_id)
    if not client:
        # Fallback to default if no client (though schema requires client_id)
        client = Client(nationality="Spanish") 
    
    # 4. Auto-populate checklist
    checklist_items = auto_populate_checklist(p, client, is_rental=is_rental, db=db)
    
    # 5. Create linked tasks
    create_linked_tasks(checklist_items, p, db, client=client)
    
    # 6. Create fiscal obligations based on type
    if p.transaction_type == "Purchase":
        # For demo purposes, assume notary is 30 days from now if not specified
        notary_date = (p.start_date or p.target_close_date or datetime.now()).date()
        create_purchase_fiscal_obligations(p, notary_date, db)
    elif p.transaction_type == "Sale":
        sale_date = (p.start_date or p.target_close_date or datetime.now()).date()
        create_sale_fiscal_obligations(p, sale_date, db)
        
    # 7. Setup rental management if applicable
    if is_rental:
        rental = RentalManagement(
            project_id=p.id,
            rental_status="Setup",
            notes="Configurado automáticamente al crear el proyecto."
        )
        db.add(rental)
        
        # Create rental specific fiscal obligations
        rental_start = (p.target_close_date or datetime.now()).date()
        create_rental_fiscal_obligations(p, client.nationality, rental_start, db)

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
