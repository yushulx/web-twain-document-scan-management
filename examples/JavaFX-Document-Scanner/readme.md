[Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview) is an SDK which enables document scanning from browsers. Under its hood, a backend service named Dynamsoft Service is running to communicate with scanners via protocols like TWAIN, WIA, eSCL, SANE and ICA. The service runs on Windows, macOS and Linux.

Starting from Dynamic Web TWAIN v18.4, Dynamsoft Service will be accessible via REST APIs so that we can use different programming languages to create document scanning applications.

This repo demonstrates how to access document scanners using the REST APIs in Java. A desktop app is built using JavaFX.

![screenshot](https://github.com/tony-xlh/JavaFX-Document-Scanner/assets/5462205/39332bce-bc21-44a1-9190-163207d4f71b)


Some advantages of using the REST APIs of Dynamsoft Service for document scanning in Java:

* It is cross-platform supporting multiple scanning protocols.
* If we directly call TWAIN API, we have to use JRE 32-bit as most drivers are 32-bit.


## Prerequisites

* You need to install Dynamsoft Service on your device. You can find the download links [here](https://www.dynamsoft.com/codepool/java-twain-document-scanning.html#prerequisites).
* A license for Dynamic Web TWAIN is needed. You can apply for a license [here](https://www.dynamsoft.com/customer/license/trialLicense?product=dwt).

## The Java Library

A Java library is made to wrap the REST API. You can include it in your project via JitPack: <https://jitpack.io/#tony-xlh/docscan4j>
