import React from "react";
import { RentalManagement, RecurringTask, api } from "../lib/api";

export function RentalDashboard({ project }: { project: any }) {
    const rental = project.rental_management as RentalManagement;
    const recurring = (project.recurring_tasks || []) as RecurringTask[];

    if (!rental) return <div className="card cardPad">No hay datos de gestión de alquiler para este asunto.</div>;

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div className="grid2">
                <div className="card cardPad">
                    <div className="sectionTitle">
                        <h2>Detalles del Alquiler</h2>
                        <span className={`pill ${rental.rental_status === 'Active' ? 'ok' : 'warn'}`}>
                            {rental.rental_status}
                        </span>
                    </div>
                    <div className="cardSections">
                        <div className="cardSection">
                            <div className="small">Inquilino</div>
                            <div style={{ fontWeight: 900, fontSize: 16 }}>{rental.tenant_name || "Pendiente"}</div>
                        </div>
                        <div className="cardSection">
                            <div className="small">Renta Mensual</div>
                            <div style={{ fontWeight: 900, fontSize: 16, color: 'var(--brand2)' }}>
                                {rental.monthly_income ? `${rental.monthly_income.toLocaleString()}€` : "—"}
                            </div>
                        </div>
                        <div className="cardSection">
                            <div className="small">Licencia Turística</div>
                            <div style={{ fontWeight: 800 }}>{rental.tourist_license || "No requerida / En trámite"}</div>
                        </div>
                        <div className="cardSection">
                            <div className="small">Vigencia Contrato</div>
                            <div style={{ fontSize: 13 }}>
                                {rental.lease_start ? `${rental.lease_start} – ${rental.lease_end || 'Indefinido'}` : "Sin contrato activo"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card cardPad">
                    <div className="sectionTitle">
                        <h2>Obligaciones Periódicas</h2>
                        <span className="pill">{recurring.filter(r => r.is_active).length} Activas</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Frecuencia</th>
                                    <th>Próximo Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recurring.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 950 }}>{r.title}</td>
                                        <td><span className="pill neutral">{r.frequency}</span></td>
                                        <td>{r.next_due_date || "—"}</td>
                                    </tr>
                                ))}
                                {recurring.length === 0 && (
                                    <tr><td colSpan={3} className="small">No hay tareas recurrentes.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card cardPad">
                <div className="sectionTitle">
                    <h2>Notas de Gestión</h2>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: rental.notes ? 'normal' : 'italic' }}>
                    {rental.notes || "No hay notas adicionales."}
                </div>
            </div>
        </div>
    );
}
