/**
 * ddv.ts — EditViewer factory + document lifecycle.
 *
 * The app owns a thin chrome (header / empty state / thumbnails). DDV's
 * EditViewer owns the in-canvas edit & annotation toolbar, so the two
 * toolbars never duplicate each other.
 *
 * Key responsibilities:
 *   • create the EditViewer with a clean, single in-canvas toolbar
 *   • host DDV's native thumbnail component in our left rail
 *   • track the current document + page, and emit app-level events
 */

import {
  DDV,
  EditViewer,
  EditViewerConstructorOptions,
  IDocument,
  UiConfig,
} from "dynamsoft-document-viewer";

/* ------------------------------------------------------------------ */
/*  Public handle                                                      */
/* ------------------------------------------------------------------ */

export interface EditViewerHandle {
  viewer: EditViewer;
  docManager: typeof DDV.documentManager;
  /** The currently open document, or undefined. */
  getCurrentDoc: () => IDocument | undefined;
  /** The uid of the open document, or undefined. */
  currentDocUid: () => string | undefined;
}

/* ------------------------------------------------------------------ */
/*  In-canvas EditViewer toolbar                                       */
/* ------------------------------------------------------------------ */
/*  Deliberately minimal: page navigation + the native annotation set  */
/*  (which itself exposes shapes, ink, text, stamps, redaction).       */
/*  File open / export / quick actions live in our app header instead. */
/* ------------------------------------------------------------------ */

function buildUiConfig(): UiConfig {
  return {
    type: DDV.Elements.Layout,
    flexDirection: "column",
    className: "ddv-edit-viewer-desktop",
    children: [
      {
        type: DDV.Elements.Layout,
        className: "ddv-edit-viewer-header",
        children: [
          DDV.Elements.Pagination,
          DDV.Elements.SeparatorLine,
          DDV.Elements.DisplayMode,
          DDV.Elements.FitMode,
          DDV.Elements.Zoom,
          DDV.Elements.SeparatorLine,
          DDV.Elements.RotateLeft,
          DDV.Elements.RotateRight,
          DDV.Elements.Crop,
          DDV.Elements.Filter,
          DDV.Elements.SeparatorLine,
          DDV.Elements.Undo,
          DDV.Elements.Redo,
          DDV.Elements.Delete,
          DDV.Elements.SeparatorLine,
          DDV.Elements.AnnotationSet,
          DDV.Elements.RedactionSet,
        ],
      },
      {
        type: DDV.Elements.Layout,
        flexDirection: "row",
        className: "ddv-edit-viewer-body",
        children: [DDV.Elements.MainView],
      },
    ],
  } as unknown as UiConfig;
}

/* ------------------------------------------------------------------ */
/*  Create viewer                                                      */
/* ------------------------------------------------------------------ */

export function createEditViewer(containerId: string): EditViewerHandle {
  const container = document.getElementById(containerId)!;

  const options: EditViewerConstructorOptions = {
    container,
    uiConfig: buildUiConfig(),
    thumbnailConfig: {
      // Our left rail hosts DDV's thumbnail component.
      visibility: "visible",
      position: "left",
      size: "204px",
      columns: 1,
      multiselectMode: false,
    },
  };

  const docManager = DDV.documentManager;
  const viewer = new EditViewer(options);

  /* ---- Fix DDV's internal layout after mount ---- */
  // DDV's default CSS (.ddv-layout) sets height:100%, justify-content:space-around
  // and align-items:center on every layout element — these break flex sizing.
  // CSS !important overrides handle most of it, but we also apply direct DOM
  // fixes as a safety measure against DDV's JS-set inline styles.
  fixViewerLayout(containerId);

  /* ---- App-level event plumbing ---- */
  // Re-broadcast page changes so the header status + rail count stay fresh.
  viewer.on("currentIndexChanged", () => {
    document.dispatchEvent(new CustomEvent("app:page-changed"));
    // Re-apply layout fix after page change (DDV may re-render)
    requestAnimationFrame(() => fixViewerLayout(containerId));
  });
  viewer.on("currentPageChanged", () => {
    document.dispatchEvent(new CustomEvent("app:page-changed"));
    requestAnimationFrame(() => fixViewerLayout(containerId));
  });

  return {
    viewer,
    docManager,
    getCurrentDoc: () => viewer.currentDocument ?? undefined,
    currentDocUid: () => viewer.currentDocument?.uid,
  };
}

/* ------------------------------------------------------------------ */
/*  Layout fix — ensure DDV DOM elements size correctly                */
/* ------------------------------------------------------------------ */

/**
 * DDV's .ddv-layout has `height:100%; justify-content:space-around;
 * align-items:center` by default. These cause flex children to be centered
 * and squished instead of stretched to fill the available space.
 *
 * CSS !important overrides handle most of this, but DDV's JS also sets
 * inline styles dynamically (e.g. on the thumbnail container). This
 * function directly patches the DOM as a safety measure.
 */
export function fixViewerLayout(containerId: string): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Root: remove DDV's ugly border
  const root = container.querySelector(".ddv-root") as HTMLElement;
  if (root) root.style.border = "none";

  // Desktop column: flex fill
  const desktop = container.querySelector(".ddv-edit-viewer-desktop") as HTMLElement;
  if (desktop) {
    desktop.style.flex = "1";
    desktop.style.minHeight = "0";
    desktop.style.justifyContent = "flex-start";
    desktop.style.alignItems = "stretch";
  }

  // Header: shrink-to-fit, themed
  const header = container.querySelector(".ddv-edit-viewer-header") as HTMLElement;
  if (header) {
    header.style.flex = "0 0 48px";
    header.style.flexShrink = "0";
    header.style.width = "100%";
    header.style.height = "48px";
    header.style.minHeight = "48px";
    header.style.maxHeight = "48px";
    header.style.justifyContent = "flex-start";
    header.style.alignItems = "center";
    header.style.overflowX = "auto";
    header.style.overflowY = "hidden";
  }

  // Body row: takes remaining space, stretch children
  const body = container.querySelector(".ddv-edit-viewer-body") as HTMLElement;
  if (body) {
    body.style.flex = "1";
    body.style.minHeight = "0";
    // CRITICAL: DDV sets height:100% via .ddv-layout class.
    // In a flex-column parent this conflicts with flex:1.
    // Set height:auto so flex-grow distributes the space.
    body.style.height = "auto";
    body.style.justifyContent = "flex-start";
    body.style.alignItems = "stretch";
  }

  // MainView canvas: fills body row
  const mainCanvas = container.querySelector(".ddv-main-canvas") as HTMLElement;
  if (mainCanvas) {
    mainCanvas.style.flex = "1";
    mainCanvas.style.minWidth = "0";
    mainCanvas.style.minHeight = "0";
  }

  // ddv-core: fills MainView
  const core = container.querySelector(".ddv-core") as HTMLElement;
  if (core) {
    core.style.height = "100%";
    core.style.width = "100%";
  }

  // main-and-thumbnail row: fill ddv-core, stretch children
  const mainThb = container.querySelector(".ddv-main-and-thumbnail") as HTMLElement;
  if (mainThb) {
    mainThb.style.height = "100%";
    mainThb.style.width = "100%";
    mainThb.style.alignItems = "stretch";
    mainThb.style.justifyContent = "flex-start";
  }

  // Main container: fills remaining space after thumbnail
  const mainContainer = container.querySelector(".ddv-main-container") as HTMLElement;
  if (mainContainer) {
    mainContainer.style.flex = "1";
    mainContainer.style.minWidth = "0";
    mainContainer.style.minHeight = "0";
  }
}
