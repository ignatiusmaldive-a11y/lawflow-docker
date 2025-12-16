import React from "react";
import { Activity } from "../lib/api";

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function ActivityFeed({ items }: { items: Activity[] }) {
  if (items.length === 0) return <div className="small">No activity yet.</div>;
  return (
    <div className="activity">
      {items.slice(0, 10).map((e) => (
        <div className="event" key={e.id}>
          <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{(e.actor ?? "S").slice(0,1).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <strong>{e.actor}</strong> <span className="small">· {e.verb}</span>
            <div className="small">{e.detail ?? ""}</div>
          </div>
          <small>{fmt(e.created_at)}</small>
        </div>
      ))}
    </div>
  );
}
