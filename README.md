# Dynamic Web TWAIN Examples
A collection of quickstart samples demonstrating the [Dynamic Web TWAIN APIs](https://www.dynamsoft.com/web-twain/overview/) for document scanning, uploading, editing, and more.

## Try it online

The `examples/pdf-image-annotation` sample runs as a hosted, no-install demo — open PDFs and images, capture pages from a camera or a TWAIN scanner, detect document edges, read barcodes and MRZ, annotate and redact, then export to PDF or images:

**https://www.dynamsoft.com/codepool/demos/pdf-image-annotation/**

## Prerequisites
- [30-day Trial License key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)
- [HTTP Server](https://www.npmjs.com/package/http-server)
    
    ```bash
    npm install -g http-server
    ```
    
## Supported Platforms
- Windows
- macOS
- Linux

## Installation

The samples load the SDK from a CDN or from npm, so the desktop service installers are not
stored in this repository. Pick one of the three options below.

- CDN (recommended):
  ```html
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/dwt@19.5.0/dist/dynamsoft.webtwain.min.js"></script>

  <script type="text/javascript">
      Dynamsoft.DWT.ResourcesPath = 'https://cdn.jsdelivr.net/npm/dwt@19.5.0/dist';
      // jsDelivr refuses files above 20 MB, so the service installers come from unpkg.
      Dynamsoft.DWT.ServiceInstallerLocation = 'https://unpkg.com/dwt@19.5.0/dist/dist/';
  </script>
  ```

- [NPM Package](https://www.npmjs.com/package/dwt)

    1. Install the package:
        
        ```bash
        npm install dwt
        ```    

    2. Import the package in your HTML file:
        ```javascript
        <script src="node_modules/dwt/dist/dynamsoft.webtwain.min.js"></script>

        <script type="text/javascript"> 
            Dynamsoft.DWT.ResourcesPath = 'node_modules/dwt/dist/';
        </script>
        ```

- [Full Package](https://www.dynamsoft.com/web-twain/downloads/) — offline deployment only.

    1. Extract the package and copy its `dist` folder (the one containing
       `dynamsoft.webtwain.min.js` and the `dist/` installers) to your project.

    2. Import the script in your HTML file:
        ```html
        <script type="text/javascript" src="Resources/dynamsoft.webtwain.min.js"></script>
    
        <script type="text/javascript"> 
            Dynamsoft.DWT.ResourcesPath = 'Resources/';
        </script>
        ```

    > Since v19 the SDK is a single `dynamsoft.webtwain.min.js` file. The older
    > `dynamsoft.webtwain.initiate.js` + `dynamsoft.webtwain.config.js` pair no longer exists;
    > configuration is passed in an inline script block.
    
## Windows Virtual Scanner 
Install the [Virtual Scanner](https://download.dynamsoft.com/tool/twainds.win32.installer.2.1.3.msi) on Windows. The virtual scanner allows you to test the document scanning features without a physical scanner.

You can also get the [virtual scanner source code](https://github.com/yushulx/windows-virtual-scanner) and customize it.

## Examples
- [Basic Scan](./examples/basic_scan/)
- [Custom UI](./examples/custom_ui/)
- [Image Tag](./examples/image_tag/)
- [ASP.NET MVC](./examples/asp_dotnet_upload/)
- [Node.js](./examples/node_upload/)
- [Golang](./examples/golang_upload/)
- [Python Django](./examples/python_upload/)
- [PHP Laravel](./examples/php_laravel/)
- [Polymer](./examples/polymer/)
- [Express Jade](./examples/jade/)
- [Electron](./examples/electron/)
- [Angular](./examples/angular/)
- [Python Qt](./examples/qt/)
- [Flutter Windows Desktop](./examples/flutter_windows_desktop/)
- [Web Document Viewer](./examples/document_viewer/)
- [RESTful API Example](./examples/rest_api/)
- [Mobile Camera](./examples/mobile_camera/)
- [Flutter Android WebView](./examples/flutter_android_webview/)

### Tutorial samples

The samples below started life as standalone repositories linked from the
[blog posts](https://www.dynamsoft.com/codepool/). They are kept here so the code that the
articles reference is versioned and updated together with the rest of the repository.

- [Burn PDF Annotation](./examples/Burn-PDF-Annotation/)
- [Chat with Scanned Documents](./examples/Chat-with-Scanned-Documents/)
- [Color Conversion](./examples/Color-Conversion-JavaScript/)
- [Flip Image](./examples/Flip-Image-JavaScript/)
- [Full-Text Search of Scanned Documents](./examples/Full-Text-Search-of-Scanned-Documents/)
- [Image Converter](./examples/Image-Converter/)
- [Next.js Document Scanner](./examples/NextJS-Document-Scanner/)
- [Nuxt.js Document Scanner](./examples/NuxtJS-Document-Scanner/)
- [PDF Encryption](./examples/PDF-Encryption-JavaScript/)
- [PDF2Image](./examples/PDF2Image/)
- [Resize Image](./examples/Resize-Image-JavaScript/)
- [Rotate Image](./examples/Rotate-Image-JavaScript/)
- [Scan and Save to Client-Side Storage](./examples/Scan-and-Save-to-Client-Side-Storage/)
- [Scan to Email](./examples/Scan-to-Email/)
- [Scan to WebDAV](./examples/Scan-to-WebDAV/)
- [Sync Scanned Documents](./examples/Sync-Scanned-Documents/)
- [TIFF Viewer](./examples/TIFF-Viewer/)
- [Tauri Document Scanner](./examples/Tauri-Document-Scanner/)
- [Web TWAIN Tesseract](./examples/Web-TWAIN-Tesseract/)
- [Angular Document Scanner](./examples/angular-document-scanner/)
- [Clean and Repair Scanned Documents](./examples/clean-and-repair-scanned-documents/)
- [Deskew](./examples/deskew/)
- [Document Scanner Chrome Extension](./examples/document-scanner-chrome-extension/)
- [Document Scanner Lit Element](./examples/document-scanner-lit-element/)
- [Document Viewer Samples](./examples/document-viewer-samples/)
- [Electron Quasar Document Scanner](./examples/electron-quasar-document-scanner/)
- [Image Compression](./examples/image-compression-javascript/)
- [Image Filter](./examples/image-filter/)
- [Mobile Document Scanning](./examples/mobile-document-scanning/)
- [OpenCV.js Document Scanner](./examples/opencvjs-document-scanner/)
- [PDF Viewer Component](./examples/pdfviewer-component/)
- [Quality Evaluation of Scanned Document Images](./examples/quality-evaluation-of-scanned-document-images/)
- [Scan Optimization](./examples/scan-optimization/)
