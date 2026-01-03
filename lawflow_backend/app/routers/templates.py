from fastapi import APIRouter
from ..schemas import TemplateOut

router = APIRouter(prefix="/templates", tags=["templates"])

# Simple demo rules per municipality (Costa del Sol)
MUNI_EN = {
    "Marbella": {
        "Purchase": {
            "checklist_overrides": [
                "Check LPO / AFO status (urban planning)",
                "Community (HOA) statutes review for short-let restrictions",
            ],
            "document_templates": [
                "Notary agenda (Marbella)",
                "Completion statement (Marbella)",
                "Utilities transfer letter (Marbella)",
            ],
        },
        "Sale": {
            "checklist_overrides": ["Mortgage cancellation coordination (common in Marbella resales)"],
            "document_templates": [
                "Seller pack checklist (Marbella)",
                "Plusvalía calculation worksheet (Marbella)",
            ],
        },
    },
    "Mijas": {
        "Purchase": {
            "checklist_overrides": ["Check rural classification / AFO where relevant (Mijas)"],
            "document_templates": ["AFO/LFO request memo (Mijas)", "Notary agenda (Mijas)"],
        },
        "Sale": {
            "checklist_overrides": ["Town hall fee confirmations (Mijas)"],
            "document_templates": ["Seller disclosure memo (Mijas)"],
        },
    },
    "Estepona": {
        "Purchase": {
            "checklist_overrides": ["New-build: developer guarantees & snagging plan (Estepona)"],
            "document_templates": ["Developer handover checklist (Estepona)"],
        },
        "Sale": {
            "checklist_overrides": ["Tourist license transfer considerations (Estepona)"],
            "document_templates": ["Tourist license transfer note (Estepona)"],
        },
    },
}

MUNI_ES = {
    "Marbella": {
        "Purchase": {
            "checklist_overrides": [
                "Comprobar LPO / AFO (urbanismo)",
                "Revisar estatutos de comunidad (HOA) por restricciones de alquiler turístico",
            ],
            "document_templates": [
                "Agenda notarial (Marbella)",
                "Estado de gastos / liquidación (Marbella)",
                "Carta de cambio de titular de suministros (Marbella)",
            ],
        },
        "Sale": {
            "checklist_overrides": ["Coordinación de cancelación de hipoteca (habitual en reventas en Marbella)"],
            "document_templates": [
                "Checklist pack vendedor (Marbella)",
                "Hoja de cálculo Plusvalía (Marbella)",
            ],
        },
    },
    "Mijas": {
        "Purchase": {
            "checklist_overrides": ["Verificar clasificación rústica / AFO si aplica (Mijas)"],
            "document_templates": ["Memo solicitud AFO/LFO (Mijas)", "Agenda notarial (Mijas)"],
        },
        "Sale": {
            "checklist_overrides": ["Confirmaciones de tasas municipales (Mijas)"],
            "document_templates": ["Memo de divulgaciones del vendedor (Mijas)"],
        },
    },
    "Estepona": {
        "Purchase": {
            "checklist_overrides": ["Obra nueva: garantías del promotor + plan de repasos (Estepona)"],
            "document_templates": ["Checklist de entrega del promotor (Estepona)"],
        },
        "Sale": {
            "checklist_overrides": ["Consideraciones de traspaso de licencia turística (Estepona)"],
            "document_templates": ["Nota de traspaso de licencia turística (Estepona)"],
        },
    },
}

@router.get("", response_model=TemplateOut)
def get_templates(municipality: str, transaction_type: str, lang: str = "es"):
    src = MUNI_EN if lang == "en" else MUNI_ES
    muni = src.get(municipality, {})
    tt = muni.get(transaction_type, {"checklist_overrides": [], "document_templates": []})
    return TemplateOut(municipality=municipality, transaction_type=transaction_type, **tt)
