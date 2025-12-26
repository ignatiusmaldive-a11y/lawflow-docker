export type Client = { id: number; name: string; email?: string | null; phone?: string | null; notes?: string | null };

export type Project = {
  bg_color?: string;

  id: number;
  title: string;
  transaction_type: "Purchase" | "Sale";
  location: string;
  status: string;
  risk: "Normal" | "At Risk" | "Critical";
  start_date?: string | null;
  target_close_date?: string | null;
  client_id?: number | null;
  client?: Client | null;
};

export type Task = {
  id: number;
  project_id: number;
  title: string;
  status: "Pendiente" | "En curso" | "Revisión" | "Hecho";
  assignee: string;
  due_date?: string | null;
  priority: "Baja" | "Media" | "Alta";
  tags?: string | null;
  description?: string | null;
};

export type ChecklistItem = {
  id: number;
  project_id: number;
  stage: string;
  label: string;
  is_done: boolean;
  due_date?: string | null;
};

export type TimelineItem = {
  id: number;
  project_id: number;
  label: string;
  start_date: string;
  end_date: string;
  kind: "Phase" | "Milestone";
};

export type Activity = {
  id: number;
  project_id: number;
  created_at: string;
  actor: string;
  verb: string;
  detail?: string | null;
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE ?? "/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  projects: () => http<Project[]>(`/projects`),
  tasks: (projectId: number) => http<Task[]>(`/tasks?project_id=${projectId}`),
  updateTask: (id: number, patch: Partial<Task>) =>
    http<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  checklist: (projectId: number) => http<ChecklistItem[]>(`/checklists?project_id=${projectId}`),
  toggleChecklist: (id: number, is_done: boolean) =>
    http<ChecklistItem>(`/checklists/${id}`, { method: "PATCH", body: JSON.stringify({ is_done }) }),
  timeline: (projectId: number) => http<TimelineItem[]>(`/timeline?project_id=${projectId}`),
  activity: (projectId: number) => http<Activity[]>(`/activity?project_id=${projectId}`),
};

export type FileItem = {
  id: number;
  project_id: number;
  filename: string;
  stored_path: string;
  mime_type?: string | null;
  uploaded_at: string;
  uploader: string;
};

export type Template = {
  municipality: string;
  transaction_type: string;
  checklist_overrides: string[];
  document_templates: string[];
};

export const api2 = {
  files: (projectId: number) => http<FileItem[]>(`/files?project_id=${projectId}`),
  uploadFile: async (projectId: number, file: File, uploader = "Ana López") => {
    const fd = new FormData();
    fd.append("project_id", String(projectId));
    fd.append("uploader", uploader);
    fd.append("file", file);
    const res = await fetch(`${API_BASE}/files/upload`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<FileItem>;
  },
  template: (municipality: string, transaction_type: string) =>
    http<Template>(`/templates?municipality=${encodeURIComponent(municipality)}&transaction_type=${encodeURIComponent(transaction_type)}`),
  calendarIcsUrl: (projectId: number) => `${API_BASE}/calendar/ics?project_id=${projectId}`,
  closingPackUrl: (projectId: number) => `${API_BASE}/closing-pack/${projectId}`,
  downloadFileUrl: (fileId: number) => `${API_BASE}/files/download/${fileId}`,
};

export type ProjectCreate = {
  title: string;
  transaction_type: string;
  location: string;
  status?: string;
  risk?: string;
  bg_color?: string;
  client_id: number;
};

export type ProjectUpdate = Partial<Pick<Project, "title" | "status" | "risk" | "target_close_date" | "bg_color">>;

export type TaskCreate = {
  project_id: number;
  title: string;
  status?: string;
  assignee?: string;
  due_date?: string | null;
  priority?: string;
  tags?: string | null;
  description?: string | null;
};

export const api3 = {
  createProject: async (payload: ProjectCreate) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as Project;
  },
  patchProject: async (projectId: number, payload: ProjectUpdate) => {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as Project;
  },
  createTask: async (payload: TaskCreate) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as Task;
  },
};