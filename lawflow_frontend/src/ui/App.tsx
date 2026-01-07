import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";
import { api, Project, Task, ChecklistItem, TimelineItem, Activity, FileItem, FiscalObligation, RecurringTask } from "../lib/api";
import { api2, api3 } from "../lib/api";
import { formatProjectLabel, PROJECT_ID_OFFSET, daysUntil, formatTransactionType } from "../lib/formatting";
import { Board } from "./Board";
import { TasksTable } from "./TasksTable";
import { Timeline } from "./Cronograma";
import { RentalDashboard } from "./RentalDashboard";
import { Checklist } from "./Checklist";
import { ActivityFeed } from "./ActivityFeed";

import { FilesRoom, type FilesRoomHandle } from "./FilesRoom";
import { TemplatesView, MUNICIPALITIES_LIST } from "./TemplatesView";
import { ClosingPackView } from "./ClosingPackView";
import { ClosingPackWizard } from "./ClosingPackWizard";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { NewProjectModal } from "./NewProjectModal";
import { QuickAddModal } from "./QuickAddModal";
import { MatterSettingsView } from "./MatterSettingsView"; // New import
import { GeneralOverviewView } from "./GeneralOverviewView";
import { InformesSectorialesView } from "./InformesSectorialesView";
import { AgenciasPolacasView } from "./AgenciasPolacasView";
import { REPORTS_DATA } from "../lib/reportData";
import { NEWS_REPORTS_DATA } from "../lib/newsReportData";
import { NewsReportView } from "./NewsReportView";
import { ChatView } from "./ChatView";
import { CustomReportModal } from "./CustomReportModal";
import { Callout } from "./components/Callout";
import { loadUxPrefs, type UxPrefs } from "../lib/uxPrefs";

const PuertoBanusReportView = React.lazy(() =>
  import("./PuertoBanusReportView").then((m) => ({ default: m.PuertoBanusReportView }))
);
const SectorialReportView = React.lazy(() =>
  import("./SectorialReportView").then((m) => ({ default: m.SectorialReportView }))
);

type View =
  | "General Overview"
  | "Tasks"
  | "Timeline"
  | "Files"
  | "Closing Pack"
  | "Matter Settings"
  | "Informes Sectoriales"
  | "Puerto Banus Report"
  | "Sectorial Report"
  | "News Report"
  | "Agencias Polacas"
  | "Rental Management"
  | "Chat";

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
  } catch { }
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
  try { localStorage.setItem(`lawflow.dismissed.tips.${projectId}`, "1"); } catch { }
}

function loadDismissedDeadlines(projectId: number) {
  try {
    const raw = localStorage.getItem(`lawflow.dismissed.deadlines.${projectId}`);
    if (!raw) return { overdue: 0, dueSoon: 0 };
    return JSON.parse(raw);
  } catch { return { overdue: 0, dueSoon: 0 }; }
}

function saveDismissedDeadlines(projectId: number, stats: { overdue: number; dueSoon: number }) {
  try { localStorage.setItem(`lawflow.dismissed.deadlines.${projectId}`, JSON.stringify(stats)); } catch { }
}


function riskPill(risk: Project["risk"], t: (k: any) => string) {
  if (risk === "Critical") return <span className="pill bad">{t("riskCritical")}</span>;
  if (risk === "At Risk") return <span className="pill warn">{t("riskAtRisk")}</span>;
  return <span className="pill ok">{t("riskNormal")}</span>;
}

