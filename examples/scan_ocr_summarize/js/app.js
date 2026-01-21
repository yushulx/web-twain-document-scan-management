
// Initialize Dynamic Web TWAIN
Dynamsoft.DWT.ProductKey = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
Dynamsoft.DWT.ResourcesPath = 'https://cdn.jsdelivr.net/npm/dwt@latest/dist';
Dynamsoft.DWT.ServiceInstallerLocation = 'https://download2.dynamsoft.com/Demo/DWT/Resources/dist/';
Dynamsoft.DWT.AutoLoad = true;
// Create a minimal viewer container to enable the Viewer component
Dynamsoft.DWT.Containers = [{ 
    ContainerId: 'dwtcontrolContainer', 
    Width: '0px',  // Hidden viewer - we're using our own UI
    Height: '0px' 
}];

let DWTObject;
let deviceList = [];
let selectedImageIndex = -1;
let imageEditor = null;
let isEditorVisible = false;
let currentZoom = 1.0;
const ZOOM_STEP = 0.2;
const MAX_ZOOM = 3.0;
const MIN_ZOOM = 0.5;

// Wait for DWT to be ready
Dynamsoft.DWT.RegisterEvent("OnWebTwainReady", function () {
    DWTObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
    if (DWTObject) {
        // Hide the default viewer since we're using our own UI
        DWTObject.Viewer.hide();
        
        console.log('Dynamic Web TWAIN initialized successfully');
        loadScanners();
        setupEventListeners();
    }
});

function loadScanners() {
    const sourceSelect = document.getElementById('sourceSelect');
    sourceSelect.innerHTML = '<option selected>Loading scanners...</option>';

    DWTObject.GetDevicesAsync().then(function (devices) {
        deviceList = devices;
        sourceSelect.innerHTML = '';

        if (devices.length === 0) {
            sourceSelect.innerHTML = '<option selected>No scanners found</option>';
            document.getElementById('scanBtn').disabled = true;
            return;
        }

        devices.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = device.displayName;
            sourceSelect.appendChild(option);
        });

        document.getElementById('scanBtn').disabled = false;
    }).catch(function (exp) {
        console.error('Failed to load scanners:', exp);
        alert('Failed to load scanners: ' + exp.message);
    });
}

function setupEventListeners() {
    // Register buffer changed event
    DWTObject.RegisterEvent('OnBufferChanged', function (bufferChangeInfo) {
        console.log('Buffer changed:', bufferChangeInfo);
        updateImageDisplay();
    });

    // Scan button
    document.getElementById('scanBtn').addEventListener('click', function () {
        acquireImage();
    });

    // Load from file button
    document.getElementById('loadBtn').addEventListener('click', function () {
        loadImages();
    });

    // Save button
    document.getElementById('saveBtn').addEventListener('click', function () {
        saveImages();
    });

    // Clear button
    document.getElementById('clearBtn').addEventListener('click', function () {
        clearImages();
    });

    const ocrBtnLarge = document.getElementById('ocrBtnLarge');
    const editBtnLarge = document.getElementById('editBtnLarge');
    if (ocrBtnLarge) {
        ocrBtnLarge.addEventListener('click', function () {
            if (selectedImageIndex >= 0) {
                performOCR(selectedImageIndex);
            }
        });
    }
    if (editBtnLarge) {
        editBtnLarge.addEventListener('click', function () {
            toggleImageEditor();
        });
    }

    // Zoom controls
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
}

function acquireImage() {
    const sourceSelect = document.getElementById('sourceSelect');
    const selectedIndex = sourceSelect.value;

    if (selectedIndex === '' || !deviceList[selectedIndex]) {
        alert('Please select a scanner first.');
        return;
    }

    DWTObject.SelectDeviceAsync(deviceList[selectedIndex]).then(function () {
        return DWTObject.AcquireImageAsync({
            IfShowUI: false,
            IfCloseSourceAfterAcquire: true
        });
    }).catch(function (exp) {
        alert('Scan failed: ' + exp.message);
    });
}

function loadImages() {
    if (DWTObject) {
        DWTObject.IfShowFileDialog = true;
        DWTObject.LoadImageEx(
            "",
            Dynamsoft.DWT.EnumDWT_ImageType.IT_ALL,
            function () {
                console.log("Images loaded successfully");
                updateImageDisplay();
            },
            function (errorCode, errorString) {
                alert('Failed to load images: ' + errorString);
            },
        );
    }
}

