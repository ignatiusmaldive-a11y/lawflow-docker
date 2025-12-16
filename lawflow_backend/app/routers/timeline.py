from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import TimelineItem
from ..schemas import TimelineItemOut

router = APIRouter(prefix="/timeline", tags=["timeline"])

@router.get("", response_model=list[TimelineItemOut])
def list_timeline(project_id: int, db: Session = Depends(get_db)):
    return db.query(TimelineItem).filter(TimelineItem.project_id == project_id).order_by(TimelineItem.start_date.asc()).all()
