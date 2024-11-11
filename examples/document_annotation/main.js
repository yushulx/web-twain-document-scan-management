let editViewer = null;
let docManager = null;

function handleKeyboardShortcut(event) {
    // Check if 'Ctrl' and 'Q' are pressed together
    if (event.ctrlKey && event.key.toLowerCase() === 'q') {
        event.preventDefault(); // Prevent the default browser behavior
        addQr();
    }
}

window.addEventListener('keydown', handleKeyboardShortcut);

function openPopup() {
    let docs = docManager.getAllDocuments();
    if (docs.length == 0) {
        alert("Please load a document first.");
        return;
    }

    document.getElementById("popupOverlay").style.display = "flex";
}

// Function to close the pop-up
function closePopup() {
    document.getElementById("popupOverlay").style.display = "none";
}

// Function to return results
function returnResults() {
    const barcodeType = document.getElementById("barcodeType").value;
    const barcodeContent = document.getElementById("barcodeContent").value;
    const applyToAllPages = document.getElementById("applyToAllPages").checked;

    if (!barcodeContent) {
        alert("Please enter barcode content.");
        return;
    }

    // Close the pop-up
    closePopup();

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
                        x: pageData.mediaBox.width - 110,
                        y: 10,
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
                            await Dynamsoft.DDV.annotationManager.createAnnotation(docs[0].pages[i], "stamp", option)
                        }
                    } else {

                        await Dynamsoft.DDV.annotationManager.createAnnotation(currentPageId, "stamp", option)
                    }
                }
            }, 'image/png');
        } catch (e) {
            console.log(e);
        }
    }
}

function toggleLoading(isLoading) {
    if (isLoading) {
        document.getElementById("loading-indicator").style.display = "flex";
    } else {
        document.getElementById("loading-indicator").style.display = "none";
    }
}

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

function addQr() {
    openPopup();
}

async function showViewer() {
    if (!docManager) return;
    let editContainer = document.getElementById("edit-viewer");
    editContainer.parentNode.style.display = "block";
    editViewer = new Dynamsoft.DDV.EditViewer({
        container: editContainer,
        uiConfig: isMobile() ? mobileEditViewerUiConfig : pcEditViewerUiConfig
    });
    editViewer.on("addQr", addQr);
}
async function activate(license) {
    try {
        Dynamsoft.DDV.Core.license = license;
        Dynamsoft.DDV.Core.engineResourcePath = "https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@2.0.0/dist/engine";
        await Dynamsoft.DDV.Core.init();
        Dynamsoft.DDV.setProcessingHandler("imageFilter", new Dynamsoft.DDV.ImageFilter());
        docManager = Dynamsoft.DDV.documentManager;


    } catch (error) {
        console.error(error);
        toggleLoading(false);
    }

}

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
                        Dynamsoft.DDV.Elements.Download,
                        Dynamsoft.DDV.Elements.Print,
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
                Dynamsoft.DDV.Elements.Download,
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
            ],
        },
    ],
};