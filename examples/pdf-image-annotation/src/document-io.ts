/**
 * document-io.ts — Opening documents and exporting them.
 *
 * Opening:
 *   • drag-drop + file input
 *   • password prompt for encrypted PDFs (with a second attempt)
 *   • loadAnnotations mode so an annotated PDF round-trips its native marks
 *
 * Exporting:
 *   • PDF: editable / flattened / as-image (the three saveAnnotation modes)
 *   • raster: PNG / JPEG (per page) / TIFF (multi-page)
 *   • export filenames are generated from the current timestamp
 */

import { DDV, IDocument, PdfSource, Source } from "dynamsoft-document-viewer";
import { EditViewerHandle } from "./ddv";
import { showToast, setBusy } from "./toolbar";

/* ------------------------------------------------------------------ */
/*  Export formats                                                     */
/* ------------------------------------------------------------------ */

export type ExportFormat =
  | "pdf-editable"
  | "pdf-flatten"
  | "pdf-image"
  | "png"
  | "jpeg"
  | "tiff";

/* ------------------------------------------------------------------ */
/*  Open a file                                                        */
/* ------------------------------------------------------------------ */

type PasswordPrompt = (fileName: string) => Promise<string | null>;

export async function openFile(
  handle: EditViewerHandle,
  file: File,
  askPassword: PasswordPrompt
): Promise<void> {
  setBusy(true, `Opening ${file.name}…`);
  const blob = await fileToBlob(file);

  try {
    // 1) Try without a password.
    try {
      await loadIntoViewer(handle, blob, undefined, file.name);
      return;
    } catch (err: any) {
      if (!looksLikePasswordError(err)) {
        showToast(`Could not open ${file.name}: ${messageOf(err)}`, "error");
        return;
      }
    }

    // 2) It's encrypted — ask once, then retry with the password.
    const password = await askPassword(file.name);
    if (!password) {
      showToast("Cancelled — no password provided.", "info");
      return;
    }

    try {
      await loadIntoViewer(handle, blob, password, file.name);
    } catch (err: any) {
      showToast(`Wrong password or unsupported file: ${messageOf(err)}`, "error");
    }
  } finally {
    // Always clear the busy overlay so the user can see the document.
    setBusy(false);
  }
}

export async function appendScannedPdf(
  handle: EditViewerHandle,
  blob: Blob,
  pageCount: number
): Promise<void> {
  setBusy(true, `Adding ${pageCount} scanned page${pageCount === 1 ? "" : "s"}…`);
  try {
    await loadIntoViewer(handle, blob, undefined, "scanned-pages.pdf");
    showToast(`Added ${pageCount} scanned page${pageCount === 1 ? "" : "s"}.`, "success");
  } catch (err: any) {
    showToast(`Could not add scanned pages: ${messageOf(err)}`, "error");
  } finally {
    setBusy(false);
  }
}

function looksLikePasswordError(err: any): boolean {
  const m = (messageOf(err) || "").toLowerCase();
  return (
    m.includes("password") ||
    m.includes("encrypt") ||
    m.includes("permission") ||
    m.includes("auth")
  );
}

async function loadIntoViewer(
  handle: EditViewerHandle,
  fileData: Blob,
  password?: string,
  fileName?: string
): Promise<void> {
  const { docManager, viewer } = handle;
  const existing = viewer.currentDocument;
  const doc = existing ?? docManager.createDocument();
  const insertAt = doc.pages.length;

  // Load the source — PDF and image files need different call signatures
  // so DDV's runtime overload resolution picks the right one.
  // Some browsers assign an empty Blob.type for certain PDFs, so also
  // check the filename extension as a fallback.
  const isPdf =
    fileData.type === "application/pdf" ||
    fileData.type === "application/x-pdf" ||
    (fileData.type === "" && /\.(pdf)$/i.test(fileName ?? ""));

  if (isPdf) {
    // PDF: use PdfSource with convertMode, password, and renderOptions
    // for annotation round-trip support.
    const pdfSource: PdfSource = {
      fileData,
      convertMode: DDV.EnumConvertMode.CM_AUTO,
      password: password ?? "",
      renderOptions: {
        renderAnnotations: DDV.EnumAnnotationRenderMode.LOAD_ANNOTATIONS,
      },
    };
    await doc.loadSource(pdfSource, insertAt);
  } else {
    // Image (PNG/JPEG/TIFF/BMP): use plain Source — no convertMode needed.
    const imgSource: Source = { fileData };
    await doc.loadSource(imgSource, insertAt);
  }

  // Reveal the document and broadcast an app-level event.
  if (!existing) viewer.openDocument(doc.uid);
  viewer.goToPage(insertAt);
  document.dispatchEvent(new CustomEvent("app:document-opened"));
}

