import React, { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";
import { api2, Template } from "../lib/api";
import { formatTransactionType } from "../lib/formatting";

const MUNICIPALITIES = ["Marbella", "Mijas", "Estepona"] as const;

export function TemplatesView({ municipality, transactionType, embedded = false }: { municipality: string; transactionType: string; embedded?: boolean }) {
  const { t, lang } = useI18n();
  const [tpl, setTpl] = useState<Template | null>(null);

  useEffect(() => {
    api2.template(municipality, transactionType, lang).then(setTpl).catch(console.error);
  }, [municipality, transactionType, lang]);

  const ChecklistOverrides = (
    <>
      <div className="sectionTitle">
        <h2>{t("checklistOverrides")}</h2>
        {!embedded && <span className="pill">{formatTransactionType(transactionType, lang)}</span>}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {(tpl?.checklist_overrides ?? []).map((x, i) => (
          <div key={i} className="chkItem">
            <div className="chkLeft">
              <span className="chipDot" />
              <div>
                <div className="chkLabel">{x}</div>
                <div className="small">{t("appliesTo")}: {municipality} · {transactionType}</div>
              </div>
            </div>
            <span className="pill">{t("template")}</span>
          </div>
        ))}
        {(tpl?.checklist_overrides?.length ?? 0) === 0 && <div className="small">{t("noOverrides")}</div>}
      </div>
    </>
  );

  const DocumentTemplates = (
    <>
      <div className="sectionTitle">
        <h2>{t("documentTemplates")}</h2>
        <span className="pill">{(tpl?.document_templates?.length ?? 0) + " " + t("items")}</span>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {(tpl?.document_templates ?? []).map((x, i) => (
          <div key={i} className="chkItem">
            <div className="chkLeft">
              <span className="chipDot muted" />
              <div>
                <div className="chkLabel">{x}</div>
                <div className="small">{t("locationPack")}: {municipality}</div>
              </div>
            </div>
            <button className="btn">{t("preview")}</button>
          </div>
        ))}
        {(tpl?.document_templates?.length ?? 0) === 0 && <div className="small">{t("noDocumentTemplates")}</div>}
      </div>
    </>
  );

  if (embedded) {
    return (
      <>
        <div className="cardSection">{ChecklistOverrides}</div>
        <div className="cardSection">{DocumentTemplates}</div>
      </>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("templatesByMunicipality")}</h2>
          <span className="pill">{municipality}</span>
        </div>
        <div className="small">{t("templatesDescription")}</div>
      </div>

      <div className="card cardPad">{ChecklistOverrides}</div>
      <div className="card cardPad">{DocumentTemplates}</div>
    </div>
  );
}

export const MUNICIPALITIES_LIST = MUNICIPALITIES as unknown as string[];
