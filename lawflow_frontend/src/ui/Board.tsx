import React, { useMemo } from "react";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task } from "../lib/api";
import { TaskCard } from "./TaskCard";

const STATUSES: Task["status"][] = ["Backlog", "In Progress", "Review", "Done"];

function Column({ status, tasks, children }: { status: Task["status"]; tasks: Task[]; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div className="column" ref={setNodeRef} style={{ outline: isOver ? "2px solid rgba(124,58,237,.45)" : "none" }}>
      <div className="columnHead">
        <div className="colName">{status}</div>
        <div className="colCount">{tasks.length}</div>
      </div>
      <div className="colBody">{children}</div>
    </div>
  );
}

export function Board({ tasks, onMove }: { tasks: Task[]; onMove: (taskId: number, next: Task["status"]) => Promise<void> }) {
  const byStatus = useMemo(() => {
    const m: Record<Task["status"], Task[]> = { "Backlog": [], "In Progress": [], "Review": [], "Done": [] };
    for (const t of tasks) m[t.status].push(t);
    return m;
  }, [tasks]);

  function onDragEnd(e: DragEndEvent) {
    const activeId = e.active?.id as string | number | undefined;
    const overId = e.over?.id as string | number | undefined;
    if (!activeId || !overId) return;

    const taskId = Number(activeId);
    const nextStatus = String(overId) as Task["status"];
    if (!STATUSES.includes(nextStatus)) return;

    const current = tasks.find((t) => t.id === taskId);
    if (!current || current.status === nextStatus) return;

    onMove(taskId, nextStatus).catch(console.error);
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="columns">
        {STATUSES.map((s) => (
          <SortableContext key={s} items={byStatus[s].map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <Column status={s} tasks={byStatus[s]}>
              {byStatus[s].map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </Column>
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}
