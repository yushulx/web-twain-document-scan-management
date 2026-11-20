var DWTObject;
var localStoreId, localStoreName = 'DynamicWebTWAIN_LocalStorage';

// IndexedDB for OCR results
var dbName = 'DWT_OCR_Results', dbVersion = 1, ocrStoreName = 'ocr_results';
var db;

// Initialize IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }
        
        var request = indexedDB.open(dbName, dbVersion);
        
        request.onerror = function(event) {
            console.error('IndexedDB error:', event.target.errorCode);
            reject(event.target.errorCode);
        };
        
        request.onsuccess = function(event) {
            db = event.target.result;
            resolve(db);
        };
        
        request.onupgradeneeded = function(event) {
            var database = event.target.result;
            if (!database.objectStoreNames.contains(ocrStoreName)) {
                var objectStore = database.createObjectStore(ocrStoreName, { keyPath: 'imageId' });
            }
        };
    });
}

// Save OCR result to IndexedDB
async function saveOCRResult(imageId, result) {
    try {
        var database = await openDB();
        var transaction = database.transaction([ocrStoreName], 'readwrite');
        var objectStore = transaction.objectStore(ocrStoreName);
        
        await new Promise((resolve, reject) => {
            var request = objectStore.put({ imageId: imageId, result: result });
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    } catch (error) {
        console.error('Error saving OCR result to DB:', error);
    }
}

// Get OCR result from IndexedDB
async function getOCRResult(imageId) {
    try {
        var database = await openDB();
        var transaction = database.transaction([ocrStoreName]);
        var objectStore = transaction.objectStore(ocrStoreName);
        
        return await new Promise((resolve, reject) => {
            var request = objectStore.get(imageId);
            request.onsuccess = function() {
                resolve(request.result ? request.result.result : null);
            };
            request.onerror = reject;
        });
    } catch (error) {
        console.error('Error getting OCR result from DB:', error);
        return null;
    }
}

// Update OCR result key in IndexedDB (map oldImageId to newImageId)
async function updateOCRResultKey(oldImageId, newImageId) {
    try {
        var result = await getOCRResult(oldImageId);
        if (result) {
            // Delete the old entry
            await deleteOCRResult(oldImageId);
            // Save with new key
            await saveOCRResult(newImageId, result);
        }
    } catch (error) {
        console.error('Error updating OCR result key:', error);
    }
}

// Delete OCR result from IndexedDB
async function deleteOCRResult(imageId) {
    try {
        var database = await openDB();
        var transaction = database.transaction([ocrStoreName], 'readwrite');
        var objectStore = transaction.objectStore(ocrStoreName);
        
        await new Promise((resolve, reject) => {
            var request = objectStore.delete(imageId);
            request.onsuccess = resolve;
            request.onerror = reject;
        });
    } catch (error) {
        console.error('Error deleting OCR result from DB:', error);
    }
}

// Clear all OCR results from IndexedDB
async function clearAllOCRResults() {
    try {
        var database = await openDB();
        var transaction = database.transaction([ocrStoreName], 'readwrite');
        var objectStore = transaction.objectStore(ocrStoreName);
        await new Promise((resolve, reject) => {
            var request = objectStore.clear();
            request.onsuccess = resolve;
            request.onerror = reject;
        });
        console.log('All OCR results cleared from IndexedDB');
    } catch (error) {
        console.error('Error clearing OCR results from DB:', error);
    }
}

// Initialize local storage settings - always enabled
(function () {
    localStoreId = localStorage[localStoreName] || '';
})();

Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", function () {
    DWTObject = Dynamsoft.DWT.GetWebTwain("dwtcontrolContainer");
    DWTObject.Viewer.width = "100%";
    DWTObject.Viewer.height = "100%";
    setupEventListeners();
    
    // Always restore from local storage (enabled by default). A blocked IndexedDB or
    // missing storage must not stop the OCR engine list from loading.
    restoreStorage()
        .catch(function (error) {
            console.error('Error restoring storage:', error);
        })
        .then(function () {
            initOCR();
        });
});

