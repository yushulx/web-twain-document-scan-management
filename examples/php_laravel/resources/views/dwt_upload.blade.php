<!DOCTYPE html>
<html>

<head>
    <title>Dynamic Web TWAIN for Laravel</title>
    <script type="text/javascript" src="https://unpkg.com/dwt/dist/dynamsoft.webtwain.min.js"> </script>
    <meta name="_token" content="{{csrf_token()}}" />
</head>

<body>
    <h3>Dynamic Web TWAIN for Laravel</h3>
    <select id="source"></select>
    <div id="dwtcontrolContainer"></div>
    <input type="button" value="Load Image" onclick="loadImage();" />
    <input type="button" value="Scan Image" onclick="acquireImage();" />
    <input id="btnUpload" type="button" value="Upload Image" onclick="upload()">

    <script>
    var dwtObject;
    var deviceList = [];

    window.onload = function() {
        if (Dynamsoft) {
            Dynamsoft.DWT.AutoLoad = false;
            Dynamsoft.DWT.UseLocalService = true;
            Dynamsoft.DWT.Containers = [{
                ContainerId: 'dwtcontrolContainer',
                Width: '640px',
                Height: '640px'
            }];
            Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady);
            // https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
            Dynamsoft.DWT.ProductKey =
                'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';
            Dynamsoft.DWT.ResourcesPath = 'https://unpkg.com/dwt/dist/';

            Dynamsoft.DWT.Load();
        }

    };

    function Dynamsoft_OnReady() {
        dwtObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
        var token = document.querySelector("meta[name='_token']").getAttribute("content");
        dwtObject.SetHTTPFormField('_token', token);

        let count = dwtObject.SourceCount;
        let select = document.getElementById("source");

        dwtObject.GetDevicesAsync().then(function(devices) {
            for (var i = 0; i < devices.length; i++) { // Get how many sources are installed in the system
                let option = document.createElement('option');
                option.value = devices[i].displayName;
                option.text = devices[i].displayName;
                deviceList.push(devices[i]);
                select.appendChild(option);
            }
        }).catch(function(exp) {
            alert(exp.message);
        });
    }

    function loadImage() {
        var OnSuccess = function() {};
        var OnFailure = function(errorCode, errorString) {};

        if (dwtObject) {
            dwtObject.IfShowFileDialog = true;
            dwtObject.LoadImageEx("", Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL, OnSuccess, OnFailure);
        }
    }

    function acquireImage() {
        if (dwtObject) {
            var sources = document.getElementById('source');
            if (sources) {
                dwtObject.SelectDeviceAsync(deviceList[sources.selectedIndex]).then(function() {
                    return dwtObject.AcquireImageAsync({
                        IfShowUI: false,
                        IfCloseSourceAfterAcquire: true
                    });
                }).catch(function(exp) {
                    alert(exp.message);
                });
            }
        }
    }

    function upload() {
        var OnSuccess = function(httpResponse) {
            alert("Succesfully uploaded");
        };

        var OnFailure = function(errorCode, errorString, httpResponse) {
            alert(httpResponse);
        };

        var date = new Date();
        dwtObject.HTTPUploadThroughPostEx(
            "{{ route('dwtupload.upload') }}",
            dwtObject.CurrentImageIndexInBuffer,
            '',
            date.getTime() + ".jpg",
            1, // JPEG
            OnSuccess, OnFailure
        );
    }
    </script>

</body>

</html>