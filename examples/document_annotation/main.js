let editViewer = null;
let docManager = null;
let cvRouter = null;
let currentDoc = null;
let fileBlob = null;
let documentPoints = null;

// Button for detecting documents
let detectDocumentButton = document.getElementById("detectDocument");
let cancelDocumentButton = document.getElementById("cancelDocument");
let normalizeDocumentButton = document.getElementById("normalizeDocument");

cancelDocumentButton.addEventListener('click', () => {
    document.getElementById("document-detection").style.display = "none";
});

normalizeDocumentButton.addEventListener('click', async () => {
    document.getElementById("document-detection").style.display = "none";

    let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
    let blob = await normalizeImage();

    if (blob) {
        await currentDoc.updatePage(currentPageId, blob);
        documentPoints = null;
    }
});

detectDocumentButton.addEventListener('click', async () => {
    document.getElementById("document-detection").style.display = "none";

    const settings = {
        quality: 100,
        saveAnnotation: false,
    };

    const image = await editViewer.currentDocument.saveToJpeg(editViewer.getCurrentPageIndex(), settings);
    const result = await cvRouter.capture(image, "DetectDocumentBoundaries_Default"); // https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/capture-vision-router/preset-templates.html?product=dbr&lang=javascript

    for (let item of result.items) {
        // https://www.dynamsoft.com/capture-vision/docs/core/enums/core/captured-result-item-type.html
        if (item.type !== Dynamsoft.Core.EnumCapturedResultItemType.CRIT_DETECTED_QUAD) {
            continue;
        }
        // console.log(JSON.stringify(item));
        let points = item.location.points;

        let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
        let pageData = await currentDoc.getPageData(currentPageId);

        // https://www.dynamsoft.com/document-viewer/docs/api/interface/annotationinterface/polygonannotationoptions.html
        documentPoints = points;

        const polygonOptions = {
            points: points.map(p => {
                return {
                    x: p.x / pageData.display.width * pageData.mediaBox.width,
                    y: p.y / pageData.display.height * pageData.mediaBox.height
                }
            }),
            borderColor: "rgb(0,0,255)",
            flags: {
                print: false,
                noView: false,
                readOnly: false,

            }
        }

        let polygon = Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "polygon", polygonOptions);
        // console.log(JSON.stringify(polygon));
        polygon['name'] = 'document';

        break;
    }
});

async function normalizeImage() {

    if (!documentPoints) {
        return null;
    }

    let params = await cvRouter.getSimplifiedSettings("NormalizeDocument_Default");
    params.roi.points = documentPoints;
    params.roiMeasuredInPercentage = 0;
    await cvRouter.updateSettings("NormalizeDocument_Default", params);

    const settings = {
        quality: 100,
        saveAnnotation: false,
    };

    const image = await editViewer.currentDocument.saveToJpeg(editViewer.getCurrentPageIndex(), settings);
    const result = await cvRouter.capture(image, "NormalizeDocument_Default"); // https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/capture-vision-router/preset-templates.html?product=dbr&lang=javascript

    for (let item of result.items) {
        // https://www.dynamsoft.com/capture-vision/docs/core/enums/core/captured-result-item-type.html
        if (item.type !== Dynamsoft.Core.EnumCapturedResultItemType.CRIT_NORMALIZED_IMAGE) {
            continue;
        }

        // let data = Dynamsoft.Core._getNorImageData(item.imageData)
        // let blob = await Dynamsoft.Core._toBlob("image/png", data);

        let blob = await item.toBlob();
        // saveBlob(blob, "normalized.png");
        return blob;
    }
}

// https://www.dynamsoft.com/document-viewer/docs/api/class/annotationmanager.html#on
const eventFunc = async (e) => {
    // console.log(e);
    // console.log(e.modifiedAnnotations[0].uid);
    // console.log(e.modifiedAnnotations[0].newOptions);
    // console.log(e.actions);

    let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
    let pageData = await currentDoc.getPageData(currentPageId);

    let annotations = Dynamsoft.DDV.annotationManager.getAnnotationsByUids([e.modifiedAnnotations[0].uid]);

    for (let i = 0; i < annotations.length; i++) {
        if (annotations[i].name === 'document') {
            let points = e.modifiedAnnotations[0].newOptions.points;

            // Convert the points to the coordinates of the original image
            documentPoints = points.map(p => {
                return {
                    x: p.x / pageData.mediaBox.width * pageData.display.width,
                    y: p.y / pageData.mediaBox.height * pageData.display.height
                }
            });

            break;
        }
    }
};

