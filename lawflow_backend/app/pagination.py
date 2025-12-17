from typing import Generic, TypeVar, Optional, List
from pydantic import BaseModel, Field
from sqlalchemy import desc, asc
from sqlalchemy.orm import Query

T = TypeVar('T')

class PaginationParams(BaseModel):
    page: int = Field(1, gt=0, description="Page number (1-based)")
    size: int = Field(50, gt=0, le=100, description="Items per page")
    sort_by: Optional[str] = Field(None, description="Field to sort by")
    sort_order: str = Field("desc", pattern="^(asc|desc)$", description="Sort order: 'asc' or 'desc'")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool

def paginate_query(
    query: Query,
    params: PaginationParams,
    model_class: type = None,
    allowed_sort_fields: Optional[List[str]] = None
) -> PaginatedResponse:
    """
    Apply pagination to a SQLAlchemy query.

    Args:
        query: The SQLAlchemy query to paginate
        params: Pagination parameters
        model_class: The model class for sort field validation
        allowed_sort_fields: List of allowed fields for sorting

    Returns:
        PaginatedResponse with items and metadata
    """
    # Apply sorting if specified
    if params.sort_by and allowed_sort_fields:
        if params.sort_by in allowed_sort_fields:
            sort_column = getattr(model_class, params.sort_by, None)
            if sort_column is not None:
                if params.sort_order == "desc":
                    query = query.order_by(desc(sort_column))
                else:
                    query = query.order_by(asc(sort_column))

    # Get total count
    total = query.count()

    # Apply pagination
    items = query.offset((params.page - 1) * params.size).limit(params.size).all()

    # Calculate pagination metadata
    pages = (total + params.size - 1) // params.size  # Ceiling division
    has_next = params.page < pages
    has_prev = params.page > 1

    return PaginatedResponse(
        items=items,
        total=total,
        page=params.page,
        size=params.size,
        pages=pages,
        has_next=has_next,
        has_prev=has_prev
    )