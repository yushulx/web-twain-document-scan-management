/**
 * document-detect.ts — Document boundary detection & perspective correction.
 *
 * Two interchangeable detection backends are available so their results can
 * be compared from the preview dialog:
 *   - "dcv": Dynamsoft Capture Vision's Document Normalizer (DDN) engine via
 *            the `DetectDocumentBoundaries_Default` preset template.
 *   - "custom": a pure-canvas pipeline (grayscale → blur → Otsu threshold →
 *            morphology → largest contour → convex hull → quad fit).
 *
 * After detection, a perspective transform is applied via a computed
 * homography. The DCV backend requires a Dynamsoft license (shared with DDV);
 * the custom backend needs no SDK or license.
 *
 * Flow:
 *   1. Grab the current DDV page as a PNG Blob.
 *   2. Run the selected detection backend to find the document quad.
 *   3. Show a preview dialog with the auto-detected result. The user can
 *      switch backends to compare, drag the four quad corners to adjust the
 *      boundary, then re-normalize.
 *   4. On confirm, the normalized image replaces the original page via
 *      DDV's doc.updatePage().
 */

import {
  CoreModule,
  LicenseManager,
  CaptureVisionRouter,
  EnumCapturedResultItemType,
  DetectedQuadResultItem,
} from "dynamsoft-capture-vision-bundle";

import { EditViewerHandle } from "./ddv";
import { showToast, setBusy } from "./toolbar";

/** Available document-detection backends. */
export type DetectAlgorithm = "dcv" | "custom";

/** The backend used for the next detection run (toggled from the dialog). */
let currentAlgorithm: DetectAlgorithm = "dcv";

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
    detectedQuad = await runDetection(currentAlgorithm, originalBlob, imgEl);
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
/*  Detection dispatcher                                                */
/* ------------------------------------------------------------------ */

interface Quad {
  tl: { x: number; y: number };
  tr: { x: number; y: number };
  br: { x: number; y: number };
  bl: { x: number; y: number };
}

/**
 * Runs the requested detection backend and returns the quad in original
 * image coordinates, or null if no boundary was found.
 */
async function runDetection(
  algo: DetectAlgorithm,
  blob: Blob,
  img: HTMLImageElement
): Promise<Quad | null> {
  return algo === "dcv" ? detectQuadDCV(blob) : detectQuadCustom(img);
}

/* ------------------------------------------------------------------ */
/*  Backend 1 — Dynamsoft Capture Vision (DDN)                         */
/* ------------------------------------------------------------------ */

/** Capture Vision preset template that returns the document quadrilateral. */
const DETECT_TEMPLATE = "DetectDocumentBoundaries_Default";

/** Lazily-created CaptureVisionRouter, configured for full-resolution detection. */
let routerPromise: Promise<CaptureVisionRouter> | null = null;
let licenseInitialized = false;

/**
 * Initializes the Dynamsoft Capture Vision license used by the document
 * detector. Call once at startup with the same license key as DDV.
 *
 * The engine's wasm/worker assets are loaded from the jsDelivr CDN. This
 * must be set explicitly: when the SDK is bundled (e.g. by Vite) it cannot
 * infer its own script URL, so without a `rootDirectory` it would request
 * the assets from the app's own origin and receive `index.html` back —
 * surfacing as "Unexpected token '<'".
 */
export async function initDocumentDetector(license: string): Promise<void> {
  if (licenseInitialized) return;
  CoreModule.engineResourcePaths.rootDirectory = "https://cdn.jsdelivr.net/npm/";
  await LicenseManager.initLicense(license);
  licenseInitialized = true;
}

/**
 * Returns the shared CaptureVisionRouter, creating it on first use. The
 * router is configured to process the image at full resolution so the
 * detected quad maps directly onto the original page coordinates.
 */
