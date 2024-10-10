# Building Web Document Scanning Apps with Express and Jade

The sample demonstrates how to build a web document scanning app with [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) and [Node.js Express](https://expressjs.com/).

## Usage
1. Apply for a valid license from [Dynamsoft online portal](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) and then update the license key in `views/index.jade`.

    ```js
    Dynamsoft.DWT.ProductKey = 'LICENSE-KEY';
    ```
    
2. Start the web server:

    ```bash
    npm install
    npm start
    ```

3. Visit `localhost:3000` in a web browser.

    ![web document management with Dynamic Web TWAIN and Node.js Express](https://www.dynamsoft.com/codepool/img/2015/02/express_jade.png)

## Blog
[Document Scanning and Uploading in Node.js with Express and Jade](https://www.dynamsoft.com/codepool/document-scanning-nodejs-express-jade.html)
