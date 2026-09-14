/**
 * document-detect.ts — Document boundary detection & perspective correction.
 *
 * Detection is Dynamsoft Capture Vision's Document Normalizer (DDN) engine,
 * driven through the shared router in `cv.ts` with the
 * `DetectDocumentBoundaries_Default` preset template. (An earlier version also
 * shipped a pure-canvas fallback — grayscale, blur, Otsu threshold, morphology,
 * largest contour, convex hull, quad fit — selectable from the preview dialog.
 * It was removed on request: the DDN engine detects better, and two code paths
 * meant two sets of coordinates to keep honest.)
 *
 * After detection, a perspective transform is applied via a computed
 * homography. The engine needs a Dynamsoft license, shared with DDV.
 *
 * Flow:
 *   1. Grab the current DDV page as a PNG Blob.
 *   2. Run detection to find the document quad.
 *   3. Show a preview dialog with the result. The user drags the four quad
 *      corners to adjust the boundary, then re-normalizes.
 *   4. On confirm, the normalized image replaces the original page via
 *      DDV's doc.updatePage().
 */

import {
  EnumCapturedResultItemType,
  DetectedQuadResultItem,
} from "dynamsoft-capture-vision-bundle";

import { capturePage } from "./cv";
import { EditViewerHandle } from "./ddv";
import { showToast, setBusy } from "./toolbar";

/**
 * A document boundary, in the coordinates of the page that was captured. One
 * corner per side, which is all the preview dialog lets the user drag.
 */
interface Quad {
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  br: { x: number; y: number };
  bl: { x: number; y: number };
}

/* ------------------------------------------------------------------ */
/*  Public entry point                                                 */
/* ------------------------------------------------------------------ */

