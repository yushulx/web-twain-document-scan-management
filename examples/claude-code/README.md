# Web Document Scanner

A simple yet powerful web-based document scanning application built with the latest Dynamic Web TWAIN SDK v19.2.0. This application allows users to scan documents directly from their web browser using TWAIN-compatible scanners with enhanced performance and image quality features.

https://github.com/user-attachments/assets/ebe22c6b-03b2-443e-9cae-9854e29cd39d

## Online Demo
[https://yushulx.me/web-twain-document-scan-management/examples/claude-code/](https://yushulx.me/web-twain-document-scan-management/examples/claude-code/)

## 🌟 Features

- 🔍 **Document Scanning**: Scan documents directly from TWAIN-compatible scanners
- 📁 **File Loading**: Load existing images from local storage
- 🎨 **Multiple Formats**: Support for Black & White, Grayscale, and Color scanning
- ⚙️ **Configurable Settings**: Adjustable resolution (100-600 DPI) and pixel type
- 💾 **Enhanced PDF Export**: Save scanned documents as PDF files with improved compression
- 🗑️ **Image Management**: Remove selected images or clear all images
- 🖼️ **Advanced Image Preview**: Real-time preview with enhanced viewer capabilities
- 📄 **Better Image Quality**: Enhanced scanning algorithms for improved document quality
- ⌨️ **Keyboard Shortcuts**: Ctrl+S to save, Delete to remove, Spacebar to scan
- 🌐 **Network Awareness**: Offline/online status detection
- 💾 **Enhanced PDF Export**: Save scanned documents as PDF files with improved compression
- 🗑️ **Image Management**: Remove selected images or clear all images

## Setup Instructions

### Prerequisites

1. **Dynamic Web TWAIN License**: You need a valid license key from Dynamsoft
   - Get a free trial license at: https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
   - For production use, purchase a license at: https://www.dynamsoft.com/web-twain/

2. **TWAIN Driver**: Install TWAIN drivers for your scanner
   - Most modern scanners come with TWAIN drivers
   - Check your scanner manufacturer's website for the latest drivers

### Installation

1. **Clone or Download** this project to your local machine

2. **Configure License Key**:
   - Open `script.js`
   - Replace `YOUR_PRODUCT_KEY_HERE` with your actual Dynamic Web TWAIN license key:
   ```javascript
   Dynamsoft.DWT.ProductKey = "YOUR_ACTUAL_LICENSE_KEY";
   ```

3. **Serve the Application**:
   - You must serve the application through a web server (not file:// protocol)
   - Options:
     - **Using Python**: `python -m http.server 8000`
     - **Using Node.js**: `npx http-server`
     - **Using Live Server**: VS Code extension
     - **Using any web server**: Apache, Nginx, IIS, etc.

4. **Access the Application**:
   - Open your browser and navigate to `http://localhost:8000` (or your server URL)

## Usage Guide

### 1. Scanner Setup
- Ensure your scanner is connected and powered on
- Install the appropriate TWAIN drivers for your scanner
- The application will automatically detect available scanners

### 2. Scanning Documents
1. Select your scanner from the "Scanner Source" dropdown
2. Choose the desired pixel type (Black & White, Gray, or Color)
3. Set the resolution (100-600 DPI)
4. Click "🔍 Scan Document" to start scanning

### 3. Managing Images
- **Load Image**: Click "📁 Load Image" to load existing image files
- **Save as PDF**: Click "💾 Save as PDF" to export all scanned images as a PDF
- **Remove Selected**: Click "🗑️ Remove Selected" to delete the currently selected image
- **Remove All**: Click "🗑️ Remove All" to clear all images

### 4. Viewing Images
- Images appear in the viewer panel on the right
- Use mouse wheel or navigation controls to zoom and pan
- Click on different images in the thumbnail view to switch between them

## Browser Compatibility

- ✅ **Chrome 57+**
- ✅ **Firefox 52+**
- ✅ **Safari 11+**
- ✅ **Edge 79+**
- ❌ Internet Explorer (not supported)

## Technical Details

### Dependencies
- **Dynamic Web TWAIN SDK 19.2.0**: Latest version with enhanced scanning features
- **HTML5**: Modern web standards
- **CSS3**: Responsive design and animations
- **Vanilla JavaScript**: No additional frameworks required

### File Structure
```
├── index.html          # Main HTML file
├── style.css           # Stylesheet with responsive design
├── script.js           # JavaScript application logic
└── README.md          # This documentation
```

## Blog
[Build a Web Document Scanner with Claude Code AI and Dynamic Web TWAIN (10-Minute Tutorial)](https://www.dynamsoft.com/codepool/claude-code-ai-agent-web-document-scanning.html)