async function getRouter(): Promise<CaptureVisionRouter> {
  if (!routerPromise) {
    routerPromise = (async () => {
      const router = await CaptureVisionRouter.createInstance();
      router.maxImageSideLength = Infinity;
      const settings = await router.getSimplifiedSettings(DETECT_TEMPLATE);
      settings.outputOriginalImage = true;
      await router.updateSettings(DETECT_TEMPLATE, settings);
      return router;
    })();
  }
  return routerPromise;
}

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
  const router = await getRouter();
  const result = await router.capture(blob, DETECT_TEMPLATE);

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
/*  Backend 2 — pure-canvas edge detection (no external SDK)           */
/* ------------------------------------------------------------------ */

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
function detectQuadCustom(img: HTMLImageElement): Quad | null {
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
  //    The document may be darker OR lighter than its background, and a
  //    single border-brightness heuristic is unreliable for low-contrast
  //    scenes (e.g. an ID card on a wooden table). Instead we segment with
  //    BOTH polarities and keep whichever yields the more document-like
  //    (large, rectangular, reasonably centered) region.
  const threshold = otsuThreshold(blurred);
  const borderBrightness = medianBorderBrightness(blurred, w, h);
  // Try the most likely polarity first, then the opposite as a fallback.
  const preferDark = borderBrightness > threshold;
  const polarities = preferDark ? [true, false] : [false, true];

  let best: { quad: Quad; score: number } | null = null;

  for (const docIsDark of polarities) {
    const binary = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      binary[i] = (docIsDark ? blurred[i] < threshold : blurred[i] > threshold) ? 1 : 0;
    }

    // 4. Morphological closing (dilate then erode) to fill gaps
    const closed = morphologicalClose(binary, w, h, 3);

    // 5. Find the largest connected component
    const componentMask = new Uint8Array(w * h);
    const boundaryPoints = findLargestComponent(closed, w, h, componentMask);
    if (!boundaryPoints || boundaryPoints.length < 20) continue;

    // 6. Convex hull of the boundary points
    const hull = convexHull(boundaryPoints);
    if (hull.length < 4) continue;

    // 7. Fit a quadrilateral that is robust to rotation (orientation-aware).
    const fit = fitBestQuad(hull, w, h);
    if (!fit) continue;

    const ordered = orderQuadCorners(fit.quad);
    if (!ordered) continue;

    if (!best || fit.score > best.score) {
      best = { quad: ordered, score: fit.score };
    }
  }

  if (!best) return null;
  return scaleQuad(best.quad, 1 / scale);
}

type Pt = { x: number; y: number };

/**
 * Fits the best quadrilateral to a convex hull and scores how
 * document-like it is. Returns the 4 corner points plus a score that
 * combines rectangularity and how much of the frame the quad fills.
 *
 * The key robustness improvement over a naive "axis-aligned extreme
 * point" fit is that corners are found in the hull's OWN orientation
 * (derived from its minimum-area rectangle), so rotated cards no longer
 * collapse into degenerate triangles.
 */
function fitBestQuad(
  hull: Pt[],
  w: number,
  h: number
): { quad: Pt[]; score: number } | null {
  if (hull.length < 4) return null;

  const hullArea = polygonArea(hull);
  if (hullArea < (w * h) * 0.02) return null; // too small to be a document

  const rect = minAreaRect(hull);
  if (!rect) return null;

  // Candidate quads:
  //  a) Perspective-aware corners in the hull's orientation (best for
  //     trapezoidal documents shot at an angle).
  //  b) The minimum-area rectangle itself (best for clean rectangles and
  //     a safe fallback when the perspective fit is degenerate).
  //  c) RDP polygon simplification (occasionally tighter on clean hulls).
  const candidates: Pt[][] = [];
  const oriented = fitQuadOriented(hull, rect.angle);
  if (oriented) candidates.push(oriented);
  candidates.push(rect.corners);
  const rdpQuad = simplifyToQuad(hull);
  if (rdpQuad && rdpQuad.length === 4) candidates.push(rdpQuad);

  // Rectangularity of the underlying region: clean documents fill most of
  // their minimum-area rectangle (~1.0); irregular "background" blobs do
  // not. This is the main signal that distinguishes the correct polarity.
  const rectangularity = hullArea / Math.max(rect.area, 1e-6);

  // Fraction of the frame covered. A real document is surrounded by
  // background, so it essentially never fills more than ~90% of the
  // photo. Rejecting high coverage here is what discards the spurious
  // "whole frame" blob that the inverse polarity tends to produce
  // (validated against real document/ID-card photos).
  const coverage = hullArea / (w * h);
  if (coverage < 0.04 || coverage > 0.9) return null;

  let bestQuad: Pt[] | null = null;
  let bestQuadArea = 0;
  for (const c of candidates) {
    if (c.length !== 4 || !isConvexQuad(c)) continue;
    const a = polygonArea(c);
    // Prefer the candidate whose area is closest to the hull area (tight
    // fit) — penalize both under- and over-shoot.
    const ratio = a / hullArea;
    const fit = ratio <= 1 ? ratio : 1 / ratio;
    if (fit > bestQuadArea) {
      bestQuadArea = fit;
      bestQuad = c;
    }
  }
  if (!bestQuad || bestQuadArea < 0.6) return null;

  // Final score: reward rectangular, well-fitting, reasonably sized quads.
  const score = rectangularity * bestQuadArea * Math.min(coverage * 4, 1);
  return { quad: bestQuad, score };
}

/** Shoelace polygon area (absolute value). */
function polygonArea(pts: Pt[]): number {
  let area = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) / 2;
}

/** True if the 4 points form a convex (non-self-intersecting) quad. */
function isConvexQuad(q: Pt[]): boolean {
  if (q.length !== 4) return false;
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i];
    const b = q[(i + 1) % 4];
    const c = q[(i + 2) % 4];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(cross) < 1e-6) continue;
    const s = cross > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return sign !== 0;
}

