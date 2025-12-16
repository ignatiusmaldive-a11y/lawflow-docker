import React, { useMemo, useState } from "react";
import { Project } from "../lib/api";
import { api3 } from "../lib/api";
import { useI18n } from "../lib/i18n";

const LS_PLATFORM = "lawflow.platform.settings.v1";

type PlatformSettings = {
  defaultProjectBg: string;
  density: "Comfort" | "Compact";
};

function loadSettings(): PlatformSettings {
  try {
    const raw = localStorage.getItem(LS_PLATFORM);
    if (!raw) return { defaultProjectBg: "#0b1220", density: "Comfort" };
    const p = JSON.parse(raw);
    return {
      defaultProjectBg: typeof p.defaultProjectBg === "string" ? p.defaultProjectBg : "#0b1220",
      density: p.density === "Compact" ? "Compact" : "Comfort",
    };
  } catch {
    return { defaultProjectBg: "#0b1220", density: "Comfort" };
  }
}

function saveSettings(s: PlatformSettings) {
  try { localStorage.setItem(LS_PLATFORM, JSON.stringify(s)); } catch {}
}

export function SettingsView({ projects, onProjectUpdated }: { projects: Project[]; onProjectUpdated: (p: Project) => void }) {
  const { t } = useI18n();
  const [settings, setSettings] = useState<PlatformSettings>(() => loadSettings());
  const [savingId, setSavingId] = useState<number | null>(null);

  const palette = ["#0b1220","#071a12","#1b1020","#0d1726","#151022","#10141b","#0b1b2b","#132018","#1b140c","#14141a"];

  const densityHelp = useMemo(() => (settings.density === "Compact" ? "More rows on screen" : "More breathing room"), [settings]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Settings</h2>
          <span className="pill">Platform</span>
        </div>
        <div className="small">Configure demo platform defaults: project colors, density, and UX flags.</div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Global</h2>
          <span className="pill">{settings.density}</span>
        </div>

        <div className="grid2">
          <div>
            <div className="small" style={{ fontWeight: 950, marginBottom: 6 }}>Default project background</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {palette.map((c) => (
                <button
                  key={c}
                  className="colorSwatch"
                  style={{ background: c, outline: settings.defaultProjectBg === c ? "2px solid rgba(255,255,255,.75)" : "1px solid var(--line)" }}
                  onClick={() => {
                    const next = { ...settings, defaultProjectBg: c };
                    setSettings(next);
                    saveSettings(next);
                  }}
                  title="Set default"
                />
              ))}
            </div>
          </div>

          <div>
            <div className="small" style={{ fontWeight: 950, marginBottom: 6 }}>Density</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={"tab" + (settings.density === "Comfort" ? " active" : "")} onClick={() => { const next = { ...settings, density: "Comfort" as const }; setSettings(next); saveSettings(next); }}>Comfort</button>
              <button className={"tab" + (settings.density === "Compact" ? " active" : "")} onClick={() => { const next = { ...settings, density: "Compact" as const }; setSettings(next); saveSettings(next); }}>Compact</button>
              <span className="small" style={{ alignSelf: "center" }}>{densityHelp}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>Projects</h2>
          <span className="pill">{projects.length} matters</span>
        </div>
        <div className="small">Each matter can have its own background color (useful for quick visual context switching).</div>

        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {projects.map((p) => (
            <div key={p.id} className="projRow">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div className="small">{p.transaction_type} · {p.location} · {p.status}</div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {palette.map((c) => (
                  <button
                    key={c}
                    className="colorSwatch"
                    style={{ background: c, outline: (p.bg_color ?? "") === c ? "2px solid rgba(255,255,255,.75)" : "1px solid var(--line)" }}
                    onClick={async () => {
                      setSavingId(p.id);
                      try {
                        const updated = await api3.patchProject(p.id, { bg_color: c });
                        onProjectUpdated(updated);
                      } finally {
                        setSavingId(null);
                      }
                    }}
                    title="Set project color"
                    disabled={savingId === p.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
