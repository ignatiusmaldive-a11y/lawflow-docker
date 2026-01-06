from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import RecurringTask
from ..schemas import RecurringTaskOut

router = APIRouter(prefix="/recurring-tasks", tags=["Recurring Tasks"])

@router.get("", response_model=List[RecurringTaskOut])
def get_recurring_tasks(project_id: int = None, db: Session = Depends(get_db)):
    query = db.query(RecurringTask)
    if project_id:
        query = query.filter(RecurringTask.project_id == project_id)
    return query.all()

@router.get("/{id}", response_model=RecurringTaskOut)
def get_recurring_task(id: int, db: Session = Depends(get_db)):
    obj = db.get(RecurringTask, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tarea recurrente no encontrada")
    return obj

@router.patch("/{id}", response_model=RecurringTaskOut)
def update_recurring_task(id: int, payload: dict, db: Session = Depends(get_db)):
    obj = db.get(RecurringTask, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Tarea recurrente no encontrada")
    
    for key, value in payload.items():
        if hasattr(obj, key):
            setattr(obj, key, value)
    
    db.commit()
    db.refresh(obj)
    return obj
