import { LightningElement } from 'lwc';
import dwt from '@salesforce/resourceUrl/dwt';

export default class ClassificationWithBarcode extends LightningElement {
  dwtInitialized = false;
  dwtFrame;
  renderedCallback() {
    if (this.dwtInitialized) {
        return;
    }
    this.dwtInitialized = true;
    this.dwtFrame = document.createElement('iframe');
    this.dwtFrame.src = dwt + "/scan-and-classify.html";
    // div tag in which iframe will be added should have id attribute with value myDIV
    this.template.querySelector("div.viewer").appendChild(this.dwtFrame);
    // provide height and width to it
    this.dwtFrame.setAttribute("style","height:100%;width:100%;");
  }
}