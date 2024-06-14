let editViewer = null;
let captureViewer = null;
let perspectiveViewer = null;
let browseViewer = null;
let isThumbnailShown = false;
let docManager = null;
let currentUid = null;
let index = 0;
// document.getElementById('rotateButton').addEventListener('click', () => {

//     if (!editViewer) return;
//     const pageCount = editViewer.getPageCount();
//     editViewer.rotate(90, [...Array(pageCount).keys()]);

// });

// document.getElementById('thumbnailButton').addEventListener('click', () => {
//     if (!editViewer) return;
//     if (isThumbnailShown) {
//         isThumbnailShown = false;
//         editViewer.thumbnail.hide();
//     } else {
//         isThumbnailShown = true;
//         editViewer.thumbnail.show();
//     }

// });

function loadURLtoBlob(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            let doc = docManager.createDocument();
            doc.loadSource(blob).then(async () => {
                await doc.saveToJpeg(0);
                toggleLoading(false);
                showViewer();
            });
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
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
    loadURLtoBlob('twain.pdf');
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

document.getElementById('saveButton').addEventListener('click', async () => {
    if (!docManager && !currentUid) return;

    let format = document.getElementById('format').value;
    let filename = document.getElementById('filename').value;

    if (!filename) {
        filename = "test";
    }

    let result = null;
    let doc = docManager.getDocument(currentUid);
    toggleLoading(true);
    switch (format) {
        case "pdf":
            // https://www.dynamsoft.com/document-viewer/docs/api/interface/idocument/index.html#savetopdf
            const pdfSettings = {
                author: "Dynamsoft",
                compression: "pdf/jpeg",
                pageType: "page/a4",
                creator: "DDV",
                creationDate: "D:20230101085959",
                keyWords: "samplepdf",
                modifiedDate: "D:20230101090101",
                producer: "Dynamsoft Document Viewer",
                subject: "SamplePdf",
                title: "SamplePdf",
                version: "1.5",
                quality: 90,
            }
            result = await doc.saveToPdf(pdfSettings);
            saveBlob(result, filename + "." + format);
            break;
        case "png":
            {
                // https://www.dynamsoft.com/document-viewer/docs/api/interface/idocument/index.html#savetopng
                let count = doc.pages.length;

                for (let i = 0; i < count; i++) {
                    result = await doc.saveToPng(i);
                    saveBlob(result, filename + i + "." + format);
                }
            }

            break;
        case "jpeg":
            {
                // https://www.dynamsoft.com/document-viewer/docs/api/interface/idocument/index.html#savetojpeg
                const settings = {
                    quality: 80,
                };

                let count = doc.pages.length;

                for (let i = 0; i < count; i++) {
                    result = await doc.saveToJpeg(i, settings);
                    saveBlob(result, filename + i + "." + format);
                }
            }

            break;
        case "tiff":
            // https://www.dynamsoft.com/document-viewer/docs/api/interface/idocument/index.html#savetotiff
            const customTag1 = {
                id: 700,
                content: "Created By Dynamsoft",
                contentIsBase64: false,
            }

            const tiffSettings = {
                customTag: [customTag1],
                compression: "tiff/auto",
            }
            result = await doc.saveToTiff(tiffSettings);
            saveBlob(result, filename + "." + format);
            break;
    }
    toggleLoading(false);
});

document.getElementById('fileInput').addEventListener('change', function (event) {
    if (!docManager) return;
    const file = event.target.files[0];
    if (!file) {
        console.log("No file selected.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const blob = new Blob([e.target.result], { type: file.type });

        async function createDoc() {
            let doc = null;
            if (!currentUid) {
                doc = docManager.createDocument();
                currentUid = doc.uid;
                openDocument(currentUid);
            }
            else {
                doc = docManager.getDocument(currentUid);
            }
            let pages = await doc.loadSource(blob);
            console.log(pages);
            goToPage(index);
            const result = await doc.saveToJpeg(index);
            const url = URL.createObjectURL(result);
            let img = document.getElementById("scanner-image");
            img.src = url;
            img.onload = () => {
                URL.revokeObjectURL(url);
            };

            let thumbnails = document.getElementById("thumb-box");
            let count = doc.pages.length;

            for (let i = index; i < count; i++) {
                let result = await doc.saveToJpeg(i);
                let url = URL.createObjectURL(result);
                let newImage = document.createElement('img');
                newImage.setAttribute('src', url);
                newImage.setAttribute('alt', i);
                if (thumbnails != null) {
                    thumbnails.appendChild(newImage);
                    newImage.addEventListener('click', e => {
                        if (e != null && e.target != null) {
                            let target = e.target;
                            img.src = target.src;
                            goToPage(parseInt(target.alt, 10));
                        }
                    });
                }
            }

            index = count;
        }
        createDoc();
    };

    reader.onerror = function (err) {
        console.error("Error reading file", err);
    };

    reader.readAsArrayBuffer(file);
});

function openDocument(docUid) {
    if (!docManager) return;
    editViewer.openDocument(docUid);
    captureViewer.openDocument(docUid);
    perspectiveViewer.openDocument(docUid);
    browseViewer.openDocument(docUid);
}

function goToPage(number) {
    if (!docManager) return;

    editViewer.goToPage(number);
    perspectiveViewer.goToPage(number);
    browseViewer.goToPage(number);
}

async function showViewer() {
    if (!docManager) return;
    const newUiConfig = {
        type: Dynamsoft.DDV.Elements.Layout,
        // flexDirection: "column",
        className: "ddv-edit-viewer-desktop",
        // children: [
        //     Dynamsoft.DDV.Elements.MainView,
        //     {
        //         type: Dynamsoft.DDV.Elements.Layout,
        //         className: "ddv-edit-viewer-header-desktop",
        //         // children: [
        //         //     {
        //         //         type: Dynamsoft.DDV.Elements.Layout,
        //         //         children: [
        //         //             Dynamsoft.DDV.Elements.ThumbnailSwitch,
        //         //             Dynamsoft.DDV.Elements.Zoom,
        //         //             Dynamsoft.DDV.Elements.FitMode,
        //         //             Dynamsoft.DDV.Elements.DisplayMode,
        //         //             Dynamsoft.DDV.Elements.RotateLeft,
        //         //             Dynamsoft.DDV.Elements.RotateRight,
        //         //             Dynamsoft.DDV.Elements.Crop,
        //         //             Dynamsoft.DDV.Elements.Filter,
        //         //             Dynamsoft.DDV.Elements.Undo,
        //         //             Dynamsoft.DDV.Elements.Redo,
        //         //             Dynamsoft.DDV.Elements.DeleteCurrent,
        //         //             Dynamsoft.DDV.Elements.DeleteAll,
        //         //             Dynamsoft.DDV.Elements.Pan,
        //         //         ],
        //         //     },
        //         //     {
        //         //         type: Dynamsoft.DDV.Elements.Layout,
        //         //         children: [
        //         //             {
        //         //                 type: Dynamsoft.DDV.Elements.Pagination,
        //         //                 className: "ddv-edit-viewer-pagination-desktop",
        //         //             },
        //         //             {
        //         //                 type: Dynamsoft.DDV.Elements.Load,
        //         //                 className: "ddv-edit-viewer-pagination-desktop",
        //         //                 events: {
        //         //                     click: () => {
        //         //                         // alert("load")
        //         //                     },
        //         //                 },
        //         //             },
        //         //             // Dynamsoft.DDV.Elements.Download,
        //         //             // Dynamsoft.DDV.Elements.Print,
        //         //         ],
        //         //     },
        //         // ],
        //     },
        // ],
    };
    let inputContainer = document.getElementById("input-container");
    inputContainer.style.display = "block";
    let editContainer = document.getElementById("edit-viewer");
    editContainer.parentNode.style.display = "block";
    let captureContainer = document.getElementById("capture-viewer");
    captureContainer.parentNode.style.display = "block";
    let perspectiveContainer = document.getElementById("perspective-viewer");
    perspectiveContainer.parentNode.style.display = "block";
    let browseContainer = document.getElementById("browse-viewer");
    browseContainer.parentNode.style.display = "block";

    editViewer = new Dynamsoft.DDV.EditViewer({
        container: editContainer,
        // uiConfig: newUiConfig,
    });
    editViewer.on("backToCaptureViewer", () => {
        // captureViewer.show();
        // editViewer.hide();
        // captureViewer.play();
    });

    try {
        captureViewer = new Dynamsoft.DDV.CaptureViewer({
            container: captureContainer
        });
        const cameras = await captureViewer.getAllCameras();
        if (cameras.length) {
            await captureViewer.selectCamera(cameras[0]);
        }
        captureViewer.play({
            resolution: [1920, 1080],
        }).catch(err => {
            alert(err.message)
        });
        captureViewer.on("showEditViewer", () => {
            // captureViewer.hide();
            // captureViewer.stop();
            // editViewer.show();
        });
    } catch (error) {
        console.error(error);
    }

    perspectiveViewer = new Dynamsoft.DDV.PerspectiveViewer({
        container: perspectiveContainer
    });

    browseViewer = new Dynamsoft.DDV.BrowseViewer({
        container: browseContainer
    });
    browseViewer.multiselectMode = true;
}
async function activate(license) {
    try {
        Dynamsoft.DDV.Core.license = license;
        Dynamsoft.DDV.Core.engineResourcePath = "https://cdn.jsdelivr.net/npm/dynamsoft-document-viewer@1.1.0/dist/engine";
        await Dynamsoft.DDV.Core.init();
        Dynamsoft.DDV.setProcessingHandler("imageFilter", new Dynamsoft.DDV.ImageFilter());
        docManager = Dynamsoft.DDV.documentManager;


    } catch (error) {
        console.error(error);
        toggleLoading(false);
    }

}