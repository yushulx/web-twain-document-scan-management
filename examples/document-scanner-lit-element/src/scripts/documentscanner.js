import {LitElement, html, css} from 'lit';
import Dynamsoft from 'dwt';

export class DocumentScanner extends LitElement {
  static properties = {
    total: {},
  };
  DWObject;
  static styles = css`
    :host {
      display: block;
    }
    .buttons {
      height: 25px;
    }
    #dwtcontrolContainer {
      width: 100%;
      height: calc(100% - 50px);
    }
    .status {
      height: 25px;
    }
    `;
  constructor() {
    super();
    this.total = 0;
    Dynamsoft.DWT.AutoLoad = false;
    Dynamsoft.DWT.ResourcesPath = "/dwt/dist";
  }

  render() {
    return html`
    <div class="buttons">
      <button @click=${this.scan}>Scan</button>
      <button @click=${this.save}>Save</button>
    </div>
    <div id="dwtcontrolContainer"></div>
    <div class="status">Total: ${this.total}</div>`;
  }

  scan(){
    let pThis = this;
    if (pThis.DWObject) {
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
  
  save(){
    if (this.DWObject) {
      this.DWObject.SaveAllAsPDF("Scanned.pdf");
    }
  }

  firstUpdated() {
    let pThis = this;
    let dwtContainer = this.renderRoot.getElementById("dwtcontrolContainer");
    Dynamsoft.DWT.CreateDWTObjectEx(
      {
        WebTwainId: 'dwtcontrol'
      },
      function(obj) {
        pThis.DWObject = obj;
        pThis.DWObject.Viewer.bind(dwtContainer);
        pThis.DWObject.Viewer.show();
        pThis.DWObject.Viewer.width = "100%";
        pThis.DWObject.Viewer.height = "100%";
        pThis.DWObject.RegisterEvent('OnBufferChanged',function () {
          pThis.total = pThis.DWObject.HowManyImagesInBuffer;
        });
        const event = new CustomEvent('initialized', {
          detail: {
            DWObject: pThis.DWObject
          }
        });
        pThis.dispatchEvent(event);
      },
      function(err) {
        console.log(err);
      }
    );
  } 
}
customElements.define('document-scanner', DocumentScanner);
