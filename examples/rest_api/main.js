let activateButton = document.getElementById("activate-button");
let loadingIndicator = document.getElementById("loading-indicator");
let container = document.getElementById("container");
const port = window.location.protocol === 'https:' ? 18623 : 18622;
const host = window.location.protocol + '//' + "127.0.0.1:" + port;
var data = [];

let queryDevicesButton = document.getElementById("query-devices-button");
queryDevicesButton.onclick = async () => {
    let scannerType = ScannerType.TWAINSCANNER | ScannerType.TWAINX64SCANNER;
    let devices = await getDevices(host, scannerType);
    let select = document.getElementById("sources");
    select.innerHTML = '';
    for (let i = 0; i < devices.length; i++) {
        let device = devices[i];
        let option = document.createElement("option");
        option.text = device['name'];
        option.value = JSON.stringify(device);
        select.add(option);
    };
}

let scanButton = document.getElementById("scan-button");
scanButton.onclick = async () => {
    let select = document.getElementById("sources");
    let device = select.value;

    if (device == null || device.length == 0) {
        alert('Please select a scanner.');
        return;
    }

    let inputText = document.getElementById("inputText").value;
    let license = inputText.trim();

    if (license == null || license.length == 0) {
        alert('Please input a valid license key.');
    }

    let parameters = {
        license: license,
        device: JSON.parse(device)['device'],
    };

    parameters.config = {
        IfShowUI: false,
        PixelType: 2,
        //XferCount: 1,
        //PageSize: 1,
        Resolution: 200,
        IfFeederEnabled: false, // Set to true if you want to scan multiple pages
        IfDuplexEnabled: false,
    };


    let jobId = await scanDocument(host, parameters);
    let images = await getImages(host, jobId, 'images');

    for (let i = 0; i < images.length; i++) {
        let url = images[i];

        let img = document.getElementById('document-image');
        img.src = url;

        data.push(url);

        let option = document.createElement("option");
        option.selected = true;
        option.text = url;
        option.value = url;

        let thumbnails = document.getElementById("thumb-box");
        let newImage = document.createElement('img');
        newImage.setAttribute('src', url);
        if (thumbnails != null) {
            thumbnails.appendChild(newImage);
            newImage.addEventListener('click', e => {
                if (e != null && e.target != null) {
                    let target = e.target;
                    img.src = target.src;
                }
            });
        }
    }

}

const ScannerType = {
    // TWAIN scanner type, represented by the value 0x10
    TWAINSCANNER: 0x10,

    // WIA scanner type, represented by the value 0x20
    WIASCANNER: 0x20,

    // 64-bit TWAIN scanner type, represented by the value 0x40
    TWAINX64SCANNER: 0x40,

    // ICA scanner type, represented by the value 0x80
    ICASCANNER: 0x80,

    // SANE scanner type, represented by the value 0x100
    SANESCANNER: 0x100,

    // eSCL scanner type, represented by the value 0x200
    ESCLSCANNER: 0x200,

    // WiFi Direct scanner type, represented by the value 0x400
    WIFIDIRECTSCANNER: 0x400,

    // WIA-TWAIN scanner type, represented by the value 0x800
    WIATWAINSCANNER: 0x800
};

// Get available scanners
async function getDevices(host, scannerType) {
    devices = [];
    // Device type: https://www.dynamsoft.com/web-twain/docs/info/api/Dynamsoft_Enum.html
    // http://local.dynamsoft.com:18622/DWTAPI/Scanners?type=64 for TWAIN only
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

// Create a scan job by feeding one or multiple physical documents
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

// Delete a scan job by job id
async function deleteJob(host, jobId) {
    if (!jobId) return;

    let url = host + '/DWTAPI/ScanJobs/' + jobId;
    console.log('Delete job: ' + url);
    axios({
        method: 'DELETE',
        url: url
    })
        .then(response => {
            // console.log('Status:', response.status);
        })
        .catch(error => {
            // console.log('Error:', error);
        });
}

// Get document image streams by job id
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
