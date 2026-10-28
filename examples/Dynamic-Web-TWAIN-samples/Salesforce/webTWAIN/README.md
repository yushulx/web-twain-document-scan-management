# Web TWAIN Salesforce DX Project

This is a demo project accessing document scanners via [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) in a lightning web component.

It contains several lightning web components:

* [webTWAIN](./force-app/main/default/lwc/webTWAIN). The standard way directly using the JavaScript library of Web TWAIN. It needs extra setups of things like trusted URLs.
* [webTWAINiframe](./force-app/main/default/lwc/webTWAINiframe) (**recommended**). The iframe version which embeds the document scanner in an iframe to bypass some restrictions of Salesforce.
* [webTWAINREST](./force-app/main/default/lwc/webTWAINREST). The REST version which communicates with Dynamsoft Service via REST API.
* [barcodeScanner](./force-app/main/default/lwc/barcodeScanner). Scan barcodes with Dynamsoft Barcode Reader.

## The iframe Approach

Since Salesforce has many restrictions, it is recommended to use the iframe approach.

Basic steps for using it:

1. Write a document scanning page and put it under `staticresources`.
2. Embed the page in LWC via iframe. Since Chrome 142 with the new local network access permission restriction, we need to set its `allow` attribute to `local-network-access *`.
3. We can control the scanning page and get the scanning results via `postMessage`.


## Demo Videos

Using the default JavaScript library:



https://github.com/tony-xlh/Dynamic-Web-TWAIN-samples/assets/5462205/9fafc9a1-e8fc-4efb-a5ec-6452c46951b4




Using the REST API:

https://github.com/tony-xlh/Dynamic-Web-TWAIN-samples/assets/5462205/0d40e925-1fa1-4074-92af-9ae301944570


Barcode Scanning:



https://github.com/user-attachments/assets/d1a3e387-83fc-4dd2-93cd-7adfa53f5149



For details, please check out this blog: [Access Document Scanners in Salesforce's Lightning Web Component](https://www.dynamsoft.com/codepool/document-scanner-lightning-web-component-in-salesforce.html)


## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
