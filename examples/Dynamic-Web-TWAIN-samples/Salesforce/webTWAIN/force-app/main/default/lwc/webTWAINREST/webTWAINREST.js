import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class WebTWAINREST extends LightningElement {
  @api scannerOptions = [];
  scanner;
  @api imageURL = "";
  async connectedCallback() {
    await this.listScanners();
  }

  async listScanners(){
    try {
      const options = [];
      const url = "https://local.dynamsoft.com:18623/DWTAPI/Scanners";
      const response = await fetch(url, {"method":"GET", "mode":"cors", "credentials":"include"});
      const scanners = await response.json();
      for (let index = 0; index < scanners.length; index++) {
        const scanner = scanners[index];
        const scannerOption = {label:scanner.name,value:scanner.device};
        options.push(scannerOption);
      }
      if (scanners.length>0) {
        this.scanner = scanners[0].device;
      }
      this.scannerOptions = options;
    } catch (error) {
      console.log(error);
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message: "Failed to connect to Dynamsoft Servce. Please visit https://demo.dynamsoft.com/web-twain/ and make sure it works.",
          variant: "error"
        })
      );
    }
  }

  handleScannerChange(event) {
    this.scanner = event.detail.value;
  }

  async scan(){
    console.log(this.scanner);
    let scanParams = {
      license:"t01898AUAABL9Dpoj+I6g/V6TaezNQ9c6V9CDtdWno1BkmuaS8/f8SuIuj9oSNQQWygCHd+5q5r6jwfWfYHT0/648j/UFVye/nOzg1PZOlfZOdHDyllNknIdx2e3hOy9PYAaeM6DbcdgA1MBSywF4ubU2WAAtQA1ArRpgAZerOP98yjEg9dd/NrQ42cGp7Z11QNo40cHJW84UEB9lmNJqpyUgqE/ODqAF6CWA9SI7BUSOAC1ATwBCYBzj8AGcaiqf", // productKey, DLS not support yet
      device:this.scanner,
      config:{
        IfShowUI:true
      }
    };
    let url = "https://local.dynamsoft.com:18623/DWTAPI/ScanJobs";
    const response = await fetch(url, {"body": JSON.stringify(scanParams), "method":"POST", "mode":"cors", "credentials":"include"});
    console.log(response);
    if (response.status == 201)
    {
      let curJobid = await response.text();
      console.log(curJobid);
      // job max life time is 10 hours.
      // job will be deleted auto after got all cached images.
      // job will be deleted or cancelled after called delete.
      this.getImage(curJobid);
    }
  }

  async getImage(jobid) {
    let url = "https://local.dynamsoft.com:18623/DWTAPI/ScanJobs/" + jobid + '/NextDocument';
    let response = await fetch(url, {"method":"GET", "mode":"cors", "credentials":"include"});
    if (response.status === 200)
    {
      const image = await response.arrayBuffer();
      this.imageURL = URL.createObjectURL(new Blob([image], { type: "image/png" }));
    }
  }
}