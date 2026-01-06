import React, { useMemo, useState } from "react";
import { Project } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { formatProjectLabel, formatClientName, PROJECT_ID_OFFSET } from "../lib/formatting";
import { Footer } from "./components/Footer";

type SortField = "title" | "project_number" | "status" | "location" | "risk" | "target_close_date" | "client";
type SortDirection = "asc" | "desc";

function riskPill(risk: Project["risk"], t: ReturnType<typeof useI18n>["t"]) {
  if (risk === "Critical") return <span className="pill bad">{t("riskCritical")}</span>;
  if (risk === "At Risk") return <span className="pill warn">{t("riskAtRisk")}</span>;
  return <span className="pill ok">{t("riskNormal")}</span>;
}

function statusLabel(status: string, t: ReturnType<typeof useI18n>["t"]) {
  switch (status) {
    case "Intake":
      return t("statusIntake");
    case "Due Diligence":
      return t("statusDueDiligence");
    case "Contracts":
      return t("statusContracts");
    case "Notary":
      return t("statusNotary");
    case "Registry":
      return t("statusRegistry");
    case "Completed":
      return t("statusCompleted");
    default:
      return status;
  }
}

function statusPill(status: string, t: ReturnType<typeof useI18n>["t"]) {
  return <span className="pill neutral">{statusLabel(status, t)}</span>;
}

function fmtDateShort(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "2-digit" });
}

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const ms = d.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function GeneralOverviewView({
  projects,
  onProjectSelect,
  onNewProject,
}: {
  projects: Project[];
  onProjectSelect: (projectId: number) => void;
  onNewProject: () => void;
}) {
  const { t } = useI18n();
  const [sortField, setSortField] = useState<SortField>("project_number");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const searchPlaceholder = t("searchProjectsPlaceholder");

  const sortedAndFilteredProjects = useMemo(() => {
    let filtered = projects.filter(p => {
      const matchesText =
        p.title.toLowerCase().includes(filter.toLowerCase()) ||
        p.location.toLowerCase().includes(filter.toLowerCase()) ||
        (formatClientName(p.client?.name) || "").toLowerCase().includes(filter.toLowerCase()) ||
        (p.client?.name || "").toLowerCase().includes(filter.toLowerCase());

      const matchesStatus = statusFilter === "All" || p.status === statusFilter;

      return matchesText && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === "project_number") {
        aVal = a.id + PROJECT_ID_OFFSET;
        bVal = b.id + PROJECT_ID_OFFSET;
      } else if (sortField === "client") {
        aVal = formatClientName(a.client?.name) || "";
        bVal = formatClientName(b.client?.name) || "";
      } else if (sortField === "target_close_date") {
        aVal = a[sortField] ? new Date(a[sortField]!).getTime() : Infinity;
        bVal = b[sortField] ? new Date(b[sortField]!).getTime() : Infinity;
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, sortField, sortDirection, filter, statusFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const summaryStats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => !["Completed", "Registry"].includes(p.status)).length;
    const completed = projects.filter(p => p.status === "Registry" || p.status === "Completed").length;
    const highRisk = projects.filter(p => p.risk === "Critical" || p.risk === "At Risk").length;

    return { total, active, completed, highRisk };
  }, [projects]);

  const SortHeader = ({
    field,
    label,
    width,
    className,
    align,
  }: {
    field: SortField;
    label: string;
    width?: string;
    className?: string;
    align?: "left" | "center" | "right";
  }) => (
    <th
      onClick={() => handleSort(field)}
      style={{ cursor: "pointer", userSelect: "none", width: width, textAlign: align }}
      className={`${sortField === field ? "active-sort" : ""} ${className || ""}`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
          gap: 4,
          width: "100%",
        }}
      >
        {label}
        {sortField === field && (
          <span style={{ fontSize: 10 }}>
            {field === "project_number"
              ? (sortDirection === "asc" ? "▼" : "▲")
              : (sortDirection === "asc" ? "▲" : "▼")
            }
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats Cards - Replaced with Minimal Stats Strip
      <div className="stats-strip">
        <div className="stat-item">
          <div className="stat-label">{t("totalMatters")}</div>
          <div className="stat-value">{summaryStats.total}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">{t("activeProjects")}</div>
          <div className="stat-value">{summaryStats.active}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">{t("closedProjects")}</div>
          <div className="stat-value">{summaryStats.completed}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">{t("highRiskProjects")}</div>
          <div className={`stat-value ${summaryStats.highRisk > 0 ? "risk" : ""}`}>
            {summaryStats.highRisk}
          </div>
        </div>
      </div>
      */}

      {/* Filters & Actions */}
      <div className="table-container">
        <div className="card cardPad overview-toolbar">
          <input
            className="search overview-search"
            placeholder={searchPlaceholder}
            size={Math.max(1, searchPlaceholder.length)}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          <select
            className="select overview-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">{t("allStatuses")}</option>
            <option value="Intake">{t("statusIntake")}</option>
            <option value="Due Diligence">{t("statusDueDiligence")}</option>
            <option value="Contracts">{t("statusContracts")}</option>
            <option value="Notary">{t("statusNotary")}</option>
            <option value="Registry">{t("statusRegistry")}</option>
            <option value="Completed">{t("statusCompleted")}</option>
          </select>

          <div className="overview-actions">
            <button className="btn primary overview-new-project" onClick={onNewProject}>
              {t("newProject")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container">
        <div className="card">
          <table className="table mattersTable" style={{ width: "100%" }}>
            <thead>
              <tr>
                <SortHeader field="project_number" label={t("matterTableCol")} className="column-matter" />
                <SortHeader field="status" label={t("statusTableCol")} align="left" />
                <SortHeader field="risk" label={t("riskTableCol")} align="left" />
                <SortHeader field="target_close_date" label={t("deadlineTableCol")} />
                <SortHeader field="client" label={t("clientTableCol")} />
                <SortHeader field="location" label={t("locationTableCol")} className="column-location" align="center" />
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredProjects.map((p) => {
                const d = daysUntil(p.target_close_date);
                const isOverdue = d !== null && d < 0;
                const isSoon = d !== null && d <= 7 && d >= 0;
                const matterLabel = formatProjectLabel(p);

	                return (
	                  <tr
	                    key={p.id}
	                    onClick={() => onProjectSelect(p.id)}
	                    style={{ cursor: "pointer" }}
	                  >
	                    <td className="matterCell">
	                      <div className="rowCell">
	                        <div className="matterText" style={{ fontWeight: 800 }} title={matterLabel}>
	                          {matterLabel}
	                        </div>
	                      </div>
	                    </td>
	                    <td style={{ textAlign: "left" }}>
	                      <div className="rowCell" style={{ justifyContent: "flex-start" }}>
	                        {statusPill(p.status, t)}
	                      </div>
	                    </td>
	                    <td style={{ textAlign: "left" }}>
	                      <div className="rowCell" style={{ justifyContent: "flex-start" }}>
	                        {riskPill(p.risk, t)}
	                      </div>
	                    </td>
	                    <td>
	                      <div className="rowCell">{fmtDateShort(p.target_close_date)}</div>
	                    </td>
	                    <td>
	                      <div className="rowCell">{formatClientName(p.client?.name, t("unknownClient"))}</div>
	                    </td>
	                    <td style={{ textAlign: "center" }}>
	                      <div className="rowCell" style={{ justifyContent: "center" }}>
	                        <span className="pill neutral">{p.location}</span>
	                      </div>
	                    </td>
	                  </tr>
	                );
	              })}
              {sortedAndFilteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                    {t("noProjectsMatch")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-container">
        <Footer />
      </div>
    </div>
  );
}