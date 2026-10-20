import { Component, h, Prop, Event, EventEmitter, Host, Method, State } from '@stencil/core';
import Dynamsoft from "dwt";
import { WebTwain } from "dwt/dist/types/WebTwain";
import { ThumbnailViewer } from 'dwt/dist/types/WebTwain.Viewer';
import { download, edit, exitFullscreen, fitWindow, fullscreen, openFile, origSize, scanner, settings, sidebar } from './assets/base64';

@Component({
  tag: 'pdf-viewer',
  styleUrl: 'pdf-viewer.css',
  shadow: true,
  assetsDirs: ['assets']
})
export class PDFViewer {
  containerID:string = "dwtcontrolContainer";
  dwtContainer:HTMLDivElement;
  parentContainer:HTMLDivElement;
  toolbar:HTMLDivElement;
  thumbnailViewer:ThumbnailViewer;
  thumbnailShown:boolean = true;
  DWObject:WebTwain;
  @State() status: string = "";
  @State() percent: number = 100;
  @State() showFitWindow: boolean = true;
  @State() showActionOverlay: boolean = false;
  @State() fullscreen: boolean = false;
  @State() totalPageNumber: number = 0;
  @State() selectedPageNumber: number = 0;
  @Prop() url?: string;
  @Prop() license?: string;
  @Prop() showthumbnailviewer?: string;
  @Prop() uselocalservice?: string;
  @Event() webTWAINReady?: EventEmitter<WebTwain>;
  componentWillLoad(){
    this.status = "Loading...";
  }

