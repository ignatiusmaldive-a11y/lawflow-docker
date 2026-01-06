from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import FiscalObligation
from ..schemas import FiscalObligationOut

router = APIRouter(prefix="/fiscal", tags=["Fiscal"])

@router.get("", response_model=List[FiscalObligationOut])
def get_fiscal_obligations(project_id: int = None, db: Session = Depends(get_db)):
    query = db.query(FiscalObligation)
    if project_id:
        query = query.filter(FiscalObligation.project_id == project_id)
    return query.all()

@router.get("/{id}", response_model=FiscalObligationOut)
def get_fiscal_obligation(id: int, db: Session = Depends(get_db)):
    obj = db.get(FiscalObligation, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Obligación fiscal no encontrada")
    return obj

@router.patch("/{id}", response_model=FiscalObligationOut)
def update_fiscal_obligation(id: int, payload: dict, db: Session = Depends(get_db)):
    obj = db.get(FiscalObligation, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Obligación fiscal no encontrada")
    
    for key, value in payload.items():
        if hasattr(obj, key):
            setattr(obj, key, value)
    
    db.commit()
    db.refresh(obj)
    return obj
