let DWTExtension = {
  modal:undefined,
  DWObject:undefined,
  regionID:undefined,
  img:undefined,
  width:undefined,
  height:undefined,
  host:undefined,
  port:undefined,
  init: function(pConfig){
    this.regionID = pConfig.regionID;
    this.width = pConfig.width;
    this.height = pConfig.height;
    this.host = pConfig.host;
    this.port = pConfig.port;
    if ('apex' in window) {
      apex.region.create(
        pConfig.regionID,
        {                
          type: 'Dynamic Web TWAIN',
          getFilename: function(){
            return DWTExtension.getFilename();
          },
          getBase64: function(){
            return DWTExtension.getBase64();
          },
          showModal: function() {
            DWTExtension.showModal();
          },
          hideModal: function() {
            DWTExtension.hideModal();
          }
        }
      );
    }
  },
  load: async function(pConfig){
    let jsLoadedFromStaticResources = false;
    try {
        console.log("try loading from static resources: "+"https://oracleapex.com/ords/"+apex.env.APP_FILES+"dwt/dynamsoft.webtwain.min.js");
        await this.loadLibrary("https://oracleapex.com/ords/"+apex.env.APP_FILES+"dwt/dynamsoft.webtwain.min.js","text/javascript");
        jsLoadedFromStaticResources = true;
    }catch (e) {
        console.log("fallback to using cdn");
        await this.loadLibrary("https://cdn.jsdelivr.net/npm/dwt@19.4.4/dist/dynamsoft.webtwain.min.js","text/javascript");
    }
     try {
        console.log("try loading from static resources: "+"https://oracleapex.com/ords/"+apex.env.APP_FILES+"dwt/style.css");
        await this.loadStyle("https://oracleapex.com/ords/"+apex.env.APP_FILES+"dwt/style.css");
    }catch (e) {
        console.log("fallback to using cdn");
        await this.loadStyle("https://tony-xlh.github.io/APEX-Dynamic-Web-TWAIN/style.css");
    }
    if (pConfig.license) {
      Dynamsoft.DWT.ProductKey = pConfig.license;
    }
    Dynamsoft.DWT.AutoLoad = false;
    if (jsLoadedFromStaticResources) {
        Dynamsoft.DWT.ResourcesPath = "https://oracleapex.com/ords/"+apex.env.APP_FILES+"dwt";
    }else{
        Dynamsoft.DWT.ServiceInstallerLocation = "https://demo.dynamsoft.com/history/dwt19.3.1/Resources/dist";
        Dynamsoft.DWT.ResourcesPath = "https://cdn.jsdelivr.net/npm/dwt@19.4.4/dist";
    }

  },
  addButton: function (){
    const button = document.createElement("div");
    button.className = "dwt-fab";
    const a = document.createElement("a")
    a.href = "javascript:void(0)";
    const icon = document.createElement("img")
    icon.src = "https://tony-xlh.github.io/APEX-Dynamic-Web-TWAIN/scanner-scan.svg"
    a.appendChild(icon);
    button.appendChild(a);
    document.body.appendChild(button);
    button.addEventListener("click", () => {
      this.showModal();
    });
  },
  showModal: function(){
    if (('Dynamsoft' in window) === false) {
      alert("Please wait for the loading of DWT.");
      return;
    }
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

      const useBtn = document.createElement("button");
      useBtn.innerText = "Use selected";
      useBtn.addEventListener("click", () => {
        this.useImage();
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
      controls.appendChild(useBtn);
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
      let pThis = this;
      this.DWObject.SelectSourceAsync()
          .then(function () {
              return pThis.DWObject.AcquireImageAsync({
                  IfCloseSourceAfterAcquire: true,
              });
          })
          .catch(function (exp) {
              alert(exp.message);
          });
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
      this.DWObject.CopyToClipboard(this.DWObject.CurrentImageIndexInBuffer);
      alert("Copied");
    }
  },
  useImage: function() {
    if (!this.img) {
      this.img = document.createElement("img");
      if (this.width) {
        this.img.style.width = this.width;
      }
      if (this.height) {
        this.img.style.height = this.height;
      }
      this.img.style.objectFit = "contain";
      if ('apex' in window) {
        const region = document.getElementById(this.regionID);
        region.appendChild(this.img);
      }else{
        document.body.appendChild(this.img);
      }
    }
    let success = function (result, indices, type) {
      console.log("success");
      const base64 = result.getData(0, result.getLength());
      DWTExtension.img.src = "data:image/jpeg;base64,"+base64;
      DWTExtension.upload();
    };

    let error = function (errorCode, errorString) {
      console.log(errorString);
    };
    //1 is B&W, 8 is Gray, 24 is RGB
    if (this.DWObject.GetImageBitDepth(this.DWObject.CurrentImageIndexInBuffer) == 1) {
      this.DWObject.ConvertToGrayScale(this.DWObject.CurrentImageIndexInBuffer);
    }
      
    this.DWObject.ConvertToBase64(
      [this.DWObject.CurrentImageIndexInBuffer],
      Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG,
      success,
      error
    );
  },
  upload: function() {
    const server = this.host;
    const endPoint = "UploadFile"
    this.DWObject.IfSSL = true; // Set whether SSL is used
    this.DWObject.HTTPPort = this.port;
    if (!this.host) {
      return;
    }
    let OnEmptyResponse = function(){
      console.log("empty response");
    }
    let OnServerReturnedSomething = function(errorCode, errorString, sHttpResponse){
      let response = JSON.parse(sHttpResponse);
      if (response.status === "success") {
        DWTExtension.img.setAttribute("data-filename",response["filename"]);
        console.log("Uploaded");
      }
    }
    // Upload the image(s) to the server asynchronously    
    //If the current image is B&W
    //1 is B&W, 8 is Gray, 24 is RGB
    if (this.DWObject.GetImageBitDepth(this.DWObject.CurrentImageIndexInBuffer) == 1) {
      //If so, convert the image to Gray
      this.DWObject.ConvertToGrayScale(this.DWObject.CurrentImageIndexInBuffer);
    }
    //Upload image in JPEG
    this.DWObject.HTTPUploadThroughPost(server, this.DWObject.CurrentImageIndexInBuffer, endPoint, "scanned.jpg", OnEmptyResponse, OnServerReturnedSomething);
  },
  getFilename: function(){
    if (this.img) {
      return this.img.getAttribute("data-filename");
    }else{
      return "";
    }
  },
  getBase64: function(){
    if (this.img) {
      return this.img.src.replace("data:image/jpeg;base64,","");
    } else {
      return "";
    }
  },
  save: function () {
    if (this.DWObject) {
      this.DWObject.SaveAllAsPDF("Scanned");
    }
  },
  initDWT: function(){
    const status = document.querySelector(".dwt-status");
    Dynamsoft.DWT.Containers = [{ ContainerId: 'dwtcontrolContainer',Width: 270, Height: 350 }];
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', function () {
      status.innerText = "";
      DWTExtension.DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
      DWTExtension.DWObject.Viewer.width = "100%";
      DWTExtension.DWObject.Viewer.height = "100%";
      DWTExtension.DWObject.SetViewMode(2,2);
    });
    status.innerText = "Loading...";
    Dynamsoft.DWT.Load();
  },
  loadLibrary: function (src,type,id,data){
    return new Promise(function (resolve, reject) {
      let scriptEle = document.createElement("script");
      scriptEle.setAttribute("type", type);
      scriptEle.setAttribute("src", src);
      if (id) {
        scriptEle.id = id;
      }
      if (data) {
        for (let key in data) {
          scriptEle.setAttribute(key, data[key]);
        }
      }
      document.body.appendChild(scriptEle);
      scriptEle.addEventListener("load", () => {
        console.log(src+" loaded")
        resolve(true);
      });
      scriptEle.addEventListener("error", (ev) => {
        console.log("Error on loading "+src, ev);
        reject(ev);
      });
    });
  },
  loadStyle: function (url) {
    return new Promise(function (resolve, reject) {
      let linkEle = document.createElement('link')
      linkEle.type = 'text/css'
      linkEle.rel = 'stylesheet'
      linkEle.href = url
      let head = document.getElementsByTagName('head')[0]
      head.appendChild(linkEle)
      linkEle.addEventListener("load", () => {
        console.log(url+" loaded")
        resolve(true);
      });
      linkEle.addEventListener("error", (ev) => {
        console.log("Error on loading "+url, ev);
        reject(ev);
      });
    });
  }
}
