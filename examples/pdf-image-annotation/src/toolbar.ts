/**
 * toolbar.ts — UI controller layer.
 *
 * Owns everything chrome-related that is NOT the DDV canvas:
 *   • toast notifications
 *   • busy overlay (open / export progress)
 *   • header page status
 *   • export dropdown menu
 *   • enable/disable of the doc-dependent actions
 *
 * The DDV viewer emits "app:page-changed" / "app:document-opened" events;
 * this module subscribes and keeps the header in sync.
 */

import { EditViewerHandle } from "./ddv";
import { ExportFormat } from "./document-io";

/* ================================================================== */
/*  Toasts                                                            */
/* ================================================================== */

const TOAST_DURATION_MS = 4200;

const TOAST_ICONS: Record<string, string> = {
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
};

export function showToast(
  message: string,
  kind: "info" | "success" | "error" = "info"
): void {
  const stack = document.getElementById("toast-stack");
  if (!stack) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${kind}`;
  toast.setAttribute("role", kind === "error" ? "alert" : "status");
  toast.innerHTML = `<span class="t-ic" aria-hidden="true">${TOAST_ICONS[kind]}</span><span>${escapeHtml(message)}</span>`;
  stack.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("leaving");
    window.setTimeout(() => toast.remove(), 400);
  }, TOAST_DURATION_MS);
}

/* ================================================================== */
/*  Busy overlay                                                      */
/* ================================================================== */

export function setBusy(busy: boolean, title?: string): void {
  const overlay = document.getElementById("busy-overlay");
  if (!overlay) return;
  if (title) {
    const t = document.getElementById("busy-title");
    if (t) t.textContent = title;
  }
  overlay.classList.toggle("hidden", !busy);
}

/* ================================================================== */
/*  Header status (page x of y)                                      */
/* ================================================================== */

export function updatePageStatus(handle: EditViewerHandle): void {
  const status = document.getElementById("page-status");

  const doc = handle.getCurrentDoc();
  if (!doc) {
    if (status) status.textContent = "No document open";
    return;
  }

  const total = handle.viewer.getPageCount();
  const current = handle.viewer.getCurrentPageIndex() + 1;
  if (status) status.textContent = total > 0 ? `Page ${current} of ${total}` : "—";
}

/* ================================================================== */
/*  Enable / disable doc-dependent actions                           */
/* ================================================================== */

export function setDocActionsEnabled(enabled: boolean): void {
  (document.getElementById("btn-redact") as HTMLButtonElement)!.disabled = !enabled;
  (document.getElementById("btn-stamp") as HTMLButtonElement)!.disabled = !enabled;
  (document.getElementById("btn-delete-page") as HTMLButtonElement)!.disabled = !enabled;
  (document.getElementById("btn-detect") as HTMLButtonElement)!.disabled = !enabled;
  (document.getElementById("btn-export") as HTMLButtonElement)!.disabled = !enabled;
  (document.getElementById("btn-gdrive") as HTMLButtonElement)!.disabled = !enabled;

  // A disabled trigger cannot be clicked to dismiss its own open menu, so
  // close any that is still showing when the document goes away.
  if (!enabled) {
    document
      .querySelectorAll<HTMLElement>(".export-menu.open")
      .forEach((menu) => menu.classList.remove("open"));
  }
}

/* ================================================================== */
/*  Toolbar wiring                                                    */
/* ================================================================== */

/**
 * What the Detect menu can be asked to do on the current page.
 *
 *   • "document" — find the page boundary and correct the perspective
 *   • "barcode"  — decode 1D/2D barcodes
 *   • "mrz"      — read the machine-readable zone of a passport or ID
 */
export type DetectMode = "document" | "barcode" | "mrz";

export interface ToolbarActions {
  onOpen: () => void;
  onRedact: () => void;
  onStamp: () => void;
  onDeletePage: () => void;
  onDetect: (mode: DetectMode) => void;
  onRefreshScanners: () => void;
  onScan: () => void;
  onCamera: () => void;
  onGDrive: (mode: "pdf" | "images") => void;
  onExport: (format: ExportFormat) => void;
}

export function wireToolbar(actions: ToolbarActions): void {
  const open = el("btn-open");
  const redact = el("btn-redact");
  const stamp = el("btn-stamp");
  const deletePage = el("btn-delete-page");
  const refreshScanners = el("btn-refresh-scanners");
  const scan = el("btn-scan");
  const camera = el("btn-camera");

  open.addEventListener("click", actions.onOpen);
  redact.addEventListener("click", actions.onRedact);
  stamp.addEventListener("click", actions.onStamp);
  deletePage.addEventListener("click", actions.onDeletePage);
  refreshScanners.addEventListener("click", actions.onRefreshScanners);
  scan.addEventListener("click", actions.onScan);
  camera.addEventListener("click", actions.onCamera);

  /* ---- Dropdown menus (Detect / Drive / Export) ---- */
  const menus: Array<{ button: HTMLElement; menu: HTMLElement }> = [
    { button: el("btn-detect"), menu: el("detect-menu") },
    { button: el("btn-gdrive"), menu: el("gdrive-menu") },
    { button: el("btn-export"), menu: el("export-menu") },
  ];

  /** Only one dropdown is ever open, so opening one closes the others. */
  function closeMenus(keepOpen?: HTMLElement): void {
    for (const entry of menus) {
      if (entry.menu !== keepOpen) entry.menu.classList.remove("open");
    }
  }

  for (const entry of menus) {
    entry.button.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !entry.menu.classList.contains("open");
      closeMenus(entry.menu);
      entry.menu.classList.toggle("open", willOpen);
    });
  }

  el("detect-menu").querySelectorAll<HTMLButtonElement>("button[data-detect]").forEach((btn) => {
    btn.addEventListener("click", () => {
      actions.onDetect(btn.getAttribute("data-detect") as DetectMode);
      closeMenus();
    });
  });

  el("gdrive-menu").querySelectorAll<HTMLButtonElement>("button[data-gdrive]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-gdrive") as "pdf" | "images";
      actions.onGDrive(mode);
      closeMenus();
    });
  });

  el("export-menu").querySelectorAll<HTMLButtonElement>("button[data-format]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const format = btn.getAttribute("data-format") as ExportFormat;
      actions.onExport(format);
      closeMenus();
    });
  });

  // Close on outside click / Esc.
  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    const inside = menus.some(
      (entry) => entry.menu.contains(target) || entry.button.contains(target)
    );
    if (!inside) closeMenus();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenus();
  });

  /* ---- Keyboard shortcuts ---- */
  document.addEventListener("keydown", (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "o") {
      e.preventDefault();
      actions.onOpen();
    } else if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      actions.onExport("pdf-editable");
    } else if (mod && e.shiftKey && e.key.toLowerCase() === "r") {
      e.preventDefault();
      actions.onRedact();
    }
  });
}

export function setScannerOptions(options: Array<{ index: number; name: string }>): void {
  const select = document.getElementById("scanner-select") as HTMLSelectElement | null;
  if (!select) return;

  select.innerHTML = "";
  if (options.length === 0) {
    select.appendChild(new Option("No scanners found", ""));
    return;
  }

  for (const option of options) {
    select.appendChild(new Option(option.name, String(option.index)));
  }
}

export function selectedScannerIndex(): number | null {
  const select = document.getElementById("scanner-select") as HTMLSelectElement | null;
  if (!select || select.value === "") return null;
  return Number(select.value);
}

function el(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!)
  );
}
