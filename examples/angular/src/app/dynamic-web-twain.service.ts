import { Injectable, Optional } from '@angular/core';
import Dynamsoft from 'dwt';

@Injectable({
  providedIn: 'root'
})
export class DynamicWebTWAINService {

  constructor() {
    Dynamsoft.DWT.ProductKey = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
    Dynamsoft.DWT.ResourcesPath = "assets/dynamic-web-twain";
    Dynamsoft.DWT.UseLocalService = true;
  }
}