function setupEventListeners() {
    // Register OnBufferChanged event for UI updates
    DWTObject.RegisterEvent('OnBufferChanged', onBufferChanged);
    // Register event for text panel updates when image selection changes
    if (DWTObject.RegisterEvent) {
        // Try to register the event for current image index change
        try {
            DWTObject.RegisterEvent('OnCurrentImageIndexInBufferChanged', function() {
                if (DWTObject.CurrentImageIndexInBuffer != -1) {
                    let imageId = DWTObject.IndexToImageID(DWTObject.CurrentImageIndexInBuffer);
                    restoreTextPanel(imageId).catch(error => console.error('Error restoring text panel:', error));
                }
            });
        } catch (error) {
            console.log('OnCurrentImageIndexInBufferChanged event not supported, trying alternative event');
            // Try alternative event name if available
            try {
                DWTObject.RegisterEvent('OnImageSelected', function() {
                    if (DWTObject.CurrentImageIndexInBuffer != -1) {
                        let imageId = DWTObject.IndexToImageID(DWTObject.CurrentImageIndexInBuffer);
                        restoreTextPanel(imageId).catch(error => console.error('Error restoring text panel:', error));
                    }
                });
            } catch (error2) {
                console.log('Alternative image selection event also not supported, falling back to manual checks');
            }
        }
    }
    
    updatePageCounter();
    // Check for OCR result on initial image after storage restoration
    if (DWTObject.CurrentImageIndexInBuffer != -1) {
        let imageId = DWTObject.IndexToImageID(DWTObject.CurrentImageIndexInBuffer);
        restoreTextPanel(imageId).catch(error => console.error('Error restoring text panel:', error));
    }
}

// Restore text panel for a specific image ID
async function restoreTextPanel(imageId) {
    // Always get OCR result from IndexedDB
    let result = await getOCRResult(imageId);
    if (result) {
        printPrettyResult(result);
    } else if (ocrReady) {
        // Clear text panel if no result - but never erase the "OCR unavailable" note.
        document.getElementById("result").innerText = "";
    }
}

function updatePageCounter() {
    if (DWTObject) {
        var total = DWTObject.HowManyImagesInBuffer;
        var current = total > 0 ? DWTObject.CurrentImageIndexInBuffer + 1 : 0;
        document.getElementById('pageCounter').innerText = 'Page: ' + current + ' / ' + total;
    }
}



async function restoreStorage() {
    await saveOrRestoreStorage(false);
    // After restoring storage, check the current image and restore its text panel
    if (DWTObject && DWTObject.CurrentImageIndexInBuffer != -1) {
        let imageId = DWTObject.IndexToImageID(DWTObject.CurrentImageIndexInBuffer);
        await restoreTextPanel(imageId);
    }
    return;
}

async function saveStorage() {
    return saveOrRestoreStorage(true);
}

function removeStorage() {
    if (localStoreId) {
        var _localStoreId = localStoreId;
        localStoreId = '';
        delete localStorage[localStoreName];
        DWTObject.localStorageExist(_localStoreId).then(function (ifExist) {
            if (ifExist) {
                DWTObject.removeLocalStorage({ uid: _localStoreId });
            }
        }).catch(function (err) { console.log(err); });
    }
}

async function saveOrRestoreStorage(save) {
    if (!DWTObject) {
        return;
    }
    try {
        var ifExist = false;
        if (localStoreId) {
            ifExist = await DWTObject.localStorageExist(localStoreId);
        }
        
        if (ifExist && localStoreId) {
            if (save) {
                await DWTObject.saveToLocalStorage({ uid: localStoreId });
            } else {
                let images = await DWTObject.loadFromLocalStorage({ uid: localStoreId });
                
                for (let i = 0; i < images.length; i++) {
                    let image = images[i];
                    
                    // Map old image ID to new image ID in IndexedDB
                    await updateOCRResultKey(image.oriImageId, image.newImageId);
                }
                
            }
        } else {
            if (save) {
                localStoreId = await DWTObject.createLocalStorage();
                localStorage[localStoreName] = localStoreId;
                await DWTObject.saveToLocalStorage({ uid: localStoreId });
            }
        }
        updatePageCounter();
    } catch (error) {
        console.error('Error in saveOrRestoreStorage:', error);
    }
}

async function onBufferChanged(bufferChangeInfo) {
    if (bufferChangeInfo && DWTObject) {
        if (bufferChangeInfo.action === 'shift' || bufferChangeInfo.action === 'filter') {
            if (DWTObject.CurrentImageIndexInBuffer != -1) {
                let imageId = DWTObject.IndexToImageID(DWTObject.CurrentImageIndexInBuffer);
                await restoreTextPanel(imageId).catch(error => console.error('Error restoring text panel:', error));
            }
            updatePageCounter();
            return;
        }
        await saveStorage().catch(error => console.error('Error saving storage:', error));
    }
}



function AcquireImage() {
    if (DWTObject) {
        DWTObject.SelectSourceAsync()
            .then(function () {
                return DWTObject.AcquireImageAsync({
                    IfCloseSourceAfterAcquire: true,
                });
            })
            .catch(function (exp) {
                alert(exp.message);
            });
    }
}

