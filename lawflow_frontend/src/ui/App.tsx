import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";
import { api, Project, Task, ChecklistItem, TimelineItem, Activity, FileItem } from "../lib/api";
import { api2, api3 } from "../lib/api";
import { Board } from "./Board";
import { TasksTable } from "./TasksTable";
import { Timeline } from "./Timeline";
import { Checklist } from "./Checklist";
import { ActivityFeed } from "./ActivityFeed";
import { CalendarView } from "./CalendarView";
import { FilesRoom } from "./FilesRoom";
import { TemplatesView, MUNICIPALITIES_LIST } from "./TemplatesView";
import { ClosingPackView } from "./ClosingPackView";
import { ClosingPackWizard } from "./ClosingPackWizard";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { NewProjectModal } from "./NewProjectModal";
import { QuickAddModal } from "./QuickAddModal";
import { SettingsView } from "./SettingsView";
import { Callout } from "./components/Callout";

type View = "Board" | "Table" | "Timeline" | "Calendar" | "Files" | "Templates" | "Closing Pack" | "Settings";

const LS_RECENTS = "lawflow.recents.v1";
const LS_PINS = "lawflow.pins.v1";

const LS_PLATFORM = "lawflow.platform.settings.v1";
function loadPlatformDefaultBg() {
  try {
    const raw = localStorage.getItem(LS_PLATFORM);
    if (!raw) return "#0b1220";
    const p = JSON.parse(raw);
    return typeof p.defaultProjectBg === "string" ? p.defaultProjectBg : "#0b1220";
  } catch {
    return "#0b1220";
  }
}


function loadIds(key: string): number[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

function saveIds(key: string, ids: number[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids.slice(0, 12)));
  } catch {}
}

function upsertRecent(projectId: number) {
  const ids = loadIds(LS_RECENTS).filter((id) => id !== projectId);
  ids.unshift(projectId);
  saveIds(LS_RECENTS, ids);
  return ids;
}

function togglePin(projectId: number) {
  const ids = loadIds(LS_PINS);
  const next = ids.includes(projectId) ? ids.filter((id) => id !== projectId) : [projectId, ...ids];
  saveIds(LS_PINS, next);
  return next;
}


function riskPill(risk: Project["risk"]) {
  if (risk === "Critical") return <span className="pill bad">Critical</span>;
  if (risk === "At Risk") return <span className="pill warn">At risk</span>;
  return <span className="pill ok">Normal</span>;
}

function matterLabel(p: Project) {
  const core = p.title.replace(/^Purchase – |^Sale – /, "");
  const left = `${p.transaction_type} · ${p.location} — `;
  const max = 44;
  const remaining = Math.max(10, max - left.length);
  const trimmed = core.length > remaining ? core.slice(0, Math.max(0, remaining - 1)).trimEnd() + "…" : core;
  return left + trimmed;
}

