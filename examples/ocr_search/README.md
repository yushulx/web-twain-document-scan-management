# Web Document Scanner with OCR and Search

A modern web-based document scanning application with Optical Character Recognition (OCR) and full-text search capabilities. Built with Dynamic Web TWAIN SDK and custom canvas rendering.

## Features

- **Scanner Integration**: Direct scanner access via TWAIN/WIA protocols
- **OCR Processing**: Automatic text extraction from scanned documents
- **Full-Text Search**: Search across all scanned documents with visual highlights
- **Text Selection**: Select and copy text from scanned images

## Prerequisites

- A TWAIN/ICA/SANE compatible scanner (or virtual scanner for testing)
- [Dynamic Web TWAIN license key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) 
- Install Dynamic Web TWAIN service and `DynamicWebTWAINOCRResources.zip` from [Dynamsoft's website](https://www.dynamsoft.com/web-twain/downloads). Extract and run `Install.cmd` as administrator. ⚠️ **Important**: Dynamic Web TWAIN OCR functionality is currently **only available on Windows**. While the scanning features work cross-platform, OCR processing requires a Windows environment.

## Steps to Run Locally

1. Clone or download this directory
2. Serve via HTTP server (required for TWAIN SDK):
   ```bash
   # Python 3
   python -m http.server 8080
   
   # Node.js
   npx http-server -p 8080
   ```
3. Open `http://localhost:8080` in a modern web browser

## Usage

### Scanning Documents
1. Select scanner from dropdown
2. Click "Scan" to acquire images
3. Documents automatically processed with OCR and saved

### Loading Documents
- Click "Load" to import images from file system
- Supports: JPG, PNG, TIFF, PDF

### Searching
1. Enter search term in search box
2. Press Enter or click "Search"
3. Use arrow keys to navigate between matches
4. Yellow highlights show matching text locations

### Text Selection
- Click and drag over text in the viewer
- Text is selectable despite being from a scanned image
- Copy text to clipboard (Ctrl+C/Cmd+C)

### Navigation
- **Arrow Left/Right**: Navigate between documents
- **Arrow Up/Down**: Navigate search results (when searching)
- **Prev/Next Buttons**: Manual navigation

### Document Management
- **Remove**: Delete currently displayed document
- **Remove All**: Clear all documents from storage

