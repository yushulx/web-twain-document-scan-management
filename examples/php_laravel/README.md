# Web Document Scanning in PHP Laravel
This sample demonstrates how to develop a web application for scanning and uploading documents using [Laravel](https://laravel.com) and the [Dynamic Web TWAIN SDK](https://www.dynamsoft.com/web-twain/overview/).

## Prerequisites
- [PHP](https://www.php.net/downloads.php) 
- [Composer](https://getcomposer.org/download/)
- Laravel:
    
    ```
    composer global require laravel/installer
    ```

- [Dynamic Web TWAIN Trial License](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## How to Run This Sample
1. Enter the license key in `resources\views\dwt_upload.blade.php`:

    ```php
    Dynamsoft.DWT.ProductKey = 'LICENSE-KEY';
    ```

2. Activate the `fileinfo` extension in `php.ini`:

    ![php fileinfo extension](https://www.dynamsoft.com/codepool/img/2019/08/php-ini-extension.png)

3. Start the web server:

    ```
    composer update
    composer install
    php artisan serve
    ```

4. Visit `http://127.0.0.1:8000/dwt_upload` in your web browser.

    ![php fileinfo extension](https://www.dynamsoft.com/codepool/img/2024/04/php-laravel-twain-document-scan-upload.jpg)


## Blog
[How to Scan and Upload Documents in PHP Laravel Project](https://www.dynamsoft.com/codepool/scan-upload-document-image-laravel-php.html)
