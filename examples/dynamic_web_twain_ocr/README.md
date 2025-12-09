# Dynamic Web TWAIN OCR Demo

A modern web application demonstrating the use of Dynamic Web TWAIN and its OCRKit addon for document scanning, processing, and text recognition.

## Features

- **Document Scanning**: Scan documents directly from TWAIN, WIA, or ICA compatible devices
- **Image Loading**: Load images from local files
- **OCR Text Recognition**: Recognize text from scanned or loaded images
- **Multiple Language Support**: Recognize text in English, French, Spanish, German, Italian, and Portuguese
- **Orientation Correction**: Automatically detect and correct page orientation
- **PDF Export**: Export scanned documents to PDF with or without text layer
- **Local Storage**: Automatically save scanned images to local storage
- **IndexedDB Integration**: Persist OCR results in IndexedDB for reliable storage
- **Image Management**: Remove selected images or all images at once
- **Responsive Design**: Modern, responsive UI with a clean, intuitive interface

## Getting Started

### Prerequisites
- [30-day free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) for Dynamic Web TWAIN and OCRKit addon

### Installation

1. Clone or download this project to your local machine
2. Set the license key in `Resources/dynamsoft.webtwain.config.js`:

   ```javascript
   Dynamsoft.DWT.ProductKey = "LICENSE-KEY";
   ```

3. Start a web server in the project directory:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js with http-server
   npx http-server -p 8000
   ```

4. Open your web browser and navigate to `http://localhost:8000`

## Usage

### Basic Workflow

1. **Scan or Load Images**
   - Click "Scan" to scan documents from a connected scanner
   - Click "Load Image" to load images from your local filesystem

2. **Process Images** (optional)
   - Click "Correct Orientation" to automatically fix page orientation

3. **Recognize Text**
   - Select the desired language from the dropdown menu
   - Choose to process the current image or all images
   - Click "Recognize Text" to start OCR processing
   - View the recognized text in the right panel

4. **Export Results**
   - Select output format (with or without text layer)
   - Click "Save as PDF" to export the document

5. **Manage Images**
   - Click "Remove Selected Image" to delete the currently selected image
   - Click "Remove All Images" to clear all images


## Dynamic Web TWAIN Resources

- [Official Website](https://www.dynamsoft.com/web-twain/overview/)
- [Documentation](https://www.dynamsoft.com/web-twain/docs/introduction/index.html)
