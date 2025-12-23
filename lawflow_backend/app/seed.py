from datetime import date, timedelta
from sqlalchemy.orm import Session
from .models import Client, Project, Task, ChecklistItem, TimelineItem, Activity, FileItem

PURCHASE = [
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

SALE = [
  ("Admision", "Carta de compromiso + KYC del vendedor"),
  ("DD", "Obtener Nota Simple + verificar título"),
  ("DD", "Certificado energético + divulgaciones requeridas"),
  ("Contratos", "Redactar/revisar reserva + Arras"),
  ("Notaría", "Coordinación notarial + cancelar cargas (si las hay)"),
  ("Cierre", "Calcular Plusvalía municipal + orientación sobre CGT"),
  ("Registro", "Registrar transferencia + notificar suministros/comunidad"),
]

def seed_if_empty(db: Session):
    if db.query(Project).count() > 0:
        return

    today = date.today()

    # Clients
    c1 = Client(
        name="Sofía Martínez",
        email="sofia.martinez@example.com",
        phone="+34 600 111 222",
        notes="Buyer relocating to Costa del Sol. Needs NIE + Spanish bank account guidance.",
    )
    c2 = Client(
        name="James O'Connor",
        email="j.oconnor@example.com",
        phone="+34 611 333 444",
        notes="Seller. Mortgage cancellation required. Wants tight notary window.",
    )
    c3 = Client(
        name="María & Daniel Ruiz",
        email="ruiz.family@example.com",
        phone="+34 622 555 888",
        notes="New-build purchase. Snagging plan + developer guarantees.",
    )
    c4 = Client(
        name="Laura Pérez",
        email="laura.perez@example.com",
        phone="+34 633 777 999",
        notes="Sale with tourist license considerations; HOA rules review.",
    )
    db.add_all([c1, c2, c3, c4])
    db.flush()

    # Matters (15 projects for comprehensive demo coverage)
    p1 = Project(
        title="Purchase – Apartment in Nueva Andalucía",
        transaction_type="Purchase",
        location="Marbella",
        status="Due Diligence",
        risk="At Risk",
        bg_color="#0b1220",
        start_date=today - timedelta(days=12),
        target_close_date=today + timedelta(days=30),
        client_id=c1.id,
    )
    p2 = Project(
        title="Sale – Villa in Elviria",
        transaction_type="Sale",
        location="Marbella",
        status="Contracts",
        risk="Normal",
        bg_color="#071a12",
        start_date=today - timedelta(days=20),
        target_close_date=today + timedelta(days=18),
        client_id=c2.id,
    )
    p3 = Project(
        title="Purchase – Townhouse in La Cala de Mijas",
        transaction_type="Purchase",
        location="Mijas",
        status="Notary",
        risk="Critical",
        bg_color="#1b1020",
        start_date=today - timedelta(days=28),
        target_close_date=today + timedelta(days=6),
        client_id=c1.id,
    )
    p4 = Project(
        title="Purchase – New-build in Cancelada (handover)",
        transaction_type="Purchase",
        location="Estepona",
        status="Notary",
        risk="At Risk",
        bg_color="#0b1220",
        start_date=today - timedelta(days=35),
        target_close_date=today + timedelta(days=10),
        client_id=c3.id,
    )
    p5 = Project(
        title="Sale – Penthouse near Puerto Banús",
        transaction_type="Sale",
        location="Marbella",
        status="Registry",
        risk="Normal",
        bg_color="#0d1726",
        start_date=today - timedelta(days=46),
        target_close_date=today - timedelta(days=3),
        client_id=c4.id,
    )

    # Additional projects for comprehensive demo (10 more)
    p6 = Project(
        title="Purchase – Beachfront Apartment in Marbella",
        transaction_type="Purchase",
        location="Marbella",
        status="Due Diligence",
        risk="Normal",
        bg_color="#0d1421",
        start_date=today - timedelta(days=8),
        target_close_date=today + timedelta(days=45),
        client_id=c1.id,
    )
    p7 = Project(
        title="Sale – Townhouse in Mijas Costa",
        transaction_type="Sale",
        location="Mijas",
        status="Contracts",
        risk="At Risk",
        bg_color="#0a1812",
        start_date=today - timedelta(days=15),
        target_close_date=today + timedelta(days=25),
        client_id=c4.id,
    )
    p8 = Project(
        title="Purchase – Villa in Benahavís",
        transaction_type="Purchase",
        location="Marbella",
        status="Due Diligence",
        risk="Normal",
        bg_color="#0e1522",
        start_date=today - timedelta(days=5),
        target_close_date=today + timedelta(days=50),
        client_id=c3.id,
    )
    p9 = Project(
        title="Sale – Apartment in Estepona Marina",
        transaction_type="Sale",
        location="Estepona",
        status="Notary",
        risk="Critical",
        bg_color="#181020",
        start_date=today - timedelta(days=30),
        target_close_date=today + timedelta(days=8),
        client_id=c2.id,
    )
    p10 = Project(
        title="Purchase – Penthouse in Guadalmina",
        transaction_type="Purchase",
        location="Marbella",
        status="Contracts",
        risk="Normal",
        bg_color="#0f1623",
        start_date=today - timedelta(days=18),
        target_close_date=today + timedelta(days=22),
        client_id=c1.id,
    )
    p11 = Project(
        title="Sale – Finca in Coín",
        transaction_type="Sale",
        location="Mijas",
        status="Registry",
        risk="Normal",
        bg_color="#0e1724",
        start_date=today - timedelta(days=50),
        target_close_date=today - timedelta(days=8),
        client_id=c4.id,
    )
    p12 = Project(
        title="Purchase – New Development in Manilva",
        transaction_type="Purchase",
        location="Estepona",
        status="Due Diligence",
        risk="At Risk",
        bg_color="#0c1320",
        start_date=today - timedelta(days=22),
        target_close_date=today + timedelta(days=35),
        client_id=c3.id,
    )
    p13 = Project(
        title="Sale – Commercial Property in Fuengirola",
        transaction_type="Sale",
        location="Mijas",
        status="Contracts",
        risk="Normal",
        bg_color="#091615",
        start_date=today - timedelta(days=12),
        target_close_date=today + timedelta(days=28),
        client_id=c2.id,
    )
    p14 = Project(
        title="Purchase – Cortijo in Alhaurín el Grande",
        transaction_type="Purchase",
        location="Mijas",
        status="Notary",
        risk="Critical",
        bg_color="#161025",
        start_date=today - timedelta(days=40),
        target_close_date=today + timedelta(days=12),
        client_id=c1.id,
    )
    p15 = Project(
        title="Sale – Luxury Villa in Ojén",
        transaction_type="Sale",
        location="Marbella",
        status="Registry",
        risk="Normal",
        bg_color="#0d1625",
        start_date=today - timedelta(days=55),
        target_close_date=today - timedelta(days=12),
        client_id=c4.id,
    )

    projects = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15]
    db.add_all(projects)
    db.flush()

    # Helpers
    def add_task(p, title, status, assignee, due_in, priority="Medium", tags=None, desc=None):
        db.add(
            Task(
                project_id=p.id,
                title=title,
                status=status,
                assignee=assignee,
                due_date=today + timedelta(days=due_in) if due_in is not None else None,
                priority=priority,
                tags=tags,
                description=desc,
            )
        )

    # Mix of overdue, due soon, and future tasks to demo Calendar + alerts
    # p1 (Marbella purchase) — At Risk, DD
    add_task(p1, "Solicitar Nota Simple + verificar cargas", "In Progress", "Lucía", 1, "High", "DD,Registry", "Obtener extracto del registro de la propiedad y verificar hipotecas o cargas sobre el título.")
    add_task(p1, "Verificar cuotas comunidad + recibos IBI", "Backlog", "Ana", 5, "Medium", "DD,HOA", "Confirmar que las cuotas comunitarias están pagadas y obtener certificado IBI.")
    add_task(p1, "Verificar estado LPO/AFO con ayuntamiento", "Review", "Carlos", -2, "High", "DD,Urbanism", "Vencido: esperando respuesta del ayuntamiento. Verificar permisos de urbanismo.")
    add_task(p1, "Redactar/revisar contrato de Arras (favorable comprador)", "Review", "Carlos", 2, "High", "Contracts,Legal", "Preparar contrato de depósito con condiciones favorables para comprador internacional.")
    add_task(p1, "Enviar guía apertura cuenta bancaria española", "Done", "Ana", -6, "Low", "Client,Banking", "Enviadas instrucciones detalladas para abrir cuenta bancaria española.")

    # p2 (Marbella sale) — Contracts
    add_task(p2, "Coordinar certificado energético + divulgaciones", "In Progress", "Ana", 0, "High", "DD,Energy", "Vence hoy: Obtener certificado obligatorio de eficiencia energética y preparar divulgaciones del vendedor.")
    add_task(p2, "Redactar contrato de reserva", "Backlog", "Carlos", 3, "Medium", "Contracts,Legal", "Preparar contrato privado de compraventa para venta de villa.")
    add_task(p2, "Cancelación hipoteca: solicitar saldo pendiente", "In Progress", "Javier", -1, "High", "Notary,Bank", "Contactar banco para importe exacto de cancelación hipoteca e instrucciones.")
    add_task(p2, "Estimación Plusvalía para vendedor", "Review", "Lucía", 7, "Medium", "Taxes,Closing", "Calcular responsabilidad tributaria municipal por ganancias de capital del vendedor.")
    add_task(p2, "Recopilar DNI vendedor + prueba domicilio", "Done", "Ana", -10, "Low", "KYC,Documentation", "Recogidos pasaportes y factura de servicios para verificación del vendedor.")

    # p3 (Mijas purchase) — Critical, Notary soon
    add_task(p3, "Reservar notaría + circular agenda de cierre", "In Progress", "Javier", 1, "High", "Notary,Scheduling", "Asegurar cita notarial y distribuir calendario de finalización a todas las partes.")
    add_task(p3, "Preparar declaración de cierre + ruta de fondos", "In Progress", "Lucía", 2, "High", "Closing,Finance", "Calcular cifras finales de liquidación y coordinar transferencia internacional.")
    add_task(p3, "Obtener confirmación certificado NIE", "Review", "Ana", -3, "High", "NIE,KYC", "Ruta crítica: confirmación NIE requerida para compra de propiedad. Seguimiento necesario.")
    add_task(p3, "Preparar paquete presentación ITP/AJD", "Backlog", "Lucía", 6, "High", "Taxes,Closing", "Compilar documentos para presentación de impuesto de transmisiones y sello.")
    add_task(p3, "Revisión final borrador escritura", "Backlog", "Carlos", 3, "High", "Notary,Legal", "Revisar escritura de propiedad final por precisión antes de cita notarial.")

    # p4 (Estepona new-build) — Handover / guarantees
    add_task(p4, "Garantías promotor: verificar cobertura aval bancario", "In Progress", "Carlos", 2, "High", "New-build,Guarantees", "Confirmar que aval bancario del promotor cubre todas las obligaciones de finalización.")
    add_task(p4, "Plan de reparaciones: coordinar fecha inspección", "Review", "Ana", 4, "Medium", "New-build,Quality", "Programar inspección profesional de defectos de construcción y problemas de calidad.")
    add_task(p4, "Notaría: confirmar redacción poder notarial", "Backlog", "Javier", 7, "Medium", "Notary,Legal", "Revisar documento de poder para firma de entrega.")
    add_task(p4, "Preparar carta traspaso suministros", "Backlog", "Lucía", 10, "Low", "Post-completion,Utilities", "Redactar carta para transferir contratos de agua, electricidad y gas.")
    add_task(p4, "Recopilar DNIs + prueba de fondos", "Done", "Ana", -20, "Low", "KYC,Finance", "Verificadas identidades del comprador y extractos bancarios para compra sobre plano.")

    # p5 (Marbella sale) — Post completion / registry
    add_task(p5, "Presentar escritura al Registro de la Propiedad", "In Progress", "Lucía", -4, "High", "Registry,Legal", "Vencido: cita de registro reprogramada. Presentar escritura ejecutada para inscripción de título.")
    add_task(p5, "Notificar comunidad + configurar domiciliación", "Backlog", "Ana", 2, "Medium", "HOA,Utilities", "Informar asociación comunitaria de cambio de propiedad y organizar pagos automáticos.")
    add_task(p5, "Presentar Plusvalía (impuesto municipal)", "Review", "Lucía", 1, "High", "Taxes,Compliance", "Presentar declaración tributaria municipal por ganancias de capital.")
    add_task(p5, "Cerrar expediente + archivar documentos", "Backlog", "Ana", 14, "Low", "Admin,Archiving", "Completar organización final del expediente y preparar para almacenamiento a largo plazo.")
    add_task(p5, "Email finalización cliente + factura", "Done", "Ana", -2, "Low", "Client,Billing", "Enviado resumen final de transacción y factura de honorarios profesionales.")

    # Additional projects tasks (p6-p15)
    # p6 (Marbella Purchase - Beachfront) — Due Diligence
    add_task(p6, "Solicitar información registral propiedad", "In Progress", "Lucía", 3, "High", "DD,Registry", "Obtener Nota Simple y verificar detalles de propiedad frente al mar.")
    add_task(p6, "Verificar cumplimiento regulaciones costeras", "Backlog", "Carlos", 8, "Medium", "DD,Urbanism", "Comprobar restricciones o permisos de zona costera.")
    add_task(p6, "Verificación licencia turística", "Review", "Ana", 2, "High", "DD,Legal", "Confirmar estado y restricciones de licencia de alquiler turístico.")
    add_task(p6, "Acuerdos acceso playa comunidad", "Backlog", "Lucía", 10, "Medium", "DD,HOA", "Revisar normas comunitarias para acceso y uso de playa.")
    add_task(p6, "Redactar contrato de reserva", "Done", "Carlos", -5, "Low", "Contracts", "Acuerdo inicial de reserva completado.")

    # p7 (Mijas Sale - Townhouse) — Contracts, At Risk
    add_task(p7, "Preparar divulgaciones vendedor", "In Progress", "Ana", 1, "High", "DD,Legal", "Compilar documentos obligatorios de divulgación del vendedor.")
    add_task(p7, "Coordinación certificado energético", "Review", "Lucía", -1, "High", "DD,Energy", "Vencido: Programar visita de evaluador energético.")
    add_task(p7, "Cálculo cancelación hipoteca", "Backlog", "Javier", 5, "Medium", "Notary,Finance", "Contactar banco para saldo exacto de cancelación hipoteca e instrucciones.")
    add_task(p7, "Redactar contrato privado compraventa", "Backlog", "Carlos", 8, "Medium", "Contracts,Legal", "Preparar contrato de Arras con protecciones para vendedor.")
    add_task(p7, "Completar KYC cliente", "Done", "Ana", -8, "Low", "KYC", "Verificación de identidad del vendedor y documentación recopilada.")

    # p8 (Marbella Purchase - Villa) — Due Diligence
    add_task(p8, "Tasación integral propiedad", "In Progress", "Carlos", 5, "High", "DD,Survey", "Programar tasación profesional de estructura y límites de villa.")
    add_task(p8, "Verificación derechos agua y pozo", "Backlog", "Lucía", 12, "Medium", "DD,Utilities", "Comprobar titularidad de pozo privado y derechos de extracción de agua.")
    add_task(p8, "Permisos uso agrícola", "Review", "Ana", 8, "Medium", "DD,Urbanism", "Verificar clasificación rural de propiedad y usos permitidos.")
    add_task(p8, "Acuerdos mantenimiento vía acceso", "Backlog", "Carlos", 15, "Low", "DD,Infrastructure", "Revisar acuerdos comunitarios para mantenimiento de carreteras.")
    add_task(p8, "Apoyo solicitud NIE", "Done", "Ana", -3, "Low", "Client,NIE", "Guiado cliente a través del proceso de solicitud NIE.")

    # p9 (Estepona Sale - Marina) — Notary, Critical
    add_task(p9, "Verificación titularidad amarre marina", "In Progress", "Lucía", 2, "High", "DD,Marina", "Confirmar titularidad de amarre y requisitos de transferencia.")
    add_task(p9, "Reserva cita notaría", "Review", "Javier", -2, "High", "Notary,Scheduling", "Crítico: Asegurar plaza notarial antes de fecha límite transferencia marina.")
    add_task(p9, "Documentación traspaso marina", "Backlog", "Ana", 4, "High", "Registry,Marina", "Preparar formularios de asociación marina y tasas de transferencia.")
    add_task(p9, "Cálculo liquidación final", "Backlog", "Lucía", 6, "High", "Closing,Finance", "Calcular cifras finales incluyendo tasas de marina.")
    add_task(p9, "Coordinación entrega cliente", "Done", "Ana", -10, "Low", "Client,Admin", "Completada toma inicial de cliente y documentación.")

    # p10 (Marbella Purchase - Penthouse) — Contracts
    add_task(p10, "Revisar contrato mantenimiento ascensor", "In Progress", "Carlos", 2, "Medium", "DD,Building", "Comprobar contratos de mantenimiento de ascensor y estado fondo reserva.")
    add_task(p10, "Derechos uso terraza cubierta", "Backlog", "Ana", 7, "Medium", "DD,Legal", "Verificar derechos exclusivos de uso de terraza ático.")
    add_task(p10, "Asignación plaza aparcamiento", "Review", "Lucía", 4, "High", "DD,Parking", "Confirmar plaza aparcamiento asignada y detalles trastero.")
    add_task(p10, "Finalización contrato Arras", "Backlog", "Carlos", 10, "High", "Contracts,Legal", "Completar contrato de depósito con todas las partes.")
    add_task(p10, "Guía apertura cuenta bancaria", "Done", "Ana", -4, "Low", "Client,Banking", "Proporcionadas instrucciones para cuenta bancaria española.")

    # p11 (Mijas Sale - Finca) — Registry, completed
    add_task(p11, "Seguimiento presentación registro", "Done", "Lucía", -12, "Low", "Registry", "Escritura registrada exitosamente en Registro de la Propiedad.")
    add_task(p11, "Confirmación presentación impuestos finales", "Done", "Lucía", -8, "Low", "Taxes", "Impuesto Plusvalía municipal presentado y pagado.")
    add_task(p11, "Liquidación final cliente", "Done", "Ana", -10, "Low", "Client,Billing", "Pago final recibido y expediente archivado.")
    add_task(p11, "Completar entrega propiedad", "Done", "Carlos", -9, "Low", "Admin", "Llaves y documentación transferidas al comprador.")
    add_task(p11, "Preparación archivo expediente", "Done", "Ana", -5, "Low", "Admin,Archiving", "Expediente completo preparado para almacenamiento a largo plazo.")

    # p12 (Estepona Purchase - New Dev) — Due Diligence, At Risk
    add_task(p12, "Evaluación riesgo insolvencia promotor", "In Progress", "Carlos", 3, "High", "DD,Developer", "Investigar estabilidad financiera del promotor y historial finalización proyectos.")
    add_task(p12, "Revisión contrato compraventa sobre plano", "Review", "Ana", 1, "High", "Contracts,Legal", "Revisar términos contrato promotor y cláusulas de cancelación.")
    add_task(p12, "Verificación aval bancario", "Backlog", "Lucía", 8, "High", "DD,Finance", "Confirmar cobertura aval bancario para precio total de compra.")
    add_task(p12, "Inspección progreso construcción", "Backlog", "Carlos", 12, "Medium", "DD,Quality", "Programar visita al lugar para verificar calidad construcción.")
    add_task(p12, "Revisión calendario pagos", "Done", "Ana", -7, "Low", "Finance", "Calendario pagos escalonados revisado y aprobado.")

    # p13 (Mijas Sale - Commercial) — Contracts
    add_task(p13, "Verificación contratos comerciales", "In Progress", "Lucía", 2, "High", "DD,Commercial", "Comprobar contratos comerciales existentes y derechos inquilinos.")
    add_task(p13, "Traspaso licencia negocio", "Backlog", "Ana", 5, "Medium", "DD,Legal", "Verificar requisitos y proceso de traspaso licencia comercial.")
    add_task(p13, "Tasación comercial independiente", "Review", "Carlos", 8, "Medium", "DD,Finance", "Obtener tasación comercial independiente.")
    add_task(p13, "Redacción contrato compraventa", "Backlog", "Carlos", 10, "High", "Contracts,Legal", "Preparar contrato venta propiedad comercial.")
    add_task(p13, "Completar KYC vendedor", "Done", "Ana", -6, "Low", "KYC", "Verificación identidad propietario negocio completada.")

    # p14 (Mijas Purchase - Cortijo) — Notary, Critical
    add_task(p14, "Tasación límites propiedad rural", "In Progress", "Carlos", 3, "High", "DD,Survey", "Verificar límites propiedad y derechos acceso para cortijo.")
    add_task(p14, "Verificación uso agrícola", "Review", "Ana", -1, "High", "DD,Urbanism", "Vencido: Confirmar clasificación agrícola y restricciones.")
    add_task(p14, "Coordinación cita notaría", "Backlog", "Javier", 5, "High", "Notary,Scheduling", "Reservar notaría para transacción propiedad rural.")
    add_task(p14, "Documentación derechos agua", "Backlog", "Lucía", 8, "Medium", "DD,Utilities", "Verificar derechos extracción agua y titularidad pozo.")
    add_task(p14, "Seguimiento completado NIE", "Done", "Ana", -4, "Low", "Client,NIE", "Certificado NIE obtenido y verificado.")

    # p15 (Marbella Sale - Luxury Villa) — Registry, completed
    add_task(p15, "Divulgaciones propiedad lujo", "Done", "Ana", -15, "Low", "DD,Legal", "Completadas divulgaciones obligatorias propiedad lujo.")
    add_task(p15, "Presentación impuesto transmisiones alto valor", "Done", "Lucía", -10, "Low", "Taxes", "Presentada declaración tributaria transmisiones de alto valor.")
    add_task(p15, "Confirmación completado registro", "Done", "Lucía", -8, "Low", "Registry", "Escritura registrada exitosamente en Registro de la Propiedad.")
    add_task(p15, "Documentación final cliente", "Done", "Ana", -6, "Low", "Client,Admin", "Proporcionada documentación completa de transacción al vendedor.")
    add_task(p15, "Archivo final expediente", "Done", "Ana", -3, "Low", "Admin,Archiving", "Expediente villa lujo completamente archivado.")

    # Timeline: phases + milestone per project
    def add_timeline(p, close_in_days):
        phases = [
            ("Intake", -8, -2),
            ("Due Diligence", -2, 10),
            ("Contracts", 6, 18),
            ("Notary", 14, 22),
            ("Registry", 20, 40),
        ]
        for label, s, e in phases:
            db.add(
                TimelineItem(
                    project_id=p.id,
                    label=label,
                    start_date=today + timedelta(days=s),
                    end_date=today + timedelta(days=e),
                    kind="Phase",
                )
            )
        close = today + timedelta(days=close_in_days)
        db.add(TimelineItem(project_id=p.id, label="Target completion", start_date=close, end_date=close, kind="Milestone"))

    # Add timelines for all projects
    for p in projects:
        if p.id == p1.id:
            add_timeline(p1, 30)
        elif p.id == p2.id:
            add_timeline(p2, 18)
        elif p.id == p3.id:
            add_timeline(p3, 6)
        elif p.id == p4.id:
            add_timeline(p4, 10)
        elif p.id == p5.id:
            add_timeline(p5, -3)
        elif p.id == p6.id:
            add_timeline(p6, 45)
        elif p.id == p7.id:
            add_timeline(p7, 25)
        elif p.id == p8.id:
            add_timeline(p8, 50)
        elif p.id == p9.id:
            add_timeline(p9, 8)
        elif p.id == p10.id:
            add_timeline(p10, 22)
        elif p.id == p11.id:
            add_timeline(p11, -8)
        elif p.id == p12.id:
            add_timeline(p12, 35)
        elif p.id == p13.id:
            add_timeline(p13, 28)
        elif p.id == p14.id:
            add_timeline(p14, 12)
        elif p.id == p15.id:
            add_timeline(p15, -12)

    # Checklist: realistic completion states based on project progress
    def add_checklist(p):
        template = PURCHASE if p.transaction_type == "Purchase" else SALE
        for idx, (stage, label) in enumerate(template):
            # Project-specific completion logic based on status
            done = False

            if p.status == "Due Diligence":
                done = idx < 4  # Early completion in DD phase
            elif p.status == "Contracts":
                done = idx < 6  # Completed intake + DD
            elif p.status == "Notary":
                if p.risk == "Critical":
                    done = idx < 8  # Advanced but critical issues
                else:
                    done = idx < 9  # Nearly complete
            elif p.status == "Registry":
                done = idx < 12  # All but final registry items done
            else:
                done = idx < 2  # Default minimal completion

            db.add(
                ChecklistItem(
                    project_id=p.id,
                    stage=stage,
                    label=label,
                    is_done=done,
                    due_date=today + timedelta(days=idx * 2 + 1),
                )
            )

    # Add checklists for all projects
    for p in projects:
        add_checklist(p)

    # Activity: richer feed with diverse actions and timestamps
    def add_activity(p, actor, verb, detail, days_ago=0):
        activity_date = today - timedelta(days=days_ago) if days_ago > 0 else None
        db.add(Activity(
            project_id=p.id,
            actor=actor,
            verb=verb,
            detail=detail,
            created_at=activity_date
        ))

    # p1 (Marbella Purchase) - Active project with recent activity
    add_activity(p1, "Ana López", "Opened matter", "Reviewing DD blockers for Marbella purchase.", 12)
    add_activity(p1, "Lucía", "Requested", "Nota Simple request sent to Land Registry.", 8)
    add_activity(p1, "Carlos", "Commented", "Arras draft ready for partner review.", 5)
    add_activity(p1, "Ana López", "Uploaded file", "Added property photos and HOA statutes.", 3)
    add_activity(p1, "System", "Task completed", "Spanish bank account guidance email sent.", 2)
    add_activity(p1, "Carlos", "Updated task", "Arras contract moved to review status.", 1)

    # p2 (Marbella Sale) - Mid-project with various activities
    add_activity(p2, "Ana López", "Collected documents", "Gathered seller ID and address proof.", 18)
    add_activity(p2, "System", "Deadline", "Energy certificate due today.", 2)
    add_activity(p2, "Javier", "Contacted bank", "Requested mortgage cancellation balance.", 5)
    add_activity(p2, "Lucía", "Calculated", "Plusvalía estimate completed for seller.", 3)
    add_activity(p2, "Ana López", "Uploaded file", "Added energy certificate and tax assessment.", 4)
    add_activity(p2, "Carlos", "Drafted", "Reservation agreement draft in progress.", 1)

    # p3 (Mijas Purchase) - Critical project with urgent activity
    add_activity(p3, "System", "Risk escalated", "Notary in 1 week; NIE confirmation overdue.", 3)
    add_activity(p3, "Ana López", "Chased", "NIE confirmation status follow-up.", 5)
    add_activity(p3, "Lucía", "Prepared", "Completion statement and funds routing ready.", 2)
    add_activity(p3, "Javier", "Booked", "Notary slot confirmed for next week.", 1)
    add_activity(p3, "Carlos", "Reviewed", "Deed draft final review completed.", 4)
    add_activity(p3, "Ana López", "Uploaded file", "Added NIE application and bank transfer confirmation.", 6)

    # p4 (Estepona New-build) - Handover project
    add_activity(p4, "Ana López", "Collected", "Client IDs and proof of funds received.", 32)
    add_activity(p4, "Carlos", "Verified", "Developer guarantee coverage confirmed.", 4)
    add_activity(p4, "Ana López", "Coordinated", "Snagging inspection date set.", 3)
    add_activity(p4, "Carlos", "Uploaded file", "Added snagging report and handover checklist.", 2)
    add_activity(p4, "Lucía", "Prepared", "Utilities transfer letter drafted.", 1)
    add_activity(p4, "Javier", "Reviewed", "Power of attorney wording approved.", 5)

    # p5 (Marbella Sale) - Post-completion
    add_activity(p5, "Lucía", "Submitted", "Deed presented to Land Registry.", 6)
    add_activity(p5, "Lucía", "Registry", "Registry submission delayed; appointment rescheduled.", 4)
    add_activity(p5, "Ana López", "Sent", "Client completion email and invoice.", 5)
    add_activity(p5, "Lucía", "Filed", "Plusvalía municipal tax filed.", 2)
    add_activity(p5, "Ana López", "Uploaded file", "Added final tax calculation and closing package.", 3)
    add_activity(p5, "Ana López", "Notified", "HOA and utilities companies updated.", 1)

    # Demo files (metadata) — visible in File room without upload
    # p1 (Marbella Purchase) - More comprehensive file set
    db.add(FileItem(project_id=p1.id, filename="Nota_Simple_Request.pdf", stored_path="seed/Nota_Simple_Request.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p1.id, filename="Arras_Draft_v1.docx", stored_path="seed/Arras_Draft_v1.docx", mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", uploader="Carlos"))
    db.add(FileItem(project_id=p1.id, filename="Property_Photos.zip", stored_path="seed/Property_Photos.zip", mime_type="application/zip", uploader="Ana López"))
    db.add(FileItem(project_id=p1.id, filename="HOA_Statutes.pdf", stored_path="seed/HOA_Statutes.pdf", mime_type="application/pdf", uploader="Ana López"))

    # p2 (Marbella Sale) - Enhanced file set
    db.add(FileItem(project_id=p2.id, filename="Energy_Certificate.pdf", stored_path="seed/Energy_Certificate.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p2.id, filename="Mortgage_Cancellation_Request.pdf", stored_path="seed/Mortgage_Cancellation_Request.pdf", mime_type="application/pdf", uploader="Javier"))
    db.add(FileItem(project_id=p2.id, filename="Property_Deed_Scan.pdf", stored_path="seed/Property_Deed_Scan.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p2.id, filename="Tax_Assessment_2024.pdf", stored_path="seed/Tax_Assessment_2024.pdf", mime_type="application/pdf", uploader="Lucía"))

    # p3 (Mijas Purchase) - Previously had only 1 file, now comprehensive set
    db.add(FileItem(project_id=p3.id, filename="Completion_Statement.xlsx", stored_path="seed/Completion_Statement.xlsx", mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploader="Lucía"))
    db.add(FileItem(project_id=p3.id, filename="NIE_Application_Form.pdf", stored_path="seed/NIE_Application_Form.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p3.id, filename="Bank_Transfer_Confirmation.pdf", stored_path="seed/Bank_Transfer_Confirmation.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p3.id, filename="Property_Survey_Report.pdf", stored_path="seed/Property_Survey_Report.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p3.id, filename="Construction_Permit_Check.pdf", stored_path="seed/Construction_Permit_Check.pdf", mime_type="application/pdf", uploader="Ana López"))

    # p4 (Estepona Purchase) - Previously had only 1 file, now comprehensive set
    db.add(FileItem(project_id=p4.id, filename="Developer_Guarantee.pdf", stored_path="seed/Developer_Guarantee.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p4.id, filename="New_Build_Plans.pdf", stored_path="seed/New_Build_Plans.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p4.id, filename="Snagging_Report.xlsx", stored_path="seed/Snagging_Report.xlsx", mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploader="Carlos"))
    db.add(FileItem(project_id=p4.id, filename="Handover_Checklist.docx", stored_path="seed/Handover_Checklist.docx", mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", uploader="Ana López"))
    db.add(FileItem(project_id=p4.id, filename="Utilities_Contract.pdf", stored_path="seed/Utilities_Contract.pdf", mime_type="application/pdf", uploader="Lucía"))

    # p5 (Marbella Sale) - Enhanced file set
    db.add(FileItem(project_id=p5.id, filename="Land_Registry_Submission_Receipt.pdf", stored_path="seed/Land_Registry_Submission_Receipt.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p5.id, filename="Final_Tax_Calculation.xlsx", stored_path="seed/Final_Tax_Calculation.xlsx", mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploader="Lucía"))
    db.add(FileItem(project_id=p5.id, filename="Client_Closing_Package.pdf", stored_path="seed/Client_Closing_Package.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p5.id, filename="Registry_Confirmation_Letter.pdf", stored_path="seed/Registry_Confirmation_Letter.pdf", mime_type="application/pdf", uploader="Lucía"))

    # Add activities for additional projects
    # p6 (Marbella Beachfront) - Active DD
    add_activity(p6, "Ana López", "Opened matter", "Beachfront apartment purchase intake.", 8)
    add_activity(p6, "Lucía", "Requested", "Coastal property registry check initiated.", 6)
    add_activity(p6, "Carlos", "Reviewed", "Tourist license status verified.", 3)
    add_activity(p6, "Ana López", "Uploaded file", "Added beach access agreements.", 2)

    # p7 (Mijas Townhouse Sale) - Contracts, At Risk
    add_activity(p7, "Ana López", "Opened matter", "Townhouse sale for Mijas Costa property.", 15)
    add_activity(p7, "System", "Risk escalated", "Energy certificate overdue - impacts closing.", 3)
    add_activity(p7, "Javier", "Contacted bank", "Mortgage cancellation details requested.", 4)
    add_activity(p7, "Carlos", "Drafted", "Private purchase agreement in progress.", 1)

    # p8 (Benahavís Villa) - DD
    add_activity(p8, "Ana López", "Opened matter", "Luxury villa purchase in Benahavís.", 5)
    add_activity(p8, "Carlos", "Scheduled", "Professional property survey booked.", 3)
    add_activity(p8, "Lucía", "Verified", "Water rights and well ownership confirmed.", 2)
    add_activity(p8, "Ana López", "Guided", "NIE application process explained to client.", 4)

    # p9 (Estepona Marina) - Notary, Critical
    add_activity(p9, "Ana López", "Opened matter", "Marina apartment sale with berth.", 30)
    add_activity(p9, "System", "Risk escalated", "Notary slot critical for marina transfer deadline.", 5)
    add_activity(p9, "Lucía", "Verified", "Marina berth ownership confirmed.", 7)
    add_activity(p9, "Javier", "Booked", "Notary appointment secured.", 2)

    # p10 (Guadalmina Penthouse) - Contracts
    add_activity(p10, "Ana López", "Opened matter", "Penthouse purchase in Guadalmina.", 18)
    add_activity(p10, "Carlos", "Reviewed", "Elevator maintenance contracts verified.", 5)
    add_activity(p10, "Lucía", "Confirmed", "Parking space and storage assignment.", 3)
    add_activity(p10, "Ana López", "Provided", "Banking guidance for Spanish account.", 6)

    # p11 (Coín Finca) - Registry, completed
    add_activity(p11, "Lucía", "Filed", "Deed successfully registered.", 10)
    add_activity(p11, "Lucía", "Filed", "Plusvalía municipal tax completed.", 8)
    add_activity(p11, "Ana López", "Sent", "Final settlement and documentation.", 9)
    add_activity(p11, "Carlos", "Completed", "Property handover and keys transfer.", 9)

    # p12 (Manilva New Dev) - DD, At Risk
    add_activity(p12, "Ana López", "Opened matter", "Off-plan purchase in new development.", 22)
    add_activity(p12, "Carlos", "Assessed", "Developer financial stability reviewed.", 5)
    add_activity(p12, "Ana López", "Reviewed", "Contract terms and cancellation clauses.", 8)
    add_activity(p12, "Lucía", "Verified", "Bank guarantee coverage confirmed.", 3)

    # p13 (Fuengirola Commercial) - Contracts
    add_activity(p13, "Ana López", "Opened matter", "Commercial property sale.", 12)
    add_activity(p13, "Lucía", "Verified", "Commercial leases and tenant rights checked.", 5)
    add_activity(p13, "Carlos", "Obtained", "Independent commercial valuation completed.", 4)
    add_activity(p13, "Ana López", "Completed", "Business license transfer verified.", 6)

    # p14 (Alhaurín Cortijo) - Notary, Critical
    add_activity(p14, "Ana López", "Opened matter", "Rural cortijo purchase.", 40)
    add_activity(p14, "Carlos", "Scheduled", "Boundary survey and access verification.", 7)
    add_activity(p14, "System", "Risk escalated", "Agricultural classification confirmation overdue.", 3)
    add_activity(p14, "Lucía", "Verified", "Water extraction rights confirmed.", 5)

    # p15 (Ojén Luxury Villa) - Registry, completed
    add_activity(p15, "Ana López", "Completed", "Luxury property disclosures finalized.", 13)
    add_activity(p15, "Lucía", "Filed", "High-value transfer tax declaration submitted.", 10)
    add_activity(p15, "Lucía", "Confirmed", "Registry completion received.", 8)
    add_activity(p15, "Ana López", "Delivered", "Complete transaction documentation.", 7)

    # Add files for additional projects
    # p6-p10 files
    db.add(FileItem(project_id=p6.id, filename="Coastal_Property_Check.pdf", stored_path="seed/Coastal_Property_Check.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p6.id, filename="Tourist_License_Verification.pdf", stored_path="seed/Tourist_License_Verification.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p7.id, filename="Seller_Disclosures.pdf", stored_path="seed/Seller_Disclosures.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p7.id, filename="Mortgage_Details.pdf", stored_path="seed/Mortgage_Details.pdf", mime_type="application/pdf", uploader="Javier"))
    db.add(FileItem(project_id=p8.id, filename="Property_Survey_Schedule.pdf", stored_path="seed/Property_Survey_Schedule.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p8.id, filename="Water_Rights_Document.pdf", stored_path="seed/Water_Rights_Document.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p9.id, filename="Marina_Berth_Docs.pdf", stored_path="seed/Marina_Berth_Docs.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p9.id, filename="Notary_Booking_Confirmation.pdf", stored_path="seed/Notary_Booking_Confirmation.pdf", mime_type="application/pdf", uploader="Javier"))
    db.add(FileItem(project_id=p10.id, filename="Elevator_Contract.pdf", stored_path="seed/Elevator_Contract.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p10.id, filename="Parking_Assignment.pdf", stored_path="seed/Parking_Assignment.pdf", mime_type="application/pdf", uploader="Lucía"))

    # p11-p15 files
    db.add(FileItem(project_id=p11.id, filename="Registry_Confirmation.pdf", stored_path="seed/Registry_Confirmation.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p11.id, filename="Tax_Payment_Receipt.pdf", stored_path="seed/Tax_Payment_Receipt.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p12.id, filename="Developer_Financials.pdf", stored_path="seed/Developer_Financials.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p12.id, filename="Bank_Guarantee.pdf", stored_path="seed/Bank_Guarantee.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p13.id, filename="Commercial_Leases.pdf", stored_path="seed/Commercial_Leases.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p13.id, filename="Business_License.pdf", stored_path="seed/Business_License.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p14.id, filename="Boundary_Survey.pdf", stored_path="seed/Boundary_Survey.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p14.id, filename="Agricultural_Permit.pdf", stored_path="seed/Agricultural_Permit.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p15.id, filename="Luxury_Disclosures.pdf", stored_path="seed/Luxury_Disclosures.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p15.id, filename="Transfer_Tax_Receipt.pdf", stored_path="seed/Transfer_Tax_Receipt.pdf", mime_type="application/pdf", uploader="Lucía"))

    # Seeded marker events
    for p in projects:
        add_activity(p, "System", "Seeded demo project", p.title)

    db.commit()