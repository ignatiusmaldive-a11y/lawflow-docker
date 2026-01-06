import React, { useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "./components/Drawer";
import { useI18n } from "../lib/i18n";
import { api2, api3, FileItem, Project } from "../lib/api";

export type FilesRoomHandle = {
  uploadFile: (file: File) => Promise<void>;
  setDragging: (dragging: boolean) => void;
};

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

export const FilesRoom = React.forwardRef<FilesRoomHandle, {
  projectId: number;
  embedded?: boolean;
  project?: Project | null;
  onProjectUpdated?: (p: Project) => void;
  externalDropTarget?: boolean;
}>(function FilesRoom({
    projectId,
    project,
    onProjectUpdated,
    externalDropTarget = false,
    embedded = false,
  }, ref) {
  const { t } = useI18n();
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<FileItem | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [dropboxFolder, setDropboxFolder] = useState<string>("");
  const [dropboxBusy, setDropboxBusy] = useState(false);
  const [dropboxError, setDropboxError] = useState<string | null>(null);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragDepthRef = useRef(0);

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

  React.useImperativeHandle(ref, () => ({
    uploadFile: handleUpload,
    setDragging: (v: boolean) => setDragging(v),
  }), [projectId]);

  useEffect(() => {
    refresh().catch(console.error);
  }, [projectId]);

  useEffect(() => {
    setPreviewError(null);
    setPreviewLoading(false);
    setPreviewObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) return;
    const sel = selected;
    const mime = sel.mime_type ?? "";
    const isPdf = mime.includes("pdf");
    const isImage = mime.startsWith("image/");
    if (!isPdf && !isImage) return;

    let cancelled = false;
    async function load() {
      setPreviewLoading(true);
      setPreviewError(null);
      try {
        const res = await fetch(api2.downloadFileUrl(sel.id));
        if (!res.ok) throw new Error("preview fetch failed");
        const blob = await res.blob();
        const typedBlob = blob.type ? blob : new Blob([blob], { type: sel.mime_type ?? undefined });
        const objectUrl = URL.createObjectURL(typedBlob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setPreviewObjectUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
      } catch (err) {
        console.error(err);
        setPreviewError((sel.mime_type ?? "").includes("pdf") ? t("pdfPreviewError") : t("imagePreviewError"));
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }
    void load();

    return () => {
      cancelled = true;
    };
  }, [selected, t]);

  useEffect(() => {
    setDropboxFolder((project?.dropbox_folder ?? "").trim());
    setDropboxError(null);
  }, [projectId, project?.dropbox_folder]);

  async function saveDropboxFolder(next: string) {
    setDropboxBusy(true);
    setDropboxError(null);
    try {
      const updated = await api3.patchProject(projectId, { dropbox_folder: next.trim() ? next.trim() : null });
      onProjectUpdated?.(updated);
      setDropboxFolder((updated.dropbox_folder ?? "").trim());
    } catch (err) {
      console.error(err);
      setDropboxError(t("dropboxSaveFailed"));
    } finally {
      setDropboxBusy(false);
    }
  }

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
        <div className="filesRoomBlock filesRoomUploadBlock">
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
            <div className="filesWidgetRow">
              <div className="small filesWidgetText" style={{ opacity: 0.95 }}>{t("dragDrop")}</div>
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

        <div className="filesRoomBlock filesRoomDropboxBlock">
          <div className="filesRoomUploadHeader">
            <span className="filesRoomBlockTitle">{t("dropboxFolderTitle")}</span>
            <span className="filesRoomUploadHint small">{t("dropboxFolderHint")}</span>
          </div>

          <div
            className="dropZone filesUploadZone dropboxZone"
            role="button"
            tabIndex={0}
            onClick={() => {}}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
              }
            }}
          >
            <div className="filesWidgetRow">
              <div className="small filesWidgetText" style={{ opacity: 0.95 }}>
                {project?.dropbox_folder ? (
                  <span><b>{t("dropboxAssigned")}:</b> {project.dropbox_folder}</span>
                ) : (
                  <span>{t("dropboxNotAssigned")}</span>
                )}
              </div>
              <button
                className="btn primary"
                onClick={(e) => {
                  e.stopPropagation();
                  const next = project?.dropbox_folder ? "" : (dropboxFolder || "/demo");
                  void saveDropboxFolder(next);
                }}
                disabled={dropboxBusy}
              >
                {dropboxBusy ? t("saving") : t("dropboxAssign")}
              </button>
            </div>

            {dropboxError ? <div className="small" style={{ marginTop: 8, color: "rgba(239,68,68,.9)" }}>{dropboxError}</div> : null}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      style={{ display: "grid", gap: embedded ? 0 : 12 }}
      onDragOver={externalDropTarget ? undefined : (e) => { e.preventDefault(); }}
      onDragEnter={externalDropTarget ? undefined : (e) => { e.preventDefault(); dragDepthRef.current += 1; setDragging(true); }}
      onDragLeave={externalDropTarget ? undefined : (e) => {
        e.preventDefault();
        dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
        if (dragDepthRef.current === 0) setDragging(false);
      }}
      onDrop={externalDropTarget ? undefined : async (e) => {
        e.preventDefault();
        dragDepthRef.current = 0;
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (!f) return;
        await handleUpload(f);
      }}>
      {dragging ? (<div className="dropZone dragOverlay">{t("dragDrop")}</div>) : null}

      {embedded ? (
        <div className="cardSections">
          <div className="cardSection filesRoomTableSection">{Table}</div>
          <div className="cardSection filesRoomWidgetsSection">{Room}</div>
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
        onClose={() => { setSelected(null); }}
      >
        {selected ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div className="small"><b>{t("type")}:</b> {selected.mime_type ?? "—"}</div>
            <div className="small"><b>{t("uploader")}:</b> {selected.uploader}</div>
            <div className="small"><b>{t("uploaded")}:</b> {new Date(selected.uploaded_at).toLocaleString("es-ES")}</div>

	            <div className="card cardPad" style={{ padding: 12 }}>
	              <div className="sectionTitle">
	                <h2 style={{ margin: 0, fontSize: 14 }}>{t("preview")}</h2>
	                <div style={{ display: "flex", gap: 8 }}>
	                  <a className="btn" href={previewObjectUrl ?? api2.downloadFileUrl(selected.id)} target="_blank" rel="noreferrer">
	                    {t("openInNewTab")}
	                  </a>
	                  <a className="btn" href={api2.downloadFileUrl(selected.id)} target="_blank" rel="noreferrer">
	                    {t("download")}
	                  </a>
	                </div>
	              </div>

              {previewLoading ? <div className="small">{t("loading")}</div> : null}
              {previewError ? <div className="small" style={{ color: "rgba(239,68,68,.9)" }}>{previewError}</div> : null}

              {(selected.mime_type ?? "").includes("pdf") && previewObjectUrl ? (
                <iframe
                  title="pdf"
                  src={previewObjectUrl}
                  style={{ width: "100%", height: 420, border: "1px solid var(--line)", borderRadius: 14 }}
                  onError={() => setPreviewError(t("pdfPreviewError"))}
                />
              ) : (selected.mime_type ?? "").startsWith("image/") && previewObjectUrl ? (
                <img
                  src={previewObjectUrl}
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
});
