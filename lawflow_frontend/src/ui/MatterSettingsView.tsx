import React, { useState, useEffect } from "react";
import { Project, api3 } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { Spinner } from "./components/Spinner"; // Assuming Spinner is available

type MatterSettingsViewProps = {
  activeProject: Project | null;
  onProjectUpdated: (project: Project) => void;
  onClose: () => void; // Function to navigate back to a project view
};

export function MatterSettingsView({ activeProject, onProjectUpdated, onClose }: MatterSettingsViewProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bgColor, setBgColor] = useState(activeProject?.bg_color || "#0b1220");
  const [risk, setRisk] = useState(activeProject?.risk || "Normal");

  useEffect(() => {
    if (activeProject) {
      setBgColor(activeProject.bg_color || "#0b1220");
      setRisk(activeProject.risk || "Normal");
    }
  }, [activeProject]);

  const handleSave = async () => {
    if (!activeProject) return;

    setLoading(true);
    setError(null);
    try {
      const updatedProject = await api3.patchProject(activeProject.id, { bg_color: bgColor, risk: risk });
      onProjectUpdated(updatedProject);
      onClose(); // Close settings after saving
    } catch (e: any) {
      setError(e.message || "Failed to update project settings.");
    } finally {
      setLoading(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="card cardPad" style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
        {t("noActiveMatter")}
      </div>
    );
  }

  return (
    <div className="card cardPad">
      <div className="sectionTitle">
        <h2>{t("matterSettings")}</h2>
        <button className="btn ghost" onClick={onClose}>✕</button>
      </div>

      {error && <div className="callout" style={{ background: "var(--danger)", marginBottom: 16 }}>{error}</div>}

      <div style={{ display: "grid", gap: 16, maxWidth: 400 }}>
        {/* Background Color */}
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 900, fontSize: 13 }}>
            {t("backgroundColor")}
          </label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            style={{ width: "100%", height: 40, border: "none", borderRadius: 4, cursor: "pointer" }}
          />
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
            {t("changeProjectBg")}
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 900, fontSize: 13 }}>
            {t("riskLevel")}
          </label>
          <select
            className="select"
            value={risk}
            onChange={(e) => setRisk(e.target.value as any)}
          >
            <option value="Normal">{t("riskNormal")}</option>
            <option value="At Risk">{t("riskAtRisk")}</option>
            <option value="Critical">{t("riskCritical")}</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24 }}>
          <button className="btn ghost" onClick={onClose}>{t("cancel")}</button>
          <button className="btn primary" onClick={handleSave} disabled={loading}>
            {loading ? <Spinner size="sm" /> : t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
