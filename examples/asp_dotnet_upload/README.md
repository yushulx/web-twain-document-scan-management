# Web Document Scanning with ASP.NET Core MVC
This is a sample project that guides developer to integrate [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) into an ASP.NET Core MVC project. 

## Prerequisites
- [30-day Trial License Key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## Usage
1. Configure the Dynamic Web TWAIN resource files in `Startup.cs`:

    ```cs
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
    Path.Combine(env.ContentRootPath, "../../sdk")),
        RequestPath = "/lib/dwt"
    });
    ```

2. Replace `LICENSE-KEY` with your own license key in `Views/Home/Index.cshtml`:

    ```html
    Dynamsoft.DWT.ProductKey = "LICENSE-KEY";
    ```

3. Build and run the project:

    ```bash
    dotnet restore
    dotnet run
    ```

4. Try the demo in your web browser.

    ![web document scanning with ASP.NET Core MVC](https://www.dynamsoft.com/codepool/img/2024/02/asp-dotnet-core-mvc-web-twain.png)

## Blog
[Building Web Document Scanning Applications with ASP.NET Core MVC](https://www.dynamsoft.com/codepool/asp-dotnet-core-document-scanning.html)
