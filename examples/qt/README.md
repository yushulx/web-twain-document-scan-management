# Scan Document and Read Barcode with Qt Web Engine and Python
This desktop application, developed with PySide6 and Python, leverages [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/docs/info/api/?ver=latest) and [Dynamsoft Barcode Reader](https://www.dynamsoft.com/barcode-reader/docs/server/programming/python/user-guide.html) to implement document scanning and barcode recognition.

## Prerequisites
[![](https://img.shields.io/badge/Get-30--day%20FREE%20Trial%20License-blue)](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## Installation

```bash
pip install -r requirements.txt
npm install
```

## Usage
1. Set the license keys in `index.html` and `app.py`:

    **`index.html`** — Dynamic Web TWAIN product key:

    ```js
    Dynamsoft.DWT.ProductKey = "LICENSE-KEY";
    ```

    **`app.py`** — Dynamsoft Barcode Reader license:

    ```python
    LicenseManager.init_license('LICENSE-KEY')
    ```

2. Run the application:

    ```bash
    python app.py
    ```

    ![Qt application: document scanning and barcode recognition](https://www.dynamsoft.com/blog/wp-content/uploads/2021/11/qt-scan-document-read-barcode.jpg)

## Windows Virtual Scanner
If you don't have a physical scanner, you can use [windows-virtual-scanner](https://github.com/yushulx/virtual-scanner/tree/main/windows) to build and install a virtual scanner, allowing you to scan custom image sets.

## Blog
[Building a Document Scanning and Barcode Recognition Application with Qt Python](https://www.dynamsoft.com/codepool/qt-document-scanning-barcode-recognition.html)
