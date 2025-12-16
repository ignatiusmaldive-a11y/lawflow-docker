import React, { useMemo, useState } from "react";
import { Modal } from "./components/Modal";
import { Project, ProjectCreate } from "../lib/api";
import { api3 } from "../lib/api";

export function NewProjectModal({
  open,
  onClose,
  clientIdFallback,
  defaultBg,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  clientIdFallback: number;
  defaultBg: string;
  onCreated: (p: Project) => void;
}) {
  const [title, setTitle] = useState("Purchase – Apartment in Fuengirola");
  const [transactionType, setTransactionType] = useState<"Purchase" | "Sale">("Purchase");
  const [location, setLocation] = useState("Marbella");
  const [risk, setRisk] = useState("Normal");
  const [status, setStatus] = useState("Intake");
  const [saving, setSaving] = useState(false);

  const payload: ProjectCreate = useMemo(
    () => ({
      title,
      transaction_type: transactionType,
      location,
      risk,
      status,
      client_id: clientIdFallback,
      bg_color: defaultBg,
    }),
    [title, transactionType, location, risk, status, clientIdFallback, defaultBg]
  );

  return (
    <Modal open={open} onClose={onClose} title="New project">
      <div className="grid2">
        <div>
          <div className="small">Title</div>
          <input className="search" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <div className="small">Transaction</div>
          <select className="select" value={transactionType} onChange={(e) => setTransactionType(e.target.value as any)}>
            <option value="Purchase">Purchase</option>
            <option value="Sale">Sale</option>
          </select>
        </div>

        <div>
          <div className="small">Location</div>
          <input className="search" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Marbella / Mijas / Estepona…" />
        </div>
        <div>
          <div className="small">Status</div>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Intake</option>
            <option>Due Diligence</option>
            <option>Contracts</option>
            <option>Notary</option>
            <option>Registry</option>
          </select>
        </div>

        <div>
          <div className="small">Risk</div>
          <select className="select" value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option>Normal</option>
            <option>At Risk</option>
            <option>Critical</option>
          </select>
        </div>
        <div>
          <div className="small">Color</div>
          <div className="pill" style={{ display: "inline-flex" }}>Uses default platform color</div>
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn" onClick={onClose}>Cancel</button>
        <button
          className="btn primary"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              const p = await api3.createProject(payload);
              onCreated(p);
              onClose();
            } finally {
              setSaving(false);
            }
          }}
        >
          Create
        </button>
      </div>
    </Modal>
  );
}
