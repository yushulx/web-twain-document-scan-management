# Dynamic Web TWAIN OCR Demo

A modern web application demonstrating the use of Dynamic Web TWAIN and its OCR Connector add-on for document scanning, processing, and text recognition.

https://github.com/user-attachments/assets/e19f3847-35d4-4341-8cfc-5d4ac02a7a6d

## Features

- **Document Scanning**: Scan documents directly from TWAIN, WIA, or ICA compatible devices
- **Image Loading**: Load images from local files
- **OCR Engine Selection**: Pick any engine the local service reports — `Windows.Media.Ocr`, `Apple.Vision`, or `Onnx.Ocr`
- **OCR Text Recognition**: Recognize text from scanned or loaded images with the selected engine
- **Engine-Driven Languages**: The language list follows the selected engine, so it never offers a language that engine cannot read
- **Orientation Correction**: Detect and correct page orientation (requires `Onnx.Ocr`)
- **PDF Export**: Export scanned documents to PDF with a searchable text layer or as plain text
- **Local Storage**: Automatically save scanned images to local storage
- **IndexedDB Integration**: Persist OCR results in IndexedDB for reliable storage
- **Image Management**: Remove selected images or all images at once
- **Responsive Design**: Modern, responsive UI with a clean, intuitive interface

## Getting Started

### Prerequisites

- Windows 10 or later, or macOS 10.15 or later. **OCR Connector is not available on Linux** — `GetInstalledOCRInfo()` rejects there.
- [Dynamic Web TWAIN Service 19.5](https://www.dynamsoft.com/web-twain/downloads/) installed on the same machine.
- A [30-day free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dwt) for Dynamic Web TWAIN. The trial covers OCR Connector; purchased Core Module 19.5+ licenses include it at no extra cost.

### Installation

1. Clone or download this project to your local machine

   The Dynamic Web TWAIN runtime is loaded from the jsDelivr CDN
   (`dwt@19.5.0`), so no SDK files are needed in this folder. Since 19.5 the
   `dynamsoft.webtwain.min.js` bundle already contains the OCR Connector — there is
   no separate `dynamsoft.webtwain.addon.ocrkit.js` to copy anymore. The
   `Resources/addon` folder still holds the optional add-on shims from the
   downloaded SDK; this page loads none of them.

2. Set the license key in the inline config block of `index.html`:

   ```javascript
   Dynamsoft.DWT.ProductKey = "LICENSE-KEY";
   ```

   The desktop service installers are served from
   `https://unpkg.com/dwt@19.5.0/dist/dist/` through
   `Dynamsoft.DWT.ServiceInstallerLocation`. For a fully offline deployment,
   download the [full package](https://www.dynamsoft.com/web-twain/downloads/),
   copy its `dist` folder to `Resources/`, and point both `ResourcesPath` and
   `ServiceInstallerLocation` at it.

3. Start a web server in the project directory:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js with http-server
   npx http-server -p 8000
   ```

4. Open your web browser and navigate to `http://localhost:8000`

   <img width="800" alt="Dynamic Web TWAIN document OCR" src="https://github.com/user-attachments/assets/9c02b5b1-f8bb-4328-8671-67e9a2dec396" />

## Usage

### Basic Workflow

1. **Scan or Load Images**
   - Click "Scan" to scan documents from a connected scanner
   - Click "Load Image" to load images from your local filesystem

2. **Pick an OCR Engine**
   - Once the viewer is ready, the engine list is filled from
     `GetInstalledOCRInfo()` and the language list follows the selected engine
   - `Windows.Media.Ocr` (Windows) and `Apple.Vision` (macOS) ship with the
     operating system; `Onnx.Ocr` appears only after the optional OCR pack is installed

3. **Process Images** (optional)
   - Click "Correct Orientation" to fix page orientation — only `Onnx.Ocr` can
     detect it, so this reports an error when that engine is not installed

4. **Recognize Text**
   - Select the desired language from the dropdown menu
   - Choose to process the current image or all images
   - Click "Recognize Text" to start OCR processing
   - View the recognized text in the right panel

5. **Export Results**
   - Select output format — `PDF_WITH_EXTRA_TEXTLAYER` for a searchable PDF, or
     `PDF_PLAIN_TEXT` for text only
   - Click "Save as PDF"; the system save dialog asks where to put the file

6. **Manage Images**
   - Click "Remove Selected Image" to delete the currently selected image
   - Click "Remove All Images" to clear all images

## OCR Engines

OCR Connector is a thin bridge: the recognition itself runs in the engine the local
service exposes, on the user's machine, and nothing is uploaded.

| Engine | Platform | Notes |
| --- | --- | --- |
| `Windows.Media.Ocr` | Windows 10+ | Installed with the OS. A language must have its OCR package in Windows Settings before it is listed. |
| `Apple.Vision` | macOS 10.15+ | Installed with the OS. Older macOS releases expose fewer languages. |
| `Onnx.Ocr` | Windows 10+ | Optional. Install `DynamicWebTWAINOCRPack.zip` with `Install.cmd` as administrator; the pack is what makes orientation detection available. |

```javascript
const info = await DWTObject.Addon.OCRConnector.GetInstalledOCRInfo();
// { engines: [ { name: 'Windows.Media.Ocr', languages: ['en-US', 'de-DE', ...] }, ... ] }

const result = await DWTObject.Addon.OCRConnector.Recognize(0, {
    engine: { name: 'Windows.Media.Ocr' },
    settings: { language: 'en-US' }
});
```

Two details that bite: the engine is an **object** (`{ name }`), not a bare string,
and language codes come back as BCP-47 tags (`en-US`), not the Tesseract-style
`eng` used by the retired OCR add-ons.

## Dynamic Web TWAIN Resources

- [Official Website](https://www.dynamsoft.com/web-twain/overview/)
- [Documentation](https://www.dynamsoft.com/web-twain/docs/introduction/index.html)
- [OCR Connector guide](https://www.dynamsoft.com/web-twain/docs/extended-usage/ocr.html)

## Blog
[Leveraging Dynamic Web TWAIN's New OCR API for Modern Document Management](https://www.dynamsoft.com/codepool/scan-ocr-document-save-pdf.html)
