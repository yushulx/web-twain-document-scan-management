// ============================================================
// Dynamic Web TWAIN - Document Scanner with OCR and Search
// Custom Viewer Implementation with IndexedDB Storage
// ============================================================

// --- Configuration ---
Dynamsoft.DWT.ProductKey = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
Dynamsoft.DWT.ResourcesPath = "https://unpkg.com/dwt@19.3.0/dist/";
Dynamsoft.DWT.AutoLoad = false;

// --- Global State ---
let DWTObject = null;
const DB_NAME = "DocuScanOCR";
const STORE_NAME = "documents";
let documents = []; // Array of {id, imageData, ocrText, words, timestamp}
let currentImageIndex = 0;
let searchMatches = []; // Array of {docIndex, words: [{x,y,width,height,text}]}
let currentMatchIndex = -1;

// --- Canvas References ---
let imageCanvas = null;
let highlightCanvas = null;
let imageCtx = null;
let highlightCtx = null;

// ============================================================
// IndexedDB Helper Functions
// ============================================================
const dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Delete old store if it exists
        if (db.objectStoreNames.contains("ocr_data")) {
            db.deleteObjectStore("ocr_data");
        }
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            store.createIndex("timestamp", "timestamp", { unique: false });
        }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject("IndexedDB error: " + event.target.errorCode);
});

