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
  const [title, setTitle] = useState("Chase notary agenda confirmation");
  const [assignee, setAssignee] = useState("Ana López");
  const [due, setDue] = useState<string>("");
  const [priority, setPriority] = useState("High");
  const [tags, setTags] = useState("Notary");
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
    <Modal open={open} onClose={onClose} title={t("quickAdd")}>
      {!projectId ? (
        <div className="small">Select an active matter first.</div>
      ) : (
        <div className="grid2">
          <div style={{ gridColumn: "1 / -1" }}>
            <div className="small">Task title</div>
            <input className="search" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <div className="small">Assignee</div>
            <input className="search" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          </div>
          <div>
            <div className="small">Due date</div>
            <input className="search" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div>
            <div className="small">Priority</div>
            <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <div className="small">Tags</div>
            <input className="search" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Notary, Taxes, Registry…" />
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className="btn" onClick={onClose}>Cancel</button>
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
          Add
        </button>
      </div>
    </Modal>
  );
}
