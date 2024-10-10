# React Document Scanning App with Dynamic Web TWAIN
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). It utilizes the [Dynamic Web TWAIN SDK](https://www.dynamsoft.com/web-twain/overview/) to enable document scanning and management features in a React app.

## Features
- **Scan Documents**: Interface with physical document scanners directly from your React app.
- **Load Local Files**: Import and manage local documents in various formats, including BMP, JPG, PNG, TIFF, and PDF.

## Prerequisites
- **Node.js**: Ensure Node.js is installed on your system.
- **Dynamic Web TWAIN License**: Obtain a [free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) for the Dynamic Web TWAIN SDK.

## Getting Started

Follow these steps to set up and run the project:

1. Set the license key in `src/DynamsoftSDK.js`:

    ```js
    Dynamsoft.DWT.ProductKey = 'LICENSE-KEY';
    ```
2. Navigate to the project directory and install the required dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm start
    ```
4. Open `http://localhost:3000` to view the app in your browser.

    ![React web document management](https://www.dynamsoft.com/codepool/img/2021/06/react-web-document-management.gif)
   
## Blog
[React Development: Web Document Management App](https://www.dynamsoft.com/codepool/react-document-scanning-web-twain.html)
