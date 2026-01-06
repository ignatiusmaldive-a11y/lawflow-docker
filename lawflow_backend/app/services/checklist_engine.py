"""Checklist template engine for intelligent auto-population of project checklists.

Selects appropriate checklist templates based on transaction type and client profile,
then generates ChecklistItem records with rational task linkages.
"""

from sqlalchemy.orm import Session
from datetime import date, timedelta
from ..models import ChecklistItem, Task, Client, Project
from .calendar_utils import add_working_days

# Checklist template definitions
# Format: (stage, label)

PURCHASE_STANDARD = [
    ("Admision", "KYC / Incorporación del cliente + carta de compromiso"),
    ("Admision", "Recopilar pasaportes + prueba de fondos"),
    ("Admision", "Solicitar NIE (si es necesario)"),
    ("DD", "Solicitar Nota Simple (extracto del Registro de la Propiedad)"),
    ("DD", "Verificar cargas/gravámenes + titularidad"),
    ("DD", "Verificar pagos de IBI y cuotas comunitarias"),
    ("DD", "Verificar permisos, LPO / AFO si aplicable"),
    ("Contratos", "Revisar/preparar contrato de reserva"),
    ("Contratos", "Redactar/revisar contrato de Arras (depósito)"),
    ("Notaría", "Coordinar cita notarial (Escritura)"),
    ("Notaría", "Preparar declaración de finalización + ruta de fondos"),
    ("Cierre", "Preparar paquete de presentación ITP/AJD"),
    ("Registro", "Presentar escritura al Registro de la Propiedad"),
    ("Registro", "Actualizar catastro / suministros y débitos directos"),
]

PURCHASE_POLISH = [
    ("Admision", "KYC + carta de compromiso + verificar nacionalidad polaca"),
    ("Admision", "Recopilar pasaportes + prueba de fondos"),
    ("Admision", "Solicitar NIE — coordinación con consulado polaco"),
    ("Admision", "Configurar sistema IRNR para declaración trimestral"),
    ("DD", "Solicitar Nota Simple (extracto del Registro de la Propiedad)"),
    ("DD", "Verificar cargas/gravámenes + titularidad"),
    ("DD", "Verificar pagos de IBI y cuotas comunitarias"),
    ("DD", "Verificar permisos, LPO / AFO si aplicable"),
    ("Contratos", "Revisar/preparar contrato de reserva"),
    ("Contratos", "Redactar/revisar contrato de Arras — idioma: español/polaco"),
    ("Notaría", "Coordinar cita notarial + intérprete si necesario"),
    ("Notaría", "Preparar declaración de finalización + ruta de fondos desde Polonia"),
    ("Cierre", "Preparar paquete de presentación ITP/AJD"),
    ("Cierre", "Configurar recordatorios trimestrales IRNR"),
    ("Registro", "Presentar escritura al Registro de la Propiedad"),
    ("Registro", "Actualizar catastro / suministros y débitos directos"),
]

SALE_STANDARD = [
    ("Admision", "Carta de compromiso + KYC del vendedor"),
    ("DD", "Obtener Nota Simple + verificar título"),
    ("DD", "Certificado energético + divulgaciones requeridas"),
    ("Contratos", "Redactar/revisar reserva + Arras"),
    ("Notaría", "Coordinación notarial + cancelar cargas (si las hay)"),
    ("Cierre", "Calcular Plusvalía municipal + orientación sobre CGT"),
    ("Registro", "Registrar transferencia + notificar suministros/comunidad"),
]

SALE_POLISH = [
    ("Admision", "Carta de compromiso + KYC del vendedor polaco"),
    ("DD", "Obtener Nota Simple + verificar título"),
    ("DD", "Certificado energético + divulgaciones requeridas"),
    ("Contratos", "Redactar/revisar reserva + Arras"),
    ("Notaría", "Coordinación notarial + cancelar cargas (si las hay)"),
    ("Cierre", "Calcular Plusvalía municipal + CGT para no residente"),
    ("Cierre", "Coordinación certificado retenciones (Agencia Tributaria)"),
    ("Registro", "Registrar transferencia + notificar suministros/comunidad"),
]

RENTAL_PROPERTY_SETUP = [
    ("Setup", "Solicitar licencia turística / licencia de alquiler"),
    ("Setup", "Verificar cumplimiento normativa VUT (vivienda uso turístico)"),
    ("Setup", "Redactar contrato de arrendamiento estándar"),
    ("Setup", "Configurar cuenta bancaria para ingresos de alquiler"),
    ("Setup", "Contratar gestoría para gestión fiscal de alquileres"),
]


def select_template(transaction_type: str, client: Client, is_rental: bool = False) -> list[tuple[str, str]]:
    """Select the appropriate checklist template based on transaction and client profile.
    
    Args:
        transaction_type: "Purchase" or "Sale"
        client: Client instance with nationality information
        is_rental: True if property is intended for rental
    
    Returns:
        List of (stage, label) tuples
    """
    template = []
    
    # Base template selection
    if transaction_type == "Purchase":
        if client and client.nationality == "Polish":
            template = PURCHASE_POLISH.copy()
        else:
            template = PURCHASE_STANDARD.copy()
    elif transaction_type == "Sale":
        if client and client.nationality == "Polish":
            template = SALE_POLISH.copy()
        else:
            template = SALE_STANDARD.copy()
    
    # Add rental setup items if applicable (only for purchases)
    if is_rental and transaction_type == "Purchase":
        template.extend(RENTAL_PROPERTY_SETUP)
    
    return template


