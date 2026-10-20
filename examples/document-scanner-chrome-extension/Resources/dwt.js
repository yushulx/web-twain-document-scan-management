let DWTChromeExtension = {
  modal:undefined,
  DWObject:undefined,
  load: function(){
    const resourcesURL = document.getElementById("dwt").getAttribute("resourcesURL");
    Dynamsoft.DWT.ResourcesPath = resourcesURL;
  },
  showModal: function(){
    if (!this.modal) {
      this.modal = document.createElement("div");
      this.modal.className = "dwt-modal";
      document.body.appendChild(this.modal);
      const header = document.createElement("div");
      const closeBtn = document.createElement("div");
      closeBtn.className = "dwt-close-btn";
      closeBtn.innerText = "x";
      header.appendChild(closeBtn);
      header.className = "dwt-header";
      closeBtn.addEventListener("click", () => {
        this.hideModal();
      });
      const body = document.createElement("div");
      body.className = "dwt-body";
      const viewer = document.createElement("div");
      viewer.id = "dwtcontrolContainer";
      const controls = document.createElement("div");
      controls.className = "dwt-controls";
      const scanBtn = document.createElement("button");
      scanBtn.innerText = "Scan";
      scanBtn.addEventListener("click", () => {
        this.scan();
      });

      const editBtn = document.createElement("button");
      editBtn.innerText = "Edit";
      editBtn.addEventListener("click", () => {
        this.edit();
      });
      
      const copyBtn = document.createElement("button");
      copyBtn.innerText = "Copy selected";
      copyBtn.addEventListener("click", () => {
        this.copy();
      });
  
      const saveBtn = document.createElement("button");
      saveBtn.innerText = "Save";
      saveBtn.addEventListener("click", () => {
        this.save();
      });
  
      const status = document.createElement("div");
      status.className="dwt-status";
  
      controls.appendChild(scanBtn);
      controls.appendChild(editBtn);
      controls.appendChild(copyBtn);
      controls.appendChild(saveBtn);
      controls.appendChild(status);
  
      body.appendChild(viewer);
      body.appendChild(controls);
      this.modal.appendChild(header);
      this.modal.appendChild(body);
      if (!this.DWObject) {
        this.initDWT();
      }
    }
    this.modal.style.display = "";
  },
  hideModal: function() {
    this.modal.style.display = "none";
  },
  scan: function(){
    if (this.DWObject) {
      if (Dynamsoft.Lib.env.bMobile) {
        this.DWObject.Addon.Camera.scanDocument();
      }else {
        this.DWObject.SelectSource(function () {
          DWTChromeExtension.DWObject.OpenSource();
          DWTChromeExtension.DWObject.AcquireImage();
        },
          function () {
            console.log("SelectSource failed!");
          }
        );
      }
    }
  },
  edit: function(){
    if (this.DWObject) {
      let imageEditor = this.DWObject.Viewer.createImageEditor();
      imageEditor.show();
    }
  },
  copy: function(){
    if (this.DWObject) {
      if (Dynamsoft.Lib.env.bMobile) {
        this.DWObject.ConvertToBlob(
          [this.DWObject.CurrentImageIndexInBuffer],
          Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG,
          function(result) {
            DWTChromeExtension.CopyBlobToClipboard(result);
          },
          function(errorCode,errorString) {
            console.log("convert failed");
            console.log(errorString);
            alert("Failed");
          });
      }else{
        this.DWObject.CopyToClipboard(this.DWObject.CurrentImageIndexInBuffer);
        alert("Copied");
      }
    }
  },
  CopyBlobToClipboard: function(blob){
    var data = [new ClipboardItem({ "image/png": blob})];
    navigator.clipboard.write(data).then(function() {
      alert("Copied");
    }, function() {
      alert("Failed");
    });
  },
  save: function () {
    if (this.DWObject) {
      this.DWObject.SaveAllAsPDF("Scanned");
    }
  },
  initDWT: function(){
    const status = document.querySelector(".dwt-status");
    const license = document.getElementById("dwt").getAttribute("license");
    if (license) {
      console.log("using license: "+license);
      Dynamsoft.DWT.ProductKey = license;
    }
    Dynamsoft.DWT.Containers = [{ ContainerId: 'dwtcontrolContainer',Width: 270, Height: 350 }];
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', function () {
      console.log("ready");
      status.innerText = "";
      DWTChromeExtension.DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
      DWTChromeExtension.DWObject.Viewer.width = "100%";
      DWTChromeExtension.DWObject.Viewer.height = "100%";
      DWTChromeExtension.DWObject.SetViewMode(2,2);
    });
    status.innerText = "Loading...";
    Dynamsoft.DWT.Load();
  }
}

DWTChromeExtension.load();
