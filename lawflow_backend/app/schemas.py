from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class ClientOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None
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

class ProjectDetail(ProjectOut):
    tasks: List[TaskOut] = []
    checklist_items: List[ChecklistItemOut] = []
    timeline_items: List[TimelineItemOut] = []
    activities: List[ActivityOut] = []

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

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    risk: Optional[str] = None
    target_close_date: Optional[date] = None
    bg_color: Optional[str] = None

class TaskCreate(BaseModel):
    project_id: int
    title: str
    status: str = "Backlog"
    assignee: str = "Ana López"
    due_date: Optional[date] = None
    priority: str = "Medium"
    tags: Optional[str] = None
    description: Optional[str] = None
