import React, { useEffect } from "react";

export function Drawer({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawerOverlay" onMouseDown={onClose}>
      <div />
      <div className="drawerPanel card" onMouseDown={(e)=>e.stopPropagation()}>
        <div className="drawerHead">
          <div style={{ fontWeight: 1000 }}>{title}</div>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div className="drawerBody">{children}</div>
      </div>
    </div>
  );
}
