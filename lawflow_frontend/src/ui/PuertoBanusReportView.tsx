import React, { useRef } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const PRICE_DATA = [
    { year: "2020", price: 5800 },
    { year: "2021", price: 6100 },
    { year: "2022", price: 6450 },
    { year: "2023", price: 6850 },
    { year: "2024", price: 7185 },
    { year: "2025", price: 7850 }
];

const ORIGIN_DATA = [
    { name: "Reino Unido", value: 15 },
    { name: "Países Bajos/Esc.", value: 12 },
    { name: "EE.UU.", value: 10 },
    { name: "Polonia", value: 8 },
    { name: "Oriente Medio", value: 7 },
    { name: "Otros", value: 48 }
];

const ZONE_DATA = [
    { zone: "1ª Línea Puerto", price24: 9400, price25: 10350 },
    { zone: "Urb. Lujo", price24: 6800, price25: 7450 },
    { zone: "Premium Periferia", price24: 5200, price25: 5600 }
];

const COLORS = ["#7c3aed", "#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#6b7280"];

export function PuertoBanusReportView() {
    const reportRef = useRef<HTMLDivElement>(null);

    const downloadPDF = async () => {
        if (!reportRef.current) return;

        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#0b1220"
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save("Informe_Puerto_Banus_2025.pdf");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
            {/* Header Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button className="btn ok" onClick={downloadPDF} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>Download PDF Report</span>
                    <span style={{ fontSize: 18 }}>↓</span>
                </button>
            </div>

            <div ref={reportRef} className="report-container" style={{
                background: "var(--card-bg)",
                borderRadius: "16px",
                border: "1px solid var(--line)",
                padding: "40px",
                color: "var(--text)"
            }}>
                {/* Page 1: Resumen & Contexto */}
                <section style={{ marginBottom: 60 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>Informe: Mercado de Lujo Puerto Banús 2025</h1>
                    <div style={{ height: 4, width: 80, background: "linear-gradient(90deg, #7c3aed, #22c55e)", marginBottom: 32 }} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Resumen Ejecutivo</h2>
                            <p style={{ lineHeight: 1.6, color: "var(--muted)" }}>
                                El mercado inmobiliario de lujo en Puerto Banús se consolida en 2025 como uno de los epicentros más resilientes y dinámicos de Europa. La escasez de producto premium y una demanda internacional de alto poder adquisitivo mantienen los precios en máximos históricos.
                            </p>
                            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div style={{ padding: 16, background: "rgba(124,58,237,0.1)", borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed" }}>PRECIO MEDIO</div>
                                    <div style={{ fontSize: 24, fontWeight: 900 }}>7.850 €/m²</div>
                                </div>
                                <div style={{ padding: 16, background: "rgba(34,197,94,0.1)", borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: "#22c55e" }}>CRECIMIENTO</div>
                                    <div style={{ fontSize: 24, fontWeight: 900 }}>+9.2%</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ height: 300 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>Evolución del Precio (2020-2025)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PRICE_DATA}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                                    <XAxis dataKey="year" stroke="var(--muted)" fontSize={12} />
                                    <YAxis stroke="var(--muted)" fontSize={12} domain={['dataMin - 500', 'dataMax + 500']} />
                                    <Tooltip
                                        contentStyle={{ background: "#161b22", border: "1px solid var(--line)", borderRadius: 8 }}
                                        itemStyle={{ color: "#7c3aed" }}
                                    />
                                    <Area type="monotone" dataKey="price" stroke="#7c3aed" fillOpacity={1} fill="url(#colorPrice)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* Page 2: Análisis por Zonas & Compradores */}
                <section style={{ marginBottom: 60, borderTop: "1px solid var(--line)", paddingTop: 60 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Segmentación y Demanda Internacional</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>
                        <div className="table-container" style={{ margin: 0 }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Zona Específica</th>
                                        <th style={{ textAlign: "right" }}>Precio 2024</th>
                                        <th style={{ textAlign: "right" }}>Precio 2025</th>
                                        <th style={{ textAlign: "right" }}>Var.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ZONE_DATA.map((d, i) => (
                                        <tr key={i}>
                                            <td><div style={{ fontWeight: 800 }}>{d.zone}</div></td>
                                            <td style={{ textAlign: "right" }}>{d.price24.toLocaleString()} €</td>
                                            <td style={{ textAlign: "right" }}>{d.price25.toLocaleString()} €</td>
                                            <td style={{ textAlign: "right", color: "var(--ok)" }}>
                                                +{(((d.price25 - d.price24) / d.price24) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ height: 350 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>Origen de la Inversión (2025)</h3>
                            <ResponsiveContainer width="100%" height="80%">
                                <PieChart>
                                    <Pie
                                        data={ORIGIN_DATA}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {ORIGIN_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* Page 3: Rentabilidad & Conclusiones */}
                <section style={{ borderTop: "1px solid var(--line)", paddingTop: 60 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 32 }}>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Proyecciones de Rentabilidad</h2>
                            <p style={{ lineHeight: 1.6, color: "var(--muted)", marginBottom: 24 }}>
                                Los activos inmobiliarios en Puerto Banús siguen superando a otros activos refugio. Se proyecta que las villas inteligentes y tech-ready vean una revalorización adicional del 15% en los próximos 24 meses.
                            </p>
                            <div style={{ padding: 24, border: "1px dashed #7c3aed", borderRadius: 16, background: "rgba(124,58,237,0.05)" }}>
                                <h4 style={{ margin: 0, fontSize: 13, color: "#7c3aed" }}>RENTABILIDAD ALQUILER CORTO PLAZO</h4>
                                <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>6.5% - 8.2%</div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Promedio ponderado anual</div>
                            </div>
                        </div>

                        <div style={{ padding: 32, background: "rgba(255,255,255,0.02)", borderRadius: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Estrategia Recomendada</h3>
                            <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "grid", gap: 20 }}>
                                <li style={{ display: "flex", gap: 12 }}>
                                    <span style={{ color: "#22c55e", fontWeight: 900 }}>✔</span>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 14 }}>Inversión en Áreas Periféricas</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Mayor potencial de revalorización en urbanizaciones en desarrollo cercanas al puerto.</div>
                                    </div>
                                </li>
                                <li style={{ display: "flex", gap: 12 }}>
                                    <span style={{ color: "#22c55e", fontWeight: 900 }}>✔</span>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 14 }}>Upgrade Tecnológico</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>Llevar domótica 2025 a propiedades antiguas en primera línea incrementa el valor en +20%.</div>
                                    </div>
                                </li>
                                <li style={{ display: "flex", gap: 12 }}>
                                    <span style={{ color: "#22c55e", fontWeight: 900 }}>✔</span>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: 14 }}>Foco en Residencia Permanente</div>
                                        <div style={{ fontSize: 12, color: "var(--muted)" }}>La demanda de escuelas internacionales está impulsando contratos de alquiler a largo plazo.</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ marginTop: 60, textAlign: "center", borderTop: "1px solid var(--line)", paddingTop: 40 }}>
                        <p style={{ fontSize: 12, color: "var(--muted)" }}>
                            © 2026 AMA - CRM. Este informe es confidencial y para uso exclusivo de suscripción premium.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
