import React from "react";
import { Project, Task, ChecklistItem } from "../lib/api";
import { api2 } from "../lib/api";

export function ClosingPackView({ projectId, project, tasks, checklist }: {
  projectId: number;
  project: Project | null;
  tasks: Task[];
  checklist: ChecklistItem[];
}) {
  const openTasks = tasks.filter((t) => t.status !== "Done");
  const done = checklist.filter((c) => c.is_done).length;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Closing pack generation</h2>
          <a className="btn primary" href={api2.closingPackUrl(projectId)}>
            Generate ZIP
          </a>
        </div>
        <div className="small">
          Generates a ZIP with a notary agenda, project summary, open tasks list and the conveyancing checklist (markdown + manifest). Perfect for a demo “completion pack” UX.
        </div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Readiness</h2>
          <span className={"pill " + (openTasks.length ? "warn" : "ok")}>{openTasks.length ? "Not ready" : "Ready"}</span>
        </div>
        <div className="small"><b>Matter:</b> {project?.title ?? "—"}</div>
        <div className="small"><b>Checklist:</b> {done}/{checklist.length} complete</div>
        <div className="small"><b>Open tasks:</b> {openTasks.length}</div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Completion pack contents</h2>
          <span className="pill">ZIP</span>
        </div>
        <ul className="small" style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
          <li>00_Project_Summary.md</li>
          <li>01_Notary_Agenda.md</li>
          <li>02_Conveyancing_Checklist.md</li>
          <li>03_Open_Tasks.md</li>
          <li>manifest.json</li>
        </ul>
      </div>
    </div>
  );
}
