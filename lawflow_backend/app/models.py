from sqlalchemy import String, Integer, Date, DateTime, ForeignKey, Text, Boolean, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .db import Base

class Client(Base):
    __tablename__ = "clients"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    nationality: Mapped[str | None] = mapped_column(String(50), nullable=True)  # Spanish, Polish, British, etc.
    tax_residency: Mapped[str | None] = mapped_column(String(10), nullable=True)  # ES, PL, GB, etc.
    preferred_language: Mapped[str | None] = mapped_column(String(5), nullable=True, default="es")  # es, en, pl
    projects: Mapped[list["Project"]] = relationship(back_populates="client")

class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(240))
    transaction_type: Mapped[str] = mapped_column(String(30))  # Purchase | Sale
    location: Mapped[str] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(30))
    risk: Mapped[str] = mapped_column(String(20), default="Normal")
    bg_color: Mapped[str] = mapped_column(String(20), default="#0b1220")
    start_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    target_close_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    dropbox_folder: Mapped[str | None] = mapped_column(String(520), nullable=True)

    client_id: Mapped[int | None] = mapped_column(ForeignKey("clients.id"), nullable=True)
    client: Mapped["Client | None"] = relationship(back_populates="projects")

    tasks: Mapped[list["Task"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    checklist_items: Mapped[list["ChecklistItem"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    timeline_items: Mapped[list["TimelineItem"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    activities: Mapped[list["Activity"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    fiscal_obligations: Mapped[list["FiscalObligation"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    recurring_tasks: Mapped[list["RecurringTask"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    rental_management: Mapped["RentalManagement | None"] = relationship(back_populates="project", uselist=False, cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String(240))
    status: Mapped[str] = mapped_column(String(30))  # Backlog | In Progress | Review | Done
    assignee: Mapped[str] = mapped_column(String(80))
    due_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(String(20), default="Medium")  # Low | Medium | High
    tags: Mapped[str | None] = mapped_column(String(200), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    project: Mapped["Project"] = relationship(back_populates="tasks")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    stage: Mapped[str] = mapped_column(String(40))
    label: Mapped[str] = mapped_column(String(300))
    is_done: Mapped[bool] = mapped_column(Boolean, default=False)
    due_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    project: Mapped["Project"] = relationship(back_populates="checklist_items")

class TimelineItem(Base):
    __tablename__ = "timeline_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    label: Mapped[str] = mapped_column(String(240))
    start_date: Mapped[datetime] = mapped_column(Date)
    end_date: Mapped[datetime] = mapped_column(Date)
    kind: Mapped[str] = mapped_column(String(30), default="Milestone")  # Phase | Milestone
    project: Mapped["Project"] = relationship(back_populates="timeline_items")

class Activity(Base):
    __tablename__ = "activities"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    actor: Mapped[str] = mapped_column(String(120))
    verb: Mapped[str] = mapped_column(String(120))
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    project: Mapped["Project"] = relationship(back_populates="activities")

class FileItem(Base):
    __tablename__ = "files"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    filename: Mapped[str] = mapped_column(String(260))
    stored_path: Mapped[str] = mapped_column(String(520))
    mime_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    uploader: Mapped[str] = mapped_column(String(120), default="Ana López")

    project: Mapped["Project"] = relationship()

class ChecklistTemplate(Base):
    __tablename__ = "checklist_templates"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))  # e.g., "Spanish Purchase", "Polish Purchase"
    transaction_type: Mapped[str] = mapped_column(String(30))  # Purchase | Sale
    client_profile: Mapped[str | None] = mapped_column(String(30), nullable=True)  # Spanish, Polish, EU, Rental
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    stages_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # JSON structure: {"Admision": [...], "DD": [...]}

class RecurringTask(Base):
    __tablename__ = "recurring_tasks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String(240))
    frequency: Mapped[str] = mapped_column(String(20))  # Monthly, Quarterly, Annual
    next_due_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    category: Mapped[str | None] = mapped_column(String(40), nullable=True)  # Fiscal, Rental, Maintenance
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    project: Mapped["Project"] = relationship(back_populates="recurring_tasks")

class FiscalObligation(Base):
    __tablename__ = "fiscal_obligations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    obligation_type: Mapped[str] = mapped_column(String(40))  # ITP, AJD, Plusvalía, IBI, IRNR, CGT
    amount: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    filing_deadline: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Pending")  # Pending, Filed, Paid, Overdue
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    project: Mapped["Project"] = relationship(back_populates="fiscal_obligations")

class RentalManagement(Base):
    __tablename__ = "rental_management"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    rental_status: Mapped[str] = mapped_column(String(20), default="Setup")  # Setup, Active, Terminated
    rental_type: Mapped[str | None] = mapped_column(String(30), nullable=True)  # Long-term, Holiday, Tourist
    monthly_income: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    tenant_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    lease_start: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    lease_end: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    tourist_license: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    project: Mapped["Project"] = relationship(back_populates="rental_management")
