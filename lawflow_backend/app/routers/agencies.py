from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text

from ..agencies_db import AGENCIES_DB_PATH, agencies_engine


router = APIRouter(prefix="/agencies", tags=["agencies"])


class AgencyOut(BaseModel):
    id: int
    name: Optional[str] = None
    type: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    additional_info: Optional[str] = None
    website_status: Optional[str] = None
    polish_city: Optional[str] = None
    cleanup_status: Optional[str] = None
    url_validation_date: Optional[datetime] = None


class PagedAgenciesOut(BaseModel):
    items: list[AgencyOut]
    total: int
    limit: int
    offset: int


class FacetOut(BaseModel):
    value: Optional[str]
    count: int


class AgenciesMetaOut(BaseModel):
    db_path: str
    db_mtime: Optional[datetime] = None
    total_agencies: int


SortField = Literal["name", "type", "polish_city", "website_status", "cleanup_status"]
SortDir = Literal["asc", "desc"]


_SORT_COLUMN = {
    "name": "name",
    "type": "type",
    "polish_city": "polish_city",
    "website_status": "website_status",
    "cleanup_status": "cleanup_status",
}

def _as_db_http_error(e: Exception) -> HTTPException:
    return HTTPException(
        status_code=500,
        detail=f"Agencies DB unavailable or invalid. Set AGENCIES_DB_PATH/AGENCIES_DATABASE_URL. ({type(e).__name__}: {e})",
    )

@router.get("/meta", response_model=AgenciesMetaOut)
def agencies_meta():
    try:
        mtime = None
        try:
            st = AGENCIES_DB_PATH.stat()
            mtime = datetime.fromtimestamp(st.st_mtime)
        except Exception:
            mtime = None

        with agencies_engine.connect() as conn:
            total = int(conn.execute(text("SELECT COUNT(*) FROM agencies")).scalar() or 0)

        return {"db_path": str(AGENCIES_DB_PATH), "db_mtime": mtime, "total_agencies": total}
    except Exception as e:
        raise _as_db_http_error(e)


def _build_where(
    *,
    q: Optional[str],
    types: Optional[list[str]],
    polish_city: Optional[str],
    website_status: Optional[str],
    cleanup_status: Optional[str],
):
    clauses: list[str] = []
    params: dict[str, object] = {}

    if q:
        clauses.append(
            "("
            "LOWER(COALESCE(name,'')) LIKE :q OR "
            "LOWER(COALESCE(type,'')) LIKE :q OR "
            "LOWER(COALESCE(website,'')) LIKE :q OR "
            "LOWER(COALESCE(phone,'')) LIKE :q OR "
            "LOWER(COALESCE(address,'')) LIKE :q OR "
            "LOWER(COALESCE(description,'')) LIKE :q OR "
            "LOWER(COALESCE(polish_city,'')) LIKE :q"
            ")"
        )
        params["q"] = f"%{q.strip().lower()}%"

    if types:
        placeholders = []
        for i, t in enumerate(types):
            key = f"type_{i}"
            placeholders.append(f":{key}")
            params[key] = t
        clauses.append(f"type IN ({', '.join(placeholders)})")

    if polish_city:
        clauses.append("polish_city = :polish_city")
        params["polish_city"] = polish_city

    if website_status:
        clauses.append("website_status = :website_status")
        params["website_status"] = website_status

    if cleanup_status:
        clauses.append("cleanup_status = :cleanup_status")
        params["cleanup_status"] = cleanup_status

    where_sql = " AND ".join(clauses) if clauses else "1=1"
    return where_sql, params


@router.get("", response_model=PagedAgenciesOut)
def list_agencies(
    q: Optional[str] = Query(default=None, description="Free text search"),
    type: Optional[list[str]] = Query(default=None, description="Filter by type; may be repeated"),
    polish_city: Optional[str] = Query(default=None),
    website_status: Optional[str] = Query(default=None),
    cleanup_status: Optional[str] = Query(default=None),
    sort: SortField = Query(default="name"),
    dir: SortDir = Query(default="asc"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    where_sql, params = _build_where(
        q=q,
        types=type,
        polish_city=polish_city,
        website_status=website_status,
        cleanup_status=cleanup_status,
    )

    sort_col = _SORT_COLUMN.get(sort, "name")
    sort_dir = "DESC" if dir == "desc" else "ASC"

    count_sql = text(f"SELECT COUNT(*) AS c FROM agencies WHERE {where_sql}")
    list_sql = text(
        f"""
        SELECT
            id, name, type, website, phone, address, description, additional_info,
            website_status, polish_city, cleanup_status, url_validation_date
        FROM agencies
        WHERE {where_sql}
        ORDER BY {sort_col} {sort_dir}, id ASC
        LIMIT :limit OFFSET :offset
        """
    )

    params_with_page = {**params, "limit": limit, "offset": offset}

    try:
        with agencies_engine.connect() as conn:
            total = int(conn.execute(count_sql, params).scalar() or 0)
            rows = conn.execute(list_sql, params_with_page).mappings().all()
    except Exception as e:
        raise _as_db_http_error(e)

    return {"items": rows, "total": total, "limit": limit, "offset": offset}


@router.get("/types", response_model=list[FacetOut])
def agency_types():
    try:
        with agencies_engine.connect() as conn:
            rows = conn.execute(
                text("SELECT type AS value, COUNT(*) AS count FROM agencies GROUP BY type ORDER BY count DESC, value ASC")
            ).mappings().all()
    except Exception as e:
        raise _as_db_http_error(e)
    return rows


@router.get("/polish-cities", response_model=list[FacetOut])
def polish_cities():
    try:
        with agencies_engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT polish_city AS value, COUNT(*) AS count "
                    "FROM agencies WHERE polish_city IS NOT NULL AND polish_city != '' "
                    "GROUP BY polish_city ORDER BY count DESC, value ASC"
                )
            ).mappings().all()
    except Exception as e:
        raise _as_db_http_error(e)
    return rows


@router.get("/{agency_id}", response_model=AgencyOut)
def get_agency(agency_id: int):
    try:
        with agencies_engine.connect() as conn:
            row = conn.execute(
                text(
                    """
                    SELECT
                        id, name, type, website, phone, address, description, additional_info,
                        website_status, polish_city, cleanup_status, url_validation_date
                    FROM agencies
                    WHERE id = :id
                    """
                ),
                {"id": agency_id},
            ).mappings().first()
    except Exception as e:
        raise _as_db_http_error(e)

    if not row:
        raise HTTPException(status_code=404, detail="Agency not found")
    return row
