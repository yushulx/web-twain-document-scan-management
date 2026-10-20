import { Component } from '@angular/core';
import { WebTwain } from 'dwt/dist/types/WebTwain';
import { DeviceConfiguration } from 'dwt/dist/types/WebTwain.Acquire';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  DWObject: WebTwain|undefined;
  selectedScanner: string = "";
  scanners: string[] = [];
  showUI: boolean = false;
  useADF: boolean = false;
  duplex: boolean = false;
  resolution: number = 200;
  pixelType: string = "2";
  constructor(){

  }

  onWebTWAINReady(DWObject:WebTwain){
    this.DWObject = DWObject;
    this.loadScanners;
  }

  async loadScanners(){
    if (this.DWObject) {
      const names = await this.DWObject.GetSourceNamesAsync(false) as string[];
      this.scanners = names;
      if (names.length>0) {
        this.selectedScanner = names[0];
      }
    }
    console.log(this.scanners);
  }

  scan(){
    console.log(this.selectedScanner);
    if (this.DWObject) {
      let selectedIndex = this.scanners.indexOf(this.selectedScanner);
      if (selectedIndex != -1) {
        let deviceConfiguration:DeviceConfiguration = {};
        deviceConfiguration.IfShowUI = this.showUI;
        deviceConfiguration.IfFeederEnabled = this.useADF;
        deviceConfiguration.IfDuplexEnabled = this.duplex;
        deviceConfiguration.SelectSourceByIndex = selectedIndex;
        deviceConfiguration.Resolution = this.resolution;
        deviceConfiguration.PixelType = this.pixelType;
        console.log(deviceConfiguration);
        this.DWObject.AcquireImage(deviceConfiguration);
      }else{
        this.DWObject.AcquireImage();
      }
    }
  }

  save(){
    if (this.DWObject) {
      const onSuccess = () => {
        alert("Success");
      }
      const onFailure = () => {
        alert("Failed");
      }
      this.DWObject.SaveAllAsPDF("Documents.pdf",onSuccess,onFailure);
    }
  }

  edit() {
    if (this.DWObject) {
      let imageEditor = this.DWObject.Viewer.createImageEditor();
      imageEditor.show();
    }
  }

  removeSelected(){
    if (this.DWObject) {
      this.DWObject.RemoveAllSelectedImages();
    }
  }

  rotateRight(){
    if (this.DWObject) {
      this.DWObject.RotateRight(this.DWObject.CurrentImageIndexInBuffer);
    }
  }

  moveUp() {
    if (this.DWObject) {
      this.DWObject.MoveImage(this.DWObject.CurrentImageIndexInBuffer,this.DWObject.CurrentImageIndexInBuffer-1);
    }
  }

  moveDown() {
    if (this.DWObject) {
      this.DWObject.MoveImage(this.DWObject.CurrentImageIndexInBuffer,this.DWObject.CurrentImageIndexInBuffer+1);
    }
  }
}
