import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import dwt from '@salesforce/resourceUrl/dwt';

export default class WebTWAIN extends LightningElement {
    dwtInitialized = false;
    dwtWidth = 320;
    dwtHeight = 480;
    curScannerIndex = -1;
    @api scannerOptions = [];
    
    showMessage(title, msg, succeed) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: msg,
                variant: succeed ? 'ok' : 'error'
            })
        );
    }
    
    renderedCallback() {
        if (this.dwtInitialized) {
            return;
        }
        this.dwtInitialized = true;

        loadScript(this, dwt + '/dynamsoft.webtwain.config.js')
            .then(() => {
                Promise.all([
                    loadScript(this, dwt + '/dynamsoft.webtwain.initiate.js'),
                    loadStyle(this, dwt + '/src/dynamsoft.webtwain.css'),
                    loadStyle(this, dwt + '/src/dynamsoft.webtwain.viewer.css'),
                ])
                .then(() => { 
                    this.createDWT();
                });
            })
            .catch(error => {
                this.showMessage("loading dwt js", error.message);
            });
        }
    
    initDevices(devices) {
        this.curScannerIndex = -1;
        this.devices = devices;
        let options = [];
        for (let index = 0; index < this.devices.length; index ++) {
            options.push({label: this.devices[index].displayName, value: index});
        }
        this.scannerOptions = options;
        // to select a default device
        if (this.devices && this.devices.length != 0) {
            this.curScannerIndex = 0;
        }
    }

    handleDeviceChange(event) {
        this.curScannerIndex = event.detail.value;
    }

    async createDWT() {
        if (this.DWTObject) {
            this.DWTObject = undefined;
            Dynamsoft.DWT.DeleteDWTObject('dwtObj');
        }
        try{
            let me = this;
            Dynamsoft.DWT.ResourcesPath = dwt;
            Dynamsoft.DWT.ServiceInstallerLocation = "https://unpkg.com/dwt@19.5.0/dist/dist/";
            //request your trial license here: https://www.dynamsoft.com/customer/license/trialLicense/?product=dwt
            Dynamsoft.DWT.ProductKey = "t01908AUAAJ5Bl8Z4B4dVB1cTLDTcaFDf8vRl/3kmHuhVOoPrJbLdXy1uMDVAFDVHRCDxV7iyFsROWUYU950cJKo6NnOXHav2+uVkB6e2d6q0d6KDk4+cImMexnLaLu9bN3AB3hnQ/TrsAGqg1HICPsNWGyyAFqAGoFYNsIDbt7h+fMo5IPXqPwe6OtnBqe2ddUDaONHByUfOFBAfxU1pdSoBQX1zDgAtQG8BbD+yS0DkDNAC9AK4MQTngp8BjmEsSg==";
            const container = me.template.querySelector('div.dwtContainer');
            Dynamsoft.DWT.RootNode = container;
            Dynamsoft.DWT.AutoLoadCSS = false;
            Dynamsoft.DWT.CreateDWTObjectEx({WebTwainId: 'dwtObj', container: container}, function (obj) {
                me.DWTObject = obj;
                const succeed = me.DWTObject.Viewer.bind(container);
                me.DWTObject.Viewer.width = me.dwtWidth;
                me.DWTObject.Viewer.height = me.dwtHeight;
                me.DWTObject.Viewer.show();

                me.DWTObject.GetDevicesAsync().then(devices=> { 
                    me.initDevices(devices);
                });
            }, function(error) { console.log(error.message);});
        }catch(error) {
            this.showMessage("creating dwt object", error.message);
        }
    }

    getBase64(){
      const indices = this.DWTObject.SelectAllImages();
      this.DWTObject.ConvertToBase64(
        indices,
        Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF,
        function (result, indices, type) {
          let base64 = result.getData(0, result.getLength()) 
          console.log(base64);
          alert(base64);
        },
        function (errorCode, errorString) {
          console.log(errorString);
          alert(errorString);
        }
      );
    }

    async acquire() {
        try {
            if (this.curScannerIndex >= 0 && this.devices) {
                await this.DWTObject.SelectDeviceAsync(this.devices[this.curScannerIndex]);
            }
            // await this.DWTObject.SelectSourceAsync(); // not support, ui has some problems
            await this.DWTObject.AcquireImageAsync({Resolution: 200, PixelType: 2, IfShowUI: true});
        }catch(error) {
            this.showMessage('acquiring', error.message);
        }
    }

    async rotate() {
        try {
            await this.DWTObject.RotateAsync(this.DWTObject.CurrentImageIndexInBuffer, 90, true);
        }
        catch(error)
        {
            this.showMessage('rotating', error.message);
        }
    }

    deleteImage() {
        try {
            this.DWTObject.RemoveImage(this.DWTObject.CurrentImageIndexInBuffer);
        }
        catch(error)
        {
            this.showMessage('deleting', error.message);
        }
    }

    showEditor() {
        const me = this;
        try {
            const editorSettings = {
                /* Show the editor within the DIV 'imageEditor'*/
                element: this.template.querySelector('div.dwtContainer'),
                workMode: Dynamsoft.DWT.EnumDWT_WorkMode.balance,
                width: this.dwtWidth,
                height: this.dwtHeight
            }
            if (!this.imageEditor) {
                this.imageEditor = this.DWTObject.Viewer.createImageEditor(editorSettings);
                this.DWTObject.RegisterEvent('CloseImageEditorUI', function(){
                    me.DWTObject.Viewer.show();
                    me.imageEditor = undefined; // closed already, need recreate again
                });
            }
            this.DWTObject.Viewer.hide();
            this.imageEditor.show();
        }
        catch(error)
        {
            this.showMessage('showing editor', error.message);
        }
    }

    save() {
        const me = this;
        try {
            this.DWTObject.SaveAllAsPDF("output.pdf", function(){

            }, function(errorCode, errorString){
                me.showMessage('saving', errorString);
            });
        }
        catch(error)
        {
            this.showMessage('saving', error.message);
        }
    }
}
