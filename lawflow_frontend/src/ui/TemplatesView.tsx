import React, { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";
import { api2, Template } from "../lib/api";

const MUNICIPALITIES = ["Marbella", "Mijas", "Estepona"] as const;

export function TemplatesView({ municipality, transactionType }: { municipality: string; transactionType: string }) {
  const { t } = useI18n();
  const [tpl, setTpl] = useState<Template | null>(null);

  useEffect(() => {
    api2.template(municipality, transactionType).then(setTpl).catch(console.error);
  }, [municipality, transactionType]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("templatesByMunicipality")}</h2>
          <span className="pill">{municipality}</span>
        </div>
        <div className="small">
          These are demo template rules (Costa del Sol). Real firms usually maintain these as editable checklists + document templates.
        </div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Checklist overrides</h2>
          <span className="pill">{transactionType}</span>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {(tpl?.checklist_overrides ?? []).map((x, i) => (
            <div key={i} className="chkItem">
              <div className="chkLeft">
                <span className="chipDot" />
                <div>
                  <div className="chkLabel">{x}</div>
                  <div className="small">Applies to: {municipality} · {transactionType}</div>
                </div>
              </div>
              <span className="pill">Template</span>
            </div>
          ))}
          {(tpl?.checklist_overrides?.length ?? 0) === 0 && <div className="small">No overrides for this combination.</div>}
        </div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Document templates</h2>
          <span className="pill">{(tpl?.document_templates?.length ?? 0) + " items"}</span>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {(tpl?.document_templates ?? []).map((x, i) => (
            <div key={i} className="chkItem">
              <div className="chkLeft">
                <span className="chipDot muted" />
                <div>
                  <div className="chkLabel">{x}</div>
                  <div className="small">Location pack: {municipality}</div>
                </div>
              </div>
              <button className="btn">Preview</button>
            </div>
          ))}
          {(tpl?.document_templates?.length ?? 0) === 0 && <div className="small">No document templates available.</div>}
        </div>
      </div>
    </div>
  );
}

export const MUNICIPALITIES_LIST = MUNICIPALITIES as unknown as string[];
