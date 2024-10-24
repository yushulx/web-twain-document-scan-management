# Dynamic Web TWAIN Examples
A collection of quickstart samples demonstrating the [Dynamic Web TWAIN APIs](https://www.dynamsoft.com/web-twain/overview/) for document scanning, uploading, editing, and more.

## SDK Version
18.5.1

## Prerequisites
- [Dynamic Web TWAIN License key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)
- [HTTP Server](https://www.npmjs.com/package/http-server)
    
    ```bash
    npm install -g http-server
    ```
    
## Supported Platforms
- Windows
- macOS
- Linux

## Installation

- [Full Package](https://www.dynamsoft.com/web-twain/downloads/)
    1. Extract the package and copy the `Resources` folder to your project.
    
    2. Import the scripts in your HTML file:
        ```html
        <script type="text/javascript" src="Resources/dynamsoft.webtwain.initiate.js"></script>
        <script type="text/javascript" src="Resources/dynamsoft.webtwain.config.js"></script>
    
        <script type="text/javascript"> 
            Dynamsoft.DWT.ResourcesPath = 'Resources/';
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

- CDN: 
  ```html
  <script type="text/javascript" src="https://unpkg.com/dwt/dist/dynamsoft.webtwain.min.js"> </script>

  <script type="text/javascript"> 
    Dynamsoft.DWT.ResourcesPath = 'https://unpkg.com/dwt/dist/';
  </script>
  ```
    
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
