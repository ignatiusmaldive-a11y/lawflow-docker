from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import ChecklistTemplate
from ..schemas import ChecklistTemplateOut

router = APIRouter(prefix="/checklist-templates", tags=["Checklist Templates"])

@router.get("", response_model=List[ChecklistTemplateOut])
def get_templates(db: Session = Depends(get_db)):
    return db.query(ChecklistTemplate).all()

@router.get("/{id}", response_model=ChecklistTemplateOut)
def get_template(id: int, db: Session = Depends(get_db)):
    obj = db.get(ChecklistTemplate, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    return obj
