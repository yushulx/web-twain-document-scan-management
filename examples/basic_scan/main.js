var selectSources = document.getElementById("sources");
var sourceList = [];
Dynamsoft.DWT.ProductKey = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
Dynamsoft.DWT.ResourcesPath = "node_modules/dwt/dist/";
var dwtObject = null;
Dynamsoft.DWT.CreateDWTObjectEx({ "WebTwainId": "container" }, (obj) => {
    dwtObject = obj;

    dwtObject.Viewer.bind(document.getElementById("document-container"));
    dwtObject.Viewer.width = 640;
    dwtObject.Viewer.height = 640;
    dwtObject.Viewer.show();
    onReady();
}, (errorString) => {
    console.log(errorString);
});

function onReady() {
    if (dwtObject != null) {

        dwtObject.IfShowUI = false;
        // https://www.dynamsoft.com/web-twain/docs/info/api/Dynamsoft_Enum.html
        dwtObject.GetDevicesAsync(Dynamsoft.DWT.EnumDWT_DeviceType.TWAINSCANNER | Dynamsoft.DWT.EnumDWT_DeviceType.TWAINX64SCANNER | Dynamsoft.DWT.EnumDWT_DeviceType.ESCLSCANNER).then((sources) => {
            sourceList = sources;

            selectSources.options.length = 0;
            for (let i = 0; i < sources.length; i++) {
                let option = document.createElement("option");
                option.text = sources[i].displayName;
                option.value = i.toString();
                selectSources.add(option);
            }
        });
    }
}

function removeAll() {
    if (!dwtObject || dwtObject.HowManyImagesInBuffer == 0)
        return;

    dwtObject.RemoveAllImages();
}

function removeSelected() {
    if (!dwtObject || dwtObject.HowManyImagesInBuffer == 0)
        return;

    dwtObject.RemoveImage(dwtObject.CurrentImageIndexInBuffer);
}

function openImage() {
    if (!dwtObject)
        return;
    dwtObject.Addon.PDF.SetConvertMode(Dynamsoft.DWT.EnumDWT_ConvertMode.CM_RENDERALL);
    let ret = dwtObject.LoadImageEx("", Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL);
}

function acquireImage() {
    if (!dwtObject)
        return;

    if (selectSources) {
        var pixelTypeInputs = document.getElementsByName("PixelType");
        for (var i = 0; i < pixelTypeInputs.length; i++) {
            if ((pixelTypeInputs[i]).checked) {
                pixelType = (pixelTypeInputs[i]).value;
                break;
            }
        }
        dwtObject.SelectDeviceAsync(sourceList[selectSources.selectedIndex]).then(() => {

            return dwtObject.OpenSourceAsync()

        }).then(() => {

            return dwtObject.AcquireImageAsync({
                IfFeederEnabled: document.getElementById("ADF").checked,
                PixelType: pixelType,
                Resolution: parseInt(document.getElementById("Resolution").value),
                IfDisableSourceAfterAcquire: true
            })

        }).then(() => {

            if (dwtObject) {

                dwtObject.CloseSource();

            }

        }).catch(

            (e) => {

                console.error(e)

            }

        )
    } else {
        alert("No Source Available!");
    }
}

function downloadDocument() {
    if (dwtObject) {
        if ((document.getElementById("imgTypejpeg")).checked == true) {
            if (dwtObject.GetImageBitDepth(dwtObject.CurrentImageIndexInBuffer) == 1)
                dwtObject.ConvertToGrayScale(dwtObject.CurrentImageIndexInBuffer);
            dwtObject.SaveAsJPEG("DynamicWebTWAIN.jpg", dwtObject.CurrentImageIndexInBuffer);
        }
        else if ((document.getElementById("imgTypetiff")).checked == true)
            dwtObject.SaveAllAsMultiPageTIFF("DynamicWebTWAIN.tiff");
        else if ((document.getElementById("imgTypepdf")).checked == true)
            dwtObject.SaveAllAsPDF("DynamicWebTWAIN.pdf");
    }
}