export function deleteCurrentPage(handle: EditViewerHandle): void {
  const doc = handle.getCurrentDoc();
  if (!doc) {
    showToast("Open a document first.", "error");
    return;
  }

  const index = handle.viewer.getCurrentPageIndex();
  if (index < 0) return;

  const ok = doc.deletePages([index]);
  if (!ok) {
    showToast("Could not delete the current page.", "error");
    return;
  }

  if (doc.pages.length === 0) {
    const uid = doc.uid;
    handle.viewer.closeDocument();
    try {
      handle.docManager.deleteDocuments([uid]);
    } catch {
      /* already deleted */
    }
    document.dispatchEvent(new CustomEvent("app:document-closed"));
    showToast("Removed the last page.", "success");
    return;
  }

  handle.viewer.goToPage(Math.min(index, doc.pages.length - 1));
  document.dispatchEvent(new CustomEvent("app:page-changed"));
  showToast("Page deleted.", "success");
}

/* ------------------------------------------------------------------ */
/*  Export                                                             */
/* ------------------------------------------------------------------ */

export async function exportDocument(
  handle: EditViewerHandle,
  format: ExportFormat
): Promise<void> {
  const doc = handle.getCurrentDoc();
  if (!doc) {
    showToast("Open a document first.", "error");
    return;
  }

  const base = timestampedExportBaseName();

  try {
    switch (format) {
      case "pdf-editable": {
        setBusy(true, "Exporting PDF (editable)…");
        const blob = await doc.saveToPdf({ saveAnnotation: "annotation" });
        saveBlob(blob, `${base}.pdf`);
        showToast("Exported PDF — annotations stay editable.", "success");
        break;
      }
      case "pdf-flatten": {
        setBusy(true, "Exporting PDF (flattened)…");
        const blob = await doc.saveToPdf({ saveAnnotation: "flatten" });
        saveBlob(blob, `${base}.pdf`);
        showToast("Exported PDF — annotations burned into pages.", "success");
        break;
      }
      case "pdf-image": {
        setBusy(true, "Exporting PDF (as image)…");
        const blob = await doc.saveToPdf({ saveAnnotation: "image" });
        saveBlob(blob, `${base}.pdf`);
        showToast("Exported PDF — each page rasterized.", "success");
        break;
      }
      case "png": {
        setBusy(true, "Exporting PNG…");
        const count = doc.pages.length;
        for (let i = 0; i < count; i++) {
          const blob = await doc.saveToPng(i);
          saveBlob(blob, count > 1 ? `${base}_page${i + 1}.png` : `${base}.png`);
        }
        showToast(`Exported ${count} PNG image${count > 1 ? "s" : ""}.`, "success");
        break;
      }
      case "jpeg": {
        setBusy(true, "Exporting JPEG…");
        const count = doc.pages.length;
        for (let i = 0; i < count; i++) {
          const blob = await doc.saveToJpeg(i, { quality: 90 });
          saveBlob(blob, count > 1 ? `${base}_page${i + 1}.jpg` : `${base}.jpg`);
        }
        showToast(`Exported ${count} JPEG image${count > 1 ? "s" : ""}.`, "success");
        break;
      }
      case "tiff": {
        setBusy(true, "Exporting TIFF…");
        const blob = await doc.saveToTiff({
          compression: DDV.EnumTIFFCompressionType.TIFF_AUTO,
        });
        saveBlob(blob, `${base}.tif`);
        showToast("Exported multi-page TIFF.", "success");
        break;
      }
    }
  } catch (err: any) {
    showToast(`Export failed: ${messageOf(err)}`, "error");
  } finally {
    setBusy(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fileToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Blob([reader.result!], { type: file.type }));
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Defer revoke so the download has time to start in all browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function timestampedExportBaseName(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `annotation-studio-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
}

function messageOf(err: any): string {
  if (!err) return "unknown error";
  return err.message ?? err.toString?.() ?? String(err);
}
