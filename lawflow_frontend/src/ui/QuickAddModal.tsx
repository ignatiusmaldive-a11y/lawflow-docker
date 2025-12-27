import React, { useMemo, useState } from "react";
import { Modal } from "./components/Modal";
import { Task, TaskCreate } from "../lib/api";
import { api3 } from "../lib/api";

import { useI18n } from "../lib/i18n";

export function QuickAddModal({
  open,
  onClose,
  projectId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  projectId: number | null;
  onCreated: (t: Task) => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState("Confirmar agenda con notaría");
  const [assignee, setAssignee] = useState("Ana López");
  const [due, setDue] = useState<string>("");
  const [priority, setPriority] = useState("High");
  const [tags, setTags] = useState("Notaría");
  const [saving, setSaving] = useState(false);

  const payload: TaskCreate | null = useMemo(() => {
    if (!projectId) return null;
    return {
      project_id: projectId,
      title,
      assignee,
      due_date: due ? due : null,
      priority,
      tags,
      status: "Backlog",
    };
  }, [projectId, title, assignee, due, priority, tags]);

  return (
    <Modal open={open} onClose={onClose} title="Añadir tarea">
      {!projectId ? (
        <div className="small">Selecciona un asunto activo primero.</div>
      ) : (
        <div className="grid2">
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="small" style={{ marginBottom: 4 }}>Título de la tarea</div>
            <input className="search" style={{ width: "100%" }} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <div className="small" style={{ marginBottom: 4 }}>Responsable</div>
            <input className="search" style={{ width: "100%" }} value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          </div>
          <div>
            <div className="small" style={{ marginBottom: 4 }}>Fecha de vencimiento</div>
            <input className="search" style={{ width: "100%" }} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div>
            <div className="small" style={{ marginBottom: 4 }}>Prioridad</div>
            <select className="select" style={{ width: "100%" }} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Baja</option>
              <option value="Medium">Media</option>
              <option value="High">Alta</option>
            </select>
          </div>
          <div>
            <div className="small" style={{ marginBottom: 4 }}>Etiquetas</div>
            <input className="search" style={{ width: "100%" }} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Notaría, Impuestos, Registro…" />
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn" onClick={onClose}>Cancelar</button>
        <button
          className="btn primary"
          disabled={saving || !payload}
          onClick={async () => {
            if (!payload) return;
            setSaving(true);
            try {
              const t = await api3.createTask(payload);
              onCreated(t);
              onClose();
            } finally {
              setSaving(false);
            }
          }}
        >
          Añadir
        </button>
      </div>
    </Modal>
  );
}