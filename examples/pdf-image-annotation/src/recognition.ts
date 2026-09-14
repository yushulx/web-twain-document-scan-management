/**
 * recognition.ts — the two "read what is on this page" actions behind Detect.
 *
 *   • detectBarcodes() — Capture Vision's `ReadBarcodes_ReadRateFirst` preset.
 *   • readMrz()        — Capture Vision's `ReadMRZ` template (see
 *                        mrz-settings.ts) plus the MRTD code-parser items the
 *                        template emits alongside the recognised text lines.
 *
 * Both share one pipeline: grab the current page as a PNG, capture it, map the
 * result quads from the captured image back onto the page's media box, then
 * render the findings twice — as DDV annotations on the page (a polygon around
 * each hit plus a label chip) and as cards in the results dialog so the text
 * can be read and copied out.
 *
 * Overlays are tracked per page and cleared before each run, so clicking
 * Detect repeatedly does not stack annotations.
 *
 * One thing worth stating plainly, because it is easy to over-read: an
 * overlaid polygon and decoded value say the barcode or MRZ line was read and
 * where it sits. They say nothing about whether the document is genuine.
 *
 * Reference implementation:
 * `examples/document_annotation` (`scanBarcode` / `recognizeText`).
 */

import { DDV } from "dynamsoft-document-viewer";

import {
  EnumCapturedResultItemType,
  type BarcodeResultItem,
  type CapturedResult,
  type ParsedResultItem,
  type TextLineResultItem,
} from "dynamsoft-capture-vision-bundle";

import { capturePage, getCodeParser } from "./cv";
import { EditViewerHandle } from "./ddv";
import { setBusy, showToast } from "./toolbar";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface Point {
  x: number;
  y: number;
}

/** A parsed key/value pair shown in the results dialog. */
interface Field {
  label: string;
  value: string;
}

/** A single finding, already expressed in page (media box) coordinates. */
interface Hit {
  /** Badge text: the barcode format, or the MRTD document type. */
  badge: string;
  /** Decoded payload, or the recognised MRZ line. */
  text: string;
  /** Parsed key/value pairs, when the format carries a known structure. */
  fields: Field[];
  /** Quad around the hit, in media-box coordinates. */
  points: Point[];
}

interface Outcome {
  kind: "barcode" | "mrz";
  hits: Hit[];
  /** Colour used for both the page overlays and the dialog badges. */
  accent: string;
}

/** Everything a capture needs, resolved once before the engine is called. */
interface PageContext {
  pageUid: string;
  /** The page rendered as a PNG, which is what the engine reads. */
  blob: Blob;
  /** Captured image size, used to map result coordinates onto the page. */
  imageWidth: number;
  imageHeight: number;
  /** Page size in media-box units (PDF points for PDFs). */
  pageWidth: number;
  pageHeight: number;
}

/**
 * Overlay colours, from the Dynamsoft brand palette: orange for barcodes,
 * Blumine teal for MRZ. Both read clearly over a white scanned page.
 */
const BARCODE_ACCENT = "#FE8E14";
const MRZ_ACCENT = "#306877";

/** Page overlays created by this module, keyed by page uid. */
const overlayUids = new Map<string, string[]>();

/* ------------------------------------------------------------------ */
/*  Public entry points                                               */
/* ------------------------------------------------------------------ */

export async function detectBarcodes(handle: EditViewerHandle): Promise<void> {
  const ctx = await beginPageCapture(handle, "Decoding barcodes…");
  if (!ctx) return;

  try {
    const result = await capturePage("ReadBarcodes_ReadRateFirst", ctx.blob);
    const hits = result.items
      .filter((item) => item.type === EnumCapturedResultItemType.CRIT_BARCODE)
      .map((item) => barcodeHit(item as BarcodeResultItem, ctx));

    present(ctx, { kind: "barcode", hits, accent: BARCODE_ACCENT });
  } catch (err: any) {
    showToast(`Barcode reading failed: ${err?.message ?? err}`, "error");
  } finally {
    setBusy(false);
  }
}

