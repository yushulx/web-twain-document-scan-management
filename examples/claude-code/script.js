// Dynamic Web TWAIN instance
let DWObject;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeDWT();
    setupEventListeners();
});

/**
 * Initialize Dynamic Web TWAIN v19.0
 */
function initializeDWT() {
    // Set the license key (you'll need to get this from Dynamsoft)
    // For trial/demo purposes, you can use the trial license
    Dynamsoft.DWT.ProductKey = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ=="; // Replace with your actual license key

    // Configure DWT with latest v19.0 settings
    Dynamsoft.DWT.ResourcesPath = "https://unpkg.com/dwt@19.2.0/dist";
    Dynamsoft.DWT.Containers = [{
        WebTwainId: 'dwtObject',
        ContainerId: 'dwtcontrolContainer',
        Width: '100%',
        Height: '100%'
    }];

    // Set auto load to true for better performance
    Dynamsoft.DWT.AutoLoad = true;

    // Initialize DWT
    Dynamsoft.DWT.Load();

    // Wait for DWT to be ready
    Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', function () {
        DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');

        if (DWObject) {
            updateStatus('Dynamic Web TWAIN v19.0 loaded successfully', 'success');

            // Set viewer settings for better experience
            DWObject.Viewer.bind(document.getElementById('dwtcontrolContainer'));
            DWObject.Viewer.width = '100%';
            DWObject.Viewer.height = '100%';
            DWObject.Viewer.show();

            // Hide placeholder and show version
            document.querySelector('.dwt-container').classList.add('dwt-loaded');
            document.getElementById('dwt-version').textContent = 'DWT: v19.0';
            document.getElementById('dwt-version').classList.add('loaded');

            loadScannerSources();
            setupDWTEvents();
        } else {
            updateStatus('Failed to initialize Dynamic Web TWAIN', 'error');
        }
    });

    // Handle initialization errors
    Dynamsoft.DWT.RegisterEvent('OnWebTwainInitMessage', function (message) {
        updateStatus(`Initialization: ${message}`, 'info');
    });
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
    // Scan button
    document.getElementById('scan-btn').addEventListener('click', scanDocument);

    // Load button
    document.getElementById('load-btn').addEventListener('click', loadImage);

    // Save button
    document.getElementById('save-btn').addEventListener('click', saveToPDF);

    // Remove selected button
    document.getElementById('remove-btn').addEventListener('click', removeSelected);

    // Remove all button
    document.getElementById('remove-all-btn').addEventListener('click', removeAll);

    // Source selection
    document.getElementById('source-select').addEventListener('change', function () {
        if (DWObject && this.value !== '') {
            DWObject.SelectSource(parseInt(this.value));
            updateStatus(`Scanner "${this.options[this.selectedIndex].text}" selected`, 'info');
        }
    });
}

/**
 * Setup Dynamic Web TWAIN events
 */
function setupDWTEvents() {
    if (!DWObject) return;

    // Image acquisition events
    DWObject.RegisterEvent('OnPreAllTransfers', function () {
        updateStatus('Starting scan...', 'warning');
        document.getElementById('scan-btn').disabled = true;
    });

    DWObject.RegisterEvent('OnPostAllTransfers', function () {
        updateStatus('Scan completed successfully', 'success');
        document.getElementById('scan-btn').disabled = false;
        updateImageInfo();
    });

    DWObject.RegisterEvent('OnPostTransfer', function () {
        updateImageInfo();
    });

    // Error handling
    DWObject.RegisterEvent('OnPostTransferAsync', function (info) {
        if (info.bImageCompleted) {
            updateImageInfo();
        }
    });

    // Image buffer change events
    DWObject.RegisterEvent('OnBitmapChanged', function (indexArray) {
        updateImageInfo();
    });

    DWObject.RegisterEvent('OnImageAreaSelected', function (index, left, top, right, bottom) {
        updateStatus(`Image area selected: ${Math.round(right - left)}x${Math.round(bottom - top)}px`, 'info');
    });

    DWObject.RegisterEvent('OnImageAreaDeSelected', function (index) {
        updateStatus('Image area deselected', 'info');
    });

    // Mouse events for better user feedback
    DWObject.RegisterEvent('OnMouseClick', function (index) {
        updateStatus(`Image ${index + 1} selected`, 'info');
    });

    // Scanner source events
    DWObject.RegisterEvent('OnSourceUIClose', function () {
        updateStatus('Scanner UI closed', 'info');
        document.getElementById('scan-btn').disabled = false;
    });
}

