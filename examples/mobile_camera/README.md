# Capturing Documents with Mobile Camera 
The sample showcases a scenario where documents can be captured using a mobile camera and uploaded as images to a remote document management system that has been developed using [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/). The images are loaded into the image viewer of Dynamic Web TWAIN and can be processed further.

## Usage
1. Install all Node.js dependencies with `npm install`:
    ```bash
    npm install
    ```
2. Create a SQLite3 database:
    ```bash
    npm creatdb.js
    ```
3. Apply for a [trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) of Dynamic Web TWAIN and replace the license key in `index.html`:
    ```js
    Dynamsoft.DWT.ProductKey = "LICENSE-KEY";
    ```

4. Start the web server:
    ```bash
    node app.js
    ```

    https://user-images.githubusercontent.com/2202306/226501588-8e7dec62-63d7-4862-8685-00a1129761d4.mp4

## Blog
[How to Capture Documents On the Go and Collaborate with Web TWAIN Scanning SDK](https://www.dynamsoft.com/codepool/web-document-scanning-mobile-capture.html)
