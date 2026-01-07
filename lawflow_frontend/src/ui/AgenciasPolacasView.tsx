import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Footer } from "./components/Footer";
import { Agency, AgencyFacet, AgenciesMeta, AgenciesPage, apiAgencies } from "../lib/api";

type SortField = "name" | "type" | "polish_city" | "website_status" | "cleanup_status";
type SortDirection = "asc" | "desc";

function agencyTypeLabel(t?: string | null) {
  if (!t) return "—";
  if (t === "polish") return "Polonia";
  if (t === "Spain and Poland") return "España + Polonia";
  if (t === "marbella") return "Marbella";
  if (t === "gemini_discovered") return "Descubierta";
  return t;
}

function agencyTipoTagClass(t?: string | null) {
  if (t === "polish") return "agenciasTipoTag polish";
  if (t === "Spain and Poland") return "agenciasTipoTag spainPoland";
  if (t === "marbella") return "agenciasTipoTag marbella";
  if (t === "gemini_discovered") return "agenciasTipoTag gemini";
  return "agenciasTipoTag";
}

function parseAgencyIdFromPath(pathname: string): number | null {
  const m = pathname.match(/^\/agencias-polacas\/(\d+)(?:\/)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function stripMarkdown(text: string) {
  return (text || "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^#+\s*/gm, "")
    .replace(/^\*+\s*/gm, "")
    .replace(/^\d+\.\s*/gm, "")
    .trim();
}

function formatAgencyDate(value?: string | null) {
  if (!value) return "Pendiente";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Pendiente";
  return parsed.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

let _measureCanvas: HTMLCanvasElement | null = null;
function measureTextWidth(text: string, font: string) {
  if (!_measureCanvas) _measureCanvas = document.createElement("canvas");
  const ctx = _measureCanvas.getContext("2d");
  if (!ctx) return text.length * 8;
  ctx.font = font;
  return ctx.measureText(text).width;
}

function clampNumber(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

const interactionPlaceholders = [
  {
    channel: "Email · buzón core",
    meta: "12 comunicaciones sincronizadas · último 07 ene 2026 · 10:12",
    entries: [
      {
        title: "Ana López · 07 ene 2026 · 10:12",
        body: "Confirmado: enviar itinerario de visita guiada a Płock antes del viernes y recopilar fotos de la oficina en Marbella para el dossier.",
        tag: "Seguimiento"
      },
      {
        title: "Aleksander Wiśniewski · 05 ene 2026 · 16:24",
        body: "Respuesta automática señalando que el dominio actual no responde y solicitando alternativa mientras el equipo IT valida.",
        tag: "Auto"
      }
    ]
  },
  {
    channel: "SMS / WhatsApp · línea de campo",
    meta: "2 hilos activos · integrado con la brigada polaca",
    entries: [
      {
        title: "WhatsApp · 06 ene 2026 · 18:30",
        body: "Mensaje recordatorio: ¿Nos podemos reunir el viernes para revisar la documentación definitiva? (Respuesta esperada antes del mediodía).",
        tag: "Enviado"
      },
      {
        title: "SMS · 04 ene 2026 · 13:11",
        body: "Confirmación automática de recepción de expediente 732 y solicitud de referencias adicionales para la ciudad de Gdańsk.",
        tag: "Confirmado"
      }
    ]
  },
  {
    channel: "Notas internas y próximos pasos",
    meta: "Registro diseñado para acciones futuras y contextos de conversación",
    entries: [
      {
        title: "Revisión de ruta de legalización · 03 ene 2026 · 09:40",
        body: "Pendiente: generar ficha comparativa entre políticas de la oficina y protocolos AMA · CRM para firma con cliente final.",
        tag: "Urgente"
      },
      {
        title: "Checklist · 02 ene 2026 · 12:22",
        body: "Registrar estado de certificados de propiedad y enviar plantilla de due diligence antes del cierre de mes.",
        tag: "Checklist"
      }
    ]
  }
];

function AgencyDetailView({ agencyId, onBack }: { agencyId: number; onBack: () => void }) {
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiAgencies
      .get(agencyId, controller.signal)
      .then((a) => setAgency(a))
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(String(e?.message ?? e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [agencyId]);

  const websiteLabel = agency?.website ? agency.website.replace(/^https?:\/\//, "") : null;
  const descriptionText = agency?.description?.trim() ? stripMarkdown(agency.description) : "";
  const additionalInfoText = agency?.additional_info?.trim() ? stripMarkdown(agency.additional_info) : "";
  const contactKeys = ["phone", "address", "polish_city"] as const;
  const contactCompleteCount = contactKeys.reduce(
    (acc, key) => (agency?.[key] ? acc + 1 : acc),
    0
  );
  const contactCompleteness = Math.round((contactCompleteCount / contactKeys.length) * 100);
  const coverageLabel =
    contactCompleteness >= 80 ? "Cobertura completa" : contactCompleteness >= 50 ? "Cobertura parcial" : "Cobertura limitada";
  const pieData = [
    { name: "Campos completos", value: contactCompleteCount, color: "#7c3aed" },
    { name: "Pendientes", value: Math.max(0, contactKeys.length - contactCompleteCount), color: "rgba(255, 255, 255, 0.08)" },
  ];
  const validationLabel = formatAgencyDate(agency?.url_validation_date);
  const statusLabel = agency?.website_status ? agency.website_status : "Sin validar";
  const kpiCards = [
    {
      label: "Cobertura de datos",
      value: `${contactCompleteness}%`,
      detail: `${coverageLabel} · ${contactCompleteCount}/${contactKeys.length} campos`,
    },
    {
      label: "Sitio web",
      value: agency?.website ? "Detectado" : "No disponible",
      detail: websiteLabel ?? "Pendiente",
    },
    {
      label: "Validación digital",
      value: statusLabel,
      detail: `Revisado: ${validationLabel}`,
    },
  ];

  return (
    <div className="agency-detail-root">
      <div className="table-container">
        <div className="card cardPad agency-detail-card">
          {error ? (
            <div className="agency-card-error">
              Error cargando la agencia: <span className="agency-card-error__muted">{error}</span>
            </div>
          ) : loading || !agency ? (
            <div className="agency-card-loading">Cargando...</div>
          ) : agency ? (
            <div className="agency-report">
              <header className="agency-report-header">
                <div>
                  <div className="agency-report-name">{agency.name || "Agencia sin nombre"}</div>
                  <div className="agency-report-subtitle">Ficha de agencia</div>
                </div>
                <div className="agency-report-header-tags">
                  {agency.type ? <span className={agencyTipoTagClass(agency.type)}>{agencyTypeLabel(agency.type)}</span> : null}
                  {agency.website_status ? <span className="pill ok">{agency.website_status}</span> : null}
                  {agency.cleanup_status ? <span className="pill neutral">{agency.cleanup_status}</span> : null}
                </div>
              </header>
              <div className="agency-report-gradient" />
              <div className="agency-report-main">
                <div className="agency-report-main-column">
                  <div className="agency-report-section agency-report-summary">
                    <div className="agency-report-section-heading">
                      <h3>Contacto y presencia</h3>
                      <span className="agency-report-updated">Última validación: {validationLabel}</span>
                    </div>
                    <div className="agency-report-contact-grid">
                      <div>
                        <div className="agency-report-label">Teléfono</div>
                        <div className="agency-report-value">{agency.phone ?? "—"}</div>
                      </div>
                      <div>
                        <div className="agency-report-label">Dirección</div>
                        <div className="agency-report-value">{agency.address ?? "—"}</div>
                      </div>
                      <div>
                        <div className="agency-report-label">Ciudad / Región</div>
                        <div className="agency-report-value">{agency.polish_city ?? "—"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="agency-report-section">
                    <h3>Descripción oficial</h3>
                    <p className="agency-report-text">
                      {descriptionText || "Aún no se ha documentado una descripción oficial de la agencia."}
                    </p>
                  </div>

                  <div className="agency-report-section agency-report-additional">
                    <h3>Información adicional</h3>
                    <p className="agency-report-text">
                      {additionalInfoText ||
                        "Se espera un resumen contextual adicional sobre el negocio, protocolos y alcance de servicio."}
                    </p>
                  </div>
                </div>

                <div className="agency-report-side-column">
                  <div className="agency-report-chart-card">
                    <div className="agency-report-chart-heading">
                      <span>Integridad de campos</span>
                      <strong>
                        {contactCompleteCount}/{contactKeys.length}
                      </strong>
                    </div>
                    <div className="agency-report-chart">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={48}
                            outerRadius={86}
                            paddingAngle={6}
                          >
                            {pieData.map((segment) => (
                              <Cell key={segment.name} fill={segment.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "var(--panel2)", border: "1px solid var(--line)", borderRadius: 10 }}
                            itemStyle={{ color: "white" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="agency-report-chart-footer">
                      <span>{coverageLabel}</span>
                      <span className="agency-report-chart-value">{contactCompleteness}% completos</span>
                    </div>
                  </div>

                  <div className="agency-report-kpi-grid">
                    {kpiCards.map((kpi) => (
                      <div className="agency-report-kpi" key={kpi.label}>
                        <div className="agency-report-kpi-label">{kpi.label}</div>
                        <div className="agency-report-kpi-value">{kpi.value}</div>
                        <div className="agency-report-kpi-detail">{kpi.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <section className="agency-report-section agency-report-website">
                <div className="agency-report-section-heading">
                  <h3>Sitio web oficial</h3>
                  <span className="agency-report-updated">Validado: {validationLabel}</span>
                </div>
                <div className="agency-report-website-link">
                  {agency.website ? (
                    <a href={agency.website} target="_blank" rel="noreferrer">
                      {websiteLabel}
                    </a>
                  ) : (
                    <span className="agency-muted-note">Aún no se ha detectado una URL pública.</span>
                  )}
                </div>
                <p className="agency-report-note">
                  {agency.website
                    ? "Este enlace se abre en una nueva pestaña y el sistema revalidará el dominio automáticamente."
                    : "Se generará un recordatorio para reenfocar la búsqueda cuando se actualicen los lotes de datos."}
                </p>
              </section>

              <section className="agency-report-section agency-report-interactions">
                <div className="agency-report-section-heading">
                  <h3>Registro de interacciones</h3>
                </div>
                <div className="interactions-grid">
                  {interactionPlaceholders.map((block) => (
                    <div className="interaction-block" key={block.channel}>
                      <div className="interaction-block__header">
                        <span className="interaction-block__title">{block.channel}</span>
                        <span className="interaction-block__meta">{block.meta}</span>
                      </div>
                      <div className="interaction-block__entries">
                        {block.entries.map((entry) => (
                          <div className="interaction-entry" key={entry.title}>
                            <div className="interaction-entry__row">
                              <span className="interaction-entry__title">{entry.title}</span>
                              {entry.tag ? <span className="interaction-entry__tag">{entry.tag}</span> : null}
                            </div>
                            <div className="interaction-entry__body">{entry.body}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </div>

      <div className="table-container">
        <Footer />
      </div>
    </div>
  );
}

interface AgenciasPolacasViewProps {
  onDetailChange?: (detailMode: boolean) => void;
  searchValue?: string;
}

export function AgenciasPolacasView({ onDetailChange, searchValue }: AgenciasPolacasViewProps = {}) {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const selectedAgencyId = useMemo(() => parseAgencyIdFromPath(pathname), [pathname]);
  useEffect(() => {
    onDetailChange?.(selectedAgencyId != null);
  }, [onDetailChange, selectedAgencyId]);

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const filterValue = searchValue ?? "";
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const paginationBarRef = useRef<HTMLDivElement>(null);
  const [paginationBarWidth, setPaginationBarWidth] = useState<number | null>(null);

  const [types, setTypes] = useState<AgencyFacet[]>([]);
  const [meta, setMeta] = useState<AgenciesMeta | null>(null);
  const [page, setPage] = useState<AgenciesPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);

  const typeCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of types) if (t.value) m.set(t.value, t.count);
    return m;
  }, [types]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiAgencies.meta(), apiAgencies.types()])
      .then(([m, t]) => {
        if (cancelled) return;
        setMeta(m);
        setTypes(t);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e?.message ?? e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onPop = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigateTo = useCallback((path: string) => {
    window.history.pushState(null, "", path);
    setPathname(path);
  }, []);

  useEffect(() => {
    const onBack = () => navigateTo("/agencias-polacas");
    window.addEventListener("agencias-polacas-back", onBack);
    return () => window.removeEventListener("agencias-polacas-back", onBack);
  }, [navigateTo]);

  useLayoutEffect(() => {
    const el = paginationBarRef.current;
    if (!el) return;

    const update = () => setPaginationBarWidth(el.clientWidth);
    update();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setOffset(0);
  }, [filterValue, typeFilter, sortField, sortDirection, limit]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiAgencies
      .list({
        q: filterValue.trim() || undefined,
        type: typeFilter === "All" ? undefined : [typeFilter],
        sort: sortField,
        dir: sortDirection,
        limit,
        offset,
        signal: controller.signal,
      })
      .then((p) => setPage(p))
      .catch((e) => {
        if (controller.signal.aborted) return;
        setError(String(e?.message ?? e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filterValue, typeFilter, sortField, sortDirection, limit, offset]);

  const agencies: Agency[] = page?.items ?? [];
  const totalCount = page?.total ?? 0;


  const totalPages = Math.max(1, Math.ceil((page?.total ?? 0) / limit));
  const currentPage = Math.min(totalPages, Math.floor(offset / limit) + 1);

  const chartData = useMemo(() => {
    const palette: Record<string, string> = {
      polish: "#007bff",
      "Spain and Poland": "#6f42c1",
      marbella: "#28a745",
      gemini_discovered: "#fd7e14",
    };
    return (types ?? [])
      .filter((t) => t.value)
      .map((t) => ({
        key: t.value as string,
        label: agencyTypeLabel(t.value),
        value: t.count,
        color: palette[String(t.value)] ?? "#64748b",
      }))
      .sort((a, b) => b.value - a.value);
  }, [types]);

  const lastUpdatedLabel = useMemo(() => {
    const raw = meta?.db_mtime;
    if (!raw) return "—";
    const d = new Date(raw);
    return Number.isFinite(d.getTime()) ? d.toLocaleString("es-ES") : String(raw);
  }, [meta?.db_mtime]);

  const typeColor = (t?: string | null) => {
    if (t === "polish") return "#007bff";
    if (t === "Spain and Poland") return "#6f42c1";
    if (t === "marbella") return "#28a745";
    if (t === "gemini_discovered") return "#fd7e14";
    return "var(--muted)";
  };

  const handleTypeSelection = useCallback(
    (type: string) => {
      setTypeFilter(type);
    },
    [setTypeFilter],
  );

  const handleTypeCardKeyDown = (type: string) => (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTypeSelection(type);
    }
  };

  if (selectedAgencyId != null) {
    return (
      <AgencyDetailView
        agencyId={selectedAgencyId}
        onBack={() => navigateTo("/agencias-polacas")}
      />
    );
  }

  const showStats = offset === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {showStats && (
        <div className="table-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 12,
              minWidth: 0,
            }}
          >
            <div className="card cardPad" style={{ minHeight: 240, minWidth: 0 }}>
              <div style={{ fontWeight: 950, marginBottom: 2 }}>Distribución por tipo</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800, marginBottom: 10 }}>
                Total: {meta?.total_agencies ?? "—"} · Actualizado: {lastUpdatedLabel}
              </div>
              <div style={{ height: 180, minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={45} outerRadius={72}>
                      {chartData.map((d) => (
                        <Cell
                          key={d.key}
                          fill={d.color}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleTypeSelection(d.key)}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {chartData.map((d) => (
                  <span key={d.key} className="pill neutral" style={{ maxWidth: "unset" }}>
                    {d.label}: {d.value}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <div
                className="card cardPad"
                role="button"
                tabIndex={0}
                onClick={() => handleTypeSelection("All")}
                onKeyDown={handleTypeCardKeyDown("All")}
                aria-pressed={typeFilter === "All"}
                style={{ cursor: "pointer" }}
              >
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Total agencias</div>
                <div style={{ fontSize: 28, fontWeight: 950 }}>{meta?.total_agencies ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Última actualización: {lastUpdatedLabel}</div>
              </div>
              <div
                className="card cardPad"
                role="button"
                tabIndex={0}
                onClick={() => handleTypeSelection("polish")}
                onKeyDown={handleTypeCardKeyDown("polish")}
                aria-pressed={typeFilter === "polish"}
                style={{ cursor: "pointer" }}
              >
                <div style={{ fontSize: 12, color: typeColor("polish"), fontWeight: 950 }}>Polonia</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: typeColor("polish") }}>{typeCounts.get("polish") ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Tipo `polish`</div>
              </div>
              <div
                className="card cardPad"
                role="button"
                tabIndex={0}
                onClick={() => handleTypeSelection("marbella")}
                onKeyDown={handleTypeCardKeyDown("marbella")}
                aria-pressed={typeFilter === "marbella"}
                style={{ cursor: "pointer" }}
              >
                <div style={{ fontSize: 12, color: typeColor("marbella"), fontWeight: 950 }}>Marbella</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: typeColor("marbella") }}>{typeCounts.get("marbella") ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Tipo `marbella`</div>
              </div>
              <div
                className="card cardPad"
                role="button"
                tabIndex={0}
                onClick={() => handleTypeSelection("Spain and Poland")}
                onKeyDown={handleTypeCardKeyDown("Spain and Poland")}
                aria-pressed={typeFilter === "Spain and Poland"}
                style={{ cursor: "pointer" }}
              >
                <div style={{ fontSize: 12, color: typeColor("Spain and Poland"), fontWeight: 950 }}>España + Polonia</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: typeColor("Spain and Poland") }}>{typeCounts.get("Spain and Poland") ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Tipo `Spain and Poland`</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="card cardPad">
          <div style={{ fontWeight: 900, color: "var(--text)", marginBottom: 2 }}>Directorio</div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800, marginBottom: 14 }}>
            Haz click en una fila para abrir la ficha de la agencia
          </div>
          {error ? (
            <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--line)", background: "rgba(255,0,0,0.05)", color: "var(--text)" }}>
              Error cargando agencias: <span style={{ color: "var(--muted)" }}>{error}</span>
            </div>
          ) : agencies.length > 0 ? (
            <>
              <div className="agenciasTableWrap">
                <table className="agenciasTable" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
                  <colgroup>
                    <col style={{ width: "34%" }} />
                    <col style={{ width: "14%" }} />
                    <col className="agenciasColWebsite" style={{ width: "22%" }} />
                    <col style={{ width: "14%" }} />
                    <col className="agenciasColAddress" style={{ width: "16%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th
                        style={{ textAlign: "left", cursor: "pointer", userSelect: "none" }}
                        title="Ordenar por agencia"
                        onClick={() => {
                          if (sortField === "name") {
                            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                            return;
                          }
                          setSortField("name");
                          setSortDirection("asc");
                        }}
                      >
                        Agencia{sortField === "name" ? (sortDirection === "asc" ? " ▲" : " ▼") : ""}
                      </th>
                      <th style={{ textAlign: "left" }}>Tipo</th>
                      <th className="agenciasColWebsite" style={{ textAlign: "left" }}>Web</th>
                      <th style={{ textAlign: "left" }}>Tel</th>
                      <th className="agenciasColAddress" style={{ textAlign: "left" }}>Dirección</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencies.map((a) => {
                      const websiteLabel = a.website ? a.website.replace(/^https?:\/\//, "") : "—";
                      const cleanAddress = a.address ? stripMarkdown(a.address) : "";
                      return (
                        <tr
                          key={a.id}
                          onClick={() => navigateTo(`/agencias-polacas/${a.id}`)}
                          style={{ cursor: "pointer" }}
                          className="agenciasRow"
                        >
                          <td className="agenciasCellEllipsis" title={a.name ?? ""}>{a.name ?? "—"}</td>
                          <td>
                            <span className={agencyTipoTagClass(a.type)}>{agencyTypeLabel(a.type)}</span>
                          </td>
                          <td className="agenciasColWebsite agenciasCellEllipsis" title={a.website ?? ""}>
                            {a.website ? (
                              <a
                                href={a.website}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{ color: "var(--muted)", textDecoration: "none" }}
                              >
                                {websiteLabel}
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="agenciasCellEllipsis" title={a.phone ?? ""}>{a.phone ?? "—"}</td>
                          <td className="agenciasColAddress agenciasCellEllipsis" title={cleanAddress}>{cleanAddress || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
                  Mostrando {offset + 1}-{Math.min(offset + limit, totalCount)} de {totalCount}
                </div>
                <div ref={paginationBarRef} style={{ flex: "1 1 420px", minWidth: 280, display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                  <button className="btn btnSm" disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - limit))}>Anterior</button>
                  <div
                    className="agenciasPaginationNums"
                    style={{
                      flex: "0 1 auto",
                      minWidth: 0,
                      maxWidth: `${Math.max(160, (paginationBarWidth ?? 520) - 190)}px`,
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      flexWrap: "nowrap",
                      justifyContent: "flex-start",
                    }}
                  >
                    {(() => {
                      const items: Array<number | "…"> = [];
                      const total = totalPages;
                      const current = currentPage;
                      const approxSlotWidth = 40; // button width + gap
                      const available =
                        paginationBarWidth == null
                          ? 520
                          : Math.max(160, paginationBarWidth - 190); // prev+next buttons + gaps
                      const maxSlots = clampNumber(
                        Math.floor(available / approxSlotWidth),
                        5,
                        40,
                      );

                      const add = (v: number | "…") => {
                        if (items.length > 0 && items[items.length - 1] === v) return;
                        items.push(v);
                      };

                      if (total <= maxSlots) {
                        for (let p = 1; p <= total; p++) add(p);
                      } else {
                        const innerSlots = maxSlots - 2; // minus first/last

                        const computeRange = () => {
                          let needLeft = true;
                          let needRight = true;
                          let rangeLen = Math.max(1, innerSlots - 2);

                          let start = current - Math.floor(rangeLen / 2);
                          let end = start + rangeLen - 1;
                          start = Math.max(2, Math.min(start, total - 1));
                          end = Math.max(2, Math.min(end, total - 1));
                          if (end - start + 1 < rangeLen) start = Math.max(2, end - rangeLen + 1);

                          needLeft = start > 2;
                          needRight = end < total - 1;
                          rangeLen = Math.max(1, innerSlots - (needLeft ? 1 : 0) - (needRight ? 1 : 0));

                          start = current - Math.floor(rangeLen / 2);
                          end = start + rangeLen - 1;
                          start = Math.max(2, Math.min(start, total - 1));
                          end = Math.max(2, Math.min(end, total - 1));
                          if (end - start + 1 < rangeLen) start = Math.max(2, end - rangeLen + 1);

                          needLeft = start > 2;
                          needRight = end < total - 1;
                          return { start, end, needLeft, needRight };
                        };

                        const { start, end, needLeft, needRight } = computeRange();

                        add(1);
                        if (needLeft) add("…");
                        for (let p = start; p <= end; p++) add(p);
                        if (needRight) add("…");
                        add(total);
                      }

                      return items.map((p, idx) =>
                        p === "…" ? (
                          <span key={`dots-${idx}`} style={{ color: "var(--muted)", fontWeight: 900, padding: "0 4px" }}>…</span>
                        ) : (
                          <button
                            key={p}
                            className={`btn btnSm agenciasPaginationBtn${p === currentPage ? " primary" : ""}`}
                            disabled={loading || p === currentPage}
                            onClick={() => setOffset((p - 1) * limit)}
                            title={`Ir a página ${p}`}
                          >
                            {p}
                          </button>
                        ),
                      );
                    })()}
                  </div>
                  <button
                    className="btn btnSm"
                    disabled={loading || offset + limit >= totalCount}
                    onClick={() => setOffset(offset + limit)}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
              {loading ? "Cargando..." : "No se encontraron agencias que coincidan con los criterios de búsqueda."}
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
