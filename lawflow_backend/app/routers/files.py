from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from ..db import get_db
from ..models import FileItem, Activity
from ..schemas import FileItemOut

router = APIRouter(prefix="/files", tags=["files"])

UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("", response_model=list[FileItemOut])
def list_files(project_id: int, db: Session = Depends(get_db)):
    return db.query(FileItem).filter(FileItem.project_id == project_id).order_by(FileItem.uploaded_at.desc()).all()

@router.post("/upload", response_model=FileItemOut)
def upload_file(
    project_id: int = Form(...),
    uploader: str = Form("Ana López"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")
    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    dest = UPLOAD_DIR / f"{project_id}__{safe_name}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    item = FileItem(
        project_id=project_id,
        filename=safe_name,
        stored_path=str(dest),
        mime_type=file.content_type,
        uploader=uploader,
    )
    db.add(item)
    db.add(Activity(project_id=project_id, actor=uploader, verb="Uploaded file", detail=safe_name))
    db.commit()
    db.refresh(item)
    return item

@router.get("/download/{file_id}")
def download(file_id: int, db: Session = Depends(get_db)):
    item = db.get(FileItem, file_id)
    if not item:
        raise HTTPException(status_code=404, detail="File not found")
    path = Path(item.stored_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="File content not available (seed metadata only). Upload a real file to preview/download.")
    return FileResponse(path, filename=item.filename, media_type=item.mime_type or "application/octet-stream")