function updateImageDisplay() {
    const thumbnailContainer = document.getElementById('thumbnailContainer');

    // Clear only the content, preserve the container structure
    thumbnailContainer.innerHTML = '';

    if (DWTObject.HowManyImagesInBuffer === 0) {
        // Keep the empty state but with consistent dimensions
        thumbnailContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-image"></i>
                <h6>No documents scanned yet</h6>
                <p>Click "Start Scanning" to begin</p>
            </div>
        `;

        setLargeImageEmptyState();
        document.getElementById('saveBtn').disabled = true;
        document.getElementById('clearBtn').disabled = true;
        selectedImageIndex = -1;
        return;
    }

    document.getElementById('saveBtn').disabled = false;
    document.getElementById('clearBtn').disabled = false;

    // Create thumbnails
    for (let i = 0; i < DWTObject.HowManyImagesInBuffer; i++) {
        const imgUrl = DWTObject.GetImageURL(i);
        const thumbnailDiv = document.createElement('div');
        thumbnailDiv.className = 'thumbnail-item';
        if (i === selectedImageIndex) {
            thumbnailDiv.classList.add('selected');
        }
        thumbnailDiv.onclick = () => selectImage(i);

        // Create image element and preload to ensure it displays properly
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = `Scanned document ${i + 1}`;
        img.onload = function () {
            // Ensure the image fits properly after loading
            this.style.display = 'block';
        };
        img.onerror = function () {
            console.error(`Failed to load image: ${this.src}`);
            // Add fallback content if image fails to load
            this.parentNode.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
                    <i class="fas fa-exclamation-triangle text-danger"></i>
                    <span class="ms-2">Failed to load image</span>
                </div>
            `;
        };

        thumbnailDiv.appendChild(img);

        const labelDiv = document.createElement('div');
        labelDiv.className = 'thumbnail-label';
        labelDiv.textContent = `Page ${i + 1}`;
        thumbnailDiv.appendChild(labelDiv);

        thumbnailContainer.appendChild(thumbnailDiv);
    }

    // Show large image if one is selected, otherwise show first image
    if (selectedImageIndex === -1 && DWTObject.HowManyImagesInBuffer > 0) {
        selectImage(0);
    } else if (selectedImageIndex >= 0 && selectedImageIndex < DWTObject.HowManyImagesInBuffer) {
        showLargeImage(selectedImageIndex);
    }
}

function selectImage(index) {
    selectedImageIndex = index;
    DWTObject.CurrentImageIndexInBuffer = index;

    // Update thumbnail selection
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('selected');
        } else {
            thumb.classList.remove('selected');
        }
    });

    // Show large image
    showLargeImage(index);
}

function showLargeImage(index) {
    const imgUrl = DWTObject.GetImageURL(index);
    const imgElement = document.getElementById('largeImageDisplay');
    const noSelection = document.getElementById('noSelection');
    const stageElement = document.getElementById('largeImageStage');

    if (noSelection) {
        noSelection.style.display = 'none';
    }
    if (stageElement && !isEditorVisible) {
        stageElement.classList.remove('hidden');
    }
    if (imgElement) {
        imgElement.src = imgUrl;
        imgElement.alt = `Scanned document ${index + 1}`;
        imgElement.style.display = 'block';

        // Reset zoom when switching images
        resetZoom();
    }
    if (isEditorVisible) {
        // If switching images while editor is open, update editor
        DWTObject.CurrentImageIndexInBuffer = index;
        if (imageEditor) {
            imageEditor.show();
        }
    }
    updateLargeImageControlsState(true);
}

function setLargeImageEmptyState() {
    const noSelection = document.getElementById('noSelection');
    const imgElement = document.getElementById('largeImageDisplay');
    const stageElement = document.getElementById('largeImageStage');

    if (noSelection) {
        noSelection.style.display = 'flex';
    }
    if (stageElement) {
        stageElement.classList.remove('hidden');
    }
    if (imgElement) {
        imgElement.removeAttribute('src');
        imgElement.style.display = 'none';
    }

    hideImageEditor();
    updateLargeImageControlsState(false);
}

function updateLargeImageControlsState(enabled) {
    const ocrBtnLarge = document.getElementById('ocrBtnLarge');
    const editBtnLarge = document.getElementById('editBtnLarge');
    if (ocrBtnLarge) {
        ocrBtnLarge.disabled = !enabled;
    }
    if (editBtnLarge) {
        editBtnLarge.disabled = !enabled;
    }
}

function toggleImageEditor() {
    if (!DWTObject || selectedImageIndex < 0) {
        return;
    }

    if (isEditorVisible) {
        hideImageEditor();
    } else {
        showImageEditor();
    }
}

