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
  },
  {
    id: 9,
    name: "Poznan Coast Partners",
    areas: ["Benalmádena", "Fuengirola", "Torremolinos"],
    specialties: ["Apartamentos", "Primera vivienda", "Familias"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Agencia centrada en vivienda residencial y primera compra, con acompañamiento en visitas y coordinación de financiación."
  },
  {
    id: 10,
    name: "Szczecin Property Desk",
    areas: ["Estepona", "Cancelada", "San Pedro"],
    specialties: ["Obra nueva", "Residencial", "Llave en mano"],
    languages: ["PL", "EN"],
    website: "https://example.com",
    description: "Equipo especializado en promociones y proyectos de obra nueva, con soporte de reservas y gestión de postventa."
  },
  {
    id: 11,
    name: "Lodz Costa Invest",
    areas: ["Málaga", "Rincón de la Victoria", "Benalmádena"],
    specialties: ["Inversión", "Alquiler", "Ciudad"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Enfoque inversor: análisis de rentabilidad, demanda y apoyo a la gestión de alquiler vacacional."
  },
  {
    id: 12,
    name: "Katowice Golf Estates",
    areas: ["Benahavís", "Nueva Andalucía", "Marbella"],
    specialties: ["Golf", "Villas", "Lifestyle"],
    languages: ["PL", "ES", "EN", "DE"],
    website: "https://example.com",
    description: "Selección de viviendas cerca de campos de golf con asesoría para compradores internacionales."
  },
  {
    id: 13,
    name: "Gdynia Beachfront Realty",
    areas: ["Fuengirola", "La Cala de Mijas", "Mijas"],
    specialties: ["Costa", "Segunda residencia", "Alquiler vacacional"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Especialistas en propiedades cerca del mar, con soporte para inversión y segunda residencia."
  },
  {
    id: 14,
    name: "Rzeszow Family Relocation",
    areas: ["Marbella", "San Pedro", "Estepona"],
    specialties: ["Relocation", "Familias", "Servicios"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Acompañamiento integral para mudanza: colegios, servicios y coordinación del proceso de compra."
  },
  {
    id: 15,
    name: "Bialystok NewBuild Hub",
    areas: ["Casares", "Estepona", "Sotogrande"],
    specialties: ["Obra nueva", "Promociones", "Entrega"],
    languages: ["PL", "ES", "EN"],
    website: "https://example.com",
    description: "Catálogo de nuevas promociones con proceso guiado desde la reserva hasta la entrega."
  },
  {
    id: 16,
    name: "Lublin Prime Keys",
    areas: ["Golden Mile", "Puerto Banús", "Marbella"],
    specialties: ["Lujo", "Villas", "Prime"],
    languages: ["PL", "EN"],
    website: "https://example.com",
    description: "Intermediación en zonas prime con visitas privadas y soporte para compradores de alto nivel."
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
        <div className="card cardPad">
          <div style={{ fontWeight: 900, color: "var(--text)", marginBottom: 2 }}>Directorio</div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800, marginBottom: 14 }}>
            Datos de ejemplo (verifica y sustituye por agencias reales)
          </div>

          {agencies.length > 0 ? (
            <ol style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 10 }}>
              {agencies.map((agency) => {
                const primaryArea = agency.areas[0] ?? "—";
                const primarySpecialty = agency.specialties[0] ?? "—";
                const languages = agency.languages.join(", ");
                const websiteLabel = agency.website ? agency.website.replace(/^https?:\/\//, "") : null;

                return (
                  <li key={agency.id} style={{ padding: "10px 10px", borderRadius: 12, border: "1px solid var(--line)", background: "var(--panel2)" }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 950, minWidth: 0 }}>{agency.name}</div>
                      {agency.website ? (
                        <a
                          href={agency.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 850, overflowWrap: "anywhere" }}
                        >
                          {websiteLabel}
                        </a>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>
                      )}
                    </div>

                    <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <span className="pill neutral" style={{ maxWidth: "unset" }}>{primaryArea}</span>
                      <span className="pill ok" style={{ maxWidth: "unset" }}>{primarySpecialty}</span>
                      <span className="pill neutral" style={{ maxWidth: "unset" }}>{languages}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
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
