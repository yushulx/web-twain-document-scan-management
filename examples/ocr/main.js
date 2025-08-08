// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let selectedFile = null;
let currentDocument = null;
let pages = [];
let showTextOverlay = true;
let apiKeys = JSON.parse(localStorage.getItem('ocrApiKeys') || '{}');

// Pagination variables
let currentPageIndex = 0;

// DOM elements
const fileInput = document.getElementById('fileInput');
const fileInputSmall = document.getElementById('fileInputSmall');
const uploadArea = document.getElementById('uploadArea');
const uploadAreaSmall = document.getElementById('uploadAreaSmall');
const previewContainer = document.getElementById('previewContainer');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultContainer = document.getElementById('resultContainer');
const resultText = document.getElementById('resultText');
const errorContainer = document.getElementById('errorContainer');
const languageSelect = document.getElementById('languageSelect');
const languageSelectPanel = document.getElementById('languageSelectPanel');
const engineSelect = document.getElementById('engineSelect');
const engineSelectPanel = document.getElementById('engineSelectPanel');
const apiConfig = document.getElementById('apiConfig');
const apiConfigPanel = document.getElementById('apiConfigPanel');
const apiKeyInput = document.getElementById('apiKeyInput');
const apiKeyInputPanel = document.getElementById('apiKeyInputPanel');
const apiHelpText = document.getElementById('apiHelpText');
const apiHelpTextPanel = document.getElementById('apiHelpTextPanel');
const batchControls = document.getElementById('batchControls');
const currentPageContainer = document.getElementById('currentPageContainer');
const threePanelWrapper = document.getElementById('threePanelWrapper');
const initialSetup = document.getElementById('initialSetup');
const toggleOverlay = document.getElementById('toggleOverlay');
const batchTitle = document.getElementById('batchTitle');
const testConversionCheckbox = document.getElementById('testConversionCheckbox');

// Click to upload
uploadArea.addEventListener('click', () => fileInput.click());
uploadAreaSmall.addEventListener('click', () => fileInputSmall.click());

// File input change
fileInput.addEventListener('change', handleFileSelect);
fileInputSmall.addEventListener('change', handleFileSelect);

// Engine selection change
engineSelect.addEventListener('change', handleEngineChange);

// Panel control event listeners
if (languageSelectPanel) {
    languageSelectPanel.addEventListener('change', handleLanguageChangePanel);
}
if (engineSelectPanel) {
    engineSelectPanel.addEventListener('change', handleEngineChangePanel);
}
if (apiKeyInputPanel) {
    apiKeyInputPanel.addEventListener('input', handleApiKeyChangePanel);
}

// Sync panel controls with original controls
function syncPanelControls() {
    if (languageSelectPanel && languageSelect) {
        languageSelectPanel.value = languageSelect.value;
    }
    if (engineSelectPanel && engineSelect) {
        engineSelectPanel.value = engineSelect.value;
        // Update API config visibility for panel controls
        updateApiConfigVisibilityPanel();
    }
    if (apiKeyInputPanel && apiKeyInput) {
        apiKeyInputPanel.value = apiKeyInput.value;
    }
}

// Handle language change in panel
function handleLanguageChangePanel(e) {
    if (languageSelect) {
        languageSelect.value = e.target.value;
    }
}

// Handle engine change in panel
function handleEngineChangePanel(e) {
    if (engineSelect) {
        engineSelect.value = e.target.value;
        // Update original API config visibility
        updateApiConfigVisibility();
    }
    updateApiConfigVisibilityPanel();
}

// Handle API key change in panel
function handleApiKeyChangePanel(e) {
    if (apiKeyInput) {
        apiKeyInput.value = e.target.value;
    }
}

// Update API config visibility for panel controls
function updateApiConfigVisibilityPanel() {
    if (!engineSelectPanel || !apiConfigPanel) return;

    const selectedEngine = engineSelectPanel.value;
    const needsApiKey = ['ocrspace', 'googlevision', 'azure'].includes(selectedEngine);

    if (needsApiKey) {
        apiConfigPanel.style.display = 'block';
        updateApiHelpTextPanel();
    } else {
        apiConfigPanel.style.display = 'none';
    }
}

// Update API help text for panel controls
function updateApiHelpTextPanel() {
    if (!engineSelectPanel || !apiHelpTextPanel) return;

    const selectedEngine = engineSelectPanel.value;
    let helpText = '';

    switch (selectedEngine) {
        case 'ocrspace':
            helpText = 'Get your free API key from <a href="https://ocr.space/ocrapi" target="_blank">OCR.space</a>';
            break;
        case 'googlevision':
            helpText = 'Get your API key from <a href="https://cloud.google.com/vision/docs/setup" target="_blank">Google Cloud Vision</a>';
            break;
        case 'azure':
            helpText = 'Get your API key from <a href="https://azure.microsoft.com/services/cognitive-services/computer-vision/" target="_blank">Azure Computer Vision</a>';
            break;
    }

    apiHelpTextPanel.innerHTML = helpText;
}

// Toggle API key visibility for panel controls
function toggleApiKeyVisibilityPanel() {
    if (!apiKeyInputPanel) return;

    const isPassword = apiKeyInputPanel.type === 'password';
    apiKeyInputPanel.type = isPassword ? 'text' : 'password';

    const button = apiKeyInputPanel.parentElement.querySelector('.toggle-visibility');
    if (button) {
        button.textContent = isPassword ? '👁️' : '🙈';
        button.title = isPassword ? 'Hide API key' : 'Show API key';
    }
}

