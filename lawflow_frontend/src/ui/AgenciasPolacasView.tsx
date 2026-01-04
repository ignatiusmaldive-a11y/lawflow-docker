import React, { useMemo, useState } from "react";
import { Footer } from "./components/Footer";

type SortField = "name" | "area" | "specialty" | "languages";
type SortDirection = "asc" | "desc";

interface PolishAgency {
  id: number;
  name: string;
  areas: string[];
  specialties: string[];
  languages: string[];
  website?: string;
  description: string;
}

const SAMPLE_AGENCIES: PolishAgency[] = [
  {
    id: 1,
    name: "CostaPol Homes",
    areas: ["Marbella", "Benahavís", "Puerto Banús"],
    specialties: ["Lujo", "Villas", "Obra nueva"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Agencia enfocada en compradores polacos en la Costa del Sol, con soporte de búsqueda, reservas y acompañamiento en firma."
  },
  {
    id: 2,
    name: "PoloniaSun Realty",
    areas: ["Estepona", "Nueva Andalucía", "San Pedro"],
    specialties: ["Apartamentos", "Residencial", "Familias"],
    languages: ["PL", "EN"],
    website: "https://example.com",
    description: "Selección de viviendas en urbanizaciones y zonas residenciales, con orientación en trámites y servicios postventa."
  },
  {
    id: 3,
    name: "BalticKey Costa",
    areas: ["Mijas", "Fuengirola", "La Cala de Mijas"],
    specialties: ["Segunda residencia", "Inversión", "Alquiler vacacional"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Agencia orientada a perfiles inversores y segunda residencia; enfoque en rentabilidad, gestión y zonas con alta demanda."
  },
  {
    id: 4,
    name: "Varsovia Marbella Estates",
    areas: ["Marbella", "Golden Mile"],
    specialties: ["Lujo", "Villas", "Lifestyle"],
    languages: ["PL", "ES", "EN", "DE"],
    website: "https://example.com",
    description: "Intermediación en segmento prime con enfoque en estilo de vida, visitas privadas y asesoría de mercado para compradores internacionales."
  },
  {
    id: 5,
    name: "Sierra Blanca Polska",
    areas: ["Marbella", "Benahavís", "La Zagaleta"],
    specialties: ["Ultra-lujo", "Parcelas", "Villas"],
    languages: ["PL", "EN"],
    website: "https://example.com",
    description: "Especialistas en propiedades exclusivas y parcelas, con coordinación de arquitectos, reformas y equipos de confianza."
  },
  {
    id: 6,
    name: "Wroclaw Costa Advisors",
    areas: ["Torremolinos", "Málaga", "Benalmádena"],
    specialties: ["Ciudad", "Alquiler", "Inversión"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Equipo enfocado en zonas urbanas y costa oriental; análisis de demanda y soporte de gestión para compra con fines de alquiler."
  },
  {
    id: 7,
    name: "Gdansk NewBuilds",
    areas: ["Estepona", "Casares", "Sotogrande"],
    specialties: ["Obra nueva", "Promociones", "Entrega llave en mano"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Catálogo de obra nueva y promociones; proceso guiado desde reserva hasta entrega, con coordinación de mobiliario y altas."
  },
  {
    id: 8,
    name: "Krakow Costa Living",
    areas: ["Fuengirola", "Marbella", "Estepona"],
    specialties: ["Residencial", "Relocation", "Servicios"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Acompañamiento a familias y perfiles relocation: colegios, zonas, servicios y apoyo integral durante el traslado."
  }
];

function compareStrings(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

export function AgenciasPolacasView() {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState<string>("All");

  const allAreas = useMemo(() => {
    const set = new Set<string>();
    for (const agency of SAMPLE_AGENCIES) for (const area of agency.areas) set.add(area);
    return ["All", ...Array.from(set).sort(compareStrings)];
  }, []);

  const { agencies, totalCount } = useMemo(() => {
    const q = filter.trim().toLowerCase();
    let filtered = SAMPLE_AGENCIES.filter((a) => {
      const matchesText =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.areas.some((x) => x.toLowerCase().includes(q)) ||
        a.specialties.some((x) => x.toLowerCase().includes(q)) ||
        a.languages.some((x) => x.toLowerCase().includes(q));

      const matchesArea = areaFilter === "All" || a.areas.includes(areaFilter);
      return matchesText && matchesArea;
    });

    filtered.sort((a, b) => {
      const dir = sortDirection === "asc" ? 1 : -1;
      const aArea = a.areas[0] ?? "";
      const bArea = b.areas[0] ?? "";
      const aSpec = a.specialties[0] ?? "";
      const bSpec = b.specialties[0] ?? "";

      if (sortField === "name") return compareStrings(a.name, b.name) * dir;
      if (sortField === "area") return compareStrings(aArea, bArea) * dir;
      if (sortField === "specialty") return compareStrings(aSpec, bSpec) * dir;
      return compareStrings(a.languages.join(", "), b.languages.join(", ")) * dir;
    });

    return { agencies: filtered, totalCount: filtered.length };
  }, [filter, areaFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortFieldLabel = (f: SortField) => {
    if (f === "name") return "Agencia";
    if (f === "area") return "Zona";
    if (f === "specialty") return "Especialidad";
    return "Idiomas";
  };

  const SortHeader = ({
    field,
    label,
    width,
    align,
  }: {
    field: SortField;
    label: string;
    width?: string;
    align?: "left" | "center" | "right";
  }) => (
    <th
      onClick={() => handleSort(field)}
      style={{ cursor: "pointer", userSelect: "none", width: width, textAlign: align }}
      className={sortField === field ? "active-sort" : ""}
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
        {sortField === field && <span style={{ fontSize: 10 }}>{sortDirection === "asc" ? "▲" : "▼"}</span>}
      </div>
    </th>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="table-container">
        <div className="card cardPad" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="search"
            placeholder="Buscar agencias..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ flex: "1 1 320px", minWidth: 220 }}
          />

          <select
            className="select"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            style={{ flex: "0 1 240px", minWidth: 200 }}
          >
            {allAreas.map((a) => (
              <option key={a} value={a}>
                {a === "All" ? "Todas las zonas" : a}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            style={{ flex: "0 1 220px", minWidth: 190 }}
            aria-label="Ordenar por"
          >
            <option value="name">Orden: Agencia</option>
            <option value="area">Orden: Zona</option>
            <option value="specialty">Orden: Especialidad</option>
            <option value="languages">Orden: Idiomas</option>
          </select>

          <button
            className="btn"
            onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
            title="Cambiar dirección"
          >
            {sortDirection === "asc" ? "Asc" : "Desc"}
          </button>

          <div className="overview-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="project-count-label" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
              {totalCount} agencias
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <div className="card agenciasTableWrap">
          <div className="cardPad" style={{ paddingBottom: 10 }}>
            <div style={{ fontWeight: 900, color: "var(--text)" }}>Directorio</div>
            <div style={{ marginTop: 2, fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
              Datos de ejemplo (verifica y sustituye por agencias reales)
            </div>
          </div>

          <table className="table agenciasTable" style={{ width: "100%" }}>
            <thead>
              <tr>
                <SortHeader field="name" label="Agencia" />
                <SortHeader field="area" label="Zonas (principal)" align="center" />
                <SortHeader field="specialty" label="Especialidad" align="center" />
                <SortHeader field="languages" label="Idiomas" align="center" />
                <th style={{ textAlign: "left" }}>Web</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency.id}>
                  <td style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, marginBottom: 4 }}>{agency.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: "1.4" }}>{agency.description}</div>
                  </td>
                  <td style={{ textAlign: "center", minWidth: 0 }}>
                    <span className="pill neutral" style={{ maxWidth: "unset" }}>{agency.areas[0] ?? "—"}</span>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                      {agency.areas.slice(1, 4).map((a) => (
                        <span key={a} className="pill" style={{ maxWidth: "unset" }}>{a}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", minWidth: 0 }}>
                    <span className="pill ok" style={{ maxWidth: "unset" }}>{agency.specialties[0] ?? "—"}</span>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                      {agency.specialties.slice(1, 4).map((s) => (
                        <span key={s} className="pill neutral" style={{ maxWidth: "unset" }}>{s}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", minWidth: 0 }}>
                    <span className="pill neutral" style={{ maxWidth: "unset" }}>{agency.languages.join(", ")}</span>
                  </td>
                  <td style={{ minWidth: 0 }}>
                    {agency.website ? (
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--muted)", textDecoration: "none", fontSize: 14, fontWeight: 700 }}
                      >
                        {agency.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}

              {agencies.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
                    No se encontraron agencias que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-container">
        <div className="agenciasCards">
          {agencies.map((agency) => (
            <div key={agency.id} className="card cardPad" style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 950, marginBottom: 4, lineHeight: 1.15 }}>{agency.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45 }}>{agency.description}</div>
                </div>
                <div className="pill neutral" title={`Orden: ${sortFieldLabel(sortField)}`}>
                  #{agency.id}
                </div>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                <div>
                  <div className="small" style={{ fontWeight: 900, marginBottom: 6 }}>
                    Zonas
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {agency.areas.map((a) => (
                      <span key={a} className="pill neutral" style={{ maxWidth: "unset" }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="small" style={{ fontWeight: 900, marginBottom: 6 }}>
                    Especialidades
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {agency.specialties.map((s) => (
                      <span key={s} className="pill" style={{ maxWidth: "unset" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div className="small" style={{ fontWeight: 900, marginBottom: 6 }}>
                      Idiomas
                    </div>
                    <div className="pill neutral" style={{ maxWidth: "unset" }}>
                      {agency.languages.join(", ")}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 0 }}>
                    <div className="small" style={{ fontWeight: 900, marginBottom: 6 }}>
                      Web
                    </div>
                    {agency.website ? (
                      <a
                        href={agency.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "var(--muted)",
                          textDecoration: "none",
                          fontSize: 13,
                          fontWeight: 850,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {agency.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span style={{ color: "var(--muted)" }}>—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {agencies.length === 0 && (
            <div className="card cardPad" style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
              No se encontraron agencias que coincidan con los criterios de búsqueda.
            </div>
          )}
        </div>
      </div>

      <div className="table-container">
        <div className="card cardPad" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div className="pill neutral">Consejo</div>
          <div style={{ color: "var(--muted)", lineHeight: "1.45" }}>
            Antes de publicar el directorio, valida la licencia/registro, datos de contacto y la web oficial de cada agencia.
          </div>
        </div>
      </div>

      <div className="table-container">
        <Footer />
      </div>
    </div>
  );
}
