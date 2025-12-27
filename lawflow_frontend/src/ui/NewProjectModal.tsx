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
  const [title, setTitle] = useState("Compra – Apartamento en Fuengirola");
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
    <Modal open={open} onClose={onClose} title="Nuevo asunto">
      <div className="grid2">
        <div>
          <div className="small" style={{ marginBottom: 4 }}>Asunto</div>
          <input className="search" style={{ width: "100%" }} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <div className="small" style={{ marginBottom: 4 }}>Transacción</div>
          <select className="select" style={{ width: "100%" }} value={transactionType} onChange={(e) => setTransactionType(e.target.value as any)}>
            <option value="Purchase">Compra</option>
            <option value="Sale">Venta</option>
          </select>
        </div>

        <div>
          <div className="small" style={{ marginBottom: 4 }}>Ubicación</div>
          <input className="search" style={{ width: "100%" }} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Marbella / Mijas / Estepona…" />
        </div>
        <div>
          <div className="small" style={{ marginBottom: 4 }}>Estado</div>
          <select className="select" style={{ width: "100%" }} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Intake">Captación</option>
            <option value="Due Diligence">Due Diligence</option>
            <option value="Contracts">Contratos</option>
            <option value="Notary">Notaría</option>
            <option value="Registry">Registro</option>
          </select>
        </div>

        <div>
          <div className="small" style={{ marginBottom: 4 }}>Riesgo</div>
          <select className="select" style={{ width: "100%" }} value={risk} onChange={(e) => setRisk(e.target.value)}>
            <option value="Normal">Normal</option>
            <option value="At Risk">En riesgo</option>
            <option value="Critical">Crítico</option>
          </select>
        </div>
        <div>
          <div className="small" style={{ marginBottom: 4 }}>Color</div>
          <div className="pill" style={{ display: "inline-flex", marginTop: 4 }}>Usa el color predeterminado</div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn" onClick={onClose}>Cancelar</button>
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
          Crear
        </button>
      </div>
    </Modal>
  );
}