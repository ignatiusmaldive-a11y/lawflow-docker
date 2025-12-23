"""translate_checklist_items_to_spanish

Revision ID: 8be2436779fe
Revises: b99ab0f91d48
Create Date: 2025-12-23 16:04:08.159762

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8be2436779fe'
down_revision: Union[str, Sequence[str], None] = 'b99ab0f91d48'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Translation mapping for checklist items
    translation_map = {
        # Intake/Admision
        "KYC / Client onboarding + engagement letter": "KYC / Incorporación del cliente + carta de compromiso",
        "Collect passports + proof of funds": "Recopilar pasaportes + prueba de fondos",
        "Apply for NIE (if needed)": "Solicitar NIE (si es necesario)",
        "Engagement letter + seller KYC": "Carta de compromiso + KYC del vendedor",

        # DD
        "Request Nota Simple (Land Registry extract)": "Solicitar Nota Simple (extracto del Registro de la Propiedad)",
        "Check cargas/encumbrances + ownership": "Verificar cargas/gravámenes + titularidad",
        "Check IBI & community fees (HOA) paid": "Verificar pagos de IBI y cuotas comunitarias",
        "Check permits, LPO / AFO if applicable": "Verificar permisos, LPO / AFO si aplicable",
        "Obtain Nota Simple + verify title": "Obtener Nota Simple + verificar título",
        "Energy certificate + required disclosures": "Certificado energético + divulgaciones requeridas",

        # Contracts/Contratos
        "Review/prepare reservation agreement": "Revisar/preparar contrato de reserva",
        "Draft/review Arras contract (deposit)": "Redactar/revisar contrato de Arras (depósito)",
        "Draft/review reservation + Arras": "Redactar/revisar reserva + Arras",

        # Notary/Notaría
        "Coordinate notary appointment (Escritura)": "Coordinar cita notarial (Escritura)",
        "Prepare completion statement + funds routing": "Preparar declaración de finalización + ruta de fondos",
        "Notary coordination + cancel charges (if any)": "Coordinación notarial + cancelar cargas (si las hay)",

        # Closing/Cierre
        "Prepare ITP/AJD filing pack": "Preparar paquete de presentación ITP/AJD",
        "Calculate Plusvalía municipal + CGT guidance": "Calcular Plusvalía municipal + orientación sobre CGT",

        # Registry/Registro
        "Present deed to Land Registry": "Presentar escritura al Registro de la Propiedad",
        "Update cadastre / utilities & direct debits": "Actualizar catastro / suministros y débitos directos",
        "Register transfer + notify utilities/HOA": "Registrar transferencia + notificar suministros/comunidad",
    }

    # Stage translation mapping
    stage_map = {
        "Intake": "Admision",
        "Contracts": "Contratos",
        "Notary": "Notaría",
        "Closing": "Cierre",
        "Registry": "Registro",
        # DD remains as DD
    }

    # Update checklist items
    conn = op.get_bind()
    result = conn.execute(sa.text("SELECT id, label, stage FROM checklist_items"))
    checklist_items = result.fetchall()

    for item_id, label, stage in checklist_items:
        new_label = translation_map.get(label, label)  # Use translation if available, otherwise keep original
        new_stage = stage_map.get(stage, stage)  # Use stage translation if available, otherwise keep original

        if new_label != label or new_stage != stage:
            conn.execute(
                sa.text("UPDATE checklist_items SET label = :label, stage = :stage WHERE id = :id"),
                {"label": new_label, "stage": new_stage, "id": item_id}
            )


def downgrade() -> None:
    """Downgrade schema."""
    pass