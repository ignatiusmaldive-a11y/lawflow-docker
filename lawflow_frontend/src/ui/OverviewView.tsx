import React, { useMemo, useState } from "react";
import { Project, api3 } from "../lib/api";

type SortField = "title" | "status" | "location" | "risk" | "target_close_date";
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

export function OverviewView({
  projects,
  onProjectSelect,
  onProjectUpdate
}: {
  projects: Project[];
  onProjectSelect: (projectId: number) => void;
  onProjectUpdate?: (project: Project) => void;
}) {
  const [sortField, setSortField] = useState<SortField>("target_close_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState("");

  const sortedAndFilteredProjects = useMemo(() => {
    let filtered = projects.filter(p =>
      p.title.toLowerCase().includes(filter.toLowerCase()) ||
      p.location.toLowerCase().includes(filter.toLowerCase()) ||
      p.status.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "target_close_date") {
        aVal = aVal ? new Date(aVal).getTime() : Infinity;
        bVal = bVal ? new Date(bVal).getTime() : Infinity;
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, sortField, sortDirection, filter]);

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
    const critical = projects.filter(p => p.risk === "Critical").length;
    const atRisk = projects.filter(p => p.risk === "At Risk").length;

    return { total, active, completed, critical, atRisk };
  }, [projects]);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="sortable"
      onClick={() => handleSort(field)}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {children}
      {sortField === field && (
        <span style={{ marginLeft: 4 }}>
          {sortDirection === "asc" ? "↑" : "↓"}
        </span>
      )}
    </th>
  );

  return (
    <div className="overview-view">
      <div className="sectionTitle" style={{ marginBottom: 20 }}>
        <h2>Project Overview</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search projects..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              border: "1px solid #e1e5e9",
              borderRadius: 4,
              fontSize: 14,
              width: 200
            }}
          />
        </div>
      </div>

      <div className="grid4" style={{ marginBottom: 24 }}>
        <div className="card cardPad">
          <div className="kpiTop">
            <div className="kpiLabel">Total Projects</div>
            <span className="pill">{summaryStats.total}</span>
          </div>
          <div className="kpiValue">{summaryStats.total}</div>
          <div className="small">All matters</div>
        </div>
        <div className="card cardPad">
          <div className="kpiTop">
            <div className="kpiLabel">Active Projects</div>
            <span className="pill warn">{summaryStats.active}</span>
          </div>
          <div className="kpiValue">{summaryStats.active}</div>
          <div className="small">In progress</div>
        </div>
        <div className="card cardPad">
          <div className="kpiTop">
            <div className="kpiLabel">Completed</div>
            <span className="pill ok">{summaryStats.completed}</span>
          </div>
          <div className="kpiValue">{summaryStats.completed}</div>
          <div className="small">Closed matters</div>
        </div>
        <div className="card cardPad">
          <div className="kpiTop">
            <div className="kpiLabel">High Risk</div>
            <span className="pill bad">{summaryStats.critical + summaryStats.atRisk}</span>
          </div>
          <div className="kpiValue">{summaryStats.critical + summaryStats.atRisk}</div>
          <div className="small">Need attention</div>
        </div>
      </div>

      <div className="card cardPad">
        <table className="project-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e1e5e9" }}>
              <SortableHeader field="title">Project Title</SortableHeader>
              <SortableHeader field="location">Location</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="risk">Risk</SortableHeader>
              <th>Type</th>
              <SortableHeader field="target_close_date">Target Close</SortableHeader>
              <th>Client</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredProjects.map((project) => {
              const daysLeft = daysUntil(project.target_close_date);
              const isOverdue = daysLeft !== null && daysLeft < 0;
              const isDueSoon = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;

              return (
                <tr
                  key={project.id}
                  className="project-row"
                  style={{
                    borderBottom: "1px solid #f0f2f5",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onClick={() => onProjectSelect(project.id)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <td style={{ padding: "12px 8px", maxWidth: 300 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{project.title}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      ID: {project.id} • Started: {fmtDateShort(project.start_date)}
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span className="pill neutral">{project.location}</span>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {statusPill(project.status)}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {riskPill(project.risk)}
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <span className={`pill ${project.transaction_type === 'Purchase' ? 'primary' : 'secondary'}`}>
                      {project.transaction_type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{
                      color: isOverdue ? "#dc3545" : isDueSoon ? "#fd7e14" : "#6c757d",
                      fontWeight: isOverdue || isDueSoon ? 600 : 400
                    }}>
                      {fmtDateShort(project.target_close_date)}
                      {daysLeft !== null && (
                        <div style={{ fontSize: 11, marginTop: 2 }}>
                          {isOverdue ? `${Math.abs(daysLeft)} days overdue` :
                           daysLeft === 0 ? "Due today" :
                           daysLeft === 1 ? "Tomorrow" :
                           `${daysLeft} days left`}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ fontSize: 14 }}>
                      {project.client?.name || "—"}
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        className="btn ghost"
                        style={{ fontSize: 12, padding: "4px 8px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectSelect(project.id);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sortedAndFilteredProjects.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: 40,
            color: "#6c757d",
            fontStyle: "italic"
          }}>
            No projects match your search criteria.
          </div>
        )}
      </div>

      <style jsx>{`
        .project-table th {
          textAlign: left;
          padding: 12px 8px;
          fontWeight: 600;
          fontSize: 14px;
          color: #495057;
          backgroundColor: #f8f9fa;
        }

        .project-row:hover {
          backgroundColor: #f8f9fa !important;
        }

        .sortable:hover {
          backgroundColor: #e9ecef;
        }
      `}</style>
    </div>
  );
}