Dynamsoft.DDV.annotationManager.on("annotationsModified", eventFunc);

// Button for drawing signature
let canvas = document.getElementById("signatureCanvas");
let ctx = canvas.getContext("2d");
let isDrawing = false;
let color = "black";  // Default color
let strokeWidth = 3;  // Default stroke width
let drawingHistory = []; // To store the drawing paths

// Set canvas size
canvas.width = 500;
canvas.height = 300;

// Start drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Touch events
canvas.addEventListener("touchstart", startDrawing);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", stopDrawing);
canvas.addEventListener("touchcancel", stopDrawing);

// Prevent default touch behavior to avoid scrolling
canvas.addEventListener("touchstart", function (event) {
    event.preventDefault();
}, { passive: false });

// Change stroke color instantly
document.getElementById("blue").addEventListener("click", () => {
    color = "blue";
    redrawCanvas();
});

document.getElementById("red").addEventListener("click", () => {
    color = "red";
    redrawCanvas();
});

document.getElementById("black").addEventListener("click", () => {
    color = "black";
    redrawCanvas();
});

// Change stroke width instantly
document.getElementById("strokeSlider").addEventListener("input", (e) => {
    strokeWidth = e.target.value;
    redrawCanvas();
});

function getCoordinates(event) {
    // Check if the event is a touch event
    if (event.touches) {
        // Get the touch position
        const touch = event.touches[0];
        return {
            x: touch.clientX - canvas.getBoundingClientRect().left,
            y: touch.clientY - canvas.getBoundingClientRect().top
        };
    } else {
        // For mouse events
        return { x: event.offsetX, y: event.offsetY };
    }
}

function startDrawing(event) {
    isDrawing = true;
    const { x, y } = getCoordinates(event);
    let currentPath = {
        color: color,
        strokeWidth: strokeWidth,
        points: [{ x: x, y: y }]
    };
    drawingHistory.push(currentPath);
}

function draw(event) {
    if (isDrawing) {
        // Get the current path from history and add new points
        const { x, y } = getCoordinates(event);
        let currentPath = drawingHistory[drawingHistory.length - 1];
        currentPath.points.push({ x: x, y: y });
        redrawCanvas();
    }
}

function stopDrawing() {
    isDrawing = false;
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Redraw all the paths with the current stroke settings
    drawingHistory.forEach(path => {
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
            ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    });
}

function clearCanvas() {
    drawingHistory = [];
    redrawCanvas();
}


const signatureOKButton = document.getElementById('signatureOK');
const signatureRedrawButton = document.getElementById('signatureRedraw');
const signatureCancelButton = document.getElementById('signatureCancel');

signatureOKButton.addEventListener('click', async () => {
    const applyToAllPages = document.getElementById("signatureAllPage").checked;

    const x = Number(document.getElementById("signatureX").value);
    const y = Number(document.getElementById("signatureY").value);

    canvas.toBlob(async (blob) => {
        if (blob) {
            let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
            let pageData = await currentDoc.getPageData(currentPageId);

            const option = {
                stamp: blob,
                x: x > pageData.mediaBox.width - canvas.width ? pageData.mediaBox.width - canvas.width - 10 : x,
                y: y > pageData.mediaBox.height - canvas.height ? pageData.mediaBox.height - canvas.height - 10 : y,
                width: canvas.width,
                height: canvas.height,
                opacity: 1.0,
                flags: {
                    print: false,
                    noView: false,
                    readOnly: false,

                }
            }

            try {

                if (applyToAllPages) {
                    for (let i = 0; i < currentDoc.pages.length; i++) {
                        let signatureAnnotation = await Dynamsoft.DDV.annotationManager.createAnnotation(currentDoc.pages[i], "stamp", option)
                        signatureAnnotation['name'] = 'signature';
                    }
                } else {

                    let signatureAnnotation = await Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "stamp", option)
                    signatureAnnotation['name'] = 'signature';
                }

            } catch (e) {
                console.log(e);
            }
        }
    }, 'image/png');

    document.getElementById("signature-input").style.display = "none";
});

