import { LightningElement } from 'lwc';
import dwt from '@salesforce/resourceUrl/dwt';

export default class WebTWAINiframe extends LightningElement {
  dwtInitialized = false;
  dwtFrame;
  dataURL = "";
  get dataURLLabel() {
    if (this.dataURL) {
      if (this.dataURL.length > 15) {
        return this.dataURL.substring(0,10) + "...";
      }else{
        return this.dataURL;
      }
    }else{
      return "";
    }
  }
  renderedCallback() {
    if (this.dwtInitialized) {
        return;
    }
    this.dwtInitialized = true;
    window.addEventListener(
      "message",
      (event) => {
        console.log(event);
        this.dataURL = "data:application/pdf;base64,"+event.data._content;
      },
      false,
    );
    this.dwtFrame = document.createElement('iframe');
    this.dwtFrame.src = dwt + "/scanner.html";
    // div tag in which iframe will be added should have id attribute with value myDIV
    this.template.querySelector("div.viewer").appendChild(this.dwtFrame);
    // provide height and width to it
    this.dwtFrame.setAttribute("style","height:100%;width:100%;");
    this.dwtFrame.setAttribute("allow","local-network-access *");
  }
  scan(){
    this.dwtFrame.contentWindow.postMessage("acquire");
  }
  merge(){
    this.dwtFrame.contentWindow.postMessage("getPDF");
  }
  showEditor(){
    this.dwtFrame.contentWindow.postMessage("showEditor");
  }
}
