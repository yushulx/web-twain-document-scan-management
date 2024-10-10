# Cross-platform Desktop Document Scanner App

This sample demonstrates how to create a desktop document scanning app using [Electron](http://electron.atom.io/docs/latest/tutorial/quick-start) and the [Dynamic Web TWAIN SDK](https://www.dynamsoft.com/web-twain/overview/) for **Windows, Linux and macOS**.

## A Basic Electron Application
Refer to [https://github.com/electron/electron-quick-start](https://github.com/electron/electron-quick-start) for guidance on setting up a basic Electron application, which requires just these files:

- package.json - Points to the app's main file and lists its details and dependencies.
- main.js - Starts the app and creates a browser window to render HTML, serving as the app's main process.
- index.html - The web page that is rendered, acting as the app's renderer process.

## Usage
1. Request a [trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) and update the license key in `index.html`:

      ```js
      Dynamsoft.DWT.ProductKey = 'LICENSE-KEY';
      ```

2. Install the dependencies:
    
    ```bash
    npm install -g electron
    
    cd app
    npm install
    ```

3. Run the app:

    ```bash
    electron .
    # Or 
    # npx electron .
    ```

    ![electron document scanner](https://www.dynamsoft.com/codepool/img/2021/06/electron-document-scanner.png)

## Packaging the App for Distribution
1. Install **asar**.
    
    ```bash
    npm install -g asar
    ```

2. Package the app:

    ```bash
    asar pack app app.asar
    ```

3. Download [Electron prebuilt package](https://github.com/electron/electron/releases) and copy the `app.asar` file to the `resources` folder.
4. Run the app by executing the Electron binary.


## Blog
[Cross-platform Document Scan Application with Electron](https://www.dynamsoft.com/codepool/electron-cross-platform-document-scanning-management.html)