signatureRedrawButton.addEventListener('click', async () => {
    drawingHistory = [];
    redrawCanvas();
});

signatureCancelButton.addEventListener('click', async () => {
    document.getElementById("signature-input").style.display = "none";
});


function sign() {
    let docs = docManager.getAllDocuments();
    if (docs.length == 0) {
        alert("Please load a document first.");
        return;
    }

    document.getElementById("signature-input").style.display = "flex";
}

// Button for inputting the password
const submitPasswordButton = document.getElementById('submitPassword');
const cancelPasswordButton = document.getElementById('cancelPassword');

cancelPasswordButton.addEventListener('click', () => {
    document.getElementById("password-input").style.display = "none";
}
);

submitPasswordButton.addEventListener('click', async () => {
    const password = document.getElementById('pdfpassword').value;
    load(fileBlob, password);
    document.getElementById("password-input").style.display = "none";
});

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
        uiConfig: isMobile() ? mobileEditViewerUiConfig : pcEditViewerUiConfig,
    });
    editViewer.displayMode = "single";
    editViewer.on("addQr", addQr);
    editViewer.on("download", download);
    editViewer.on("flatten", flatten);
    editViewer.on("scanBarcode", scanBarcode);
    editViewer.on("loadDocument", loadDocument);
    editViewer.on("clearAll", clearAnnotations);
    editViewer.on("sign", sign);
    editViewer.on("detectDocument", detectDocument);
    editViewer.on("recognizeText", recognizeText);
}

