# Dynamic Web TWAIN Sample: Ruby on Rails
The sample demonstrates how to integrate Dynamic Web TWAIN into Ruby on Rails project.

## Installation
- [Dynamic Web TWAIN 17.0](https://www.dynamsoft.com/web-twain/downloads)
- Ruby 2.5.1
    
    ```bash
    sudo apt install ruby-full
    ```
- Sqlite3 3.22.0
    
    ```bash
    sudo apt install sqlite
    ```

- Rails 6.1.3.2
    
    ```bash
    gem install rails
    ```

## Deployment
1. Copy `Resources` folder from `<Dynamic Web TWAIN installation directory>` to `public` folder.   
2. Get a [valid license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) and set the license in `app/views/twainscanning/home.html.erb`:
    
    ```js
    Dynamsoft.DWT.ProductKey = "";
    ``` 
3. Run the project:
    
    ```bash
    bundle install
    bin/rails server
    ``` 
4. Open **http://localhost:3000** in your web browser.

![Dynamic Web TWAIN with Ruby on Rails](https://www.dynamsoft.com/codepool/img/2021/06/ruby-rails-document-management.png)



Blog
----
[How to Load, Scan and Upload Files with Ruby on Rails](https://www.dynamsoft.com/codepool/ruby-rails-scan-upload-file.html)

