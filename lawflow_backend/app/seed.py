from datetime import date, timedelta
from sqlalchemy.orm import Session
from .models import Client, Project, Task, ChecklistItem, TimelineItem, Activity, FileItem

PURCHASE = [
  ("Intake", "KYC / Client onboarding + engagement letter"),
  ("Intake", "Collect passports + proof of funds"),
  ("Intake", "Apply for NIE (if needed)"),
  ("DD", "Request Nota Simple (Land Registry extract)"),
  ("DD", "Check cargas/encumbrances + ownership"),
  ("DD", "Check IBI & community fees (HOA) paid"),
  ("DD", "Check permits, LPO / AFO if applicable"),
  ("Contracts", "Review/prepare reservation agreement"),
  ("Contracts", "Draft/review Arras contract (deposit)"),
  ("Notary", "Coordinate notary appointment (Escritura)"),
  ("Notary", "Prepare completion statement + funds routing"),
  ("Closing", "Prepare ITP/AJD filing pack"),
  ("Registry", "Present deed to Land Registry"),
  ("Registry", "Update cadastre / utilities & direct debits"),
]

SALE = [
  ("Intake", "Engagement letter + seller KYC"),
  ("DD", "Obtain Nota Simple + verify title"),
  ("DD", "Energy certificate + required disclosures"),
  ("Contracts", "Draft/review reservation + Arras"),
  ("Notary", "Notary coordination + cancel charges (if any)"),
  ("Closing", "Calculate Plusvalía municipal + CGT guidance"),
  ("Registry", "Register transfer + notify utilities/HOA"),
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

    # Matters (ensure Marbella, Mijas, Estepona are present)
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

    db.add_all([p1, p2, p3, p4, p5])
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
    add_task(p1, "Request Nota Simple + check cargas", "In Progress", "Lucía", 1, "High", "DD,Registry")
    add_task(p1, "Verify HOA fees + IBI receipts", "Backlog", "Ana", 5, "Medium", "DD")
    add_task(p1, "Check LPO/AFO status with town hall", "Review", "Carlos", -2, "High", "DD,Urbanism", "Overdue: waiting on town hall reply.")
    add_task(p1, "Draft/review Arras contract (buyer-friendly)", "Review", "Carlos", 2, "High", "Contracts")
    add_task(p1, "Open Spanish bank account guidance email", "Done", "Ana", -6, "Low", "Client")

    # p2 (Marbella sale) — Contracts
    add_task(p2, "Coordinate energy certificate + disclosures", "In Progress", "Ana", 0, "High", "DD")
    add_task(p2, "Draft reservation agreement", "Backlog", "Carlos", 3, "Medium", "Contracts")
    add_task(p2, "Mortgage cancellation: request outstanding balance", "In Progress", "Javier", -1, "High", "Notary,Bank")
    add_task(p2, "Plusvalía estimate for seller", "Review", "Lucía", 7, "Medium", "Taxes")
    add_task(p2, "Collect seller ID + proof of address", "Done", "Ana", -10, "Low", "KYC")

    # p3 (Mijas purchase) — Critical, Notary soon
    add_task(p3, "Book notary slot + circulate completion agenda", "In Progress", "Javier", 1, "High", "Notary")
    add_task(p3, "Prepare completion statement + funds routing", "In Progress", "Lucía", 2, "High", "Closing")
    add_task(p3, "Obtain NIE certificate confirmation", "Review", "Ana", -3, "High", "NIE,KYC", "Critical path: NIE confirmation.")
    add_task(p3, "Prepare ITP/AJD filing pack", "Backlog", "Lucía", 6, "High", "Taxes,Closing")
    add_task(p3, "Final review of deed draft (Escritura)", "Backlog", "Carlos", 3, "High", "Notary")

    # p4 (Estepona new-build) — Handover / guarantees
    add_task(p4, "Developer guarantees: verify bank guarantee coverage", "In Progress", "Carlos", 2, "High", "New-build,Guarantees")
    add_task(p4, "Snagging plan: coordinate inspection date", "Review", "Ana", 4, "Medium", "New-build")
    add_task(p4, "Notary: confirm power of attorney wording", "Backlog", "Javier", 7, "Medium", "Notary")
    add_task(p4, "Prepare utilities transfer letter", "Backlog", "Lucía", 10, "Low", "Post-completion")
    add_task(p4, "Collect IDs + proof of funds", "Done", "Ana", -20, "Low", "KYC")

    # p5 (Marbella sale) — Post completion / registry
    add_task(p5, "Present deed to Land Registry", "In Progress", "Lucía", -4, "High", "Registry", "Overdue: registry appointment rescheduled.")
    add_task(p5, "Notify HOA + set up direct debit", "Backlog", "Ana", 2, "Medium", "HOA,Utilities")
    add_task(p5, "File Plusvalía (municipal tax)", "Review", "Lucía", 1, "High", "Taxes")
    add_task(p5, "Close out file + archive documents", "Backlog", "Ana", 14, "Low", "Admin")
    add_task(p5, "Client completion email + invoice", "Done", "Ana", -2, "Low", "Client,Billing")

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

    add_timeline(p1, 30)
    add_timeline(p2, 18)
    add_timeline(p3, 6)
    add_timeline(p4, 10)
    add_timeline(p5, -3)

    # Checklist: vary completion states to demo progress + readiness
    def add_checklist(p):
        template = PURCHASE if p.transaction_type == "Purchase" else SALE
        for idx, (stage, label) in enumerate(template):
            # More advanced completion pattern
            done = False
            if p.id == p3.id and stage in ("Intake", "Contracts"):
                done = idx < 3
            elif p.id == p5.id:
                done = idx < 4
            else:
                done = idx < 2

            db.add(
                ChecklistItem(
                    project_id=p.id,
                    stage=stage,
                    label=label,
                    is_done=done,
                    due_date=today + timedelta(days=idx * 2 + 1),
                )
            )

    for p in [p1, p2, p3, p4, p5]:
        add_checklist(p)

    # Activity: richer feed
    def add_activity(p, actor, verb, detail):
        db.add(Activity(project_id=p.id, actor=actor, verb=verb, detail=detail))

    add_activity(p1, "Ana López", "Opened matter", "Reviewing DD blockers for Marbella purchase.")
    add_activity(p1, "Lucía", "Requested", "Nota Simple request sent to Land Registry.")
    add_activity(p1, "Carlos", "Commented", "Arras draft ready for partner review.")
    add_activity(p2, "System", "Deadline", "Energy certificate due today.")
    add_activity(p2, "Javier", "Contacted bank", "Requested mortgage cancellation balance.")
    add_activity(p3, "System", "Risk escalated", "Notary in 1 week; NIE confirmation overdue.")
    add_activity(p3, "Ana López", "Chased", "NIE confirmation status follow-up.")
    add_activity(p4, "Carlos", "Uploaded evidence", "Developer guarantee scan pending verification.")
    add_activity(p5, "Lucía", "Registry", "Registry submission delayed; appointment rescheduled.")

    # Demo files (metadata) — visible in File room without upload
    db.add(FileItem(project_id=p1.id, filename="Nota_Simple_Request.pdf", stored_path="seed/Nota_Simple_Request.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p1.id, filename="Arras_Draft_v1.docx", stored_path="seed/Arras_Draft_v1.docx", mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", uploader="Carlos"))
    db.add(FileItem(project_id=p2.id, filename="Energy_Certificate.pdf", stored_path="seed/Energy_Certificate.pdf", mime_type="application/pdf", uploader="Ana López"))
    db.add(FileItem(project_id=p2.id, filename="Mortgage_Cancellation_Request.pdf", stored_path="seed/Mortgage_Cancellation_Request.pdf", mime_type="application/pdf", uploader="Javier"))
    db.add(FileItem(project_id=p3.id, filename="Completion_Statement.xlsx", stored_path="seed/Completion_Statement.xlsx", mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", uploader="Lucía"))
    db.add(FileItem(project_id=p4.id, filename="Developer_Guarantee.pdf", stored_path="seed/Developer_Guarantee.pdf", mime_type="application/pdf", uploader="Carlos"))
    db.add(FileItem(project_id=p5.id, filename="Land_Registry_Submission_Receipt.pdf", stored_path="seed/Land_Registry_Submission_Receipt.pdf", mime_type="application/pdf", uploader="Lucía"))

    # Seeded marker events
    for p in [p1, p2, p3, p4, p5]:
        add_activity(p, "System", "Seeded demo project", p.title)

    db.commit()