async function activate(license) {
    try {
        await Dynamsoft.License.LicenseManager.initLicense(license, true);
        await Dynamsoft.Core.CoreModule.loadWasm(["dbr", "ddn", "dlr"]);

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

    // clearAnnotations();

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

async function clearAnnotations() {
    if (!currentDoc) {
        alert("Please load a document first.");
        return;
    }

    let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
    let annotations = Dynamsoft.DDV.annotationManager.getAnnotationsByPage(currentPageId);

    if (annotations.length > 0) {
        for (let i = 0; i < annotations.length; i++) {
            // https://www.dynamsoft.com/document-viewer/docs/api/class/annotationmanager.html#deleteannotations

            if (!annotations[i].flattened && annotations[i].name !== 'barcode') {
                await Dynamsoft.DDV.annotationManager.deleteAnnotations([annotations[i].uid]);
            }
        }
    }
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
                    let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
                    let pageData = await currentDoc.getPageData(currentPageId);

                    const option = {
                        stamp: blob,
                        x: x > pageData.mediaBox.width - tempCanvas.width ? pageData.mediaBox.width - tempCanvas.width - 10 : x,
                        y: y > pageData.mediaBox.height - tempCanvas.height ? pageData.mediaBox.height - tempCanvas.height - 10 : y,
                        width: tempCanvas.width,
                        height: tempCanvas.height,
                        opacity: 1.0,
                        flags: {
                            print: false,
                            noView: false,
                            readOnly: false,

                        }
                    }

                    if (applyToAllPages) {
                        for (let i = 0; i < currentDoc.pages.length; i++) {
                            let barcodeAnnotation = await Dynamsoft.DDV.annotationManager.createAnnotation(currentDoc.pages[i], "stamp", option)
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
    let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
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

    let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
    let annotations = Dynamsoft.DDV.annotationManager.getAnnotationsByPage(currentPageId);

    for (let i = 0; i < annotations.length; i++) {
        if (annotations[i].name === 'barcode') {
            annotations[i].flattened = true;
        }
    }
    const image = await editViewer.currentDocument.saveToJpeg(editViewer.getCurrentPageIndex(), settings);
    // saveBlob(image, "temp.jpg");
    const result = await cvRouter.capture(image, "ReadBarcodes_ReadRateFirst"); // https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/capture-vision-router/preset-templates.html?product=dbr&lang=javascript

    // Undo the flattened status for barcode annotations
    for (let i = 0; i < annotations.length; i++) {
        if (annotations[i].name === 'barcode') {
            annotations[i].flattened = false;
        }
    }

    // clear annotations
    clearAnnotations();

    for (let item of result.items) {
        if (item.type !== Dynamsoft.Core.EnumCapturedResultItemType.CRIT_BARCODE) {
            continue;
        }
        // console.log(JSON.stringify(item));
        let text = item.text;
        let points = item.location.points;

        let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
        let pageData = await currentDoc.getPageData(currentPageId);

        // https://www.dynamsoft.com/document-viewer/docs/api/interface/annotationinterface/texttypewriterannotationoptions.html
        let textX = Math.min(points[0].x, points[1].x, points[2].x, points[3].x) / pageData.display.width * pageData.mediaBox.width;
        let textY = Math.min(points[0].y, points[1].y, points[2].y, points[3].y) / pageData.display.height * pageData.mediaBox.height;

        const textTypewriterOptions = {
            x: textX < 0 ? 0 : textX,
            y: textY - 15 < 0 ? 0 : textY - 15,
            textContents: [{ content: text, color: "rgb(255,0,0)" }],
            flags: {
                print: false,
                noView: false,
                readOnly: false,

            }
        }

        // https://www.dynamsoft.com/document-viewer/docs/api/class/annotationmanager.html#createAnnotation
        let textTypewriter = await Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "textTypewriter", textTypewriterOptions)
        textTypewriter['name'] = 'overlay';

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
        polygon['name'] = 'overlay';
    }
}

function download() {
    document.getElementById("save-pdf").style.display = "flex";
}

async function load(blob, password) {
    try {
        if (!currentDoc) {
            currentDoc = Dynamsoft.DDV.documentManager.createDocument({
                name: Date.now().toString(),
                author: "DDV",
            });
        }

        const source = {
            fileData: blob,
            password: password,
            renderOptions: {
                renderAnnotations: "loadAnnotations"
            }
        };
        await currentDoc.loadSource([source]);
        editViewer.openDocument(currentDoc);
        editViewer.goToPage(editViewer.getPageCount() - 1);
    } catch (error) {
        console.error(error);

        // PDF is encrypted
        if (error.cause.code == -80202) {
            document.getElementById("password-input").style.display = "flex";
            // const password = prompt("Please enter the password.");
            // if (password) {
            //     load(blob, password);
            // }
        }
    }
}

function loadDocument() {
    let fileInput = document.createElement("input");
    fileInput.type = "file";
    // Accept jpg, png, tiff, bmp and pdf
    fileInput.accept = ".jpg,.jpeg,.png,.tiff,.tif,.bmp,.pdf";
    fileInput.onchange = async (e) => {
        let file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = async function (e) {
            fileBlob = new Blob([e.target.result], { type: file.type });
            load(fileBlob);
        };

        reader.readAsArrayBuffer(file);


    };
    fileInput.click();
}

async function detectDocument() {
    let docs = docManager.getAllDocuments();
    if (docs.length == 0) {
        alert("Please load a document first.");
        return;
    }

    document.getElementById("document-detection").style.display = "flex";
}

async function recognizeText() {
    let docs = docManager.getAllDocuments();
    if (docs.length == 0) {
        alert("Please load a document first.");
        return;
    }

    const settings = {
        quality: 100,
        saveAnnotation: false,
    };

    const image = await editViewer.currentDocument.saveToJpeg(editViewer.getCurrentPageIndex(), settings);
    const result = await cvRouter.capture(image, "RecognizeTextLines_Default"); // https://www.dynamsoft.com/capture-vision/docs/web/programming/javascript/api-reference/capture-vision-router/preset-templates.html?product=dbr&lang=javascript

    for (let item of result.items) {
        // https://www.dynamsoft.com/capture-vision/docs/core/enums/core/captured-result-item-type.html
        if (item.type !== Dynamsoft.Core.EnumCapturedResultItemType.CRIT_TEXT_LINE) {
            continue;
        }
        // console.log(JSON.stringify(item));
        let text = item.text;
        let points = item.location.points;

        let currentPageId = currentDoc.pages[editViewer.getCurrentPageIndex()];
        let pageData = await currentDoc.getPageData(currentPageId);

        // https://www.dynamsoft.com/document-viewer/docs/api/interface/annotationinterface/texttypewriterannotationoptions.html
        let textX = Math.min(points[0].x, points[1].x, points[2].x, points[3].x) / pageData.display.width * pageData.mediaBox.width;
        let textY = Math.min(points[0].y, points[1].y, points[2].y, points[3].y) / pageData.display.height * pageData.mediaBox.height;

        const textTypewriterOptions = {
            x: textX < 0 ? 0 : textX,
            y: textY - 15 < 0 ? 0 : textY - 15,
            textContents: [{ content: text, color: "rgb(0,255,0)" }],
            flags: {
                print: false,
                noView: false,
                readOnly: false,

            }
        }

        // https://www.dynamsoft.com/document-viewer/docs/api/class/annotationmanager.html#createAnnotation
        let textTypewriter = await Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "textTypewriter", textTypewriterOptions)
        textTypewriter['name'] = 'ocr';

        // https://www.dynamsoft.com/document-viewer/docs/api/interface/annotationinterface/polygonannotationoptions.html
        const polygonOptions = {
            points: points.map(p => {
                return {
                    x: p.x / pageData.display.width * pageData.mediaBox.width,
                    y: p.y / pageData.display.height * pageData.mediaBox.height
                }
            }),
            borderColor: "rgb(0,255,0)",
            flags: {
                print: false,
                noView: false,
                readOnly: false,

            }
        }

        let polygon = Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "polygon", polygonOptions);
        polygon['name'] = 'ocr';
    }
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

const clearButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "material-icons icon-clear",
    tooltip: "Clear all annotations",
    events: {
        click: "clearAll",
    },
}

const loadButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "ddv-button ddv-load-image",
    tooltip: "Load a document",
    events: {
        click: "loadDocument",
    },
}

const downloadButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "ddv-button ddv-button-download",
    tooltip: "Save as PDF",
    events: {
        click: "download",
    }
}

const signatureButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "material-icons icon-stylus",
    tooltip: "Sign the document",
    events: {
        click: "sign",
    }
}

const documentButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "material-icons icon-document_scanner",
    tooltip: "Detect document",
    events: {
        click: "detectDocument",
    }
}


const ocrButton = {
    type: Dynamsoft.DDV.Elements.Button,
    className: "material-icons icon-ocr",
    tooltip: "Recognize text",
    events: {
        click: "recognizeText",
    }
}



// Layout
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
                        Dynamsoft.DDV.Elements.ThumbnailSwitch,
                        Dynamsoft.DDV.Elements.Zoom,
                        Dynamsoft.DDV.Elements.FitMode,
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
                        clearButton,
                        signatureButton,
                        documentButton,
                        ocrButton,
                    ],
                },
                {
                    type: Dynamsoft.DDV.Elements.Layout,
                    children: [
                        {
                            type: Dynamsoft.DDV.Elements.Pagination,
                            className: "ddv-edit-viewer-pagination-desktop",
                        },
                        loadButton,
                        downloadButton,
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
                Dynamsoft.DDV.Elements.Pagination,
                loadButton,
                downloadButton,
            ],
        },
        Dynamsoft.DDV.Elements.MainView,
        {
            type: Dynamsoft.DDV.Elements.Layout,
            className: "ddv-edit-viewer-footer-mobile",
            children: [
                Dynamsoft.DDV.Elements.Crop,
                Dynamsoft.DDV.Elements.Filter,
                Dynamsoft.DDV.Elements.Undo,
                Dynamsoft.DDV.Elements.Delete,
                Dynamsoft.DDV.Elements.AnnotationSet,
                qrButton,
                checkButton,
                scanButton,
                clearButton,
                signatureButton,
                documentButton,
                ocrButton,
            ],
        },
    ],
};