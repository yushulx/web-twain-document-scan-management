# Scan Document and Read Barcode with Qt Web Engine and Python
This desktop application, developed with Qt and Python, leverages [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/docs/info/api/?ver=latest) and [Dynamsoft Barcode Reader](https://www.dynamsoft.com/barcode-reader/docs/server/programming/python/user-guide.html) to implement document scanning and barcode recognition.

## Prerequisites

**Dynamic Web TWAIN License**

[![](https://img.shields.io/badge/Get-30--day%20FREE%20Trial%20License-blue)](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

**Dynamsoft Barcode Reader License**

[![](https://img.shields.io/badge/Get-30--day%20FREE%20Trial%20License-blue)](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## Installation

```bash
pip install -r requirements.txt
npm install
```

## Usage
1. Set the Dynamic Web TWAIN license key in the `index.html` file:
    
    **JavaScript**

    ```js
    Dynamsoft.DWT.ProductKey = "LICENSE-KEY";
    ```
    
    **Python**

    ```python
    reader.init_license('LICENSE-KEY')
    ```
    
    
2. Set the Dynamsoft Barcode Reader license key in the `app.py` file:

    ```python
    reader.init_license('LICENSE-KEY')
    ```

3. Run the application:    

    ```bash
    python app.py
    ```  
    
    ![Qt application: document scanning and barcode recognition](https://www.dynamsoft.com/blog/wp-content/uploads/2021/11/qt-scan-document-read-barcode.jpg)

## Windows Virtual Scanner
If you don't have a physical scanner, you can use the [https://github.com/yushulx/windows-virtual-scanner](https://github.com/yushulx/windows-virtual-scanner) to build and install a virtual scanner, allowing you to scan custom image sets.

## Blog
[Building a Document Scanning and Barcode Recognition Application with Qt Python](https://www.dynamsoft.com/codepool/qt-document-scanning-barcode-recognition.html)
