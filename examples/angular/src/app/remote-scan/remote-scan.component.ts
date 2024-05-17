import { Component, OnInit } from '@angular/core';
import Dynamsoft from 'dwt';
import { RemoteScanObject } from 'dwt/dist/types/RemoteScan';
import { ServiceInfo, Device, DeviceConfiguration } from 'dwt/dist/types/WebTwain.Acquire';
import { DynamicWebTWAINService } from '../dynamic-web-twain.service';

@Component({
  selector: 'app-remote-scan',
  templateUrl: './remote-scan.component.html',
  styleUrls: ['./remote-scan.component.css']
})
export class RemoteScanComponent implements OnInit {

  dwtObject: RemoteScanObject | undefined;
  container: HTMLElement | undefined;
  selectSources: HTMLSelectElement | undefined;
  containerId = 'dwtcontrolContainer';
  width = '600px';
  height = '600px';
  selectedValue: string = '';
  services: ServiceInfo[] | undefined;
  devices: Device[] | undefined;
  serviceOptions = [
    { label: '', value: '' },
  ];

  onServiceChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptionValue = selectElement.value;

    let index = this.serviceOptions.findIndex(x => x.value === selectedOptionValue);
    this.findSources(this.services![index]);
  }

  constructor(private dynamicWebTwainService: DynamicWebTWAINService) {
  }

  ngOnDestroy() {
    Dynamsoft.DWT.Unload();
  }

  ngOnInit(): void {
    this.onReady();
  }

  async onReady(): Promise<void> {
    var serverurl = "document.scannerproxy.com:18602";
    if (window.location.protocol === 'https:') {
      serverurl = "document.scannerproxy.com:18604";
    }
    var serverurl = 'https://demo.scannerproxy.com';
    this.dwtObject = await Dynamsoft.DWT.CreateRemoteScanObjectAsync(serverurl);
    this.container = document.getElementById("dwtcontrolContainer") as HTMLElement;
    this.container.style.width = 600 + "px";
    this.container.style.height = 600 + "px";
    let ret = this.dwtObject.Viewer.bind(this.container);
    ret = this.dwtObject.Viewer.show();

    this.services = await this.dwtObject.getDynamsoftService();
    if (this.services) {
      if (this.services.length > 0) {
        this.serviceOptions.splice(0, 1);
      }
      for (let i = 0; i < this.services.length; i++) {
        let service = this.services[i];
        if (service.attrs.name.length > 0) {
          this.serviceOptions.push({ label: service.attrs.name, value: service.attrs.UUID });
        }
        else {
          this.serviceOptions.push({ label: service.attrs.UUID, value: service.attrs.UUID });
        }
      }
    }

    this.findSources(this.services![0]);
  }

  async findSources(service: ServiceInfo): Promise<void> {
    var devicetype =
      Dynamsoft.DWT.EnumDWT_DeviceType.TWAINSCANNER |
      Dynamsoft.DWT.EnumDWT_DeviceType.WIASCANNER |
      Dynamsoft.DWT.EnumDWT_DeviceType.TWAINX64SCANNER |
      Dynamsoft.DWT.EnumDWT_DeviceType.ICASCANNER |
      Dynamsoft.DWT.EnumDWT_DeviceType.SANESCANNER |
      Dynamsoft.DWT.EnumDWT_DeviceType.ESCLSCANNER |
      Dynamsoft.DWT.EnumDWT_DeviceType.WIFIDIRECTSCANNER;

    this.devices = await this.dwtObject!.getDevices({
      serviceInfo: service,
      deviceType: devicetype,
    });

    if (this.devices) {
      this.selectSources = <HTMLSelectElement>document.getElementById("sources");
      this.selectSources.options.length = 0;
      for (let i = 0; i < this.devices.length; i++) {
        this.selectSources.options.add(new Option(this.devices[i].name, i.toString()));
      }
    }
  }

  acquireImage(): void {
    if (!this.dwtObject)
      return;

    let pixelType = '2';
    var pixelTypeInputs = document.getElementsByName("PixelType");
    for (var i = 0; i < pixelTypeInputs.length; i++) {
      if ((<HTMLInputElement>pixelTypeInputs[i]).checked) {
        pixelType = (<HTMLSelectElement>pixelTypeInputs[i]).value;
        break;
      }
    }

    let type = Dynamsoft.DWT.EnumDWT_PixelType.TWPT_RGB;
    if (pixelType === '0') {
      type = Dynamsoft.DWT.EnumDWT_PixelType.TWPT_BW;
    }
    else if (pixelType === '1') {
      type = Dynamsoft.DWT.EnumDWT_PixelType.TWPT_GRAY;
    }

    let config : DeviceConfiguration = {
      PixelType: type,
    };
    this.dwtObject.acquireImage(this.devices![this.selectSources!.selectedIndex], config);
  }

  downloadDocument() {
    if (this.dwtObject && this.dwtObject.howManyImagesInBuffer > 0) {
      if ((<HTMLInputElement>document.getElementById("imgTypejpeg")).checked == true) {
        this.dwtObject.saveImages('DynamicWebTWAIN.pdf', [this.dwtObject!.currentImageIndexInBuffer], Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG);
      }
      else if ((<HTMLInputElement>document.getElementById("imgTypetiff")).checked == true) {
        let indexes = Array.from({ length: this.dwtObject.howManyImagesInBuffer }, (_, index) => index);
        this.dwtObject.saveImages('DynamicWebTWAIN.pdf', indexes, Dynamsoft.DWT.EnumDWT_ImageType.IT_TIF);
      }

      else if ((<HTMLInputElement>document.getElementById("imgTypepdf")).checked == true) {
        let indexes = Array.from({ length: this.dwtObject.howManyImagesInBuffer }, (_, index) => index);
        this.dwtObject.saveImages('DynamicWebTWAIN.pdf', indexes, Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF);
      }

    }
  }

}

