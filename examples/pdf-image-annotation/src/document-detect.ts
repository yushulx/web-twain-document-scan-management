/**
 * document-detect.ts — Document edge detection & perspective correction.
 *
 * Uses a pure-canvas edge detection algorithm (grayscale → Sobel →
 * threshold → largest contour → convex hull → quadrilateral fit) to
 * locate the document boundary, then applies a perspective transform
 * via a computed homography. No external SDK or license required.
 *
 * Flow:
 *   1. Grab the current DDV page as a PNG Blob.
 *   2. Downscale and run edge detection to find the document quad.
 *   3. Show a preview dialog with the auto-detected result.
 *   4. If the user is not satisfied, they can drag the four quad corners
 *      on a canvas overlay to manually adjust the boundary, then re-normalize.
 *   5. On confirm, the normalized image replaces the original page via
 *      DDV's doc.updatePage().
 */

import { EditViewerHandle } from "./ddv";
import { showToast, setBusy } from "./toolbar";

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

  // Run edge detection to find the document boundary.
  let detectedQuad: Quad | null = null;
  try {
    detectedQuad = detectDocumentQuad(imgEl);
  } catch (err: any) {
    // Non-fatal — fall back to manual mode.
    console.warn("Edge detection failed:", err);
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
/*  Edge detection — pure canvas, no external SDK                     */
/* ------------------------------------------------------------------ */

interface Quad {
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  br: { x: number; y: number };
  bl: { x: number; y: number };
}

/**
 * Detects the document boundary by:
 *   1. Downscaling the image for performance.
 *   2. Converting to grayscale.
 *   3. Applying Gaussian blur to reduce noise.
 *   4. Otsu thresholding to separate document from background.
 *   5. Morphological closing to fill gaps in the binary mask.
 *   6. Finding the largest connected component (the document).
 *   7. Computing the convex hull of its boundary.
 *   8. Simplifying the hull to a quadrilateral via polygon approximation.
 *
 * This approach works well for typical document photos where the
 * document has a distinct brightness contrast against its background.
 *
 * Returns the quad in original image coordinates, or null if no
 * suitable boundary is found.
 */
function detectDocumentQuad(img: HTMLImageElement): Quad | null {
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  // Downscale for performance (max 500px on the long side).
  const maxDim = 500;
  const scale = Math.min(maxDim / origW, maxDim / origH, 1);
  const w = Math.max(1, Math.round(origW * scale));
  const h = Math.max(1, Math.round(origH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  // 1. Grayscale
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = imageData.data[i * 4];
    const g = imageData.data[i * 4 + 1];
    const b = imageData.data[i * 4 + 2];
    gray[i] = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
  }

  // 2. Gaussian blur (3x3) to reduce noise
  const blurred = gaussianBlur(gray, w, h);

  // 3. Otsu threshold — separates foreground (document) from background.
  //    We determine whether the document is darker or lighter than the
  //    background by checking which side has more border pixels.
  const threshold = otsuThreshold(blurred);
  const borderBrightness = medianBorderBrightness(blurred, w, h);
  // If the border is bright, the document is the dark region; if the
  // border is dark, the document is the bright region.
  const docIsDark = borderBrightness > threshold;
  const binary = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (docIsDark) {
      binary[i] = blurred[i] < threshold ? 1 : 0;
    } else {
      binary[i] = blurred[i] > threshold ? 1 : 0;
    }
  }

  // 4. Morphological closing (dilate then erode) to fill gaps
  const closed = morphologicalClose(binary, w, h, 3);

  // 5. Find the largest connected component
  const componentMask = new Uint8Array(w * h);
  const boundaryPoints = findLargestComponent(closed, w, h, componentMask);
  if (!boundaryPoints || boundaryPoints.length < 20) return null;

  // 6. Compute convex hull of the boundary points
  const hull = convexHull(boundaryPoints);
  if (hull.length < 4) return null;

  // 7. Simplify hull to a quadrilateral using the Ramer-Douglas-Peucker
  //    algorithm with increasing epsilon until we get 4 corners.
  const quadPoints = simplifyToQuad(hull);
  if (!quadPoints || quadPoints.length !== 4) {
    // Fallback: fit quad from extreme points
    const fallback = fitQuadrilateralFromExtremes(hull);
    if (!fallback) return null;
    return scaleQuad(fallback, 1 / scale);
  }

  // Order the 4 points as tl, tr, br, bl
  const ordered = orderQuadCorners(quadPoints);
  if (!ordered) return null;

  return scaleQuad(ordered, 1 / scale);
}

/** 3x3 Gaussian blur. */
function gaussianBlur(data: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
  const kernelSum = 16;
  const result = new Uint8ClampedArray(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let ki = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = Math.max(0, Math.min(h - 1, y + dy));
          const nx = Math.max(0, Math.min(w - 1, x + dx));
          sum += data[ny * w + nx] * kernel[ki++];
        }
      }
      result[y * w + x] = (sum / kernelSum) | 0;
    }
  }
  return result;
}

