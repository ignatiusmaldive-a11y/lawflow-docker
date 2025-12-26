import React, { useMemo } from "react";
import { Task } from "../lib/api";
import { daysUntil } from "../lib/formatting";

const STATUSES: Task["status"][] = ["Pendiente", "En curso", "Revisión", "Hecho"];
const PRIORITIES: Task["priority"][] = ["Baja", "Media", "Alta"];

export function TasksTable({
  tasks,
  onEdit,
}: {
  tasks: Task[];
  onEdit: (taskId: number, patch: Partial<Task>) => Promise<void>;
}) {
  const rows = useMemo(() => [...tasks].sort((a, b) => String(a.due_date ?? "").localeCompare(String(b.due_date ?? ""))), [tasks]);

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Tarea</th>
          <th>Estado</th>
          <th>Asignado</th>
          <th>Vencimiento</th>
          <th>Prioridad</th>
          <th>Etiquetas</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id}>
            <td style={{ fontWeight: 950 }}>{t.title}</td>
            <td>
              <select className="select" style={{ width: '120px' }} value={t.status} onChange={(e) => onEdit(t.id, { status: e.target.value as any })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
            <td>{t.assignee}</td>
            <td>
              <input
                className={`select ${daysUntil(t.due_date)! < 0 ? "bad" : ""} ${
                  daysUntil(t.due_date)! >= 0 && daysUntil(t.due_date)! <= 7 ? "warn" : ""
                }`}
                type="date"
                value={t.due_date ?? ""}
                onChange={(e) => onEdit(t.id, { due_date: e.target.value || null })}
              />
            </td>
            <td>
              <select className="select" style={{ width: '120px' }} value={t.priority} onChange={(e) => onEdit(t.id, { priority: e.target.value as any })}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <div>
                <div>{t.tags ?? ""}</div>
                {t.due_date && (
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
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}