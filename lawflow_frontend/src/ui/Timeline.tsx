import React, { useMemo } from "react";
import { TimelineItem } from "../lib/api";

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  const { start, end, rows } = useMemo(() => {
    if (items.length === 0) return { start: new Date(), end: new Date(), rows: [] as TimelineItem[] };
    const dates = items.flatMap((i) => [new Date(i.start_date + "T00:00:00"), new Date(i.end_date + "T00:00:00")]);
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));
    return { start: min, end: max, rows: items };
  }, [items]);

  const totalDays = Math.max(1, daysBetween(start, end) + 1);

  return (
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
              <div key={r.id} className="barRow" style={{ gridTemplateColumns: `repeat(${Math.min(30, totalDays)}, 22px)` }}>
                <div className="bar" style={{ ["--start" as any]: cssStart, ["--end" as any]: cssEnd }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
