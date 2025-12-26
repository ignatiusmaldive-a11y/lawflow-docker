import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";
import { api, Project, Task, ChecklistItem, TimelineItem, Activity, FileItem } from "../lib/api";
import { api2, api3 } from "../lib/api";
import { formatProjectLabel, PROJECT_ID_OFFSET, daysUntil } from "../lib/formatting";
import { Board } from "./Board";
import { TasksTable } from "./TasksTable";
import { Timeline } from "./Cronograma";
import { Checklist } from "./Checklist";
import { ActivityFeed } from "./ActivityFeed";

import { FilesRoom } from "./FilesRoom";
import { TemplatesView, MUNICIPALITIES_LIST } from "./TemplatesView";
import { ClosingPackView } from "./ClosingPackView";
import { ClosingPackWizard } from "./ClosingPackWizard";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { NewProjectModal } from "./NewProjectModal";
import { QuickAddModal } from "./QuickAddModal";
import { MatterSettingsView } from "./MatterSettingsView"; // New import
import { GeneralOverviewView } from "./GeneralOverviewView";
import { Callout } from "./components/Callout";

type View = "Tasks" | "Timeline" | "Files" | "Templates" | "Closing Pack" | "Matter Settings" | "General Overview";

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
    if (!raw) {
      // Initialize with demo data for first-time users
      const demoData: Record<string, number[]> = {
        "lawflow.pins.v1": [1, 3], // Pin two interesting projects
        "lawflow.recents.v1": [15, 12, 9, 6, 3] // Recently opened 5 diverse projects
      };
      if (demoData[key]) {
        localStorage.setItem(key, JSON.stringify(demoData[key]));
        return demoData[key];
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // If we have existing data but it's very short (likely from demo), reinitialize
    const demoLength: Record<string, number> = {
      "lawflow.pins.v1": 2,
      "lawflow.recents.v1": 5
    };
    if (parsed.length < (demoLength[key] || 0)) {
      const demoData: Record<string, number[]> = {
        "lawflow.pins.v1": [1, 3],
        "lawflow.recents.v1": [15, 12, 9, 6, 3]
      };
      if (demoData[key]) {
        localStorage.setItem(key, JSON.stringify(demoData[key]));
        return demoData[key];
      }
    }
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

function loadDismissedTips(projectId: number) {
  try {
    return localStorage.getItem(`lawflow.dismissed.tips.${projectId}`) === "1";
  } catch { return false; }
}

function saveDismissedTips(projectId: number) {
  try { localStorage.setItem(`lawflow.dismissed.tips.${projectId}`, "1"); } catch {}
}

function loadDismissedDeadlines(projectId: number) {
  try {
    const raw = localStorage.getItem(`lawflow.dismissed.deadlines.${projectId}`);
    if (!raw) return { overdue: 0, dueSoon: 0 };
    return JSON.parse(raw);
  } catch { return { overdue: 0, dueSoon: 0 }; }
}

function saveDismissedDeadlines(projectId: number, stats: { overdue: number; dueSoon: number }) {
  try { localStorage.setItem(`lawflow.dismissed.deadlines.${projectId}`, JSON.stringify(stats)); } catch {}
}


function riskPill(risk: Project["risk"]) {
  if (risk === "Critical") return <span className="pill bad">Critical</span>;
  if (risk === "At Risk") return <span className="pill warn">At risk</span>;
  return <span className="pill ok">Normal</span>;
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



export function App() {
  const { lang, t } = useI18n();

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


  const [view, setView] = useState<View>("Tasks");
  const [pinnedIds, setPinnedIds] = useState<number[]>(() => (typeof window !== 'undefined' ? loadIds(LS_PINS) : []));
  const [recentIds, setRecentIds] = useState<number[]>(() => (typeof window !== 'undefined' ? loadIds(LS_RECENTS) : []));

  const [q, setQ] = useState("");
  const [municipality, setMunicipality] = useState<string>("Marbella");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deadlineDismissedStats, setDeadlineDismissedStats] = useState<{ overdue: number; dueSoon: number }>({ overdue: -1, dueSoon: -1 });
  const [tipsDismissed, setTipsDismissed] = useState(false);

const pinnedProjects = useMemo(() => {
  const set = new Set(pinnedIds);
  return projects.filter((p) => set.has(p.id));
}, [projects, pinnedIds]);

const recentProjects = useMemo(() => {
  const map = new Map(projects.map((p) => [p.id, p] as const));
  const projectsFromRecentIds = recentIds.map((id) => map.get(id)).filter(Boolean) as Project[];
  
  // Sort by project number strictly
  projectsFromRecentIds.sort((a, b) => {
    const aProjectNumber = a.id + PROJECT_ID_OFFSET;
    const bProjectNumber = b.id + PROJECT_ID_OFFSET;
    return aProjectNumber - bProjectNumber;
  });

  return projectsFromRecentIds;
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

  // Load projects and handle initial URL route
  useEffect(() => {
    (async () => {
      const ps = await api.projects();
      setProjects(ps);
      
      // Check URL for /overview
      if (window.location.pathname === "/overview") {
        setView("General Overview");
        // We still set a default active project so the sidebar doesn't crash if they switch back
        setActiveProjectId(ps[0]?.id ?? null);
      } else {
        setActiveProjectId(ps[0]?.id ?? null);
      }
    })().catch(console.error);
  }, []);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/overview") {
        setView("General Overview");
      } else {
        setView("Tasks");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update URL on view change
  useEffect(() => {
    if (view === "General Overview") {
      if (window.location.pathname !== "/overview") {
        window.history.pushState(null, "", "/overview");
      }
    } else {
      if (window.location.pathname !== "/") {
        window.history.pushState(null, "", "/");
      }
    }
  }, [view]);

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
  
  // Load persistent UI states
  setTipsDismissed(loadDismissedTips(activeProjectId));
  setDeadlineDismissedStats(loadDismissedDeadlines(activeProjectId));

  // Clear tasks momentarily to avoid showing previous project's stats/banner
  setTasks([]);

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
    <div className="shell" style={{ background: view === "General Overview" ? defaultBg : (activeProject?.bg_color ?? defaultBg) }}>
      {sidebarOpen && <div className="sidebarOverlay" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${view === "General Overview" ? "hide-content" : ""}`}>
        <div className="brand">
          <div className="brandMark">◆</div>
          <div>
            <div className="brandName">AMA - CRM</div>
            <div className="small">{t("tagline")}</div>
          </div>
        </div>

        <nav className="nav">
          <a className={view === "General Overview" ? "active" : ""} href="#" onClick={(e)=>{e.preventDefault(); setView("General Overview");}}>{t("overviewLink")}</a>
        </nav>

        <div style={{ borderTop: "1px solid var(--line)", margin: "10px 0" }} />

        <div className="card cardPad">
          <div className="active-matter-group">
            <div className="small" style={{ fontWeight: 900, marginBottom: 8 }}>{t("activeMatter")}</div>
            <select
              className="select"
              value={activeProjectId ?? undefined}
              onChange={(e) => {
                setActiveProjectId(Number(e.target.value));
                if (view === "General Overview") setView("Tasks"); 
              }}
            >
              {projects.map((p) => (
                <option value={p.id} key={p.id}>
                  {formatProjectLabel(p)}
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
          </div>

<div className="pinned-recent-group">
{pinnedProjects.length > 0 && (
      <div style={{ marginTop: 12 }}>
        <div className="small" style={{ fontWeight: 950, marginBottom: 6 }}>Fijados</div>    <div style={{ display: "grid", gap: 6 }}>
      {pinnedProjects.slice(0, 4).map((p) => (
        <button
          key={p.id}
          className="chipRow"
          onClick={() => { setActiveProjectId(p.id); setView("Tasks"); }}
          title={p.title}
        >
          <span className="chipDot" />
          <span className="chipText">{formatProjectLabel(p)}</span>
        </button>
      ))}
    </div>
  </div>
)}

{recentProjects.length > 0 && (
  <div style={{ marginTop: 12 }}>
    <div className="small" style={{ fontWeight: 950, marginBottom: 6 }}>Recientes</div>
    <div style={{ display: "grid", gap: 6 }}>
      {recentProjects.slice(0, 5).map((p) => (
        <button
          key={p.id}
          className="chipRow"
          onClick={() => { setActiveProjectId(p.id); setView("Tasks"); }}
          title={p.title}
        >
          <span className="chipDot muted" />
          <span className="chipText">{formatProjectLabel(p)}</span>
        </button>
      ))}
    </div>
  </div>
)}
</div>
</div>

        <div className="sidebarFooter">
          <div className="userchip">
            <div className="avatar">A</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 13 }}>Ana López</div>
              <div className="small">Legal Ops</div>
            </div>
          </div>
          <button className="btn ghost" title="Settings" onClick={() => setView("Matter Settings")}>⚙</button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="titleRow" style={view === "General Overview" ? { minHeight: "80px", justifyContent: "center" } : undefined}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <p className="h1">
                {view === "General Overview" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="brandMark">◆</div>
                    <div>
                      <div className="brandName">AMA-CRM</div>
                      <div className="small">Transacciones inmobiliarias</div>
                    </div>
                  </div>
                ) : (activeProject ? formatProjectLabel(activeProject) : "LawFlow")}
              </p>
              {view !== "General Overview" && activeProject && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className="small" style={{ fontWeight: 900 }}>
                    <b>{t("status")}</b>: {activeProject?.status ?? "—"}
                  </div>
                  {riskPill(activeProject.risk)}
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
              )}
            </div>
            {/* <p className="subtitle">
              <span className="crumbs">
  {view === "General Overview" ? (
     <span className="crumb">Portfolio Overview</span>
  ) : (
     breadcrumbParts(activeProject).map((c, idx) => (
       <span key={idx} className="crumb">{c}</span>
     ))
  )}
</span>
            </p> */}
            <div className="topNav" style={{ minHeight: 42, display: view === "General Overview" ? "none" : "block" }}>
              {activeProjectId && view !== "General Overview" && (
                <>
                  <button className={"topNavItem" + (view==="Tasks"?" active":"")} onClick={()=>setView("Tasks")}>{t("tasks")}</button>
                  <button className={"topNavItem" + (view==="Timeline"?" active":"")} onClick={()=>setView("Timeline")}>{t("timeline")}</button>
                  <button className={"topNavItem" + (view==="Files"?" active":"")} onClick={()=>setView("Files")}>{t("files")}</button>
                  <button className={"topNavItem" + (view==="Templates"?" active":"")} onClick={()=>setView("Templates")}>{t("templates")}</button>
                  <button className={"topNavItem" + (view==="Closing Pack"?" active":"")} onClick={()=>setView("Closing Pack")}>Closing Pack</button>
                </>
              )}
            </div>
            {view !== "General Overview" && null}
          </div>
          <div className="actions">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle sidebar"
            >
              ☰
            </button>

            {view !== "General Overview" && (
              <button className="btn" onClick={() => setQuickAddOpen(true)} title="Quick add a task to the active matter">{t("quickAdd")}</button>
            )}
            {view === "General Overview" && (
              <button className="btn primary" onClick={() => setNewProjectOpen(true)}>{t("newProject")}</button>
            )}
          </div>
        </header>

        <div className="content">
          {view === "General Overview" ? (
             <GeneralOverviewView
               projects={projects}
               onProjectSelect={(id) => {
                 setActiveProjectId(id);
                 setView("Tasks");
                 window.scrollTo(0, 0); // Reset scroll position to top when selecting project
               }}
             />
          ) : (
          <div className="contentGrid">
            <div className="leftColumn">
              {!tipsDismissed ? (
                  <Callout
                    title={t("demoTitle")}
                    body={t("demoBody")}
                    onDismiss={() => {
                      if (activeProjectId) saveDismissedTips(activeProjectId);
                      setTipsDismissed(true);
                    }}
                  />
              ) : null}

              {(kpis.overdue > 0 || kpis.dueSoon > 0) && (kpis.overdue > deadlineDismissedStats.overdue || kpis.dueSoon > deadlineDismissedStats.dueSoon) ? (
                <div className="deadlineBanner">
                  <div style={{ fontWeight: 950 }}>
                    Deadline alerts: {kpis.overdue > 0 ? `${kpis.overdue} overdue` : "0 overdue"} · {kpis.dueSoon > 0 ? `${kpis.dueSoon} due soon` : "0 due soon"}
                  </div>
                  <button className="btn" onClick={() => { 
                    setView("Timeline"); 
                    if (activeProjectId) saveDismissedDeadlines(activeProjectId, { overdue: kpis.overdue, dueSoon: kpis.dueSoon });
                    setDeadlineDismissedStats({ overdue: kpis.overdue, dueSoon: kpis.dueSoon });
                  }}>Review</button>
                </div>
              ) : null}

              {view === "Tasks" && (
                <>
                  {/*
                  <div className="card cardPad" style={{ marginBottom: 20 }}>
                    <div className="grid4" style={{ display: "flex", justifyContent: "space-around", width: "100%", alignItems: "flex-start" }}>
                      <div className="card cardPad" style={{ flex: 1, textAlign: "center", padding: "4px 0", border: "none", boxShadow: "none", background: "transparent" }}>
                        <div className="kpiTop">
                          <div className="kpiLabel">{t("openTasks")}</div>
                        </div>
                        <div className="kpiValue">{kpis.open}</div>
                        <div className="small">{t("acrossBoardColumns")}</div>
                      </div>
                      <div className="card cardPad" style={{ flex: 1, textAlign: "center", padding: "4px 0", border: "none", boxShadow: "none", background: "transparent" }}>
                        <div className="kpiTop">
                          <div className="kpiLabel">{t("dueIn7")}</div>
                        </div>
                        <div className={`kpiValue ${kpis.dueSoon > 0 ? "warn" : ""}`}>{kpis.dueSoon}</div>
                        <div className="small">Plazos a vigilar</div>
                      </div>
                      <div className="card cardPad" style={{ flex: 1, textAlign: "center", padding: "4px 0", border: "none", boxShadow: "none", background: "transparent" }}>
                        <div className="kpiTop">
                          <div className="kpiLabel">{t("overdue")}</div>
                        </div>
                        <div className={`kpiValue ${kpis.overdue > 0 ? "bad" : ""}`}>{kpis.overdue}</div>
                        <div className="small">Bloqueos para escalar</div>
                      </div>
                      <div className="card cardPad" style={{ flex: 1, textAlign: "center", padding: "4px 0", border: "none", boxShadow: "none", background: "transparent" }}>
                        <div className="kpiTop">
                          <div className="kpiLabel">{t("completed")}</div>
                        </div>
                        <div className={`kpiValue ${kpis.done > 0 ? "ok" : ""}`}>{kpis.done}</div>
                        <div className="small">{t("doneTasks")}</div>
                      </div>
                    </div>
                  </div>
                  */}

                  {/*
                  <div style={{ display: "flex", justifyContent: "flex-start", gap: 20, marginBottom: 20 }}>
                    <div style={{ textAlign: "center" }}>
                      <div className="small">{t("openTasks")}</div>
                      <div className="kpiValue">{kpis.open}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div className="small">{t("completed")}</div>
                      <div className="kpiValue ok">{kpis.done}</div>
                    </div>
                  </div>
                  */}
                </>
              )}



              <div className="card cardPad" style={{ marginTop: 12 }}>
                {activeProjectId && view === "Tasks" && (
                  <>
                    <TasksTable
                      tasks={filteredTasks}
                      onEdit={async (taskId, patch) => {
                        await api.updateTask(taskId, patch);
                        await refreshAll(activeProjectId);
                      }}
                    />
                    {/* <h3 style={{ marginTop: 30, marginBottom: 10 }}>Board</h3>
                    <Board
                      tasks={filteredTasks}
                      onMove={async (taskId, nextStatus) => {
                        await api.updateTask(taskId, { status: nextStatus });
                        await refreshAll(activeProjectId);
                      }}
                    /> */}
                  </>
                )}

                {activeProjectId && view === "Timeline" && (
                  <Timeline projectId={activeProjectId} items={timeline} tasks={filteredTasks} />
                )}

  {activeProjectId && view === "Files" && (
    <FilesRoom projectId={activeProjectId} />
  )}

  {activeProjectId && view === "Templates" && (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad" style={{ padding: 12 }}>
        <div className="sectionTitle" style={{ marginBottom: 0 }}>
          <h2>{t("municipality")}</h2>
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

  {view === "Matter Settings" && activeProjectId && (
    <MatterSettingsView
      activeProject={activeProject}
      onProjectUpdated={(p) => {
        setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
      }}
      onClose={() => setView("Tasks")} // Go back to Board view after closing settings
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
          )}
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
    setView("Tasks");
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
            timeline={timeline}
            onNavigate={(v) => setView(v)}
          />      </main>
    </div>
  );
}