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

function formatLongEsDate(dateStr?: string | null) {
  const d = parseDate(dateStr);
  if (!d) return dateStr || "";
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
  const todayLabel = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

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

  const { start, end, rows, showToday, todayPct, dateHeaders, dayHeaders, monthStarts, rangeMs, holidayMarkers, weekendBands } = useMemo(() => {
    if (allItems.length === 0) {
      const now = new Date();
      return {
        start: now,
        end: now,
        rows: [] as any[],
        showToday: true,
        todayPct: 0,
        dateHeaders: [] as any[],
        dayHeaders: [] as any[],
        monthStarts: [] as any[],
        rangeMs: 1,
        holidayMarkers: [] as any[],
        weekendBands: [] as any[]
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
    const padDays = clamp(Math.round(spanDays * 0.06), 3, 21);

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

    // Day-of-month labels under the month header (downsampled so they don't jam)
    const dayHeaders: { label: string; leftPct: number }[] = [];
    const dayMs = 24 * 60 * 60 * 1000;
    const dayWidthPct = (dayMs / rangeMs) * 100;
    const spanDaysTotal = daysBetween(start, end) + 1;
    const minLabelSpacingPct = 1.6;
    const dayStep = clamp(Math.ceil(minLabelSpacingPct / Math.max(0.001, dayWidthPct)), 1, 14);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let dayIndex = 0;
    for (let d = new Date(start.getFullYear(), start.getMonth(), start.getDate()); d <= end; d = addDays(d, 1)) {
      const dayStartPct = clamp(((d.getTime() - start.getTime()) / rangeMs) * 100, 0, 100);
      const centerPct = clamp(dayStartPct + dayWidthPct / 2, 0, 100);
      const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const isMonthStart = d.getDate() === 1;
      const isToday = dKey === todayKey;
      if (dayIndex % dayStep === 0 || isMonthStart || isToday) {
        dayHeaders.push({ label: String(d.getDate()), leftPct: centerPct });
      }
      dayIndex += 1;
    }

    // Month start lines (to help spot boundaries in the grid)
    const monthStarts: { leftPct: number }[] = [];
    let monthCursor = new Date(start.getFullYear(), start.getMonth(), 1);
    if (monthCursor < start) monthCursor = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    while (monthCursor <= end) {
      const leftPct = clamp(((monthCursor.getTime() - start.getTime()) / rangeMs) * 100, 0, 100);
      if (leftPct > 0 && leftPct < 100) monthStarts.push({ leftPct });
      monthCursor = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1);
    }

    // Weekend background bands
    const weekendBands = [] as { leftPct: number; widthPct: number }[];
    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    for (let d = startDay; d <= endDay; d = addDays(d, 1)) {
      const dow = d.getDay(); // 0=Sun, 6=Sat
      if (dow !== 0 && dow !== 6) continue;
      const segStart = d < start ? start : d;
      const segEndCandidate = addDays(d, 1);
      const segEnd = segEndCandidate > end ? end : segEndCandidate;
      const leftPct = clamp(((segStart.getTime() - start.getTime()) / rangeMs) * 100, 0, 100);
      const widthPct = clamp(((segEnd.getTime() - segStart.getTime()) / rangeMs) * 100, 0, 100);
      if (widthPct > 0) weekendBands.push({ leftPct, widthPct });
    }

    // Holiday Markers
    const markers = holidays.map(h => {
      const d = parseDate(h);
      if (!d || d < start || d > end) return null;
      return {
        leftPct: ((d.getTime() - start.getTime()) / rangeMs) * 100
      };
    }).filter(Boolean);

    return { start, end, rows: allItems, showToday, todayPct, dateHeaders: headers, dayHeaders, monthStarts, rangeMs, holidayMarkers: markers, weekendBands };
  }, [allItems, tasks, holidays]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("timeline")}</h2>
        </div>
        <div className="timelineWrap">
          <div className="timeline">
            <div className="timelineHeader">
              {showToday && rangeMs > 0 && (
                <>
                  <div className="todayHeaderLine" style={{ left: `${todayPct}%` }} />
                  <div className="todayHeaderBadge" style={{ left: `${todayPct}%` }}>
                    {todayLabel}
                  </div>
                </>
              )}
              {dayHeaders.map((d: any, idx: number) => (
                <div key={idx} className="timelineDayItem" style={{ left: `${d.leftPct}%` }}>
                  {d.label}
                </div>
              ))}
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

            <div className="timelineGrid">
              {weekendBands.map((b: any, idx: number) => (
                <div key={idx} className="weekendBand" style={{ left: `${b.leftPct}%`, width: `${b.widthPct}%` }} />
              ))}

              {holidayMarkers.map((m: any, idx: number) => (
                <div key={idx} className="holidayGridLine" style={{ left: `${m.leftPct}%` }} />
              ))}

              {monthStarts.map((m: any, idx: number) => (
                <div key={idx} className="monthGridLine" style={{ left: `${m.leftPct}%` }} />
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

                const barClassName = `bar${r.type === "fiscal" ? " fiscal" : r.type === "recurring" ? " recurring" : ""}`;

                return (
                  <div key={r.id} className="barRow">
                    {r.kind === 'Milestone' ? (
                      <>
                        <div
                          className="milestoneDiamond"
                          style={{
                            ["--x" as any]: `${endPct}%`,
                            backgroundColor: r.type === 'fiscal' ? 'var(--warn)' : r.type === 'recurring' ? 'var(--brand2)' : 'var(--warn)'
                          }}
                        />
                        <div className="milestoneLabel" style={{ left: `${endPct}%` }}>
                          {r.label}
                        </div>
                      </>
                    ) : (
                      <div
                        className={barClassName}
                        style={{
                          ["--start" as any]: `${startPct}%`,
                          ["--width" as any]: `${widthPct}%`,
                        }}
                        title={r.label}
                      >
                        <div className="barText">{r.label}</div>
                      </div>
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
	            <table className="table timelineTable">
	              <thead>
	                <tr>
	                  <th>Concepto</th>
	                  <th>Vencimiento</th>
	                  <th>Estado</th>
	                </tr>
	              </thead>
	              <tbody>
	                {fiscal.map(f => (
	                  <tr key={f.id}>
	                    <td className="timelinePrimaryCell">{f.obligation_type}</td>
	                    <td>{formatLongEsDate(f.due_date || f.filing_deadline)}</td>
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
          <table className="table timelineTable">
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
                  <td className="timelinePrimaryCell" style={{ minWidth: "160px" }}>{t.title}</td>
                  <td>{t.assignee}</td>
                  <td>{formatLongEsDate(t.due_date)}</td>
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
