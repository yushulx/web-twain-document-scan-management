let editViewer = null;
let docManager = null;
let cvRouter = null;
let savedAnnotations = [];

// Button for activating the license
document.getElementById('activateButton').addEventListener('click', async () => {
    toggleLoading(true);
    let license = document.getElementById('licensekey').value;
    if (!license) {
        license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
    }

    await activate(license);
    toggleLoading(false);
    showViewer();
});

async function showViewer() {
    if (!docManager) return;
    let editContainer = document.getElementById("edit-viewer");
    editContainer.parentNode.style.display = "block";
    editViewer = new Dynamsoft.DDV.EditViewer({
        container: editContainer,
        uiConfig: isMobile() ? mobileEditViewerUiConfig : pcEditViewerUiConfig
    });
    editViewer.on("addQr", addQr);
    editViewer.on("download", download);
    editViewer.on("flatten", flatten);
    editViewer.on("scanBarcode", scanBarcode);
}

async function activate(license) {
    try {
        await Dynamsoft.License.LicenseManager.initLicense(license, true);
        // await Dynamsoft.Core.CoreModule.loadWasm(["dbr"]);

        // Initialize DCV
        cvRouter = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();

        // Initialize Dynamsoft Document Viewer
        // Dynamsoft.DDV.Core.engineResourcePath = "https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@2.1.0/dist/engine";
        await Dynamsoft.DDV.Core.init();
        Dynamsoft.DDV.setProcessingHandler("imageFilter", new Dynamsoft.DDV.ImageFilter());
        docManager = Dynamsoft.DDV.documentManager;


    } catch (error) {
        console.error(error);
        toggleLoading(false);
    }

}

// Button for saving PDF
const savePDFButton = document.getElementById('savePDF');
const cancelPDFButton = document.getElementById('cancelPDF');

cancelPDFButton.addEventListener('click', () => {
    document.getElementById("save-pdf").style.display = "none";
});

savePDFButton.addEventListener('click', async () => {
    const fileName = document.getElementById('fileName').value;
    const password = document.getElementById('password').value;
    const annotationType = document.getElementById('annotationType').value;

    try {
        const pdfSettings = {
            password: password,
            saveAnnotation: annotationType,
        };

        let blob = await editViewer.currentDocument.saveToPdf(pdfSettings);

        saveBlob(blob, fileName + `.pdf`);
    } catch (error) {
        console.log(error);
    }

    document.getElementById("save-pdf").style.display = "none";
});

function saveBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Button for generating barcode
const generateBarcodeButton = document.getElementById('generateBarcode');
const cancelBarcodeButton = document.getElementById('cancelBarcode');

cancelBarcodeButton.addEventListener('click', () => {
    document.getElementById("generate-barcode").style.display = "none";
});

generateBarcodeButton.addEventListener('click', async () => {
    const barcodeType = document.getElementById("barcodeType").value;
    const barcodeContent = document.getElementById("barcodeContent").value;
    const x = Number(document.getElementById("x").value);
    const y = Number(document.getElementById("y").value);
    const applyToAllPages = document.getElementById("applyToAllPages").checked;

    if (!barcodeContent) {
        alert("Please enter barcode content.");
        return;
    }

    // Close the pop-up
    document.getElementById("generate-barcode").style.display = "none";

    let docs = docManager.getAllDocuments();

    let tempCanvas = document.createElement('canvas');
    if (barcodeContent !== null) {
        try {

            bwipjs.toCanvas(tempCanvas, {
                bcid: barcodeType,
                text: barcodeContent,
                scale: 3,
                includetext: false,
                // version: 5,
                // eclevel: 'M',
            });

            // Convert the canvas to a data URL and then to a Blob
            tempCanvas.toBlob(async (blob) => {
                if (blob) {
                    let currentPageId = docs[0].pages[editViewer.getCurrentPageIndex()];
                    let pageData = await docs[0].getPageData(currentPageId);

                    const option = {
                        stamp: blob,
                        x: x > pageData.mediaBox.width ? pageData.mediaBox.width - 110 : x,
                        y: y > pageData.mediaBox.height ? pageData.mediaBox.height - 110 : y,
                        width: 100,
                        height: 100,
                        opacity: 1.0,
                        flags: {
                            print: false,
                            noView: false,
                            readOnly: false,

                        }
                    }

                    if (applyToAllPages) {
                        for (let i = 0; i < docs[0].pages.length; i++) {
                            let barcodeAnnotation = await Dynamsoft.DDV.annotationManager.createAnnotation(docs[0].pages[i], "stamp", option)
                            barcodeAnnotation['name'] = 'barcode';
                        }
                    } else {

                        let barcodeAnnotation = await Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "stamp", option)
                        barcodeAnnotation['name'] = 'barcode';
                    }
                }
            }, 'image/png');
        } catch (e) {
            console.log(e);
        }
    }
});