def auto_populate_checklist(project: Project, client: Client, is_rental: bool = False, db: Session = None) -> list[ChecklistItem]:
    """Auto-populate checklist items for a new project.
    
    Args:
        project: Project instance
        client: Client instance
        is_rental: True if property is intended for rental
        db: Database session
    
    Returns:
        List of created ChecklistItem instances
    """
    today = date.today()
    template = select_template(project.transaction_type, client, is_rental)
    
    checklist_items = []
    for idx, (stage, label) in enumerate(template):
        # Calculate due dates based on stage and calendar-aware scheduling
        due_offset = idx * 2 + 1  # Stagger due dates
        due_date = add_working_days(today, due_offset, project.location)
        
        item = ChecklistItem(
            project_id=project.id,
            stage=stage,
            label=label,
            is_done=False,
            due_date=due_date,
        )
        
        if db:
            db.add(item)
        checklist_items.append(item)
    
    if db:
        db.flush()  # Get IDs for created items
    
    return checklist_items


def create_linked_tasks(checklist_items: list[ChecklistItem], project: Project, db: Session, client: Client = None) -> list[Task]:
    """Create tasks that are rationally linked to checklist items.
    
    Only creates tasks for key DD/Contracts/Notary stages that require active work.
    
    Args:
        checklist_items: List of ChecklistItem instances
        project: Project instance
        db: Database session
        client: Optional Client instance for context-aware titles
    
    Returns:
        List of created Task instances
    """
    today = date.today()
    tasks = []
    
    # Mapping of checklist labels to expanded task descriptions
    task_mappings = {
        "Solicitar NIE": ("Assist with NIE application — coordinate with consulate", "Alta"),
        "Solicitar Nota Simple": ("Solicitar Nota Simple + verificar cargas", "Alta"),
        "Verificar cargas": ("Verificar cargas/gravámenes y titularidad registral", "Alta"),
        "Verificar pagos de IBI": ("Verificar cuotas comunidad + recibos IBI", "Media"),
        "Verificar permisos": ("Verificar estado LPO/AFO con ayuntamiento", "Alta"),
        "contrato de reserva": ("Redactar/revisar contrato de reserva", "Media"),
        "Arras": ("Redactar/revisar contrato de Arras", "Alta"),
        "Coordinar cita notarial": ("Reservar notaría + circular agenda de cierre", "Alta"),
        "declaración de finalización": ("Preparar declaración de finalización + ruta de fondos", "Alta"),
        "ITP/AJD": ("Preparar paquete de presentación ITP/AJD", "Alta"),
        "Registro de la Propiedad": ("Presentar escritura al Registro de la Propiedad", "Alta"),
        "Certificado energético": ("Coordinar certificado energético + divulgaciones", "Alta"),
        "Plusvalía": ("Calcular Plusvalía municipal para vendedor", "Media"),
        "licencia turística": ("Solicitar licencia turística / VUT", "Media"),
    }
    
    for item in checklist_items:
        # Only create tasks for items in active stages
        if item.stage not in ("Admision", "DD", "Contratos", "Notaría", "Cierre", "Setup"):
            continue
        
        # Find matching task mapping based on keywords in checklist label
        task_title = None
        priority = "Media"
        
        for keyword, (title, prio) in task_mappings.items():
            if keyword.lower() in item.label.lower():
                task_title = title
                priority = prio
                
                # Context-aware title refinements
                if client and client.nationality == "Polish":
                    if keyword == "Solicitar NIE":
                        task_title = "Coordinate NIE application with Polish consulate"
                    elif keyword == "Arras":
                        task_title = "Prepare bilingual Purchase Contract (Arras) ES/PL"
                    elif keyword == "IRNR":
                        task_title = "Setup quarterly IRNR filing for Polish non-resident"
                
                break
        
        if task_title:
            # Assign tasks to team members based on type
            if "NIE" in task_title or "KYC" in task_title:
                assignee = "Ana López"
            elif "Nota Simple" in task_title or "Registro" in task_title:
                assignee = "Lucía"
            elif "contrato" in task_title.lower() or "Arras" in task_title:
                assignee = "Carlos"
            elif "notaría" in task_title.lower() or "notarial" in task_title.lower():
                assignee = "Javier"
            else:
                assignee = "Ana López"
            
            # Calculate due date (same as checklist item or slightly before)
            due_date = item.due_date or add_working_days(today, 7, project.location)
            
            task = Task(
                project_id=project.id,
                title=task_title,
                status="Pendiente",
                assignee=assignee,
                due_date=due_date,
                priority=priority,
                tags=f"{item.stage},{project.transaction_type}",
                description=f"Relacionado con: {item.label}",
            )
            db.add(task)
            tasks.append(task)
    
    if tasks:
        db.flush()
    
    return tasks