export async function readMrz(handle: EditViewerHandle): Promise<void> {
  const ctx = await beginPageCapture(handle, "Reading the MRZ…");
  if (!ctx) return;

  try {
    const result = await capturePage("ReadMRZ", ctx.blob);
    const hits = await mrzHits(result, ctx);

    present(ctx, { kind: "mrz", hits, accent: MRZ_ACCENT });
  } catch (err: any) {
    showToast(`MRZ reading failed: ${err?.message ?? err}`, "error");
  } finally {
    setBusy(false);
  }
}

/* ------------------------------------------------------------------ */
/*  Page capture                                                      */
/* ------------------------------------------------------------------ */

/**
 * Renders the current page to a PNG and measures it, so result coordinates can
 * be scaled back onto the page. Returns null (after reporting why) when there
 * is nothing to read.
 */
async function beginPageCapture(
  handle: EditViewerHandle,
  busyLabel: string
): Promise<PageContext | null> {
  const doc = handle.getCurrentDoc();
  if (!doc) {
    showToast("Open a document first.", "error");
    return null;
  }

  const pageIndex = handle.viewer.getCurrentPageIndex();
  if (pageIndex < 0) {
    showToast("No page selected.", "error");
    return null;
  }

  setBusy(true, busyLabel);

  let blob: Blob;
  try {
    blob = await doc.saveToPng(pageIndex);
  } catch (err: any) {
    setBusy(false);
    showToast(`Could not read the page: ${err?.message ?? err}`, "error");
    return null;
  }

  let image: HTMLImageElement;
  try {
    image = await blobToImage(blob);
  } catch (err: any) {
    setBusy(false);
    showToast(`Could not decode the page image: ${err?.message ?? err}`, "error");
    return null;
  }

  const pageUid = handle.viewer.indexToUid(pageIndex);
  const mediaBox = doc.getPageData(pageUid).mediaBox;

  return {
    pageUid,
    blob,
    imageWidth: image.naturalWidth,
    imageHeight: image.naturalHeight,
    pageWidth: mediaBox.width,
    pageHeight: mediaBox.height,
  };
}

/**
 * Scales a quad from captured-image space into media-box space.
 *
 * `saveToPng()` renders the page at its display resolution, and
 * `CaptureVisionRouter.maxImageSideLength` is disabled in cv.ts so the engine
 * reads that image unscaled. The two rectangles therefore share the same
 * aspect ratio and a single per-axis ratio maps one onto the other.
 */
function toPageQuad(points: Point[], ctx: PageContext): Point[] {
  const sx = ctx.pageWidth / ctx.imageWidth;
  const sy = ctx.pageHeight / ctx.imageHeight;
  return points.map((p) => ({ x: p.x * sx, y: p.y * sy }));
}

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("the page image could not be decoded"));
    };
    img.src = url;
  });
}

/* ------------------------------------------------------------------ */
/*  Result -> hit mapping                                             */
/* ------------------------------------------------------------------ */

function barcodeHit(item: BarcodeResultItem, ctx: PageContext): Hit {
  return {
    badge: item.formatString || "Barcode",
    text: item.text,
    fields: [],
    points: toPageQuad(item.location.points.map((p) => ({ x: p.x, y: p.y })), ctx),
  };
}

/**
 * Turns the recognised MRZ text lines into findings.
 *
 * The MRTD specifications are defined over a whole 2- or 3-line block, not per
 * line, so every recognised line is stitched into one string before parsing.
 * Two details matter here and both were measured:
 *
 *   • the engine may hand back the two lines of a TD3 document as a single
 *     item whose text contains a newline, so all non-MRZ whitespace has to go;
 *   • `Parse()` is what actually populates the field values — the
 *     `CRIT_PARSED_RESULT` item the template emits on the side reads back as
 *     `undefined` for every nested field on the bundle version in use.
 *
 * When parsing succeeds the whole block becomes one finding, outlined by the
 * union of its line quads. When it does not, each line is still reported as
 * text, because the raw lines are worth more than nothing.
 */
