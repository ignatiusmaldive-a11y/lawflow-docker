import React from "react";

export function Callout({ title, body, onDismiss }: { title: string; body: string; onDismiss?: () => void }) {
  return (
    <div className="callout">
      <div>
        <div style={{ fontWeight: 1000, marginBottom: 4 }}>{title}</div>
        <div className="small">{body}</div>
      </div>
      {onDismiss ? <button className="btn" onClick={onDismiss}>Got it</button> : null}
    </div>
  );
}
