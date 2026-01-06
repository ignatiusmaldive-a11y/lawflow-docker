from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class ClientOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
    nationality: Optional[str] = None
    tax_residency: Optional[str] = None
    preferred_language: Optional[str] = None
    class Config: from_attributes = True

class ProjectOut(BaseModel):
    id: int
    title: str
    transaction_type: str
    location: str
    status: str
    risk: str
    bg_color: str
    start_date: Optional[date] = None
    target_close_date: Optional[date] = None
    dropbox_folder: Optional[str] = None
    client_id: Optional[int] = None
    client: Optional[ClientOut] = None
    class Config: from_attributes = True

class TaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    status: str
    assignee: str
    due_date: Optional[date] = None
    priority: str
    tags: Optional[str] = None
    description: Optional[str] = None
    class Config: from_attributes = True

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    tags: Optional[str] = None
    description: Optional[str] = None

class ChecklistItemOut(BaseModel):
    id: int
    project_id: int
    stage: str
    label: str
    is_done: bool
    due_date: Optional[date] = None
    class Config: from_attributes = True

class ChecklistUpdate(BaseModel):
    is_done: bool

class TimelineItemOut(BaseModel):
    id: int
    project_id: int
    label: str
    start_date: date
    end_date: date
    kind: str
    class Config: from_attributes = True

class ActivityOut(BaseModel):
    id: int
    project_id: int
    created_at: datetime
    actor: str
    verb: str
    detail: Optional[str] = None
    class Config: from_attributes = True

class ChatOut(BaseModel):
    response: str

class FiscalObligationOut(BaseModel):
    id: int
    project_id: int
    obligation_type: str
    amount: Optional[float] = None
    due_date: Optional[date] = None
    filing_deadline: Optional[date] = None
    status: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    class Config: from_attributes = True

class RecurringTaskOut(BaseModel):
    id: int
    project_id: int
    title: str
    frequency: str
    next_due_date: Optional[date] = None
    category: Optional[str] = None
    is_active: bool
    description: Optional[str] = None
    class Config: from_attributes = True

class RentalManagementOut(BaseModel):
    id: int
    project_id: int
    rental_status: str
    rental_type: Optional[str] = None
    monthly_income: Optional[float] = None
    tenant_name: Optional[str] = None
    lease_start: Optional[date] = None
    lease_end: Optional[date] = None
    tourist_license: Optional[str] = None
    notes: Optional[str] = None
    class Config: from_attributes = True

class ChecklistTemplateOut(BaseModel):
    id: int
    name: str
    transaction_type: str
    client_profile: Optional[str] = None
    description: Optional[str] = None
    stages_data: Optional[dict] = None
    class Config: from_attributes = True

class ProjectDetail(ProjectOut):
    tasks: List[TaskOut] = []
    checklist_items: List[ChecklistItemOut] = []
    timeline_items: List[TimelineItemOut] = []
    activities: List[ActivityOut] = []
    fiscal_obligations: List[FiscalObligationOut] = []
    recurring_tasks: List[RecurringTaskOut] = []
    rental_management: Optional[RentalManagementOut] = None

class FileItemOut(BaseModel):
    id: int
    project_id: int
    filename: str
    stored_path: str
    mime_type: Optional[str] = None
    uploaded_at: datetime
    uploader: str
    class Config: from_attributes = True

class TemplateOut(BaseModel):
    municipality: str
    transaction_type: str
    checklist_overrides: list[str] = []
    document_templates: list[str] = []

class ProjectCreate(BaseModel):
    title: str
    transaction_type: str
    location: str
    status: str = "Intake"
    risk: str = "Normal"
    bg_color: str = "#0b1220"
    client_id: int
    is_rental: bool = False

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    risk: Optional[str] = None
    target_close_date: Optional[date] = None
    bg_color: Optional[str] = None
    dropbox_folder: Optional[str] = None

class TaskCreate(BaseModel):
    project_id: int
    title: str
    status: str = "Backlog"
    assignee: str = "Ana López"
    due_date: Optional[date] = None
    priority: str = "Medium"
    tags: Optional[str] = None
    description: Optional[str] = None

class ChatIn(BaseModel):
    message: str