async function mrzHits(result: CapturedResult, ctx: PageContext): Promise<Hit[]> {
  const lines = result.items.filter(
    (item) => item.type === EnumCapturedResultItemType.CRIT_TEXT_LINE
  ) as TextLineResultItem[];

  if (lines.length === 0) return [];

  const joined = lines
    .map((line) => line.text)
    .join("")
    .replace(/[^A-Z0-9<]/gi, "")
    .toUpperCase();

  let parsed: ParsedResultItem | null = null;
  try {
    const parser = await getCodeParser();
    parsed = await parser.parse(joined);
  } catch (err) {
    // Non-fatal — the raw lines are still shown below.
    console.warn("MRZ parse failed:", err);
  }

  const fields = parsed ? mrzFields(parsed) : [];
  const badge = parsed?.codeType ? mrzTypeLabel(parsed.codeType) : "MRZ";

  if (fields.length > 0) {
    return [
      {
        badge,
        // Each line on its own row — a TD3 record is two 44-character lines and
        // reads as noise when run together.
        text: lines.map((line) => line.text.trim()).join("\n"),
        fields,
        points: toPageQuad(unionQuad(lines), ctx),
      },
    ];
  }

  return lines.map((line) => ({
    badge,
    text: line.text.trim(),
    fields: [],
    points: toPageQuad(
      line.location.points.map((p) => ({ x: p.x, y: p.y })),
      ctx
    ),
  }));
}

/** Bounding rectangle covering every recognised line, as four corners. */
function unionQuad(lines: TextLineResultItem[]): Point[] {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const line of lines) {
    for (const p of line.location.points) {
      xs.push(p.x);
      ys.push(p.y);
    }
  }
  const [x0, y0, x1, y1] = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  return [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
}

/**
 * Reads the parsed MRTD fields, in a fixed, readable order.
 *
 * `getAllFieldNames()` returns dotted paths down to each leaf
 * (`line1.name.primaryIdentifier`), but `getFieldValue()` only resolves the
 * leaf name — handed a dotted path it returns `undefined` for every field.
 * Asking for the leaf and de-duplicating also collapses the two-line structure
 * into one flat list.
 *
 * The parser exposes the date of birth and expiry twice: once as a raw
 * six-digit blob, once split into year/month/day. Neither is presentable on its
 * own, so both forms are hidden and the two dates are composed below.
 */
function mrzFields(item: ParsedResultItem): Field[] {
  const values = new Map<string, string>();

  for (const path of item.getAllFieldNames()) {
    const key = path.split(".").pop() ?? path;
    if (values.has(key) || MRZ_HIDDEN_FIELDS.has(key)) continue;

    let raw = "";
    try {
      raw = item.getFieldValue(key);
    } catch {
      continue;
    }
    const flat = String(raw ?? "").replace(/\s+/g, " ").trim();
    if (flat) values.set(key, flat);
  }

  const at = (name: string): string => {
    try {
      return String(item.getFieldValue(name) ?? "").trim();
    } catch {
      return "";
    }
  };

  // MRTD dates carry no century, so they are completed here rather than read.
  const birth = mrzDate(at("birthYear"), at("birthMonth"), at("birthDay"), "birth");
  const expiry = mrzDate(at("expiryYear"), at("expiryMonth"), at("expiryDay"), "expiry");
  if (birth) values.set("dateOfBirth", birth);
  if (expiry) values.set("dateOfExpiry", expiry);

  const fields: Field[] = [];
  const emit = (key: string): void => {
    const value = values.get(key);
    if (!value) return;
    fields.push({ label: MRZ_LABELS[key] ?? humaniseField(key), value });
    values.delete(key);
  };

  for (const key of MRZ_FIELD_ORDER) emit(key);
  // Anything the spec defines that the order list does not know about.
  for (const key of [...values.keys()].sort()) emit(key);

  return fields;
}

