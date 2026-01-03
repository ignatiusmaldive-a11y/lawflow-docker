import React, { useMemo } from "react";
import { ChecklistItem } from "../lib/api";

export function Checklist({
  items,
  onToggle,
}: {
  items: ChecklistItem[];
  onToggle: (itemId: number, is_done: boolean) => Promise<void>;
}) {
  const grouped = useMemo(() => {
    const m = new Map<string, ChecklistItem[]>();
    for (const it of items) {
      const key = it.stage;
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(it);
    }
    return Array.from(m.entries());
  }, [items]);

  return (
    <div className="checklist">
      {grouped.map(([stage, stageItems]) => (
        <div className="chkGroup" key={stage}>
          <div className="chkHead">
            <strong>{stage}</strong>
            <span className="pill">{stageItems.filter((s) => s.is_done).length}/{stageItems.length}</span>
          </div>
          {stageItems.map((it) => (
            <div className="chkItem" key={it.id}>
              <div className="chkLeft" style={{ minWidth: 0, flex: 1 }}>
                <input type="checkbox" checked={it.is_done} onChange={(e) => onToggle(it.id, e.target.checked)} style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div className="chkLabel" style={{ whiteSpace: "normal", wordBreak: "break-word" }}>{it.label}</div>
                  <div className="small" style={{ whiteSpace: "normal" }}>Template: {stage} · Costa del Sol conveyancing</div>
                </div>
              </div>
              <div className="chkDue" style={{ flexShrink: 0, marginLeft: 10 }}>{it.due_date ?? ""}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
