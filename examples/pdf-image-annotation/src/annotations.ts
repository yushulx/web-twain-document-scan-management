/**
 * Programmatic annotation helpers.
 *
 * The DDV canvas toolbar owns detailed annotation editing. These header
 * actions only create sensible starting annotations on the current page.
 */

import { DDV } from "dynamsoft-document-viewer";
import { EditViewerHandle } from "./ddv";
import { showToast } from "./toolbar";

function currentPageUid(
  handle: EditViewerHandle
): { pageUid: string; mediaBox: { width: number; height: number } } | null {
  const doc = handle.getCurrentDoc();
  if (!doc) return null;

  const index = handle.viewer.getCurrentPageIndex();
  if (index < 0) return null;

  const pageUid = handle.viewer.indexToUid(index);
  const pageData = doc.getPageData(pageUid);
  const { width, height } = pageData.mediaBox;
  return { pageUid, mediaBox: { width, height } };
}

export function quickRedact(handle: EditViewerHandle): void {
  const ctx = currentPageUid(handle);
  if (!ctx) {
    showToast("Open a page first.", "error");
    return;
  }

  const { pageUid, mediaBox } = ctx;
  const width = mediaBox.width * 0.5;
  const height = mediaBox.height * 0.12;
  const x = (mediaBox.width - width) / 2;
  const y = (mediaBox.height - height) / 2;

  const created = DDV.annotationManager.createAnnotation(pageUid, "redaction", {
    redactionType: "rectangle",
    background: "#000000",
    rects: [{ x, y, width, height }],
    overlayText: {
      text: "REDACTED",
      color: "#ffffff",
      textAlign: "center",
      fontSize: 10,
      repeatText: true,
      autoFontSize: true,
    },
  });

  handle.viewer.selectAnnotations([created.uid]);
  showToast(
    "Redaction mark added. Move or resize it, then apply it from the redaction toolbar.",
    "info"
  );
}

export function addDateStamp(handle: EditViewerHandle): void {
  const ctx = currentPageUid(handle);
  if (!ctx) {
    showToast("Open a page first.", "error");
    return;
  }

  const { pageUid, mediaBox } = ctx;
  const stampText = `REVIEWED ${formatDate(new Date())}`;
  const width = 170;
  const height = 34;
  const margin = 18;
  const x = mediaBox.width - width - margin;
  const y = mediaBox.height - height - margin;

  DDV.annotationManager.createAnnotation(pageUid, "textBox", {
    x,
    y,
    width,
    height,
    borderColor: "transparent",
    background: "rgba(255, 214, 0, 0.9)",
    textContents: [
      {
        content: stampText,
        color: "#1a1a1a",
        fontSize: 13,
        fontFamily: "Helvetica",
        fontWeight: "bold",
      },
    ],
  });

  showToast(`Stamp added: "${stampText}".`, "success");
}

function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
