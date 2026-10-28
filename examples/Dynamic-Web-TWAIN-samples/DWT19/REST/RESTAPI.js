const WebTWAINService = {
    endPoint: "https://127.0.0.1:18623",
    license: "",
    listScanners: async function() {
        let requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        let response = await fetch(this.endPoint+"/api/device/scanners", requestOptions);
        scanners = await response.json();
        return scanners;
    },
    CreateScanJob: async function(device,config){
        let myHeaders = new Headers();
        myHeaders.append("DWT-PRODUCT-KEY", this.license);
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
            "autoRun": true,
            "device": device,
            "config": config
        });
        console.log(raw);
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw
        };

        let response = await fetch(this.endPoint+"/api/device/scanners/jobs", requestOptions);
        console.log(response);
        if (response.status === 201) {
            let object = await response.json();
            console.log(object);
            jobuid = object.jobuid;
            return jobuid;
        }
        let errorMessage = "";
        try {
            let object = await response.json();
            errorMessage = object.message;
        } catch (error) {}
        throw new Error("Failed to create scan job: " + response.status + errorMessage ?? "");
    },
    nextPage: async function (){
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        let response = await fetch(this.endPoint+"/api/device/scanners/jobs/"+jobuid+"/next-page", requestOptions);
        console.log(response);
        if (response.status === 200) {
            let blob = await response.blob();
            return blob;
        }
        return undefined;
    },
    nextPageInfo: async function (){
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };
        let response = await fetch(this.endPoint+"/api/device/scanners/jobs/"+jobuid+"/next-page-info", requestOptions);
        console.log(response);
        if (response.status === 200) {
            let object = await response.json();
            console.log(object);
            return object;
        }
        return undefined;
    },
    createDocument: async function() {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = "";
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        let response =    await fetch(this.endPoint+"/api/storage/documents", requestOptions)
        let object = await response.json();
        return object.uid;
    },
    insertPage: async function(documentUid, imageurl) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var raw = JSON.stringify({
            "source": imageurl,
        });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        let response = await fetch(this.endPoint+"/api/storage/documents/"+documentUid+"/pages", requestOptions)
        let object = await response.json();
        return object.pages[object.pages.length - 1]; //page uid
    },
    saveDocument: async function(documentUid) {
        var myHeaders = new Headers();
        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };
        let response = await fetch(this.endPoint+"/api/storage/documents/"+documentUid+"/content", requestOptions)
        return await response.blob();
    },
    process: async function(operation,imageurl) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("DWT-PRODUCT-KEY", this.license);
        var raw = JSON.stringify({
            "source": imageurl,
        });
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
        };
        let response = await fetch(this.endPoint+"/api/process/"+operation, requestOptions)
        let object = await response.json();
        return object;
    }
}