/**
 * Minimum-area enclosing rectangle of a convex hull via rotating
 * calipers. Returns the 4 corners (in original coordinates), the edge
 * orientation angle, and the rectangle area.
 */
function minAreaRect(hull: Pt[]): { corners: Pt[]; angle: number; area: number } | null {
  if (hull.length < 3) return null;

  let minArea = Infinity;
  let best: { corners: Pt[]; angle: number; area: number } | null = null;
  const n = hull.length;

  for (let i = 0; i < n; i++) {
    const p1 = hull[i];
    const p2 = hull[(i + 1) % n];
    const edgeAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const c = Math.cos(edgeAngle);
    const s = Math.sin(edgeAngle);

    // Rotate every hull point by -edgeAngle (rx = x·c + y·s, ry = -x·s + y·c).
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of hull) {
      const rx = p.x * c + p.y * s;
      const ry = -p.x * s + p.y * c;
      if (rx < minX) minX = rx;
      if (rx > maxX) maxX = rx;
      if (ry < minY) minY = ry;
      if (ry > maxY) maxY = ry;
    }

    const area = (maxX - minX) * (maxY - minY);
    if (area < minArea) {
      minArea = area;
      // Corners in rotated frame, then rotate back by +edgeAngle
      // (ox = rx·c - ry·s, oy = rx·s + ry·c).
      const rotated: Pt[] = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY },
      ];
      const corners = rotated.map((p) => ({
        x: p.x * c - p.y * s,
        y: p.x * s + p.y * c,
      }));
      best = { corners, angle: edgeAngle, area };
    }
  }
  return best;
}

/**
 * Finds the four corner points of the hull in the frame defined by
 * `angle` (the document's own orientation). Working in the rotated frame
 * makes the diagonal-extreme corner search valid for rotated documents,
 * while still returning the real hull points so perspective is preserved.
 */
function fitQuadOriented(hull: Pt[], angle: number): Pt[] | null {
  const c = Math.cos(angle);
  const s = Math.sin(angle);

  let tl: Pt | null = null, tr: Pt | null = null, br: Pt | null = null, bl: Pt | null = null;
  let tlS = Infinity, trS = Infinity, brS = Infinity, blS = Infinity;

  for (const p of hull) {
    const rx = p.x * c + p.y * s;
    const ry = -p.x * s + p.y * c;
    if (rx + ry < tlS) { tlS = rx + ry; tl = p; }
    if (-rx + ry < trS) { trS = -rx + ry; tr = p; }
    if (-rx - ry < brS) { brS = -rx - ry; br = p; }
    if (rx - ry < blS) { blS = rx - ry; bl = p; }
  }

  if (!tl || !tr || !br || !bl) return null;
  return [tl, tr, br, bl];
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

      // Flood fill (BFS). Use a head pointer instead of Array.shift()
      // so the traversal stays O(n) even for large components (the
      // opposite-polarity pass can flood the whole background).
      const queue = [idx];
      let head = 0;
      const component: number[] = [];
      visited[idx] = 1;

      while (head < queue.length) {
        const cur = queue[head++];
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

/** Scales every corner of a quad by a uniform factor. */
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
  const algoToggle = document.getElementById("detect-algo")!;
  const algoButtons = Array.from(
    algoToggle.querySelectorAll<HTMLButtonElement>(".detect-algo-btn")
  );

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
      for (const b of algoButtons) b.removeEventListener("click", onAlgoClick);
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

    function syncAlgoButtons() {
      for (const b of algoButtons) {
        b.classList.toggle("is-active", b.dataset.algo === currentAlgorithm);
      }
    }

    async function onAlgoClick(e: Event) {
      const algo = (e.currentTarget as HTMLButtonElement).dataset.algo as DetectAlgorithm;
      if (!algo || algo === currentAlgorithm) return;
      currentAlgorithm = algo;
      syncAlgoButtons();

      const img = (canvas as any)._img as HTMLImageElement | undefined;
      if (!img) return;

      // Re-run detection with the chosen backend so the two can be
      // compared in place on the same page.
      manualMode = true;
      btnManual.textContent = "Manual Edit";
      showCanvasView();
      setBusy(true, "Detecting document boundary…");
      let result: Quad | null = null;
      try {
        result = await runDetection(algo, originalBlob, img);
      } catch (err: any) {
        console.warn("Document detection failed:", err);
      }
      setBusy(false);

      if (result) {
        quad = result;
        statusEl.textContent =
          algo === "dcv"
            ? "Detected with Dynamsoft Capture Vision. Drag the corners to adjust, then confirm."
            : "Detected with the built-in algorithm. Drag the corners to adjust, then confirm.";
      } else {
        showToast("No boundary detected with this algorithm. Adjust manually.", "info");
      }
      drawPreview();
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

    for (const b of algoButtons) b.addEventListener("click", onAlgoClick);
    syncAlgoButtons();

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
