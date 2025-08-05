# Document Management App

A modern web-based document management application built with Dynamsoft Web TWAIN SDK that enables document scanning, image processing, and PDF creation with an intuitive drag-and-drop interface.

https://github.com/user-attachments/assets/3b7eee85-50be-4a89-b8ac-385b5e22d22a

## 🌐 Online Demo
https://yushulx.me/web-twain-document-scan-management/examples/split_merge_document/

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- TWAIN-compatible scanner (for scanning functionality)
- [Dynamsoft license key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## 🚀 Features

### Core Functionality
- **Document Scanning**: Direct scanning from TWAIN-compatible scanners
- **Image Loading**: Upload and import existing image files
- **PDF Generation**: Create multi-page PDF documents from scanned images
- **Drag & Drop Reordering**: Intuitive page reordering within and between documents
- **Document Splitting**: Split documents at any page to create separate files

### Advanced Features
- **Multi-Selection**: Select multiple images with Ctrl+Click and Shift+Click
- **Context Menu**: Right-click operations for split, delete, and multi-delete
- **Real-time Preview**: Live thumbnail previews with proper aspect ratio
- **License Management**: Support for both trial and full licenses
- **Responsive Design**: Modern UI that works on desktop and mobile devices

### User Interface
- **Modern Design**: Clean, professional interface with system fonts
- **License Activation**: Built-in license management with trial option
- **Status Indicators**: Visual feedback for license status and operations
- **Notifications**: Toast notifications for user feedback
- **Accessibility**: Keyboard navigation and screen reader support



## 🚀 Getting Started

### 1. Download and Setup

```bash
# Clone the repository
git clone https://github.com/yushulx/web-document-management.git
cd web-document-management/examples/split_merge_document
```

### 2. Launch the Application

```bash
python -m http.server 8000
```

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

## 🎯 Usage Guide

### Initial Setup

1. **License Activation**
   - Enter your Dynamsoft license key
   - Or click "Use Trial License" for evaluation
   - The app will initialize the scanning components

2. **Scanner Setup**
   - Click "📷 Scan Document" 
   - Select your scanner from the list
   - Configure scan settings if needed

### Document Operations

#### Scanning Documents
```javascript
// The app handles scanning automatically
// Click "📷 Scan Document" button
// Select scanner and scan settings
// Images appear in the thumbnail area
```

#### Loading Images
```javascript
// Click "📁 Load Images" button
// Select image files from your computer
// Supported formats: JPEG, PNG, TIFF, BMP, PDF
```

#### Reordering Pages
- **Drag and Drop**: Click and drag thumbnails to reorder
- **Between Documents**: Drag images between different document groups
- **Visual Feedback**: Drop zones highlight during drag operations

#### Document Splitting
- **Right-click** on any image thumbnail
- Select "✂️ Split" from context menu
- Creates a new document starting from that page

#### Saving Documents
- Click "💾 Save File" button on any document
- Saves as multi-page PDF with timestamp filename
- Format: `Scan - DD MMM YYYY HH_MM_SS AM/PM.pdf`

### Advanced Features

#### Multi-Selection
```javascript
// Select multiple images:
// Ctrl + Click: Add/remove individual images
// Shift + Click: Select range of images
// Right-click → "🗑️ Multi Delete" to delete selected
```

#### Context Menu Operations
- **Split**: Create new document from current image
- **Delete**: Remove single image
- **Multi Delete**: Remove all selected images