/**
 * Load available scanner sources
 */
function loadScannerSources() {
    if (!DWObject) {
        updateStatus('DWT not initialized', 'error');
        return;
    }

    const sourceSelect = document.getElementById('source-select');
    sourceSelect.innerHTML = '<option value="">Select a scanner...</option>';

    // Get source count
    const sourceCount = DWObject.SourceCount;

    if (sourceCount === 0) {
        updateStatus('No scanners found. Please ensure TWAIN drivers are installed.', 'warning');
        sourceSelect.innerHTML = '<option value="">No scanners available</option>';
        return;
    }

    // Populate scanner sources
    for (let i = 0; i < sourceCount; i++) {
        const sourceName = DWObject.GetSourceNameItems(i);
        const option = document.createElement('option');
        option.value = i;
        option.textContent = sourceName;
        sourceSelect.appendChild(option);
    }

    // Select first source by default
    if (sourceCount > 0) {
        sourceSelect.selectedIndex = 1;
        DWObject.SelectSource(0);
        updateStatus(`Found ${sourceCount} scanner(s). Default scanner selected.`, 'success');
    }
}

/**
 * Scan document from selected source
 */
function scanDocument() {
    if (!DWObject) {
        updateStatus('Scanner not initialized', 'error');
        return;
    }

    const sourceSelect = document.getElementById('source-select');
    if (!sourceSelect.value) {
        updateStatus('Please select a scanner source', 'warning');
        return;
    }

    // Set scan parameters
    const pixelType = parseInt(document.getElementById('pixel-type').value);
    const resolution = parseInt(document.getElementById('resolution').value);
    const autoDeskew = document.getElementById('auto-deskew').checked;
    const autoBorder = document.getElementById('auto-border').checked;

    DWObject.PixelType = pixelType;
    DWObject.Resolution = resolution;

    // Configure enhanced v19.0 scan settings
    DWObject.IfShowUI = false; // Set to true to show scanner UI
    DWObject.IfFeederEnabled = false;
    DWObject.IfDuplexEnabled = false;
    DWObject.IfAutomaticDeskew = autoDeskew; // v19.0 feature
    DWObject.IfAutomaticBorderDetection = autoBorder; // v19.0 feature

    updateStatus('Preparing to scan with v19.0 enhancements...', 'warning');

    // Use the improved AcquireImage method with enhanced callbacks
    DWObject.AcquireImage(
        {
            IfCloseSourceAfterAcquire: true,
            IfShowUI: false,
            PixelType: pixelType,
            Resolution: resolution
        },
        function () {
            updateStatus('Scan completed with auto-enhancements applied', 'success');
            updateImageInfo();
        },
        function (errorCode, errorString) {
            updateStatus(`Scan failed: ${errorString} (Code: ${errorCode})`, 'error');
            document.getElementById('scan-btn').disabled = false;
        }
    );
}

/**
 * Load image from local file
 */
function loadImage() {
    if (!DWObject) {
        updateStatus('DWT not initialized', 'error');
        return;
    }

    updateStatus('Opening file dialog...', 'warning');

    DWObject.LoadImageEx("", 5, function () {
        updateStatus('Image loaded successfully', 'success');
        updateImageInfo();
    }, function (errorCode, errorString) {
        updateStatus(`Failed to load image: ${errorString} (Code: ${errorCode})`, 'error');
    });
}

/**
 * Save images as PDF with v19.0 enhancements
 */
