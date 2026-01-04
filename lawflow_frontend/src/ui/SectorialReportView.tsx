import React, { useRef } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ReportData } from "../lib/reportData";

const COLORS = ["#7c3aed", "#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#6b7280"];

export function SectorialReportView({ data }: { data: ReportData }) {
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
        pdf.save(data.pdfName || "Informe_Sectorial.pdf");
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
                    <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>{data.title}</h1>
                    <div style={{ height: 4, width: 80, background: "linear-gradient(90deg, #7c3aed, #22c55e)", marginBottom: 32 }} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Resumen Ejecutivo</h2>
                            <p style={{ lineHeight: 1.6, color: "var(--muted)" }}>
                                {data.summary}
                            </p>
                            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                {data.kpis.map((kpi, idx) => (
                                    <div key={idx} style={{ padding: 16, background: kpi.bg, borderRadius: 12 }}>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: kpi.color }}>{kpi.label}</div>
                                        <div style={{ fontSize: 24, fontWeight: 900 }}>{kpi.value}</div>
                                        <div style={{ fontSize: 12, fontWeight: 800, color: kpi.color, marginTop: 4 }}>{kpi.trend}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ height: 300 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>Evolución (Histórico)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.priceData}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                                    <XAxis dataKey="year" stroke="var(--muted)" fontSize={12} />
                                    <YAxis stroke="var(--muted)" fontSize={12} domain={['auto', 'auto']} />
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
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Desglose por Segmentos y Demografía</h2>

                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>
                        <div className="table-container" style={{ margin: 0 }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Segmento / Zona</th>
                                        <th style={{ textAlign: "right" }}>Anterior</th>
                                        <th style={{ textAlign: "right" }}>Actual</th>
                                        <th style={{ textAlign: "right" }}>Var.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.zoneData.map((d, i) => (
                                        <tr key={i}>
                                            <td><div style={{ fontWeight: 800 }}>{d.zone}</div></td>
                                            <td style={{ textAlign: "right" }}>{d.price24.toLocaleString()}</td>
                                            <td style={{ textAlign: "right" }}>{d.price25.toLocaleString()}</td>
                                            <td style={{ textAlign: "right", color: "var(--ok)" }}>
                                                +{(((d.price25 - d.price24) / d.price24) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ height: 350 }}>
                            <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 16, textAlign: "center" }}>Distribución del Mercado</h3>
                            <ResponsiveContainer width="100%" height="80%">
                                <PieChart>
                                    <Pie
                                        data={data.originData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.originData.map((entry, index) => (
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
                            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Potencial de Inversión</h2>
                            <p style={{ lineHeight: 1.6, color: "var(--muted)", marginBottom: 24 }}>
                                La resiliencia de los activos en {data.location} ofrece un refugio seguro frente a la volatilidad de los mercados financieros tradicionales. Se proyecta un crecimiento sostenido impulsado por fundamentales sólidos.
                            </p>
                            <div style={{ padding: 24, border: "1px dashed #7c3aed", borderRadius: 16, background: "rgba(124,58,237,0.05)" }}>
                                <h4 style={{ margin: 0, fontSize: 13, color: "#7c3aed" }}>{data.rentability.label}</h4>
                                <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>{data.rentability.value}</div>
                                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{data.rentability.desc}</div>
                            </div>
                        </div>

                        <div style={{ padding: 32, background: "rgba(255,255,255,0.02)", borderRadius: 16 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Estrategia Recomendada</h3>
                            <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "grid", gap: 20 }}>
                                {data.strategy.map((item, idx) => (
                                    <li key={idx} style={{ display: "flex", gap: 12 }}>
                                        <span style={{ color: "#22c55e", fontWeight: 900 }}>✔</span>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: 14 }}>{item.title}</div>
                                            <div style={{ fontSize: 12, color: "var(--muted)" }}>{item.desc}</div>
                                        </div>
                                    </li>
                                ))}
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
