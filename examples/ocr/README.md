# OCR & PDF Web App

A powerful web-based OCR (Optical Character Recognition) application that converts images, TIFFs, and PDFs into searchable PDF documents. The project includes both a complete web application and a standalone OCR library for integration into other web projects.

## 🌐 Online Demo
https://yushulx.me/web-twain-document-scan-management/examples/ocr/

## 🌟 Features

### Web Application
- **Multi-format Support**: Process JPEG, PNG, GIF, BMP, WEBP, multi-page TIFF, and PDF files
- **Multiple OCR Engines**: Choose from Tesseract.js, OCR.space, Google Vision API, and Azure Computer Vision
- **Language Support**: English, Chinese (Simplified/Traditional), Spanish, French, German, Japanese, Russian
- **Interactive Interface**: Drag & drop file upload, real-time progress tracking, text overlay visualization
- **Smart Processing**: Automatically filters out failed OCR pages from final output
- **Export Options**: Download as searchable PDF or plain text

### Standalone OCR Library
- **Framework Agnostic**: Pure JavaScript library for easy integration
- **Progress Callbacks**: Real-time progress tracking for long-running operations
- **Robust Error Handling**: Graceful failure recovery and detailed error reporting
- **Intelligent Page Filtering**: Only includes successfully processed pages in output
- **Compression Support**: Configurable JPEG compression for optimized file sizes

## 🚀 Quick Start

### Running the Web Application

1. **Clone or download** the project files
2. **Open `index.html`** in a modern web browser
3. **Upload a file** by clicking or dragging into the upload area
4. **Select OCR settings** (language and engine)
5. **Add API keys** if using cloud OCR services
6. **Start processing** and download your searchable PDF

### Using the OCR Library in Your Web App

#### 1. Include Dependencies

Add these scripts to your HTML file:

```html
<!-- Required dependencies -->
<script src="https://unpkg.com/tesseract.js@5.0.2/dist/tesseract.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://unpkg.com/utif2@4.1.0/UTIF.js"></script>

<!-- OCR Library -->
<script src="path/to/ocr-lib.js"></script>
```

#### 2. Basic Usage

```javascript
// Create OCR library instance
const ocrLib = new OCRLibrary();

// Convert file to searchable PDF
const fileInput = document.querySelector('#file-input');
fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        // Basic conversion with progress tracking
        const searchablePDF = await ocrLib.convert2searchable(
            file,
            {
                engine: 'tesseract',
                language: 'eng'
            },
            (message, percentage) => {
                console.log(`${message} (${percentage}%)`);
            }
        );

        // Download the result
        const url = URL.createObjectURL(searchablePDF);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'searchable-document.pdf';
        a.click();
        URL.revokeObjectURL(url);

        // Access metadata
        console.log('Processing results:', searchablePDF.metadata);
    } catch (error) {
        console.error('OCR failed:', error);
    }
});
```

#### 3. Advanced Configuration

```javascript
// Using cloud OCR services with custom settings
const advancedConfig = {
    engine: 'google',           // 'tesseract', 'ocr.space', 'google', 'azure'
    language: 'chi_sim',        // Language code
    compressionQuality: 0.8,    // JPEG compression (0.1-1.0)
    apiKeys: {
        google: 'your-google-api-key',
        azure: 'your-azure-api-key'
    }
};

const searchablePDF = await ocrLib.convert2searchable(file, advancedConfig, progressCallback);
```

#### 4. OCR Only (Without PDF Generation)

```javascript
// Perform OCR on a single image
const ocrResult = await ocrLib.performOCR(imageFile, {
    engine: 'tesseract',
    language: 'eng'
});

console.log('Extracted text:', ocrResult.text);
console.log('Word positions:', ocrResult.words);
console.log('Confidence:', ocrResult.confidence);
```

#### 5. Error Handling and Validation

```javascript
try {
    const result = await ocrLib.convert2searchable(file, config, (message, progress) => {
        // Update your UI with progress
        updateProgressBar(progress);
        updateStatusMessage(message);
    });

    // Check processing results
    const { totalPages, successfulPages, failedPages } = result.metadata;
    
    if (failedPages > 0) {
        console.warn(`Warning: ${failedPages} pages failed OCR and were excluded`);
    }
    
    console.log(`Successfully processed ${successfulPages}/${totalPages} pages`);
    
} catch (error) {
    // Handle different error types
    if (error.message.includes('Unsupported file type')) {
        alert('Please select an image, TIFF, or PDF file');
    } else if (error.message.includes('API key required')) {
        alert('Please provide a valid API key for the selected OCR engine');
    } else {
        console.error('OCR processing failed:', error);
    }
}
```

## 📚 API Reference

### OCRLibrary Class

#### Constructor
```javascript
const ocrLib = new OCRLibrary();
```

