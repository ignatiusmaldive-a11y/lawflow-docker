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

  const { start, end, rows, todayOffset, dateHeaders } = useMemo(() => {
    if (items.length === 0) return { start: new Date(), end: new Date(), rows: [] as TimelineItem[], todayOffset: 0, dateHeaders: [] };
    
    // Calculate start and end dates for the timeline
    const allDates = items.flatMap((i) => [new Date(i.start_date + "T00:00:00"), new Date(i.end_date + "T00:00:00")]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    // Add some buffer around the min/max dates
    const startBuffer = new Date(minDate);
    startBuffer.setDate(minDate.getDate() - 7); // 7 days before the first item
    const endBuffer = new Date(maxDate);
    endBuffer.setDate(maxDate.getDate() + 14); // 14 days after the last item

    const start = startBuffer;
    const end = endBuffer;

    const now = new Date();
    const todayOffset = daysBetween(start, now);

    // Generate date headers (e.g., month names)
    const headers = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      if (currentDate.getDate() === 1 || headers.length === 0) { // Start of month or first header
        headers.push({
          label: currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
          offset: daysBetween(start, currentDate),
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { start, end, rows: items, todayOffset, dateHeaders: headers };
  }, [items]);

  const totalDays = Math.max(1, daysBetween(start, end) + 1);
  const todayPosition = (todayOffset / totalDays) * 100;

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
          {/* Timeline Headers */}
          <div className="timelineLabels" style={{ visibility: "hidden" }}></div> {/* Placeholder for label column */}
          <div className="timelineGrid dateHeaders" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(15px, 1fr))`, paddingLeft: 0, borderLeft: 'none' }}>
            {dateHeaders.map((header, idx) => (
              <div
                key={idx}
                style={{
                  gridColumnStart: header.offset + 1,
                  gridColumnEnd: `span ${idx + 1 < dateHeaders.length ? dateHeaders[idx + 1].offset - header.offset : totalDays - header.offset}`,
                  textAlign: 'left',
                  fontWeight: 900,
                  fontSize: '12px',
                  color: 'var(--muted)',
                  borderBottom: '1px solid var(--line)',
                  paddingBottom: '4px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
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

          <div className="timelineGrid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(15px, 1fr))` }}>
            {todayOffset >= 0 && todayOffset <= totalDays && (
              <div className="todayLine" style={{ left: `${todayPosition}%` }}></div>
            )}
            {rows.map((r) => {
              const s = new Date(r.start_date + "T00:00:00");
              const e = new Date(r.end_date + "T00:00:00");
              const startOffset = Math.max(0, daysBetween(start, s));
              const endOffset = Math.min(totalDays, daysBetween(start, e) + 1);
              const cssStart = startOffset + 1;
              const cssEnd = endOffset + 1;

              return (
                <div key={r.id} className="barRow" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(15px, 1fr))` }}>
                  {r.kind === 'Milestone' ? (
                    <div
                      className="milestoneDiamond"
                      style={{
                        gridColumnStart: cssEnd -1, // Position at the end of the milestone day
                        gridColumnEnd: cssEnd,
                      }}
                    />
                  ) : (
                    <div className="bar" style={{ ["--start" as any]: cssStart, ["--end" as any]: cssEnd }} />
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