function LoadImage() {
    DWTObject.IfShowFileDialog = true; //"Open File" dialog will be opened.
    DWTObject.LoadImageEx(
        "", //file name can be empty if "Open File" dialog is called.
        Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL,
        function () {
            console.log("success");
        },
        function (errorCode, errorString) {
            console.log(errorString);
        },
    );
}

// --- OCR (Dynamic Web TWAIN 19.5 OCR Connector) ---
// OCR Connector bridges to the engines the local service can drive: Windows.Media.Ocr
// on Windows 10+, Apple.Vision on macOS 10.15+, and Onnx.Ocr when the optional OCR
// pack is installed. Windows and macOS only — a Linux service rejects every call.
let ocrInfo = null;
let ocrReady = false;
let ocrError = "";

async function correctOrientation() {
    if (!DWTObject || !ensureOCRAvailable()) {
        return;
    }
    try {
        for (const index of targetIndices()) {
            DWTObject.SelectImages([index]);
            await correctOrientationForOne(index);
        }
    } catch (error) {
        alert("Orientation detection failed: " + (error.message || error) +
            "\nOnly the Onnx.Ocr engine can detect page orientation. Install the Dynamic Web TWAIN OCR pack to use it.");
    }
}

async function correctOrientationForOne(index) {
    // Only Onnx.Ocr detects orientation, so leave the engine unset and let the service
    // pick it. Rotate() expects a clockwise angle, hence 360 - angle.
    const result = await DWTObject.Addon.OCRConnector.DetectPageOrientation(index, orientationOptions());
    const angle = (360 - (result.angle || 0)) % 360;
    if (angle) {
        DWTObject.Rotate(index, angle, true);
    }
}

async function recognize() {
    if (!DWTObject || !ensureOCRAvailable()) {
        return;
    }
    try {
        for (const index of targetIndices()) {
            DWTObject.SelectImages([index]);
            await recognizeOnePage(index);
        }
    } catch (error) {
        alert("Recognition failed: " + (error.message || error));
    }
}

// The picker decides whether one page or the whole buffer is processed.
function targetIndices() {
    const all = document.getElementById("processingTarget").value === "all";
    if (!all) {
        const current = DWTObject.CurrentImageIndexInBuffer;
        return current < 0 ? [] : [current];
    }
    return Array.from({ length: DWTObject.HowManyImagesInBuffer }, function (_, index) { return index; });
}

async function recognizeOnePage(index) {
    const result = await DWTObject.Addon.OCRConnector.Recognize(index, ocrOptions());
    await saveOCRResult(result.imageID, result);
    printPrettyResult(result);
}

// OCRResult nests blocks > lines > (words). The line already carries the joined text
// on most engines, so only fall back to the words when it does not.
function printPrettyResult(result) {
    const lines = [];
    ((result && result.blocks) || []).forEach(function (block) {
        ((block && block.lines) || []).forEach(function (line) {
            const text = line.value || ((line.words || []).map(function (word) { return word.value; }).join(" "));
            if (text) {
                lines.push(text);
            }
        });
    });
    document.getElementById("result").innerText = lines.join("\n") || "No text was recognized on this page.";
}

// Enumerate the OCR engines the local service exposes and fill the engine/language
// pickers. Called once the DWT object exists, before the first recognition.
async function initOCR() {
    const engineSelect = document.getElementById("engine");
    const languageSelect = document.getElementById("language");
    ocrInfo = null;
    ocrReady = false;
    ocrError = "";
    try {
        if (!DWTObject.Addon || !DWTObject.Addon.OCRConnector) {
            throw new Error("this Dynamic Web TWAIN build has no OCR Connector");
        }
        ocrInfo = await DWTObject.Addon.OCRConnector.GetInstalledOCRInfo();
        if (!ocrInfo || !ocrInfo.engines || ocrInfo.engines.length === 0) {
            throw new Error("the local service reported no OCR engine");
        }
        engineSelect.innerHTML = "";
        ocrInfo.engines.forEach(function (engine) {
            engineSelect.add(new Option(engine.name, engine.name));
        });
        fillLanguages(engineSelect.value);
        ocrReady = true;
    } catch (error) {
        console.warn("GetInstalledOCRInfo failed:", error);
        ocrError = "OCR is not available here: " + (error.message || error) +
            "\nOCR Connector runs on Windows and macOS only. Linux is not supported yet.";
        engineSelect.innerHTML = "";
        engineSelect.add(new Option("Not available", ""));
        languageSelect.innerHTML = "";
        languageSelect.add(new Option("Not available", ""));
        document.getElementById("result").innerText = ocrError;
    }
    refreshOCRControls();
}

