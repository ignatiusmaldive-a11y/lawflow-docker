import React from "react";
import { Project, Task, ChecklistItem } from "../lib/api";
import { api2 } from "../lib/api";
import { formatProjectLabel } from "../lib/formatting";
import { useI18n } from "../lib/i18n";

export function ClosingPackView({ projectId, project, tasks, checklist }: {
  projectId: number;
  project: Project | null;
  tasks: Task[];
  checklist: ChecklistItem[];
}) {
  const { t, lang } = useI18n();
  const openTasks = tasks.filter((t) => t.status !== "Hecho");
  const done = checklist.filter((c) => c.is_done).length;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("closingPackGen")}</h2>
          <a className="btn primary" href={api2.closingPackUrl(projectId, lang)}>
            {t("generateZip")}
          </a>
        </div>
        <div className="small">
          {lang === "en"
            ? "Generates a ZIP with a notary agenda, project summary, open tasks list and the conveyancing checklist (markdown + manifest)."
            : "Genera un ZIP con agenda notarial, resumen del asunto, lista de tareas abiertas y el checklist de compraventa (markdown + manifest)."}
        </div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("readiness")}</h2>
          <span className={"pill " + (openTasks.length ? "warn" : "ok")}>{openTasks.length ? t("notReady") : t("ready")}</span>
        </div>
        <div className="small"><b>{t("matterLabel")}:</b> {formatProjectLabel(project, { lang })}</div>
        <div className="small"><b>Checklist:</b> {done}/{checklist.length} {lang === "en" ? "complete" : "completado"}</div>
        <div className="small"><b>{t("openTasks")}:</b> {openTasks.length}</div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{lang === "en" ? "Completion pack contents" : "Contenido del paquete"}</h2>
          <span className="pill">ZIP</span>
        </div>
        <ul className="small" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
          <li>{lang === "en" ? "00_Project_Summary.md" : "00_Resumen_Asunto.md"}</li>
          <li>{lang === "en" ? "01_Notary_Agenda.md" : "01_Agenda_Notaria.md"}</li>
          <li>{lang === "en" ? "02_Conveyancing_Checklist.md" : "02_Checklist_Compraventa.md"}</li>
          <li>{lang === "en" ? "03_Open_Tasks.md" : "03_Tareas_Abiertas.md"}</li>
          <li>manifest.json</li>
        </ul>
      </div>
    </div>
  );
}
