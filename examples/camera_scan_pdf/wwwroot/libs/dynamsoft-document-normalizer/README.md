# Document Normalizer for Your Website - User Guide

With Dynamsoft Document Normalizer JavaScript edition, you can add to your website the ability to take pictures of documents with your camera and normalize them to obtain high-quality images for further processing or archiving purposes.

> Dynamsoft Document Normalizer v2.0.11 and above is based on Dynamsoft Capture Vision Architecture. To learn more, read [Introduction to Dynamsoft Capture Vision](https://www.dynamsoft.com/capture-vision/docs/core/introduction/).

In this guide, you'll learn step-by-step how to build such a simple solution in a web page.

<span style="font-size:20px">Table of Contents</span>

- [Document Normalizer for Your Website - User Guide](#document-normalizer-for-your-website---user-guide)
  - [Hello World - Simplest Implementation](#hello-world---simplest-implementation)
    - [Understand the code](#understand-the-code)
      - [About the code](#about-the-code)
    - [Run the example](#run-the-example)
  - [Building your own page](#building-your-own-page)
    - [Include the SDK](#include-the-sdk)
      - [Use a CDN](#use-a-cdn)
      - [Host the SDK yourself](#host-the-sdk-yourself)
    - [Define necessary HTML elements](#define-necessary-html-elements)
    - [Prepare the SDK for the task](#prepare-the-sdk-for-the-task)
    - [Start the detection](#start-the-detection)
    - [Review and adjust the boundary](#review-and-adjust-the-boundary)
    - [Normalize the document](#normalize-the-document)
    - [Output the document as a file](#output-the-document-as-a-file)
    - [Restart task](#restart-task)
  - [System requirements](#system-requirements)
  - [Release notes](#release-notes)
  - [Next steps](#next-steps)

## Hello World - Simplest Implementation

The solution consists of two steps

1. Detect the document boundaries
2. Normalize the document based on the detected boundaries

### Understand the code

The following sample code sets up the SDK and implements boundary detection on a web page, which is just the first step in capturing a normalized image of your document. We'll cover the second step later in [Building Your Own Page](#building-your-own-page).

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-core@3.0.30/dist/core.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-license@3.0.20/dist/license.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-utility@1.0.20/dist/utility.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-document-normalizer@2.0.20/dist/ddn.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-capture-vision-router@2.0.30/dist/cvr.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/dynamsoft-camera-enhancer@4.0.1/dist/dce.js"></script>
</head>

<body>
    <h1>Detect the Boundary of the Document</h1>
    <button onclick="startDetection()">Start Detection</button>
    <div id="cameraViewContainer" style="width: 50vw; height: 45vh; margin-top: 10px; display: none"></div>

    <script>
        const cameraViewContainer = document.querySelector(
            "#cameraViewContainer"
        );
        let router;
        let cameraEnhancer;
        Dynamsoft.License.LicenseManager.initLicense(
                "DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9"
        );
        Dynamsoft.Core.CoreModule.loadWasm(["DDN"]);

        (async function() {
            router = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
            let view = await Dynamsoft.DCE.CameraView.createInstance();
            cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(
                view
            );
            cameraViewContainer.append(view.getUIElement());
            router.setInput(cameraEnhancer);
        })();
        async function startDetection() {
            cameraViewContainer.style.display = "block";
            await cameraEnhancer.open();
            await router.startCapturing("DetectDocumentBoundaries_Default");
        };
    </script>
</body>

</html>
```

-----

#### About the code

- `Dynamsoft.License.LicenseManager.initLicense()`: initializes the license using a license key string.

- `Dynamsoft.Core.CoreModule.loadWasm(["DDN"])`: preloads the `DocumentNormalizer` module, saving time in preparing for document border detection and image normalization.

- `Dynamsoft.CVR.CaptureVisionRouter.createInstance()`: initializes the `router` variable by creating an instance of the `CaptureVisionRouter` class. An instance of `CaptureVisionRouter` is the core of any solution based on Dynamsoft Capture Vision architecture.

  > Read more on [what is CaptureVisionRouter](https://www.dynamsoft.com/capture-vision/docs/core/architecture/#capture-vision-router)

- `Dynamsoft.DCE.CameraEnhancer.createInstance(view)`: initializes the `cameraEnhancer` variable by creating an instance of the `CameraEnhancer` class.

- `setInput()`: `router` connects to the image source through the [Image Source Adapter](https://www.dynamsoft.com/capture-vision/docs/web//programming/javascript/api-reference/core/image-source-adapter.html) interface with the method `setInput()`.

  > The image source in our case is a CameraEnhancer object created with `Dynamsoft.DCE.CameraEnhancer.createInstance(view)`

  > In some cases, a different camera might be required instead of the default one. Also, a different resolution might work better. To change the camera or the resolution, use the `CameraEnhancer` instance `cameraEnhancer`. Learn more [here](https://www.dynamsoft.com/camera-enhancer/docs/programming/javascript/api-reference/camera-control.html?ver=4.0.0&utm_source=npm&product=ddn&package=js).

- `startCapturing("DetectDocumentBoundaries_Default")` : starts to run images through a pre-defined process which, in the case of "DetectDocumentBoundaries_Default", tries to find the boundary of a document present in the image(s).

### Run the example

Create a text file called "Detect-A-Document-Boundary.html", fill it with the code above and save it. After that, open the example page in your browser, allow the page to access your camera, and the video will be displayed on the page. Afterwards, you will see the detected boundaries displayed on the video in real time.

> NOTE:
> 
> The sample code requires the following to run:
> 
> 1. Internet connection
> 2. [A supported browser](#system-requirements)
> 3. An accessible Camera

Please note:

- Although the page should work properly when opened directly as a file ("file:///"), it's recommended that you deploy it to a web server and access it via HTTPS.
- On first use, you need to wait a few seconds for the SDK to initialize.
- The license "DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9" used in this sample is an online license good for 24 hours and requires network connection to work. To test the SDK further, you can request a 30-day trial license via the [customer portal](https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform).

If the test doesn't go as expected, you can [contact us](https://www.dynamsoft.com/company/customer-service/#contact).

## Building your own page

In this section, we'll break down and show all the steps needed to build the solution in a web page.

We'll build on this skeleton page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
    <h1>Detect the Boundary of the Document and Normalize it</h1>
    <script>
      // Write your code here.
    </script>
</body>
</html>
```

### Include the SDK

To utilize the SDK, the initial step involves including the corresponding resource files:

* `core.js`: Required, encompasses common classes, interfaces, and enumerations that are shared across all Dynamsoft SDKs.
* `license.js`: Required, introduces the `LicenseManager` class, which manages the licensing for all Dynamsoft SDKs.
* `utility.js`Optional, encompasses auxiliary classes that are shared among all Dynamsoft SDKs.
* `dbr.js`: Required, defines interfaces and enumerations specifically tailored to the barcode reader module.
* `cvr.js`: Required, introduces the `CaptureVisionRouter` class, which governs the entire image processing workflow.
* `dce.js`: Recommended, comprises classes that offer camera support and basic user interface functionalities.

#### Use a CDN

The simplest way to include the SDK is to use either the [jsDelivr](https://jsdelivr.com/) or [UNPKG](https://unpkg.com/) CDN.

- jsDelivr

  ```html
  <script src="https://cdn.jsdelivr.net/npm/dynamsoft-core@3.0.30/dist/core.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dynamsoft-license@3.0.20/dist/license.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dynamsoft-utility@1.0.20/dist/utility.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dynamsoft-document-normalizer@2.0.20/dist/ddn.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dynamsoft-capture-vision-router@2.0.30/dist/cvr.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dynamsoft-camera-enhancer@4.0.1/dist/dce.js"></script>
  ```

- UNPKG

  ```html
  <script src="https://unpkg.com/dynamsoft-core@3.0.30/dist/core.js"></script>
  <script src="https://unpkg.com/dynamsoft-license@3.0.20/dist/license.js"></script>
  <script src="https://unpkg.com/dynamsoft-utility@1.0.20/dist/utility.js"></script>
  <script src="https://unpkg.com/dynamsoft-document-normalizer@2.0.20/dist/ddn.js"></script>
  <script src="https://unpkg.com/dynamsoft-capture-vision-router@2.0.30/dist/cvr.js"></script>
  <script src="https://unpkg.com/dynamsoft-camera-enhancer@4.0.1/dist/dce.js"></script>
  ```

#### Host the SDK yourself

Besides using the CDN, you can also download the SDK and host its files on your own website / server before including it in your application.

Options to download the SDK:

- From the website

  [Download the JavaScript ZIP package](https://www.dynamsoft.com/document-normalizer/downloads/?ver=2.0.20&utm_source=npm)

- yarn

  ```cmd
  yarn add dynamsoft-core@3.0.30 --save
  yarn add dynamsoft-license@3.0.20 --save
  yarn add dynamsoft-utility@1.0.20 --save
  yarn add dynamsoft-document-normalizer@2.0.20 --save
  yarn add dynamsoft-capture-vision-router@2.0.30 --save
  yarn add dynamsoft-camera-enhancer@4.0.1 --save
  ```

- npm

  ```cmd
  npm install dynamsoft-core@3.0.30 --save
  npm install dynamsoft-license@3.0.20 --save
  npm install dynamsoft-utility@1.0.20 --save
  npm install dynamsoft-document-normalizer@2.0.20 --save
  npm install dynamsoft-capture-vision-router@2.0.30 --save
  npm install dynamsoft-camera-enhancer@4.0.1 --save
  ```

Depending on how you downloaded the SDK and where you put it, you can typically include it like this:

  ```html
  <!-- Upon extracting the zip package into your project, you can generally include it in the following manner -->
  <script src="./dynamsoft/distributables/dynamsoft-core@3.0.30/dist/core.js"></script>
  <script src="./dynamsoft/distributables/dynamsoft-license@3.0.20/dist/license.js"></script>
  <script src="./dynamsoft/distributables/dynamsoft-utility@1.0.20/dist/utility.js"></script>
  <script src="./dynamsoft/distributables/dynamsoft-document-normalizer@2.0.20/dist/dbr.js"></script>
  <script src="./dynamsoft/distributables/dynamsoft-capture-vision-router@2.0.30/dist/cvr.js"></script>
  <script src="./dynamsoft/distributables/dynamsoft-camera-enhancer@4.0.1/dist/dce.js"></script>
  ```

or

  ```html
  <script src="./node_modules/dynamsoft-core@3.0.30/dist/core.js"></script>
  <script src="./node_modules/dynamsoft-license@3.0.20/dist/license.js"></script>
  <script src="./node_modules/dynamsoft-utility@1.0.20/dist/utility.js"></script>
  <script src="./node_modules/dynamsoft-document-normalizer@2.0.20/dist/dbr.js"></script>
  <script src="./node_modules/dynamsoft-capture-vision-router@2.0.30/dist/cvr.js"></script>
  <script src="./node_modules/dynamsoft-camera-enhancer@4.0.1/dist/dce.js"></script>
  ```

### Define necessary HTML elements

For this solution, we define three buttons and three `<div>` elements.

```html
<button id="start-detecting" onclick="startDetecting()">Start Detecting</button>
<button id="restart-detecting" onclick="restartDetecting()" style="display: none">Restart Detecting</button>
<button id="normalize-with-confirmed-quad" disabled>Normalize</button><br />
<div id="div-ui-container" style="margin-top: 10px; height: 450px"></div>
<div id="div-image-container" style="display: none; width: 100%; height: 70vh"></div>
<div id="normalized-result"></div>
```

```js
const btnStart = document.querySelector("#start-detecting");
const btnRestart = document.querySelector("#restart-detecting");
const btnNormalize = document.querySelector("#normalize-with-confirmed-quad");
const cameraViewContainer = document.querySelector("#div-ui-container");
const imageEditorViewContainer = document.querySelector("#div-image-container");
const normalizedImageContainer = document.querySelector("#normalized-result");
```

### Prepare the SDK for the task

The following function executes as soon as the page loads to get the SDK prepared:

```js
let cameraEnhancer = null;
let router = null;
let items;
let layer;
let originalImage;
let imageEditorView;
let promiseCVRReady;
let frameCount = 0

Dynamsoft.License.LicenseManager.initLicense("DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9");
/* Preloads the `DocumentNormalizer` module, saving time in preparing for document border detection and image normalization.*/
Dynamsoft.Core.CoreModule.loadWasm(["DDN"])

async function initDCE() {
  const view = await Dynamsoft.DCE.CameraView.createInstance();
  cameraEnhancer = await Dynamsoft.DCE.CameraEnhancer.createInstance(view);
  imageEditorView = await Dynamsoft.DCE.ImageEditorView.createInstance(imageEditorViewContainer);
  /* Creates an image editing layer for drawing found document boundaries. */
  layer = imageEditorView.createDrawingLayer();
  cameraViewContainer.append(view.getUIElement());
}

let cvrReady = (async function initCVR() {
  await initDCE();
  router = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
  router.setInput(cameraEnhancer);
})();
```

The code was explained earlier. Please refer to [About the Code](#about-the-code).

### Start the detection

Once the image processing is complete, the results are sent to all the registered `CapturedResultReceiver` objects. Each `CapturedResultReceiver` object may encompass one or multiple callback functions associated with various result types. In our task, we need to detect the document border and normalize it, so we use callback function `onCapturedResultReceived` to get both detected borders and the original image for later normalization.

> Read more on [`CapturedResultReceiver`](https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/core/basic-structures/captured-result-receiver.html)

```js
let cvrReady = (async function initCVR() {
  /**
   * Creates a CaptureVisionRouter instance and configure the task to detect document boundaries.
   * Also, make sure the original image is returned after it has been processed.
   */
  await initDCE();
  router = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();
  router.setInput(cameraEnhancer);
  /**
   * Sets the result types to be returned.
   * Because we need to normalize a document from the original image later, here we set the return result type to
   * include both the quadrilateral and original image data.
   */  
  let newSettings = await router.getSimplifiedSettings("DetectDocumentBoundaries_Default");
  newSettings.capturedResultItemTypes = Dynamsoft.Core.EnumCapturedResultItemType.CRIT_DETECTED_QUAD | Dynamsoft.Core.EnumCapturedResultItemType.CRIT_ORIGINAL_IMAGE;
  await router.updateSettings("DetectDocumentBoundaries_Default", newSettings)
  /* Defines the result receiver for the task.*/
  const resultReceiver = new Dynamsoft.CVR.CapturedResultReceiver();
  resultReceiver.onCapturedResultReceived = handleCapturedResult;
  router.addResultReceiver(resultReceiver);
})();

async function handleCapturedResult(result) {
  /* Update the result of the latest frame to the global variable items*/
  items = result.items;
  /* Do something with the result items*/
}
```

And we define the function `startDetecting` like this:

```js
async function startDetecting() {
  try {
    await (promiseCVRReady = promiseCVRReady || (async () => {
      await cvrReady;
      /* Starts streaming the video. */
      await cameraEnhancer.open();
      /* Uses the built-in template "DetectDocumentBoundaries_Default" to start a continuous boundary detection task. */
      await router.startCapturing("DetectDocumentBoundaries_Default");
    })());
  } catch (ex) {
    let errMsg;
    if (ex.message.includes("network connection error")) {
      errMsg = "Failed to connect to Dynamsoft License Server: network connection error. Check your Internet connection or contact Dynamsoft Support (support@dynamsoft.com) to acquire an offline license.";
    } else {
      errMsg = ex.message || ex;
    }
    console.error(errMsg);
    alert(errMsg);
  }
}
```

The steps of the workflow is as follows

1. `cameraEnhancer` streams the video, captures live video frames and stores them in a buffer.
2. `router` gets the video frames from `Image Source Adapter` and passes them to be processed by an internal `DocumentNormalizer` instance. The `cameraEnhancer` used here is a special implementation of the `Image Source Adapter`.
3. The internal `DocumentNormalizer` instance returns the found document boundaries, known as `quadsResultItems`, to `router`.
4. The `router` can output all types of CapturedResults that need to be captured through the `onCapturedResultReceived` callback function. In this example code we use the callback function to output `quadsResultItems` and `originalImageResultItem`.

> Also note that the `quadsResultItems` are drawn over the video automatically to show the detection in action.

*Note*:

* `router` is engineered to consistently request images from the image source.
* Three preset templates are at your disposal for document normalizing or border detection:

| Template Name                          | Function                                          |
| -------------------------------------- | ------------------------------------------------- |
| **DetectDocumentBoundaries_Default**   | Detect document border on images.                 |
| **NormalizeDocument_Default**          | Input an ROI and an image and normalize it.       |
| **DetectAndNormalizeDocument_Default** | Detect document border on images and normalize it |

### Review and adjust the boundary

First we update the callback function, use a specific condition to ensure that the camera has stabilized:

```js
async function handleCapturedResult(result) {
      /* Update the result of the latest frame to the global variable items*/
      items = result.items;
      /* Do something with the result */
      /* Saves the image data of the current frame for subsequent image editing. */
      const originalImage = result.items.filter((item) => item.type === 1);
      originalImageData = originalImage.length && originalImage[0].imageData;
      if (originalImageData) {
        if (result.items.length <= 1) {
          frameCount = 0;
          return;
        }
        frameCount++;
        /**
         * In our case, we define a good condition for "ready for normalization" as 
         * "getting the document boundary detected for 30 consecutive frames".
         * 
         * NOTE that this condition is not valid if you add a CapturedResultFilter 
         * with ResultDeduplication enabled.
         */
        if (frameCount === 30) {
          frameCount = 0;
          /* Stops the detection task since we assume we have found a good boundary. */
          router.stopCapturing();
          /* Hides the cameraView and shows the imageEditorView. */
          cameraViewContainer.style.display = "none";
          imageEditorViewContainer.style.display = "block";
          /* Draws the image on the imageEditorView first. */
          imageEditorView.setOriginalImage(originalImageData);
          quads = [];
          /* Draws the document boundary (quad) over the image. */
          for (let i = 0; i < result.items.length; i++) {
            if (result.items[i].type === Dynamsoft.Core.EnumCapturedResultItemType.CRIT_ORIGINAL_IMAGE) continue;
            const points = result.items[i].location.points;
            const quad = new Dynamsoft.DCE.DrawingItem.QuadDrawingItem({ points });
            quads.push(quad);
            layer.addDrawingItems(quads);
          }
          btnStart.style.display = "none";
          btnRestart.style.display = "inline";
          btnNormalize.disabled = false;
        }
      }
    }
```

The SDK tries to find the boundary of the document in each and every image processed. This happens very fast and we don't always get the perfect boundary for normalization. Therefore, we can refine the boundary within the `ImageEditorView` to enhance its quality before proceeding with the normalization process.
To do this, we can record the manually edited border information by:

```js
btnNormalize.addEventListener("click", async () => {
  /* Gets the selected quadrilateral. */
  let seletedItems = imageEditorView.getSelectedDrawingItems();
  let quad;
  if (seletedItems.length) {
    quad = seletedItems[0].getQuad();
  } else {
    quad = items[1].location;
  }
});
```

Now, the behavior will be

1. The page constantly detect the boundary of the document in the video.
2. When the border is successfully found for 30 consecutive frames, the page hides the video stream and draw both the image and the boundary in the "imageEditorViewer".
3. The user can adjust the boundary to be more precise.

### Normalize the document

After the user has adjusted the boundary or determined that the found boundary is good enough, he can press the button "Normalize" to carry out the normalization as the last step of the solution.
One way to use the adjusted border is to set it as the new ROI in the template `NormalizeDocument_Default`. You can simply update the code like this:

```js
btnNormalize.addEventListener("click", async () => {
  /* Gets the selected quadrilateral. */
  let seletedItems = imageEditorView.getSelectedDrawingItems();
  let quad;
  if (seletedItems.length) {
    quad = seletedItems[0].getQuad();
  } else {
    quad = items[1].location;
  }
  /* Hides the imageEditorView. */
  imageEditorViewContainer.style.display = "none";
  /* Removes the old normalized image if any. */
  normalizedImageContainer.innerHTML = "";
  /**
   * Sets the coordinates of the ROI (region of interest)
   * in the built-in template "NormalizeDocument_Default".
   */
  let newSettings = await router.getSimplifiedSettings("NormalizeDocument_Default");
  newSettings.roiMeasuredInPercentage = 0;
  newSettings.roi.points = quad.points;
  await router.updateSettings("NormalizeDocument_Default", newSettings);
  /* Executes the normalization and shows the result on the page. */
  let normalizeResult = await router.capture(originalImageData, "NormalizeDocument_Default");
  if (normalizeResult.items[0]) {
    normalizedImageContainer.append(normalizeResult.items[0].toCanvas());
  }
  layer.clearDrawingItems();
  btnNormalize.disabled = true;
});
```

The added behavior is:

1. The user hits "Normalize Image"
2. The image gets normalized with the adjusted boundary
3. The normalized image shows up on the page

### Output the document as a file

We can output the document as a file with the help of the class `Dynamsoft.Utility.ImageManager`. To do this, we change the following line in the function "normalizeImage()":

```js
normalizedImageContainer.append(normalizeResult.items[0].toCanvas());
```

to 

```js
const imageManager = new Dynamsoft.Utility.ImageManager();
imageManager.saveToFile(normalizeResult.items[0].imageData, "result.jpg", true);
```

Then once a document has been normalized, it is downloaded as JPEG file in the browser.

### Restart task

You can also add a button to restart the entire task:

```js
async function restartDetecting() {
  /* Reset the UI elements and restart the detection task. */
  imageEditorViewContainer.style.display = "none";
  normalizedImageContainer.innerHTML = "";
  cameraViewContainer.style.display = "block";
  btnStart.style.display = "inline";
  btnRestart.style.display = "none";
  btnNormalize.disabled = true;
  layer.clearDrawingItems()
  await router.startCapturing("DetectDocumentBoundaries_Default");
}
```
<!--TODO-->
You can also test the code above at [https://jsfiddle.net/DynamsoftTeam/](https://jsfiddle.net/DynamsoftTeam/L4m7r1db/)

<p align="center" style="text-align:center; white-space: normal; ">
  <a target="_blank" href="https://https://jsfiddle.net/DynamsoftTeam/L4m7r1db/" title="Run via JSFiddle">
    <img src="https://cdn.jsdelivr.net/npm/simple-icons@3.0.1/icons/jsfiddle.svg" alt="Run via JSFiddle" width="20" height="20" style="width:20px;height:20px;">
  </a>
</p>

## System requirements

The SDK requires the following features to work:

- Secure context (HTTPS deployment)

  When deploying your application / website for production, make sure to serve it via a secure HTTPS connection. This is required for two reasons
  
  - Access to the camera video stream is only granted in a security context. Most browsers impose this restriction.
  > Some browsers like Chrome may grant the access for `http://127.0.0.1` and `http://localhost` or even for pages opened directly from the local disk (`file:///...`). This can be helpful for temporary development and test.
  
  - Dynamsoft License requires a secure context to work.

- `WebAssembly`, `Blob`, `URL`/`createObjectURL`, `Web Workers`

  The above four features are required for the SDK to work.

The following table is a list of supported browsers based on the above requirements:

  | Browser Name | Version |
  | :----------: | :-----: |
  |    Chrome    |  v78+   |
  |   Firefox    |  v62+   |
  |    Safari    |  v14+   |
  |     Edge     |  v79+   |

Apart from the browsers, the operating systems may impose some limitations of their own that could restrict the use of the SDK.

## Release notes

Learn what are included in each release at [https://www.dynamsoft.com/document-normalizer/docs/programming/javascript/release-notes/?ver=latest](https://www.dynamsoft.com/document-normalizer/docs/programming/javascript/release-notes/?ver=latest).

## Next steps

Now that you have got the SDK integrated, you can choose to move forward in the following directions

1. Check out the [official samples](https://github.com/Dynamsoft/document-normalizer-javascript-samples).
2. Learn about the available [APIs](https://www.dynamsoft.com/document-normalizer/docs/web/programming/javascript/api-reference/?ver=latest).
