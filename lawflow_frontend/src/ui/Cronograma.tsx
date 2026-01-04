import React, { useMemo } from "react";
import { TimelineItem, Task } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { api2 } from "../lib/api";

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseDate(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const ms = d.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function Timeline({ projectId, items, tasks }: { projectId: number; items: TimelineItem[]; tasks: Task[] }) {
  const { t } = useI18n();

  const { start, end, rows, showToday, todayPct, dateHeaders, rangeMs } = useMemo(() => {
    if (items.length === 0) {
      const now = new Date();
      return {
        start: now,
        end: now,
        rows: [] as TimelineItem[],
        showToday: true,
        todayPct: 0,
        dateHeaders: [] as { label: string; leftPct: number; widthPct: number }[],
        rangeMs: 1,
      };
    }

    const allDates: Date[] = [];
    for (const it of items) {
      const s = parseDate(it.start_date);
      const e = parseDate(it.end_date);
      if (s) allDates.push(s);
      if (e) allDates.push(e);
    }
    for (const task of tasks) {
      const d = parseDate(task.due_date);
      if (d) allDates.push(d);
    }

    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const spanDays = Math.max(1, daysBetween(minDate, maxDate) + 1);
    const padDays = clamp(Math.round(spanDays * 0.08), 3, 30);

    let start = addDays(minDate, -padDays);
    let end = addDays(maxDate, padDays);
    if (end.getTime() <= start.getTime()) end = addDays(start, 1);
    const rangeMs = Math.max(1, end.getTime() - start.getTime());

    const now = new Date();
    const todayRaw = ((now.getTime() - start.getTime()) / rangeMs) * 100;
    const showToday = todayRaw >= 0 && todayRaw <= 100;
    const todayPct = clamp(todayRaw, 0, 100);

    const headers: { label: string; leftPct: number; widthPct: number }[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endLimit = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endLimit) {
      const segStart = cursor < start ? start : cursor;
      const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      const segEnd = nextMonth > end ? end : nextMonth;
      const leftPct = clamp(((segStart.getTime() - start.getTime()) / rangeMs) * 100, 0, 100);
      const widthPct = clamp(((segEnd.getTime() - segStart.getTime()) / rangeMs) * 100, 0, 100);
      headers.push({
        label: cursor.toLocaleString("es-ES", { month: "short", year: "numeric" }),
        leftPct,
        widthPct,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    return { start, end, rows: items, showToday, todayPct, dateHeaders: headers, rangeMs };
  }, [items, tasks]);

  const upcoming = useMemo(() => {
    return [...tasks]
      .filter((t) => t.due_date && t.status !== "Hecho")
      .map((t) => ({ ...t, d: daysUntil(t.due_date) ?? 9999 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 12);
  }, [tasks]);

  const overdue = upcoming.filter((t) => (daysUntil(t.due_date) ?? 0) < 0);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {/* Timeline Section */}
      <div className="timelineWrap">
        <div className="timeline">
          {/* Timeline Headers */}
          <div className="timelineLabels" style={{ visibility: "hidden" }}></div> {/* Placeholder for label column */}
          <div className="timelineHeader">
            {dateHeaders.map((header, idx) => (
              <div
                key={idx}
                className="timelineHeaderItem"
                style={{ left: `${header.leftPct}%`, width: `${header.widthPct}%` }}
              >
                {header.label}
              </div>
            ))}
          </div>

          {/* Timeline Content */}
          <div className="timelineLabels">
            {rows.map((r) => (
              <div
                key={r.id}
                className="card timelineLabelItem" // Use new class for consistent height and styling
                style={{
                  paddingLeft: r.kind === 'Milestone' ? 24 : 10,
                  fontWeight: r.kind === 'Phase' ? 800 : 500,
                  fontSize: '13px',
                }}
              >
                {r.label}
              </div>
            ))}
          </div>

          <div className="timelineGrid">
            {showToday && rangeMs > 0 && (
              <div className="todayLine" style={{ left: `${todayPct}%` }}></div>
            )}
            {rows.map((r) => {
              const s = parseDate(r.start_date) ?? start;
              const e = parseDate(r.end_date) ?? s;
              const eInc = addDays(e, 1); // match prior "inclusive day" rendering
              const startPct = clamp(((s.getTime() - start.getTime()) / rangeMs) * 100, 0, 100);
              const endPct = clamp(((eInc.getTime() - start.getTime()) / rangeMs) * 100, 0, 100);
              const widthPct = Math.max(0, endPct - startPct);

              return (
                <div key={r.id} className="barRow">
                  {r.kind === 'Milestone' ? (
                    <div
                      className="milestoneDiamond"
                      style={{
                        ["--x" as any]: `${endPct}%`,
                      }}
                    />
                  ) : (
                    <div
                      className="bar"
                      style={{
                        ["--start" as any]: `${startPct}%`,
                        ["--width" as any]: `${widthPct}%`,
                      }}
                    />
                  )}
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
        <div style={{ overflowX: "auto" }}>
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
                <td style={{ fontWeight: 950, whiteSpace: "normal", minWidth: "160px" }}>{t.title}</td>
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
    </div>
  );
}
