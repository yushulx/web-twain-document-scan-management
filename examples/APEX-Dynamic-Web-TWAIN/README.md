# APEX-Dynamic-Web-TWAIN

APEX Plug-in to scan documents using [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/).

You can install the plugin using `region_type_plugin_com_dynamsoft_dwt.sql`. [Detailed Guide](https://github.com/tony-xlh/APEX-Dynamic-Web-TWAIN/issues/3)

It can display a modal to scan documents and display the selected scanned document in an image element.

The following events are supported:

```
apex.region("region_id").showModal(); => show the document scanner,
apex.region("region_id").hideModal(); => hide the document scanner,
apex.region("region_id").getBase64(); => get the base64 of the scanned document,
apex.region("region_id").getFilename(); => get the filename of the uploaded document. The file is uploaded to a remote server if the host and port are specified.
```

[Online demo](https://apex.oracle.com/pls/apex/r/dynamsoft/dynamsoft-demos/document-scanner)

Attributes:

* width
* height
* host
* port
* license

You can apply for a trial license [here](https://www.dynamsoft.com/customer/license/trialLicense?product=dwt).


## Blog

Check out the blog for details: [How to Scan Documents in an Oracle APEX Application](https://www.dynamsoft.com/codepool/oracle-apex-document-scanning.html)

## Notes about Storing the Scanned Documents

1. You can upload the documents to a remote HTTP server by setting up the host and port. You can find the [details](https://www.dynamsoft.com/codepool/oracle-apex-document-scanning.html#directly-upload-files-to-oracle-apex:~:text=app%20as%20the-,backend%20HTTP%20server,-to%20receive%20and) in the blog.
2. You can get the base64 of the documents and then insert it into the Oracle Database.
3. You can create REST API to upload the images to the database. You can find the [details](https://www.dynamsoft.com/codepool/oracle-apex-document-scanning.html#directly-upload-files-to-oracle-apex) in the blog.

## Self-Hosting

You can put the files of Web TWAIN on the [cdn](https://unpkg.com/dwt@latest/dist/) to static resources to host the files offline.