/** Presentation order for the MRTD fields we know by name. */
const MRZ_FIELD_ORDER = [
  "documentCode",
  "issuingState",
  "primaryIdentifier",
  "secondaryIdentifier",
  "passportNumber",
  "documentNumber",
  "nationality",
  "dateOfBirth",
  "sex",
  "dateOfExpiry",
  "personalNumber",
  "optionalData",
];

/**
 * Fields that never make it into the list: the raw MRZ lines (already printed
 * verbatim under each card), the date components that the composed dates
 * replace, and the check digits, which only prove the encoding is well-formed.
 */
const MRZ_HIDDEN_FIELDS = new Set([
  "line1",
  "line2",
  "line3",
  "name",
  "dateOfBirth",
  "dateOfExpiry",
  "birthYear",
  "birthMonth",
  "birthDay",
  "expiryYear",
  "expiryMonth",
  "expiryDay",
  "checkDigitForPassportNumber",
  "checkDigitForDocumentNumber",
  "checkDigitForBirthDate",
  "checkDigitForExpiryDate",
  "checkDigitForPersonalNumber",
  "compositeCheckDigit",
]);

/** MRTD field names as they should read to a person rather than to a spec. */
const MRZ_LABELS: Record<string, string> = {
  documentCode: "Document code",
  issuingState: "Issuing state",
  primaryIdentifier: "Surname",
  secondaryIdentifier: "Given names",
  passportNumber: "Document number",
  documentNumber: "Document number",
  nationality: "Nationality",
  dateOfBirth: "Date of birth",
  sex: "Sex",
  dateOfExpiry: "Date of expiry",
  personalNumber: "Personal number",
  optionalData: "Optional data",
};

/**
 * Composes a 2-digit MRTD date into `YYYY-MM-DD`.
 *
 * Birth dates are always in the past, so a two-digit year above this year's
 * last two digits means the previous century; a travel document's expiry is in
 * the future, and the convention the reference samples use is to read 60 and
 * above as the previous century.
 */
function mrzDate(year: string, month: string, day: string, kind: "birth" | "expiry"): string {
  if (!/^\d{2}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) return "";
  const yy = Number(year);
  const century =
    kind === "birth"
      ? yy > new Date().getFullYear() % 100
        ? 1900
        : 2000
      : yy >= 60
        ? 1900
        : 2000;
  return `${century + yy}-${month}-${day}`;
}

