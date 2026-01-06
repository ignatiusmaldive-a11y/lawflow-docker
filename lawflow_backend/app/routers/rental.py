from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db import get_db
from ..models import RentalManagement
from ..schemas import RentalManagementOut

router = APIRouter(prefix="/rental", tags=["Rental Management"])

@router.get("", response_model=List[RentalManagementOut])
def get_rental_managements(project_id: int = None, db: Session = Depends(get_db)):
    query = db.query(RentalManagement)
    if project_id:
        query = query.filter(RentalManagement.project_id == project_id)
    return query.all()

@router.get("/{id}", response_model=RentalManagementOut)
def get_rental_management(id: int, db: Session = Depends(get_db)):
    obj = db.get(RentalManagement, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Gestión de alquiler no encontrada")
    return obj

@router.patch("/{id}", response_model=RentalManagementOut)
def update_rental_management(id: int, payload: dict, db: Session = Depends(get_db)):
    obj = db.get(RentalManagement, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Gestión de alquiler no encontrada")
    
    for key, value in payload.items():
        if hasattr(obj, key):
            setattr(obj, key, value)
    
    db.commit()
    db.refresh(obj)
    return obj