// Save API key for panel controls
function saveApiKeyPanel() {
    if (!apiKeyInputPanel || !engineSelectPanel) return;

    const apiKey = apiKeyInputPanel.value.trim();
    const engine = engineSelectPanel.value;

    if (apiKey) {
        localStorage.setItem(`apiKey_${engine}`, apiKey);
        showNotification('API key saved successfully!', 'success');
    } else {
        showNotification('Please enter an API key', 'error');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    // Set message and style based on type
    notification.textContent = message;
    notification.className = type;

    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#28a745';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc3545';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ffc107';
            notification.style.color = '#212529';
            break;
        default:
            notification.style.backgroundColor = '#17a2b8';
    }

    // Show notification
    notification.style.opacity = '1';

    // Hide after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

// Load saved API key on page load
window.addEventListener('load', () => {
    handleEngineChange();
    checkLibraryAvailability();
    syncPanelControls();
});

function checkLibraryAvailability() {
    // Check if UTIF is loaded for TIFF support
    if (typeof UTIF === 'undefined') {
        console.warn('UTIF library not loaded. Multi-page TIFF support disabled.');
    } else {
        console.log('UTIF library loaded successfully. Multi-page TIFF support enabled.');
    }
}

// Drag and drop for both upload areas
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

uploadAreaSmall.addEventListener('dragover', handleDragOver);
uploadAreaSmall.addEventListener('dragleave', handleDragLeave);
uploadAreaSmall.addEventListener('drop', handleDrop);

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

async function handleFile(file) {
    // Validate file type
    const isPDF = file.type === 'application/pdf';
    const isTIFF = file.type === 'image/tiff' || file.type === 'image/tif' ||
        file.name.toLowerCase().endsWith('.tiff') || file.name.toLowerCase().endsWith('.tif');
    const isImage = file.type.startsWith('image/');

    if (!isPDF && !isImage) {
        showError('Please select a valid image file (JPG, PNG, GIF, BMP, WEBP, TIFF) or PDF.');
        return;
    }

    // Validate file size (max 50MB for PDFs and TIFF, 10MB for other images)
    const maxSize = (isPDF || isTIFF) ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showError(`File size must be less than ${(isPDF || isTIFF) ? '50MB' : '10MB'}.`);
        return;
    }

    selectedFile = file;
    clearError();

    // Check if test conversion is enabled
    if (testConversionCheckbox && testConversionCheckbox.checked) {
        await testConvert2Searchable(file);
        return; // Exit early if testing the API
    }

    if (isPDF) {
        await loadPDF(file);
    } else if (isTIFF) {
        await loadTIFF(file);
    } else {
        await loadImage(file);
    }
}

function handleEngineChange() {
    const engine = engineSelect.value;
    const needsApiKey = ['google', 'azure'].includes(engine);

    if (needsApiKey) {
        apiConfig.classList.remove('hidden');
        updateApiHelp(engine);
        // Load saved API key
        if (apiKeys[engine]) {
            apiKeyInput.value = apiKeys[engine];
        } else {
            apiKeyInput.value = '';
        }
    } else {
        apiConfig.classList.add('hidden');
    }
}

function updateApiHelp(engine) {
    const helpTexts = {
        google: `
                    <strong>Google Cloud Vision API:</strong><br>
                    1. Go to <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a><br>
                    2. Create a project and enable Cloud Vision API<br>
                    3. Create credentials (API Key)<br>
                    4. Copy the API key here<br>
                    <em>Free tier: 1,000 requests/month</em>
                `,
        azure: `
                    <strong>Azure Computer Vision:</strong><br>
                    1. Go to <a href="https://portal.azure.com/" target="_blank">Azure Portal</a><br>
                    2. Create a Computer Vision resource<br>
                    3. Copy the API key from Keys and Endpoint<br>
                    4. Paste the key here<br>
                    <em>Free tier: 5,000 requests/month</em>
                `
    };

    apiHelpText.innerHTML = helpTexts[engine] || '';
}

function toggleApiKeyVisibility() {
    const input = apiKeyInput;
    input.type = input.type === 'password' ? 'text' : 'password';
}

function saveApiKey() {
    const engine = engineSelect.value;
    const key = apiKeyInput.value.trim();

    if (key) {
        apiKeys[engine] = key;
        localStorage.setItem('ocrApiKeys', JSON.stringify(apiKeys));
        showSuccess('API key saved locally!');
    } else {
        showError('Please enter an API key first.');
    }
}

