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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="table-container">
        <div className="card cardPad" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn" onClick={onBack}>← Volver</button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 950, fontSize: 16, overflowWrap: "anywhere" }}>{agency?.name ?? (loading ? "Cargando..." : "—")}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Ficha de agencia</div>
            </div>
          </div>
          {agency?.website ? (
            <a href={agency.website} target="_blank" rel="noreferrer" style={{ color: "var(--muted)", textDecoration: "none", fontSize: 13, fontWeight: 850, overflowWrap: "anywhere" }}>
              {websiteLabel}
            </a>
          ) : null}
        </div>
      </div>

      <div className="table-container">
        <div className="card cardPad">
          {error ? (
            <div style={{ padding: 16, borderRadius: 12, border: "1px solid var(--line)", background: "rgba(255,0,0,0.05)", color: "var(--text)" }}>
              Error cargando la agencia: <span style={{ color: "var(--muted)" }}>{error}</span>
            </div>
          ) : loading || !agency ? (
            <div style={{ padding: 28, textAlign: "center", color: "var(--muted)" }}>Cargando...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              <div className="card" style={{ padding: 14, border: "1px solid var(--line)", background: "var(--panel2)", borderRadius: 14 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900, marginBottom: 6 }}>Contacto</div>
                <div style={{ display: "grid", gap: 6, color: "var(--text)" }}>
                  <div><span style={{ color: "var(--muted)", fontWeight: 800 }}>Tel:</span> {agency.phone ?? "—"}</div>
                  <div style={{ overflowWrap: "anywhere" }}><span style={{ color: "var(--muted)", fontWeight: 800 }}>Dirección:</span> {agency.address ?? "—"}</div>
                  <div><span style={{ color: "var(--muted)", fontWeight: 800 }}>Ciudad (PL):</span> {agency.polish_city ?? "—"}</div>
                </div>
              </div>

              <div className="card" style={{ padding: 14, border: "1px solid var(--line)", background: "var(--panel2)", borderRadius: 14 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900, marginBottom: 6 }}>Estado</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  {agency.type ? <span className={agencyTipoTagClass(agency.type)}>{agencyTypeLabel(agency.type)}</span> : null}
                  {agency.website_status ? <span className="pill ok" style={{ maxWidth: "unset" }}>{agency.website_status}</span> : null}
                  {agency.cleanup_status ? <span className="pill neutral" style={{ maxWidth: "unset" }}>{agency.cleanup_status}</span> : null}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)", fontWeight: 800, overflowWrap: "anywhere" }}>
                  Validación URL: {agency.url_validation_date ?? "—"}
                </div>
              </div>

              <div className="card" style={{ padding: 14, border: "1px solid var(--line)", background: "var(--panel2)", borderRadius: 14, gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900, marginBottom: 6 }}>Descripción</div>
                <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: "1.45", whiteSpace: "pre-wrap" }}>{agency.description?.trim() || "—"}</div>
                {agency.additional_info?.trim() ? (
                  <>
                    <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)", fontWeight: 900, marginBottom: 6 }}>Información adicional</div>
                    <div style={{ color: "var(--muted)", fontSize: 13, lineHeight: "1.45", whiteSpace: "pre-wrap" }}>{agency.additional_info}</div>
                  </>
                ) : null}
              </div>
            </div>
          )}
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
}