function saveToPDF() {
    if (!DWObject) {
        updateStatus('DWT not initialized', 'error');
        return;
    }

    if (DWObject.HowManyImagesInBuffer === 0) {
        updateStatus('No images to save', 'warning');
        return;
    }

    updateStatus('Saving as PDF with enhanced compression...', 'warning');

    // Use the improved SaveSelectedImagesAsMultiPagePDF method in v19.0
    const indices = [];
    for (let i = 0; i < DWObject.HowManyImagesInBuffer; i++) {
        indices.push(i);
    }

    // Enhanced PDF saving with better compression and quality
    const fileName = `ScannedDocument_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`;

    DWObject.SaveSelectedImagesAsMultiPagePDF(
        fileName,
        indices,
        function () {
            updateStatus(`PDF saved successfully: ${fileName}`, 'success');
        },
        function (errorCode, errorString) {
            updateStatus(`Failed to save PDF: ${errorString} (Code: ${errorCode})`, 'error');
        }
    );
}

/**
 * Remove selected image
 */
function removeSelected() {
    if (!DWObject) {
        updateStatus('DWT not initialized', 'error');
        return;
    }

    if (DWObject.HowManyImagesInBuffer === 0) {
        updateStatus('No images to remove', 'warning');
        return;
    }

    const currentIndex = DWObject.CurrentImageIndexInBuffer;
    DWObject.RemoveImage(currentIndex);
    updateStatus(`Image ${currentIndex + 1} removed`, 'success');
    updateImageInfo();
}

/**
 * Remove all images
 */
function removeAll() {
    if (!DWObject) {
        updateStatus('DWT not initialized', 'error');
        return;
    }

    if (DWObject.HowManyImagesInBuffer === 0) {
        updateStatus('No images to remove', 'warning');
        return;
    }

    const imageCount = DWObject.HowManyImagesInBuffer;
    DWObject.RemoveAllImages();
    updateStatus(`All ${imageCount} images removed`, 'success');
    updateImageInfo();
}

/**
 * Update image information display
 */
function updateImageInfo() {
    if (!DWObject) return;

    const imageCount = DWObject.HowManyImagesInBuffer;
    const currentIndex = DWObject.CurrentImageIndexInBuffer;

    document.getElementById('image-count').textContent = `Images: ${imageCount}`;
    document.getElementById('current-image').textContent =
        imageCount > 0 ? `Current: ${currentIndex + 1} of ${imageCount}` : 'Current: -';

    // Update button states
    const hasImages = imageCount > 0;
    document.getElementById('save-btn').disabled = !hasImages;
    document.getElementById('remove-btn').disabled = !hasImages;
    document.getElementById('remove-all-btn').disabled = !hasImages;
}

/**
 * Update status message
 */
function updateStatus(message, type = '') {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;

    console.log(`[${type.toUpperCase()}] ${message}`);

    // Auto-clear info messages after 5 seconds
    if (type === 'info') {
        setTimeout(() => {
            if (statusElement.textContent === message) {
                statusElement.textContent = 'Ready to scan documents with Dynamic Web TWAIN v19.0';
                statusElement.className = 'status-message';
            }
        }, 5000);
    }
}

/**
 * Handle errors globally
 */
function handleError(errorCode, errorString) {
    updateStatus(`Error ${errorCode}: ${errorString}`, 'error');
}

// Global error handler for DWT
Dynamsoft.DWT.RegisterEvent('OnWebTwainPostExecute', function () {
    // This event is fired after each DWT operation
});

// Enhanced error handling for network issues
window.addEventListener('online', function () {
    updateStatus('Network connection restored', 'success');
});

window.addEventListener('offline', function () {
    updateStatus('Network connection lost - some features may not work', 'warning');
});

// Handle page unload
window.addEventListener('beforeunload', function () {
    if (DWObject) {
        DWObject.RemoveAllImages();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (!DWObject) return;

    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (DWObject.HowManyImagesInBuffer > 0) {
            saveToPDF();
        }
    }

    // Delete key to remove selected image
    if (e.key === 'Delete') {
        if (DWObject.HowManyImagesInBuffer > 0) {
            removeSelected();
        }
    }

    // Spacebar to scan
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
        e.preventDefault();
        scanDocument();
    }
});