async function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        // Get original image dimensions
        const img = new Image();
        img.onload = () => {
            // Reset containers - show three-panel layout
            previewContainer.classList.add('hidden');
            resultContainer.classList.add('hidden');
            initialSetup.classList.add('hidden');

            // Show three-panel wrapper
            threePanelWrapper.classList.remove('hidden');

            // Sync panel controls when switching to three-panel view
            syncPanelControls();

            // Update batch title for single image
            batchTitle.textContent = '🖼️ Image';

            // Create single page object for image with proper dimensions
            const pageData = {
                id: 1,
                imageData: e.target.result,
                canvas: null,
                originalWidth: img.width,
                originalHeight: img.height,
                displayScale: 1.0,
                ocrResult: null,
                status: 'pending'
            };

            pages = [pageData];
            currentDocument = { type: 'image', pageCount: 1 };
            currentPageIndex = 0;

            // Initialize pagination and display first page
            initializePagination();
            displayCurrentPage();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function loadTIFF(file) {
    try {
        showSuccess('Loading TIFF file...');

        // Check if UTIF is available
        if (typeof UTIF === 'undefined') {
            throw new Error('UTIF library not loaded. Falling back to single image mode.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Decode TIFF using UTIF
        const ifds = UTIF.decode(uint8Array);
        const pageCount = ifds.length;

        currentDocument = { type: 'tiff', pageCount: pageCount };
        pages = [];

        // Show appropriate controls with pagination
        previewContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        initialSetup.classList.add('hidden');

        // Show three-panel wrapper
        threePanelWrapper.classList.remove('hidden');

        // Sync panel controls when switching to three-panel view
        syncPanelControls();

        if (pageCount > 1) {
            batchTitle.textContent = `📄 TIFF Document (${pageCount} pages)`;
        } else {
            batchTitle.textContent = '🖼️ TIFF Image';
        }

        // Clear pages container
        currentPageContainer.innerHTML = '';

        // Load all pages from TIFF
        for (let pageNum = 0; pageNum < pageCount; pageNum++) {
            const ifd = ifds[pageNum];

            // Decode the image data
            UTIF.decodeImage(uint8Array, ifd);

            // Convert to RGBA
            const rgba = UTIF.toRGBA8(ifd);

            // Create canvas and draw the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = ifd.width;
            canvas.height = ifd.height;

            // Create ImageData and put it on canvas
            const imageData = new ImageData(new Uint8ClampedArray(rgba), ifd.width, ifd.height);
            ctx.putImageData(imageData, 0, 0);

            const dataURL = canvas.toDataURL('image/png');

            const pageData = {
                id: pageNum + 1,
                imageData: dataURL,
                canvas: canvas,
                originalWidth: canvas.width,
                originalHeight: canvas.height,
                displayScale: 1.0,
                ocrResult: null,
                status: 'pending'
            };

            pages.push(pageData);
        }

        currentPageIndex = 0;
        initializePagination();
        displayCurrentPage();

        showSuccess(`Successfully loaded TIFF with ${pageCount} page${pageCount > 1 ? 's' : ''}.`);

    } catch (error) {
        console.error('TIFF loading error:', error);
        showError('Failed to load TIFF as multi-page. Trying as single image...');

        // Fallback: try to load as single image
        console.log('Falling back to single image loading...');
        await loadImage(file);
    }
} async function loadPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        currentDocument = { type: 'pdf', pageCount: pdf.numPages, pdf: pdf };
        pages = [];

        // Show pagination controls
        previewContainer.classList.add('hidden');
        resultContainer.classList.add('hidden');
        initialSetup.classList.add('hidden');

        // Show three-panel wrapper
        threePanelWrapper.classList.remove('hidden');

        // Sync panel controls when switching to three-panel view
        syncPanelControls();

        // Update batch title for PDF
        batchTitle.textContent = `📄 PDF Document (${pdf.numPages} pages)`;

        // Load all pages
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const imageData = canvas.toDataURL();

            const pageData = {
                id: pageNum,
                imageData: imageData,
                canvas: canvas,
                originalWidth: canvas.width,
                originalHeight: canvas.height,
                ocrResult: null,
                status: 'pending'
            };

            pages.push(pageData);
        }

        currentPageIndex = 0;
        initializePagination();
        displayCurrentPage();

    } catch (error) {
        console.error('PDF loading error:', error);
        showError('Failed to load PDF. Please ensure the file is a valid PDF.');
    }
}

// Pagination functions
function initializePagination() {
    // Just update and display the current page since controls are now embedded
    displayCurrentPage();
}

function displayCurrentPage() {
    if (pages.length === 0) return;

    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;

    // Determine title based on document type
    let pageTitle, buttonText;
    if (currentDocument.type === 'image') {
        pageTitle = 'Image';
        buttonText = 'Image';
    } else if (currentDocument.type === 'tiff') {
        pageTitle = currentDocument.pageCount === 1 ? 'TIFF Image' : `TIFF Page ${currentPage.id}`;
        buttonText = currentDocument.pageCount === 1 ? 'Image' : 'Page';
    } else {
        pageTitle = `Page ${currentPage.id}`;
        buttonText = 'Page';
    }

    // Check if this is just a pagination update (not initial load)
    const existingPage = document.getElementById('current-page');
    const isPaginationUpdate = existingPage !== null;

    if (isPaginationUpdate) {
        // Update only the necessary parts without rebuilding entire HTML
        updatePageContent(currentPage, pageTitle, buttonText);
    } else {
        // Initial load - create full HTML structure
        createPageContent(currentPage, pageTitle, buttonText);
    }

    // Show text overlay if OCR has been performed and overlay is enabled
    if (currentPage.ocrResult && showTextOverlay) {
        createTextOverlay('current-page', currentPage.ocrResult);
    }

    // Update text area with current page's OCR result
    updatePageTextArea(currentPage);
}

function createPageContent(currentPage, pageTitle, buttonText) {
    // Create page element HTML with embedded pagination controls
    currentPageContainer.innerHTML = `
        <div class="current-page" id="current-page">
            <!-- Pagination Controls at the top -->
            <div class="pagination-controls ${pages.length <= 1 ? 'hidden' : ''}" id="pagePaginationControls">
                <button class="btn btn-small" id="pageNavPrevBtn" onclick="goToPreviousPage()" ${currentPageIndex <= 0 ? 'disabled' : ''}>⬅️ Previous</button>
                <span class="page-info" id="pageNavInfo">Page ${currentPageIndex + 1} of ${pages.length}</span>
                <button class="btn btn-small" id="pageNavNextBtn" onclick="goToNextPage()" ${currentPageIndex >= pages.length - 1 ? 'disabled' : ''}>➡️ Next</button>
            </div>
            
            <div class="page-header">
                <h4 class="page-title">${pageTitle}</h4>
            </div>
            <div class="page-status status-${currentPage.status}" id="current-page-status">
                ${getStatusText(currentPage.status, currentPage.ocrResult)}
            </div>
            <div class="page-preview">
                <div style="position: relative; display: inline-block;">
                    <img src="${currentPage.imageData}" class="page-image" alt="${pageTitle}">
                    <div class="text-overlay" id="current-page-overlay"></div>
                </div>
            </div>
        </div>
    `;
}

function updatePageContent(currentPage, pageTitle, buttonText) {
    // Update pagination controls
    const pageNavInfo = document.getElementById('pageNavInfo');
    const pageNavPrevBtn = document.getElementById('pageNavPrevBtn');
    const pageNavNextBtn = document.getElementById('pageNavNextBtn');

    if (pageNavInfo) {
        pageNavInfo.textContent = `Page ${currentPageIndex + 1} of ${pages.length}`;
    }

    if (pageNavPrevBtn) {
        pageNavPrevBtn.disabled = currentPageIndex <= 0;
    }

    if (pageNavNextBtn) {
        pageNavNextBtn.disabled = currentPageIndex >= pages.length - 1;
    }

    // Update page title
    const pageTitleEl = document.querySelector('.page-title');
    if (pageTitleEl) {
        pageTitleEl.textContent = pageTitle;
    }

    // Update page status
    const statusEl = document.getElementById('current-page-status');
    if (statusEl) {
        statusEl.className = `page-status status-${currentPage.status}`;
        statusEl.textContent = getStatusText(currentPage.status, currentPage.ocrResult);
    }

    // Update image and clear overlay
    const pageImage = document.querySelector('.page-image');
    const overlay = document.getElementById('current-page-overlay');

    if (pageImage) {
        pageImage.src = currentPage.imageData;
        pageImage.alt = pageTitle;
    }

    if (overlay) {
        overlay.innerHTML = '';
    }
}