function fmtDateShort(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function breadcrumbParts(p?: Project | null) {
  if (!p) return ["Workspace", "Matters"];
  return QColorSafe(["Workspace", "Matters", `${p.location}`, p.title.replace(/^Purchase – |^Sale – /, "")]);
}

// Avoid weird characters in breadcrumb rendering; simple passthrough with trimming
function QColorSafe(parts: string[]) {
  return parts.map((s) => String(s ?? "").trim()).filter(Boolean);
}

function daysUntil(dateStr?: string | null) {

  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const ms = d.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function App() {
  const { lang, setLang, t } = useI18n();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [defaultBg, setDefaultBg] = useState<string>(() => (typeof window !== 'undefined' ? loadPlatformDefaultBg() : '#0b1220'));


  const [view, setView] = useState<View>("Board");
  const [pinnedIds, setPinnedIds] = useState<number[]>(() => (typeof window !== 'undefined' ? loadIds(LS_PINS) : []));
  const [recentIds, setRecentIds] = useState<number[]>(() => (typeof window !== 'undefined' ? loadIds(LS_RECENTS) : []));

  const [q, setQ] = useState("");
  const [municipality, setMunicipality] = useState<string>("Marbella");
  const [sidebarOpen, setSidebarOpen] = useState(false);

const pinnedProjects = useMemo(() => {
  const set = new Set(pinnedIds);
  return projects.filter((p) => set.has(p.id));
}, [projects, pinnedIds]);

const recentProjects = useMemo(() => {
  const order = recentIds;
  const map = new Map(projects.map((p) => [p.id, p] as const));
  return order.map((id) => map.get(id)).filter(Boolean) as Project[];
}, [projects, recentIds]);

const activeProject = useMemo(

    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  async function refreshAll(projectId: number) {
    const [t, c, tl, a, f] = await Promise.all([
      api.tasks(projectId),
      api.checklist(projectId),
      api.timeline(projectId),
      api.activity(projectId),
      api2.files(projectId),
    ]);
    setTasks(t);
    setChecklist(c);
    setTimeline(tl);
    setActivity(a);
    setFiles(f as any);
  }

  useEffect(() => {
    (async () => {
      const ps = await api.projects();
      setProjects(ps);
      setActiveProjectId(ps[0]?.id ?? null);
    })().catch(console.error);
  }, []);
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === "k") {
      e.preventDefault();
      setGlobalSearchOpen(true);
    }
  }
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);


useEffect(() => {
  if (!activeProjectId) return;
  // keep 'recent matters' in localStorage
  setRecentIds(upsertRecent(activeProjectId));
  refreshAll(activeProjectId).catch(console.error);
}, [activeProjectId]);


  const filteredTasks = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return tasks;
    return tasks.filter((t) =>
      (t.title + " " + (t.tags ?? "") + " " + t.assignee).toLowerCase().includes(qq)
    );
  }, [tasks, q]);

  const kpis = useMemo(() => {
    const open = tasks.filter((t) => t.status !== "Done").length;
    const dueSoon = tasks.filter((t) => {
      const d = daysUntil(t.due_date);
      return d !== null && d <= 7 && d >= 0 && t.status !== "Done";
    }).length;
    const overdue = tasks.filter((t) => {
      const d = daysUntil(t.due_date);
      return d !== null && d < 0 && t.status !== "Done";
    }).length;
    const done = tasks.filter((t) => t.status === "Done").length;
    return { open, dueSoon, overdue, done };
  }, [tasks]);

  return (
    <div className="shell" style={{ background: (activeProject?.bg_color ?? defaultBg) }}>
      {sidebarOpen && <div className="sidebarOverlay" onClick={() => setSidebarOpen(false)} />}
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">◆</div>
          <div>
            <div className="brandName">LawFlow</div>
            <div className="small">{t("tagline")}</div>
          </div>
        </div>

        <div className="card cardPad">
          <div className="small" style={{ fontWeight: 900, marginBottom: 8 }}>{t("activeMatter")}</div>
          <select
            className="select"
            value={activeProjectId ?? undefined}
            onChange={(e) => setActiveProjectId(Number(e.target.value))}
          >
            {projects.map((p) => (
              <option value={p.id} key={p.id}>
                {matterLabel(p)}
              </option>
            ))}
          </select>
<div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
  <div className="small" style={{ fontWeight: 900 }}>
    <b>Status</b>: {activeProject?.status ?? "—"}
  </div>
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    {activeProject ? riskPill(activeProject.risk) : null}
    <button
      className="btn ghost"
      onClick={(e) => {
        e.preventDefault();
        if (!activeProject) return;
        setPinnedIds(togglePin(activeProject.id));
      }}
      title={pinnedIds.includes(activeProject?.id ?? -1) ? "Unpin matter" : "Pin matter"}
    >
      {pinnedIds.includes(activeProject?.id ?? -1) ? "★" : "☆"}
    </button>
  </div>
</div>

{pinnedProjects.length > 0 && (
  <div style={{ marginTop: 12 }}>
    <div className="small" style={{ fontWeight: 950, marginBottom: 6 }}>Pinned</div>
    <div style={{ display: "grid", gap: 6 }}>
      {pinnedProjects.slice(0, 4).map((p) => (
        <button
          key={p.id}
          className="chipRow"
          onClick={() => setActiveProjectId(p.id)}
          title={p.title}
        >
          <span className="chipDot" />
          <span className="chipText">{matterLabel(p)}</span>
        </button>
      ))}
    </div>
  </div>
)}

{recentProjects.length > 0 && (
  <div style={{ marginTop: 12 }}>
    <div className="small" style={{ fontWeight: 950, marginBottom: 6 }}>Recently opened</div>
    <div style={{ display: "grid", gap: 6 }}>
      {recentProjects.slice(0, 5).map((p) => (
        <button
          key={p.id}
          className="chipRow"
          onClick={() => setActiveProjectId(p.id)}
          title={p.title}
        >
          <span className="chipDot muted" />
          <span className="chipText">{matterLabel(p)}</span>
        </button>
      ))}
    </div>
  </div>
)}
</div>

        <nav className="nav">
          <a className="active" href="#" onClick={(e)=>{e.preventDefault(); setView("Board");}}>{t("workspace")}</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); setView("Timeline");}}>{t("timeline")}</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); setView("Table");}}>{t("taskTable")}</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); setView("Calendar");}}>{t("calendar")}</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); setView("Files");}}>{t("files")}</a>
          <a href="#" onClick={(e)=>{e.preventDefault(); setView("Templates");}}>{t("templates")}</a>
        </nav>

        <div className="sidebarFooter">
          <div className="userchip">
            <div className="avatar">A</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13 }}>Ana López</div>
              <div className="small">Legal Ops</div>
            </div>
          </div>
          <button className="btn ghost" title="Settings">⚙</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="titleRow">
            <p className="h1">{activeProject?.title ?? "Loading…"}</p>
            <p className="subtitle">
              <span className="crumbs">
  {breadcrumbParts(activeProject).map((c, idx) => (
    <span key={idx} className="crumb">{c}</span>
  ))}
