import { Component, OnInit } from '@angular/core';
import { WebTwain } from 'dwt/dist/types/WebTwain';
import Dynamsoft from 'dwt';
import { DynamicWebTWAINService } from '../dynamic-web-twain.service';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.css']
})
export class ImageEditorComponent implements OnInit {
  dwtObject: WebTwain | undefined;
  selectSources: HTMLSelectElement | undefined;
  containerId = 'dwtcontrolContainer';
  width = '600px';
  height = '800px';
  imageEditor: any;
  isHidden = false;
  sourceList: any[] = [];

  constructor(private dynamicWebTwainService: DynamicWebTWAINService) { }

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
    this.createImageEditor();

    this.dwtObject.GetDevicesAsync(Dynamsoft.DWT.EnumDWT_DeviceType.TWAINSCANNER | Dynamsoft.DWT.EnumDWT_DeviceType.TWAINX64SCANNER | Dynamsoft.DWT.EnumDWT_DeviceType.ESCLSCANNER).then((sources) => {
      this.sourceList = sources;

      this.selectSources = <HTMLSelectElement>document.getElementById("sources");
      this.selectSources.options.length = 0;
      for (let i = 0; i < sources.length; i++) {
        this.selectSources.options.add(new Option(<string>sources[i].displayName, i.toString()));
      }
    });

    this.dwtObject.Viewer.autoChangeIndex = true;
    this.dwtObject.RegisterEvent("OnBufferChanged", (info) => {
      this.onBufferChanged(info.currentId);
    });
  }

  acquireImage(): void {
    if (!this.dwtObject)
      return;

    else if (this.dwtObject.SourceCount > 0 && this.selectSources && this.dwtObject.SelectSourceByIndex(this.selectSources.selectedIndex)) {
      let dwtObject = this.dwtObject;
      dwtObject.SelectDeviceAsync(this.sourceList[this.selectSources.selectedIndex]).then(() => {

        return dwtObject.OpenSourceAsync()

      }).then(() => {

        return dwtObject.AcquireImageAsync({
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

  createImageEditor() {
    if (this.dwtObject) {
      this.imageEditor = this.dwtObject!.Viewer.createImageEditor({
        element: <HTMLDivElement>document.getElementById('dwtcontrolContainerLargeViewer'),
        width: 750,
        height: 800,
        buttons: {
          visibility: {
            close: false
          }
        }
      });
      this.imageEditor.show();
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
        this.updatePageInfo();
      }, () => {
        //failure
      });
  }

  rotateLeft() {
    if (this.dwtObject)
      if (this.dwtObject.HowManyImagesInBuffer > 0)
        this.dwtObject.RotateLeft(this.dwtObject.CurrentImageIndexInBuffer);
  }

  rotateRight() {
    if (this.dwtObject)
      if (this.dwtObject.HowManyImagesInBuffer > 0)
        this.dwtObject.RotateRight(this.dwtObject.CurrentImageIndexInBuffer);
  }

  mirror() {
    if (this.dwtObject)
      if (this.dwtObject.HowManyImagesInBuffer > 0)
        this.dwtObject.Mirror(this.dwtObject.CurrentImageIndexInBuffer);
  }

  flip() {
    if (this.dwtObject)
      if (this.dwtObject.HowManyImagesInBuffer > 0)
        this.dwtObject.Flip(this.dwtObject.CurrentImageIndexInBuffer);

  }

  showImageEditor() {
    if (this.dwtObject) {
      if (this.dwtObject.HowManyImagesInBuffer == 0)
        alert("There is no image in buffer.");
      else {
        let imageEditorElement = document.getElementById('imageEditor');
        if (!imageEditorElement) return;

        if (this.isHidden) {
          imageEditorElement.textContent = 'Hide Editor';
          this.imageEditor.show();
          this.isHidden = false;
        }
        else {
          imageEditorElement.textContent = 'Show Editor';
          this.isHidden = true;
          this.imageEditor.hide();
        }

      }
    }
  }

  firstImage() {
    if (this.dwtObject) {
      this.dwtObject.Viewer.first();
      this.updatePageInfo();
    }
  }

  updatePageInfo() {
    if (this.dwtObject && document.getElementById("DW_TotalImage") && document.getElementById("DW_CurrentImage")) {
      (<HTMLInputElement>document.getElementById("DW_TotalImage"))!.value = this.dwtObject.HowManyImagesInBuffer.toString();
      (<HTMLInputElement>document.getElementById("DW_CurrentImage"))!.value = (this.dwtObject.CurrentImageIndexInBuffer + 1).toString();
    }
  }

  onBufferChanged(index: number) {
    if (this.dwtObject) {
      this.dwtObject.CurrentImageIndexInBuffer = index;
      this.updatePageInfo();
    }

  }

  preImage() {
    if (this.dwtObject) {
      this.dwtObject.Viewer.previous();
      this.updatePageInfo();
    }
  }

  nextImage() {
    if (this.dwtObject) {
      this.dwtObject.Viewer.next();
      this.updatePageInfo();
    }
  }


  lastImage() {
    if (this.dwtObject) {
      this.dwtObject.Viewer.last();
      this.updatePageInfo();
    }
  }

  setMode() {
    if (this.dwtObject) {
      let index = (<HTMLSelectElement>document.getElementById("DW_PreviewMode"))!.selectedIndex;
      var num = index + 1;
      this.dwtObject.Viewer.setViewMode(num, num);
      if (index != 0) {
        this.dwtObject.Viewer.cursor = "pointer";
      }
      else {
        this.dwtObject.Viewer.cursor = "crosshair";
      }
    }
  }

  removeSelected() {
    if (this.dwtObject) {
      this.dwtObject.RemoveAllSelectedImages();
      if (this.dwtObject.HowManyImagesInBuffer == 0) {
        (<HTMLInputElement>document.getElementById("DW_CurrentImage")).value = "0";
        (<HTMLInputElement>document.getElementById("DW_TotalImage")).value = "0";
      }
      else {
        this.updatePageInfo();
      }
    }
  }

  removeAll() {
    if (this.dwtObject) {
      this.dwtObject.RemoveAllImages();
      (<HTMLInputElement>document.getElementById("DW_TotalImage")).value = "0";
      (<HTMLInputElement>document.getElementById("DW_CurrentImage")).value = "0";
    }
  }
}