export function AgenciasPolacasView({ onDetailChange }: AgenciasPolacasViewProps = {}) {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const selectedAgencyId = useMemo(() => parseAgencyIdFromPath(pathname), [pathname]);
  useEffect(() => {
    onDetailChange?.(selectedAgencyId != null);
  }, [onDetailChange, selectedAgencyId]);

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("polish");

  const typeSelectRef = useRef<HTMLSelectElement>(null);
  const sortSelectRef = useRef<HTMLSelectElement>(null);
  const limitSelectRef = useRef<HTMLSelectElement>(null);
  const [typeSelectWidth, setTypeSelectWidth] = useState<number | null>(null);
  const [sortSelectWidth, setSortSelectWidth] = useState<number | null>(null);
  const [limitSelectWidth, setLimitSelectWidth] = useState<number | null>(null);
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

  const updateSelectWidths = useCallback(() => {
    const updateOne = (
      el: HTMLSelectElement | null,
      setWidth: React.Dispatch<React.SetStateAction<number | null>>,
      { min, max }: { min: number; max: number },
    ) => {
      if (!el) return;
      const text = el.selectedOptions?.[0]?.text ?? "";
      const cs = window.getComputedStyle(el);
      const font = cs.font || `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const paddingLeft = Number.parseFloat(cs.paddingLeft || "0");
      const paddingRight = Number.parseFloat(cs.paddingRight || "0");
      const borderLeft = Number.parseFloat(cs.borderLeftWidth || "0");
      const borderRight = Number.parseFloat(cs.borderRightWidth || "0");
      const measured = measureTextWidth(text, font);
      const next = clampNumber(Math.ceil(measured + paddingLeft + paddingRight + borderLeft + borderRight + 2), min, max);
      setWidth((prev) => (prev === next ? prev : next));
    };

    updateOne(typeSelectRef.current, setTypeSelectWidth, { min: 160, max: 520 });
    updateOne(sortSelectRef.current, setSortSelectWidth, { min: 160, max: 520 });
    updateOne(limitSelectRef.current, setLimitSelectWidth, { min: 120, max: 220 });
  }, []);

  useLayoutEffect(() => {
    updateSelectWidths();
  }, [updateSelectWidths, typeFilter, sortField, types, limit]);

  useEffect(() => {
    window.addEventListener("resize", updateSelectWidths);
    return () => window.removeEventListener("resize", updateSelectWidths);
  }, [updateSelectWidths]);

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
  }, [filter, typeFilter, sortField, sortDirection, limit]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiAgencies
      .list({
        q: filter.trim() || undefined,
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
  }, [filter, typeFilter, sortField, sortDirection, limit, offset]);

  const agencies: Agency[] = page?.items ?? [];
  const totalCount = page?.total ?? 0;

  const typeOptionLabel = (t: string, fallback: string) => {
    const n = typeCounts.get(t);
    return n != null ? `${fallback} (${n})` : fallback;
  };

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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 }}>
            <div className="card cardPad" style={{ minHeight: 240 }}>
              <div style={{ fontWeight: 950, marginBottom: 2 }}>Distribución por tipo</div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800, marginBottom: 10 }}>
                Total: {meta?.total_agencies ?? "—"} · Actualizado: {lastUpdatedLabel}
              </div>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={45} outerRadius={72}>
                      {chartData.map((d) => (
                        <Cell key={d.key} fill={d.color} />
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
              <div className="card cardPad">
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 900 }}>Total agencias</div>
                <div style={{ fontSize: 28, fontWeight: 950 }}>{meta?.total_agencies ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Última actualización: {lastUpdatedLabel}</div>
              </div>
              <div className="card cardPad">
                <div style={{ fontSize: 12, color: typeColor("polish"), fontWeight: 950 }}>Polonia</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: typeColor("polish") }}>{typeCounts.get("polish") ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Tipo `polish`</div>
              </div>
              <div className="card cardPad">
                <div style={{ fontSize: 12, color: typeColor("marbella"), fontWeight: 950 }}>Marbella</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: typeColor("marbella") }}>{typeCounts.get("marbella") ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Tipo `marbella`</div>
              </div>
              <div className="card cardPad">
                <div style={{ fontSize: 12, color: typeColor("Spain and Poland"), fontWeight: 950 }}>España + Polonia</div>
                <div style={{ fontSize: 28, fontWeight: 950, color: typeColor("Spain and Poland") }}>{typeCounts.get("Spain and Poland") ?? "—"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>Tipo `Spain and Poland`</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="card cardPad" style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            className="search"
            placeholder="Buscar agencias..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ flex: "0 1 272px", minWidth: 240 }}
          />

          <select
            ref={typeSelectRef}
            className="select selectFit"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ flex: "0 0 auto", width: typeSelectWidth ? `${typeSelectWidth}px` : undefined, maxWidth: "100%" }}
          >
            <option value="polish">{typeOptionLabel("polish", "Tipo: Polonia")}</option>
            <option value="Spain and Poland">{typeOptionLabel("Spain and Poland", "Tipo: España + Polonia")}</option>
            <option value="All">Tipo: Todos</option>
          </select>

          <select
            ref={sortSelectRef}
            className="select selectFit"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            style={{ flex: "0 0 auto", width: sortSelectWidth ? `${sortSelectWidth}px` : undefined, maxWidth: "100%" }}
            aria-label="Ordenar por"
          >
            <option value="name">Orden: Agencia</option>
            <option value="type">Orden: Tipo</option>
            <option value="polish_city">Orden: Ciudad (PL)</option>
            <option value="website_status">Orden: Web</option>
            <option value="cleanup_status">Orden: Limpieza</option>
          </select>

          <select
            value={String(limit)}
            onChange={(e) => setLimit(Number(e.target.value))}
            ref={limitSelectRef}
            className="select selectFit"
            style={{ flex: "0 0 auto", width: limitSelectWidth ? `${limitSelectWidth}px` : undefined, maxWidth: "100%" }}
            aria-label="Filas por página"
          >
            <option value="10">10 / pág</option>
            <option value="25">25 / pág</option>
            <option value="50">50 / pág</option>
            <option value="100">100 / pág</option>
          </select>

          <div className="overview-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="project-count-label" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 800 }}>
              {loading ? "Cargando..." : `${totalCount} agencias · Página ${currentPage}/${totalPages}`}
            </div>
          </div>
        </div>
      </div>

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
