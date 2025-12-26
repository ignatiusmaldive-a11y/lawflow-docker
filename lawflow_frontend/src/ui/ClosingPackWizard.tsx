import React, { useMemo, useState } from "react";
import { ChecklistItem, Project, Task } from "../lib/api";
import { api2 } from "../lib/api";
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
  const { t } = useI18n();
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
    if (overdue.length) out.unshift(`${overdue.length} overdue task(s)`);
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
            <a className="btn primary" style={{ opacity: ready ? 1 : 0.5, pointerEvents: ready ? "auto" : "none" }} href={api2.closingPackUrl(projectId)}>
              {t("generateZip")}
            </a>
          </div>
        </div>
        <div className="small">
          <b>Matter:</b> {project?.title ?? "—"} · <b>Target:</b> {project?.target_close_date ?? "—"} · <b>Risk:</b> {project?.risk ?? "—"}
        </div>
        <div className="small" style={{ marginTop: 6 }}>
          Readiness gate (demo): blocks if ≥2 overdue tasks or if the current step has ≥3 missing readiness items.
        </div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Steps</h2>
          <span className="pill">Notary → Taxes → Registry → Utilities</span>
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
                      <div className="small">Auto-suggested from tasks + checklist (demo)</div>
                    </div>
                  </div>
                  <span className="pill warn">Fix</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="small">Looks good for this step.</div>
          )}

          {overdue.length ? (
            <div className="card cardPad" style={{ padding: 12, borderColor: "color-mix(in oklab, var(--danger) 50%, var(--line))" }}>
              <div style={{ fontWeight: 1000, marginBottom: 6 }}>Overdue blockers</div>
              <div className="small">Resolve these to unlock “Generate ZIP”.</div>
              <ul className="small" style={{ margin: 8, paddingLeft: 18 }}>
                {overdue.slice(0, 6).map((x) => (
                  <li key={x.id}>{x.title} · {x.assignee} · due {x.due_date}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}