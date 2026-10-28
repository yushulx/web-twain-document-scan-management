var DWObject = null;

console.log("loading");

function CreateDWT(callback) {
  var success = function (obj) {
    DWObject = obj;
    //DWObject.Viewer.bind(document.getElementById('dwtcontrolContainer'));
    //DWObject.Viewer.show();
    callback(true);
  };

  var error = function (err) {
    callback(false);
  };

  Dynamsoft.DWT.CreateDWTObjectEx({
    WebTwainId: 'dwtcontrol'
  },
    success,
    error
  );
}

function Scan(options,callback) {
  if (DWObject) {
    DWObject.SelectSourceByIndex(options.selectedIndex);
    DWObject.CloseSource();
    DWObject.OpenSource();
    DWObject.IfShowUI = options.showUI;
    DWObject.PixelType = options.pixelType;
    DWObject.Resolution = options.resolution;
    console.log(options);
    var OnAcquireImageSuccess = function () {
      var success = function (result, indices, type) {
        DWObject.RemoveAllImages();
        callback(result.getData(0, result.getLength()));
      };

      var error = function (errorCode, errorString) {
        console.log(errorString);
        DWObject.RemoveAllImages();
        callback(false);
      };
      //1 is B&W, 8 is Gray, 24 is RGB
      if (DWObject.GetImageBitDepth(DWObject.CurrentImageIndexInBuffer) == 1) {
        DWObject.ConvertToGrayScale(DWObject.CurrentImageIndexInBuffer);
      }
        
      DWObject.ConvertToBase64(
        [DWObject.CurrentImageIndexInBuffer],
        Dynamsoft.DWT.EnumDWT_ImageType.IT_JPG,
        success,
        error
      );
      
    }
    var OnAcquireImageError = function () {
      callback(false);
    }
    DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageError);
  } else {
    callback(false);
  }
}

function GetScannersList() {
  var scanners = [];
  var count = DWObject.SourceCount;
  for (var i = 0; i < count; i++) {
    scanners.push(DWObject.GetSourceNameItems(i));
  }
  return scanners;
}
