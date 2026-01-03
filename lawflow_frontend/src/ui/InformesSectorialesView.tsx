import React, { useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";

type SortField = "title" | "type" | "location" | "last_updated";
type SortDirection = "asc" | "desc";

interface BusinessReport {
  id: number;
  title: string;
  type: "Local" | "Nacional";
  location?: string;
  description: string;
  last_updated: string;
  sample_data: any;
}

// Sample data for business intelligence reports
const SAMPLE_REPORTS: BusinessReport[] = [
  {
    id: 1,
    title: "Análisis del Mercado Inmobiliario de Marbella 2024",
    type: "Local",
    location: "Marbella",
    description: "Estudio completo del mercado inmobiliario local incluyendo tendencias de precios, demanda y oferta.",
    last_updated: "2024-01-15",
    sample_data: {}
  },
  {
    id: 2,
    title: "Tendencias del Mercado Residencial en Costa del Sol",
    type: "Local",
    location: "Costa del Sol",
    description: "Análisis regional de las tendencias residenciales y comportamiento del comprador.",
    last_updated: "2024-01-12",
    sample_data: {}
  },
  {
    id: 3,
    title: "Informe Nacional: Evolución de Precios Inmobiliarios",
    type: "Nacional",
    description: "Panorama nacional de la evolución de precios inmobiliarios por comunidades autónomas.",
    last_updated: "2024-01-10",
    sample_data: {}
  },
  {
    id: 4,
    title: "Análisis del Mercado de Alquiler en Málaga Capital",
    type: "Local",
    location: "Málaga",
    description: "Estudio detallado del mercado de alquiler en la capital malagueña.",
    last_updated: "2024-01-08",
    sample_data: {}
  },
  {
    id: 5,
    title: "Informe Nacional: Impacto de las Hipotecas Variables",
    type: "Nacional",
    description: "Análisis del impacto de las condiciones hipotecarias en el mercado inmobiliario nacional.",
    last_updated: "2024-01-05",
    sample_data: {}
  },
  {
    id: 6,
    title: "Estudio del Mercado de Lujo en Puerto Banús",
    type: "Local",
    location: "Puerto Banús",
    description: "Análisis especializado del segmento de lujo en una de las zonas más exclusivas.",
    last_updated: "2024-01-03",
    sample_data: {}
  },
  {
    id: 7,
    title: "Tendencias Nacionales de Inversión Inmobiliaria 2024",
    type: "Nacional",
    description: "Perspectivas de inversión y oportunidades en el mercado inmobiliario español.",
    last_updated: "2024-01-01",
    sample_data: {}
  },
  {
    id: 8,
    title: "Análisis del Mercado Turístico en Torremolinos",
    type: "Local",
    location: "Torremolinos",
    description: "Estudio del impacto del turismo en el mercado inmobiliario local.",
    last_updated: "2023-12-28",
    sample_data: {}
  }
];

function fmtDateShort(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function InformesSectorialesView() {
  const { t } = useI18n();
  const [sortField, setSortField] = useState<SortField>("last_updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const sortedAndFilteredReports = useMemo(() => {
    let filtered = SAMPLE_REPORTS.filter(r => {
      const matchesText =
        r.title.toLowerCase().includes(filter.toLowerCase()) ||
        (r.location || "").toLowerCase().includes(filter.toLowerCase()) ||
        r.description.toLowerCase().includes(filter.toLowerCase());

      const matchesType = typeFilter === "All" || r.type === typeFilter;

      return matchesText && matchesType;
    });

    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === "last_updated") {
        aVal = new Date(a[sortField]).getTime();
        bVal = new Date(b[sortField]).getTime();
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
  }, [sortField, sortDirection, filter, typeFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

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
            {sortDirection === "asc" ? "▲" : "▼"}
          </span>
        )}
      </div>
    </th>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "40px 20px", background: "linear-gradient(135deg, rgba(124,58,237,.05), rgba(34,197,94,.05))", borderRadius: "12px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: "0 0 16px 0", color: "var(--text)" }}>
          Informes Sectoriales
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', margin: '0 auto', maxWidth: '600px' }}>
          Análisis de inteligencia de negocio para el sector inmobiliario español
        </p>
      </div>

      {/* Filters & Actions */}
      <div className="table-container">
        <div className="card cardPad" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="search"
          placeholder="Buscar informes..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: 320 }}
        />

        <select
          className="select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="All">Todos los tipos</option>
          <option value="Local">Local</option>
          <option value="Nacional">Nacional</option>
        </select>

        <div className="overview-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="project-count-label" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
            {sortedAndFilteredReports.length} informes disponibles
          </div>
        </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="table-container">
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <SortHeader field="title" label="Título del Informe" className="column-title" />
              <SortHeader field="type" label="Tipo" align="center" />
              <SortHeader field="location" label="Ubicación" align="center" />
              <SortHeader field="last_updated" label="Última Actualización" />
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredReports.map((report) => (
              <tr
                key={report.id}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  // For now, just show an alert. In a real app, this would open the report
                  alert(`Informes completos disponibles próximamente. Este es un ejemplo del informe: "${report.title}"`);
                }}
              >
                <td style={{ minWidth: "300px", whiteSpace: "normal" }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{report.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: "1.4" }}>
                    {report.description}
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className={`pill ${report.type === "Local" ? "neutral" : "ok"}`}>
                    {report.type}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  {report.location ? (
                    <span className="pill neutral">{report.location}</span>
                  ) : (
                    <span style={{ color: "var(--muted)" }}>—</span>
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>
                    {fmtDateShort(report.last_updated)}
                  </div>
                </td>
              </tr>
            ))}
            {sortedAndFilteredReports.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                  No se encontraron informes que coincidan con los criterios de búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Footer */}
      <div className="table-container">
        <footer style={{
          marginTop: 'auto',
          padding: '40px 0 20px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Company Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, rgba(124,58,237,.95), rgba(34,197,94,.65))'
              }}>◆</div>
              <span style={{ fontSize: '18px', fontWeight: '900' }}>AMA - CRM</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
              CRM para abogados especializados en derecho inmobiliario.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', margin: '0 0 16px 0' }}>Informes Sectoriales</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState(null, "", "/informes-sectoriales"); window.dispatchEvent(new PopStateEvent('popstate')); }} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Local</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); window.history.pushState(null, "", "/informes-sectoriales"); window.dispatchEvent(new PopStateEvent('popstate')); }} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Nacional</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', margin: '0 0 16px 0' }}>Agencias Polacas</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Política de Privacidad</a></li>
              <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Términos de Servicio</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', margin: '0 0 16px 0' }}>Agente Inteligente</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Centro de Ayuda</a></li>
              <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Contacto</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--line)',
          paddingTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
            © 2026 AMA - CRM. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Twitter</a>
            <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>LinkedIn</a>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Made with ❤️ in Marbella</span>
          </div>
        </div>
        </footer>
      </div>
    </div>
  );
}