function showImageEditor() {
    // Create editor if it doesn't exist
    ensureImageEditor();

    // Show editor with the current image
    if (imageEditor) {
        // Set the current image index before showing the editor
        DWTObject.CurrentImageIndexInBuffer = selectedImageIndex;
        imageEditor.show();
        isEditorVisible = true;
        updateEditorButtonState(true);
    } else {
        console.error("Failed to create image editor");
        alert("Image editor could not be initialized. Please check that Dynamic Web TWAIN resources are loaded correctly.");
    }
}

function hideImageEditor() {
    if (imageEditor) {
        imageEditor.hide();
    }
    isEditorVisible = false;
    updateEditorButtonState(false);
    
    // Refresh the display after editing
    updateImageDisplay();
}

function ensureImageEditor() {
    if (imageEditor || !DWTObject) {
        return;
    }

    try {
        // The Viewer.createImageEditor() creates a full-screen editor by default
        // We don't need to specify a container - it will create its own modal overlay
        imageEditor = DWTObject.Viewer.createImageEditor();
        console.log("Image Editor created successfully");
    } catch (e) {
        console.error("Error creating image editor:", e);
        // If createImageEditor fails, it might be because Viewer isn't available
        // Let's check if we need to bind a viewer first
        if (!DWTObject.Viewer) {
            console.error("DWTObject.Viewer is not available. This might be a version issue.");
        }
    }
}

// Zoom Functions
function zoomIn() {
    if (currentZoom < MAX_ZOOM) {
        currentZoom = parseFloat((currentZoom + ZOOM_STEP).toFixed(1));
        applyZoom();
    }
}

function zoomOut() {
    if (currentZoom > MIN_ZOOM) {
        currentZoom = parseFloat((currentZoom - ZOOM_STEP).toFixed(1));
        applyZoom();
    }
}

function resetZoom() {
    currentZoom = 1.0;
    applyZoom();
}

function applyZoom() {
    const img = document.getElementById('largeImageDisplay');
    if (!img) return;

    if (currentZoom === 1.0) {
        // Reset to default
        img.style.width = '';
        img.style.height = '';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
    } else {
        // Apply zoom
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';
        img.style.objectFit = 'contain'; // Keep contain but size is forced by width? 
        // Actually, if we set width/height, object-fit might still apply to the content box.
        // Let's set dimensions relative to the container for zooming? 
        // No, best is to scale the image element itself.

        // Since we don't know the natural aspect ratio easily without querying, 
        // we can use transform for smooth scaling, but that doesn't affect layout flow (scrollbars).
        // A better approach for scrolling is setting width to percentage > 100% or pixels.
        // Let's assume we want to zoom based on the current container view.
        // Simple pixel scaling is better if we knew the base size.
        // Let's try percentage. 100% is fit to container. 150% is 1.5x container.

        img.style.width = `${currentZoom * 100}%`;
        img.style.height = 'auto'; // Maintain aspect ratio
    }
}

function updateEditorButtonState(isEditing) {
    const editBtnLarge = document.getElementById('editBtnLarge');
    if (!editBtnLarge) {
        return;
    }
    editBtnLarge.innerHTML = isEditing
        ? '<i class="fas fa-times"></i> Close'
        : '<i class="fas fa-pen"></i> Edit';
}

function saveImages() {
    if (DWTObject.HowManyImagesInBuffer === 0) {
        alert('No images to save.');
        return;
    }

    // Save as PDF - use asynchronous version with callbacks
    DWTObject.IfShowFileDialog = true;
    DWTObject.SaveAllAsPDF('scanned_documents.pdf', function () {
        alert('Documents saved as PDF successfully!');
    }, function (errorCode, errorString) {
        alert('Failed to save PDF: ' + errorString);
    });
}

function clearImages() {
    if (confirm('Are you sure you want to clear all scanned images?')) {
        DWTObject.RemoveAllImages();
        selectedImageIndex = -1;
        updateImageDisplay();
    }
}

// Handle page unload
window.addEventListener('beforeunload', function () {
    if (DWTObject) {
        DWTObject.RemoveAllImages();
    }
});

