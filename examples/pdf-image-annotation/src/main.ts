/**
 * main.ts — Entry point: license + Core init, then app-shell wiring.
 *
 * Architecture:
 *   • The app owns a slim chrome (header, left page rail, empty state).
 *   • DDV's EditViewer owns the in-canvas edit + annotation toolbar, so
 *     there is exactly ONE toolbar per concern — no duplication.
 *
 * The whole thing runs 100% client-side: documents are parsed, annotated,
 * redacted, and re-exported entirely in the browser via WebAssembly.
 */

// DDV CSS — Vite bundles this from the npm package.
import "dynamsoft-document-viewer/dist/ddv.css";

import { DDV } from "dynamsoft-document-viewer";
import { createEditViewer, EditViewerHandle, fixViewerLayout } from "./ddv";
import {
  openFile,
  exportDocument,
  deleteCurrentPage,
  appendScannedPdf,
  appendImageBlob,
  ExportFormat,
} from "./document-io";
import { quickRedact, addDateStamp } from "./annotations";
import { listScanners, scanFromDevice } from "./scanner";
import { openCameraCapture } from "./camera";
import { detectDocumentBoundary } from "./document-detect";
import { uploadToGoogleDrive } from "./gdrive";
import {
  showToast,
  updatePageStatus,
  setDocActionsEnabled,
  wireToolbar,
  setScannerOptions,
  selectedScannerIndex,
} from "./toolbar";

/* ------------------------------------------------------------------ */
/*  License + WASM engine init                                         */
/* ------------------------------------------------------------------ */

/**
 * Default trial license key used as a fallback when the user does not
 * provide their own license.
 */
const DEFAULT_LICENSE: string =
  "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";

/** License from .env.local (if set) overrides the default. */
const ENV_LICENSE: string | undefined = import.meta.env.VITE_DDVR_LICENSE;

// Serve the WASM engine from the same CDN as the package. For fully
// offline/production hosting, copy the `dist/engine` folder locally and
// point this at that path instead.
const ENGINE_RESOURCE_PATH =
  "https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@4.0.0/dist/engine";

async function initDDV(license: string): Promise<void> {
  const title = document.getElementById("init-title")!;
  const sub = document.getElementById("init-sub")!;

  DDV.Core.license = license;
  DDV.Core.engineResourcePath = ENGINE_RESOURCE_PATH;

  sub.textContent = "Loading the WASM document engine\u2026";
  await DDV.Core.init();

  title.textContent = "Preparing tools";
  sub.textContent = "Warming up image filters\u2026";
  DDV.setProcessingHandler("imageFilter", new DDV.ImageFilter());
}

/* ------------------------------------------------------------------ */
/*  License screen                                                     */
/* ------------------------------------------------------------------ */

/**
 * Show the license activation screen and resolve with the chosen license
 * key once the user clicks Activate or Use Default License.
 */
function waitForLicense(): Promise<string> {
  return new Promise((resolve) => {
    const screen = document.getElementById("license-screen")!;
    const input = document.getElementById("license-input") as HTMLTextAreaElement;
    const btnActivate = document.getElementById("btn-activate")!;
    const btnDefault = document.getElementById("btn-use-default")!;
    const errorEl = document.getElementById("license-error")!;

    // If an env license is set, pre-fill the input.
    if (ENV_LICENSE) {
      input.value = ENV_LICENSE;
    }

    function proceed(license: string) {
      screen.classList.add("hidden");
      resolve(license);
    }

    function showError(msg: string) {
      errorEl.textContent = msg;
      errorEl.classList.remove("hidden");
      btnActivate.removeAttribute("disabled");
    }

    btnActivate.addEventListener("click", async () => {
      const key = input.value.trim();
      if (!key) {
        showError("Please paste a license key, or click \"Use Default License\".");
        return;
      }
      btnActivate.setAttribute("disabled", "true");
      errorEl.classList.add("hidden");
      proceed(key);
    });

    btnDefault.addEventListener("click", () => {
      btnDefault.setAttribute("disabled", "true");
      errorEl.classList.add("hidden");
      proceed(DEFAULT_LICENSE);
    });
  });
}

/* ------------------------------------------------------------------ */
/*  App state                                                          */
/* ------------------------------------------------------------------ */

let viewerHandle: EditViewerHandle | null = null;

/* ------------------------------------------------------------------ */
/*  Bootstrap                                                          */
/* ------------------------------------------------------------------ */

