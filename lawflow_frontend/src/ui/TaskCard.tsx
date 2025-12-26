import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Task } from "../lib/api";

function dot(priority: Task["priority"]) {
  if (priority === "Alta") return <span className="dot bad" />;
  if (priority === "Media") return <span className="dot warn" />;
  return <span className="dot ok" />;
}

function dueTone(due?: string | null) {
  if (!due) return "dot";
  const d = new Date(due + "T00:00:00");
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "bad";
  if (diff <= 7) return "warn";
  return "ok";
}

export function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.75 : 1,
  };

  const dueClass = dueTone(task.due_date);

  return (
    <div ref={setNodeRef} className="task" style={style} {...listeners} {...attributes} title={task.description ?? ""}>
      <div className="taskTop">
        <div className="taskTitle">{task.title}</div>
        {dot(task.priority)}
      </div>
      <div className="taskMeta">
        <span className={"dot " + dueClass} />
        <span>{task.assignee}</span>
        <span>·</span>
        <span>{task.due_date ?? "No due date"}</span>
        {task.tags ? (
          <>
            <span>·</span>
            <span>{task.tags}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}