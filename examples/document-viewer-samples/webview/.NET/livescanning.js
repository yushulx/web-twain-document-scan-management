let router;
let editViewer = null;
let perspectiveViewer = null;
let browseViewer = null;
let captureViewer = null;
let groupUid = "uniqueID";

class MyMobileViewer extends MyViewer {

    constructor(options) {
        super();
        this.initViewers();
        this.initLiveScanning();
    }

    async initLiveScanning() {
        await initDCV();
        await initDocDetectModule(Dynamsoft.DDV, Dynamsoft.CVR);
    }

    initViewers(){
        initBrowseViewer();
        initEditViewer();
        initCaptureViewer();
        initPerspectiveViewer();
        bindEvents();
    }

    // override
    getDocument() {
        let doc = editViewer.currentDocument;
        if (!doc) {
            doc = Dynamsoft.DDV.documentManager.createDocument();
            editViewer.openDocument(doc.uid);
        }
        return doc;
    }
}

async function initDCV(){
    Dynamsoft.Core.CoreModule.engineResourcePaths.rootDirectory = "dcv";
    Dynamsoft.Core.CoreModule.engineResourcePaths = {
        std: 'dcv/dynamsoft-capture-vision-std/dist',
        dip: 'dcv/dynamsoft-image-processing/dist',
        core: 'dcv/dynamsoft-core/dist',
        license: 'dcv/dynamsoft-license/dist',
        cvr: 'dcv/dynamsoft-capture-vision-router/dist',
        dbr: 'dcv/dynamsoft-barcode-reader/dist',
        dce: 'dcv/dynamsoft-camera-enhancer/dist',
        dcp: 'dcv/dynamsoft-code-parser/dist',
        dlr: 'dcv/dynamsoft-label-recognizer/dist',
        ddn: 'dcv/dynamsoft-document-normalizer/dist',
        utility: 'dcv/dynamsoft-utility/dist',
        dlrData: 'dcv/dynamsoft-label-recognizer-data/dist',
        dnn: 'dcv/dynamsoft-capture-vision-dnn/dist',
    };
    await Dynamsoft.License.LicenseManager.initLicense("DLS2eyJoYW5kc2hha2VDb2RlIjoiMTAwMjI3NzYzLVRYbFFjbTlxIiwibWFpblNlcnZlclVSTCI6Imh0dHBzOi8vbWx0cy5keW5hbXNvZnQuY29tIiwib3JnYW5pemF0aW9uSUQiOiIxMDAyMjc3NjMiLCJzdGFuZGJ5U2VydmVyVVJMIjoiaHR0cHM6Ly9zbHRzLmR5bmFtc29mdC5jb20iLCJjaGVja0NvZGUiOjE4OTc4MDUzNDV9",true);
    await Dynamsoft.Core.CoreModule.loadWasm(["DDN"]);
}

function initEditViewer(){
    const config = {
        type: Dynamsoft.DDV.Elements.Layout,
        flexDirection: "column",
        className: "ddv-edit-viewer-mobile",
        children: [
            {
            type: Dynamsoft.DDV.Elements.Layout,
            className: "ddv-edit-viewer-header-mobile",
            children: [
                {
                // Add a "Back" buttom to header and bind click event to go back to the perspective viewer
                // The event will be registered later.
                type: Dynamsoft.DDV.Elements.Button,
                className: "ddv-button-back",
                events:{
                    click: "back"
                }
                },
                Dynamsoft.DDV.Elements.Pagination
            ],
            },
            Dynamsoft.DDV.Elements.MainView,
            {
            type: Dynamsoft.DDV.Elements.Layout,
            className: "ddv-edit-viewer-footer-mobile",
            children: [
                Dynamsoft.DDV.Elements.DisplayMode,
                Dynamsoft.DDV.Elements.RotateLeft,
                Dynamsoft.DDV.Elements.Crop,
                Dynamsoft.DDV.Elements.Filter,
                Dynamsoft.DDV.Elements.Undo,
                Dynamsoft.DDV.Elements.Delete,
                {   
                    // Bind event for "PerspectiveAll" button to show the edit viewer
                    // The event will be registered later.
                    type: Dynamsoft.DDV.Elements.Button,
                    className: "ddv-load-image",
                    events:{
                        click: "loadFile"
                    }
                },
            ],
            },
        ],
    };
    editViewer = new Dynamsoft.DDV.EditViewer({
        groupUid: groupUid,
        container: "container",
        uiConfig: config,
    });
    editViewer.hide();
}

