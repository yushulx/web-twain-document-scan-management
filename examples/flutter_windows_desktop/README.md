# Flutter Windows WebView with Dynamic Web TWAIN

The sample demonstrates how to integrate Dynamic Web TWAIN into Windows desktop applications using Flutter WebView.

## Getting Started
1. Apply for a trial license at [https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) and update the license key in `lib/assets/index.html`:
    ```html
    Dynamsoft.DWT.ProductKey = "LICENSE-KEY";
    ```
2. Install the Dynamic Web TWAIN package under the `lib/assets/` folder:
    
    ```bash
    npm install dwt
    ```

3. Install `/lib/assets/node_modules/dwt/dist/dist/DynamsoftServiceSetup.msi`.

4. Run the sample:
    
    ```bash
    flutter run -d windows
    ```

    ![flutter desktop scanner application with Dynamic Web TWAIN](https://www.dynamsoft.com/codepool/img/2023/03/flutter-windows-desktop-web-twain.gif)

## Blog
[How to Integrate Dynamic Web TWAIN into Flutter Windows Desktop Application](https://www.dynamsoft.com/codepool/flutter-windows-desktop-web-twain.html)