/** Otsu's method — finds the optimal threshold that minimizes intra-class variance. */
function otsuThreshold(data: Uint8ClampedArray): number {
  const histogram = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) histogram[data[i]]++;

  const total = data.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * histogram[i];

  let sumB = 0;
  let wB = 0;
  let maxVariance = 0;
  let threshold = 127;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const variance = wB * wF * (mB - mF) * (mB - mF);

    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }
  return threshold;
}

/** Median brightness of the image border (used to determine background brightness). */
function medianBorderBrightness(data: Uint8ClampedArray, w: number, h: number): number {
  const border: number[] = [];
  for (let x = 0; x < w; x++) {
    border.push(data[x]); // top
    border.push(data[(h - 1) * w + x]); // bottom
  }
  for (let y = 0; y < h; y++) {
    border.push(data[y * w]); // left
    border.push(data[y * w + w - 1]); // right
  }
  border.sort((a, b) => a - b);
  return border[Math.floor(border.length / 2)];
}

/** Morphological closing: dilate then erode with a structuring element of given radius. */
function morphologicalClose(binary: Uint8Array, w: number, h: number, radius: number): Uint8Array {
  const dilated = dilate(binary, w, h, radius);
  return erode(dilated, w, h, radius);
}

function dilate(binary: Uint8Array, w: number, h: number, radius: number): Uint8Array {
  const result = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let val = 0;
      for (let dy = -radius; dy <= radius && !val; dy++) {
        for (let dx = -radius; dx <= radius && !val; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w && binary[ny * w + nx]) {
            val = 1;
          }
        }
      }
      result[y * w + x] = val;
    }
  }
  return result;
}

function erode(binary: Uint8Array, w: number, h: number, radius: number): Uint8Array {
  const result = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let val = 1;
      for (let dy = -radius; dy <= radius && val; dy++) {
        for (let dx = -radius; dx <= radius && val; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny < 0 || ny >= h || nx < 0 || nx >= w || !binary[ny * w + nx]) {
            val = 0;
          }
        }
      }
      result[y * w + x] = val;
    }
  }
  return result;
}

/**
 * Finds the largest connected component in the binary image and returns
 * its boundary points (the set of foreground pixels adjacent to background).
 */
function findLargestComponent(
  binary: Uint8Array,
  w: number,
  h: number,
  mask: Uint8Array
): Array<{ x: number; y: number }> | null {
  const visited = new Uint8Array(w * h);
  let bestComponent: number[] | null = null;
  let bestArea = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (visited[idx] || !binary[idx]) continue;

      // Flood fill (BFS)
      const queue = [idx];
      const component: number[] = [];
      visited[idx] = 1;

      while (queue.length > 0) {
        const cur = queue.shift()!;
        component.push(cur);
        const cx = cur % w;
        const cy = (cur / w) | 0;

        const neighbors = [
          cx > 0 ? cur - 1 : -1,
          cx < w - 1 ? cur + 1 : -1,
          cy > 0 ? cur - w : -1,
          cy < h - 1 ? cur + w : -1,
        ];
        for (const n of neighbors) {
          if (n >= 0 && !visited[n] && binary[n]) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }

      if (component.length > bestArea) {
        bestArea = component.length;
        bestComponent = component;
      }
    }
  }

  if (!bestComponent || bestComponent.length < 20) return null;

  // Mark the mask and extract boundary points (foreground pixels that
  // have at least one background neighbor).
  for (const c of bestComponent) mask[c] = 1;

  const boundary: Array<{ x: number; y: number }> = [];
  for (const c of bestComponent) {
    const cx = c % w;
    const cy = (c / w) | 0;
    const isBoundary =
      (cx === 0 || cx === w - 1 || cy === 0 || cy === h - 1) ||
      !mask[c - 1] || !mask[c + 1] || !mask[c - w] || !mask[c + w];
    if (isBoundary) {
      boundary.push({ x: cx, y: cy });
    }
  }

  return boundary.length >= 4 ? boundary : null;
}