// Keyboard shortcut
function handleKeyboardShortcut(event) {
    // Check if 'Ctrl' and 'Q' are pressed together
    if (event.ctrlKey && event.key.toLowerCase() === 'q') {
        event.preventDefault(); // Prevent the default browser behavior
        addQr();
    }
}

window.addEventListener('keydown', handleKeyboardShortcut);

// Loading indicator
function toggleLoading(isLoading) {
    if (isLoading) {
        document.getElementById("loading-indicator").style.display = "flex";
    } else {
        document.getElementById("loading-indicator").style.display = "none";
    }
}


// Event handlers
function addQr() {
    let docs = docManager.getAllDocuments();
    if (docs.length == 0) {
        alert("Please load a document first.");
        return;
    }

    document.getElementById("generate-barcode").style.display = "flex";
}

function flatten() {
    if (!docManager) return;

    let docs = docManager.getAllDocuments();
    if (docs.length == 0) {
        alert("Please load a document first.");
        return;
    }
    let currentPageId = docs[0].pages[editViewer.getCurrentPageIndex()];
    let annotations = Dynamsoft.DDV.annotationManager.getAnnotationsByPage(currentPageId);

    for (let i = 0; i < annotations.length; i++) {
        annotations[i].flattened = true;
    }
}



async function scanBarcode() {
    let docs = docManager.getAllDocuments();
    if (docs.length == 0) {
        alert("Please load a document first.");
        return;
    }

    // Save barcode annotations for detection
    const settings = {
        quality: 100,
        saveAnnotation: false,
    };

    let currentPageId = docs[0].pages[editViewer.getCurrentPageIndex()];
    let annotations = Dynamsoft.DDV.annotationManager.getAnnotationsByPage(currentPageId);

    for (let i = 0; i < annotations.length; i++) {
        annotations[i].flattened = true;
    }
    const image = await editViewer.currentDocument.saveToJpeg(editViewer.getCurrentPageIndex(), settings);

    const result = await cvRouter.capture(image, "ReadBarcodes_Default"); // https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/capture-vision-router/preset-templates.html?product=dbr&lang=javascript

    // Undo the flattened status for barcode annotations
    for (let i = 0; i < annotations.length; i++) {
        if (annotations[i].name === 'barcode') {
            annotations[i].flattened = false;
        }
    }

    // clear annotations
    if (savedAnnotations.length > 0) {
        for (let i = 0; i < savedAnnotations.length; i++) {
            // https://www.dynamsoft.com/document-viewer/docs/api/class/annotationmanager.html#deleteannotations

            await Dynamsoft.DDV.annotationManager.deleteAnnotations([savedAnnotations[i].uid]);
        }

        savedAnnotations = [];
    }

    for (let item of result.items) {
        if (item.type !== Dynamsoft.Core.EnumCapturedResultItemType.CRIT_BARCODE) {
            continue;
        }
        console.log(JSON.stringify(item));
        let text = item.text;
        let points = item.location.points;

        let currentPageId = docs[0].pages[editViewer.getCurrentPageIndex()];
        let pageData = await docs[0].getPageData(currentPageId);

        // https://www.dynamsoft.com/document-viewer/docs/api/interface/annotationinterface/texttypewriterannotationoptions.html
        const textTypewriterOptions = {
            x: points[0].x / pageData.display.width * pageData.mediaBox.width,
            y: points[0].y / pageData.display.height * pageData.mediaBox.height,
            textContents: [{ content: text, color: "rgb(255,0,0)" }],
            flags: {
                print: false,
                noView: false,
                readOnly: false,

            }
        }

        // https://www.dynamsoft.com/document-viewer/docs/api/class/annotationmanager.html#createAnnotation
        let textTypewriter = await Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "textTypewriter", textTypewriterOptions)
        savedAnnotations.push(textTypewriter);


        // https://www.dynamsoft.com/document-viewer/docs/api/interface/annotationinterface/polygonannotationoptions.html
        const polygonOptions = {
            points: points.map(p => {
                return {
                    x: p.x / pageData.display.width * pageData.mediaBox.width,
                    y: p.y / pageData.display.height * pageData.mediaBox.height
                }
            }),
            borderColor: "rgb(255,0,0)",
            flags: {
                print: false,
                noView: false,
                readOnly: false,

            }
        }

        let polygon = Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "polygon", polygonOptions);
        savedAnnotations.push(polygon);
    }
}