function getStatusText(status, ocrResult) {
    switch (status) {
        case 'pending':
            return '📄 Ready for OCR';
        case 'processing':
            return '⏳ Processing OCR...';
        case 'completed':
            const confidence = ocrResult ? Math.round(ocrResult.confidence) : 0;
            return `✅ OCR Complete (${confidence}% confidence)`;
        case 'error':
            return '❌ OCR Failed';
        default:
            return '📄 Ready for OCR';
    }
}

function goToPreviousPage() {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        displayCurrentPage();
    }
}

function goToNextPage() {
    if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        displayCurrentPage();
    }
}

function processCurrentPage() {
    const currentPage = pages[currentPageIndex];
    if (currentPage) {
        processPageOCR(currentPage.id);
    }
}

function downloadCurrentPageText() {
    const currentPage = pages[currentPageIndex];
    if (!currentPage || !currentPage.ocrResult) {
        showError('No OCR text available for this page. Please run OCR first.');
        return;
    }

    const blob = new Blob([currentPage.ocrResult.text.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${currentPage.id}-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyCurrentPageText() {
    const currentPage = pages[currentPageIndex];
    if (!currentPage || !currentPage.ocrResult) {
        showError('No OCR text available for this page. Please run OCR first.');
        return;
    }

    const text = currentPage.ocrResult.text.trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showSuccess('Page text copied to clipboard!');
        }).catch(() => {
            // Fallback for clipboard API failure
            copyTextFallback(text);
        });
    } else {
        // Fallback for older browsers
        copyTextFallback(text);
    }
}

function copyTextFallback(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showSuccess('Page text copied to clipboard!');
    } catch (err) {
        showError('Failed to copy text to clipboard.');
    }

    document.body.removeChild(textArea);
}

function clearAllOCR() {
    pages.forEach(page => {
        page.ocrResult = null;
        page.status = 'pending';
    });

    // Refresh the current page display and clear text area
    displayCurrentPage();

    // Clear text area
    const textArea = document.getElementById('pageTextArea');
    if (textArea) {
        textArea.value = '';
        textArea.placeholder = 'OCR text will appear here when processing is complete...';
    }
}

async function processPageOCR(pageId) {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    try {
        updatePageStatus(pageId, 'processing', '⏳ Processing OCR...');
        const engine = engineSelect.value;
        const language = languageSelect.value;

        let ocrData;

        switch (engine) {
            case 'tesseract':
                ocrData = await performTesseractOCR(page.imageData, language, pageId);
                break;
            case 'ocr.space':
                ocrData = await performOCRSpaceOCR(page.imageData, language, pageId);
                break;
            case 'google':
                ocrData = await performGoogleOCR(page.imageData, language, pageId);
                break;
            case 'azure':
                ocrData = await performAzureOCR(page.imageData, language, pageId);
                break;
            default:
                throw new Error('Unknown OCR engine');
        }

        page.ocrResult = ocrData;

        if (ocrData.text.trim()) {
            updatePageStatus(pageId, 'completed', `✅ OCR Complete (${Math.round(ocrData.confidence)}% confidence)`);
            // If this is the current page, update the display and text area
            if (page.id === pages[currentPageIndex].id) {
                createTextOverlay('current-page', ocrData);
                updatePageTextArea(page);
            }
        } else {
            updatePageStatus(pageId, 'error', '❌ No text detected');
            // If this is the current page, update the text area
            if (page.id === pages[currentPageIndex].id) {
                updatePageTextArea(page);
            }
        }

    } catch (error) {
        console.error('OCR Error:', error);
        updatePageStatus(pageId, 'error', `❌ OCR Failed: ${error.message}`);
    }
}

// Tesseract.js OCR (original implementation)
async function performTesseractOCR(imageData, language, pageId) {
    const worker = await Tesseract.createWorker(language, 1, {
        logger: m => {
            if (m.status === 'recognizing text') {
                const progress = Math.round(m.progress * 100);
                updatePageStatus(pageId, 'processing', `⏳ Tesseract... ${progress}%`);
            }
        }
    });

    const { data } = await worker.recognize(imageData);
    await worker.terminate();
    return data;
}

// OCR.space API (high accuracy, free tier)
async function performOCRSpaceOCR(imageData, language, pageId) {
    updatePageStatus(pageId, 'processing', '⏳ OCR.space processing...');

    // Convert language codes
    const langMap = {
        'eng': 'eng',
        'chi_sim': 'chs',
        'chi_tra': 'cht',
        'spa': 'spa',
        'fra': 'fre',
        'deu': 'ger',
        'jpn': 'jpn',
        'rus': 'rus'
    };

    const formData = new FormData();

    // Convert data URL to blob
    const response = await fetch(imageData);
    const blob = await response.blob();

    formData.append('file', blob, 'image.png');
    formData.append('language', langMap[language] || 'eng');
    formData.append('isOverlayRequired', 'true');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Use OCR Engine 2 for better accuracy

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
            'apikey': 'helloworld' // Free API key for testing, can be upgraded
        },
        body: formData
    });

    const result = await ocrResponse.json();

    if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || 'OCR.space processing failed');
    }

    // Convert OCR.space format to Tesseract-compatible format
    const parsedResult = result.ParsedResults[0];
    const lines = parsedResult.TextOverlay?.Lines || [];

    const words = [];
    let allText = '';

    lines.forEach(line => {
        line.Words.forEach(word => {
            words.push({
                text: word.WordText,
                confidence: 90, // OCR.space doesn't provide word-level confidence
                bbox: {
                    x0: word.Left,
                    y0: word.Top,
                    x1: word.Left + word.Width,
                    y1: word.Top + word.Height
                }
            });
            allText += word.WordText + ' ';
        });
        allText += '\n';
    });

    return {
        text: allText.trim(),
        confidence: 90,
        words: words
    };
}