#### Methods

##### `convert2searchable(blob, config, progressCallback)`
Converts an image, TIFF, or PDF to a searchable PDF.

**Parameters:**
- `blob` (Blob): File blob to process
- `config` (Object): Configuration options
  - `engine` (string): OCR engine - 'tesseract', 'ocr.space', 'google', 'azure'
  - `language` (string): Language code - 'eng', 'chi_sim', 'spa', etc.
  - `apiKeys` (Object): API keys for cloud services
  - `compressionQuality` (number): JPEG compression quality (0.1-1.0)
- `progressCallback` (Function): Optional progress callback `(message, percentage) => {}`

**Returns:** Promise<Blob> - Searchable PDF with metadata

##### `performOCR(blob, config)`
Performs OCR on a single image without PDF generation.

**Parameters:**
- `blob` (Blob): Image file blob
- `config` (Object): OCR configuration options

**Returns:** Promise<Object> - OCR results with text, confidence, and word positions

### Configuration Options

#### OCR Engines
- **tesseract**: Client-side OCR, no API key required
- **ocr.space**: High accuracy, 25,000 requests/month free
- **google**: Google Vision API, highest accuracy, requires API key
- **azure**: Azure Computer Vision, high accuracy, requires API key

#### Language Codes
- `eng` - English
- `chi_sim` - Chinese Simplified
- `chi_tra` - Chinese Traditional
- `spa` - Spanish
- `fra` - French
- `deu` - German
- `jpn` - Japanese
- `rus` - Russian

#### API Key Setup

**Google Vision API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Vision API
3. Create credentials and get your API key

**Azure Computer Vision:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a Computer Vision resource
3. Get your subscription key from the resource

## 🛠️ Integration Examples

### React Integration

```jsx
import React, { useState } from 'react';

function OCRComponent() {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const ocrLib = new window.OCRLibrary();
            const result = await ocrLib.convert2searchable(
                file,
                { engine: 'tesseract', language: 'eng' },
                (message, percentage) => {
                    setStatus(message);
                    setProgress(percentage);
                }
            );

            // Handle successful conversion
            const url = URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'searchable.pdf';
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('OCR failed:', error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileUpload} accept="image/*,.pdf,.tiff" />
            <div>Status: {status}</div>
            <div>Progress: {progress}%</div>
        </div>
    );
}
```

### Vue.js Integration

```vue
<template>
    <div>
        <input type="file" @change="handleFileUpload" accept="image/*,.pdf,.tiff">
        <div>{{ status }}</div>
        <progress :value="progress" max="100"></progress>
    </div>
</template>

<script>
export default {
    data() {
        return {
            progress: 0,
            status: 'Ready'
        };
    },
    methods: {
        async handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            try {
                const ocrLib = new window.OCRLibrary();
                const result = await ocrLib.convert2searchable(
                    file,
                    { engine: 'tesseract', language: 'eng' },
                    (message, percentage) => {
                        this.status = message;
                        this.progress = percentage;
                    }
                );

                // Download result
                const url = URL.createObjectURL(result);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'searchable.pdf';
                link.click();
                URL.revokeObjectURL(url);

            } catch (error) {
                console.error('OCR failed:', error);
                this.status = 'Error: ' + error.message;
            }
        }
    }
};
</script>
```

## 🔧 Dependencies

The OCR library requires these external libraries:

- **Tesseract.js**: Client-side OCR engine
- **PDF.js**: PDF parsing and rendering
- **jsPDF**: PDF generation
- **UTIF.js**: TIFF image processing

All dependencies are loaded via CDN in the examples above, but you can also install them locally:

```bash
npm install tesseract.js jspdf
# PDF.js and UTIF.js are typically loaded via CDN
```

## 🎯 Key Features

### Intelligent Page Filtering
The library automatically excludes pages where OCR fails or produces no text, ensuring clean output:

```javascript
// The result includes metadata about processing
const result = await ocrLib.convert2searchable(file, config);
console.log(result.metadata);
// Output: { totalPages: 5, successfulPages: 4, failedPages: 1, engine: 'tesseract', language: 'eng' }
```

### Progress Tracking
Real-time progress updates help create responsive user interfaces:

```javascript
await ocrLib.convert2searchable(file, config, (message, percentage) => {
    // Update your UI
    document.querySelector('#status').textContent = message;
    document.querySelector('#progress').value = percentage;
});
```

### Robust Error Handling
Comprehensive error handling with specific error messages:

```javascript
try {
    await ocrLib.convert2searchable(file, config);
} catch (error) {
    if (error.message.includes('Unsupported file type')) {
        // Handle file type error
    } else if (error.message.includes('API key required')) {
        // Handle API key error
    } else {
        // Handle other errors
    }
}
```

