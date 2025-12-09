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
    
    // Always restore from local storage (enabled by default)
    restoreStorage().then(function() {
        checkOCRInstalled();
        
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
    } else {
        // Clear text panel if no result
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

async function correctOrientation() {
    if (DWTObject) {
        if (document.getElementById("processingTarget").value === "all") {
            let count = DWTObject.HowManyImagesInBuffer;
            for (let i = 0; i < count; i++) {
                DWTObject.SelectImages([i]);
                await correctOrientationForOne(i);
            }
            return;
        } else {
            if (DWTObject.CurrentImageIndexInBuffer != -1) {
                await correctOrientationForOne(DWTObject.CurrentImageIndexInBuffer);
            }
        }
    }
}

async function correctOrientationForOne(index) {
    let result = await DWTObject.Addon.OCRKit.DetectPageOrientation(index);
    if (result.angle != 0) {
        DWTObject.Rotate(index, -result.angle, true);
    }
}

async function recognize() {
    if (DWTObject) {
        if (document.getElementById("processingTarget").value === "all") {
            let count = DWTObject.HowManyImagesInBuffer;
            for (let i = 0; i < count; i++) {
                DWTObject.SelectImages([i]);
                await recognizeOnePage(i);
            }
            return;
        } else {
            if (DWTObject.CurrentImageIndexInBuffer != -1) {
                await recognizeOnePage(DWTObject.CurrentImageIndexInBuffer);
            }
        }
    }
}

async function recognizeOnePage(index) {
    let language = document.getElementById("language").value;
    let result = await DWTObject.Addon.OCRKit.Recognize(index, { settings: { language: language } });
    await saveOCRResult(result.imageID, result);
    printPrettyResult(result);
}

function printPrettyResult(result) {
    let prettyResult = "";
    result.blocks.forEach(block => {
        block.lines.forEach(line => {
            line.words.forEach(word => {
                prettyResult += word.value + " ";
            });
            prettyResult += "\n";
        });
        prettyResult += "\n";
    });
    document.getElementById("result").innerText = prettyResult;
}

async function checkOCRInstalled() {
    try {
        let info = await DWTObject.Addon.OCRKit.GetInstalledOCRInfo();
        if (info.version) {
            return true;
        }
    } catch (error) {
        alert(error.message);
        return false;
    }
    alert("OCR Add-on is not installed. Please install it to use OCR features.");
    return false;
}

async function saveAsPDF() {
    try {
        let format = document.getElementById('outputFormat').value;
        if (format === "extralayer") {
            let indicesOfAll = DWTObject.SelectAllImages();
            await DWTObject.Addon.OCRKit.SaveToPath(indicesOfAll, Dynamsoft.DWT.EnumDWT_OCRKitOutputFormat.PDF_WITH_EXTRA_TEXTLAYER, "test");
        } else {
            await DWTObject.Addon.OCRKit.SaveToPath(DWTObject.SelectAllImages(), Dynamsoft.DWT.EnumDWT_OCRKitOutputFormat.PDF_PLAIN_TEXT, "test");
        }
    } catch (error) {
        alert(error.message);
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