// Google Cloud Vision API
async function performGoogleOCR(imageData, language, pageId) {
    const apiKey = apiKeys.google;
    if (!apiKey) {
        throw new Error('Google API key required. Please add it in the settings.');
    }

    updatePageStatus(pageId, 'processing', '⏳ Google Vision processing...');

    // Convert language codes
    const langMap = {
        'eng': 'en',
        'chi_sim': 'zh',
        'chi_tra': 'zh-TW',
        'spa': 'es',
        'fra': 'fr',
        'deu': 'de',
        'jpn': 'ja',
        'rus': 'ru'
    };

    // Extract base64 data
    const base64Data = imageData.split(',')[1];

    const requestBody = {
        requests: [{
            image: {
                content: base64Data
            },
            features: [{
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1
            }],
            imageContext: {
                languageHints: [langMap[language] || 'en']
            }
        }]
    };

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.responses[0].error) {
        throw new Error(`Google Vision error: ${result.responses[0].error.message}`);
    }

    const annotation = result.responses[0].fullTextAnnotation;
    if (!annotation) {
        return { text: '', confidence: 0, words: [] };
    }

    // Convert Google format to Tesseract-compatible format
    const words = [];
    annotation.pages.forEach(page => {
        page.blocks.forEach(block => {
            block.paragraphs.forEach(paragraph => {
                paragraph.words.forEach(word => {
                    const wordText = word.symbols.map(s => s.text).join('');
                    const vertices = word.boundingBox.vertices;
                    words.push({
                        text: wordText,
                        confidence: Math.round((word.confidence || 0.95) * 100),
                        bbox: {
                            x0: Math.min(...vertices.map(v => v.x || 0)),
                            y0: Math.min(...vertices.map(v => v.y || 0)),
                            x1: Math.max(...vertices.map(v => v.x || 0)),
                            y1: Math.max(...vertices.map(v => v.y || 0))
                        }
                    });
                });
            });
        });
    });

    return {
        text: annotation.text,
        confidence: 95,
        words: words
    };
}

// Azure Computer Vision API
async function performAzureOCR(imageData, language, pageId) {
    const apiKey = apiKeys.azure;
    if (!apiKey) {
        throw new Error('Azure API key required. Please add it in the settings.');
    }

    updatePageStatus(pageId, 'processing', '⏳ Azure Vision processing...');

    // Convert to blob
    const response = await fetch(imageData);
    const blob = await response.blob();

    // Azure Computer Vision endpoint (you may need to adjust the region)
    const endpoint = 'https://eastus.api.cognitive.microsoft.com/vision/v3.2/read/analyze';

    const ocrResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/octet-stream'
        },
        body: blob
    });

    if (!ocrResponse.ok) {
        throw new Error(`Azure API error: ${ocrResponse.status} ${ocrResponse.statusText}`);
    }

    // Get the operation location
    const operationLocation = ocrResponse.headers.get('Operation-Location');

    // Poll for results
    let result;
    let attempts = 0;
    do {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        updatePageStatus(pageId, 'processing', `⏳ Azure processing... ${attempts + 1}s`);

        const resultResponse = await fetch(operationLocation, {
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey
            }
        });

        result = await resultResponse.json();
        attempts++;
    } while (result.status === 'running' && attempts < 30);

    if (result.status !== 'succeeded') {
        throw new Error('Azure OCR processing failed or timed out');
    }

    // Convert Azure format to Tesseract-compatible format
    const words = [];
    let allText = '';

    result.analyzeResult.readResults.forEach(page => {
        page.lines.forEach(line => {
            line.words.forEach(word => {
                const bbox = word.boundingBox;
                words.push({
                    text: word.text,
                    confidence: Math.round((word.confidence || 0.95) * 100),
                    bbox: {
                        x0: Math.min(bbox[0], bbox[2], bbox[4], bbox[6]),
                        y0: Math.min(bbox[1], bbox[3], bbox[5], bbox[7]),
                        x1: Math.max(bbox[0], bbox[2], bbox[4], bbox[6]),
                        y1: Math.max(bbox[1], bbox[3], bbox[5], bbox[7])
                    }
                });
            });
            allText += line.text + '\n';
        });
    });

    return {
        text: allText.trim(),
        confidence: 95,
        words: words
    };
}

async function processAllPages() {
    for (const page of pages) {
        if (page.status === 'pending' || page.status === 'error') {
            await processPageOCR(page.id);
        }
    }
}

function updatePageStatus(pageId, status, message) {
    const page = pages.find(p => p.id === pageId);

    if (page) {
        page.status = status;

        // Update current page display if this is the current page being viewed
        if (page.id === pages[currentPageIndex].id) {
            const statusEl = document.getElementById('current-page-status');
            if (statusEl) {
                statusEl.className = `page-status status-${status}`;
                statusEl.textContent = message;
            }
        }
    }
}

// Global variable to store selected text
let selectedTextFromBox = '';
let selectedTextBoxes = [];

// Add keyboard event listener for Ctrl+C
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'c' && selectedTextFromBox) {
        e.preventDefault();
        copySelectedText();
    }

    // ESC to clear selection
    if (e.key === 'Escape') {
        clearTextSelection();
    }
});

// Function to copy selected text
function copySelectedText() {
    if (!selectedTextFromBox) {
        showError('No text selected. Click on a text box first.');
        return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(selectedTextFromBox).then(() => {
            showSuccess(`Copied "${selectedTextFromBox}" to clipboard!`);
        }).catch(() => {
            // Fallback for clipboard API failure
            copyTextFallback(selectedTextFromBox);
        });
    } else {
        // Fallback for older browsers
        copyTextFallback(selectedTextFromBox);
    }
}

// Function to clear text selection
function clearTextSelection() {
    document.querySelectorAll('.text-box').forEach(box => box.classList.remove('selected'));
    selectedTextFromBox = '';
    selectedTextBoxes = [];
}

