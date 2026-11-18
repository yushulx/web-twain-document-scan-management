# Web Document Scanner with OCR and Text Search

A web-based document scanning application that runs OCR on every page and lets you search the text across the whole batch. Built with Dynamic Web TWAIN 19.5 and its OCR Connector, with custom canvas rendering instead of the built-in viewer.

https://github.com/user-attachments/assets/7802104f-421f-403d-899f-09d5b5e4cd10

## Features

- **Scanner integration**: direct scanner access via TWAIN/WIA on Windows, ICA on macOS, SANE on Linux
- **OCR Connector**: text recognition through the engine the local service can drive, chosen at runtime
- **Engine and language pickers**: `GetInstalledOCRInfo()` fills both lists and the language list follows the selected engine
- **Full-text search**: search across all stored documents with highlighted matches
- **Text selection**: select and copy text straight from the scanned image
- **Local storage**: images, text and word boxes live in IndexedDB, so nothing is uploaded

## Prerequisites

- A TWAIN/ICA/SANE compatible scanner, or a virtual scanner for testing
- [Dynamic Web TWAIN 19.5+](https://www.dynamsoft.com/web-twain/downloads) with the local service installed
- A [Dynamic Web TWAIN license key](https://www.dynamsoft.com/customer/license/trialLicense?product=dwt)

### OCR requirements

OCR Connector is included with Dynamic Web TWAIN and is **available on Windows and macOS only** — Linux is not supported yet. The engine ships with the operating system, so there is no separate OCR installer to run.

| Engine | Platform | Languages |
| --- | --- | --- |
| `Windows.Media.Ocr` | Windows | Additional recognition languages need the matching Windows language pack |
| `Apple.Vision` | macOS | Ships with macOS |

Only the engines reported by `GetInstalledOCRInfo()` appear in the toolbar. If the call fails, the pickers stay disabled, the status bar explains why, and scanning plus search keep working on pages already stored.

## Steps to Run Locally

1. Clone or download this directory
2. Serve it over HTTP (the SDK needs a real origin, not `file://`):
   ```bash
   # Python 3
   python -m http.server 8080

   # Node.js
   npx http-server -p 8080
   ```
3. Open `http://localhost:8080` in a modern browser

## Usage

### Scanning documents

1. Pick the scanner in the toolbar
2. Pick the OCR engine and language
3. Click "Scan" — each page is converted to PNG, recognized, and saved to IndexedDB

### Loading documents

- Click "Load" to import images from the file system
- Supports JPG, PNG, TIFF and PDF

### Searching

1. Enter a search term in the search box
2. Press Enter or click "Search"
3. Use the arrow keys to walk through the matches
4. Yellow highlights show where the text sits on the page

### Text selection

- Click and drag over text in the viewer
- The text is selectable even though it comes from a scanned image
- Copy it with Ctrl+C / Cmd+C

### Navigation

- **Arrow Left/Right**: previous or next document
- **Arrow Up/Down**: previous or next search result
- **Prev/Next buttons**: the same, by mouse

### Document management

- **Remove**: delete the document on screen
- **Remove All**: clear every document from storage

## How the OCR call works

```js
const info = await DWTObject.Addon.OCRConnector.GetInstalledOCRInfo();
// info.engines -> [{ name: "Windows.Media.Ocr", languages: ["en", "de", ...] }]

const result = await DWTObject.Addon.OCRConnector.Recognize(index, {
    engine: { name: engineName },
    settings: { language: languageCode }
});
// result.blocks[].lines[].words[] -> { value, geometry: { left, top, right, bottom } }
```

Coordinates come back in original image pixels, so the viewer scales them by `displayWidth / imageWidth` before drawing highlights and positioning the transparent text layer.

## Blog

[How OCR Helps Organize and Search Bulk Scanned Documents: A Developer's Guide](https://www.dynamsoft.com/codepool/scan-ocr-bulk-document-search-text.html)
