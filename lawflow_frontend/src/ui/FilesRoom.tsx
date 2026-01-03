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
        <div className="table-container">
          <table className="table filesTable">
            <thead>
              <tr>
                <th>{t("filename")}</th>
                <th>{t("type")}</th>
                <th>{t("uploader")}</th>
                <th>{t("uploaded")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} onClick={()=>{ setSelected(f); setPreviewError(null); }} style={{ cursor: 'pointer' }}>
                  <td className="fileNameCell">
                    <div className="fileName">{f.filename}</div>
                    <div className="fileMetaMobile small">
                      {(f.mime_type ?? "—") + " · " + f.uploader + " · " + new Date(f.uploaded_at).toLocaleDateString()}
                    </div>
                  </td>
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
      </div>

      <div className="card cardPad">
        <div className="sectionTitle" style={{ flexWrap: "wrap", gap: "10px" }}>
          <h2>{t("fileRoom")}</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", width: "100%", justifyContent: "flex-end" }}>
            <input className="search" style={{ width: "min(280px, 100%)", flex: "1 1 auto" }} placeholder={t("searchPlaceholder")} value={q} onChange={(e) => setQ(e.target.value)} />
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
        <div className="small">{t("filesDescription")}</div>
      </div>

      <Drawer
        open={!!selected}
        title={selected ? `${t("preview")}: ${selected.filename}` : t("preview")}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="small"><b>{t("type")}:</b> {selected.mime_type ?? "—"}</div>
            <div className="small"><b>{t("uploader")}:</b> {selected.uploader}</div>
            <div className="small"><b>{t("uploaded")}:</b> {new Date(selected.uploaded_at).toLocaleString()}</div>

            <div className="card cardPad" style={{ padding: 12 }}>
              <div className="sectionTitle">
                <h2 style={{ margin: 0, fontSize: 14 }}>{t("preview")}</h2>
                <a className="btn" href={api2.downloadFileUrl(selected.id)} target="_blank" rel="noreferrer">
                  {t("download")}
                </a>
              </div>

              {previewError ? <div className="small" style={{ color: "rgba(239,68,68,.9)" }}>{previewError}</div> : null}

              {(selected.mime_type ?? "").includes("pdf") ? (
                <iframe
                  title="pdf"
                  src={api2.downloadFileUrl(selected.id)}
                  style={{ width: "100%", height: 420, border: "1px solid var(--line)", borderRadius: 14 }}
                  onError={() => setPreviewError(t("pdfPreviewError"))}
                />
              ) : (selected.mime_type ?? "").startsWith("image/") ? (
                <img
                  src={api2.downloadFileUrl(selected.id)}
                  alt={selected.filename}
                  style={{ width: "100%", borderRadius: 14, border: "1px solid var(--line)" }}
                  onError={() => setPreviewError(t("imagePreviewError"))}
                />
              ) : (
                <div className="small">
                  {t("filePreviewNotSupported")}
                  <div className="small" style={{ marginTop: 8, opacity: .9 }}>{t("filePreviewTip")}</div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
