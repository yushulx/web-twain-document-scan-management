/**
 * gdrive.ts — Google Drive upload integration.
 *
 * Uses Google Identity Services (GIS) for OAuth 2.0 token acquisition
 * and the Drive REST API v3 for file uploads. Everything runs client-side
 * — no backend server required.
 *
 * Prerequisites:
 *   1. Create a Google Cloud project and enable the Google Drive API.
 *   2. Create an OAuth 2.0 Client ID (type: Web application).
 *   3. Add your origin to "Authorized JavaScript origins".
 *   4. Set VITE_GDRIVE_CLIENT_ID in .env.local.
 *
 * The user can upload:
 *   - All pages as a single PDF file
 *   - All pages as individual PNG images (packed in a moment)
 */

import { EditViewerHandle } from "./ddv";
import { showToast, setBusy } from "./toolbar";

const GIS_SCRIPT = "https://accounts.google.com/gsi/client";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";

const CLIENT_ID: string = import.meta.env.VITE_GDRIVE_CLIENT_ID ?? "";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

let gisLoaded = false;
let accessToken: string | null = null;
let tokenClient: any = null;

declare global {
  interface Window {
    google?: any;
  }
}

/* ------------------------------------------------------------------ */
/*  Public entry point                                                 */
/* ------------------------------------------------------------------ */

export async function uploadToGoogleDrive(
  handle: EditViewerHandle,
  mode: "pdf" | "images"
): Promise<void> {
  const doc = handle.getCurrentDoc();
  if (!doc) {
    showToast("Open a document first.", "error");
    return;
  }

  if (!CLIENT_ID) {
    showToast("Google Drive is not configured. Set VITE_GDRIVE_CLIENT_ID.", "error");
    return;
  }

  const total = handle.viewer.getPageCount();
  if (total === 0) {
    showToast("No pages to upload.", "error");
    return;
  }

  // Acquire an access token (prompts consent on first run).
  try {
    await ensureToken();
  } catch (err: any) {
    showToast(`Google sign-in failed: ${err?.message ?? err}`, "error");
    return;
  }

  if (mode === "pdf") {
    await uploadAsPdf(doc);
  } else {
    await uploadAsImages(doc, total);
  }
}

/* ------------------------------------------------------------------ */
/*  Upload modes                                                       */
/* ------------------------------------------------------------------ */

async function uploadAsPdf(doc: any): Promise<void> {
  setBusy(true, "Generating PDF for Google Drive…");
  let blob: Blob;
  try {
    blob = await doc.saveToPdf({ saveAnnotation: "flatten" });
  } catch (err: any) {
    setBusy(false);
    showToast(`PDF generation failed: ${err?.message ?? err}`, "error");
    return;
  }

  setBusy(true, "Uploading PDF to Google Drive…");
  try {
    const fileName = `${timestampedName()}.pdf`;
    const result = await uploadFile(blob, fileName, "application/pdf");
    setBusy(false);
    showToast(`Uploaded "${fileName}" to Google Drive.`, "success");
    openInDrive(result.id);
  } catch (err: any) {
    setBusy(false);
    showToast(`Upload failed: ${err?.message ?? err}`, "error");
  }
}

async function uploadAsImages(doc: any, total: number): Promise<void> {
  for (let i = 0; i < total; i++) {
    setBusy(true, `Uploading page ${i + 1} of ${total}…`);
    try {
      const blob = await doc.saveToPng(i);
      const fileName = `${timestampedName()}_page${i + 1}.png`;
      await uploadFile(blob, fileName, "image/png");
    } catch (err: any) {
      setBusy(false);
      showToast(`Upload failed on page ${i + 1}: ${err?.message ?? err}`, "error");
      return;
    }
  }
  setBusy(false);
  showToast(`Uploaded ${total} image${total > 1 ? "s" : ""} to Google Drive.`, "success");
}

/* ------------------------------------------------------------------ */
/*  Drive REST API                                                     */
/* ------------------------------------------------------------------ */

async function uploadFile(
  blob: Blob,
  fileName: string,
  mimeType: string
): Promise<{ id: string; name: string }> {
  const metadata = {
    name: fileName,
    mimeType,
  };

  // Build a multipart/related body: metadata part + file part.
  const boundary = "-------dynamsoft_upload_" + Math.random().toString(36).slice(2);
  const header = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`;
  const fileHeader = `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--`;

  const metadataBlob = new Blob([header + JSON.stringify(metadata) + fileHeader], {
    type: "text/plain",
  });
  const footerBlob = new Blob([footer], { type: "text/plain" });
  const body = new Blob([metadataBlob, blob, footerBlob], {
    type: `multipart/related; boundary="${boundary}"`,
  });

  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary="${boundary}"`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API ${res.status}: ${text}`);
  }

  return res.json();
}

function openInDrive(fileId: string): void {
  const url = `https://drive.google.com/file/d/${fileId}/view`;
  window.open(url, "_blank", "noopener");
}

/* ------------------------------------------------------------------ */
/*  OAuth via Google Identity Services                                 */
/* ------------------------------------------------------------------ */

async function ensureToken(): Promise<void> {
  if (accessToken) return;
  await loadGis();

  return new Promise((resolve, reject) => {
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          accessToken = response.access_token;
          resolve();
        },
      });
      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      reject(err);
    }
  });
}

async function loadGis(): Promise<void> {
  if (gisLoaded && window.google?.accounts?.oauth2) return;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => {
        gisLoaded = true;
        resolve();
      });
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Could not load Google Identity Services."));
    document.head.appendChild(script);
  });
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timestampedName(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `annotation-studio-${yyyy}${mm}${dd}-${hh}${min}`;
}