function initBrowseViewer(){
    browseViewer = new Dynamsoft.DDV.BrowseViewer({
        groupUid: groupUid,
        container: "container"
    });
}

function initPerspectiveViewer() {
    const perspectiveUiConfig = {
        type: Dynamsoft.DDV.Elements.Layout,
        flexDirection: "column",
        children: [
            {
                type: Dynamsoft.DDV.Elements.Layout,
                className: "ddv-perspective-viewer-header-mobile",
                children: [
                    {
                        // Add a "Back" button in perspective viewer's header and bind the event to go back to capture viewer.
                        // The event will be registered later.
                        type: Dynamsoft.DDV.Elements.Button,
                        className: "ddv-button-back",
                        events:{
                            click: "backToCaptureViewer"
                        }
                    },
                    Dynamsoft.DDV.Elements.Pagination,
                    {   
                        // Bind event for "PerspectiveAll" button to show the edit viewer
                        // The event will be registered later.
                        type: Dynamsoft.DDV.Elements.PerspectiveAll,
                        events:{
                            click: "showBrowseViewer"
                        }
                    },
                ],
            },
            Dynamsoft.DDV.Elements.MainView,
            {
                type: Dynamsoft.DDV.Elements.Layout,
                className: "ddv-perspective-viewer-footer-mobile",
                children: [
                    Dynamsoft.DDV.Elements.FullQuad,
                    Dynamsoft.DDV.Elements.RotateLeft,
                    Dynamsoft.DDV.Elements.RotateRight,
                    Dynamsoft.DDV.Elements.DeleteCurrent,
                    Dynamsoft.DDV.Elements.DeleteAll,
                ],
            },
        ],
    };
            
    // Create a perspective viewer
    perspectiveViewer = new Dynamsoft.DDV.PerspectiveViewer({
        container: "container",
        groupUid: groupUid,
        uiConfig: perspectiveUiConfig,
        viewerConfig: {
            scrollToLatest: true,
        }
    });
    perspectiveViewer.hide();
    return perspectiveViewer;
}

function initCaptureViewer() {
    const captureViewerUiConfig = {
        type: Dynamsoft.DDV.Elements.Layout,
        flexDirection: "column",
        children: [
            {
                type: Dynamsoft.DDV.Elements.Layout,
                className: "ddv-capture-viewer-header-mobile",
                children: [
                    {
                        type: "CameraResolution",
                        className: "ddv-capture-viewer-resolution",
                    },
                    Dynamsoft.DDV.Elements.Flashlight,
                ],
            },
            Dynamsoft.DDV.Elements.MainView,
            {
                type: Dynamsoft.DDV.Elements.Layout,
                className: "ddv-capture-viewer-footer-mobile",
                children: [
                    Dynamsoft.DDV.Elements.AutoDetect,
                    Dynamsoft.DDV.Elements.AutoCapture,
                    {
                        type: "Capture",
                        className: "ddv-capture-viewer-captureButton",
                    },
                    {
                        // Bind click event to "ImagePreview" element
                        // The event will be registered later.
                        type: Dynamsoft.DDV.Elements.ImagePreview,
                        events:{ 
                            click: "showPerspectiveViewer"
                        }
                    },
                    Dynamsoft.DDV.Elements.CameraConvert,
                ],
            },
        ],
    };
            
    // Create a capture viewer
    captureViewer = new Dynamsoft.DDV.CaptureViewer({
        container: "container",
        groupUid: groupUid,
        uiConfig: captureViewerUiConfig,
        viewerConfig: {
            acceptedPolygonConfidence: 60,
            enableAutoDetect: false,
        }
    });
    captureViewer.hide();
    return captureViewer;
}