  componentDidLoad() {
    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        this.fullscreen = true;
      }else{
        this.fullscreen = false;
      }
    });
    this.initDWT();
  }

  initDWT() {
    Dynamsoft.DWT.ResourcesPath = "https://unpkg.com/dwt@18.0.0/dist";
    if (this.uselocalservice === "true") {
      Dynamsoft.DWT.UseLocalService = true;
    } else {
      Dynamsoft.DWT.UseLocalService = false;
    }
    let pThis = this;
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      Dynamsoft.DWT.CreateDWTObjectEx(
        {
          WebTwainId: 'dwtcontrol'
        },
        function(obj) {
          pThis.status = "";
          pThis.DWObject = obj;
          pThis.DWObject.Viewer.bind(pThis.dwtContainer);
          pThis.DWObject.Viewer.show();
          pThis.DWObject.Viewer.width = "100%";
          pThis.DWObject.Viewer.height = "100%";
          if (pThis.webTWAINReady) {
            pThis.webTWAINReady.emit(pThis.DWObject);
          }
          pThis.DWObject.Viewer.setViewMode(1,1);
          pThis.DWObject.Viewer.cursor = "pointer";
          pThis.DWObject.RegisterEvent('OnBufferChanged',function (bufferChangeInfo) {
            if (bufferChangeInfo.action === "add" || bufferChangeInfo.action === "remove") {
              pThis.updateTotalPage();
            }
            pThis.updateSelectedPageNumber(pThis.DWObject.CurrentImageIndexInBuffer + 1);
          });
          pThis.thumbnailViewer = pThis.DWObject.Viewer.createThumbnailViewer();
          if (pThis.showthumbnailviewer === "true") {
            pThis.thumbnailViewer.show();
            pThis.thumbnailShown = true;
          }else{
            pThis.thumbnailShown = false;
          }
          pThis.loadPDF();
        },
        function(err) {
          console.log(err);
        }
      );
    });
    Dynamsoft.DWT.Containers = [{
        WebTwainId: 'dwtObject'
    }];
    if (this.license) {
      Dynamsoft.DWT.ProductKey = this.license;
    }
    Dynamsoft.DWT.Load();
  }

  async loadPDF() {
    if (this.url) {
      this.status = "Loading PDF...";
      try {
        let response = await fetch(this.url);
        let blob = await response.blob();
        let pThis = this;
        this.DWObject.LoadImageFromBinary(blob,function(){
          pThis.DWObject.Viewer.singlePageMode=true;
          pThis.DWObject.SelectImages([0]);
        },function(){});
        this.status = "";
      } catch (error) {
        this.status = "Failed to load the PDF";
      }
    }
  }

  @Method()
  async toggleThumbnailViewer() {
    if (this.thumbnailShown) {
      this.thumbnailViewer.hide();
    }else{
      this.thumbnailViewer.show();
    }
    this.thumbnailShown = !this.thumbnailShown;
  }

  updateZoom(e:any){
    this.percent = e.target.value;
    const zoom = this.percent/100;
    this.DWObject.Viewer.zoom = zoom;
  }

  quicksize(){
    if (this.showFitWindow) {
      this.DWObject.Viewer.fitWindow("width");
      this.percent = this.DWObject.Viewer.zoom*100;
    }else{
      this.DWObject.Viewer.zoom = 1.0;
      this.percent = 100;
    }
    this.showFitWindow = !this.showFitWindow;
  }

  renderStatus(){
    if (this.status) {
      return (<div class="status">{this.status}</div>);
    }
  }

  renderActionOverlay(){
    let className:string;
    if (this.showActionOverlay) {
      className = "overlay";
    }else{
      className = "overlay hidden";
    }
    return (
      <div class={className}>
        {this.fullscreen
          ? <img title="Exit fullscreen" class="Icon" src={exitFullscreen} onClick={()=>this.toggleFullscreen()}/>
          : <img title="Enter fullscreen" class="Icon" src={fullscreen} onClick={()=>this.toggleFullscreen()}/>
        }
        <img title="Edit" class="Icon" src={edit} onClick={()=>this.edit()}/>
        <img title="Scan documents" class="Icon" src={scanner} onClick={()=>this.scan()}/>
        <img title="Load local file" class="Icon" src={openFile} onClick={()=>this.loadFile()}/>
        <img title="Save to PDF" class="Icon" src={download} onClick={()=>this.saveFile()}/>
      </div>
    );
  }

  async toggleFullscreen(){
    let isSafari = Dynamsoft.Lib.env.bSafari;
    if (isSafari) {
      if (this.parentContainer.classList.contains("fullscreen")) {
        this.parentContainer.classList.remove("fullscreen");
        this.fullscreen = false;
        this.resizeViewer();
      }else{
        this.parentContainer.classList.add("fullscreen");
        this.fullscreen = true;
        this.resizeViewer();
      }
    }else{
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }else{
        let ele = this.parentContainer.parentNode["host"];
        await ele.requestFullscreen();
      }
    }    
  }

  resizeViewer(){
    this.DWObject.Viewer.singlePageMode = true;
  }

  loadFile(){
    this.DWObject.LoadImageEx("",Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL);
  }

  edit(){
    const imageEditor = this.DWObject.Viewer.createImageEditor();
    imageEditor.show();
  }

  scan(){
    let pThis = this;
    if (Dynamsoft.Lib.env.bMobile || this.uselocalservice != "true") {
      pThis.DWObject.Addon.Camera.scanDocument();
    }else{
      pThis.DWObject.SelectSource(function () {
        pThis.DWObject.OpenSource();
        pThis.DWObject.AcquireImage();
      },
        function () {
          console.log("SelectSource failed!");
        }
      );
    }
  }

  saveFile(){
    this.DWObject.SaveAllAsPDF("scanned.pdf");
  }

  toggleActionOverlay(){
    this.showActionOverlay = !this.showActionOverlay;
  }

  updateTotalPage(){
    if (this.DWObject) {
      this.totalPageNumber = this.DWObject.HowManyImagesInBuffer;
    }
  }

  updateSelectedPageNumber(num:number){
    if (num <= 0 || num > this.totalPageNumber) {
      this.selectedPageNumber = this.DWObject.CurrentImageIndexInBuffer + 1;
      return;
    }
    this.selectedPageNumber = num;
    let index = this.selectedPageNumber - 1;
    if (this.DWObject) {
      this.DWObject.SelectImages([index]);
    }
  }

  render() {
    //const sideBar = getAssetPath(`./assets/sidebar.svg`);
    //const fitWindow = getAssetPath(`./assets/FitWindow.png`);
    //const originalSize = getAssetPath(`./assets/Orig_size.png`);
    return (
      <Host>
        <div class="container" ref={(el) => this.parentContainer = el as HTMLDivElement}>
          <div class="toolbar" ref={(el) => this.toolbar = el as HTMLDivElement}>
            <div class="toolbar-item">
              <img title="Toggle thumbnail viewer" class="Icon" src={sidebar} onClick={()=>this.toggleThumbnailViewer()}/>
            </div>
            <div class="zoom toolbar-item">
              <input type="number" id="percent-input" 
                value={this.percent}
                title="Percent"
                onChange={(e) => this.updateZoom(e)}
              /><label htmlFor="percent-input">%</label>
            </div>
            <div class="quicksize toolbar-item">
            {this.showFitWindow
              ? <img title="Fit window" class="Icon" src={fitWindow} onClick={()=>this.quicksize()}/>
              : <img title="Original size" class="Icon" src={origSize} onClick={()=>this.quicksize()}/>
            }
            </div>
            <div class="page toolbar-item">
              <input type="number" id="page-input" 
                value={this.selectedPageNumber}
                title="Page number"
                onChange={(e) => this.updateSelectedPageNumber((e as any).target.value)}
              />/{this.totalPageNumber}
            </div>
            <div class="toolbar-container toolbar-item"></div>
            <div class="action toolbar-item">
              <img class="Icon" src={settings} onClick={()=>this.toggleActionOverlay()}/>
            </div>
          </div>
          <div class="viewer-container">
            <div id={this.containerID} class="dwt-container" ref={(el) => this.dwtContainer = el as HTMLDivElement}>
              {this.renderStatus()}
              {this.renderActionOverlay()}
            </div>
          </div>
        </div>
        <slot></slot>
      </Host>
    );
  }

}
