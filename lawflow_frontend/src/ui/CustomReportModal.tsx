import React, { useState } from "react";
import { Modal } from "./components/Modal";

export function CustomReportModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [subject, setSubject] = useState("");
    const [location, setLocation] = useState("");
    const [generating, setGenerating] = useState(false);

    return (
        <Modal open={open} onClose={onClose} title="Crear Informe Personalizado">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <p style={{ fontSize: 13, color: "var(--muted)" }}>
                    Usa nuestra IA para generar un análisis detallado de cualquier segmento o ubicación del mercado inmobiliario.
                </p>

                <div style={{ display: "grid", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase" }}>
                            Asunto / Sector
                        </label>
                        <input
                            className="search"
                            style={{ width: "100%" }}
                            placeholder="Ej: Mercado de villas modernas..."
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 11, fontWeight: 900, color: "var(--muted)", textTransform: "uppercase" }}>
                            Ubicación
                        </label>
                        <input
                            className="search"
                            style={{ width: "100%" }}
                            placeholder="Ej: Nueva Andalucía, Marbella"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button className="btn" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn ok"
                        style={{ fontWeight: 900 }}
                        disabled={generating || !subject || !location}
                        onClick={() => {
                            setGenerating(true);
                            // Simulated generation
                            setTimeout(() => {
                                setGenerating(false);
                                alert("Informe generado con éxito (Simulación)");
                                onClose();
                            }, 2000);
                        }}
                    >
                        {generating ? "Generando..." : "Generar con IA"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
