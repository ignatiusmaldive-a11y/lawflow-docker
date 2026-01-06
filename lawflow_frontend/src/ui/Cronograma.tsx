import React, { useMemo } from "react";
import { TimelineItem, Task, api, FiscalObligation, RecurringTask } from "../lib/api";
import { useI18n } from "../lib/i18n";

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

export function Timeline({ items, tasks, location, fiscal, recurring }: { items: TimelineItem[]; tasks: Task[]; location?: string; fiscal?: FiscalObligation[]; recurring?: RecurringTask[] }) {
  const { t } = useI18n();
  const [holidays, setHolidays] = React.useState<string[]>([]);

  const upcoming = useMemo(() => {
    return [...tasks]
      .filter((t) => t.due_date && t.status !== "Hecho")
      .map((t) => ({ ...t, d: daysUntil(t.due_date) ?? 9999 }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 12);
  }, [tasks]);

  const overdue = upcoming.filter((t) => (daysUntil(t.due_date) ?? 0) < 0);

  React.useEffect(() => {
    if (!location) return;
    api.holidays(location)
      .then(setHolidays)
      .catch(err => {
        console.error("Failed to fetch holidays:", err);
        setHolidays([]);
      });
  }, [location]);

  const allItems = useMemo(() => {
    const raw: any[] = [...items];
    (fiscal || []).forEach(f => {
      if (f.due_date) {
        raw.push({
          id: `fiscal-${f.id}`,
          label: `[IMP] ${f.obligation_type}`,
          start_date: f.due_date,
          end_date: f.due_date,
          kind: "Milestone",
          type: "fiscal"
        });
      }
    });
    (recurring || []).forEach(r => {
      if (r.next_due_date) {
        raw.push({
          id: `recurring-${r.id}`,
          label: `[REC] ${r.title}`,
          start_date: r.next_due_date,
          end_date: r.next_due_date,
          kind: "Milestone",
          type: "recurring"
        });
      }
    });
    return raw;
  }, [items, fiscal, recurring]);

  const { start, end, rows, showToday, todayPct, dateHeaders, rangeMs, holidayMarkers } = useMemo(() => {
    if (allItems.length === 0) {
      const now = new Date();
      return {
        start: now,
        end: now,
        rows: [] as any[],
        showToday: true,
        todayPct: 0,
        dateHeaders: [] as any[],
        rangeMs: 1,
        holidayMarkers: [] as any[]
      };
    }

    const allDates: Date[] = [];
    for (const it of allItems) {
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
    const padDays = clamp(Math.round(spanDays * 0.12), 7, 60);

    let start = addDays(minDate, -padDays);
    let end = addDays(maxDate, padDays);
    if (end.getTime() <= start.getTime()) end = addDays(start, 30);
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

    // Holiday Markers
    const markers = holidays.map(h => {
      const d = parseDate(h);
      if (!d || d < start || d > end) return null;
      return {
        leftPct: ((d.getTime() - start.getTime()) / rangeMs) * 100
      };
    }).filter(Boolean);

    return { start, end, rows: allItems, showToday, todayPct, dateHeaders: headers, rangeMs, holidayMarkers: markers };
  }, [allItems, tasks, holidays]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("cronograma")}</h2>
        </div>
        <div className="timelineWrap">
          <div className="timeline">
            <div className="timelineLabels" style={{ visibility: "hidden" }}></div>
            <div className="timelineHeader">
              {dateHeaders.map((header, idx: number) => (
                <div
                  key={idx}
                  className="timelineHeaderItem"
                  style={{ left: `${header.leftPct}%`, width: `${header.widthPct}%` }}
                >
                  {header.label}
                </div>
              ))}
            </div>

            <div className="timelineLabels">
              {rows.map((r: any) => (
                <div key={r.id} className="card timelineLabelItem" style={{
                  paddingLeft: r.kind === 'Milestone' ? 24 : 10,
                  fontWeight: r.kind === 'Phase' ? 800 : 500,
                  fontSize: '13px',
                  color: r.type === 'fiscal' ? 'var(--warn)' : r.type === 'recurring' ? 'var(--brand2)' : 'inherit'
                }}>
                  {r.label}
                </div>
              ))}
            </div>

            <div className="timelineGrid">
              {holidayMarkers.map((m: any, idx: number) => (
                <div key={idx} className="holidayGridLine" style={{ left: `${m.leftPct}%` }} />
              ))}

              {showToday && rangeMs > 0 && (
                <div className="todayLine" style={{ left: `${todayPct}%` }}></div>
              )}

              {rows.map((r: any) => {
                const s = parseDate(r.start_date) ?? start;
                const e = parseDate(r.end_date) ?? s;
                const eInc = addDays(e, 1);
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
                          backgroundColor: r.type === 'fiscal' ? 'var(--warn)' : r.type === 'recurring' ? 'var(--brand2)' : 'var(--warn)'
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
      </div>

      {fiscal && fiscal.length > 0 && (
        <div className="card cardPad">
          <div className="sectionTitle">
            <h2>Impuestos y Obligaciones Fiscales</h2>
            <span className="pill warn">{fiscal.filter(f => f.status !== 'Paid').length} Pendientes</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Importe</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {fiscal.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 950 }}>{f.obligation_type}</td>
                    <td>{f.amount ? `${f.amount.toLocaleString()}€` : "—"}</td>
                    <td>{f.due_date || f.filing_deadline}</td>
                    <td>
                      <span className={`pill ${f.status === 'Paid' ? 'ok' : 'warn'}`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
    </div>
  );
}
