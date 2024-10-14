function AcquireImage() {
    var DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
    if (DWObject) {
        DWObject.SelectSource(function () {
            var OnAcquireImageSuccess, OnAcquireImageFailure;
            OnAcquireImageSuccess = OnAcquireImageFailure = function () {
                DWObject.CloseSource();
            };
            DWObject.OpenSource();
            DWObject.IfShowUI = false;
            DWObject.Resolution = 300;
            DWObject.PixelType = EnumDWT_PixelType.TWPT_GRAY;
            DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageFailure);
        }, function () {
            console.log('SelectSource failed!');
        });
    }
}

function loadDWT() {
    Dynamsoft.DWT.ProductKey = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
    Dynamsoft.DWT.Load();
}