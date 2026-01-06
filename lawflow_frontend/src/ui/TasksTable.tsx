import React, { useMemo } from "react";
import { Task } from "../lib/api";
import { daysUntil } from "../lib/formatting";

const STATUSES: Task["status"][] = ["Pendiente", "En curso", "Revisión", "Hecho"];
const PRIORITIES: Task["priority"][] = ["Baja", "Media", "Alta"];

function formatTags(tags?: string | null) {
  if (!tags) return "";
  const dict: Record<string, string> = {
    dd: "Diligencia",
    registry: "Registro",
    contracts: "Contratos",
    legal: "Legal",
    client: "Cliente",
    banking: "Banca",
    bank: "Banco",
    hoa: "Comunidad",
    urbanism: "Urbanismo",
    energy: "Energía",
    notary: "Notaría",
    taxes: "Impuestos",
    closing: "Cierre",
    scheduling: "Agenda",
    finance: "Finanzas",
    documentation: "Documentación",
    "new-build": "Obra nueva",
    guarantees: "Garantías",
    quality: "Calidad",
    "post-completion": "Post-cierre",
    utilities: "Suministros",
    compliance: "Cumplimiento",
    admin: "Administración",
    archiving: "Archivado",
    billing: "Facturación",
    survey: "Tasación",
  };

  return tags
    .split(",")
    .map((tag) => {
      const trimmed = tag.trim();
      if (!trimmed) return "";
      return dict[trimmed.toLowerCase()] ?? trimmed;
    })
    .filter(Boolean)
    .join(", ");
}

export function TasksTable({
  tasks,
  onEdit,
}: {
  tasks: Task[];
  onEdit: (taskId: number, patch: Partial<Task>) => Promise<void>;
}) {
  const rows = useMemo(() => [...tasks].sort((a, b) => a.id - b.id), [tasks]);
  const centerCell: React.CSSProperties = { textAlign: "center" };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Tarea</th>
          <th style={centerCell}>Estado</th>
          <th style={centerCell}>Asignado</th>
          <th style={centerCell}>Vencimiento</th>
          <th style={centerCell}>Prioridad</th>
          <th>Etiquetas</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id}>
            <td style={{ fontWeight: 950, whiteSpace: "normal", minWidth: "140px" }}>{t.title}</td>
            <td style={centerCell}>
              <select
                className="select selectFit"
                value={t.status}
                onChange={(e) => onEdit(t.id, { status: e.target.value as any })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
            <td style={centerCell}>{t.assignee}</td>
            <td style={centerCell}>
              <input
                className={`select dateNoBorder ${t.status !== "Hecho" && daysUntil(t.due_date)! < 0 ? "bad" : ""} ${
                  t.status !== "Hecho" && daysUntil(t.due_date)! >= 0 && daysUntil(t.due_date)! <= 7 ? "warn" : ""
                }`}
                type="date"
                value={t.due_date ?? ""}
                onChange={(e) => onEdit(t.id, { due_date: e.target.value || null })}
                style={{ maxWidth: '130px' }}
              />
            </td>
            <td style={centerCell}>
              <select className="select selectFit" value={t.priority} onChange={(e) => onEdit(t.id, { priority: e.target.value as any })}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </td>
            <td style={{ whiteSpace: "normal", minWidth: "120px" }}>
              <div>
                <div>{formatTags(t.tags)}</div>
                {t.status === "Hecho" ? (
                  <div
                    style={{ fontSize: 10, marginTop: 2, color: "var(--brand2)" }}
                    className="ok"
                  >
                    Completado
                  </div>
                ) : (
                  t.due_date && (
                    <div
                      style={{ fontSize: 10, marginTop: 2 }}
                      className={`${daysUntil(t.due_date)! < 0 ? "bad" : ""} ${
                        daysUntil(t.due_date)! >= 0 && daysUntil(t.due_date)! <= 7 ? "warn" : ""
                      }`}
                    >
                      {daysUntil(t.due_date)! < 0
                        ? `${Math.abs(daysUntil(t.due_date)!)} días atrasado`
                        : `${daysUntil(t.due_date)!} días restantes`}
                    </div>
                  )
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
