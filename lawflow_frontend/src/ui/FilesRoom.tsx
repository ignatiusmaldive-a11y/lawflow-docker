import React, { useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "./components/Drawer";
import { useI18n } from "../lib/i18n";
import { api2, FileItem } from "../lib/api";

export function FilesRoom({ projectId }: { projectId: number }) {
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function refresh() {
    const list = await api2.files(projectId);
    setFiles(list);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [projectId]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return files;
    return files.filter((f) => (f.filename + " " + (f.mime_type ?? "") + " " + f.uploader).toLowerCase().includes(qq));
  }, [files, q]);

  return (
    <div style={{ display: "grid", gap: 12 }}
      onDragOver={(e)=>{ e.preventDefault(); setDragging(true); }}
      onDragLeave={(e)=>{ e.preventDefault(); setDragging(false); }}
      onDrop={async (e)=>{ e.preventDefault(); setDragging(false); const f=e.dataTransfer.files?.[0]; if(!f) return; try{ await api2.uploadFile(projectId, f); await refresh(); } catch(err){ console.error(err); } }}>
      {dragging ? (<div className="dropZone">{t("dragDrop")}</div>) : null}
      <div className="card cardPad">
        <div className="sectionTitle">
          <h2>{t("fileRoom")}</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input className="search" style={{ width: 280 }} placeholder={t("searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} />
            <input ref={inputRef} type="file" style={{ display: "none" }} onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              await api2.uploadFile(projectId, f);
              if (inputRef.current) inputRef.current.value = "";
              await refresh();
            }} />
            <button className="btn primary" onClick={() => inputRef.current?.click()}>{t("upload")}</button>
          </div>
        </div>
        <div className="small">Upload stores files under backend <b>uploads/</b> and writes metadata to SQLite.</div>
      </div>

      <div className="card cardPad">
        <table className="table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Type</th>
              <th>Uploader</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} onClick={()=>{ setSelected(f); setPreviewError(null); }} style={{ cursor: 'pointer' }}>
                <td style={{ fontWeight: 950 }}>{f.filename}</td>
                <td className="small">{f.mime_type ?? "—"}</td>
                <td>{f.uploader}</td>
                <td className="small">{new Date(f.uploaded_at).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="small">{t("noFiles")}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!selected}
        title={selected ? `${t("preview")}: ${selected.filename}` : t("preview")}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="small"><b>Type:</b> {selected.mime_type ?? "—"}</div>
            <div className="small"><b>Uploader:</b> {selected.uploader}</div>
            <div className="small"><b>Uploaded:</b> {new Date(selected.uploaded_at).toLocaleString()}</div>

            <div className="card cardPad" style={{ padding: 12 }}>
              <div className="sectionTitle">
                <h2 style={{ margin: 0, fontSize: 14 }}>{t("preview")}</h2>
                <a className="btn" href={api2.downloadFileUrl(selected.id)} target="_blank" rel="noreferrer">
                  Download
                </a>
              </div>

              {previewError ? <div className="small" style={{ color: "rgba(239,68,68,.9)" }}>{previewError}</div> : null}

              {(selected.mime_type ?? "").includes("pdf") ? (
                <iframe
                  title="pdf"
                  src={api2.downloadFileUrl(selected.id)}
                  style={{ width: "100%", height: 420, border: "1px solid var(--line)", borderRadius: 14 }}
                  onError={() => setPreviewError("Preview unavailable. Seed rows are metadata-only — upload a real PDF to preview.")}
                />
              ) : (selected.mime_type ?? "").startsWith("image/") ? (
                <img
                  src={api2.downloadFileUrl(selected.id)}
                  alt={selected.filename}
                  style={{ width: "100%", borderRadius: 14, border: "1px solid var(--line)" }}
                  onError={() => setPreviewError("Image preview unavailable. Upload a real image to preview.")}
                />
              ) : (
                <div className="small">
                  This file type can’t be previewed in the demo. Use Download.
                  <div className="small" style={{ marginTop: 8, opacity: .9 }}>Tip: upload a PDF or image to see inline preview.</div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
