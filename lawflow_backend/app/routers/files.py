from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from ..db import get_db
from ..models import FileItem, Activity
from ..schemas import FileItemOut

router = APIRouter(prefix="/files", tags=["files"])

BASE_DIR = Path(__file__).resolve().parents[2]  # lawflow_backend/
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def _is_within(child: Path, parent: Path) -> bool:
    parent = parent.resolve()
    child = child.resolve()
    return child == parent or parent in child.parents

def _resolve_stored_path(stored_path: str) -> Path:
    p = Path(stored_path)

    # Absolute paths are allowed only if they stay within known storage dirs.
    if p.is_absolute():
        resolved = p.resolve()
        allowed = [
            BASE_DIR / "uploads",
            BASE_DIR / "seed",
            BASE_DIR.parent / "uploads",
            BASE_DIR.parent / "seed",
        ]
        if not any(_is_within(resolved, root) for root in allowed):
            raise HTTPException(status_code=400, detail="Ruta de archivo inválida")
        return resolved

    # Reject traversal for relative stored paths.
    if any(part == ".." for part in p.parts):
        raise HTTPException(status_code=400, detail="Ruta de archivo inválida")

    # Prefer backend-root relative paths, but keep compatibility with older paths
    # that were stored relative to the repo root (process CWD).
    candidates: list[Path] = []
    for base in (BASE_DIR, BASE_DIR.parent):
        cand = (base / p).resolve()
        if _is_within(cand, base / "uploads") or _is_within(cand, base / "seed"):
            candidates.append(cand)

    if not candidates:
        raise HTTPException(status_code=400, detail="Ruta de archivo inválida")

    for cand in candidates:
        if cand.exists():
            return cand
    return candidates[0]

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
        raise HTTPException(status_code=400, detail="Falta el nombre de archivo")
    safe_name = file.filename.replace("/", "_").replace("\\", "_")
    dest = UPLOAD_DIR / f"{project_id}__{safe_name}"
    with dest.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    item = FileItem(
        project_id=project_id,
        filename=safe_name,
        stored_path=str(dest.relative_to(BASE_DIR)),
        mime_type=file.content_type,
        uploader=uploader,
    )
    db.add(item)
    db.add(Activity(project_id=project_id, actor=uploader, verb="Archivo subido", detail=safe_name))
    db.commit()
    db.refresh(item)
    return item

@router.get("/download/{file_id}")
def download(file_id: int, db: Session = Depends(get_db)):
    item = db.get(FileItem, file_id)
    if not item:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    path = _resolve_stored_path(item.stored_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Contenido no disponible (solo metadatos de demo). Sube un archivo real para previsualizar/descargar.")
    return FileResponse(
        path,
        filename=item.filename,
        media_type=item.mime_type or "application/octet-stream",
        content_disposition_type="attachment",
    )


@router.get("/view/{file_id}")
def view(file_id: int, db: Session = Depends(get_db)):
    item = db.get(FileItem, file_id)
    if not item:
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    path = _resolve_stored_path(item.stored_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Contenido no disponible (solo metadatos de demo). Sube un archivo real para previsualizar/descargar.")
    return FileResponse(
        path,
        filename=item.filename,
        media_type=item.mime_type or "application/octet-stream",
        content_disposition_type="inline",
    )
