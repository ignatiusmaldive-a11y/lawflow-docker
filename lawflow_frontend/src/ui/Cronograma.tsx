import React, { useMemo } from "react";
import { TimelineItem, Task } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { api2 } from "../lib/api";

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const ms = d.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function Cronograma({ projectId, items, tasks }: { projectId: number; items: TimelineItem[]; tasks: Task[] }) {
  const { t } = useI18n();

  const { start, end, rows } = useMemo(() => {
    if (items.length === 0) return { start: new Date(), end: new Date(), rows: [] as TimelineItem[] };
    const dates = items.flatMap((i) => [new Date(i.start_date + "T00:00:00"), new Date(i.end_date + "T00:00:00")]);
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return { start: min, end: max, rows: items };
  }, [items]);

  const totalDays = Math.max(1, daysBetween(start, end) + 1);

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
      {/* Calendar Section */}
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("calendar")}</h2>
          <a className="btn" href={api2.calendarIcsUrl(projectId)}>
            {t("downloadIcs")}
          </a>
        </div>
        <div className="small">
          {t("calendarSubtitle")}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="timelineWrap">
        <div className="timeline">
          <div className="timelineLabels">
            {rows.map((r) => (
              <div key={r.id} className="card cardPad" style={{ padding: 10 }}>
                <div style={{ fontWeight: 1000, fontSize: 13 }}>{r.label}</div>
                <div className="small">{r.kind} · {r.start_date} → {r.end_date}</div>
              </div>
            ))}
          </div>

          <div className="timelineGrid">
            {rows.map((r) => {
              const s = new Date(r.start_date + "T00:00:00");
              const e = new Date(r.end_date + "T00:00:00");
              const startOffset = Math.max(0, daysBetween(start, s));
              const endOffset = Math.min(totalDays, daysBetween(start, e) + 1);
              const cssStart = startOffset + 1;
              const cssEnd = Math.max(cssStart + 1, endOffset + 1);
              return (
                <div key={r.id} className="barRow" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(8px, 1fr))` }}>
                  <div className="bar" style={{ ["--start" as any]: cssStart, ["--end" as any]: cssEnd }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deadline Alerts Section */}
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("deadlineAlerts")}</h2>
          <span className={"pill " + (overdue.length ? "bad" : "ok")}>
            {overdue.length ? t("overdueCount").replace("{count}", String(overdue.length)) : t("noOverdue")}
          </span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>{t("taskTableCol")}</th>
              <th>{t("assigneeTableCol")}</th>
              <th>{t("dueTableCol")}</th>
              <th>{t("statusTableCol")}</th>
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
                  {t("noUpcomingDeadlines")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