/**
 * Andrew's monotone chain convex hull algorithm.
 * Returns hull points in counter-clockwise order.
 */
function convexHull(points: Array<{ x: number; y: number }>): Array<{ x: number; y: number }> {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length < 3) return pts;

  const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Array<{ x: number; y: number }> = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Array<{ x: number; y: number }> = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

/**
 * Simplifies a polygon using the Ramer-Douglas-Peucker algorithm.
 * Increases epsilon until the result has exactly 4 points.
 */
function simplifyToQuad(
  hull: Array<{ x: number; y: number }>
): Array<{ x: number; y: number }> | null {
  // Start with a small epsilon and increase until we get 4 points.
  // The hull is a closed polygon, so we treat it as such.
  let epsilon = 1;
  const maxEpsilon = Math.max(
    Math.hypot(hull[0].x - hull[Math.floor(hull.length / 2)].x,
               hull[0].y - hull[Math.floor(hull.length / 2)].y)
  );

  while (epsilon < maxEpsilon) {
    const simplified = rdp(hull, epsilon);
    if (simplified.length <= 4) {
      return simplified.length === 4 ? simplified : null;
    }
    epsilon *= 1.3;
  }

  // If we still have more than 4, take the 4 most extreme corners.
  return hull.length === 4 ? hull : null;
}

/** Ramer-Douglas-Peucker polygon simplification. */
function rdp(
  points: Array<{ x: number; y: number }>,
  epsilon: number
): Array<{ x: number; y: number }> {
  if (points.length <= 2) return points;

  // Find the point with the maximum distance from the line connecting
  // the first and last points.
  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      maxIdx = i;
    }
  }

  if (maxDist > epsilon) {
    // Recursively simplify both halves
    const left = rdp(points.slice(0, maxIdx + 1), epsilon);
    const right = rdp(points.slice(maxIdx), epsilon);
    return [...left.slice(0, -1), ...right];
  } else {
    return [first, last];
  }
}

/** Perpendicular distance from point p to the line segment (a, b). */
function perpDistance(
  p: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy);
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Orders 4 points as: top-left, top-right, bottom-right, bottom-left.
 */
function orderQuadCorners(
  pts: Array<{ x: number; y: number }>
): Quad | null {
  if (pts.length !== 4) return null;

  // Sort by Y (top to bottom), then take top 2 and bottom 2.
  const sorted = [...pts].sort((a, b) => a.y - b.y);
  const top = sorted.slice(0, 2).sort((a, b) => a.x - b.x);
  const bottom = sorted.slice(2).sort((a, b) => a.x - b.x);

  return {
    tl: top[0],
    tr: top[1],
    br: bottom[1],
    bl: bottom[0],
  };
}

/** Fallback: find 4 extreme points relative to centroid. */
function fitQuadrilateralFromExtremes(
  hull: Array<{ x: number; y: number }>
): Quad | null {
  if (hull.length < 4) return null;

  let cx = 0, cy = 0;
  for (const p of hull) { cx += p.x; cy += p.y; }
  cx /= hull.length;
  cy /= hull.length;

  let tl = hull[0], tr = hull[0], br = hull[0], bl = hull[0];
  let tlScore = Infinity, trScore = Infinity, brScore = Infinity, blScore = Infinity;

  for (const p of hull) {
    const dx = p.x - cx;
    const dy = p.y - cy;

    const sTL = dx + dy;
    if (sTL < tlScore) { tlScore = sTL; tl = p; }
    const sTR = -dx + dy;
    if (sTR < trScore) { trScore = sTR; tr = p; }
    const sBR = -dx - dy;
    if (sBR < brScore) { brScore = sBR; br = p; }
    const sBL = dx - dy;
    if (sBL < blScore) { blScore = sBL; bl = p; }
  }

  return { tl, tr, br, bl };
}

function scaleQuad(quad: Quad, factor: number): Quad {
  return {
    tl: { x: quad.tl.x * factor, y: quad.tl.y * factor },
    tr: { x: quad.tr.x * factor, y: quad.tr.y * factor },
    br: { x: quad.br.x * factor, y: quad.br.y * factor },
    bl: { x: quad.bl.x * factor, y: quad.bl.y * factor },
  };
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

        ctx.strokeStyle = "#2563eb";
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
          ctx.strokeStyle = "#2563eb";
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
      if (manualMode) {
        statusEl.textContent = "Drag the corners to adjust the boundary, then confirm.";
      } else {
        statusEl.textContent = "Ready.";
      }
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
