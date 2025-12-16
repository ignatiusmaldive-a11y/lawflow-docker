import React, { useMemo } from "react";
import { Task } from "../lib/api";

const STATUSES: Task["status"][] = ["Backlog", "In Progress", "Review", "Done"];
const PRIORITIES: Task["priority"][] = ["Low", "Medium", "High"];

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
          <th>Task</th>
          <th>Status</th>
          <th>Assignee</th>
          <th>Due</th>
          <th>Priority</th>
          <th>Tags</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => (
          <tr key={t.id}>
            <td style={{ fontWeight: 950 }}>{t.title}</td>
            <td>
              <select className="select" value={t.status} onChange={(e) => onEdit(t.id, { status: e.target.value as any })}>
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
                className="select"
                type="date"
                value={t.due_date ?? ""}
                onChange={(e) => onEdit(t.id, { due_date: e.target.value || null })}
              />
            </td>
            <td>
              <select className="select" value={t.priority} onChange={(e) => onEdit(t.id, { priority: e.target.value as any })}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </td>
            <td>{t.tags ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
