import { Component, OnInit } from '@angular/core';
import { WebTwain } from 'dwt/dist/types/WebTwain';
import Dynamsoft from 'dwt';
import { DynamicWebTWAINService } from '../dynamic-web-twain.service';

@Component({
  selector: 'app-acquire-image',
  templateUrl: './acquire-image.component.html',
  styleUrls: ['./acquire-image.component.css']
})
export class AcquireImageComponent implements OnInit {

  dwtObject: WebTwain | undefined;
  selectSources: HTMLSelectElement | undefined;
  sourceList: any[] = [];
  containerId = 'dwtcontrolContainer';
  width = '600px';
  height = '600px';

  constructor(private dynamicWebTwainService: DynamicWebTWAINService) {
  }

  ngOnDestroy() {
    Dynamsoft.DWT.Unload();
  }

  ngOnInit(): void {
    Dynamsoft.DWT.Containers = [{ ContainerId: this.containerId, Width: this.width, Height: this.height }];
    Dynamsoft.DWT.Load();

    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => { this.onReady(); });
  }

  onReady(): void {
    this.dwtObject = Dynamsoft.DWT.GetWebTwain(this.containerId);
    this.dwtObject.IfShowUI = false;

    this.dwtObject.GetDevicesAsync(Dynamsoft.DWT.EnumDWT_DeviceType.TWAINSCANNER | Dynamsoft.DWT.EnumDWT_DeviceType.TWAINX64SCANNER | Dynamsoft.DWT.EnumDWT_DeviceType.ESCLSCANNER).then((sources) => {
      this.sourceList = sources;

      this.selectSources = <HTMLSelectElement>document.getElementById("sources");
      this.selectSources.options.length = 0;
      for (let i = 0; i < sources.length; i++) {
        this.selectSources.options.add(new Option(<string>sources[i].displayName, i.toString()));
      }
    });
  }

  acquireImage(): void {
    if (!this.dwtObject)
      return;

    else if (this.dwtObject.SourceCount > 0 && this.selectSources && this.dwtObject.SelectSourceByIndex(this.selectSources.selectedIndex)) {
      let dwtObject = this.dwtObject;
      let pixelType = '2';
      var pixelTypeInputs = document.getElementsByName("PixelType");
      for (var i = 0; i < pixelTypeInputs.length; i++) {
        if ((<HTMLInputElement>pixelTypeInputs[i]).checked) {
          pixelType = (<HTMLSelectElement>pixelTypeInputs[i]).value;
          break;
        }
      }

      dwtObject.SelectDeviceAsync(this.sourceList[this.selectSources.selectedIndex]).then(() => {

        return dwtObject.OpenSourceAsync()

      }).then(() => {

        return dwtObject.AcquireImageAsync({
          IfFeederEnabled: (<HTMLInputElement>document.getElementById("ADF"))!.checked,
          PixelType: pixelType,
          Resolution: parseInt((<HTMLSelectElement>document.getElementById("Resolution"))!.value),
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

      );
    } else {
      alert("No Source Available!");
    }
  }

  openImage(): void {
    if (!this.dwtObject)
      this.dwtObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
    // this.dwtObject.IfShowFileDialog = true;  
    this.dwtObject.Addon.PDF.SetConvertMode(Dynamsoft.DWT.EnumDWT_ConvertMode.CM_RENDERALL);
    this.dwtObject.LoadImageEx("", Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL,
      () => {
        //success
      }, () => {
        //failure
      });
  }

  downloadDocument() {
    if (this.dwtObject && this.dwtObject.HowManyImagesInBuffer > 0) {
      this.dwtObject.IfShowFileDialog = true;
      if ((<HTMLInputElement>document.getElementById("imgTypejpeg")).checked == true) {
        //If the current image is B&W
        //1 is B&W, 8 is Gray, 24 is RGB
        if (this.dwtObject.GetImageBitDepth(this.dwtObject.CurrentImageIndexInBuffer) == 1)
          //If so, convert the image to Gray
          this.dwtObject.ConvertToGrayScale(this.dwtObject.CurrentImageIndexInBuffer);
        //Save image in JPEG
        this.dwtObject.SaveAsJPEG("DynamicWebTWAIN.jpg", this.dwtObject.CurrentImageIndexInBuffer);
      }
      else if ((<HTMLInputElement>document.getElementById("imgTypetiff")).checked == true)
        this.dwtObject.SaveAllAsMultiPageTIFF("DynamicWebTWAIN.tiff", () => { }, () => { });
      else if ((<HTMLInputElement>document.getElementById("imgTypepdf")).checked == true)
        this.dwtObject.SaveAllAsPDF("DynamicWebTWAIN.pdf", () => { }, () => { });
    }
  }

}
