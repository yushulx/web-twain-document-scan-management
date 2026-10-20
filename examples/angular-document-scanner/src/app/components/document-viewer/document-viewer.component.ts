import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import Dynamsoft from "dwt";
import { WebTwain } from 'dwt/dist/types/WebTwain';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css'],
  outputs: ['onWebTWAINReady']
})
export class DocumentViewerComponent implements OnInit {
  @ViewChild('viewerElement') viewerElement:any;
  onWebTWAINReady = new EventEmitter<WebTwain>();
  containerID = "dwtcontrolContainer";
  DWObject:WebTwain|undefined;

  private _license:string;
  @Input()
  set license(license: string) {
    this._license= license;
  }
  get license(): string{ return this._license; }

  private _viewMode:{cols:number,rows:number};
  @Input()
  set viewMode(viewMode: {cols:number,rows:number}) {
    this._viewMode= viewMode;
    if (this.DWObject) {
      this.DWObject.Viewer.setViewMode(this.viewMode.cols,this.viewMode.rows);
    }
  }
  get viewMode(): {cols:number,rows:number}{ return this._viewMode; }

  private _height:string;
  @Input()
  set height(height: string) {
    this._height= height;
  }
  get height(): string{ return this._height; }

  private _width:string;
  @Input()
  set width(width: string) {
    this._width= width;
  }
  get width(): string{ return this._width; }

  constructor() { 
    this._width = "100%";
    this._height = "100%";
    this._viewMode = {cols:2,rows:2};
    this._license = "";
    this.initDWT();
  }

  ngOnInit(): void {

  }

  initDWT(){
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      this.DWObject = Dynamsoft.DWT.GetWebTwain(this.containerID);
      this.DWObject.Viewer.width = "100%";
      this.DWObject.Viewer.height = "100%";
      this.viewerElement.nativeElement.style.width = this._width;
      this.viewerElement.nativeElement.style.height = this._height;
      this.DWObject.Viewer.setViewMode(this.viewMode.cols,this.viewMode.rows);
      if (this.onWebTWAINReady) {
        this.onWebTWAINReady.emit(this.DWObject);
      }
    });
    if (this._license) {
      Dynamsoft.DWT.ProductKey = this._license;
    }
    Dynamsoft.DWT.ResourcesPath = "assets/dwt-resources";
    Dynamsoft.DWT.Containers = [{
        WebTwainId: 'dwtObject',
        ContainerId: this.containerID
    }];

    Dynamsoft.DWT.Load();
  }

}