function fmtDateShort(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

function projectStatusLabel(status: string | null | undefined, t: (k: any) => string) {
  if (!status) return "—";
  switch (status) {
    case "Intake": return t("statusIntake");
    case "Due Diligence": return t("statusDueDiligence");
    case "Contracts": return t("statusContracts");
    case "Notary": return t("statusNotary");
    case "Registry": return t("statusRegistry");
    case "Completed": return t("statusCompleted");
    default: return status;
  }
}

function breadcrumbParts(p?: Project | null) {
  if (!p) return ["Workspace", "Matters"];
  return QColorSafe(["Workspace", "Matters", `${p.location}`, p.title.replace(/^(Purchase|Sale) – |^(Compra|Venta) – /, "")]);
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
  const [fiscal, setFiscal] = useState<FiscalObligation[]>([]);
  const [recurring, setRecurring] = useState<RecurringTask[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [defaultBg, setDefaultBg] = useState<string>(() => (typeof window !== 'undefined' ? loadPlatformDefaultBg() : '#0b1220'));
  const [uxPrefs, setUxPrefs] = useState<UxPrefs>(() =>
    typeof window !== "undefined" ? loadUxPrefs() : { tipsEnabled: false, calendarAlertsEnabled: false }
  );


  const [view, setView] = useState<View>("General Overview");
  const [pinnedIds, setPinnedIds] = useState<number[]>(() => (typeof window !== 'undefined' ? loadIds(LS_PINS) : []));
  const [recentIds, setRecentIds] = useState<number[]>(() => (typeof window !== 'undefined' ? loadIds(LS_RECENTS) : []));

  const [q, setQ] = useState("");
  const [municipality, setMunicipality] = useState<string>("Marbella");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deadlineDismissedStats, setDeadlineDismissedStats] = useState<{ overdue: number; dueSoon: number }>({ overdue: -1, dueSoon: -1 });
  const [tipsDismissed, setTipsDismissed] = useState(false);
  const [tipsTimerReady, setTipsTimerReady] = useState(false);
  const [customReportOpen, setCustomReportOpen] = useState(false);
  const [selectedReportSlug, setSelectedReportSlug] = useState<string | null>(null);
  const [selectedNewsSlug, setSelectedNewsSlug] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const filesRoomRef = useRef<FilesRoomHandle | null>(null);
  const filesDragDepthRef = useRef(0);

  const scrollMainToTop = () => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const timer = setTimeout(() => setTipsTimerReady(true), 4 * 60 * 1000); // 4 minutes
    return () => clearTimeout(timer);
  }, []);

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
    const [t, c, tl, a, f, fs, rs] = await Promise.all([
      api.tasks(projectId),
      api.checklist(projectId),
      api.timeline(projectId),
      api.activity(projectId),
      api2.files(projectId),
      api.fiscal(projectId),
      api.recurringTasks(projectId),
    ]);
    setTasks(t);
    setChecklist(c);
    setTimeline(tl);
    setActivity(a);
    setFiles(f as any);
    setFiscal(fs);
    setRecurring(rs);
  }

  // Load projects and handle initial URL route
  useEffect(() => {
    (async () => {
      const ps = await api.projects();
      setProjects(ps);

      // Default to General Overview
      if (window.location.pathname === "/" || window.location.pathname === "/overview") {
        setView("General Overview");
      } else if (window.location.pathname === "/informes-sectoriales") {
        setView("Informes Sectoriales");
      } else if (window.location.pathname === "/agencias-polacas") {
        setView("Agencias Polacas");
      } else if (window.location.pathname === "/chat") {
        setView("Chat");
      } else if (window.location.pathname === "/project") {
        setView("Tasks");
      } else if (window.location.pathname === "/informes-sectoriales/puerto-banus-2025") {
        setView("Puerto Banus Report");
      } else if (window.location.pathname.startsWith("/informes-sectoriales/")) {
        const slug = window.location.pathname.split("/").pop() || "";
        if (REPORTS_DATA[slug]) {
          setSelectedReportSlug(slug);
          setSelectedNewsSlug(null);
          setView("Sectorial Report");
        } else if (NEWS_REPORTS_DATA[slug]) {
          setSelectedNewsSlug(slug);
          setSelectedReportSlug(null);
          setView("News Report");
        } else {
          setView("Informes Sectoriales");
        }
      } else {
        setView("General Overview");
      }
      setActiveProjectId(ps[0]?.id ?? null);
    })().catch(console.error);
  }, []);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === "/" || window.location.pathname === "/overview") {
        setView("General Overview");
      } else if (window.location.pathname === "/informes-sectoriales") {
        setView("Informes Sectoriales");
      } else if (window.location.pathname === "/agencias-polacas") {
        setView("Agencias Polacas");
      } else if (window.location.pathname === "/chat") {
        setView("Chat");
      } else if (window.location.pathname === "/project") {
        setView("Tasks");
      } else if (window.location.pathname === "/informes-sectoriales/puerto-banus-2025") {
        setView("Puerto Banus Report");
      } else if (window.location.pathname.startsWith("/informes-sectoriales/")) {
        const slug = window.location.pathname.split("/").pop() || "";
        if (REPORTS_DATA[slug]) {
          setSelectedReportSlug(slug);
          setSelectedNewsSlug(null);
          setView("Sectorial Report");
        } else if (NEWS_REPORTS_DATA[slug]) {
          setSelectedNewsSlug(slug);
          setSelectedReportSlug(null);
          setView("News Report");
        } else {
          setView("Informes Sectoriales");
        }
      } else {
        setView("General Overview");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Update URL on view change
  useEffect(() => {
    if (view === "General Overview") {
      if (window.location.pathname !== "/" && window.location.pathname !== "/overview") {
        window.history.pushState(null, "", "/");
      }
    } else if (view === "Informes Sectoriales") {
      if (window.location.pathname !== "/informes-sectoriales") {
        window.history.pushState(null, "", "/informes-sectoriales");
      }
    } else if (view === "Agencias Polacas") {
      if (window.location.pathname !== "/agencias-polacas") {
        window.history.pushState(null, "", "/agencias-polacas");
      }
    } else if (view === "Puerto Banus Report") {
      if (window.location.pathname !== "/informes-sectoriales/puerto-banus-2025") {
        window.history.pushState(null, "", "/informes-sectoriales/puerto-banus-2025");
      }
    } else if (view === "Chat") {
      if (window.location.pathname !== "/chat") {
        window.history.pushState(null, "", "/chat");
      }
    } else if (view === "Sectorial Report") {
      if (selectedReportSlug && window.location.pathname !== `/informes-sectoriales/${selectedReportSlug}`) {
        window.history.pushState(null, "", `/informes-sectoriales/${selectedReportSlug}`);
      }
    } else if (view === "News Report") {
      if (selectedNewsSlug && window.location.pathname !== `/informes-sectoriales/${selectedNewsSlug}`) {
        window.history.pushState(null, "", `/informes-sectoriales/${selectedNewsSlug}`);
      }
    } else {
      if (window.location.pathname !== "/project") {
        window.history.pushState(null, "", "/project");
      }
    }
  }, [view, selectedReportSlug, selectedNewsSlug]);

  useEffect(() => {
    scrollMainToTop();
  }, [view, activeProjectId, selectedReportSlug, selectedNewsSlug]);

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
    const open = tasks.filter((t) => t.status !== "Hecho").length;
    const dueSoon = tasks.filter((t) => {
      const d = daysUntil(t.due_date);
      return d !== null && d <= 7 && d >= 0 && t.status !== "Hecho";
    }).length;
    const overdue = tasks.filter((t) => {
      const d = daysUntil(t.due_date);
      return d !== null && d < 0 && t.status !== "Hecho";
    }).length;
    const done = tasks.filter((t) => t.status === "Hecho").length;
    return { open, dueSoon, overdue, done };
  }, [tasks]);

  const shellRef = useRef<HTMLDivElement>(null);
  const topbarRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const shellEl = shellRef.current;
    const topbarEl = topbarRef.current;
    if (!shellEl || !topbarEl) return;

    const update = () => {
      const height = Math.round(topbarEl.getBoundingClientRect().height);
      shellEl.style.setProperty("--topbar-height", `${height}px`);
    };

    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const ro = new ResizeObserver(() => update());
    ro.observe(topbarEl);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1401px)");
    const onChange = () => {
      if (mql.matches) setSidebarOpen(false);
    };
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className="shell"
      ref={shellRef}
      style={{
        background:
          view === "General Overview" || view === "Informes Sectoriales" || view === "Agencias Polacas"
            ? defaultBg
            : (activeProject?.bg_color ?? defaultBg),
      }}
    >
      {sidebarOpen && <div className="sidebarOverlay" onClick={() => setSidebarOpen(false)} />}
      <div className={`sidebarWrap${sidebarOpen ? " open" : ""}`}>
        <div className="sidebarTop">
          <a
            className="brand brandLink"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveProjectId(null);
              setView("General Overview");
              if (sidebarOpen) setSidebarOpen(false);
              window.scrollTo(0, 0);
            }}
            aria-label={t("home")}
          >
            <div className="brandMark">◆</div>
            <div>
              <div className="brandName">AMA - CRM</div>
              <div className="small">{t("tagline")}</div>
            </div>
          </a>
        </div>

        <aside
          className={`sidebar ${view === "General Overview" || view === "Informes Sectoriales" || view === "Agencias Polacas" ? "hide-content" : ""
            }`}
        >
          <div className="sidebarScroll">
            <div className="card cardPad">
              <div className="active-matter-group">
                <div className="small" style={{ fontWeight: 900, marginBottom: 8 }}>{t("activeMatter")}</div>
                <select
                  className="select"
                  value={activeProjectId ?? undefined}
                  onChange={(e) => {
                    setActiveProjectId(Number(e.target.value));
                    if (view === "General Overview") setView("Tasks");
                    if (sidebarOpen) setSidebarOpen(false); // Close sidebar on selection
                  }}
                >
                  {projects.map((p) => (
                    <option value={p.id} key={p.id}>
                      {formatProjectLabel(p, { lang })}
                    </option>
                  ))}
                </select>
                <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
                  <div className="small" style={{ fontWeight: 900 }}>
                    <b>{t("statusTableCol")}</b>: {projectStatusLabel(activeProject?.status, t)}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {activeProject ? riskPill(activeProject.risk, t) : null}
                    <button
                      className="btn ghost"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!activeProject) return;
                        setPinnedIds(togglePin(activeProject.id));
                      }}
                      title={pinnedIds.includes(activeProject?.id ?? -1) ? t("unpinMatter") : t("pinMatter")}
                      style={{ color: pinnedIds.includes(activeProject?.id ?? -1) ? "gold" : "inherit" }}
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
                          onClick={() => { setActiveProjectId(p.id); setView("Tasks"); if (sidebarOpen) setSidebarOpen(false); }}
                          title={p.title}
                        >
                          <span className="chipDot" />
                          <span className="chipText">{formatProjectLabel(p, { lang })}</span>
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
                          onClick={() => { setActiveProjectId(p.id); setView("Tasks"); if (sidebarOpen) setSidebarOpen(false); }}
                          title={p.title}
                        >
                          <span className="chipDot muted" />
                          <span className="chipText">{formatProjectLabel(p, { lang })}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
            <button className="btn ghost" title={t("settings")} onClick={() => setView("Matter Settings")}>⚙</button>
          </div>
        </aside>
      </div>

      <header
        ref={topbarRef}
        className={
          "topbar" +
          (view === "General Overview" ||
            view === "Informes Sectoriales" ||
            view === "Agencias Polacas" ||
            view === "Puerto Banus Report" ||
            view === "Sectorial Report" ||
            view === "News Report"
            ? " landingTopbar"
            : "")
        }
      >
        <div className="topbar-container">
          <div
            className="titleRow"
            style={
              view === "General Overview" ||
                view === "Informes Sectoriales" ||
                view === "Agencias Polacas" ||
                view === "Puerto Banus Report" ||
                view === "Sectorial Report" ||
                view === "News Report"
                ? { minHeight: "80px", justifyContent: "center" }
                : undefined
            }
          >
            {view === "Puerto Banus Report" ||
              (view === "Sectorial Report" && selectedReportSlug) ||
              (view === "News Report" && selectedNewsSlug) ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 4 }}>
                <div style={{ textAlign: "left" }}>
                  <div className="brandName">
                    {view === "Puerto Banus Report"
                      ? "Estudio Puerto Banús 2025"
                      : view === "News Report"
                        ? NEWS_REPORTS_DATA[selectedNewsSlug!]?.title
                        : REPORTS_DATA[selectedReportSlug!]?.title}
                  </div>
                  <div className="small">
                    {view === "Puerto Banus Report"
                      ? "Análisis detallado del mercado de lujo"
                      : view === "News Report"
                        ? NEWS_REPORTS_DATA[selectedNewsSlug!]?.subtitle
                        : REPORTS_DATA[selectedReportSlug!]?.subtitle}
                  </div>
                </div>
                <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)", fontWeight: 800, marginTop: 2 }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setView("Informes Sectoriales")}
                  >
                    Informes Sectoriales
                  </span>
                  <span style={{ opacity: 0.5 }}>/</span>
                  <span style={{ color: "var(--text)" }}>
                    {view === "Puerto Banus Report"
                      ? "Puerto Banús 2025"
                      : view === "News Report"
                        ? NEWS_REPORTS_DATA[selectedNewsSlug!]?.location
                        : REPORTS_DATA[selectedReportSlug!]?.location}
                  </span>
                </nav>
              </div>
            ) : view === "Informes Sectoriales" ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 4 }}>
                <div style={{ textAlign: "left" }}>
                  <div className="brandName">Informes Sectoriales</div>
                  <div className="small">Análisis de inteligencia de negocio para el sector inmobiliario español</div>
                </div>
                <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)", fontWeight: 800, marginTop: 2 }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setView("General Overview")}
                  >
                    AMA-CRM
                  </span>
                  <span style={{ opacity: 0.5 }}>/</span>
                  <span style={{ color: "var(--text)" }}>Informes Sectoriales</span>
                </nav>
              </div>
            ) : view === "Agencias Polacas" ? (
              <div style={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
                <div style={{ textAlign: "left" }}>
                  <div className="brandName">Agencias Polacas</div>
                  <div className="small">Directorio de ejemplo de agencias que trabajan compradores polacos en Costa del Sol</div>
                </div>
              </div>
            ) : view === "Chat" ? (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 4 }}>
                <div style={{ textAlign: "left" }}>
                  <div className="brandName">{t("aiAssistant")}</div>
                  <div className="small">Tu compañero inteligente para la gestión legal e inmobiliaria</div>
                </div>
                <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)", fontWeight: 800, marginTop: 2 }}>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => setView("General Overview")}
                  >
                    AMA-CRM
                  </span>
                  <span style={{ opacity: 0.5 }}>/</span>
                  <span style={{ color: "var(--text)" }}>{t("aiAssistant")}</span>
                </nav>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", width: "100%" }}>
                <div className="h1">
                  {view === "General Overview" ? (
                    <span style={{ fontSize: "1.5em" }}>Listado General</span>
	                  ) : (activeProject ? (
	                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
	                      {formatProjectLabel(activeProject, { lang })}
	                    </div>
	                  ) : "LawFlow")}
	                </div>
                {view !== "General Overview" && activeProject && (
                  <div className="projectMetaInline">
                    <div className="small">
                      {t("statusTableCol")}: {projectStatusLabel(activeProject?.status, t)}
                    </div>
                    {riskPill(activeProject.risk, t)}
                  </div>
                )}
              </div>
            )}
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
            <div
              className="topNav"
              style={{
                minHeight: 42,
                display:
                  view === "General Overview" ||
                    view === "Informes Sectoriales" ||
                    view === "Agencias Polacas" ||
                    view === "Puerto Banus Report" ||
                    view === "Sectorial Report" ||
                    view === "News Report" ||
                    view === "Chat"
                    ? "none"
                    : "block",
              }}
            >
              {activeProjectId &&
                view !== "General Overview" &&
                view !== "Informes Sectoriales" &&
                view !== "Agencias Polacas" &&
                view !== "Puerto Banus Report" &&
                view !== "Sectorial Report" &&
                view !== "News Report" && (
                  <>
                    <button className={"topNavItem" + (view === "Tasks" ? " active" : "")} onClick={() => setView("Tasks")}>{t("tasks")}</button>
                    <button className={"topNavItem" + (view === "Timeline" ? " active" : "")} onClick={() => setView("Timeline")}>{t("timeline")}</button>
                    {activeProject?.rental_management && (
                      <button className={"topNavItem" + (view === "Rental Management" ? " active" : "")} onClick={() => setView("Rental Management")}>Gestión Alquiler</button>
                    )}
                    <button className={"topNavItem" + (view === "Files" ? " active" : "")} onClick={() => setView("Files")}>{t("files")}</button>
                    <button className={"topNavItem" + (view === "Closing Pack" ? " active" : "")} onClick={() => setView("Closing Pack")}>{t("closingPack")}</button>
                  </>
                )}
            </div>
            {view !== "General Overview" && null}
          </div>
          <div className="actions">
            <div className="projectHeaderActions">
              {/* Action Button: Only on matter views (never on landing/report pages) */}
              {activeProjectId &&
                view !== "Chat" &&
                view !== "General Overview" &&
                view !== "Agencias Polacas" &&
                view !== "Informes Sectoriales" &&
                view !== "Puerto Banus Report" &&
                view !== "Sectorial Report" &&
                view !== "News Report" && (
                  <button
                    className="btn quickAddBtn"
                    onClick={() => {
                      setQuickAddOpen(true);
                    }}
                    title={t("quickAdd")}
                  >
                    {t("quickAdd")}
                  </button>
                )}

              <div className="headerIconRow">
                <button
                  className="hamburger headerIconBtn"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  title={t("toggleSidebar")}
                >
                  ☰
                </button>

                {view !== "General Overview" && (
                  <button
                    className="iconSquare homeBtn headerIconBtn"
                    onClick={() => {
                      setActiveProjectId(null);
                      setView("General Overview");
                      setSidebarOpen(false);
                      window.scrollTo(0, 0);
                    }}
                    title={t("home")}
                  >
                    <span className="iconSquareGlyph">⌂</span>
                  </button>
                )}

                {view !== "General Overview" &&
                  view !== "Informes Sectoriales" &&
                  view !== "Agencias Polacas" &&
                  view !== "Puerto Banus Report" &&
                  view !== "Sectorial Report" &&
                  view !== "News Report" &&
                  view !== "Chat" &&
                  activeProject && (
                    <button
                      className="iconSquare headerIconBtn"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!activeProject) return;
                        setPinnedIds(togglePin(activeProject.id));
                      }}
                      title={pinnedIds.includes(activeProject?.id ?? -1) ? t("unpinMatter") : t("pinMatter")}
                      style={{ color: pinnedIds.includes(activeProject?.id ?? -1) ? "gold" : "inherit" }}
                    >
                      {pinnedIds.includes(activeProject?.id ?? -1) ? "★" : "☆"}
                    </button>
                  )}
              </div>
            </div>

          </div>
        </div>
      </header>

      <main className="main">
        <div className="content" ref={contentRef}>
          {view === "General Overview" ? (
            <GeneralOverviewView
              projects={projects}
              onNewProject={() => setNewProjectOpen(true)}
              onProjectSelect={(id) => {
                setActiveProjectId(id);
                setView("Tasks");
                scrollMainToTop();
              }}
            />
          ) : view === "Informes Sectoriales" ? (
            <InformesSectorialesView />
          ) : view === "Agencias Polacas" ? (
            <AgenciasPolacasView />
          ) : view === "Puerto Banus Report" ? (
            <React.Suspense fallback={<div className="card cardPad">Loading…</div>}>
              <PuertoBanusReportView />
            </React.Suspense>
          ) : view === "Sectorial Report" && selectedReportSlug && REPORTS_DATA[selectedReportSlug] ? (
            <React.Suspense fallback={<div className="card cardPad">Loading…</div>}>
              <SectorialReportView data={REPORTS_DATA[selectedReportSlug]} />
            </React.Suspense>
          ) : view === "News Report" && selectedNewsSlug && NEWS_REPORTS_DATA[selectedNewsSlug] ? (
            <NewsReportView data={NEWS_REPORTS_DATA[selectedNewsSlug]} />
          ) : view === "Chat" ? (
            <ChatView />
          ) : (
            <div className="contentGrid">
              <div className="leftColumn">
                {uxPrefs.tipsEnabled && !tipsDismissed && tipsTimerReady ? (
                  <Callout
                    title={t("demoTitle")}
                    body={t("demoBody")}
                    actionLabel={t("close")}
                    onDismiss={() => {
                      if (activeProjectId) saveDismissedTips(activeProjectId);
                      setTipsDismissed(true);
                    }}
                  />
                ) : null}

                {uxPrefs.calendarAlertsEnabled && (kpis.overdue > 0 || kpis.dueSoon > 0) && (kpis.overdue > deadlineDismissedStats.overdue || kpis.dueSoon > deadlineDismissedStats.dueSoon) ? (
                  <div className="deadlineBanner">
                    <div style={{ fontWeight: 950 }}>
                      {t("deadlineAlerts")}: {kpis.overdue > 0 ? t("overdueCount").replace("{count}", String(kpis.overdue)) : t("overdueCount").replace("{count}", "0")} · {kpis.dueSoon > 0 ? t("dueSoonCount").replace("{count}", String(kpis.dueSoon)) : t("dueSoonCount").replace("{count}", "0")}
                    </div>
                    <button className="btn" onClick={() => {
                      if (activeProjectId) saveDismissedDeadlines(activeProjectId, { overdue: kpis.overdue, dueSoon: kpis.dueSoon });
                      setDeadlineDismissedStats({ overdue: kpis.overdue, dueSoon: kpis.dueSoon });
                    }}>{t("close")}</button>
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
                      <div className="table-container">
                        <TasksTable
                          tasks={filteredTasks}
                          onEdit={async (taskId, patch) => {
                            // Optimistically update local state for immediate UI feedback
                            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...patch } : t));
                            try {
                              await api.updateTask(taskId, patch);
                              await refreshAll(activeProjectId);
                            } catch (error) {
                              // Revert on error
                              console.error('Failed to update task:', error);
                              await refreshAll(activeProjectId);
                            }
                          }}
                        />
                      </div>
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
                    <Timeline
                      items={timeline}
                      tasks={filteredTasks}
                      location={activeProject?.location}
                      fiscal={fiscal}
                      recurring={recurring}
                    />
                  )}

                  {activeProjectId && view === "Files" && (
                    <div style={{ display: "grid", gap: 12 }}>
                      <div
                        className="card cardPad"
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          filesDragDepthRef.current += 1;
                          filesRoomRef.current?.setDragging(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          filesDragDepthRef.current = Math.max(0, filesDragDepthRef.current - 1);
                          if (filesDragDepthRef.current === 0) filesRoomRef.current?.setDragging(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          filesDragDepthRef.current = 0;
                          filesRoomRef.current?.setDragging(false);
                          const f = e.dataTransfer.files?.[0];
                          if (!f) return;
                          void filesRoomRef.current?.uploadFile(f);
                        }}
                      >
                        <div className="sectionTitle">
                          <h2>{t("files")}</h2>
                        </div>
                        <FilesRoom
                          ref={filesRoomRef}
                          projectId={activeProjectId}
                          embedded
                          project={activeProject}
                          onProjectUpdated={(p) => setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)))}
                          externalDropTarget
                        />
                      </div>

                      <div className="card cardPad">
                        <div className="cardSections">
                          <div className="cardSection">
                            <div className="sectionTitle" style={{ marginBottom: 0 }}>
                              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                                <h2>{t("templates")}</h2>
                                <span className="pill">{formatTransactionType(activeProject?.transaction_type, lang)}</span>
                              </div>
                              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                <select className="select" style={{ width: "min(220px, 100%)", maxWidth: 220 }} value={municipality} onChange={(e) => setMunicipality(e.target.value)}>
                                  {MUNICIPALITIES_LIST.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="small">{t("templatesDescription")}</div>
                          </div>

                          <TemplatesView municipality={municipality} transactionType={activeProject?.transaction_type ?? "Purchase"} embedded />
                        </div>
                      </div>
                    </div>
                  )}

                  {view === "Matter Settings" && activeProjectId && (
                    <MatterSettingsView
                      activeProject={activeProject}
                      onProjectUpdated={(p) => {
                        setProjects((prev) => prev.map((x) => (x.id === p.id ? p : x)));
                      }}
                      uxPrefs={uxPrefs}
                      onUxPrefsChange={setUxPrefs}
                      onClose={() => setView("Tasks")} // Go back to Board view after closing settings
                    />
                  )}

                  {activeProjectId && view === "Rental Management" && (
                    <RentalDashboard project={activeProject} />
                  )}

                  {activeProjectId && view === "Closing Pack" && (
                    <ClosingPackWizard projectId={activeProjectId} project={activeProject} tasks={tasks} checklist={checklist} />
                  )}

                </div>
              </div>

              <div className="rightColumn">
                {!["Files", "Closing Pack"].includes(view) && (
                  <div className="card cardPad">
                    <div className="sectionTitle">
                      <h2>{t("spanishChecklist")}</h2>
                      <span className="pill">{checklist.filter(c => c.is_done).length}/{checklist.length}</span>
                    </div>
                    {activeProjectId && (
                      <>
                        <Checklist
                          items={checklist}
                          onToggle={async (itemId, is_done) => {
                            await api.toggleChecklist(itemId, is_done);
                            await refreshAll(activeProjectId);
                          }}
                        />
                      </>
                    )}
                  </div>
                )}

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
        />
        <CustomReportModal
          open={customReportOpen}
          onClose={() => setCustomReportOpen(false)}
        />
      </main>
    </div>
  );
}
