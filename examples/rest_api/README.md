Effortlessly scan paper documents to web pages using the Dynamic Web TWAIN RESTful API. 

## Pre-requisites
-  Install Dynamsoft Service.
    - Windows: [Dynamsoft-Service-Setup.msi](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.msi)
    - macOS: [Dynamsoft-Service-Setup.pkg](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.pkg)
    - Linux: 
        - [Dynamsoft-Service-Setup.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.deb)
        - [Dynamsoft-Service-Setup-arm64.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup-arm64.deb)
        - [Dynamsoft-Service-Setup-mips64el.deb](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup-mips64el.deb)
        - [Dynamsoft-Service-Setup.rpm](https://demo.dynamsoft.com/DWT/DWTResources/dist/DynamsoftServiceSetup.rpm)

- Obtain a [free trial license](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform) for Dynamic Web TWAIN.

## Online Demo
https://yushulx.me/web-twain-document-scan-management/examples/rest_api/

## Code Snippet
- The host value:

    ```javascript
    const port = window.location.protocol === 'https:' ? 18623 : 18622;
    const host = window.location.protocol + '//' + "local.dynamsoft.com:" + port;
    ```
    

- List wanted scanners:
    
    ```javascript
    async function getDevices(host, scannerType) {
        devices = [];
        let url = host + '/DWTAPI/Scanners'
        if (scannerType != null) {
            url += '?type=' + scannerType;
        }
    
        try {
            let response = await axios.get(url)
                .catch(error => {
                    console.log(error);
                });
    
            if (response.status == 200 && response.data.length > 0) {
                console.log('\nAvailable scanners: ' + response.data.length);
                return response.data;
            }
        } catch (error) {
            console.log(error);
        }
        return [];
    }
    ```

- Trigger the scan and return a job ID:

    ```javascript
    async function scanDocument(host, parameters, timeout = 30) {
        let url = host + '/DWTAPI/ScanJobs?timeout=' + timeout;
    
        try {
            let response = await axios.post(url, parameters)
                .catch(error => {
                    console.log('Error: ' + error);
                });
    
            let jobId = response.data;
    
            if (response.status == 201) {
                return jobId;
            }
            else {
                console.log(response);
            }
        }
        catch (error) {
            console.log(error);
        }
    
    
        return '';
    }
    ```
    
- Get scanned images:

    ```javascript
    async function getImages(host, jobId) {
        let images = [];
        let url = host + '/DWTAPI/ScanJobs/' + jobId + '/NextDocument';
        console.log('Start downloading images......');
        while (true) {
            try {
                const response = await axios({
                    method: 'GET',
                    url: url,
                    responseType: 'arraybuffer',
                });
    
                if (response.status == 200) {
                    const arrayBuffer = response.data;
                    const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
                    const imageUrl = URL.createObjectURL(blob);
    
                    images.push(imageUrl);
                }
                else {
                    console.log(response);
                }
    
            } catch (error) {
                // console.error("Error downloading image:", error);
                console.error('No more images.');
                break;
            }
        }
    
        return images;
    }
    ```
