import React, { useMemo } from "react";
import { useI18n } from "../lib/i18n";
import { Task } from "../lib/api";
import { api2 } from "../lib/api";

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const ms = d.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function CalendarView({ projectId, tasks }: { projectId: number; tasks: Task[] }) {
  const { t } = useI18n();
  const upcoming = useMemo(() => {
    return [...tasks]
      .filter((t) => t.due_date && t.status !== "Done")
      .map((t) => ({ ...t, d: daysUntil(t.due_date) ?? 9999 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 12);
  }, [tasks]);

  const overdue = upcoming.filter((t) => (daysUntil(t.due_date) ?? 0) < 0);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("calendar")}</h2>
          <a className="btn" href={api2.calendarIcsUrl(projectId)}>
            {t("downloadIcs")}
          </a>
        </div>
        <div className="small">
          Subscribe this matter in Google Calendar / Outlook using the ICS file. (Demo: exports task due dates + milestones.)
        </div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Deadline alerts</h2>
          <span className={"pill " + (overdue.length ? "bad" : "ok")}>{overdue.length ? `${overdue.length} overdue` : "No overdue"}</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assignee</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {upcoming.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 950 }}>{t.title}</td>
                <td>{t.assignee}</td>
                <td>{t.due_date}</td>
                <td>{t.status}</td>
              </tr>
            ))}
            {upcoming.length === 0 && (
              <tr>
                <td colSpan={4} className="small">
                  No upcoming deadlines.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
