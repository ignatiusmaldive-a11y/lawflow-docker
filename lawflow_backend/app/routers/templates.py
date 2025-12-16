from fastapi import APIRouter
from ..schemas import TemplateOut

router = APIRouter(prefix="/templates", tags=["templates"])

# Simple demo rules per municipality (Costa del Sol)
MUNI = {
  "Marbella": {
    "Purchase": {
      "checklist_overrides": [
        "Check LPO / AFO status (urban planning)",
        "Community (HOA) statutes review for short-let restrictions",
      ],
      "document_templates": ["Notary agenda (Marbella)", "Completion statement (Marbella)", "Utilities transfer letter (Marbella)"],
    },
    "Sale": {
      "checklist_overrides": ["Mortgage cancellation coordination (common in Marbella resales)"],
      "document_templates": ["Seller pack checklist (Marbella)", "Plusvalía calculation worksheet (Marbella)"],
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

@router.get("", response_model=TemplateOut)
def get_templates(municipality: str, transaction_type: str):
    muni = MUNI.get(municipality, {})
    tt = muni.get(transaction_type, {"checklist_overrides": [], "document_templates": []})
    return TemplateOut(municipality=municipality, transaction_type=transaction_type, **tt)
