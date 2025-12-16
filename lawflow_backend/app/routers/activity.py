from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Activity
from ..schemas import ActivityOut

router = APIRouter(prefix="/activity", tags=["activity"])

@router.get("", response_model=list[ActivityOut])
def list_activity(project_id: int, db: Session = Depends(get_db)):
    return db.query(Activity).filter(Activity.project_id == project_id).order_by(Activity.created_at.desc()).limit(100).all()
