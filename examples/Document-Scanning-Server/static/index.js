window.onload = function(){
  console.log("onload");
  registerEvents();
  checkStatus();  
}



function registerEvents(){
  console.log("register event");
  var scanButton = document.getElementById("scanButton");
  scanButton.addEventListener("click",scan);
  var downloadButton = document.getElementById("downloadButton");
  downloadButton.addEventListener("click",download);
}

function checkStatus(){
  var url = "/api/dwtpage/load";
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4){
      console.log(xhr.responseText);
      var result = JSON.parse(xhr.responseText);
      console.log(result);
      loadScannersList();
    }
  }
  xhr.send();
}

function loadScannersList(){
  var url = "/api/scanner/getlist";
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);

  xhr.onreadystatechange = function(){
      if(xhr.readyState === 4){
          console.log(xhr.responseText);
          var result = JSON.parse(xhr.responseText);
          var scanners = document.getElementById("scannerselect");
          for (var i=0;i<result.scanners.length;i++) {
              scanners.add(new Option(result.scanners[i],result.scanners[i]));
          }
      }
  }
  xhr.send();
  
}


function scan(){
  var scanButton = document.getElementById("scanButton");
  var resolution = document.getElementById("resolutionSelect").selectedOptions[0].value;
  var selectedIndex = document.getElementById("scannerselect").selectedIndex;
  var url = "/api/scan?";
  url = url+"resolution="+resolution;
  url = url+"&selectedIndex="+selectedIndex;
  url = url+"&pixelType="+getColormode();
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onreadystatechange = function(){
    if(xhr.readyState === 4){
      console.log(xhr.status);
      console.log(xhr.responseText);
      var result = JSON.parse(xhr.responseText);
      if ("base64" in result) {
        var scannedImage = document.getElementById("scannedImage");
        scannedImage.src = "data:image/jpg;base64," + result.base64;
      }
    }
    scanButton.innerText = "Scan";
  }
  scanButton.innerText = "Scanning...";
  xhr.send();
}

function getColormode(){
  var bwRadio = document.getElementById("bwRadio");
  var grayRadio = document.getElementById("grayRadio");
  var colorRadio = document.getElementById("colorRadio");
  if (bwRadio.checked) {
    return 0;
  }else if (grayRadio.checked) {
    return 1;
  }else if (colorRadio.checked) {
    return 2;
  }
}

function download(){  	  
  var scannedImage = document.getElementById("scannedImage");
  if (scannedImage.src.indexOf("base64") != -1) {
    downloadFile('scanned.jpg', scannedImage.src);
  }else{
    alert("Not scanned");
  }
}

function downloadFile(fileName, content) {
  let aLink = document.createElement('a');
  let blob = base64ToBlob(content);
  let evt = document.createEvent("HTMLEvents");
  evt.initEvent("click", true, true);
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob);
  aLink.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}))
}

function base64ToBlob(code) {
  let parts = code.split(';base64,');
  let contentType = parts[0].split(':')[1];
  let raw = window.atob(parts[1]);
  let rawLength = raw.length;

  let uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  return new Blob([uInt8Array], {type: contentType});
}


