# Web TWAIN Document Scanner

A static page that scans paper through Dynamic Web TWAIN 19.5, previews the pages in the browser and
exports them as PDF, TIFF or PNG. Nothing is uploaded — the page talks to the local Dynamic Web TWAIN
Service, which drives TWAIN, WIA, ICA or SANE.

| | |
| --- | --- |
| Standalone copy | https://yushulx.me/web-twain-document-scan-management/examples/web-twain-scanner/ |
| Hosted demo (Codepool) | https://www.dynamsoft.com/codepool/demos/web-twain-scanner/ |
| Tutorial | [Scan from a Browser on Linux with SANE and JavaScript](https://www.dynamsoft.com/codepool/sane-scanner-access-javascript-linux.html) |

## Features

- **Explicit connect.** The SDK is fetched and the service initialised only after you click Connect.
- **Device and scan settings.** Scanner list, resolution, colour mode, document feeder, duplex, and the
  driver's own UI where the driver has one.
- **Preview.** Thumbnail strip kept in sync with the page viewer, rotate, delete, zoom in/out, fit to
  window, actual size, drag to pan.
- **Import.** Images and PDFs. PDFs are rasterised at 200 DPI by Dynamic Web TWAIN's own PDF add-on, so
  the pages arrive as images, not editable text.
- **Export.** PDF (all pages), TIFF (all pages), PNG (current page).
- **OCR.** Engine-aware text recognition and searchable-PDF export — see [OCR](#ocr-windows-and-macos-only).

## Requirements

- A desktop browser (Chrome, Edge, Firefox or Safari).
- Dynamic Web TWAIN Service 19.5 installed on the same machine.
- A scanner and its driver for acquisition. Importing, rotating and exporting work without hardware.
- A license key for anything beyond a trial.

## Quick start

### 1. Install Dynamic Web TWAIN Service

| Platform | Installer |
| --- | --- |
| Windows | [DynamicWebTWAINServiceSetup.msi](https://unpkg.com/dwt@19.5.0/dist/dist/DynamicWebTWAINServiceSetup.msi) |
| macOS | [DynamicWebTWAINServiceSetup.pkg](https://unpkg.com/dwt@19.5.0/dist/dist/DynamicWebTWAINServiceSetup.pkg) |
| Linux (deb) | [DynamicWebTWAINServiceSetup.deb](https://unpkg.com/dwt@19.5.0/dist/dist/DynamicWebTWAINServiceSetup.deb) |
| Linux (rpm) | [DynamicWebTWAINServiceSetup.rpm](https://unpkg.com/dwt@19.5.0/dist/dist/DynamicWebTWAINServiceSetup.rpm) |

The service listens on `127.0.0.1:18622` (HTTP) and `18623` (HTTPS). Open
`http://127.0.0.1:18622/` in a browser — any HTTP response means it is running.

### 2. Serve this folder over HTTP

```bash
cd path/to/web-twain-scanner
python3 -m http.server 8080
# open http://localhost:8080/
```

Any static server works. With Node: `npx serve . -l 8080`. With nginx:

```nginx
server {
    listen 80;
    root /var/www/web-twain-scanner;
    index index.html;
}
```

> Opening `index.html` from the file system (`file://`) does not work: the page needs an HTTP origin to
> reach the local service.

### 3. Connect and scan

1. Click **Connect**. The status line reports the scanner count once the service answers.
2. Pick a scanner and set resolution, colour and feeder options.
3. Click **Scan** — or **Choose files** to import existing images or PDFs instead.
4. Use the toolbar to rotate or delete pages, then export with **Download**.

### 4. Use your own license

`app.js` holds two constants at the top:

```javascript
const CODEPOOL_LICENSE_KEY = '...';   // used on dynamsoft.com and its subdomains
const TRIAL_LICENSE_KEY = '...';      // used everywhere else, including this copy
```

Every host outside `dynamsoft.com` falls back to the public trial key, which expires. For anything you
plan to keep running, replace `TRIAL_LICENSE_KEY` with a key from the
[Dynamsoft customer portal](https://www.dynamsoft.com/customer/license/trialLicense/?product=dwt).

## OCR (Windows and macOS only)

After connecting, the OCR row asks the local service which engines it can drive:

```javascript
const info = await DWObject.Addon.OCRConnector.GetInstalledOCRInfo();
// { engines: [ { name: '...', languages: ['en', 'de', ...] } ] }
```

The engine picker is filled from that list — the operating system's built-in OCR plus any ONNX Runtime
engine deployed on the machine — and the language list follows the selected engine.

- **Recognize page** runs `Recognize(index, { engine: { name }, settings: { language } })` on the current
  page and prints the recognised lines under the toolbar.
- **Searchable PDF** runs `SaveToPath(indices, EnumDWT_OCRConnectorOutputFormat.PDF_WITH_EXTRA_TEXTLAYER,
  'searchable-document.pdf')`, exporting every page with an invisible text layer.

**Linux is not supported yet.** On a Linux service `GetInstalledOCRInfo()` rejects with a platform
error, so the row stays disabled and says so — scanning, preview and export keep working. For OCR on
Linux, send the page image to a server-side engine (Tesseract, PaddleOCR, a cloud API); the
[tutorial](https://www.dynamsoft.com/codepool/sane-scanner-access-javascript-linux.html) covers that split.

More on the API: [OCR Connector documentation](https://www.dynamsoft.com/web-twain/docs/extended-usage/ocr.html).

## Project structure

```
index.html    markup: connection panel, scan settings, viewer, export and OCR rows
app.js        all behaviour — SDK loading, connect, scan, import, export, OCR
styles.css    layout and toolbar styling
```

There is no build step and no framework. `index.html` loads `styles.css` and `app.js` directly.

## No scanner at hand?

The [virtual-scanner 1.0.7 release](https://github.com/yushulx/virtual-scanner/releases/tag/v1.0.7)
installs a fake scanner that feeds bundled sample images: Windows (`.exe` or portable zip), macOS
(`.pkg`) and Linux (`.deb`). One job returns one image, the next job returns the next page, and selecting
the automatic document feeder returns the whole set as one multi-page document. It still needs the local
Web TWAIN service.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Connect fails or times out | Is the service running? `curl http://127.0.0.1:18622/` should answer. Reinstall if not. |
| Connect fails only in one browser | A proxy intercepting loopback. Start the browser with `--no-proxy-server`, or bypass `127.0.0.1` in the proxy settings. |
| Connected but no scanners | Scanner driver, and on Linux `scanimage -L`. Virtual scanner is the quick way to confirm the rest of the page works. |
| OCR row stays disabled | Linux (not supported), or no OCR engine reported by the service. Check the message printed under the OCR row. |
| PDF import or export throws | The `Resources` folder of the SDK is incomplete — the PDF add-on has to be present. |
| Pages look blurry after zoom | Zoom only changes display scale. Export keeps the scanned or imported resolution. |

## Tests

The hosted demo's behaviour is covered by mocked integration checks in the Codepool repository
(`node _scripts/test_web_twain_scanner.cjs`). Hardware acceptance still needs a real scanner: connect,
scan flatbed and feeder pages, cancel a scan mid-way, disconnect and reconnect, then open every exported
format in a viewer.