function bindEvents(){
    // Register an event in `captureViewer` to show the perspective viewer
    captureViewer.on("showPerspectiveViewer",() => {
        switchViewer(0,1,0);
    });
        
    // Register an event in `perspectiveViewer` to go back the capture viewer
    perspectiveViewer.on("backToCaptureViewer",() => {
        switchViewer(1,0,0,0);
        captureViewer.play().catch(err => {alert(err.message)});
    });

    // Register an event in `perspectiveViewer` to show the edit viewer
    perspectiveViewer.on("showBrowseViewer",() => {
        switchViewer(0,0,0,1)
    });
        
    // Register an event in `editViewer` to go back the perspective viewer
    editViewer.on("backToPerspectiveViewer",() => {
        switchViewer(0,1,0,0);
    });

    editViewer.on("back",() => {
        switchViewer(0,0,0,1);
    });

    editViewer.on("loadFile",() => {
        MyViewerApp.invokeDotNet('loadFile', 'true', '');
    });
}

function showEditor(){
    switchViewer(0,0,1,0);
}

// Define a function to control the viewers' visibility
function switchViewer(c,p,e,b) {
    captureViewer.hide();
    perspectiveViewer.hide();
    editViewer.hide();
    browseViewer.hide();

    if(c) {
      captureViewer.show();
    } else {
      captureViewer.stop();
    }
          
    if(p) perspectiveViewer.show();
    if(e) editViewer.show();
    if(b) browseViewer.show();
};

function startLiveScanning(){
    switchViewer(1,0,0,0);
    captureViewer.play();
}

function stopLiveScanning(){
    switchViewer(0,0,0,1);
}

async function initDocDetectModule(DDV, CVR) {
    router = await CVR.CaptureVisionRouter.createInstance();
    class DDNNormalizeHandler extends DDV.DocumentDetect {
        async detect(image, config) {
        if (!router) {
            return Promise.resolve({
            success: false
            });
        };

        let width = image.width;
        let height = image.height;
        let ratio = 1;
        let data;

        if (height > 720) {
            ratio = height / 720;
            height = 720;
            width = Math.floor(width / ratio);
            data = compress(image.data, image.width, image.height, width, height);
        } else {
            data = image.data.slice(0);
        }


        // Define DSImage according to the usage of DDN
        const DSImage = {
            bytes: new Uint8Array(data),
            width,
            height,
            stride: width * 4, //RGBA
            format: 10 // IPF_ABGR_8888
        };

        // Use DDN normalized module
        const results = await router.capture(DSImage, 'DetectDocumentBoundaries_Default');

        // Filter the results and generate corresponding return values
        if (results.items.length <= 0) {
            return Promise.resolve({
            success: false
            });
        };

        const quad = [];
        results.items[0].location.points.forEach((p) => {
            quad.push([p.x * ratio, p.y * ratio]);
        });

        const detectResult = this.processDetectResult({
            location: quad,
            width: image.width,
            height: image.height,
            config
        });
        return Promise.resolve(detectResult);
        }
    }
    DDV.setProcessingHandler('documentBoundariesDetect', new DDNNormalizeHandler())
}

function compress(
    imageData,
    imageWidth,
    imageHeight,
    newWidth,
    newHeight,
) {
    let source = null;
    try {
        source = new Uint8ClampedArray(imageData);
    } catch (error) {
        source = new Uint8Array(imageData);
    }

    const scaleW = newWidth / imageWidth;
    const scaleH = newHeight / imageHeight;
    const targetSize = newWidth * newHeight * 4;
    const targetMemory = new ArrayBuffer(targetSize);
    let distData = null;

    try {
        distData = new Uint8ClampedArray(targetMemory, 0, targetSize);
    } catch (error) {
        distData = new Uint8Array(targetMemory, 0, targetSize);
    }

    const filter = (distCol, distRow) => {
        const srcCol = Math.min(imageWidth - 1, distCol / scaleW);
        const srcRow = Math.min(imageHeight - 1, distRow / scaleH);
        const intCol = Math.floor(srcCol);
        const intRow = Math.floor(srcRow);

        let distI = (distRow * newWidth) + distCol;
        let srcI = (intRow * imageWidth) + intCol;

        distI *= 4;
        srcI *= 4;

        for (let j = 0; j <= 3; j += 1) {
            distData[distI + j] = source[srcI + j];
        }
    };

    for (let col = 0; col < newWidth; col += 1) {
        for (let row = 0; row < newHeight; row += 1) {
            filter(col, row);
        }
    }

    return distData;
}