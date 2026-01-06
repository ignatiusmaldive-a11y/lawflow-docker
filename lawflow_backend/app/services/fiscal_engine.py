"""Fiscal operations engine for tracking tax and financial obligations.

Creates and manages fiscal obligations like ITP/AJD, Plusvalía, IBI, and IRNR
with calendar-aware deadline calculations.
"""

from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from ..models import Project, FiscalObligation, RecurringTask
from .calendar_utils import add_working_days


def create_purchase_fiscal_obligations(project: Project, notary_date: date, db: Session) -> list[FiscalObligation]:
    """Create fiscal obligations for a purchase transaction.
    
    - ITP/AJD: Due 30 working days after notary date
    - Annual IBI reminder
    
    Args:
        project: Project instance
        notary_date: Date of notary appointment
        db: Database session
    
    Returns:
        List of created FiscalObligation instances
    """
    obligations = []
    
    # ITP/AJD (Property Transfer Tax)
    # Due 30 working days after notary date (Spanish law)
    itp_deadline = add_working_days(notary_date, 30, project.location)
    
    itp = FiscalObligation(
        project_id=project.id,
        obligation_type="ITP/AJD",
        due_date=itp_deadline,
        filing_deadline=itp_deadline,
        status="Pending",
        notes=f"Impuesto sobre Transmisiones Patrimoniales. Plazo: 30 días hábiles desde escritura ({notary_date.strftime('%d/%m/%Y')})",
    )
    db.add(itp)
    obligations.append(itp)
    
    # Annual IBI (property tax) - typically due November
    # Create recurring task instead
    ibi_due = date(notary_date.year, 11, 15) if notary_date.month < 11 else date(notary_date.year + 1, 11, 15)
    
    ibi_task = RecurringTask(
        project_id=project.id,
        title="Recordatorio pago IBI (Impuesto sobre Bienes Inmuebles)",
        frequency="Annual",
        next_due_date=ibi_due,
        category="Fiscal",
        is_active=True,
        description="Impuesto municipal sobre la propiedad. Se paga anualmente, típicamente en noviembre.",
    )
    db.add(ibi_task)
    
    db.flush()
    return obligations


def create_sale_fiscal_obligations(project: Project, sale_date: date, db: Session) -> list[FiscalObligation]:
    """Create fiscal obligations for a sale transaction.
    
    - Plusvalía Municipal: Due 30 calendar days after sale
    - CGT guidance (informational)
    
    Args:
        project: Project instance
        sale_date: Date of sale completion
        db: Database session
    
    Returns:
        List of created FiscalObligation instances
    """
    obligations = []
    
    # Plusvalía Municipal (municipal capital gains tax)
    # Due 30 calendar days after sale
    plusvalia_deadline = sale_date + timedelta(days=30)
    
    plusvalia = FiscalObligation(
        project_id=project.id,
        obligation_type="Plusvalía",
        due_date=plusvalia_deadline,
        filing_deadline=plusvalia_deadline,
        status="Pending",
        notes=f"Plusvalía Municipal. Plazo: 30 días naturales desde venta ({sale_date.strftime('%d/%m/%Y')})",
    )
    db.add(plusvalia)
    obligations.append(plusvalia)
    
    # CGT (Capital Gains Tax) - annual tax return
    # Due in June of the following year
    cgt_year = sale_date.year + 1
    cgt_deadline = date(cgt_year, 6, 30)
    
    cgt = FiscalObligation(
        project_id=project.id,
        obligation_type="CGT",
        due_date=cgt_deadline,
        filing_deadline=cgt_deadline,
        status="Pending",
        notes=f"Impuesto sobre Ganancias de Capital. Se declara en IRPF del año {sale_date.year}, plazo hasta junio {cgt_year}",
    )
    db.add(cgt)
    obligations.append(cgt)
    
    db.flush()
    return obligations


def create_rental_fiscal_obligations(project: Project, client_nationality: str, rental_start: date, db: Session) -> list[RecurringTask]:
    """Create recurring fiscal obligations for rental properties.
    
    - IRNR (quarterly) for non-residents
    - Annual rental income declaration
    
    Args:
        project: Project instance
        client_nationality: Nationality of property owner
        rental_start: Date when rental activity begins
        db: Database session
    
    Returns:
        List of created RecurringTask instances
    """
    recurring_tasks = []
    
    # For non-Spanish residents: quarterly IRNR declarations
    is_non_resident = client_nationality and client_nationality != "Spanish"
    
    if is_non_resident:
        # IRNR Q1 (January-March): Due April 20
        # IRNR Q2 (April-June): Due July 20
        # IRNR Q3 (July-September): Due October 20
        # IRNR Q4 (October-December): Due January 20
        
        quarters = [
            ("Q1", 4, 20, "Enero-Marzo"),
            ("Q2", 7, 20, "Abril-Junio"),
            ("Q3", 10, 20, "Julio-Septiembre"),
            ("Q4", 1, 20, "Octubre-Diciembre"),  # January of next year
        ]
        
        current_quarter = (rental_start.month - 1) // 3
        for i in range(4):
            q_index = (current_quarter + i) % 4
            q_name, month, day, period = quarters[q_index]
            
            # Calculate next due date
            if q_index == 3 and rental_start.month <= 10:
                next_year = rental_start.year + 1
            else:
                next_year = rental_start.year
            
            next_due = date(next_year, month, day)
            
            task = RecurringTask(
                project_id=project.id,
                title=f"Declaración IRNR {q_name} — Ingresos alquiler ({period})",
                frequency="Quarterly",
                next_due_date=next_due,
                category="Fiscal",
                is_active=True,
                description=f"Impuesto sobre la Renta de No Residentes. Declaración trimestral de ingresos por alquiler. Plazo: día 20 del mes siguiente al trimestre.",
            )
            db.add(task)
            recurring_tasks.append(task)
    
    # Annual rental income declaration (for all)
    annual_due = date(rental_start.year + 1, 6, 30)
    
    annual_task = RecurringTask(
        project_id=project.id,
        title="Declaración anual IRPF — Ingresos alquiler",
        frequency="Annual",
        next_due_date=annual_due,
        category="Fiscal",
        is_active=True,
        description="Declaración anual de ingresos por alquiler en IRPF (residentes) o IRNR (no residentes).",
    )
    db.add(annual_task)
    recurring_tasks.append(annual_task)
    
    db.flush()
    return recurring_tasks


def create_ongoing_ibi_obligation(project: Project, purchase_date: date, db: Session) -> RecurringTask:
    """Create recurring IBI (property tax) obligation.
    
    Args:
        project: Project instance
        purchase_date: Date of property purchase
        db: Database session
    
    Returns:
        Created RecurringTask instance
    """
    # IBI typically due in November (municipality-specific)
    ibi_due = date(purchase_date.year, 11, 15) if purchase_date.month < 11 else date(purchase_date.year + 1, 11, 15)
    
    task = RecurringTask(
        project_id=project.id,
        title="Pago IBI (Impuesto sobre Bienes Inmuebles)",
        frequency="Annual",
        next_due_date=ibi_due,
        category="Fiscal",
        is_active=True,
        description=f"Impuesto municipal sobre la propiedad en {project.location}. Pago anual, típicamente noviembre.",
    )
    db.add(task)
    db.flush()
    
    return task
