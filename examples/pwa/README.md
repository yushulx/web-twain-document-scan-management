# PWA Document Scanner
This project demonstrates how to create a **PWA (Progressive Web App)** document scanner with Dynamsoft Document Viewer.

## Prerequisites
- Obtain a [Dynamsoft Capture Vision Trial License](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)


## Features
- Load and capture documents.
- Edit and annotate documents.
- Save documents to PDF.
- Upload PDF to a web server.

## Usage
1. Run the server project.

    ```bash
    cd server
    npm install
    node index.js
    ```

2. Set the license key in `client/index.html`:

    ```js
    await Dynamsoft.License.LicenseManager.initLicense(
            "LICENSE-KEY",
            true
        );
    ```

3. Change the action URL in `client/index.html`:

    ```js
    async function uploadImage(base64String) {
        return fetch('http://localhost:3000/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64String }),
        });
    }
    ```

4. Host the client project on a web server and visit `http://localhost:8000` in a browser.

    ```bash
    python -m http.server
    ```

