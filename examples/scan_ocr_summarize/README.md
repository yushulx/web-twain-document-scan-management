# Web Document Scanner with OCR and AI Summarization

A modern web-based document scanning application that combines **Dynamic Web TWAIN** for document scanning and OCR with **Gemini Nano** (Chrome's built-in AI) for intelligent document summarization.


## Features

- **Direct Browser Scanning** - Scan documents directly from your scanner without any additional software
- **Document Management** - Load, view, and manage scanned documents with thumbnail preview
- **OCR (Optical Character Recognition)** - Extract text from scanned documents in multiple languages
- **AI-Powered Summarization** - Automatically summarize extracted text using Chrome's built-in Gemini Nano AI
- **Document Editing** - Edit and enhance scanned documents with built-in image editor
- **Save & Export** - Save all documents as PDF for easy sharing and archiving
- **Modern UI** - Clean, responsive interface built with Bootstrap 5

## Technology Stack

- **[Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/)** - Document scanning SDK
- **[Gemini Nano](https://developer.chrome.com/docs/ai/built-in-apis)** - Chrome's built-in AI for summarization

## Prerequisites

- A TWAIN/ICA/SANE compatible scanner (or virtual scanner for testing)
- Modern web browser (Chrome 138+ recommended for AI features)
- [Dynamic Web TWAIN license key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) 

### Optional OCR Support (Windows Only)

For OCR functionality, you need to install the OCR add-on:
1. Download `DynamicWebTWAINOCRResources.zip` from [Dynamsoft's website](https://www.dynamsoft.com/web-twain/downloads)
2. Extract and run `Install.cmd` as administrator

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yushulx/web-twain-document-scan-management.git
cd web-twain-document-scan-management/examples/scan_ocr_summarize
```

### 2. Update License Key

Open `js/app.js` and replace the product key with your own:

```javascript
Dynamsoft.DWT.ProductKey = "YOUR_LICENSE_KEY_HERE";
```

### 3. Serve the Application

Since browsers require HTTPS for scanner access, use a local web server:

#### Using Python:
```bash
python -m http.server 8000
```

#### Using Node.js (http-server):
```bash
npx http-server -p 8000
```

#### Using VS Code Live Server:
Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) and click "Go Live".

### 4. Open in Browser

Navigate to `http://localhost:8000` in your web browser.

## Usage

### Scanning Documents

1. **Select Scanner**: Choose your scanner from the dropdown menu
2. **Start Scanning**: Click the "Start Scanning" button to acquire documents
3. **View Documents**: Click on thumbnails to view documents in the large preview panel

### Loading Documents

Click "Load from File" to import existing images or PDFs from your computer.

### OCR Text Extraction

1. Select a document by clicking on its thumbnail
2. Click the "OCR" button in the document view panel
3. Select the language (English, French, Spanish, German, Italian, Portuguese)
4. View and copy the extracted text

### AI Summarization

1. After performing OCR, click the "Summarize" button in the OCR modal
2. Wait for Gemini Nano to load (first time may take a few moments)
3. View the AI-generated summary of the document

**Note**: Summarization requires Chrome 138+ with Gemini Nano enabled.

### Document Editing

1. Select a document
2. Click the "Edit" button to open the image editor
3. Use the editing tools to enhance your document (crop, rotate, adjust brightness, etc.)
4. Click "Close" or the X button to save changes and return to the view

**Note**: The image editor opens in full-screen mode with all editing tools available.

### Saving Documents

Click "Save All" to export all scanned documents as a PDF file.

## Development with MCP Server

For faster Dynamic Web TWAIN integration during development, consider using the **[simple-dynamsoft-mcp](https://www.npmjs.com/package/simple-dynamsoft-mcp)** MCP server. It provides quick code snippets and API references through AI assistants like Claude or GitHub Copilot.

### Setup MCP Server (Optional)

```bash
npm install -g simple-dynamsoft-mcp
```

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "dynamsoft": {
      "command": "npx",
      "args": ["-y", "simple-dynamsoft-mcp"]
    }
  }
}
```