// OCR Functions
async function performOCR(imageIndex) {
    const modal = document.getElementById('ocrModal');
    const ocrText = document.getElementById('ocrText');
    const language = document.getElementById('ocrLanguage').value;

    modal.classList.add('show');
    ocrText.textContent = 'Processing OCR...';

    try {
        // Check if OCR is available
        if (!DWTObject.Addon || !DWTObject.Addon.OCRKit) {
            throw new Error('OCR add-on is not available. Please install the OCR resources.');
        }

        const result = await DWTObject.Addon.OCRKit.Recognize(imageIndex, {
            settings: { language: language }
        });

        const extractedText = formatOCRResult(result);
        ocrText.textContent = extractedText || 'No text found in the image.';

    } catch (error) {
        console.error('OCR Error:', error);
        ocrText.textContent = `OCR Error: ${error.message}\n\nNote: OCR requires the OCR add-on to be installed. Please download and install DynamicWebTWAINOCRResources.zip from Dynamsoft's website.`;
    }
}

function formatOCRResult(result) {
    let text = '';
    if (result && result.blocks) {
        result.blocks.forEach(block => {
            if (block.lines) {
                block.lines.forEach(line => {
                    if (line.words) {
                        line.words.forEach(word => {
                            text += word.value + ' ';
                        });
                    }
                    text += '\n';
                });
            }
            text += '\n';
        });
    }
    return text.trim();
}

function closeOCRModal() {
    document.getElementById('ocrModal').classList.remove('show');
}

async function copyOCRText() {
    const ocrText = document.getElementById('ocrText');
    try {
        await navigator.clipboard.writeText(ocrText.textContent);
        // Visual feedback
        const copyBtn = document.querySelector('#ocrModal .copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#28a745';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = ocrText.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        const copyBtn = document.querySelector('#ocrModal .copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }
}

// Close modal when clicking outside
document.getElementById('ocrModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeOCRModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (document.getElementById('ocrModal').classList.contains('show')) {
            closeOCRModal();
        }
        if (document.getElementById('summaryModal').classList.contains('show')) {
            closeSummaryModal();
        }
    }
});

// Summarization Functions
async function summarizeOCRText() {
    const ocrText = document.getElementById('ocrText').textContent;
    if (!ocrText || ocrText === 'Processing OCR...' || ocrText.startsWith('OCR Error')) {
        alert('No valid OCR text to summarize.');
        return;
    }

    const summaryModal = document.getElementById('summaryModal');
    const summaryText = document.getElementById('summaryText');
    const progressBar = document.getElementById('summaryProgress');
    const progressFill = progressBar.querySelector('.progress-fill');

    summaryModal.classList.add('show');
    progressBar.style.display = 'block';
    summaryText.textContent = 'Preparing summary...';

    try {
        // Check if Summarizer API is supported
        if (!('Summarizer' in self)) {
            throw new Error('Summarizer API is not supported in this browser. Please use Chrome 138+.');
        }

        // Check availability
        const availability = await Summarizer.availability();
        if (availability === 'unavailable') {
            throw new Error('Summarizer API is not available.');
        }

        // Update progress
        progressFill.style.width = '20%';
        summaryText.textContent = 'Loading AI model...';

        // Create summarizer
        const summarizer = await Summarizer.create({
            type: 'tldr', // key-points, headline, tldr
            length: 'medium',
            format: 'plain-text', // plain-text, markdown
            monitor(m) {
                m.addEventListener('downloadprogress', (e) => {
                    const progress = Math.round(e.loaded * 80) + 20; // 20-100%
                    progressFill.style.width = progress + '%';
                    summaryText.textContent = `Loading AI model... ${progress}%`;
                });
            }
        });

        // Update progress
        progressFill.style.width = '90%';
        summaryText.textContent = 'Generating summary...';

        // Generate summary
        const summary = await summarizer.summarize(ocrText, {
            context: 'This is text extracted from a scanned document via OCR.'
        });

        // Complete progress
        progressFill.style.width = '100%';
        progressBar.style.display = 'none';
        summaryText.textContent = summary;

    } catch (error) {
        console.error('Summarization Error:', error);
        progressBar.style.display = 'none';
        summaryText.textContent = `Summarization Error: ${error.message}\n\nNote: Summarization requires Chrome 138+ with Gemini Nano. Make sure you have enough storage space and are using a supported browser.`;
    }
}

function closeSummaryModal() {
    document.getElementById('summaryModal').classList.remove('show');
}

async function copySummaryText() {
    const summaryText = document.getElementById('summaryText');
    try {
        await navigator.clipboard.writeText(summaryText.textContent);
        // Visual feedback
        const copyBtn = document.querySelector('#summaryModal .copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#28a745';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = summaryText.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        const copyBtn = document.querySelector('#summaryModal .copy-btn');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 2000);
    }
}

// Close summary modal when clicking outside
document.getElementById('summaryModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeSummaryModal();
    }
});