async function saveDocument(imageData, ocrText, words) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const doc = {
            imageData: imageData,
            ocrText: ocrText,
            words: words,
            timestamp: Date.now()
        };
        const request = store.add(doc);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllDocuments() {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

async function deleteDocument(id) {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function clearAllDocuments() {
    const db = await dbPromise;
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ============================================================
// DWT Initialization (No UI Binding)
// ============================================================
document.addEventListener("DOMContentLoaded", async function () {
    // Initialize canvases
    imageCanvas = document.getElementById("image-canvas");
    highlightCanvas = document.getElementById("highlight-canvas");
    imageCtx = imageCanvas.getContext("2d");
    highlightCtx = highlightCanvas.getContext("2d");
    
    // Initialize DWT
    await initDWT();
    
    // Load documents from IndexedDB
    await loadDocumentsFromDB();
    
    // Setup keyboard listeners
    setupKeyboardListeners();
});

function initDWT() {
    return new Promise((resolve, reject) => {
        updateStatus("Initializing scanner...");
        
        Dynamsoft.DWT.CreateDWTObjectEx(
            { WebTwainId: "dwtControl" },
            function (obj) {
                DWTObject = obj;
                DWTObject.IfShowUI = false;
                // Enable 64-bit TWAIN driver support
                if (DWTObject.IfUseTwainDSM !== undefined) {
                    DWTObject.IfUseTwainDSM = true;
                }
                
                // No UI binding - DWT used only for scanning and OCR
                
                // Populate scanner list
                populateScanners();
                
                updateStatus("Ready");
                resolve();
            },
            function (err) {
                console.error("DWT Init Error:", err);
                updateStatus("Failed to initialize: " + (err.message || err));
                reject(err);
            }
        );
    });
}

// ============================================================
// Scanner Functions
// ============================================================
function populateScanners() {
    if (!DWTObject) return;
    
    const select = document.getElementById("source");
    select.innerHTML = "";
    
    DWTObject.GetDevicesAsync()
        .then(function (devices) {
            if (devices && devices.length > 0) {
                devices.forEach((device, idx) => {
                    const option = document.createElement("option");
                    option.value = idx;
                    option.textContent = device.displayName || device.name;
                    select.appendChild(option);
                });
            } else {
                const option = document.createElement("option");
                option.value = "-1";
                option.textContent = "No scanners found";
                select.appendChild(option);
            }
        })
        .catch(function (err) {
            console.error("GetDevicesAsync error:", err);
        });
}

async function acquireImage() {
    if (!DWTObject) return;
    
    const select = document.getElementById("source");
    const deviceIndex = parseInt(select.value, 10);
    
    if (deviceIndex < 0) {
        alert("No scanner selected");
        return;
    }
    
    updateStatus("Scanning...");
    
    try {
        const devices = await DWTObject.GetDevicesAsync();
        const device = devices[deviceIndex];
        
        await DWTObject.SelectDeviceAsync(device);
        
        const startCount = DWTObject.HowManyImagesInBuffer;
        
        await DWTObject.AcquireImageAsync({
            IfCloseSourceAfterAcquire: true
        });
        
        const endCount = DWTObject.HowManyImagesInBuffer;
        
        // Process newly scanned images
        for (let i = startCount; i < endCount; i++) {
            await processAndSaveImage(i);
        }
        
        // Clear DWT buffer after saving
        DWTObject.RemoveAllImages();
        
        updateStatus("Scan complete");
    } catch (err) {
        console.error("Scan error:", err);
        updateStatus("Scan failed: " + (err.message || err));
    }
}

function loadImage() {
    if (!DWTObject) return;
    
    updateStatus("Loading images...");
    
    DWTObject.LoadImageEx(
        "",
        Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL,
        async function () {
            const count = DWTObject.HowManyImagesInBuffer;
            
            // Process all loaded images
            for (let i = 0; i < count; i++) {
                await processAndSaveImage(i);
            }
            
            // Clear DWT buffer after saving
            DWTObject.RemoveAllImages();
            
            updateStatus("Load complete");
        },
        function (errCode, errStr) {
            console.error("Load error:", errStr);
            updateStatus("Load failed: " + errStr);
        }
    );
}

// ============================================================
// OCR Processing and Image Storage
// ============================================================
async function processAndSaveImage(dwtIndex) {
    if (!DWTObject) return;
    
    updateStatus("Processing image...");
    
    try {
        // Convert image to base64 data URL
        const imageData = await new Promise((resolve, reject) => {
            DWTObject.ConvertToBase64(
                [dwtIndex],
                Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG,
                function(result, indices, type) {
                    // Add data URL prefix for PNG
                    const dataURL = `data:image/png;base64,${result.getData(0, result.getLength())}`;
                    resolve(dataURL);
                },
                function(errorCode, errorString) {
                    console.error("ConvertToBase64 error:", errorString);
                    reject(new Error(errorString));
                }
            );
        });
        
        // Perform OCR
        let ocrText = "";
        let words = [];
        
        if (DWTObject.Addon && DWTObject.Addon.OCRKit) {
            const result = await DWTObject.Addon.OCRKit.Recognize(dwtIndex, {
                settings: { language: "eng" }
            });
            
            if (result && result.blocks) {
                result.blocks.forEach((block) => {
                    if (block.lines) {
                        block.lines.forEach((line) => {
                            if (line.words) {
                                line.words.forEach((word) => {
                                    ocrText += word.value + " ";
                                    
                                    // Extract geometry and convert to x, y, width, height
                                    if (word.geometry) {
                                        const geo = word.geometry;
                                        words.push({
                                            text: word.value,
                                            x: geo.left,
                                            y: geo.top,
                                            width: geo.right - geo.left,
                                            height: geo.bottom - geo.top
                                        });
                                    }
                                });
                                ocrText += "\n";
                            }
                        });
                    }
                });
            }
            
            console.log("Total words extracted:", words.length);
        }
        
        // Save to IndexedDB
        const id = await saveDocument(imageData, ocrText.trim(), words);
        
        // Reload documents array and display
        await loadDocumentsFromDB();
    } catch (err) {
        console.error("Process and save error:", err);
    }
}

// ============================================================
// Custom Viewer Functions
// ============================================================
async function loadDocumentsFromDB() {
    const previousCount = documents.length;
    documents = await getAllDocuments();
    
    if (documents.length > 0) {
        // If new documents were added, show the newest one
        if (documents.length > previousCount) {
            currentImageIndex = documents.length - 1;
        } else if (currentImageIndex >= documents.length) {
            currentImageIndex = documents.length - 1;
        }
        displayCurrentImage();
    } else {
        currentImageIndex = 0;
        clearViewer();
    }
    
    updateImageCounter();
    updateStatus(`Loaded ${documents.length} document(s)`);
}

function displayCurrentImage() {
    if (documents.length === 0 || currentImageIndex < 0 || currentImageIndex >= documents.length) {
        clearViewer();
        return;
    }
    
    const doc = documents[currentImageIndex];
    
    if (!doc.imageData) {
        clearViewer();
        return;
    }
    
    const img = new Image();
    
    img.onload = function() {
        // Calculate max available size (accounting for viewer container size)
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.75;
        
        let displayWidth = img.width;
        let displayHeight = img.height;
        
        // Scale down if image is too large
        if (displayWidth > maxWidth || displayHeight > maxHeight) {
            const scale = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
            displayWidth = Math.floor(displayWidth * scale);
            displayHeight = Math.floor(displayHeight * scale);
        }
        
        // Set canvas size to display size
        imageCanvas.width = displayWidth;
        imageCanvas.height = displayHeight;
        highlightCanvas.width = displayWidth;
        highlightCanvas.height = displayHeight;
        
        // Draw image scaled to fit canvas
        imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
        imageCtx.drawImage(img, 0, 0, displayWidth, displayHeight);
        
        // Clear highlights
        highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
        
        // Calculate scale factor for coordinate transformation
        const scaleX = displayWidth / img.width;
        const scaleY = displayHeight / img.height;
        
        // Render text layer for selection
        renderTextLayer(doc.words, scaleX, scaleY);
        
        // Redraw highlights if in search mode
        if (searchMatches.length > 0 && currentMatchIndex >= 0) {
            const match = searchMatches[currentMatchIndex];
            if (match.docIndex === currentImageIndex) {
                drawHighlightsOnCanvas(match.words, scaleX, scaleY);
            }
        }
    };
    
    img.onerror = function(e) {
        clearViewer();
    };
    
    img.src = doc.imageData;
}

function clearViewer() {
    imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
    imageCanvas.width = 800;
    imageCanvas.height = 600;
    highlightCanvas.width = 800;
    highlightCanvas.height = 600;
}

function updateImageCounter() {
    const counter = document.getElementById("image-counter");
    if (counter) {
        const current = documents.length > 0 ? currentImageIndex + 1 : 0;
        counter.textContent = `${current} / ${documents.length}`;
    }
}

function nextImage() {
    if (documents.length === 0) return;
    
    currentImageIndex = (currentImageIndex + 1) % documents.length;
    displayCurrentImage();
    updateImageCounter();
}

function previousImage() {
    if (documents.length === 0) return;
    
    currentImageIndex = (currentImageIndex - 1 + documents.length) % documents.length;
    displayCurrentImage();
    updateImageCounter();
}

// ============================================================
// Search & Highlight
// ============================================================
async function searchText() {
    const query = document.getElementById("search-input").value.trim().toLowerCase();
    if (!query) {
        alert("Please enter a search term");
        return;
    }
    
    clearHighlights();
    updateStatus(`Searching for "${query}"...`);
    
    searchMatches = [];
    
    documents.forEach((doc, docIndex) => {
        if (!doc.ocrText) return;
        
        if (doc.ocrText.toLowerCase().includes(query)) {
            const matchingWords = [];
            
            if (doc.words) {
                doc.words.forEach(word => {
                    if (word.text.toLowerCase().includes(query)) {
                        matchingWords.push(word);
                    }
                });
            }
            
            if (matchingWords.length > 0) {
                searchMatches.push({ docIndex, words: matchingWords });
            }
        }
    });
    
    if (searchMatches.length > 0) {
        currentMatchIndex = 0;
        navigateToMatch(0);
        updateStatus(`Found ${searchMatches.length} match(es) - Use arrows to navigate`);
    } else {
        updateStatus(`No matches found for "${query}"`);
    }
}

function navigateToMatch(index) {
    if (index < 0 || index >= searchMatches.length) return;
    
    currentMatchIndex = index;
    const match = searchMatches[index];
    
    // Navigate to the document
    currentImageIndex = match.docIndex;
    displayCurrentImage();
    updateImageCounter();
    
    // Highlights will be drawn in displayCurrentImage()
}

function renderTextLayer(words, scaleX = 1, scaleY = 1) {
    const textLayer = document.getElementById('text-layer');
    if (!textLayer || !words) return;
    
    // Set text layer dimensions to match canvas
    textLayer.style.width = imageCanvas.width + 'px';
    textLayer.style.height = imageCanvas.height + 'px';
    
    // Clear existing text
    textLayer.innerHTML = '';
    
    // Create selectable text spans for each word
    words.forEach(word => {
        if (word.width > 0 && word.height > 0) {
            const span = document.createElement('span');
            span.textContent = word.text;
            span.className = 'text-word';
            span.style.position = 'absolute';
            span.style.left = (word.x * scaleX) + 'px';
            span.style.top = (word.y * scaleY) + 'px';
            span.style.width = (word.width * scaleX) + 'px';
            span.style.height = (word.height * scaleY) + 'px';
            span.style.fontSize = (word.height * scaleY * 0.8) + 'px';
            span.style.color = 'transparent';
            span.style.userSelect = 'text';
            span.style.cursor = 'text';
            textLayer.appendChild(span);
        }
    });
}

function drawHighlightsOnCanvas(words, scaleX = 1, scaleY = 1) {
    highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
    
    words.forEach((word, i) => {
        if (word.width > 0 && word.height > 0) {
            // Apply scale factors for coordinate transformation
            const x = word.x * scaleX;
            const y = word.y * scaleY;
            const width = word.width * scaleX;
            const height = word.height * scaleY;
            
            // Draw yellow semi-transparent box
            highlightCtx.fillStyle = 'rgba(255, 255, 0, 0.4)';
            highlightCtx.fillRect(x, y, width, height);
            
            // Draw border
            highlightCtx.strokeStyle = 'rgba(255, 180, 0, 1)';
            highlightCtx.lineWidth = 3;
            highlightCtx.strokeRect(x, y, width, height);
        }
    });
}

function nextMatch() {
    if (searchMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    navigateToMatch(nextIndex);
    updateStatus(`Match ${nextIndex + 1} of ${searchMatches.length}`);
}

function previousMatch() {
    if (searchMatches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    navigateToMatch(prevIndex);
    updateStatus(`Match ${prevIndex + 1} of ${searchMatches.length}`);
}

function clearHighlights() {
    searchMatches = [];
    currentMatchIndex = -1;
    highlightCtx.clearRect(0, 0, highlightCanvas.width, highlightCanvas.height);
}

function clearSearch() {
    document.getElementById("search-input").value = "";
    clearHighlights();
    displayCurrentImage(); // Redraw to clear highlights
    updateStatus("Search cleared");
}

// ============================================================
// Image Management
// ============================================================
async function removeSelected() {
    if (documents.length === 0) return;
    
    const doc = documents[currentImageIndex];
    
    await deleteDocument(doc.id);
    await loadDocumentsFromDB();
    
    // Adjust current index if needed
    if (currentImageIndex >= documents.length && documents.length > 0) {
        currentImageIndex = documents.length - 1;
    }
    
    clearHighlights();
    updateStatus("Removed selected image");
}

async function removeAll() {
    if (documents.length === 0) return;
    
    if (!confirm("Are you sure you want to remove all images?")) return;
    
    await clearAllDocuments();
    await loadDocumentsFromDB();
    
    clearHighlights();
    currentImageIndex = 0;
    updateStatus("All images removed");
}

// ============================================================
// UI Utilities
// ============================================================
function updateStatus(msg) {
    const statusBar = document.getElementById("status-bar");
    if (statusBar) {
        statusBar.textContent = msg;
    }
}

function setupKeyboardListeners() {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                searchText();
            }
        });
    }
    
    // Global keyboard shortcuts
    document.addEventListener("keydown", function(e) {
        // Search navigation
        if (searchMatches.length > 0) {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                nextMatch();
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                previousMatch();
            }
        } else {
            // Image navigation when not in search mode
            if (e.key === "ArrowRight") {
                e.preventDefault();
                nextImage();
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                previousImage();
            }
        }
    });
}
