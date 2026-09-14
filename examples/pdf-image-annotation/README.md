# PDF & Image Annotation Studio

A browser-based document workbench for opening PDFs/images, appending more files or scanned pages into one working document, annotating pages, and exporting the result to PDF or image formats. It is built with [Dynamsoft Document Viewer](https://www.dynamsoft.com/document-viewer/overview/) v5, Dynamic Web TWAIN scanner capture, Vite, and TypeScript. The UI adapts to desktop, tablet, and phone browsers: on phones the editing and annotation tools move from the in-canvas header to a bottom toolbar so no button is hidden, dialogs go full-screen, and safe-area insets are respected.

## Demo Video
- PDF annotation

  https://github.com/user-attachments/assets/becc8b2e-0cd1-4706-9617-d9f3973d9f43

- Google drive upload

  https://github.com/user-attachments/assets/2c6377e6-712a-47f5-808a-bff01c077866



## Online Demo
[PDF & Image Annotation Studio](https://www.dynamsoft.com/codepool/demos/pdf-image-annotation/) (Codepool hosted, license activated automatically)

## Features

- **One Add menu for every input source**: the header's **Add** dropdown collects the three ways to bring pages in — **From file** (PDF, PNG, JPEG, TIFF, BMP; also the empty-state CTA, drag and drop, and Ctrl/Cmd+O), **From camera** (a live preview dialog where you snap several photos, review thumbnails with per-item delete, and add them as new pages), and **From scanner** (the menu lists the devices Dynamic Web TWAIN reports, and picking one scans it without DWT's own UI). New files are appended to the current document instead of replacing it. The scanner entry is hidden below 640 px — it needs the desktop service, and three separate input buttons never fit a phone's header.
- **Multi-image PDF assembly**: keep adding image pages, delete unwanted pages, and export the final document as one PDF.
- **Detection menu**: the header's **Detect** button opens a dropdown with three readers, each run against the current page:
  - **Document edges** — find the document boundary with **Dynamsoft Capture Vision**'s document normalizer (the `DetectDocumentBoundaries_Default` preset template), preview the auto-normalized result, drag the quad corners if the boundary needs adjusting, and replace the page with the perspective-corrected image. Handles rotated ID cards and passports as well as full-page documents.
  - **Barcodes** — decode every 1D/2D barcode on the page with Capture Vision's `ReadBarcodes_ReadRateFirst` preset.
  - **MRZ** — read the machine-readable zone of a passport or ID and parse it into fields (document code, issuing state, name, document number, nationality, dates of birth and expiry, sex, personal number).

  Barcode and MRZ results are outlined on the page — a polygon around each hit plus a label chip — and listed in a results dialog with the decoded values and parsed fields, ready to copy. Repeated Detect runs replace the previous overlays instead of stacking them.
- **Google Drive upload**: sign in with Google and upload all pages as a single PDF or as individual PNG images directly to Google Drive.
- **Native DDV annotation toolbar**: page navigation, display/fit mode, zoom, rotate, crop, image filters, undo/redo, and page-level delete — plus DDV's full annotation set (shapes, text, ink, stamps) and redaction tools.
- **Quick Redact**: creates a real redaction annotation, selects it, and leaves it movable/resizable before applying it from DDV's redaction toolbar.
- **Approval stamp**: adds a movable `REVIEWED <date>` text stamp.
- **Export**: PDF with editable annotations, PDF flattened, PDF as image, PNG, JPEG, or TIFF.

## Prerequisites

- Node.js 18+
- A [license key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) for production use
- Optional scanner support requires:
  - Dynamic Web TWAIN Service installed/running on the client machine
  - A TWAIN/WIA/ICA/SANE/eSCL scanner supported by DWT

DDV includes a short public trial key fallback in `src/main.ts`. For continuous development, use your own license keys.

## Quick Start

```bash
npm install
```

Create `.env.local` when using your own keys:

```bash
VITE_DDVR_LICENSE="your-document-viewer-license"
VITE_DWT_LICENSE="your-dynamic-web-twain-license"
VITE_GDRIVE_CLIENT_ID="your-google-oauth-client-id"
```

### Google Drive Setup (optional)

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Google Drive API**.
3. Create an **OAuth 2.0 Client ID** (application type: Web application).
4. Add your dev/production origin (e.g. `http://localhost:5173`) to **Authorized JavaScript origins**.
5. Set `VITE_GDRIVE_CLIENT_ID` in `.env.local` to the client ID.
6. On the **OAuth consent screen** → **Test users**, add the Google account(s) that will test the upload. While the app is in "Testing" status, only listed test users can sign in. Alternatively, click **PUBLISH APP** to allow anyone (requires Google verification).

Run the app:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Build

```bash
npm run build
```

The production output is written to `dist/`.

## Resource Paths

DDV's WASM engine is loaded from:

```text
https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@5.0.0/dist/engine
```

For offline or controlled deployments, copy `node_modules/dynamsoft-document-viewer/dist/engine` into your static assets and update `ENGINE_RESOURCE_PATH` in `src/main.ts`.

DDV 5 ships annotation and PDF/TIFF parsing as on-demand plugins. The app registers them before `DDV.Core.init()`:

```ts
import { AnnotationPlugin } from "dynamsoft-document-viewer/annotation";
import { ImagePdfParserPlugin } from "dynamsoft-document-viewer/imagePdf";

DDV.use(AnnotationPlugin);
DDV.use(ImagePdfParserPlugin);
```

Dynamic Web TWAIN is loaded from:

```text
https://cdn.jsdelivr.net/npm/dwt@19.4.3/dist/dynamsoft.webtwain.min.js
```

The DWT Service installer location is:

```text
https://unpkg.com/dwt@19.4.3/dist/dist
```

For production, Dynamsoft recommends extracting the service installers from the SDK package and self-hosting them so the service version matches the deployed DWT runtime.

## Blog
- [How to Build a Browser Document Annotation Studio with PDF, Image, and Scanner Capture in TypeScript](https://www.dynamsoft.com/codepool/build-pdf-image-annotation-document-viewer.html)
- [How to Build a Web Document Scanner with Google Drive Cloud Storage Upload](https://www.dynamsoft.com/codepool/build-web-scanner-google-drive-cloud-storage-upload.html)
