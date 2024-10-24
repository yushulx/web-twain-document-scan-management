# Web Document Scanning with ASP.NET Core MVC
This is a sample project that guides developer to integrate [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) into an ASP.NET Core MVC project. 

## Requirement
- [Dynamic Web TWAIN v18.5.1](https://www.dynamsoft.com/web-twain/downloads/)
- [Dynamic Web TWAIN License key](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)

## Usage
1. Configure the static files in `Startup.cs`:

    ```cs
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(
    Path.Combine(env.ContentRootPath, "../../sdk")),
        RequestPath = "/lib/dwt"
    });
    ```

2. Request a [free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) and then update the license key in `Views/Home/Index.cshtml`:

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
