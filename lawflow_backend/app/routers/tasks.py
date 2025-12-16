from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Task, Activity
from ..schemas import TaskOut, TaskCreate, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=list[TaskOut])
def list_tasks(project_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(Task)
    if project_id is not None:
        q = q.filter(Task.project_id == project_id)
    return q.order_by(Task.due_date.is_(None), Task.due_date.asc()).all()

@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    t = db.get(Task, task_id)
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(t, k, v)
    db.add(Activity(project_id=t.project_id, actor="Ana López", verb="Updated task", detail=t.title))
    db.commit()
    db.refresh(t)
    return t

@router.post("", response_model=TaskOut)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    t = Task(**payload.model_dump())
    db.add(t)
    db.add(Activity(project_id=t.project_id, actor=payload.assignee, verb="Created task", detail=t.title))
    db.commit()
    db.refresh(t)
    return t