async function bootstrap(): Promise<void> {
  const initOverlay = document.getElementById("init-overlay")!;

  // 1. Show the license screen and wait for the user to choose a key.
  const license = await waitForLicense();

  // 2. Show the WASM init overlay and initialize the engine.
  initOverlay.classList.remove("hidden");

  try {
    await initDDV(license);
  } catch (err: any) {
    const title = document.getElementById("init-title")!;
    const sub = document.getElementById("init-sub")!;
    title.textContent = "Initialization failed";
    sub.textContent = err?.message ?? String(err);
    showToast("SDK init failed. Check your license key and try again.", "error");
    return;
  }

  // 3. Engine ready — hide the init overlay and build the viewer.
  initOverlay.classList.add("hidden");

  viewerHandle = createEditViewer("ddv-container");

  wireToolbar({
    onOpen: () => openFilePicker(),
    onRedact: () => viewerHandle && quickRedact(viewerHandle),
    onStamp: () => viewerHandle && addDateStamp(viewerHandle),
    onDeletePage: () => viewerHandle && deleteCurrentPage(viewerHandle),
    onDetect: () => viewerHandle && detectDocumentBoundary(viewerHandle),
    onRefreshScanners: () => refreshScanners(),
    onScan: () => scanSelectedDevice(),
    onCamera: () => captureFromCamera(),
    onGDrive: (mode) => viewerHandle && uploadToGoogleDrive(viewerHandle, mode),
    onExport: (format: ExportFormat) => viewerHandle && exportDocument(viewerHandle, format),
  });

  /* ---- File input (button + empty-state CTA) ---- */
  const fileInput = document.getElementById("file-input") as HTMLInputElement;
  fileInput.addEventListener("change", async () => {
    const files = fileInput.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await openFile(viewerHandle!, file, askPassword);
    }
    fileInput.value = ""; // allow re-selecting the same file
  });

  document.getElementById("empty-open")!.addEventListener("click", openFilePicker);
  document.getElementById("empty-drop")!.addEventListener("click", openFilePicker);

  /* ---- Drag-and-drop ---- */
  wireDragDrop();

  /* ---- React to document / page lifecycle ---- */
  document.addEventListener("app:document-opened", () => {
    setDocActionsEnabled(true);
    toggleEmptyState(false);
    if (viewerHandle) updatePageStatus(viewerHandle);
    // Re-apply layout fix after document opens (DDV may re-render DOM)
    requestAnimationFrame(() => fixViewerLayout("ddv-container"));
    showToast("Pages added.", "success");
  });

  document.addEventListener("app:document-closed", () => {
    setDocActionsEnabled(false);
    toggleEmptyState(true);
    if (viewerHandle) updatePageStatus(viewerHandle);
  });

  document.addEventListener("app:page-changed", () => {
    if (viewerHandle) updatePageStatus(viewerHandle);
  });
}

function openFilePicker(): void {
  (document.getElementById("file-input") as HTMLInputElement)!.click();
}

async function refreshScanners(): Promise<void> {
  try {
    const scanners = await listScanners(true);
    setScannerOptions(scanners);
    showToast(
      scanners.length ? `Found ${scanners.length} scanner${scanners.length === 1 ? "" : "s"}.` : "No scanners found.",
      scanners.length ? "success" : "info"
    );
  } catch (err: any) {
    showToast(`Scanner setup failed: ${err?.message ?? err}`, "error");
  }
}

async function scanSelectedDevice(): Promise<void> {
  if (!viewerHandle) return;

  const index = selectedScannerIndex();
  if (index === null) {
    showToast("Refresh scanners and select a scanner first.", "error");
    return;
  }

  try {
    const result = await scanFromDevice(index);
    if (!result) return;
    await appendScannedPdf(viewerHandle, result.blob, result.pageCount);
  } catch (err: any) {
    showToast(`Scan failed: ${err?.message ?? err}`, "error");
  }
}

async function captureFromCamera(): Promise<void> {
  if (!viewerHandle) return;

  const photos = await openCameraCapture();
  if (photos.length === 0) return;

  for (let i = 0; i < photos.length; i++) {
    await appendImageBlob(viewerHandle, photos[i].blob, `camera photo ${i + 1}`);
    URL.revokeObjectURL(photos[i].url);
  }
  showToast(`Added ${photos.length} photo${photos.length > 1 ? "s" : ""} from camera.`, "success");
}

/* ------------------------------------------------------------------ */
/*  Empty-state visibility                                             */
/* ------------------------------------------------------------------ */

function toggleEmptyState(visible: boolean): void {
  const empty = document.getElementById("empty-state");
  if (empty) empty.style.display = visible ? "flex" : "none";
}

/* ------------------------------------------------------------------ */
/*  Password dialog (for encrypted PDFs)                              */
/* ------------------------------------------------------------------ */

function askPassword(fileName: string): Promise<string | null> {
  const dialog = document.getElementById("password-dialog") as HTMLDialogElement;
  const sub = document.getElementById("pwd-filename")!;
  const input = document.getElementById("pdf-password") as HTMLInputElement;
  const form = document.getElementById("password-form") as HTMLFormElement;

  sub.textContent = `“${fileName}” is encrypted.`;
  input.value = "";
  dialog.showModal();

  return new Promise<string | null>((resolve) => {
    const handler = (ev: SubmitEvent) => {
      const btn = ev.submitter as HTMLButtonElement;
      const value = btn?.value === "ok" ? input.value : null;
      if (dialog.open) dialog.close();
      form.removeEventListener("submit", handler);
      resolve(value);
    };
    form.addEventListener("submit", handler);

    // User pressed Esc on the dialog.
    dialog.addEventListener("cancel", () => {
      form.removeEventListener("submit", handler);
      resolve(null);
    }, { once: true });
  });
}

/* ------------------------------------------------------------------ */
/*  Drag-and-drop                                                      */
/* ------------------------------------------------------------------ */

function wireDragDrop(): void {
  const dropOverlay = document.getElementById("drop-overlay")!;
  const body = document.body;
  let dragDepth = 0;

  body.addEventListener("dragenter", (e) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    dragDepth++;
    dropOverlay.classList.remove("hidden");
  });

  body.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) dropOverlay.classList.add("hidden");
  });

  body.addEventListener("dragover", (e) => {
    if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
  });

  body.addEventListener("drop", async (e) => {
    e.preventDefault();
    dragDepth = 0;
    dropOverlay.classList.add("hidden");

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0 || !viewerHandle) return;

    for (const file of Array.from(files)) {
      await openFile(viewerHandle, file, askPassword);
    }
  });
}

/* ------------------------------------------------------------------ */
/*  Start                                                              */
/* ------------------------------------------------------------------ */

bootstrap();
