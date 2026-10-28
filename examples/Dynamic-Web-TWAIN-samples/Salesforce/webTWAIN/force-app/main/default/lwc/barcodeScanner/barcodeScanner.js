import { LightningElement } from 'lwc';
import dwt from '@salesforce/resourceUrl/dwt';

export default class BarcodeScanner extends LightningElement {
  initialized = false;
  dbrFrame;
  barcodeResult;
  get barcodeValue() {
    if (this.barcodeResult) {
      return this.barcodeResult.text;
    }else{
      return "";
    }
  }
  renderedCallback() {
    if (this.initialized) {
        return;
    }
    this.initialized = true;
    window.addEventListener(
      "message",
      (event) => {
        console.log(event);
        if (event.data.barcodeResultItems) {
          this.barcodeResult = event.data.barcodeResultItems[0];
        }
      },
      false,
    );
    this.dbrFrame = document.createElement('iframe');
    this.dbrFrame.src = dwt + "/barcode-scanner.html";
    // div tag in which iframe will be added should have id attribute with value myDIV
    this.template.querySelector("div.viewer").appendChild(this.dbrFrame);
    // provide height and width to it
    this.dbrFrame.setAttribute("style","height:100%;width:100%;");
  }
  toggleScanning(){
    this.dbrFrame.contentWindow.postMessage("toggle");
  }
}