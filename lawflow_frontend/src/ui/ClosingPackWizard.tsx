import React, { useMemo, useState } from "react";
import { ChecklistItem, Project, Task } from "../lib/api";
import { api2 } from "../lib/api";
import { formatProjectLabel } from "../lib/formatting";
import { useI18n } from "../lib/i18n";
import { Callout } from "./components/Callout";

type Step = "Notary" | "Taxes" | "Registry" | "Utilities";

function stepLabelKey(s: Step) {
  switch (s) {
    case "Notary": return "step_notary";
    case "Taxes": return "step_taxes";
    case "Registry": return "step_registry";
    case "Utilities": return "step_utilities";
  }
}

function isOverdue(due?: string | null) {
  if (!due) return false;
  const dt = new Date(due + "T00:00:00");
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return dt.getTime() < base.getTime();
}

export function ClosingPackWizard({ projectId, project, tasks, checklist }: { projectId: number; project: Project | null; tasks: Task[]; checklist: ChecklistItem[] }) {
  const { t, lang } = useI18n();
  const [step, setStep] = useState<Step>("Notary");

  const openTasks = useMemo(() => tasks.filter((x) => x.status !== "Hecho"), [tasks]);
  const overdue = useMemo(() => openTasks.filter((x) => isOverdue(x.due_date)), [openTasks]);

  const byStage = useMemo(() => {
    const m = new Map<string, { done: number; total: number }>();
    for (const c of checklist) {
      const v = m.get(c.stage) ?? { done: 0, total: 0 };
      v.total += 1;
      if (c.is_done) v.done += 1;
      m.set(c.stage, v);
    }
    return m;
  }, [checklist]);

  const missing = useMemo(() => {
    const need: Record<Step, string[]> = {
      Notary: ["Intake", "Contracts", "Notary"],
      Taxes: ["Closing"],
      Registry: ["Registry"],
      Utilities: ["Registry"],
    };
    const out: string[] = [];
    for (const s of need[step]) {
      const v = byStage.get(s);
      if (!v) continue;
      const threshold = Math.max(1, Math.ceil(v.total * 0.6));
      if (v.done < threshold) out.push(`${s}: ${v.done}/${v.total}`);
    }
    if (overdue.length) out.unshift(t("overdueTasksCount").replace("{count}", String(overdue.length)));
    return out.slice(0, 8);
  }, [step, byStage, overdue]);

  const ready = useMemo(() => overdue.length < 2 && missing.length < 3, [overdue, missing]);

  const steps: Step[] = ["Notary", "Taxes", "Registry", "Utilities"];

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <Callout title={t("wizard")} body={t("demoBody")} />

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("closingPackGen")}</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span className={"pill " + (ready ? "ok" : "warn")}>{ready ? t("ready") : t("notReady")}</span>
            <a className="btn primary" style={{ opacity: ready ? 1 : 0.5, pointerEvents: ready ? "auto" : "none" }} href={api2.closingPackUrl(projectId, lang)}>
              {t("generateZip")}
            </a>
          </div>
        </div>
        <div className="small">
          <b>{t("matterLabel")}:</b> {formatProjectLabel(project, { lang })} · <b>{t("targetLabel")}:</b> {project?.target_close_date ?? "—"} · <b>{t("riskLabel")}:</b>{" "}
          {project?.risk === "Critical" ? t("riskCritical") : project?.risk === "At Risk" ? t("riskAtRisk") : project?.risk === "Normal" ? t("riskNormal") : (project?.risk ?? "—")}
        </div>
        <div className="small" style={{ marginTop: 6 }}>
          {t("readinessGate")}
        </div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("steps")}</h2>
          <span className="pill">
            {t("step_notary")} → {t("step_taxes")} → {t("step_registry")} → {t("step_utilities")}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {steps.map((s) => (
            <button key={s} className={"tab" + (step === s ? " active" : "")} onClick={() => setStep(s)}>
              {t(stepLabelKey(s) as any)}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 1000 }}>{t("suggestedMissing")}</div>

          {missing.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {missing.map((m, i) => (
                <div key={i} className="chkItem">
                  <div className="chkLeft">
                    <span className="chipDot muted" />
                    <div>
                      <div className="chkLabel">{m}</div>
                      <div className="small">{t("autoSuggested")}</div>
                    </div>
                  </div>
                  <span className="pill warn">{t("fix")}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="small">{t("looksGoodStep")}</div>
          )}

          {overdue.length ? (
            <div className="card cardPad" style={{ padding: 12, borderColor: "color-mix(in oklab, var(--danger) 50%, var(--line))" }}>
              <div style={{ fontWeight: 1000, marginBottom: 6 }}>{t("overdueBlockers")}</div>
              <div className="small">{t("resolveToUnlock")}</div>
              <ul className="small" style={{ margin: 8, paddingLeft: 18 }}>
                {overdue.slice(0, 6).map((x) => (
                  <li key={x.id}>{x.title} · {x.assignee} · {t("duePrefix")} {x.due_date}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
