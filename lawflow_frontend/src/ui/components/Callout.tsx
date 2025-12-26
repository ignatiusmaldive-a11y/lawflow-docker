import React from "react";

export function Callout({ title, body, onDismiss, actionLabel }: { title: string; body: string; onDismiss?: () => void; actionLabel?: string }) {
  return (
    <div className="callout">
      <div>
        <div style={{ fontWeight: 1000, marginBottom: 4 }}>{title}</div>
        <div className="small">{body}</div>
      </div>
      {onDismiss ? <button className="btn" onClick={onDismiss}>{actionLabel ?? "Got it"}</button> : null}
    </div>
  );
}
