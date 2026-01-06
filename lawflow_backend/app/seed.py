from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import text
from .models import Client, Project, Task, ChecklistItem, TimelineItem, Activity, FileItem, FiscalObligation, RecurringTask, RentalManagement

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

    # Existing Spanish/International clients
    c1 = Client(
        name="Sofía Martínez",
        email="sofia.martinez@example.com",
        phone="+34 600 111 222",
        nationality="Spanish",
        tax_residency="ES",
        preferred_language="es",
        notes="Buyer relocating to Costa del Sol. Needs NIE + Spanish bank account guidance.",
    )
    c2 = Client(
        name="James O'Connor",
        email="j.oconnor@example.com",
        phone="+34 611 333 444",
        nationality="Irish",
        tax_residency="IE",
        preferred_language="en",
        notes="Seller. Mortgage cancellation required. Wants tight notary window.",
    )
    c3 = Client(
        name="María & Daniel Ruiz",
        email="ruiz.family@example.com",
        phone="+34 622 555 888",
        nationality="Spanish",
        tax_residency="ES",
        preferred_language="es",
        notes="New-build purchase. Snagging plan + developer guarantees.",
    )
    c4 = Client(
        name="Laura Pérez",
        email="laura.perez@example.com",
        phone="+34 633 777 999",
        nationality="Spanish",
        tax_residency="ES",
        preferred_language="es",
        notes="Sale with tourist license considerations; HOA rules review.",
    )
    
    # Polish clients (1/3 of total demo data)
    c5_polish = Client(
        name="Krzysztof Nowak",
        email="k.nowak@example.pl",
        phone="+48 600 111 222",
        nationality="Polish",
        tax_residency="PL",
        preferred_language="pl",
        notes="First-time buyer in Spain. Requires NIE coordination with Polish consulate and IRNR quarterly filing setup.",
    )
    c6_polish = Client(
        name="Anna Kowalska",
        email="a.kowalska@example.pl",
        phone="+48 611 333 444",
        nationality="Polish",
        tax_residency="PL",
        preferred_language="pl",
        notes="Seller with non-resident tax obligations. CGT considerations for Polish tax resident.",
    )
    c7_polish = Client(
        name="Piotr & Magda Wiśniewski",
        email="wisniewski.family@example.pl",
        phone="+48 622 555 888",
        nationality="Polish",
        tax_residency="PL",
        preferred_language="pl",
        notes="Investment property for holiday rentals. Need rental license and quarterly IRNR filing setup.",
    )
    c8_polish = Client(
        name="Jakub Lewandowski",
        email="j.lewandowski@example.pl",
        phone="+48 633 777 999",
        nationality="Polish",
        tax_residency="PL",
        preferred_language="pl",
        notes="Real estate investor. Multiple property purchases for rental portfolio in Costa del Sol.",
    )
    c9_polish = Client(
        name="Zofia Kamiński",
        email="z.kaminski@example.pl",
        phone="+48 644 888 111",
        nationality="Polish",
        tax_residency="PL",
        preferred_language="pl",
        notes="Retiree selling property to return to Poland. Non-resident CGT and Plusvalía obligations.",
    )
    
    db.add_all([c1, c2, c3, c4, c5_polish, c6_polish, c7_polish, c8_polish, c9_polish])
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
    
    # Polish client projects (5 projects = 1/3 of total 15)
    p16_polish = Project(
        title="Purchase – Beachfront Apartment in Marbella (Polish Buyer)",
        transaction_type="Purchase",
        location="Marbella",
        status="Due Diligence",
        risk="Normal",
        bg_color="#0e1320",
        start_date=today - timedelta(days=10),
        target_close_date=today + timedelta(days=35),
        client_id=c5_polish.id,
    )
    p17_polish =Project(
        title="Sale – Townhouse in Mijas (Polish Seller)",
        transaction_type="Sale",
        location="Mijas",
        status="Contracts",
        risk="At Risk",
        bg_color="#0a1714",
        start_date=today - timedelta(days=18),
        target_close_date=today + timedelta(days=22),
        client_id=c6_polish.id,
    )
    p18_polish = Project(
        title="Purchase – Villa in Estepona for Rental (Polish Investment)",
        transaction_type="Purchase",
        location="Estepona",
        status="Notary",
        risk="Normal",
        bg_color="#0f1521",
        start_date=today - timedelta(days=32),
        target_close_date=today + timedelta(days=8),
        client_id=c7_polish.id,
    )
    p19_polish = Project(
        title="Purchase – New-build in Manilva (Polish Investor)",
        transaction_type="Purchase",
        location="Estepona",
        status="Due Diligence",
        risk="At Risk",
        bg_color="#0c1422",
        start_date=today - timedelta(days=25),
        target_close_date=today + timedelta(days=40),
        client_id=c8_polish.id,
    )
    p20_polish = Project(
        title="Sale – Apartment in Fuengirola (Polish Retiree)",
        transaction_type="Sale",
        location="Mijas",
        status="Registry",
        risk="Normal",
        bg_color="#0d1523",
        start_date=today - timedelta(days=60),
        target_close_date=today - timedelta(days=15),
        client_id=c9_polish.id,
    )

    projects = [p1, p2, p16_polish, p3, p4, p17_polish, p5, p6, p18_polish, p7, p8, p19_polish, p9, p10, p20_polish, p11, p12, p13, p14, p15]
    db.add_all(projects)
    db.flush()

    # --- NEW: Fiscal, Recurring & Rental Demo Data ---
    
    # Rental Management for p18 (Polish Investment Villa)
    rm1 = RentalManagement(
        project_id=p18_polish.id,
        rental_status="Active",
        tenant_name="Soren & Elin Larsen",
        monthly_income=4500.0,
        lease_start=date(2026, 1, 15),
        lease_end=date(2027, 1, 14),
        tourist_license="VFT/MA/99887",
        notes="High-yield holiday rental managed by local agency. Scandinavian tenants."
    )
    db.add(rm1)

    # Fiscal Obligations for p16 (Polish Purchase Marbella)
    fo1 = FiscalObligation(
        project_id=p16_polish.id,
        obligation_type="ITP (Impuesto Transmisiones Patrimoniales)",
        amount=56000.0,
        due_date=today + timedelta(days=40),
        status="Pending",
        notes="Calculated at 7% on €800k purchase price."
    )
    db.add(fo1)

    # Recurring Tasks (e.g., IRNR for Polish residents)
    rt1 = RecurringTask(
        project_id=p16_polish.id,
        title="IRNR Trimestral (No resident)",
        frequency="Quarterly",
        next_due_date=date(2026, 4, 20),
        is_active=True
    )
    rt2 = RecurringTask(
        project_id=p18_polish.id,
        title="IRNR Trimestral Ingresos Alquiler",
        frequency="Quarterly",
        next_due_date=date(2026, 4, 20),
        is_active=True
    )
    rt3 = RecurringTask(
        project_id=p20_polish.id,
        title="IBI Anual (Impuesto Bienes Inmuebles)",
        frequency="Annual",
        next_due_date=date(2026, 11, 15),
        is_active=True
    )
    db.add_all([rt1, rt2, rt3])
    db.flush()

    # Helpers
    def add_task(p, title, status, assignee, due_in, priority="Medium", tags=None, desc=None):
        status_map = {
            "Backlog": "Pendiente",
            "In Progress": "En curso",
            "Review": "Revisión",
            "Done": "Hecho",
        }
        priority_map = {
            "Low": "Baja",
            "Medium": "Media",
            "High": "Alta",
        }
        status = status_map.get(status, status)
        priority = priority_map.get(priority, priority)
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
    
    # Polish projects tasks (p16-p20)
    # p16 (Polish Purchase - Beachfront Marbella) — Due Diligence
    add_task(p16_polish, "Coordinar solicitud NIE con consulado polaco", "In Progress", "Ana", 3, "High", "NIE,Poland", "Agendar cita en consulado polaco de Málaga para solicitud NIE.")
    add_task(p16_polish, "Configurar sistema IRNR trimestral", "Backlog", "Lucía", 8, "Medium", "Taxes,IRNR", "Preparar sistema de declaración trimestral IRNR para no residente.")
    add_task(p16_polish, "Solicitar Nota Simple propiedad costera", "In Progress", "Lucía", 2, "High", "DD,Registry", "Obtener extracto registral de propiedad frente al mar.")
    add_task(p16_polish, "Verificación fondos desde Polonia", "Review", "Carlos", 5, "High", "Finance,International", "Confirmar ruta de transferencia internacional desde banco polaco.")
    
    # p17 (Polish Sale - Townhouse Mijas) — Contracts, At Risk
    add_task(p17_polish, "Calcular CGT para no residente polaco", "In Progress", "Lucía", 2, "High", "Taxes,CGT", "Cálculo impuesto ganancias capital para vendedor no residente.")
    add_task(p17_polish, "Coordinación certificado retenciones", "Backlog", "Ana", 6, "High", "Taxes,Legal", "Obtener certificado retenciones de Agencia Tributaria.")
    add_task(p17_polish, "Redactar contratos bilingües (ES/PL)", "Review", "Carlos", 4, "Medium", "Contracts,Translation", "Preparar contratos en español con resumen en polaco.")
    
    # p18 (Polish Purchase - Villa Rental Estepona) — Notary
    add_task(p18_polish, "Solicitar licencia VUT (vivienda uso turístico)", "In Progress", "Ana", 3, "High", "Rental,License", "Tramitar licencia turística para alquiler vacacional.")
    add_task(p18_polish, "Configurar IRNR trimestral ingresos alquiler", "Backlog", "Lucía", 10, "High", "Taxes,IRNR,Rental", "Preparar sistema declaración trimestral ingresos alquiler para no resident.")
    add_task(p18_polish, "Reservar notaría + coordinación intérprete", "In Progress", "Javier", 2, "High", "Notary,Translation", "Asegurar notaría y disponibilidad intérprete polaco si necesario.")
    add_task(p18_polish, "Redactar contrato arrendamiento estándar", "Backlog", "Carlos", 12, "Medium", "Rental,Contracts", "Preparar contrato alquiler vacacional conforme normativa VUT.")
    
    # p19 (Polish Purchase - New-build Manilva) — Due Diligence, At Risk
    add_task(p19_polish, "Evaluación riesgo promotor", "In Progress", "Carlos", 5, "High", "DD,Developer", "Investigar estabilidad financiera promotor y historial proyectos.")
    add_task(p19_polish, "Verificación aval bancario", "Review", "Lucía", 3, "High", "DD,Finance", "Confirmar aval bancario cubre precio total compra.")
    add_task(p19_polish, "Apoyo NIE comprador polaco", "Done", "Ana", -2, "Low", "NIE,Poland", "NIE solicitado en consulado polaco.")
    
    # p20 (Polish Sale - Fuengirola Retiree) — Registry, completed
    add_task(p20_polish, "Presentación Plusvalía municipal", "Done", "Lucía", -10, "Low", "Taxes", "Plusvalía municipal presentada y pagada.")
    add_task(p20_polish, "Orientación CGT vendedor no residente", "Done", "Lucía", -12, "Low", "Taxes,CGT", "Guía fiscal CGT para vendedor polaco completada.")
    add_task(p20_polish, "Confirmación registro finalizado", "Done", "Lucía", -8, "Low", "Registry", "Escritura registrada exitosamente.")

    # Timeline: phases + milestone per project
    def add_timeline(p, close_in_days):
        phases = [
            ("Admisión", -8, -2),
            ("Debida Diligencia", -2, 10),
            ("Contratos", 6, 18),
            ("Notaría", 14, 22),
            ("Registro", 20, 40),
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
        db.add(TimelineItem(project_id=p.id, label="Finalización objetivo", start_date=close, end_date=close, kind="Milestone"))

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
        elif p.id == p16_polish.id:
            add_timeline(p16_polish, 35)
        elif p.id == p17_polish.id:
            add_timeline(p17_polish, 22)
        elif p.id == p18_polish.id:
            add_timeline(p18_polish, 8)
        elif p.id == p19_polish.id:
            add_timeline(p19_polish, 40)
        elif p.id == p20_polish.id:
            add_timeline(p20_polish, -15)

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
    add_activity(p1, "Ana López", "Asunto abierto", "Revisando bloqueos de diligencia debida para compra en Marbella.", 12)
    add_activity(p1, "Lucía", "Solicitado", "Solicitud de Nota Simple enviada al Registro de la Propiedad.", 8)
    add_activity(p1, "Carlos", "Comentado", "Borrador de Arras listo para revisión del socio.", 5)
    add_activity(p1, "Ana López", "Archivo subido", "Añadidas fotos de la propiedad y estatutos de la comunidad.", 3)
    add_activity(p1, "System", "Tarea completada", "Enviado email de orientación para cuenta bancaria española.", 2)
    add_activity(p1, "Carlos", "Tarea actualizada", "Contrato de Arras pasado a estado Revisión.", 1)

    # p2 (Marbella Sale) - Mid-project with various activities
    add_activity(p2, "Ana López", "Documentos recopilados", "Recopilado DNI/pasaporte del vendedor y justificante de domicilio.", 18)
    add_activity(p2, "System", "Plazo", "El certificado energético vence hoy.", 2)
    add_activity(p2, "Javier", "Banco contactado", "Solicitado saldo para cancelación de hipoteca.", 5)
    add_activity(p2, "Lucía", "Calculado", "Estimación de Plusvalía completada para el vendedor.", 3)
    add_activity(p2, "Ana López", "Archivo subido", "Añadidos certificado energético y valoración fiscal.", 4)
    add_activity(p2, "Carlos", "Borrador", "Borrador de contrato de reserva en preparación.", 1)

    # p3 (Mijas Purchase) - Critical project with urgent activity
    add_activity(p3, "System", "Riesgo escalado", "Notaría en 1 semana; confirmación de NIE vencida.", 3)
    add_activity(p3, "Ana López", "Seguimiento", "Seguimiento del estado de confirmación del NIE.", 5)
    add_activity(p3, "Lucía", "Preparado", "Estado de liquidación y ruta de fondos listos.", 2)
    add_activity(p3, "Javier", "Reservado", "Cita notarial confirmada para la próxima semana.", 1)
    add_activity(p3, "Carlos", "Revisado", "Revisión final del borrador de escritura completada.", 4)
    add_activity(p3, "Ana López", "Archivo subido", "Añadidos solicitud de NIE y confirmación de transferencia bancaria.", 6)

    # p4 (Estepona New-build) - Handover project
    add_activity(p4, "Ana López", "Recopilado", "Recibidos IDs del cliente y prueba de fondos.", 32)
    add_activity(p4, "Carlos", "Verificado", "Cobertura de garantías del promotor confirmada.", 4)
    add_activity(p4, "Ana López", "Coordinado", "Fecha de inspección de repasos (snagging) fijada.", 3)
    add_activity(p4, "Carlos", "Archivo subido", "Añadidos informe de repasos y checklist de entrega.", 2)
    add_activity(p4, "Lucía", "Preparado", "Carta de cambio de titular de suministros redactada.", 1)
    add_activity(p4, "Javier", "Revisado", "Redacción del poder notarial aprobada.", 5)

    # p5 (Marbella Sale) - Post-completion
    add_activity(p5, "Lucía", "Presentado", "Escritura presentada en el Registro de la Propiedad.", 6)
    add_activity(p5, "Lucía", "Registro", "Presentación en registro retrasada; cita reprogramada.", 4)
    add_activity(p5, "Ana López", "Enviado", "Email de cierre al cliente y factura.", 5)
    add_activity(p5, "Lucía", "Presentado", "Plusvalía municipal presentada.", 2)
    add_activity(p5, "Ana López", "Archivo subido", "Añadidos cálculo final de impuestos y paquete de cierre.", 3)
    add_activity(p5, "Ana López", "Notificado", "Actualizadas comunidad y compañías de suministros.", 1)

    # Demo files (metadata) — visible in File room without upload
    # p1 (Marbella Purchase) - More comprehensive file set
    db.add(FileItem(project_id=p1.id, filename="Solicitud_Nota_Simple.pdf", stored_path="seed/Nota_Simple_Request.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p1.id, filename="Borrador_Arras_v1.docx", stored_path="seed/Arras_Draft_v1.docx", mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", uploader="Carlos"))
    db.add(FileItem(project_id=p1.id, filename="Fotos_Propiedad.zip", stored_path="seed/Property_Photos.zip", mime_type="application/zip", uploader="Ana López"))
    db.add(FileItem(project_id=p1.id, filename="Estatutos_Comunidad.pdf", stored_path="seed/HOA_Statutes.pdf", mime_type="application/pdf", uploader="Ana López"))

    # p2 (Marbella Sale) - Enhanced file set
    db.add(FileItem(project_id=p2.id, filename="Certificado_Energetico.pdf", stored_path="seed/Energy_Certificate.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p2.id, filename="Solicitud_Cancelacion_Hipoteca.pdf", stored_path="seed/Mortgage_Cancellation_Request.pdf", mime_type="application/pdf", uploader="Javier"))
    db.add(FileItem(project_id=p2.id, filename="Escritura_Escaneada.pdf", stored_path="seed/Property_Deed_Scan.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p2.id, filename="Valoracion_Fiscal_2024.pdf", stored_path="seed/Tax_Assessment_2024.pdf", mime_type="application/pdf", uploader="Lucía"))

    # p3 (Mijas Purchase) - Previously had only 1 file, now comprehensive set
    db.add(FileItem(project_id=p3.id, filename="Estado_Liquidacion.xlsx", stored_path="seed/Completion_Statement.xlsx", mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploader="Lucía"))
    db.add(FileItem(project_id=p3.id, filename="Formulario_Solicitud_NIE.pdf", stored_path="seed/NIE_Application_Form.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p3.id, filename="Confirmacion_Transferencia_Bancaria.pdf", stored_path="seed/Bank_Transfer_Confirmation.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p3.id, filename="Informe_Topografico.pdf", stored_path="seed/Property_Survey_Report.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p3.id, filename="Verificacion_Licencia_Obras.pdf", stored_path="seed/Construction_Permit_Check.pdf", mime_type="application/pdf", uploader="Ana López"))

    # p4 (Estepona Purchase) - Previously had only 1 file, now comprehensive set
    db.add(FileItem(project_id=p4.id, filename="Garantia_Promotor.pdf", stored_path="seed/Developer_Guarantee.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p4.id, filename="Planos_Obra_Nueva.pdf", stored_path="seed/New_Build_Plans.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p4.id, filename="Informe_Repasos.xlsx", stored_path="seed/Snagging_Report.xlsx", mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploader="Carlos"))
    db.add(FileItem(project_id=p4.id, filename="Checklist_Entrega.docx", stored_path="seed/Handover_Checklist.docx", mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", uploader="Ana López"))
    db.add(FileItem(project_id=p4.id, filename="Contrato_Suministros.pdf", stored_path="seed/Utilities_Contract.pdf", mime_type="application/pdf", uploader="Lucía"))

    # p5 (Marbella Sale) - Enhanced file set
    db.add(FileItem(project_id=p5.id, filename="Justificante_Presentacion_Registro.pdf", stored_path="seed/Land_Registry_Submission_Receipt.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p5.id, filename="Calculo_Final_Impuestos.xlsx", stored_path="seed/Final_Tax_Calculation.xlsx", mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploader="Lucía"))
    db.add(FileItem(project_id=p5.id, filename="Paquete_Cierre_Cliente.pdf", stored_path="seed/Client_Closing_Package.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p5.id, filename="Carta_Confirmacion_Registro.pdf", stored_path="seed/Registry_Confirmation_Letter.pdf", mime_type="application/pdf", uploader="Lucía"))

    # Add activities for additional projects
    # p6 (Marbella Beachfront) - Active DD
    add_activity(p6, "Ana López", "Asunto abierto", "Inicio de compra de apartamento frente al mar.", 8)
    add_activity(p6, "Lucía", "Solicitado", "Comprobación registral de propiedad costera iniciada.", 6)
    add_activity(p6, "Carlos", "Revisado", "Estado de licencia turística verificado.", 3)
    add_activity(p6, "Ana López", "Archivo subido", "Añadidos acuerdos de acceso a la playa.", 2)

    # p7 (Mijas Townhouse Sale) - Contracts, At Risk
    add_activity(p7, "Ana López", "Asunto abierto", "Venta de adosado en Mijas Costa.", 15)
    add_activity(p7, "System", "Riesgo escalado", "Certificado energético vencido: impacta el cierre.", 3)
    add_activity(p7, "Javier", "Banco contactado", "Solicitados detalles de cancelación de hipoteca.", 4)
    add_activity(p7, "Carlos", "Borrador", "Contrato privado de compraventa en preparación.", 1)

    # p8 (Benahavís Villa) - DD
    add_activity(p8, "Ana López", "Asunto abierto", "Compra de villa de lujo en Benahavís.", 5)
    add_activity(p8, "Carlos", "Programado", "Peritaje profesional de la propiedad reservado.", 3)
    add_activity(p8, "Lucía", "Verificado", "Derechos de agua y titularidad del pozo confirmados.", 2)
    add_activity(p8, "Ana López", "Guiado", "Proceso de solicitud de NIE explicado al cliente.", 4)

    # p9 (Estepona Marina) - Notary, Critical
    add_activity(p9, "Ana López", "Asunto abierto", "Venta de apartamento en marina con amarre.", 30)
    add_activity(p9, "System", "Riesgo escalado", "Cita notarial crítica para plazo de traspaso del amarre.", 5)
    add_activity(p9, "Lucía", "Verificado", "Titularidad del amarre confirmada.", 7)
    add_activity(p9, "Javier", "Reservado", "Cita notarial asegurada.", 2)

    # p10 (Guadalmina Penthouse) - Contracts
    add_activity(p10, "Ana López", "Asunto abierto", "Compra de ático en Guadalmina.", 18)
    add_activity(p10, "Carlos", "Revisado", "Contratos de mantenimiento del ascensor verificados.", 5)
    add_activity(p10, "Lucía", "Confirmado", "Asignación de plaza de garaje y trastero.", 3)
    add_activity(p10, "Ana López", "Aportado", "Orientación bancaria para cuenta española.", 6)

    # p11 (Coín Finca) - Registry, completed
    add_activity(p11, "Lucía", "Presentado", "Escritura registrada correctamente.", 10)
    add_activity(p11, "Lucía", "Presentado", "Plusvalía municipal completada.", 8)
    add_activity(p11, "Ana López", "Enviado", "Liquidación final y documentación.", 9)
    add_activity(p11, "Carlos", "Completado", "Entrega de la propiedad y llaves.", 9)

    # p12 (Manilva New Dev) - DD, At Risk
    add_activity(p12, "Ana López", "Asunto abierto", "Compra sobre plano en nueva promoción.", 22)
    add_activity(p12, "Carlos", "Evaluado", "Estabilidad financiera del promotor revisada.", 5)
    add_activity(p12, "Ana López", "Revisado", "Términos del contrato y cláusulas de resolución.", 8)
    add_activity(p12, "Lucía", "Verificado", "Cobertura de aval bancario confirmada.", 3)

    # p13 (Fuengirola Commercial) - Contracts
    add_activity(p13, "Ana López", "Asunto abierto", "Venta de inmueble comercial.", 12)
    add_activity(p13, "Lucía", "Verificado", "Arrendamientos comerciales y derechos del inquilino verificados.", 5)
    add_activity(p13, "Carlos", "Obtenido", "Valoración comercial independiente completada.", 4)
    add_activity(p13, "Ana López", "Completado", "Traspaso de licencia de actividad verificado.", 6)

    # p14 (Alhaurín Cortijo) - Notary, Critical
    add_activity(p14, "Ana López", "Asunto abierto", "Compra de cortijo rural.", 40)
    add_activity(p14, "Carlos", "Programado", "Levantamiento de linderos y verificación de accesos.", 7)
    add_activity(p14, "System", "Riesgo escalado", "Confirmación de clasificación agrícola vencida.", 3)
    add_activity(p14, "Lucía", "Verificado", "Derechos de extracción de agua confirmados.", 5)

    # p15 (Ojén Luxury Villa) - Registry, completed
    add_activity(p15, "Ana López", "Entregado", "Documentación completa de la transacción.", 7)
    
    # Polish Projects (p16-p20) - Activity Enrichment
    # p16 (Warsaw Investor)
    add_activity(p16_polish, "Ana López", "Asunto abierto", "Compra de villa para inversión por cliente polaco.", 10)
    add_activity(p16_polish, "Lucía", "Traducido", "Contrato de reserva traducido al polaco para revisión del cliente.", 8)
    add_activity(p16_polish, "Carlos", "NIE Tramitado", "Solicitud de NIE coordinada con la policía local.", 5)
    
    # p17 (Krakow Family)
    add_activity(p17_polish, "Ana López", "Asunto abierto", "Compra de segunda residencia en Marbella.", 7)
    add_activity(p17_polish, "Lucía", "Verificado", "Poder notarial desde Polonia recibido y validado.", 4)
    add_activity(p17_polish, "Javier", "Banco", "Apertura de cuenta española para transferencia internacional.", 3)
    
    # p18 (Rental Portfolio)
    add_activity(p18_polish, "Ana López", "Asunto abierto", "Adquisición de portfolio de alquiler vacacional.", 12)
    add_activity(p18_polish, "Carlos", "Licencia", "Solicitud de licencia turística para 3 unidades presentada.", 6)
    add_activity(p18_polish, "System", "Alerta", "Inspección técnica de la propiedad programada.", 2)
    
    # p19 (Wroclaw Tech Couple)
    add_activity(p19_polish, "Ana López", "Asunto abierto", "Compra de ático sobre plano en Estepona.", 15)
    add_activity(p19_polish, "Lucía", "Aval", "Seguro de caución del promotor verificado.", 10)
    add_activity(p19_polish, "Carlos", "Visita", "Reporte de progreso de obra enviado con fotos.", 5)
    
    # p20 (Gdansk Estate)
    add_activity(p20_polish, "Ana López", "Asunto abierto", "Venta de propiedad de herencia internacional.", 20)
    add_activity(p20_polish, "Javier", "Impuestos", "Cálculo de impuesto de sucesiones (no residentes) completado.", 12)
    add_activity(p20_polish, "Lucía", "Documentación", "Traducción jurada de certificado de defunción polaco obtenida.", 8)

    # Add files for additional projects
    # p6-p10 files
    db.add(FileItem(project_id=p6.id, filename="Verificacion_Propiedad_Costera.pdf", stored_path="seed/Coastal_Property_Check.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p6.id, filename="Verificacion_Licencia_Turistica.pdf", stored_path="seed/Tourist_License_Verification.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p7.id, filename="Divulgaciones_Vendedor.pdf", stored_path="seed/Seller_Disclosures.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p7.id, filename="Detalles_Hipoteca.pdf", stored_path="seed/Mortgage_Details.pdf", mime_type="application/pdf", uploader="Javier"))
    db.add(FileItem(project_id=p8.id, filename="Agenda_Peritaje_Propiedad.pdf", stored_path="seed/Property_Survey_Schedule.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p8.id, filename="Documento_Derechos_Agua.pdf", stored_path="seed/Water_Rights_Document.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p9.id, filename="Docs_Amarre_Marina.pdf", stored_path="seed/Marina_Berth_Docs.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p9.id, filename="Confirmacion_Reserva_Notaria.pdf", stored_path="seed/Notary_Booking_Confirmation.pdf", mime_type="application/pdf", uploader="Javier"))
    db.add(FileItem(project_id=p10.id, filename="Contrato_Ascensor.pdf", stored_path="seed/Elevator_Contract.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p10.id, filename="Asignacion_Garaje.pdf", stored_path="seed/Parking_Assignment.pdf", mime_type="application/pdf", uploader="Lucía"))

    # p11-p15 files
    db.add(FileItem(project_id=p11.id, filename="Confirmacion_Registro.pdf", stored_path="seed/Registry_Confirmation.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p11.id, filename="Recibo_Pago_Impuestos.pdf", stored_path="seed/Tax_Payment_Receipt.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p12.id, filename="Finanzas_Promotor.pdf", stored_path="seed/Developer_Financials.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p12.id, filename="Aval_Bancario.pdf", stored_path="seed/Bank_Guarantee.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p13.id, filename="Arrendamientos_Comerciales.pdf", stored_path="seed/Commercial_Leases.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p13.id, filename="Licencia_Actividad.pdf", stored_path="seed/Business_License.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p14.id, filename="Levantamiento_Linderos.pdf", stored_path="seed/Boundary_Survey.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p14.id, filename="Permiso_Agricola.pdf", stored_path="seed/Agricultural_Permit.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p15.id, filename="Divulgaciones_Lujo.pdf", stored_path="seed/Luxury_Disclosures.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p15.id, filename="Recibo_Impuesto_Transmisiones.pdf", stored_path="seed/Transfer_Tax_Receipt.pdf", mime_type="application/pdf", uploader="Lucía"))
    
    # Polish Projects (p16-p20) - File Enrichment
    db.add(FileItem(project_id=p16_polish.id, filename="Contrato_Reserva_Polaco.pdf", stored_path="seed/Reservation_Contract_Polish.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p16_polish.id, filename="Solicitud_NIE_Investor.pdf", stored_path="seed/NIE_Application.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p17_polish.id, filename="Poder_Notarial_Varsovia.pdf", stored_path="seed/Power_of_Attorney_Poland.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p18_polish.id, filename="Solicitud_Licencia_Turistica.pdf", stored_path="seed/Tourist_License_App.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p19_polish.id, filename="Seguro_Caucion_Promotor.pdf", stored_path="seed/Developer_Guarantee.pdf", mime_type="application/pdf", uploader="Lucía"))
    db.add(FileItem(project_id=p20_polish.id, filename="Certificado_Defuncion_Traducido.pdf", stored_path="seed/Death_Certificate_Translated.pdf", mime_type="application/pdf", uploader="Lucía"))

    # Seeded marker events
    for p in projects:
        add_activity(p, "System", "Proyecto demo sembrado", p.title)

    db.commit()


def normalize_legacy_demo_data(db: Session) -> None:
    """
    Best-effort, idempotent normalization for older demo DBs:
    - Translate legacy English task statuses/priorities to Spanish (frontend expects ES values)
    - Translate common activity verbs
    - Translate seeded file display names (keeps stored_path intact)
    """
    status_map = {
        "Backlog": "Pendiente",
        "In Progress": "En curso",
        "Review": "Revisión",
        "Done": "Hecho",
    }
    priority_map = {
        "Low": "Baja",
        "Medium": "Media",
        "High": "Alta",
    }
    verb_map = {
        "Opened matter": "Asunto abierto",
        "Requested": "Solicitado",
        "Commented": "Comentado",
        "Uploaded file": "Archivo subido",
        "Task completed": "Tarea completada",
        "Updated task": "Tarea actualizada",
        "Collected documents": "Documentos recopilados",
        "Deadline": "Plazo",
        "Contacted bank": "Banco contactado",
        "Calculated": "Calculado",
        "Drafted": "Borrador",
        "Risk escalated": "Riesgo escalado",
        "Chased": "Seguimiento",
        "Prepared": "Preparado",
        "Booked": "Reservado",
        "Reviewed": "Revisado",
        "Collected": "Recopilado",
        "Coordinated": "Coordinado",
        "Submitted": "Presentado",
        "Registry": "Registro",
        "Sent": "Enviado",
        "Filed": "Presentado",
        "Notified": "Notificado",
        "Scheduled": "Programado",
        "Guided": "Guiado",
        "Confirmed": "Confirmado",
        "Provided": "Aportado",
        "Completed": "Completado",
        "Assessed": "Evaluado",
        "Obtained": "Obtenido",
        "Delivered": "Entregado",
        "Seeded demo project": "Proyecto demo sembrado",
        "Created task": "Tarea creada",
        "Created project": "Asunto creado",
        "Updated project": "Asunto actualizado",
    }

    file_name_by_seed_path = {
        "seed/Nota_Simple_Request.pdf": "Solicitud_Nota_Simple.pdf",
        "seed/Arras_Draft_v1.docx": "Borrador_Arras_v1.docx",
        "seed/Property_Photos.zip": "Fotos_Propiedad.zip",
        "seed/HOA_Statutes.pdf": "Estatutos_Comunidad.pdf",
        "seed/Energy_Certificate.pdf": "Certificado_Energetico.pdf",
        "seed/Mortgage_Cancellation_Request.pdf": "Solicitud_Cancelacion_Hipoteca.pdf",
        "seed/Property_Deed_Scan.pdf": "Escritura_Escaneada.pdf",
        "seed/Tax_Assessment_2024.pdf": "Valoracion_Fiscal_2024.pdf",
        "seed/Completion_Statement.xlsx": "Estado_Liquidacion.xlsx",
        "seed/NIE_Application_Form.pdf": "Formulario_Solicitud_NIE.pdf",
        "seed/Bank_Transfer_Confirmation.pdf": "Confirmacion_Transferencia_Bancaria.pdf",
        "seed/Property_Survey_Report.pdf": "Informe_Topografico.pdf",
        "seed/Construction_Permit_Check.pdf": "Verificacion_Licencia_Obras.pdf",
        "seed/Developer_Guarantee.pdf": "Garantia_Promotor.pdf",
        "seed/New_Build_Plans.pdf": "Planos_Obra_Nueva.pdf",
        "seed/Snagging_Report.xlsx": "Informe_Repasos.xlsx",
        "seed/Handover_Checklist.docx": "Checklist_Entrega.docx",
        "seed/Utilities_Contract.pdf": "Contrato_Suministros.pdf",
        "seed/Land_Registry_Submission_Receipt.pdf": "Justificante_Presentacion_Registro.pdf",
        "seed/Final_Tax_Calculation.xlsx": "Calculo_Final_Impuestos.xlsx",
        "seed/Client_Closing_Package.pdf": "Paquete_Cierre_Cliente.pdf",
        "seed/Registry_Confirmation_Letter.pdf": "Carta_Confirmacion_Registro.pdf",
        "seed/Coastal_Property_Check.pdf": "Verificacion_Propiedad_Costera.pdf",
        "seed/Tourist_License_Verification.pdf": "Verificacion_Licencia_Turistica.pdf",
        "seed/Seller_Disclosures.pdf": "Divulgaciones_Vendedor.pdf",
        "seed/Mortgage_Details.pdf": "Detalles_Hipoteca.pdf",
        "seed/Property_Survey_Schedule.pdf": "Agenda_Peritaje_Propiedad.pdf",
        "seed/Water_Rights_Document.pdf": "Documento_Derechos_Agua.pdf",
        "seed/Marina_Berth_Docs.pdf": "Docs_Amarre_Marina.pdf",
        "seed/Notary_Booking_Confirmation.pdf": "Confirmacion_Reserva_Notaria.pdf",
        "seed/Elevator_Contract.pdf": "Contrato_Ascensor.pdf",
        "seed/Parking_Assignment.pdf": "Asignacion_Garaje.pdf",
        "seed/Registry_Confirmation.pdf": "Confirmacion_Registro.pdf",
        "seed/Tax_Payment_Receipt.pdf": "Recibo_Pago_Impuestos.pdf",
        "seed/Developer_Financials.pdf": "Finanzas_Promotor.pdf",
        "seed/Bank_Guarantee.pdf": "Aval_Bancario.pdf",
        "seed/Commercial_Leases.pdf": "Arrendamientos_Comerciales.pdf",
        "seed/Business_License.pdf": "Licencia_Actividad.pdf",
        "seed/Boundary_Survey.pdf": "Levantamiento_Linderos.pdf",
        "seed/Agricultural_Permit.pdf": "Permiso_Agricola.pdf",
        "seed/Luxury_Disclosures.pdf": "Divulgaciones_Lujo.pdf",
        "seed/Transfer_Tax_Receipt.pdf": "Recibo_Impuesto_Transmisiones.pdf",
    }

    for old, new in status_map.items():
        db.execute(text("UPDATE tasks SET status = :new WHERE status = :old"), {"new": new, "old": old})
    for old, new in priority_map.items():
        db.execute(text("UPDATE tasks SET priority = :new WHERE priority = :old"), {"new": new, "old": old})
    for old, new in verb_map.items():
        db.execute(text("UPDATE activities SET verb = :new WHERE verb = :old"), {"new": new, "old": old})
    for stored_path, filename in file_name_by_seed_path.items():
        db.execute(
            text("UPDATE files SET filename = :filename WHERE stored_path = :stored_path"),
            {"filename": filename, "stored_path": stored_path},
        )
    db.commit()

    # --- Idempotent Polish Data Enrichment (Title-based) ---
    projects = db.query(Project).all()
    
    def ensure_activity(p, actor, verb, detail):
        exists = db.query(Activity).filter(
            Activity.project_id == p.id,
            Activity.verb == verb,
            Activity.detail == detail
        ).first()
        if not exists:
            db.add(Activity(project_id=p.id, actor=actor, verb=verb, detail=detail))

    def ensure_file(p, filename, stored_path, uploader):
        exists = db.query(FileItem).filter(
            FileItem.project_id == p.id,
            FileItem.filename == filename
        ).first()
        if not exists:
            db.add(FileItem(project_id=p.id, filename=filename, stored_path=stored_path, mime_type="application/pdf", uploader=uploader))

    for p in projects:
        if "(Polish Buyer)" in p.title:
            ensure_activity(p, "Ana López", "NIE Tramitado", "Solicitud de NIE coordinada con la policía local.")
            ensure_activity(p, "Lucía", "Traducido", "Contrato de reserva traducido al polaco para revisión del cliente.")
            ensure_file(p, "Contrato_Reserva_Polaco.pdf", "seed/Reservation_Contract_Polish.pdf", "Lucía")
            ensure_file(p, "Solicitud_NIE_Investor.pdf", "seed/NIE_Application.pdf", "Carlos")
        elif "(Polish Seller)" in p.title:
            ensure_activity(p, "Javier", "Impuestos", "Cálculo de impuesto de sucesiones (no residentes) completado.")
            ensure_activity(p, "Lucía", "Documentación", "Traducción jurada de certificado de defunción polaco obtenida.")
            ensure_file(p, "Certificado_Defuncion_Traducido.pdf", "seed/Death_Certificate_Translated.pdf", "Lucía")
            ensure_file(p, "Poder_Notarial_Varsovia.pdf", "seed/Power_of_Attorney_Poland.pdf", "Ana López")
        elif "(Polish Investment)" in p.title:
            ensure_activity(p, "Carlos", "Licencia", "Solicitud de licencia turística para 3 unidades presentada.")
            ensure_activity(p, "System", "Alerta", "Inspección técnica de la propiedad programada.")
            ensure_file(p, "Solicitud_Licencia_Turistica.pdf", "seed/Tourist_License_App.pdf", "Carlos")
        elif "(Polish Investor)" in p.title:
            ensure_activity(p, "Lucía", "Aval", "Seguro de caución del promotor verificado.")
            ensure_activity(p, "Carlos", "Visita", "Reporte de progreso de obra enviado con fotos.")
            ensure_file(p, "Seguro_Caucion_Promotor.pdf", "seed/Developer_Guarantee.pdf", "Lucía")
        elif "(Polish Retiree)" in p.title:
            ensure_activity(p, "Javier", "Impuestos", "Cálculo de impuesto de sucesiones (no residentes) completado.")
            ensure_activity(p, "Lucía", "Documentación", "Traducción jurada de certificado de defunción polaco obtenida.")
            ensure_file(p, "Certificado_Defuncion_Traducido.pdf", "seed/Death_Certificate_Translated.pdf", "Lucía")

    db.commit()
