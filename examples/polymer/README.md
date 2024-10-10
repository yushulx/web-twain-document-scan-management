# Document Scanning with Dynamic Web TWAIN and Polymer

This is a sample project that guides you to build a web document scanning app with [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) and [Polymer](https://polymer-library.polymer-project.org/3.0/docs/devguide/feature-overview).

## Prerequisites
- [Dynamic Web TWAIN License Key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## How to Run
1. Replace `LICENSE-KEY` in `my-view1.js` with your own license key.

    ```html
    Dynamsoft.DWT.ProductKey = 'LICENSE-KEY';
	```

2. Install the project dependencies and start the server.

    ```bash
    npm install
    npm start
    ```

3. Open `http://127.0.0.1:8081/` in your web browser.


    ![Polymer document scan](https://www.dynamsoft.com/codepool/wp-content/uploads/2020/08/polymer-shadow-dom-document-scan.png)

## Blog
[How to Make Dynamic Web TWAIN Work with Polymer Shadow DOM](https://www.dynamsoft.com/codepool/polymer-shadow-dom-web-document-scan.html)
