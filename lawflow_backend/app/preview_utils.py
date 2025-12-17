import os
import io
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image
import fitz  # PyMuPDF for PDF processing
from .file_utils import is_image_file, is_pdf_file

PREVIEW_DIR = Path("./previews")
THUMBNAIL_DIR = Path("./thumbnails")

PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)

# Preview dimensions
THUMBNAIL_SIZE = (200, 200)
PREVIEW_SIZE = (800, 600)

def generate_image_thumbnail(image_path: Path, output_path: Path) -> bool:
    """
    Generate a thumbnail for an image file.

    Args:
        image_path: Path to the source image
        output_path: Path where to save the thumbnail

    Returns:
        True if successful, False otherwise
    """
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # Create thumbnail
            img.thumbnail(THUMBNAIL_SIZE)

            # Save as JPEG
            img.save(output_path, "JPEG", quality=85)
            return True
    except Exception as e:
        print(f"Error generating thumbnail for {image_path}: {e}")
        return False

def generate_image_preview(image_path: Path, output_path: Path) -> bool:
    """
    Generate a preview for an image file.

    Args:
        image_path: Path to the source image
        output_path: Path where to save the preview

    Returns:
        True if successful, False otherwise
    """
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # Resize maintaining aspect ratio
            img.thumbnail(PREVIEW_SIZE, Image.Resampling.LANCZOS)

            # Save as JPEG
            img.save(output_path, "JPEG", quality=90)
            return True
    except Exception as e:
        print(f"Error generating preview for {image_path}: {e}")
        return False

def generate_pdf_preview(pdf_path: Path, output_path: Path) -> bool:
    """
    Generate a preview image from the first page of a PDF.

    Args:
        pdf_path: Path to the PDF file
        output_path: Path where to save the preview

    Returns:
        True if successful, False otherwise
    """
    try:
        doc = fitz.open(pdf_path)
        if doc.page_count == 0:
            return False

        # Get first page
        page = doc[0]

        # Render page to image
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x scaling for better quality

        # Convert to PIL Image
        img = Image.open(io.BytesIO(pix.tobytes("png")))

        # Resize maintaining aspect ratio
        img.thumbnail(PREVIEW_SIZE, Image.Resampling.LANCZOS)

        # Save as JPEG
        img.save(output_path, "JPEG", quality=90)

        doc.close()
        return True
    except Exception as e:
        print(f"Error generating PDF preview for {pdf_path}: {e}")
        return False

def generate_previews(file_path: Path, mime_type: str, base_filename: str) -> Tuple[Optional[str], Optional[str]]:
    """
    Generate thumbnail and preview for a file.

    Args:
        file_path: Path to the uploaded file
        mime_type: MIME type of the file
        base_filename: Base filename for generating preview paths

    Returns:
        Tuple of (thumbnail_path, preview_path), None if not generated
    """
    thumbnail_path = None
    preview_path = None

    # Generate previews based on file type
    if is_image_file(mime_type):
        # Generate thumbnail
        thumb_filename = f"{base_filename}_thumb.jpg"
        thumb_path = THUMBNAIL_DIR / thumb_filename
        if generate_image_thumbnail(file_path, thumb_path):
            thumbnail_path = str(thumb_path)

        # Generate preview (only for large images)
        try:
            with Image.open(file_path) as img:
                if max(img.size) > max(THUMBNAIL_SIZE):
                    preview_filename = f"{base_filename}_preview.jpg"
                    preview_path_full = PREVIEW_DIR / preview_filename
                    if generate_image_preview(file_path, preview_path_full):
                        preview_path = str(preview_path_full)
        except Exception:
            pass

    elif is_pdf_file(mime_type):
        # Generate PDF preview
        preview_filename = f"{base_filename}_preview.jpg"
        preview_path_full = PREVIEW_DIR / preview_filename
        if generate_pdf_preview(file_path, preview_path_full):
            preview_path = str(preview_path_full)

    return thumbnail_path, preview_path

def cleanup_previews(thumbnail_path: Optional[str], preview_path: Optional[str]):
    """
    Clean up preview files.

    Args:
        thumbnail_path: Path to thumbnail file
        preview_path: Path to preview file
    """
    for path in [thumbnail_path, preview_path]:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception as e:
                print(f"Error removing preview file {path}: {e}")