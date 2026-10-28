var DWObject = null;

function CreateDWT() {
    return new Promise(function (resolve, reject) {
        var success = function (obj) {
            DWObject = obj;
            DWObject.Viewer.bind(document.getElementById('dwtcontrolContainer'));
            DWObject.Viewer.width = "100%";
            DWObject.Viewer.height = "100%";
            DWObject.SetViewMode(2, 2);
            DWObject.Viewer.show();
            resolve(true);
        };

        var error = function (err) {
            resolve(false);
        };

        Dynamsoft.DWT.CreateDWTObjectEx({
            WebTwainId: 'dwtcontrol'
        },
            success,
            error
        );
    })
}

function Scan(options) {
    console.log("options: ");
    console.log(options);
    
    return new Promise(function (resolve, reject) {
        if (DWObject) {

            DWObject.SelectSourceByIndex(options.selectedIndex);
            DWObject.CloseSource();
            DWObject.OpenSource();
            DWObject.IfShowUI = options.showUI;
            DWObject.PixelType = options.pixelType;
            DWObject.Resolution = options.resolution;
            
            var OnAcquireImageSuccess = function () {
                resolve(true);
            }
            var OnAcquireImageError = function () {
                resolve(false);
            }
            DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageError);
        } else {
            reject(false);
        }
    });
    
}

function LoadImage() {
    if (DWObject) {
        DWObject.LoadImageEx('', 5,
            function () {
                console.log('success');
            },
            function (errCode, error) {
                alert(error);
            }
        );
    }
}

function Save() {
    DWObject.IfShowFileDialog = true;
    // The path is selected in the dialog, therefore we only need the file name
    DWObject.SaveAllAsPDF("Sample.pdf",
        function () {
            console.log('Successful!');
        },
        function (errCode, errString) {
            console.log(errString);
        }
    );
}

function GetBase64OfSelected() {
    return new Promise(function (resolve, reject) {

        var success = function (result, indices, type) {
            resolve(result.getData(0, result.getLength()));
        };

        var error = function (errorCode, errorString) {
            reject("error");
        };

        DWObject.ConvertToBase64(
            [DWObject.CurrentImageIndexInBuffer],
            Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG,
            success,
            error
        );
    })
}

function GetScannersList() {
    var scanners = [];
    var count = DWObject.SourceCount;
    for (var i = 0; i < count; i++) {
        scanners.push(DWObject.GetSourceNameItems(i));
    }
    return scanners;
}