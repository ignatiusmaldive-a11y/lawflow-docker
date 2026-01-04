import React from "react";
import { Activity } from "../lib/api";
import { useI18n } from "../lib/i18n";

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES");
}

export function ActivityFeed({ items }: { items: Activity[] }) {
  const { t } = useI18n();
  if (items.length === 0) return <div className="small">{t("noActivity")}</div>;
  return (
    <div className="activity">
      {items.slice(0, 10).map((e) => (
        <div className="event" key={e.id}>
          <div className="avatar" style={{ width: 28, height: 28, fontSize: 12 }}>{(e.actor ?? "S").slice(0,1).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong>{e.actor}</strong> <span className="small">· {e.verb}</span>
            <div className="small" style={{ wordBreak: "break-word" }}>{e.detail ?? ""}</div>
          </div>
          <small style={{ flexShrink: 0 }}>{fmt(e.created_at)}</small>
        </div>
      ))}
    </div>
  );
}
