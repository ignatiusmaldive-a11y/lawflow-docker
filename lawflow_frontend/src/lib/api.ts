export type Client = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  nationality?: string | null;
  tax_residency?: string | null;
  preferred_language?: string | null;
};

export type Project = {
  bg_color?: string;
  dropbox_folder?: string | null;

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

  // New related data from ProjectDetail
  fiscal_obligations?: FiscalObligation[];
  recurring_tasks?: RecurringTask[];
  rental_management?: RentalManagement | null;
};

export type FiscalObligation = {
  id: number;
  project_id: number;
  obligation_type: string;
  amount?: number | null;
  due_date?: string | null;
  filing_deadline?: string | null;
  status: string;
  reference_number?: string | null;
  notes?: string | null;
};

export type RecurringTask = {
  id: number;
  project_id: number;
  title: string;
  frequency: string;
  next_due_date?: string | null;
  category?: string | null;
  is_active: boolean;
  description?: string | null;
};

export type RentalManagement = {
  id: number;
  project_id: number;
  rental_status: string;
  rental_type?: string | null;
  monthly_income?: number | null;
  tenant_name?: string | null;
  lease_start?: string | null;
  lease_end?: string | null;
  tourist_license?: string | null;
  notes?: string | null;
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
  projectDetail: (projectId: number) => http<Project>(`/projects/${projectId}`),
  tasks: (projectId: number) => http<Task[]>(`/tasks?project_id=${projectId}`),
  updateTask: (id: number, patch: Partial<Task>) =>
    http<Task>(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  checklist: (projectId: number) => http<ChecklistItem[]>(`/checklists?project_id=${projectId}`),
  toggleChecklist: (id: number, is_done: boolean) =>
    http<ChecklistItem>(`/checklists/${id}`, { method: "PATCH", body: JSON.stringify({ is_done }) }),
  timeline: (projectId: number) => http<TimelineItem[]>(`/timeline?project_id=${projectId}`),
  activity: (projectId: number) => http<Activity[]>(`/activity?project_id=${projectId}`),

  // New API domain methods
  fiscal: (projectId: number) => http<FiscalObligation[]>(`/fiscal?project_id=${projectId}`),
  recurringTasks: (projectId: number) => http<RecurringTask[]>(`/recurring-tasks?project_id=${projectId}`),
  rental: (projectId: number) => http<RentalManagement[]>(`/rental?project_id=${projectId}`),
  holidays: (location: string, year = 2026) => http<string[]>(`/calendar/holidays?location=${location}&year=${year}`),
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
  template: (municipality: string, transaction_type: string, lang?: "en" | "es") =>
    http<Template>(
      `/templates?municipality=${encodeURIComponent(municipality)}&transaction_type=${encodeURIComponent(transaction_type)}${lang ? `&lang=${encodeURIComponent(lang)}` : ""
      }`,
    ),
  calendarIcsUrl: (projectId: number) => `${API_BASE}/calendar/ics?project_id=${projectId}`,
  closingPackUrl: (projectId: number, lang?: "en" | "es") =>
    `${API_BASE}/closing-pack/${projectId}${lang ? `?lang=${encodeURIComponent(lang)}` : ""}`,
  downloadFileUrl: (fileId: number) => `${API_BASE}/files/download/${fileId}`,
  viewFileUrl: (fileId: number) => `${API_BASE}/files/view/${fileId}`,
};

export type ProjectCreate = {
  title: string;
  transaction_type: string;
  location: string;
  status?: string;
  risk?: string;
  bg_color?: string;
  client_id: number;
  is_rental?: boolean;
};

export type ProjectUpdate = Partial<Pick<Project, "title" | "status" | "risk" | "target_close_date" | "bg_color" | "dropbox_folder">>;

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
  createDropboxFolder: async (projectId: number, force = false) => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/dropbox/create?force=${force ? "1" : "0"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

export type ChatResponse = {
  response: string;
};

export const api4 = {
  chat: (message: string) =>
    http<ChatResponse>(`/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};

// --- Agencies (separate DB-backed API) ---

export type Agency = {
  id: number;
  name?: string | null;
  type?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  additional_info?: string | null;
  website_status?: string | null;
  polish_city?: string | null;
  cleanup_status?: string | null;
  url_validation_date?: string | null;
};

export type AgenciesPage = {
  items: Agency[];
  total: number;
  limit: number;
  offset: number;
};

export type AgencyFacet = {
  value: string | null;
  count: number;
};

export type AgenciesMeta = {
  db_path: string;
  db_mtime?: string | null;
  total_agencies: number;
};

const AGENCIES_API_BASE = (import.meta as any).env?.VITE_AGENCIES_API_BASE ?? API_BASE;

async function httpAgencies<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${AGENCIES_API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const apiAgencies = {
  list: (args: {
    q?: string;
    type?: string[];
    polish_city?: string;
    website_status?: string;
    cleanup_status?: string;
    sort?: "name" | "type" | "polish_city" | "website_status" | "cleanup_status";
    dir?: "asc" | "desc";
    limit?: number;
    offset?: number;
    signal?: AbortSignal;
  }) => {
    const sp = new URLSearchParams();
    if (args.q) sp.set("q", args.q);
    if (args.type) for (const t of args.type) sp.append("type", t);
    if (args.polish_city) sp.set("polish_city", args.polish_city);
    if (args.website_status) sp.set("website_status", args.website_status);
    if (args.cleanup_status) sp.set("cleanup_status", args.cleanup_status);
    if (args.sort) sp.set("sort", args.sort);
    if (args.dir) sp.set("dir", args.dir);
    if (args.limit != null) sp.set("limit", String(args.limit));
    if (args.offset != null) sp.set("offset", String(args.offset));
    const qs = sp.toString();
    return httpAgencies<AgenciesPage>(`/agencies${qs ? `?${qs}` : ""}`, { signal: args.signal });
  },
  types: () => httpAgencies<AgencyFacet[]>(`/agencies/types`),
  polishCities: () => httpAgencies<AgencyFacet[]>(`/agencies/polish-cities`),
  meta: () => httpAgencies<AgenciesMeta>(`/agencies/meta`),
  get: (id: number, signal?: AbortSignal) => httpAgencies<Agency>(`/agencies/${id}`, { signal }),
};
