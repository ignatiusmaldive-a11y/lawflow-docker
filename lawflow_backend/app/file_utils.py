import os
from pathlib import Path
from typing import Optional, List
from fastapi import UploadFile, HTTPException

# File validation constants
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_MIME_TYPES = {
    # Documents
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],

    # Images
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/svg+xml': ['.svg'],
    'image/tiff': ['.tiff', '.tif'],

    # Archives
    'application/zip': ['.zip'],
    'application/x-rar-compressed': ['.rar'],
    'application/x-7z-compressed': ['.7z'],
}

def validate_file(file: UploadFile) -> None:
    """
    Validate file type and size.

    Args:
        file: FastAPI UploadFile object

    Raises:
        HTTPException: If file validation fails
    """
    # Check file size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.0f}MB"
        )

    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file not allowed")

    # Check MIME type
    content_type = file.content_type
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{content_type}' not allowed. Allowed types: {', '.join(ALLOWED_MIME_TYPES.keys())}"
        )

    # Validate file extension matches MIME type
    if file.filename:
        file_ext = Path(file.filename).suffix.lower()
        expected_extensions = ALLOWED_MIME_TYPES.get(content_type, [])

        if file_ext not in expected_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"File extension '{file_ext}' doesn't match MIME type '{content_type}'"
            )

def get_safe_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and other issues.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    if not filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    # Remove path separators and other dangerous characters
    safe_name = filename.replace("/", "_").replace("\\", "_").replace("..", "_")

    # Limit filename length
    if len(safe_name) > 255:
        name_part, ext = os.path.splitext(safe_name)
        safe_name = name_part[:255-len(ext)] + ext

    return safe_name

def is_image_file(mime_type: str) -> bool:
    """Check if file is an image type."""
    return mime_type.startswith('image/')

def is_pdf_file(mime_type: str) -> bool:
    """Check if file is a PDF."""
    return mime_type == 'application/pdf'

def is_office_document(mime_type: str) -> bool:
    """Check if file is an office document."""
    office_types = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    return mime_type in office_types