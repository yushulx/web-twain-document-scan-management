# Dynamsoft Document Viewer

![version](https://img.shields.io/npm/v/dynamsoft-document-viewer.svg)
![downloads](https://img.shields.io/npm/dm/dynamsoft-document-viewersvg) 
![jsdelivr](https://img.shields.io/jsdelivr/npm/hm/dynamsoft-document-viewer.svg)

[Dynamsoft Document Viewer (DDV)](https://www.dynamsoft.com/document-viewer/docs/introduction/index.html) is a browser-based JavaScript SDK designed for viewing and editing images and PDFs. It provides a wide range of functionalities, including PDF annotation, page manipulation, image quality enhancement, and document saving.

#### Security
Dynamsoft Document Viewer is independently developed and does not rely on any external third-party open-source software. All processing, such as rendering and editing, is securely performed within the browser using a web assembly module. This architecture eliminates the need for a server-side backend, ensuring security compliance and scalability.

####  Browser and Platform Compatibility
Dynamsoft Document Viewer is designed to work seamlessly across different browsers and platforms. It is compatible with major browsers like Chrome, Firefox, Safari, and Edge, ensuring a consistent user experience. Additionally, it supports various operating systems, including Windows, macOS, Linux, iOS, and Android, allowing users to access documents from any device.

#### Supported File Types
Users can open, edit, and save PDFs, as well as various image formats such as JPEG, PNG, BMP, TIFF, and GIF.

#### Annotation Types
Dynamsoft Document Viewer supports a variety of annotation types to enhance document interaction and collaboration. Users can add, edit, and delete annotations such as:

- text
- images
- signature
- shapes
- stamps
- freehand drawings

#### Data Management Concepts
Dynamsoft Document Viewer organizes data using two main concepts: “document” and “page.” A document can contain one or multiple pages, and each page must belong to a single document.

Page: The smallest unit of data management, currently represented as an image. Each page has a unique pageUid.
Document: A collection of pages, each with a unique docUid. Documents collectively make up the entire data set.
Managing data, therefore, involves managing documents and pages.

If you are using the default UI of DDV, data processing and management are handled internally.

#### UI Customization
The SDK offers extensive customization options, enabling developers to tailor the interface, toolbar, and annotation tools to meet specific application needs and branding requirements.

#### Designed with Camera Capture in Mind
Dynamsoft Document Viewer is designed for seamless integration with camera capture. It features five built-in viewer types, with the first three optimized for camera capture scenarios:
- Edit Viewer: Provides image quality enhancement filters.

- Capture Viewer: Includes built-in camera control for continuous capture.

- Perspective Viewer: Equipped with document cropping features; for document detection, using Dynamsoft Document Normalizer is recommended.

- Browse Viewer

- Custom Viewer

As part of the Mobile Web Capture solution, this viewer helps developers create efficient, accurate, and user-friendly workflows, from camera capture to document finalization.

## Table of Contents

- [System Requirements](#system-requirements)
- [License Key](#license-key)
- [Adding the dependency](#adding-the-dependency)
- [Creating HelloWorld](#creating-helloworld)
- [Documentation](#documentation)
- [Features](#features)
- [Contact Us](#contact-us)
- [License Agreement](#license-agreement)
- [Changelog](#changelog)

# System Requirements

The SDK requires the following features to work:

- `WebAssembly`, `Blob`, `URL`/`createObjectURL`, `Web Workers`

## Supported Browsers

The following table is a list of supported browsers based on the above requirements:

| Browser Name |             PC                   |   Mobile    |
| :----------: | :------------------------------: | :---------: |
|    Chrome    |             v75+                 |   v75+      |
|   Firefox    |             v69+                 |   v79+      |
|    Safari    |             v14+                 |   v15+      |
|     Edge     |             v79+                 |   v92+      |

Apart from the browsers, the operating systems may impose some limitations of their own that could restrict the use of the SDKs.

## License Key

[![](https://img.shields.io/badge/Get-30--day%20FREE%20Trial%20License-blue)](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## Adding the dependency

Please refer to [this article](https://www.dynamsoft.com/document-viewer/docs/gettingstarted/add_dependency.html).

## Creating HelloWorld

[How to create HelloWorld](https://www.dynamsoft.com/document-viewer/docs/gettingstarted/helloworld.html)

Review the complete code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DDV - HelloWorld</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@latest/dist/ddv.css">
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@latest/dist/ddv.js"></script>
</head>
<style>
    html,body {
        width: 100%;
        height: 100%;
        margin:0;
        padding:0;
        overscroll-behavior-y: none;
        overflow: hidden;
    }

    #container {
        width: 100%;
        height: 100%;
    }
</style>
<body>
    <div id="container"></div>
</body>
<script type="module">
    (async () => {
        // Public trial license which is valid for 24 hours
        // You can request a 30-day trial key from https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
        Dynamsoft.DDV.Core.license = "DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9";
        Dynamsoft.DDV.Core.engineResourcePath = "https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@latest/dist/engine";
        await Dynamsoft.DDV.Core.init();
        Dynamsoft.DDV.setProcessingHandler("imageFilter", new Dynamsoft.DDV.ImageFilter());
        const editViewer = new Dynamsoft.DDV.EditViewer({
            container: "container",
            uiConfig: Dynamsoft.DDV.getDefaultUiConfig("editViewer", {includeAnnotationSet: true}),
        });
    })();
</script>
</html>
```

## Documentation

* [Developer's Guide](https://www.dynamsoft.com/document-viewer/docs/introduction/index.html)
* [API Reference](https://www.dynamsoft.com/document-viewer/docs/api/index.html)

## Features

Generally, the features of DDV can be divided to two parts as below.

### Data Management

Data management is to manage the data which is imported into DDV. It is managed from the following three aspects:

- Document Management: Document creation/deletion/merging, etc.
- Page management: Pages in documents loading/saving/deleting/moving, etc.
- Annotation management:  Adding/deleting/selecting/dragging/resizing/rotating annotations, etc. 

### Viewers

Viewers are used to display the data. According to the different uses of viewers, DDV provides five different viewer types, which are implemented through five viewer classes.

- Edit Viewer: Edit the pages in document, such as, rotating, cropping, filtering, annotating, etc. and adjust the layout of the display.
- Capture Viewer: Control camera, play video stream, and capture the images from camera.
- Perspective Viewer: Do page boundary manual adjustment & perspective transformation.
- Browse Viewer: Display pages in multiple-mode, pages can be multiple selected.
- Custom Viewer: No built-in UI or functionality, which is used for creating your own viewer.

[More](https://www.dynamsoft.com/document-viewer/docs/features/index.html)

## Contact Us

[Contact Dynamsoft](https://www.dynamsoft.com/company/contact/) to resolve any issue you encounter with the library.

## License Agreement

https://www.dynamsoft.com/company/license-agreement/

## Changelog

Check out the [release notes](https://www.dynamsoft.com/document-viewer/docs/releasenotes/index.html) of the Dynamsoft Document Viewer.
