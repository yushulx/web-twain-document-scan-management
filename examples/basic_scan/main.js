var DWObject;

window.onload = function () {
    if (Dynamsoft) {
        Dynamsoft.DWT.AutoLoad = false;
        Dynamsoft.DWT.UseLocalService = true;
        Dynamsoft.DWT.Containers = [{ ContainerId: 'dwtcontrolContainer', Width: '640px', Height: '640px' }];
        Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady);
        // https://www.dynamsoft.com/customer/license/trialLicense?product=dwt
        Dynamsoft.DWT.ProductKey = 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';
        Dynamsoft.DWT.ResourcesPath = 'node_modules/dwt/dist/';
        Dynamsoft.DWT.Load();
    }

};


function Dynamsoft_OnReady() {
    DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer'); // Get the Dynamic Web TWAIN object that is embeded in the div with id 'dwtcontrolContainer'
}
function AcquireImage() {
    if (DWObject) {
        DWObject.SelectSourceAsync().then(function () {
            return DWObject.AcquireImageAsync({
                IfCloseSourceAfterAcquire: true // Scanner source will be closed automatically after the scan.
            });
        }).catch(function (exp) {
            alert(exp.message);
        });
    }
}