import React, { useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";
import { Footer } from "./components/Footer";

type SortField = "title" | "type" | "location" | "last_updated";
type SortDirection = "asc" | "desc";

interface BusinessReport {
  id: number;
  title: string;
  type: "Local" | "Nacional" | "Noticias 2025";
  location?: string;
  description: string;
  last_updated: string;
  sample_data: any;
}

// Sample data for business intelligence reports
const SAMPLE_REPORTS: BusinessReport[] = [
  {
    id: 1,
    title: "Análisis del Mercado Inmobiliario de Marbella 2025",
    type: "Local",
    location: "Marbella",
    description: "Estudio completo del mercado inmobiliario local incluyendo tendencias de precios, demanda y oferta.",
    last_updated: "2025-01-15",
    sample_data: {}
  },
  {
    id: 2,
    title: "Tendencias del Mercado Residencial en Costa del Sol 2025",
    type: "Local",
    location: "Costa del Sol",
    description: "Análisis regional de las tendencias residenciales y comportamiento del comprador.",
    last_updated: "2025-01-12",
    sample_data: {}
  },
  {
    id: 3,
    title: "Informe Nacional: Evolución de Precios Inmobiliarios 2025",
    type: "Nacional",
    description: "Panorama nacional de la evolución de precios inmobiliarios por comunidades autónomas.",
    last_updated: "2025-01-10",
    sample_data: {}
  },
  {
    id: 4,
    title: "Análisis del Mercado de Alquiler en Málaga Capital 2025",
    type: "Local",
    location: "Málaga",
    description: "Estudio detallado del mercado de alquiler en la capital malagueña.",
    last_updated: "2025-01-08",
    sample_data: {}
  },
  {
    id: 5,
    title: "Informe Nacional: Impacto de las Hipotecas Variables 2025",
    type: "Nacional",
    description: "Análisis del impacto de las condiciones hipotecarias en el mercado inmobiliario nacional.",
    last_updated: "2025-01-05",
    sample_data: {}
  },
  {
    id: 6,
    title: "Estudio del Mercado de Lujo en Puerto Banús 2025",
    type: "Local",
    location: "Puerto Banús",
    description: "Análisis especializado del segmento de lujo en una de las zonas más exclusivas.",
    last_updated: "2025-01-03",
    sample_data: {}
  },
  {
    id: 7,
    title: "Tendencias Nacionales de Inversión Inmobiliaria 2025",
    type: "Nacional",
    description: "Perspectivas de inversión y oportunidades en el mercado inmobiliario español.",
    last_updated: "2025-01-01",
    sample_data: {}
  },
  {
    id: 8,
    title: "Análisis del Mercado Turístico en Torremolinos 2024",
    type: "Local",
    location: "Torremolinos",
    description: "Estudio del impacto del turismo en el mercado inmobiliario local.",
    last_updated: "2024-12-28",
    sample_data: {}
  },
  {
    id: 1001,
    title: "Cambios Regulatorios Clave en Alquileres Turísticos (VFT) en la Costa del Sol para 2025",
    type: "Noticias 2025",
    location: "Costa del Sol",
    description:
      "Resumen de los cambios (LPH/LO 1/2025), requisitos VFT y acciones recomendadas para propietarios y gestores.",
    last_updated: "2025",
    sample_data: {}
  },
  {
    id: 1002,
    title: "Fin del Golden Visa Inmobiliario y su Impacto en el Mercado de Lujo de la Costa del Sol",
    type: "Noticias 2025",
    location: "Costa del Sol",
    description:
      "Impacto del fin de la residencia por inversión inmobiliaria (abril 2025) y recomendaciones para inversores no UE.",
    last_updated: "2025",
    sample_data: {}
  },
  {
    id: 1003,
    title: "Estadísticas y Tendencias del Mercado Inmobiliario en Costa del Sol 2025",
    type: "Noticias 2025",
    location: "Costa del Sol",
    description:
      "Datos y tabla clave (INE/Registradores/Idealista) con precios, variación anual y compras extranjeras; proyección 2026.",
    last_updated: "2025",
    sample_data: {}
  },
  {
    id: 1004,
    title: "Avances en el Plan General de Marbella y Aspectos Fiscales Relevantes 2025",
    type: "Noticias 2025",
    location: "Marbella",
    description:
      "Estado del PGOM/POU (LISTA) y resumen de impuestos clave en Andalucía 2025 (ISD, plusvalía, IBI, IRNR).",
    last_updated: "2025",
    sample_data: {}
  }
];

function fmtDateShort(d: string) {
  if (/^\d{4}$/.test(d)) return d;
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export function InformesSectorialesView() {
  const { t } = useI18n();
  const [sortField, setSortField] = useState<SortField>("last_updated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const { localReports, news2025Reports, totalCount } = useMemo(() => {
    const textQuery = filter.trim().toLowerCase();
    let filtered = SAMPLE_REPORTS.filter((r) => r.type !== "Nacional").filter((r) => {
      const matchesText =
        !textQuery ||
        r.title.toLowerCase().includes(textQuery) ||
        (r.location || "").toLowerCase().includes(textQuery) ||
        r.description.toLowerCase().includes(textQuery);

      const matchesType = typeFilter === "All" || r.type === typeFilter;
      return matchesText && matchesType;
    });

    filtered.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      if (sortField === "last_updated") {
        const parse = (raw: string) => (/^\d{4}$/.test(raw) ? new Date(`${raw}-01-01`).getTime() : new Date(raw).getTime());
        aVal = parse(a[sortField]);
        bVal = parse(b[sortField]);
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

    const localReports = filtered.filter((r) => r.type === "Local");
    const news2025Reports = filtered.filter((r) => r.type === "Noticias 2025");
    return { localReports, news2025Reports, totalCount: filtered.length };
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

  const ReportsSection = ({
    title,
    reports,
  }: {
    title: string;
    reports: BusinessReport[];
  }) => (
    <div className="table-container">
      <div className="card" style={{ overflowX: "auto" }}>
        <div className="cardPad" style={{ paddingBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontWeight: 900, color: "var(--text)" }}>{title}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800, textAlign: "right", whiteSpace: "nowrap" }}>
              {reports.length} informes
            </div>
          </div>
        </div>
        <table className="table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <SortHeader field="title" label="Título del Informe" className="column-title" />
              <SortHeader field="type" label="Tipo" align="center" />
              <SortHeader field="location" label="Ubicación" align="center" />
              <SortHeader field="last_updated" label="Fecha" />
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const slugMap: Record<string, string> = {
                    "Análisis del Mercado Inmobiliario de Marbella 2025": "marbella-2025",
                    "Tendencias del Mercado Residencial en Costa del Sol 2025": "costa-del-sol-2025",
                    "Informe Nacional: Evolución de Precios Inmobiliarios 2025": "evolucion-precios-nacional",
                    "Análisis del Mercado de Alquiler en Málaga Capital 2025": "alquiler-malaga-2025",
                    "Informe Nacional: Impacto de las Hipotecas Variables 2025": "impacto-hipotecas-2025",
                    "Estudio del Mercado de Lujo en Puerto Banús 2025": "puerto-banus-2025",
                    "Tendencias Nacionales de Inversión Inmobiliaria 2025": "inversion-nacional-2025",
                    "Análisis del Mercado Turístico en Torremolinos 2024": "turistico-torremolinos-2024",
                    "Cambios Regulatorios Clave en Alquileres Turísticos (VFT) en la Costa del Sol para 2025":
                      "cambios-regulatorios-vft-2025",
                    "Fin del Golden Visa Inmobiliario y su Impacto en el Mercado de Lujo de la Costa del Sol":
                      "fin-golden-visa-2025",
                    "Estadísticas y Tendencias del Mercado Inmobiliario en Costa del Sol 2025":
                      "estadisticas-tendencias-costa-del-sol-2025",
                    "Avances en el Plan General de Marbella y Aspectos Fiscales Relevantes 2025":
                      "pgom-marbella-fiscalidad-2025",
                  };
                  const slug = slugMap[report.title];
                  if (slug) {
                    window.history.pushState(null, "", `/informes-sectoriales/${slug}`);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  } else {
                    alert(`Informes completos disponibles próximamente. Este es un ejemplo del informe: "${report.title}"`);
                  }
                }}
              >
                <td style={{ minWidth: "300px", whiteSpace: "normal" }}>
                  <div style={{ fontWeight: 800, marginBottom: 4 }}>{report.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: "1.4" }}>
                    {report.description}
                  </div>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span
                    className={`pill ${report.type === "Local" ? "neutral" : "warn"}`}
                  >
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
            {reports.length === 0 && (
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
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
            <option value="Noticias 2025">Noticias 2025</option>
          </select>

          <div className="overview-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="project-count-label" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
              {totalCount} informes disponibles
            </div>
          </div>
        </div>
      </div>

      {/* Reports Sections */}
      {totalCount === 0 ? (
        <div className="table-container">
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            No se encontraron informes que coincidan con los criterios de búsqueda.
          </div>
        </div>
      ) : (
        <>
          {(typeFilter === "Noticias 2025" || (typeFilter === "All" && news2025Reports.length > 0)) && (
            <ReportsSection title="Noticias 2025" reports={news2025Reports} />
          )}
          {(typeFilter === "Local" || (typeFilter === "All" && localReports.length > 0)) && (
            <ReportsSection title="Local" reports={localReports} />
          )}
        </>
      )}

      <div className="table-container">
        <Footer />
      </div>
    </div>
  );
}
