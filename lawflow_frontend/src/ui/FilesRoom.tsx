import React, { useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "./components/Drawer";
import { useI18n } from "../lib/i18n";
import { api2, FileItem } from "../lib/api";

function formatMimeLabel(mime?: string | null) {
  const raw = (mime ?? "—").split(";")[0].trim();
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "application/zip": "ZIP",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.ms-powerpoint": "PPT",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
    "text/plain": "TXT",
    "application/octet-stream": "FILE",
  };
  if (map[raw]) return map[raw];
  if (raw.startsWith("image/")) return raw.slice("image/".length).toUpperCase();
  const slash = raw.indexOf("/");
  if (slash !== -1) return raw.slice(slash + 1).toUpperCase();
  return raw || "—";
}

export function FilesRoom({ projectId, embedded = false }: { projectId: number; embedded?: boolean }) {
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function refresh() {
    const list = await api2.files(projectId);
    setFiles(list);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      await api2.uploadFile(projectId, file);
      if (inputRef.current) inputRef.current.value = "";
      await refresh();
    } catch (err) {
      console.error(err);
      setUploadError(t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, [projectId]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return files;
    return files.filter((f) => (f.filename + " " + (f.mime_type ?? "") + " " + f.uploader).toLowerCase().includes(qq));
  }, [files, q]);

  const Table = (
    <div className="table-container">
      <table className="table filesTable">
        <thead>
          <tr>
            <th>{t("filename")}</th>
            <th>{t("uploader")}</th>
            <th>{t("uploaded")}</th>
            <th>{t("type")}</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((f) => (
            <tr
              key={f.id}
              className={selected?.id === f.id ? "filesRowSelected" : undefined}
              onClick={() => { setSelected(f); setPreviewError(null); }}
            >
              <td className="fileNameCell">
                <div className="fileName">{f.filename}</div>
                <div className="fileMetaMobile small">
                  {formatMimeLabel(f.mime_type) + " · " + f.uploader + " · " + new Date(f.uploaded_at).toLocaleDateString("es-ES")}
                </div>
              </td>
              <td>{f.uploader}</td>
              <td className="small">{new Date(f.uploaded_at).toLocaleString("es-ES")}</td>
              <td className="small" title={f.mime_type ?? "—"}>{formatMimeLabel(f.mime_type)}</td>
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
  );

  const Room = (
    <>
      <div className="filesRoomGrid filesRoomGridUploadOnly">
        <div className="filesRoomBlock">
          <div className="filesRoomUploadHeader">
            <span className="filesRoomBlockTitle">{t("uploadFilesTitle")}</span>
            <span className="filesRoomUploadHint small">{t("uploadFilesHint")}</span>
          </div>

          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              await handleUpload(f);
            }}
          />

          <div
            className={"dropZone filesUploadZone" + (dragging ? " active" : "")}
            role="button"
            tabIndex={0}
            onClick={() => (uploading ? null : inputRef.current?.click())}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!uploading) inputRef.current?.click();
              }
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <div className="small" style={{ opacity: 0.95 }}>{t("dragDrop")}</div>
              <button
                className="btn primary"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                disabled={uploading}
              >
                {uploading ? t("uploading") : t("chooseFile")}
              </button>
            </div>
            {uploadError ? <div className="small" style={{ marginTop: 8, color: "rgba(239,68,68,.9)" }}>{uploadError}</div> : null}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      style={{ display: "grid", gap: embedded ? 0 : 12 }}
      onDragOver={(e)=>{ e.preventDefault(); setDragging(true); }}
      onDragLeave={(e)=>{ e.preventDefault(); setDragging(false); }}
      onDrop={async (e)=>{ e.preventDefault(); setDragging(false); const f=e.dataTransfer.files?.[0]; if(!f) return; await handleUpload(f); }}>
      {dragging ? (<div className="dropZone">{t("dragDrop")}</div>) : null}

      {embedded ? (
        <div className="cardSections">
          <div className="cardSection">{Table}</div>
          <div className="cardSection">{Room}</div>
        </div>
      ) : (
        <>
          <div className="card cardPad">{Table}</div>
          <div className="card cardPad">{Room}</div>
        </>
      )}

      <Drawer
        open={!!selected}
        title={selected ? `${t("preview")}: ${selected.filename}` : t("preview")}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="small"><b>{t("type")}:</b> {selected.mime_type ?? "—"}</div>
            <div className="small"><b>{t("uploader")}:</b> {selected.uploader}</div>
            <div className="small"><b>{t("uploaded")}:</b> {new Date(selected.uploaded_at).toLocaleString("es-ES")}</div>

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