// Languages are engine specific: the system engine exposes the OS language pack list.
// Prefer English when the engine lists it, otherwise keep the engine's own order.
function fillLanguages(engineName) {
    const languageSelect = document.getElementById("language");
    languageSelect.innerHTML = "";
    const engine = ((ocrInfo && ocrInfo.engines) || []).find(function (item) { return item.name === engineName; });
    const languages = (engine && engine.languages) || [];
    languages.forEach(function (language) {
        languageSelect.add(new Option(language, language));
    });
    const preferred = languages.find(function (code) { return /^en\b/i.test(code); }) || languages[0];
    if (preferred) {
        languageSelect.value = preferred;
    }
}

function refreshOCRControls() {
    const engineSelect = document.getElementById("engine");
    const languageSelect = document.getElementById("language");
    engineSelect.disabled = !ocrReady;
    languageSelect.disabled = !ocrReady || languageSelect.options.length === 0;
    ["correctOrientationButton", "recognizeButton", "saveAsPDFButton"].forEach(function (id) {
        const button = document.getElementById(id);
        if (button) {
            button.disabled = !ocrReady;
        }
    });
}

function ensureOCRAvailable() {
    if (ocrReady) {
        return true;
    }
    alert(ocrError || "OCR is not available. Connect first, and run this page on Windows or macOS.");
    return false;
}

// Every recognition call carries the engine and language shown in the toolbar.
function ocrOptions() {
    const options = { settings: { language: document.getElementById("language").value } };
    const engine = document.getElementById("engine").value;
    if (engine) {
        options.engine = { name: engine };
    }
    return options;
}

function orientationOptions() {
    // Forward the selection only for Onnx.Ocr; any other engine makes the call fail.
    const engine = document.getElementById("engine").value;
    return /onnx/i.test(engine) ? { engine: { name: engine } } : {};
}

async function saveAsPDF() {
    if (!DWTObject || !ensureOCRAvailable()) {
        return;
    }
    const indices = DWTObject.SelectAllImages();
    if (!indices || indices.length === 0) {
        alert("There is no page to export. Scan or load an image first.");
        return;
    }
    const withTextLayer = document.getElementById("outputFormat").value === "extralayer";
    const format = withTextLayer
        ? Dynamsoft.DWT.EnumDWT_OCRConnectorOutputFormat.PDF_WITH_EXTRA_TEXTLAYER
        : Dynamsoft.DWT.EnumDWT_OCRConnectorOutputFormat.PDF_PLAIN_TEXT;
    try {
        // A filename without a directory opens the system save dialog, so the user
        // chooses where the file lands. PDF_WITH_EXTRA_TEXTLAYER keeps the page image
        // and adds an invisible text layer; PDF_PLAIN_TEXT writes the text only.
        await DWTObject.Addon.OCRConnector.SaveToPath(
            indices,
            format,
            withTextLayer ? "searchable-document.pdf" : "document-text.pdf"
        );
    } catch (error) {
        alert("Could not save the PDF: " + (error.message || error));
    }
}

// Remove the selected image from the buffer and clear its OCR results
async function removeSelectedImage() {
    if (!DWTObject || DWTObject.CurrentImageIndexInBuffer === -1) {
        alert("No image selected.");
        return;
    }
    
    // Get the current image ID
    let currentImageId = DWTObject.IndexToImageID(DWTObject.CurrentImageIndexInBuffer);
    
    // Remove the image from DWT buffer
    DWTObject.RemoveImage(DWTObject.CurrentImageIndexInBuffer);
    
    // Remove OCR result from IndexedDB
    await deleteOCRResult(currentImageId);
    
    // Clear text panel
    document.getElementById("result").innerText = "";
    
    // Update page counter
    updatePageCounter();
    
    // Save changes to local storage
    await saveStorage();
    
    // After removal, check if a new image is selected and restore its OCR text
    if (DWTObject.CurrentImageIndexInBuffer !== -1) {
        let newImageId = DWTObject.IndexToImageID(DWTObject.CurrentImageIndexInBuffer);
        await restoreTextPanel(newImageId);
    }
}

// Remove all images from the buffer and clear OCR results
async function removeAllImages() {
    if (!DWTObject) {
        return;
    }
    
    // Clear all images from DWT buffer
    DWTObject.RemoveAllImages();
    
    // Clear OCR results from IndexedDB
    await clearAllOCRResults();
    
    // Clear text panel
    document.getElementById("result").innerText = "";
    
    // Update page counter
    updatePageCounter();
    
    // Always save empty state to local storage
    await saveStorage();
}