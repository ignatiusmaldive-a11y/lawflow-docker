import React, { useMemo, useState } from "react";
import { Project } from "../lib/api";
import { useI18n } from "../lib/i18n";

type SortField = "title" | "status" | "location" | "risk" | "target_close_date" | "client";
type SortDirection = "asc" | "desc";

function riskPill(risk: Project["risk"]) {
  if (risk === "Critical") return <span className="pill bad">Critical</span>;
  if (risk === "At Risk") return <span className="pill warn">At risk</span>;
  return <span className="pill ok">Normal</span>;
}

function statusPill(status: string) {
  const colors: Record<string, string> = {
    "Due Diligence": "warn",
    "Contracts": "warn",
    "Notary": "bad",
    "Registry": "ok",
    "Completed": "ok"
  };
  return <span className={`pill ${colors[status] || "neutral"}`}>{status}</span>;
}

function fmtDateShort(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
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
}: {
  projects: Project[];
  onProjectSelect: (projectId: number) => void;
}) {
  const { t } = useI18n();
  const [sortField, setSortField] = useState<SortField>("target_close_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const sortedAndFilteredProjects = useMemo(() => {
    let filtered = projects.filter(p => {
      const matchesText = 
        p.title.toLowerCase().includes(filter.toLowerCase()) ||
        p.location.toLowerCase().includes(filter.toLowerCase()) ||
        (p.client?.name || "").toLowerCase().includes(filter.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      
      return matchesText && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "client") {
        aVal = a.client?.name || "";
        bVal = b.client?.name || "";
      } else if (sortField === "target_close_date") {
        aVal = aVal ? new Date(aVal).getTime() : Infinity;
        bVal = bVal ? new Date(bVal).getTime() : Infinity;
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

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th 
      onClick={() => handleSort(field)} 
      style={{ cursor: "pointer", userSelect: "none" }}
      className={sortField === field ? "active-sort" : ""}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {label}
        {sortField === field && (
          <span style={{ fontSize: 10 }}>{sortDirection === "asc" ? "▲" : "▼"}</span>
        )}
      </div>
    </th>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats Cards */}
      <div className="grid4">
        <div className="card cardPad">
          <div className="kpiTop">
            <div className="kpiLabel">{t("totalMatters")}</div>
            <span className="pill">{summaryStats.total}</span>
          </div>
          <div className="kpiValue">{summaryStats.total}</div>
        </div>
        <div className="card cardPad">
          <div className="kpiTop">
            <div className="kpiLabel">{t("activeProjects")}</div>
            <span className="pill warn">{summaryStats.active}</span>
          </div>
          <div className="kpiValue">{summaryStats.active}</div>
        </div>
        <div className="card cardPad">
          <div className="kpiTop">
            <div className="kpiLabel">{t("closedProjects")}</div>
            <span className="pill ok">{summaryStats.completed}</span>
          </div>
          <div className="kpiValue">{summaryStats.completed}</div>
        </div>
        <div className="card cardPad">
          <div className="kpiTop">
            <div className="kpiLabel">{t("highRiskProjects")}</div>
            <span className="pill bad">{summaryStats.highRisk}</span>
          </div>
          <div className="kpiValue">{summaryStats.highRisk}</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="card cardPad" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="search"
          placeholder={t("searchProjectsPlaceholder")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: 300 }}
        />
        
        <select 
          className="select" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: 150 }}
        >
          <option value="All">{t("allStatuses")}</option>
          <option value="Due Diligence">Due Diligence</option>
          <option value="Contracts">Contracts</option>
          <option value="Notary">Notary</option>
          <option value="Registry">Registry</option>
          <option value="Completed">Completed</option>
        </select>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
          {t("showingProjects").replace("{count}", String(sortedAndFilteredProjects.length))}
        </div>
      </div>

      {/* Main Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table className="table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <SortHeader field="title" label={t("matterTableCol")} />
              <SortHeader field="location" label={t("locationTableCol")} />
              <SortHeader field="status" label={t("statusTableCol")} />
              <SortHeader field="risk" label={t("riskTableCol")} />
              <SortHeader field="target_close_date" label={t("deadlineTableCol")} />
              <SortHeader field="client" label={t("clientTableCol")} />
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredProjects.map((p) => {
              const d = daysUntil(p.target_close_date);
              const isOverdue = d !== null && d < 0;
              const isSoon = d !== null && d <= 7 && d >= 0;

              return (
                <tr 
                  key={p.id} 
                  onClick={() => onProjectSelect(p.id)} 
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    <div style={{ fontWeight: 800 }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>#{p.id} · {p.transaction_type}</div>
                  </td>
                  <td>
                    <span className="pill neutral">{p.location}</span>
                  </td>
                  <td>{statusPill(p.status)}</td>
                  <td>{riskPill(p.risk)}</td>
                  <td>
                    <div style={{ 
                      fontWeight: isOverdue || isSoon ? 900 : 400,
                      color: isOverdue ? "var(--danger)" : isSoon ? "var(--warn)" : "inherit"
                    }}>
                      {fmtDateShort(p.target_close_date)}
                    </div>
                    {d !== null && (
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>
                        {isOverdue ? `${Math.abs(d)}d overdue` : `${d}d left`}
                      </div>
                    )}
                  </td>
                  <td>{p.client?.name ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn ghost" style={{ padding: "6px 10px" }}>Open ›</button>
                  </td>
                </tr>
              );
            })}
            {sortedAndFilteredProjects.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                  {t("noProjectsMatch")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