// Function to update selected text from multiple boxes
function updateSelectedText() {
    if (selectedTextBoxes.length === 0) {
        selectedTextFromBox = '';
        return;
    }

    if (selectedTextBoxes.length === 1) {
        selectedTextFromBox = selectedTextBoxes[0].text;
        showSuccess(`Selected: "${selectedTextFromBox}" (Press Ctrl+C to copy)`);
        return;
    }

    // Sort selected boxes by position (top to bottom, left to right)
    const sortedBoxes = selectedTextBoxes.slice().sort((a, b) => {
        const yDiff = a.bbox.y0 - b.bbox.y0;
        if (Math.abs(yDiff) < 15) { // Same line threshold
            return a.bbox.x0 - b.bbox.x0;
        }
        return yDiff;
    });

    // Combine text intelligently
    let combinedText = '';
    let lastY = -1;

    sortedBoxes.forEach((box, index) => {
        if (index > 0) {
            // Check if this word is on a new line
            if (Math.abs(box.bbox.y0 - lastY) > 15) {
                combinedText += '\n';
            } else {
                combinedText += ' ';
            }
        }
        combinedText += box.text;
        lastY = box.bbox.y0;
    });

    selectedTextFromBox = combinedText;
    showSuccess(`Selected ${selectedTextBoxes.length} words: "${combinedText}" (Press Ctrl+C to copy)`);
}

function createTextOverlay(overlayId, ocrData) {
    const overlay = document.getElementById(`${overlayId === 'current-page' ? 'current-page-overlay' : `overlay-${overlayId}`}`);
    if (!overlay) return;

    overlay.innerHTML = '';

    if (!showTextOverlay) return;

    // For pagination, we need to find the page differently
    let page;
    if (overlayId === 'current-page') {
        page = pages[currentPageIndex];
    } else {
        page = pages.find(p => p.id === overlayId);
    }

    const img = overlay.parentElement.querySelector('.page-image');
    if (!img) return;

    // Use the original processing dimensions for consistent coordinate mapping
    let originalWidth, originalHeight;
    if (page && page.originalWidth && page.originalHeight) {
        // Use stored original dimensions from processing
        originalWidth = page.originalWidth;
        originalHeight = page.originalHeight;
    } else {
        // Fallback to natural image dimensions
        originalWidth = img.naturalWidth;
        originalHeight = img.naturalHeight;
    }

    const scaleX = img.clientWidth / originalWidth;
    const scaleY = img.clientHeight / originalHeight;

    ocrData.words.forEach((word, index) => {
        if (word.confidence > 30) { // Only show confident words
            const textBox = document.createElement('div');
            textBox.className = 'text-box';
            textBox.title = `"${word.text}" - Confidence: ${Math.round(word.confidence)}% (Click to select, Ctrl+C to copy)`;

            // Store the word text as a data attribute
            textBox.dataset.wordText = word.text;
            textBox.dataset.confidence = word.confidence;

            const bbox = word.bbox;
            textBox.style.left = (bbox.x0 * scaleX) + 'px';
            textBox.style.top = (bbox.y0 * scaleY) + 'px';
            textBox.style.width = ((bbox.x1 - bbox.x0) * scaleX) + 'px';
            textBox.style.height = ((bbox.y1 - bbox.y0) * scaleY) + 'px';
            textBox.style.fontSize = Math.max(10, (bbox.y1 - bbox.y0) * scaleY * 0.8) + 'px';

            textBox.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (e.shiftKey || e.ctrlKey) {
                    // Multi-selection mode
                    const isSelected = textBox.classList.contains('selected');

                    if (isSelected) {
                        // Deselect this box
                        textBox.classList.remove('selected');
                        const boxIndex = selectedTextBoxes.findIndex(box => box.element === textBox);
                        if (boxIndex > -1) {
                            selectedTextBoxes.splice(boxIndex, 1);
                        }
                    } else {
                        // Add to selection
                        textBox.classList.add('selected');
                        selectedTextBoxes.push({
                            element: textBox,
                            text: word.text,
                            bbox: bbox,
                            confidence: word.confidence
                        });
                    }

                    // Update combined text
                    updateSelectedText();
                } else {
                    // Single selection mode (clear others first)
                    document.querySelectorAll('.text-box').forEach(box => box.classList.remove('selected'));
                    selectedTextBoxes = [];

                    // Select this text box
                    textBox.classList.add('selected');
                    selectedTextBoxes.push({
                        element: textBox,
                        text: word.text,
                        bbox: bbox,
                        confidence: word.confidence
                    });

                    // Store the selected text globally
                    selectedTextFromBox = word.text;

                    // Show feedback to user
                    showSuccess(`Selected: "${word.text}" (Press Ctrl+C to copy, Shift+Click for multi-select)`);
                }
            });

            overlay.appendChild(textBox);
        }
    });
}

function toggleTextOverlays() {
    showTextOverlay = !showTextOverlay;
    toggleOverlay.classList.toggle('active', showTextOverlay);

    // Refresh current page display to show/hide overlays
    displayCurrentPage();
}

