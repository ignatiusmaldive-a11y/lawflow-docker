import React, { useEffect, useMemo, useState } from "react";
import { ChecklistItem, FileItem, Task } from "../lib/api";
import { useI18n } from "../lib/i18n";

export function GlobalSearchModal({
  open,
  onClose,
  tasks,
  files,
  checklist,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  files: FileItem[];
  checklist: ChecklistItem[];
  onNavigate: (view: "Board" | "Table" | "Timeline" | "Calendar" | "Files" | "Templates" | "Closing Pack") => void;
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    setQ("");
    setTimeout(() => (document.getElementById("gs-input") as HTMLInputElement | null)?.focus(), 20);
  }, [open]);

  const hits = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return [];
    const out: { kind: string; label: string; sub: string; go: () => void }[] = [];

    for (const x of tasks) {
      const hay = (x.title + " " + (x.tags ?? "") + " " + x.assignee).toLowerCase();
      if (hay.includes(qq)) out.push({ kind: "Task", label: x.title, sub: `${x.status} · ${x.assignee} · ${x.due_date ?? "—"}`, go: () => onNavigate("Table") });
    }
    for (const x of files) {
      const hay = (x.filename + " " + (x.mime_type ?? "") + " " + x.uploader).toLowerCase();
      if (hay.includes(qq)) out.push({ kind: "File", label: x.filename, sub: `${x.mime_type ?? "—"} · ${x.uploader}`, go: () => onNavigate("Files") });
    }
    for (const x of checklist) {
      const hay = (x.stage + " " + x.label).toLowerCase();
      if (hay.includes(qq)) out.push({ kind: "Checklist", label: x.label, sub: `${x.stage} · ${x.is_done ? "Done" : "Open"}`, go: () => onNavigate("Board") });
    }
    return out.slice(0, 24);
  }, [q, tasks, files, checklist, onNavigate]);

  if (!open) return null;

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontWeight: 1000 }}>{t("globalSearch")}</div>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <input id="gs-input" className="search" style={{ width: "100%" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPlaceholder")} />
        </div>
        <div style={{ marginTop: 12, display: "grid", gap: 8, maxHeight: "55vh", overflow: "auto" }}>
          {hits.map((h, idx) => (
            <button key={idx} className="chipRow" onClick={() => { h.go(); onClose(); }} title={h.sub}>
              <span className="pill" style={{ width: 78, textAlign: "center" }}>{h.kind}</span>
              <span className="chipText" style={{ fontSize: 13 }}>{h.label}</span>
              <span className="small" style={{ marginLeft: "auto" }}>{h.sub}</span>
            </button>
          ))}
          {q.trim() && hits.length === 0 ? <div className="small">{t("noResults")}</div> : null}
          {!q.trim() ? <div className="small">{t("demoBody")}</div> : null}
        </div>
      </div>
    </div>
  );
}
