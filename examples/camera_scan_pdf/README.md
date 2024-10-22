# Cross-Platform Document PDF Scanner with .NET MAUI Blazor

This repository demonstrates how to create a cross-platform document PDF scanner app using .NET MAUI Blazor and the [Dynamsoft Mobile Web Capture SDK](https://www.dynamsoft.com/use-cases/mobile-web-capture-sdk/). It supports document capturing, image editing, and PDF generation.

https://github.com/user-attachments/assets/70a51cea-aba6-402d-9007-aeabd8aae10c

## Features

- **Cross-Platform Compatibility**: Runs on **Android**, **iOS**, and **Windows**.
- **Camera Integration**: Utilizes device cameras for document scanning.
- **PDF Generation**: Converts scanned documents into PDF files.
- **User-Friendly Interface**: Provides a simple and intuitive user interface.

## Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/en-us/download/dotnet)
- [Visual Studio 2022](https://visualstudio.microsoft.com/vs/) or [Visual Studio Code](https://code.visualstudio.com/)
- [Dynamsoft Capture Vision Trial License](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform)


## Getting Started

1. Set the license key in `Components/Pages/Home.razor`:

    ```csharp
    initialized = await JSRuntime.InvokeAsync<Boolean>("initSDK", "LICENSE-KEY");
    ```

2. Build and run the app in Visual Studio 2022 or Visual Studio Code.

    **Android**
   
    <img src="https://www.dynamsoft.com/codepool/img/2024/08/document-pdf-scanner.jpg" width="300" alt="document PDF scanner with .NET MAUI Blazor">

    **iPadOS**
   
    <img src="https://www.dynamsoft.com/codepool/img/2024/08/document-pdf-scanner-ipados.PNG" width="300" alt="document PDF scanner with .NET MAUI Blazor">

    **Windows**
   
    <img src="https://www.dynamsoft.com/codepool/img/2024/08/document-pdf-scanner-windows.png" width="300" alt="document PDF scanner with .NET MAUI Blazor">
