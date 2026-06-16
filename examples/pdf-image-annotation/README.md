# PDF & Image Annotation Studio

A browser-based document workbench for opening PDFs/images, appending more files or scanned pages into one working document, annotating pages, and exporting the result to PDF or image formats. It is built with [Dynamsoft Document Viewer](https://www.dynamsoft.com/document-viewer/overview/) v4, Dynamic Web TWAIN scanner capture, Vite, and TypeScript.

https://github.com/user-attachments/assets/becc8b2e-0cd1-4706-9617-d9f3973d9f43

## Features

- **Open and append documents**: PDF, PNG, JPEG, TIFF, and BMP can be loaded from the header button, empty-state CTA, or drag and drop. New files are appended to the current document instead of replacing it.
- **Multi-image PDF assembly**: keep adding image pages, delete unwanted pages, and export the final document as one PDF.
- **Scanner capture**: refresh scanner devices, select a scanner from the dropdown, trigger a no-UI scan through Dynamic Web TWAIN, and append scanned pages to the active DDV document.
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
```

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
https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@4.0.0/dist/engine
```

For offline or controlled deployments, copy `node_modules/dynamsoft-document-viewer/dist/engine` into your static assets and update `ENGINE_RESOURCE_PATH` in `src/main.ts`.

Dynamic Web TWAIN is loaded from:

```text
https://cdn.jsdelivr.net/npm/dwt@19.4.1/dist/dynamsoft.webtwain.min.js
```

The DWT Service installer location is:

```text
https://unpkg.com/dwt@19.4.1/dist/dist
```

For production, Dynamsoft recommends extracting the service installers from the SDK package and self-hosting them so the service version matches the deployed DWT runtime.

## Blog
[How to Build a Browser Document Annotation Studio with PDF, Image, and Scanner Capture in TypeScript](https://www.dynamsoft.com/codepool/build-pdf-image-annotation-document-viewer.html)