async function exportToPDF() {
    const pagesWithOCR = pages.filter(p => p.ocrResult && p.status === 'completed');
    if (pagesWithOCR.length === 0) {
        showError('Please perform OCR on at least one page successfully before exporting.');
        return;
    }

    // Show info about skipped pages
    const totalPages = pages.length;
    const skippedPages = totalPages - pagesWithOCR.length;
    if (skippedPages > 0) {
        showSuccess(`Note: Skipping ${skippedPages} page(s) that failed OCR. Exporting ${pagesWithOCR.length} successful page(s).`);
    }

    try {
        showSuccess('Generating searchable PDF...');
        const { jsPDF } = window.jspdf;

        // Create PDF with proper text layer support
        const pdf = new jsPDF({
            unit: 'pt',
            format: 'a4'
        });

        for (let i = 0; i < pagesWithOCR.length; i++) {
            const page = pagesWithOCR[i];

            if (i > 0) pdf.addPage();

            // Add image first
            const img = new Image();
            img.src = page.imageData;
            await new Promise(resolve => {
                img.onload = () => {
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();

                    // Use the original processing dimensions for coordinate mapping
                    const originalWidth = page.originalWidth || img.width;
                    const originalHeight = page.originalHeight || img.height;
                    const imgAspect = originalWidth / originalHeight;
                    const pdfAspect = pdfWidth / pdfHeight;

                    let imgWidth, imgHeight, offsetX = 0, offsetY = 0;

                    // Calculate image dimensions to fit in PDF while maintaining aspect ratio
                    if (imgAspect > pdfAspect) {
                        imgWidth = pdfWidth;
                        imgHeight = pdfWidth / imgAspect;
                        offsetY = (pdfHeight - imgHeight) / 2;
                    } else {
                        imgHeight = pdfHeight;
                        imgWidth = pdfHeight * imgAspect;
                        offsetX = (pdfWidth - imgWidth) / 2;
                    }

                    // Add the image with pre-compression
                    // Convert canvas to compressed JPEG first
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = originalWidth;
                    tempCanvas.height = originalHeight;

                    // Draw the original image to canvas
                    const tempImg = new Image();
                    tempImg.onload = () => {
                        tempCtx.drawImage(tempImg, 0, 0);

                        const compressedImageData = tempCanvas.toDataURL('image/jpeg', 1.0);

                        // Add the compressed image to PDF
                        pdf.addImage(compressedImageData, 'JPEG', offsetX, offsetY, imgWidth, imgHeight);

                        // Calculate scaling factors to map original image coordinates to PDF coordinates
                        const pdfScaleX = imgWidth / originalWidth;
                        const pdfScaleY = imgHeight / originalHeight;

                        // Add selectable text layers using original OCR coordinates
                        pdf.setTextColor(0, 0, 0); // Black text (will be invisible)

                        // Add individual words for precise selection using original coordinates
                        page.ocrResult.words.forEach(word => {
                            if (word.confidence > 40) { // Only include confident words
                                const bbox = word.bbox;

                                // Use original OCR coordinates and scale them to PDF
                                const wordX = bbox.x0 * pdfScaleX;
                                const wordY = bbox.y0 * pdfScaleY;
                                const wordWidth = (bbox.x1 - bbox.x0) * pdfScaleX;
                                const wordHeight = (bbox.y1 - bbox.y0) * pdfScaleY;

                                // Calculate appropriate font size based on original word height
                                const fontSize = Math.max(10, (bbox.y1 - bbox.y0) * pdfScaleY);
                                pdf.setFontSize(fontSize);

                                // Set font type if available from OCR data
                                const fontInfo = window.OCRLib._getFontFromOCRData(word, page.ocrResult);
                                if (fontInfo.family && fontInfo.style) {
                                    try {
                                        pdf.setFont(fontInfo.family, fontInfo.style);
                                    } catch (e) {
                                        // Fallback to default font if custom font fails
                                        pdf.setFont('helvetica', 'normal');
                                    }
                                } else {
                                    pdf.setFont('helvetica', 'normal');
                                }

                                // Position the word using original coordinates + PDF offset
                                const x = offsetX + wordX;
                                const y = offsetY + wordY + wordHeight; // Add height because PDF uses bottom-left origin

                                // Add word as selectable text
                                pdf.text(word.text, x, y, {
                                    baseline: 'bottom',
                                    renderingMode: 'invisible',
                                    maxWidth: wordWidth
                                });
                            }
                        });

                        resolve();
                    };
                    tempImg.src = page.imageData;
                };
            });
        }

        pdf.save('searchable-ocr-document.pdf');
        showSuccess(`Searchable PDF exported successfully with ${pagesWithOCR.length} page(s)! Text is now selectable in PDF viewers.`);

    } catch (error) {
        console.error('PDF export error:', error);
        showError('Failed to export PDF. Please try again.');
    }
}

// Helper function to group words into lines
function groupWordsByLines(words) {
    if (!words || words.length === 0) return [];

    // Sort words by vertical position first, then horizontal
    const sortedWords = words.slice().sort((a, b) => {
        const yDiff = a.bbox.y0 - b.bbox.y0;
        if (Math.abs(yDiff) < 10) { // Same line threshold
            return a.bbox.x0 - b.bbox.x0;
        }
        return yDiff;
    });

    const lines = [];
    let currentLine = { words: [], y: sortedWords[0].bbox.y0 };

    sortedWords.forEach(word => {
        if (word.confidence > 30) {
            // Check if word belongs to current line (within vertical threshold)
            if (Math.abs(word.bbox.y0 - currentLine.y) < 15) {
                currentLine.words.push(word);
            } else {
                // Start new line
                if (currentLine.words.length > 0) {
                    lines.push(currentLine);
                }
                currentLine = { words: [word], y: word.bbox.y0 };
            }
        }
    });

    // Add the last line
    if (currentLine.words.length > 0) {
        lines.push(currentLine);
    }

    return lines;
}

// Helper function to calculate bounding box for a line of words
function calculateLineBoundingBox(words) {
    if (words.length === 0) return { x0: 0, y0: 0, x1: 0, y1: 0 };

    let minX = words[0].bbox.x0;
    let minY = words[0].bbox.y0;
    let maxX = words[0].bbox.x1;
    let maxY = words[0].bbox.y1;

    words.forEach(word => {
        minX = Math.min(minX, word.bbox.x0);
        minY = Math.min(minY, word.bbox.y0);
        maxX = Math.max(maxX, word.bbox.x1);
        maxY = Math.max(maxY, word.bbox.y1);
    });

    return { x0: minX, y0: minY, x1: maxX, y1: maxY };
}

/**
 * Convert an image, TIFF, or PDF blob to a searchable PDF blob
 * @param {Blob} blob - File blob (JPEG, PNG, TIFF, PDF, etc.)
 * @param {Object} apiConfig - OCR API configuration
 * @param {string} apiConfig.engine - OCR engine ('tesseract', 'ocr.space', 'google', 'azure')
 * @param {string} apiConfig.language - Language code ('eng', 'chi_sim', etc.)
 * @param {Object} apiConfig.apiKeys - API keys object for cloud services
 * @param {number} apiConfig.compressionQuality - JPEG compression quality (0.1-1.0, default: 0.7)
 * @returns {Promise<Blob>} - Searchable PDF blob
 */