/** `dateOfBirth` / `holder.dateOfBirth` -> `Date Of Birth`. */
function humaniseField(name: string): string {
  const leaf = name.split(".").pop() ?? name;
  const spaced = leaf
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  return spaced
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function mrzTypeLabel(codeType: string): string {
  const labels: Record<string, string> = {
    MRTD_TD1_ID: "ID card (TD1)",
    MRTD_TD2_ID: "ID card (TD2)",
    MRTD_TD2_VISA: "Visa (TD2)",
    MRTD_TD3_VISA: "Visa (TD3)",
    MRTD_TD3_PASSPORT: "Passport (TD3)",
  };
  return labels[codeType] ?? codeType ?? "MRZ";
}

/* ------------------------------------------------------------------ */
/*  Presentation                                                      */
/* ------------------------------------------------------------------ */

function present(ctx: PageContext, outcome: Outcome): void {
  clearOverlays(ctx.pageUid);
  drawOverlays(ctx.pageUid, outcome);
  showResults(ctx.pageUid, outcome);

  const noun = outcome.kind === "barcode" ? "barcode" : "MRZ entry";
  if (outcome.hits.length === 0) {
    showToast(
      `No ${outcome.kind === "barcode" ? "barcodes" : "MRZ text"} found on this page.`,
      "info"
    );
  } else {
    showToast(
      `Found ${outcome.hits.length} ${noun}${outcome.hits.length === 1 ? "" : "s"}.`,
      "success"
    );
  }
}

/** Removes the overlays this module drew on `pageUid`, if any. */
export function clearOverlays(pageUid: string): void {
  const uids = overlayUids.get(pageUid);
  const manager = DDV.annotationManager;
  if (uids?.length && manager) {
    manager.deleteAnnotations(uids);
  }
  overlayUids.delete(pageUid);
}

function drawOverlays(pageUid: string, outcome: Outcome): void {
  const manager = DDV.annotationManager;
  if (!manager) return;

  const created: string[] = [];

  outcome.hits.forEach((hit, index) => {
    if (hit.points.length < 3) return;

    const polygon = manager.createAnnotation(pageUid, "polygon", {
      points: hit.points.map((p) => ({ x: p.x, y: p.y })),
      borderColor: outcome.accent,
      borderWidth: 2,
      background: "transparent",
      flags: { print: true, noView: false, readOnly: false },
    });
    created.push(polygon.uid);

    const label = overlayLabel(hit, index, outcome);
    const chip = labelChipGeometry(hit.points, label);
    if (!chip) return;

    const textBox = manager.createAnnotation(pageUid, "textBox", {
      x: chip.x,
      y: chip.y,
      width: chip.width,
      height: chip.height,
      borderColor: "transparent",
      background: outcome.accent,
      textContents: [
        {
          content: label,
          color: "#ffffff",
          fontSize: chip.fontSize,
          fontFamily: "Helvetica",
          fontWeight: "bold",
        },
      ],
      flags: { print: true, noView: false, readOnly: false },
    });
    created.push(textBox.uid);
  });

  if (created.length) overlayUids.set(pageUid, created);
}

function overlayLabel(hit: Hit, index: number, outcome: Outcome): string {
  const prefix = `#${index + 1}${hit.badge ? ` ${hit.badge}` : ""}`;
  const body =
    outcome.kind === "mrz" && hit.fields.length
      ? hit.fields
          .slice(0, 2)
          .map((f) => f.value)
          .join(" · ")
      : hit.text;
  return truncate(`${prefix}: ${body}`, 64);
}

/**
 * Places a label chip just above the hit, sized from the quad so it scales with
 * whatever resolution the page was built at. Returns null when the chip would
 * sit off the top of the page and there is no room for it.
 */
function labelChipGeometry(
  points: Point[],
  label: string
): { x: number; y: number; width: number; height: number; fontSize: number } | null {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const height = Math.max(...ys) - top;

  // Scale the label with the hit, within a band that stays legible on a
  // typical 595x842pt page.
  const fontSize = Math.max(7, Math.min(13, height * 0.55));
  const width = Math.min(label.length * fontSize * 0.58 + 12, 420);
  const chipHeight = fontSize + 8;

  const y = top - chipHeight - 2;
  if (y < 0) {
    // Not enough room above — tuck the chip inside the top edge instead.
    return { x: Math.max(0, left), y: top + 2, width, height: chipHeight, fontSize };
  }
  return { x: Math.max(0, left), y, width, height: chipHeight, fontSize };
}

function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/* ------------------------------------------------------------------ */
/*  Results dialog                                                    */
/* ------------------------------------------------------------------ */

/** Keeps the dialog's "Copy text" button working without a second lookup. */
let lastOutcome: Outcome | null = null;

function showResults(pageUid: string, outcome: Outcome): void {
  lastOutcome = outcome;

  const dialog = document.getElementById("results-dialog") as HTMLDialogElement | null;
  const title = document.getElementById("results-title");
  const intro = document.getElementById("results-intro");
  const list = document.getElementById("results-list");
  if (!dialog || !title || !intro || !list) return;

  const noun = outcome.kind === "barcode" ? "barcode" : "MRZ entry";
  title.textContent =
    outcome.hits.length === 0
      ? `No ${outcome.kind === "barcode" ? "barcodes" : "MRZ text"} found`
      : `${outcome.hits.length} ${noun}${outcome.hits.length === 1 ? "" : "s"} found`;

  intro.textContent =
    outcome.kind === "barcode"
      ? "Each decoded value is outlined on the page and listed below."
      : "Each recognised machine-readable line is outlined on the page; the parsed MRTD fields are listed below.";

  list.innerHTML = "";
  if (outcome.hits.length === 0) {
    const empty = document.createElement("p");
    empty.className = "results-empty";
    empty.textContent =
      outcome.kind === "barcode"
        ? "Nothing decoded on this page. Try a sharper scan, or a page that actually carries a barcode."
        : "No machine-readable zone was recognised on this page.";
    list.appendChild(empty);
  } else {
    outcome.hits.forEach((hit, index) => list.appendChild(resultCard(hit, index, outcome)));
  }

  const clear = document.getElementById("btn-results-clear") as HTMLButtonElement | null;
  const copy = document.getElementById("btn-results-copy") as HTMLButtonElement | null;
  if (clear) clear.disabled = outcome.hits.length === 0;
  if (copy) copy.disabled = outcome.hits.length === 0;

  if (!dialog.open) dialog.showModal();
  dialog.dataset.pageUid = pageUid;
}

function resultCard(hit: Hit, index: number, outcome: Outcome): HTMLElement {
  const card = document.createElement("article");
  card.className = "res-card";

  const head = document.createElement("header");
  head.className = "res-card-head";

  const badge = document.createElement("span");
  badge.className = `res-badge res-badge-${outcome.kind}`;
  badge.textContent = `${index + 1}. ${hit.badge}`;
  head.appendChild(badge);

  if (hit.points.length) {
    const located = document.createElement("span");
    located.className = "res-located";
    located.textContent = "outlined on page";
    head.appendChild(located);
  }
  card.appendChild(head);

  if (hit.fields.length) {
    const dl = document.createElement("dl");
    dl.className = "res-fields";
    for (const field of hit.fields) {
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = field.label;
      const dd = document.createElement("dd");
      dd.textContent = field.value;
      row.append(dt, dd);
      dl.appendChild(row);
    }
    card.appendChild(dl);
  }

  if (!hit.fields.length && hit.text) {
    const text = document.createElement("p");
    text.className = "res-text";
    text.textContent = hit.text;
    card.appendChild(text);
  }

  if (hit.fields.length && hit.text) {
    const raw = document.createElement("p");
    raw.className = "res-raw";
    raw.textContent = hit.text;
    card.appendChild(raw);
  }

  return card;
}

/**
 * Wires the results dialog's own buttons. Called once from main.ts.
 */
export function wireResultsDialog(): void {
  const dialog = document.getElementById("results-dialog") as HTMLDialogElement | null;
  const list = document.getElementById("results-list");
  if (!dialog || !list) return;

  const close = () => {
    if (dialog.open) dialog.close();
  };

  document.getElementById("btn-results-close")?.addEventListener("click", close);
  document.getElementById("btn-results-ok")?.addEventListener("click", close);

  document.getElementById("btn-results-clear")?.addEventListener("click", () => {
    const pageUid = dialog.dataset.pageUid;
    if (!pageUid) return;
    clearOverlays(pageUid);
    list.innerHTML = '<p class="results-empty">Overlays removed from the page.</p>';
    (document.getElementById("btn-results-clear") as HTMLButtonElement).disabled = true;
    showToast("Detection overlays removed.", "info");
  });

  document.getElementById("btn-results-copy")?.addEventListener("click", async () => {
    if (!lastOutcome?.hits.length) return;
    const dump = lastOutcome.hits
      .map((hit, index) => {
        const lines = [`#${index + 1} ${hit.badge}`, hit.text];
        for (const field of hit.fields) lines.push(`  ${field.label}: ${field.value}`);
        return lines.join("\n");
      })
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(dump);
      showToast("Results copied to the clipboard.", "success");
    } catch {
      showToast("The clipboard is not available in this browser.", "error");
    }
  });
}
