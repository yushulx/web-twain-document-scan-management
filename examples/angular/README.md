# Integrating Dynamic Web TWAIN with Angular
This Angular project demonstrates how to use [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) APIs.

https://github.com/yushulx/angular-dynamic-web-twain/assets/2202306/7db0e1d0-efc2-4a54-937a-38ad7640f3d8

## Development Environment

```bash
ng --version

Angular CLI: 13.3.7
Node: 16.13.1
Package Manager: npm 8.1.2
OS: win32 x64

Angular: 13.3.10
... animations, common, compiler, compiler-cli, core, forms
... platform-browser, platform-browser-dynamic, router

Package                         Version
---------------------------------------------------------
@angular-devkit/architect       0.1303.7
@angular-devkit/build-angular   13.3.7
@angular-devkit/core            13.3.7
@angular-devkit/schematics      13.3.7
@angular/cli                    13.3.7
@schematics/angular             13.3.7
ng-packagr                      13.3.1
rxjs                            7.5.5
typescript                      4.6.4

```


## Usage
1. Install the dependencies:
    
    ```bash
    npm install
    ```

2. Apply for a [30-day free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) and update the license key in `dynamic-web-twain.service.ts` file:
    
    ```typescript
    Dynamsoft.DWT.ProductKey = "LICENSE-KEY";
    ```
    
3. Run the Angular application with the following command:
    
    ```bash
    ng serve
    ```

    ![Angular Dynamic Web TWAIN Sample](https://www.dynamsoft.com/codepool/img/2022/10/angular-web-twain-sample.png)


## Blog
[How to Digitize Paper Documents in Angular Web Applications](https://www.dynamsoft.com/codepool/angular-web-paper-document-remote-scan.html)