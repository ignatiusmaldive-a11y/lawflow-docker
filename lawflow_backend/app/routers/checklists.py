from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import ChecklistItem, Activity
from ..schemas import ChecklistItemOut, ChecklistUpdate

router = APIRouter(prefix="/checklists", tags=["checklists"])

@router.get("", response_model=list[ChecklistItemOut])
def list_items(project_id: int, db: Session = Depends(get_db)):
    return db.query(ChecklistItem).filter(ChecklistItem.project_id == project_id).order_by(ChecklistItem.id.asc()).all()

@router.patch("/{item_id}", response_model=ChecklistItemOut)
def toggle_item(item_id: int, payload: ChecklistUpdate, db: Session = Depends(get_db)):
    it = db.get(ChecklistItem, item_id)
    if not it:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    it.is_done = payload.is_done
    db.add(Activity(project_id=it.project_id, actor="Ana López", verb="Checklist updated", detail=it.label))
    db.commit()
    db.refresh(it)
    return it