async function download() {
    document.getElementById("save-pdf").style.display = "flex";
}


// Layout UI Config
function isMobile() {
    return "ontouchstart" in document.documentElement;
}

const qrButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "material-icons icon-qr_code",
    tooltip: "Add a QR code. Ctrl+Q",
    events: {
        click: "addQr",
    },
};

const checkButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "material-icons icon-check",
    tooltip: "Apply Flattening",
    events: {
        click: "flatten",
    },
};

const scanButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "material-icons icon-scan",
    tooltip: "Detect barcodes from the current page",
    events: {
        click: "scanBarcode",
    },
}

const pcEditViewerUiConfig = {
    type: Dynamsoft.DDV.Elements.Layout,
    flexDirection: "column",
    className: "ddv-edit-viewer-desktop",
    children: [
        {
            type: Dynamsoft.DDV.Elements.Layout,
            className: "ddv-edit-viewer-header-desktop",
            children: [
                {
                    type: Dynamsoft.DDV.Elements.Layout,
                    children: [
                        {
                            type: Dynamsoft.DDV.Elements.Button,
                            className: "ddv-button-back",
                            events: {
                                click: "backToPerspectiveViewer"
                            }
                        },
                        Dynamsoft.DDV.Elements.ThumbnailSwitch,
                        Dynamsoft.DDV.Elements.Zoom,
                        Dynamsoft.DDV.Elements.FitMode,
                        Dynamsoft.DDV.Elements.DisplayMode,
                        Dynamsoft.DDV.Elements.RotateLeft,
                        Dynamsoft.DDV.Elements.RotateRight,
                        Dynamsoft.DDV.Elements.Crop,
                        Dynamsoft.DDV.Elements.Filter,
                        Dynamsoft.DDV.Elements.Undo,
                        Dynamsoft.DDV.Elements.Redo,
                        Dynamsoft.DDV.Elements.DeleteCurrent,
                        Dynamsoft.DDV.Elements.DeleteAll,
                        Dynamsoft.DDV.Elements.Pan,
                        Dynamsoft.DDV.Elements.AnnotationSet,
                        qrButton,
                        checkButton,
                        scanButton,
                    ],
                },
                {
                    type: Dynamsoft.DDV.Elements.Layout,
                    children: [
                        {
                            type: Dynamsoft.DDV.Elements.Pagination,
                            className: "ddv-edit-viewer-pagination-desktop",
                        },
                        Dynamsoft.DDV.Elements.Load,
                        {
                            type: Dynamsoft.DDV.Elements.Button,
                            className: "ddv-button ddv-button-download",
                            events: {
                                click: "download",
                            }
                        }
                    ],
                },
            ],
        },
        Dynamsoft.DDV.Elements.MainView,
    ],
};

const mobileEditViewerUiConfig = {
    type: Dynamsoft.DDV.Elements.Layout,
    flexDirection: "column",
    className: "ddv-edit-viewer-mobile",
    children: [
        {
            type: Dynamsoft.DDV.Elements.Layout,
            className: "ddv-edit-viewer-header-mobile",
            children: [
                {
                    type: Dynamsoft.DDV.Elements.Button,
                    className: "ddv-button-back",
                    events: {
                        click: "backToPerspectiveViewer"
                    }
                },
                Dynamsoft.DDV.Elements.Pagination,
                Dynamsoft.DDV.Elements.Load,
                {
                    type: Dynamsoft.DDV.Elements.Button,
                    className: "ddv-button ddv-button-download",
                    events: {
                        click: "download",
                    }
                },
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
                Dynamsoft.DDV.Elements.AnnotationSet,
                qrButton,
                checkButton,
                scanButton,
            ],
        },
    ],
};