</span>
            </p>
            <div className="statusStrip">
              <span className="pill">{activeProject?.transaction_type ?? "—"}</span>
              <span className="pill">{activeProject?.location ?? "—"}</span>
              <span className="pill">Target: {fmtDateShort(activeProject?.target_close_date ?? null)}</span>
              <span className="pill">Start: {fmtDateShort(activeProject?.start_date ?? null)}</span>
            </div>
          </div>
          <div className="actions">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              ☰
            </button>

            <input className="search" value={q} onChange={(e)=>setQ(e.target.value)} placeholder={t("searchPlaceholder")} />
            <div className="langToggle" title="Language / Idioma">
              <button className={"tab" + (lang==="en" ? " active" : "")} onClick={()=>setLang("en")}>{t("langEn")}</button>
              <button className={"tab" + (lang==="es" ? " active" : "")} onClick={()=>setLang("es")}>{t("langEs")}</button>
            </div>
            <button className="btn" onClick={() => setQuickAddOpen(true)} title="Quick add a task to the active matter">{t("quickAdd")}</button>
            <button className="btn primary" onClick={() => setNewProjectOpen(true)}>{t("newProject")}</button>
          </div>
        </header>

        <div className="content">
          <div className="contentGrid">
            <div className="leftColumn">
              {(() => {
                const key = "lawflow.callout.dismissed.v1";
                let dismissed = false;
                try { dismissed = localStorage.getItem(key) === "1"; } catch {}
                if (dismissed) return null;
                return (
                  <Callout
                    title={t("demoTitle")}
                    body={t("demoBody")}
                    onDismiss={() => { try { localStorage.setItem(key, "1"); } catch {} }}
                  />
                );
              })()}

              {kpis.overdue > 0 || kpis.dueSoon > 0 ? (
                <div className="deadlineBanner">
                  <div style={{ fontWeight: 950 }}>
                    Deadline alerts: {kpis.overdue > 0 ? `${kpis.overdue} overdue` : "0 overdue"} · {kpis.dueSoon > 0 ? `${kpis.dueSoon} due soon` : "0 due soon"}
                  </div>
                  <button className="btn" onClick={() => setView("Calendar")}>Review</button>
                </div>
              ) : null}

              <div className="grid4">
                <div className="card cardPad">
                  <div className="kpiTop">
                    <div className="kpiLabel">{t("openTasks")}</div>
                    <span className="pill">{kpis.open}</span>
                  </div>
                  <div className="kpiValue">{kpis.open}</div>
                  <div className="small">Across board columns</div>
                </div>
                <div className="card cardPad">
                  <div className="kpiTop">
                    <div className="kpiLabel">{t("dueIn7")}</div>
                    <span className="pill warn">{kpis.dueSoon}</span>
                  </div>
                  <div className="kpiValue">{kpis.dueSoon}</div>
                  <div className="small">Deadlines to watch</div>
                </div>
                <div className="card cardPad">
                  <div className="kpiTop">
                    <div className="kpiLabel">{t("overdue")}</div>
                    <span className="pill bad">{kpis.overdue}</span>
                  </div>
                  <div className="kpiValue">{kpis.overdue}</div>
                  <div className="small">Escalate blockers</div>
                </div>
                <div className="card cardPad">
                  <div className="kpiTop">
                    <div className="kpiLabel">{t("completed")}</div>
                    <span className="pill ok">{kpis.done}</span>
                  </div>
                  <div className="kpiValue">{kpis.done}</div>
                  <div className="small">Done tasks</div>
                </div>
              </div>

              <div className="card cardPad" style={{ marginTop: 12 }}>
                <div className="sectionTitle">
                  <h2>{t("work")}</h2>
                  <div className="tabs">
                    {(["Board","Table","Timeline"] as const).map((t) => (
                      <button key={t} className={"tab" + (view===t ? " active" : "")} onClick={()=>setView(t)}>{t}</button>
                    ))}
                  </div>
                </div>

                {activeProjectId && view === "Board" && (
                  <Board
                    tasks={filteredTasks}
                    onMove={async (taskId, nextStatus) => {
                      await api.updateTask(taskId, { status: nextStatus });
                      await refreshAll(activeProjectId);
                    }}
                  />
                )}

                {activeProjectId && view === "Table" && (
                  <TasksTable
                    tasks={filteredTasks}
                    onEdit={async (taskId, patch) => {
                      await api.updateTask(taskId, patch);
                      await refreshAll(activeProjectId);
                    }}
                  />
                )}

                {activeProjectId && view === "Timeline" && (
                  <Timeline items={timeline} />
                )}
  {activeProjectId && view === "Calendar" && (
    <CalendarView projectId={activeProjectId} tasks={filteredTasks} />
  )}

  {activeProjectId && view === "Files" && (
    <FilesRoom projectId={activeProjectId} />
  )}

  {activeProjectId && view === "Templates" && (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad" style={{ padding: 12 }}>
        <div className="sectionTitle" style={{ marginBottom: 0 }}>
          <h2>Municipality</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select className="select" style={{ width: 220 }} value={municipality} onChange={(e)=>setMunicipality(e.target.value)}>
              {MUNICIPALITIES_LIST.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span className="pill">{activeProject?.transaction_type ?? "—"}</span>
          </div>
        </div>
      </div>
      <TemplatesView municipality={municipality} transactionType={activeProject?.transaction_type ?? "Purchase"} />
    </div>
  )}

  {view === "Settings" && (
    <SettingsView
      projects={projects}
      onProjectUpdated={(p) => {
        setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
      }}
    />
  )}

  {activeProjectId && view === "Closing Pack" && (
    <ClosingPackWizard projectId={activeProjectId} project={activeProject} tasks={tasks} checklist={checklist} />
  )}

              </div>
            </div>

            <div className="rightColumn">
              <div className="card cardPad">
                <div className="sectionTitle">
                  <h2>{t("spanishChecklist")}</h2>
                  <span className="pill">{checklist.filter(c=>c.is_done).length}/{checklist.length}</span>
                </div>
                {activeProjectId && (
                  <Checklist
                    items={checklist}
                    onToggle={async (itemId, is_done) => {
                      await api.toggleChecklist(itemId, is_done);
                      await refreshAll(activeProjectId);
                    }}
                  />
                )}
              </div>

              <div className="card cardPad">
                <div className="sectionTitle">
                  <h2>{t("activity")}</h2>
                  <span className="pill">{activity.length}</span>
                </div>
                <ActivityFeed items={activity} />
              </div>
            </div>
          </div>
        </div>
              <NewProjectModal
  open={newProjectOpen}
  onClose={() => {
    setDefaultBg(loadPlatformDefaultBg());
    setNewProjectOpen(false);
  }}
  clientIdFallback={projects[0]?.client_id ?? 1}
  defaultBg={defaultBg}
  onCreated={(p) => {
    setProjects((prev) => [p, ...prev]);
    setActiveProjectId(p.id);
    setView("Board");
  }}
/>

<QuickAddModal
  open={quickAddOpen}
  onClose={() => setQuickAddOpen(false)}
  projectId={activeProjectId ?? null}
  onCreated={(t) => {
    setTasks((prev) => [t, ...prev]);
  }}
/>

<GlobalSearchModal
          open={globalSearchOpen}
          onClose={() => setGlobalSearchOpen(false)}
          tasks={tasks}
          files={files as any}
          checklist={checklist}
          onNavigate={(v) => setView(v)}
        />
      </main>
    </div>
  );
}
