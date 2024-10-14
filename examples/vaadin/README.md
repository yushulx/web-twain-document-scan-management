# vaadin-document-scan
This is a simple example showing how to integrate Dynamic Web TWAIN into [Vaadin](https://vaadin.com) project. 

## License
Get a [FREE 30-day trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform).

## Usage
1. Install [Maven](https://maven.apache.org/download.cgi?Preferred=ftp://mirror.reverse.net/pub/apache/).
2. Install [Visual Studio Code Java Pack](https://code.visualstudio.com/docs/languages/java)
3. Open the project in `VSCode`.
4. Edit `main\webapp\frontend\src\scan.js` to set a valid license:

    ```js
    Dynamsoft.DWT.ProductKey = 'LICENSE-KEY';
    ```

5. Press `F5` to run the project.
6. Open `localhost:8080` in your web browser.

    ![vaadin document scan](https://www.dynamsoft.com/codepool/img/2019/06/vaadin-dynamic-web-twain.png)

## Blog
[How to Integrate Dynamic Web TWAIN into Vaadin Platform](https://www.dynamsoft.com/codepool/integrate-dynamic-web-twain-vaadin.html)