async function convert2searchable(blob, apiConfig = {}) {
    // Use the OCR library for processing
    return await window.OCRLib.convert2searchable(blob, apiConfig);
}

function exportAllText() {
    const allText = pages
        .filter(p => p.ocrResult)
        .map(p => `=== Page ${p.id} ===\n${p.ocrResult.text.trim()}\n`)
        .join('\n');

    if (!allText) {
        showError('No OCR text available to export.');
        return;
    }

    const blob = new Blob([allText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadPageText(pageId) {
    const page = pages.find(p => p.id === pageId);
    if (!page || !page.ocrResult) {
        showError('No OCR text available for this page.');
        return;
    }

    const blob = new Blob([page.ocrResult.text.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${pageId}-text.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyToClipboard() {
    const extractedText = resultText.textContent;
    if (extractedText) {
        navigator.clipboard.writeText(extractedText).then(() => {
            showSuccess('Text copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = extractedText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showSuccess('Text copied to clipboard!');
        });
    }
}

function downloadText() {
    const extractedText = resultText.textContent;
    if (extractedText) {
        const blob = new Blob([extractedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'extracted-text.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

function showError(message) {
    errorContainer.innerHTML = `<div class="error">${message}</div>`;
}

function showSuccess(message) {
    errorContainer.innerHTML = `<div style="color: green; background-color: #e6ffe6; border: 1px solid #ccffcc; padding: 10px; border-radius: 5px; margin: 10px 0;">${message}</div>`;
    setTimeout(() => {
        errorContainer.innerHTML = '';
    }, 3000);
}

function clearError() {
    errorContainer.innerHTML = '';
}

// Test function for convert2searchable API
async function testConvert2Searchable(file) {
    try {
        showSuccess('🧪 Testing convert2searchable API...');

        // Get current API configuration
        const engine = engineSelect.value;
        const language = languageSelect.value;

        const apiConfig = {
            engine: engine,
            language: language,
            apiKeys: apiKeys,
            compressionQuality: 1.0
        };

        // Convert file to blob if needed and ensure proper MIME type
        let blob;
        if (file instanceof Blob) {
            blob = file;
        } else {
            blob = new Blob([file], { type: file.type || 'application/octet-stream' });
        }

        // Add MIME type if missing
        if (!blob.type || blob.type === 'application/octet-stream') {
            const fileName = file.name ? file.name.toLowerCase() : '';
            if (fileName.endsWith('.pdf')) {
                blob = new Blob([blob], { type: 'application/pdf' });
            } else if (fileName.endsWith('.tiff') || fileName.endsWith('.tif')) {
                blob = new Blob([blob], { type: 'image/tiff' });
            } else if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
                const ext = fileName.split('.').pop();
                blob = new Blob([blob], { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
            }
        }

        console.log('File info:', {
            name: file.name,
            size: blob.size,
            type: blob.type,
            engine: engine,
            language: language
        });

        showSuccess('🔄 Converting file to searchable PDF...');

        // Call the convert2searchable API
        const searchablePdfBlob = await convert2searchable(blob, apiConfig);

        // Generate filename based on original file
        const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        const filename = `${originalName}_searchable.pdf`;

        // Create download link and trigger download
        const url = URL.createObjectURL(searchablePdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showSuccess(`✅ Test completed! Searchable PDF downloaded as: ${filename}`);

        // Show processing summary using metadata
        if (searchablePdfBlob.metadata) {
            const { totalPages, successfulPages, failedPages } = searchablePdfBlob.metadata;

            if (failedPages > 0) {
                showSuccess(`📋 Processing Summary: ${successfulPages}/${totalPages} pages successfully processed. ${failedPages} page(s) were skipped due to OCR failures.`);
            } else {
                showSuccess(`📋 Processing Summary: All ${successfulPages} page(s) successfully processed!`);
            }
        }

        // Show file size info
        const originalSizeKB = Math.round(file.size / 1024);
        const pdfSizeKB = Math.round(searchablePdfBlob.size / 1024);
        showSuccess(`📊 File sizes - Original: ${originalSizeKB}KB, Searchable PDF: ${pdfSizeKB}KB`);

    } catch (error) {
        console.error('Test conversion error:', error);
        showError(`❌ Test conversion failed: ${error.message}`);
    }
}

// Text area functions for the right panel
function updatePageTextArea(currentPage) {
    const textArea = document.getElementById('pageTextArea');
    if (!textArea) return;

    if (currentPage.ocrResult && currentPage.ocrResult.text) {
        textArea.value = currentPage.ocrResult.text;
        textArea.placeholder = 'OCR text for current page';
    } else {
        textArea.value = '';
        textArea.placeholder = currentPage.status === 'completed'
            ? 'No text detected in this page'
            : 'OCR text will appear here when processing is complete...';
    }
}

function copyPageText() {
    const textArea = document.getElementById('pageTextArea');
    if (!textArea || !textArea.value.trim()) {
        showError('No text available to copy');
        return;
    }

    textArea.select();
    navigator.clipboard.writeText(textArea.value).then(() => {
        showSuccess('Page text copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy text:', err);
        showError('Failed to copy text to clipboard');
    });
}

function downloadPageText() {
    const textArea = document.getElementById('pageTextArea');
    if (!textArea || !textArea.value.trim()) {
        showError('No text available to download');
        return;
    }

    const currentPage = pages[currentPageIndex];
    let filename = 'page-text.txt';

    if (currentDocument.type === 'image') {
        filename = 'image-text.txt';
    } else if (currentDocument.type === 'tiff') {
        filename = currentDocument.pageCount === 1 ? 'tiff-text.txt' : `tiff-page-${currentPage.id}-text.txt`;
    } else {
        filename = `page-${currentPage.id}-text.txt`;
    }

    const blob = new Blob([textArea.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    showSuccess(`Text downloaded as: ${filename}`);
}