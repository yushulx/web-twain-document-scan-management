// Web TWAIN setup + sample actions.
//
// Moved out of index.html so the page CSP can keep script-src strict
// (no 'unsafe-inline'). Inline <script> and onclick= handlers would
// require 'unsafe-inline'; loading this external file does not.
// Button clicks are wired with addEventListener instead of onclick=
// attributes for the same reason.

Dynamsoft.DWT.AutoLoad = false;
Dynamsoft.DWT.IfCheckCssFiles = false;
Dynamsoft.DWT.Containers = [
  { ContainerId: "dwtcontrolContainer", Width: "380px", Height: "400px" },
];
Dynamsoft.DWT.ProductKey =
  "t0198EQYAAIYXHFdgmU599tVMHnppKEWmT9YGpNtsUorHyqzluwSVBVcH4IO9/TnJQKE9ls8IplUDjhWJmyMLd8RDDO+YDM66c2KCU8Y7hcY7eYITj5xELn7adNoqzgsTcABrBOS8DifAJZDWUgGb/vbeGTIAPUA6gPTWwD2guQsffJTBC7/XmP53oC0nJjhlvLNMkDFOnuDEI6dPEGNJvf1u95QgXN6cDEAPkCbAv4fskiBUA+gB0gS2KouRAWQXhnHKfgAowDeC";
Dynamsoft.DWT.Load();

var DWTObject;

Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", function () {
  DWTObject = Dynamsoft.DWT.GetWebTwain("dwtcontrolContainer");
});

function AcquireImage() {
  if (DWTObject) {
    DWTObject.SelectSourceAsync()
      .then(function () {
        return DWTObject.AcquireImageAsync({
          IfCloseSourceAfterAcquire: true,
          IfShowUI: false,
          PixelType: Dynamsoft.DWT.EnumDWT_PixelType.TWPT_GRAY,
          Resolution: 150,
        });
      })
      .catch(function (exp) {
        alert(exp.message);
      });
  }
}

function upload() {
  if (DWTObject && DWTObject.HowManyImagesInBuffer > 0) {
    var strUrl = "https://demo.dynamsoft.com/sample-uploads/";
    var imgAry = [DWTObject.CurrentImageIndexInBuffer];
    DWTObject.HTTPUpload(
      strUrl,
      imgAry,
      Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG,
      Dynamsoft.DWT.EnumDWT_UploadDataFormat.Binary,
      "WebTWAINImage.png",
      function () {
        alert("Upload successful");
      },
      function (errorCode, errorString, sHttpResponse) {
        alert(sHttpResponse.length > 0 ? sHttpResponse : errorString);
      }
    );
  } else {
    alert("There is no image in buffer.");
  }
}

function binarizeImage() {
  DWTObject.ConvertToBW(DWTObject.CurrentImageIndexInBuffer);
}

function rotateCW() {
  DWTObject.RotateRight(DWTObject.CurrentImageIndexInBuffer);
}

function rotateCCW() {
  DWTObject.RotateLeft(DWTObject.CurrentImageIndexInBuffer);
}

document.getElementById("btnScan").addEventListener("click", AcquireImage);
document.getElementById("btnUpload").addEventListener("click", upload);
document.getElementById("btnBinarize").addEventListener("click", binarizeImage);
document.getElementById("btnRotateCW").addEventListener("click", rotateCW);
document.getElementById("btnRotateCCW").addEventListener("click", rotateCCW);