export async function detectDocumentBoundary(
  handle: EditViewerHandle
): Promise<void> {
  const doc = handle.getCurrentDoc();
  if (!doc) {
    showToast("Open a page first.", "error");
    return;
  }

  const pageIndex = handle.viewer.getCurrentPageIndex();
  if (pageIndex < 0) {
    showToast("No page selected.", "error");
    return;
  }

  setBusy(true, "Detecting document boundary…");

  let originalBlob: Blob;
  try {
    originalBlob = await doc.saveToPng(pageIndex);
  } catch (err: any) {
    setBusy(false);
    showToast(`Could not read the page: ${err?.message ?? err}`, "error");
    return;
  }

  const imgEl = await blobToImage(originalBlob);
  const imgWidth = imgEl.naturalWidth;
  const imgHeight = imgEl.naturalHeight;

  // Run the selected detection backend to find the boundary.
  let detectedQuad: Quad | null = null;
  try {
    detectedQuad = await detectQuadDCV(originalBlob);
  } catch (err: any) {
    // Non-fatal — fall back to manual mode.
    console.warn("Document detection failed:", err);
  }

  setBusy(false);

  if (!detectedQuad) {
    showToast("No document boundary was detected. Adjust manually.", "info");
    detectedQuad = {
      tl: { x: imgWidth * 0.1, y: imgHeight * 0.1 },
      tr: { x: imgWidth * 0.9, y: imgHeight * 0.1 },
      br: { x: imgWidth * 0.9, y: imgHeight * 0.9 },
      bl: { x: imgWidth * 0.1, y: imgHeight * 0.9 },
    };
  }

  // Open the preview dialog (starts in manual mode so the user can
  // verify/adjust the detected quad before normalizing).
  const confirmed = await showDetectPreview(
    originalBlob,
    imgWidth,
    imgHeight,
    detectedQuad
  );

  if (!confirmed) {
    showToast("Document detection cancelled.", "info");
    return;
  }

  // Replace the current page with the normalized image.
  setBusy(true, "Applying normalized document…");
  try {
    const pageUid = handle.viewer.indexToUid(pageIndex);
    const normalizedBlob = await dataUrlToBlob(confirmed);
    await doc.updatePage(pageUid, { fileData: normalizedBlob });
    showToast("Document normalized and replaced.", "success");
  } catch (err: any) {
    showToast(`Could not update the page: ${err?.message ?? err}`, "error");
  } finally {
    setBusy(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Backend 1 — Dynamsoft Capture Vision (DDN)                         */
/* ------------------------------------------------------------------ */

/** Capture Vision preset template that returns the document quadrilateral. */
const DETECT_TEMPLATE = "DetectDocumentBoundaries_Default" as const;

/**
 * Detects the document boundary with Dynamsoft Capture Vision's Document
 * Normalizer (DDN) engine using the `DetectDocumentBoundaries_Default`
 * preset template.
 *
 * Based on the official Dynamsoft `document-scanner-javascript` sample
 * (DocumentCorrectionView.setBoundaryAutomatically).
 *
 * Returns the quad in original image coordinates, or null if no boundary
 * is found.
 */
async function detectQuadDCV(blob: Blob): Promise<Quad | null> {
  const result = await capturePage(DETECT_TEMPLATE, blob);

  const detected = result.items.find(
    (item) => item.type === EnumCapturedResultItemType.CRIT_DETECTED_QUAD
  ) as DetectedQuadResultItem | undefined;

  const points = detected?.location?.points;
  if (!points || points.length < 4) return null;

  return orderQuadCorners(points.map((p) => ({ x: p.x, y: p.y })));
}

/**
 * Orders 4 points as: top-left, top-right, bottom-right, bottom-left.
 *
 * Uses centroid-angle winding (robust to arbitrary rotation) rather than
 * a naive Y/X sort, then picks the corner nearest the image origin as the
 * top-left and walks clockwise from there.
 */
function orderQuadCorners(
  pts: Array<{ x: number; y: number }>
): Quad | null {
  if (pts.length !== 4) return null;

  let cx = 0, cy = 0;
  for (const p of pts) { cx += p.x; cy += p.y; }
  cx /= 4;
  cy /= 4;

  // Sort clockwise around the centroid (canvas Y grows downward).
  const cw = [...pts].sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
  );

  // Rotate so the corner closest to the top-left (min x + y) comes first.
  let startIdx = 0;
  let bestSum = Infinity;
  for (let i = 0; i < 4; i++) {
    const sum = cw[i].x + cw[i].y;
    if (sum < bestSum) { bestSum = sum; startIdx = i; }
  }

  const tl = cw[startIdx];
  const tr = cw[(startIdx + 1) % 4];
  const br = cw[(startIdx + 2) % 4];
  const bl = cw[(startIdx + 3) % 4];

  return { tl, tr, br, bl };
}

/* ------------------------------------------------------------------ */
/*  Preview dialog with manual quad editing                           */
/* ------------------------------------------------------------------ */

/**
 * Shows the detection preview dialog. Returns a data URL of the final
 * normalized image if the user confirms, or null if they cancel.
 */
function showDetectPreview(
  originalBlob: Blob,
  imgWidth: number,
  imgHeight: number,
  detectedQuad: Quad
): Promise<string | null> {
  const dialog = document.getElementById("detect-dialog") as HTMLDialogElement;
  const canvas = document.getElementById("detect-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const btnManual = document.getElementById("btn-detect-manual") as HTMLButtonElement;
  const btnConfirm = document.getElementById("btn-detect-confirm") as HTMLButtonElement;
  const btnClose = document.getElementById("btn-detect-close") as HTMLButtonElement;
  const statusEl = document.getElementById("detect-status")!;

  let quad: Quad = { ...detectedQuad };
  let manualMode = true; // Start in manual mode so the user can verify/adjust.
  let draggingPoint: keyof Quad | null = null;

  return new Promise<string | null>((resolve) => {
    let resolved = false;

    function finish(result: string | null) {
      if (resolved) return;
      resolved = true;
      if (dialog.open) dialog.close();
      cleanup();
      resolve(result);
    }

    function cleanup() {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);
      btnManual.onclick = null;
      btnConfirm.onclick = null;
      btnClose.onclick = null;
      dialog.oncancel = null;
    }

    blobToImage(originalBlob).then((img) => {
      // Scale canvas to fit dialog while keeping aspect ratio.
      const maxW = 720;
      const maxH = 460;
      const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1);
      canvas.width = imgWidth * scale;
      canvas.height = imgHeight * scale;
      (canvas as any)._scale = scale;
      (canvas as any)._img = img;

      drawPreview();
      updateStatus();
      showCanvasView();
    });

    function drawPreview() {
      const scale = (canvas as any)._scale as number;
      const img = (canvas as any)._img as HTMLImageElement;
      if (!img) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (manualMode) {
        // Draw quad overlay
        const s = (p: { x: number; y: number }) => ({
          x: p.x * scale,
          y: p.y * scale,
        });
        const pts = [s(quad.tl), s(quad.tr), s(quad.br), s(quad.bl)];

        ctx.strokeStyle = "#fe8e14";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        ctx.stroke();

        // Dim outside region
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 3; i >= 0; i--) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        ctx.fill("evenodd");

        // Draw draggable handles
        for (const p of pts) {
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = "#fe8e14";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    function getCanvasPos(e: PointerEvent): { x: number; y: number } {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    }

    function quadPointsScaled(): Array<{ key: keyof Quad; x: number; y: number }> {
      const scale = (canvas as any)._scale as number;
      return (["tl", "tr", "br", "bl"] as const).map((key) => ({
        key,
        x: quad[key].x * scale,
        y: quad[key].y * scale,
      }));
    }

    function onPointerDown(e: PointerEvent) {
      if (!manualMode) return;
      const pos = getCanvasPos(e);
      const pts = quadPointsScaled();
      for (const p of pts) {
        if (Math.hypot(pos.x - p.x, pos.y - p.y) < 16) {
          draggingPoint = p.key;
          canvas.setPointerCapture(e.pointerId);
          return;
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      if (!manualMode || !draggingPoint) return;
      const pos = getCanvasPos(e);
      const scale = (canvas as any)._scale as number;
      quad[draggingPoint] = {
        x: Math.max(0, Math.min(imgWidth, pos.x / scale)),
        y: Math.max(0, Math.min(imgHeight, pos.y / scale)),
      };
      drawPreview();
      updateStatus();
    }

    function onPointerUp(e: PointerEvent) {
      if (draggingPoint) {
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        draggingPoint = null;
      }
    }

    function updateStatus() {
      statusEl.textContent = manualMode
        ? "Detected with Dynamsoft Capture Vision. Drag the corners to adjust, then confirm."
        : "Ready.";
    }

    function showCanvasView() {
      canvas.style.display = "block";
      const normImg = document.getElementById("detect-normalized") as HTMLImageElement;
      normImg.style.display = "none";
    }

    function showNormalizedPreview(dataUrl: string) {
      const normImg = document.getElementById("detect-normalized") as HTMLImageElement;
      normImg.src = dataUrl;
      normImg.style.display = "block";
      canvas.style.display = "none";
    }

    btnManual.onclick = async () => {
      if (!manualMode) {
        manualMode = true;
        showCanvasView();
        drawPreview();
        updateStatus();
        btnManual.textContent = "Manual Edit";
      } else {
        // Normalize and show preview
        manualMode = false;
        setBusy(true, "Normalizing…");
        try {
          const result = await normalizeWithQuad(originalBlob, quad);
          if (result) {
            showNormalizedPreview(result);
          } else {
            showCanvasView();
            manualMode = true;
          }
        } catch (err: any) {
          showToast(`Normalization failed: ${err?.message ?? err}`, "error");
          showCanvasView();
          manualMode = true;
        }
        setBusy(false);
        drawPreview();
        updateStatus();
        btnManual.textContent = "Edit";
      }
    };

    btnConfirm.onclick = () => {
      (async () => {
        setBusy(true, "Normalizing…");
        try {
          const result = await normalizeWithQuad(originalBlob, quad);
          if (result) {
            finish(result);
          } else {
            showToast("Could not normalize the document.", "error");
          }
        } catch (err: any) {
          showToast(`Normalization failed: ${err?.message ?? err}`, "error");
        } finally {
          setBusy(false);
        }
      })();
    };

    btnClose.onclick = () => finish(null);
    dialog.oncancel = () => finish(null);


    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    dialog.showModal();
  });
}

/* ------------------------------------------------------------------ */
/*  Perspective transform (homography)                                */
/* ------------------------------------------------------------------ */

/**
 * Normalizes the document using the provided quad by computing a
 * homography matrix and applying a perspective transform via canvas
 * image data. Runs entirely client-side — no external SDK needed.
 */
async function normalizeWithQuad(
  sourceBlob: Blob,
  quad: Quad
): Promise<string | null> {
  const img = await blobToImage(sourceBlob);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  // Compute output dimensions from the quad edges.
  const wTop = Math.hypot(quad.tr.x - quad.tl.x, quad.tr.y - quad.tl.y);
  const wBottom = Math.hypot(quad.br.x - quad.bl.x, quad.br.y - quad.bl.y);
  const hLeft = Math.hypot(quad.bl.x - quad.tl.x, quad.bl.y - quad.tl.y);
  const hRight = Math.hypot(quad.br.x - quad.tr.x, quad.br.y - quad.tr.y);
  const outW = Math.round(Math.max(wTop, wBottom));
  const outH = Math.round(Math.max(hLeft, hRight));

  if (outW < 10 || outH < 10) return null;

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, outW, outH);

  // Map quad corners to rectangle corners: (0,0),(outW,0),(outW,outH),(0,outH)
  const src = [quad.tl, quad.tr, quad.br, quad.bl];
  const dst = [
    { x: 0, y: 0 },
    { x: outW, y: 0 },
    { x: outW, y: outH },
    { x: 0, y: outH },
  ];

  const homo = computeHomography(src, dst);
  if (!homo) return null;

  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = srcW;
  srcCanvas.height = srcH;
  const srcCtx = srcCanvas.getContext("2d", { willReadFrequently: true })!;
  srcCtx.drawImage(img, 0, 0);
  const srcData = srcCtx.getImageData(0, 0, srcW, srcH);
  const outData = ctx.createImageData(outW, outH);

  const [h0, h1, h2, h3, h4, h5, h6, h7] = homo;
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      // Inverse mapping: output (x,y) → source (sx,sy)
      const denom = h6 * x + h7 * y + 1;
      if (Math.abs(denom) < 1e-10) continue;
      const sx = Math.round((h0 * x + h1 * y + h2) / denom);
      const sy = Math.round((h3 * x + h4 * y + h5) / denom);
      if (sx < 0 || sx >= srcW || sy < 0 || sy >= srcH) continue;

      const srcIdx = (sy * srcW + sx) * 4;
      const dstIdx = (y * outW + x) * 4;
      outData.data[dstIdx] = srcData.data[srcIdx];
      outData.data[dstIdx + 1] = srcData.data[srcIdx + 1];
      outData.data[dstIdx + 2] = srcData.data[srcIdx + 2];
      outData.data[dstIdx + 3] = 255;
    }
  }

  ctx.putImageData(outData, 0, 0);
  return canvas.toDataURL("image/png");
}

/**
 * Compute the homography matrix that maps src points to dst points.
 * Returns 8 coefficients [h0..h7] for the 3×3 matrix (h8 = 1).
 */
function computeHomography(
  src: Array<{ x: number; y: number }>,
  dst: Array<{ x: number; y: number }>
): number[] | null {
  const A: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const sx = src[i].x;
    const sy = src[i].y;
    const dx = dst[i].x;
    const dy = dst[i].y;

    A.push([dx, dy, 1, 0, 0, 0, -sx * dx, -sx * dy]);
    b.push(sx);
    A.push([0, 0, 0, dx, dy, 1, -sy * dx, -sy * dy]);
    b.push(sy);
  }

  return solveLinearSystem(A, b);
}

/** Solves A·x = b using Gaussian elimination with partial pivoting. */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const aug = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) maxRow = r;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    if (Math.abs(aug[col][col]) < 1e-12) return null;

    for (let r = col + 1; r < n; r++) {
      const factor = aug[r][col] / aug[col][col];
      for (let c = col; c <= n; c++) {
        aug[r][c] -= factor * aug[col][c];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = aug[r][n];
    for (let c = r + 1; c < n; c++) sum -= aug[r][c] * x[c];
    x[r] = sum / aug[r][r];
  }
  return x;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image."));
    };
    img.src = url;
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}
