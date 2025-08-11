/**
 * OCR Library - Standalone OCR and PDF Processing Library
 * 
 * This library provides OCR functionality and searchable PDF generation
 * that can be used independently of any UI framework.
 * 
 * Dependencies:
 * - Tesseract.js (for client-side OCR)
 * - PDF.js (for PDF processing)
 * - jsPDF (for PDF generation)
 * - UTIF.js (for TIFF processing)
 * 
 * @version 1.0.0
 */

class OCRLibrary {
    constructor() {
        this.defaultConfig = {
            engine: 'tesseract',
            language: 'eng',
            apiKeys: {},
            compressionQuality: 0.7
        };
    }

    /**
     * Convert an image, TIFF, or PDF blob to a searchable PDF blob
     * @param {Blob} blob - File blob (JPEG, PNG, TIFF, PDF, etc.)
     * @param {Object} apiConfig - OCR API configuration
     * @param {string} apiConfig.engine - OCR engine ('tesseract', 'ocr.space', 'google', 'azure')
     * @param {string} apiConfig.language - Language code ('eng', 'chi_sim', etc.)
     * @param {Object} apiConfig.apiKeys - API keys object for cloud services
     * @param {number} apiConfig.compressionQuality - JPEG compression quality (0.1-1.0, default: 0.7)
     * @param {Function} progressCallback - Optional callback for progress updates
     * @returns {Promise<Blob>} - Searchable PDF blob with metadata
     */
    async convert2searchable(blob, apiConfig = {}, progressCallback = null) {
        try {
            // Merge with default configuration
            const config = { ...this.defaultConfig, ...apiConfig };

            this._notifyProgress(progressCallback, 'Analyzing file type...', 5);

            // Detect file type
            const fileType = blob.type;
            const isPDF = fileType === 'application/pdf';
            const isTIFF = fileType === 'image/tiff' || fileType === 'image/tif';
            const isImage = fileType.startsWith('image/');

            let pageDataArray = [];

            this._notifyProgress(progressCallback, 'Extracting pages...', 10);

            if (isPDF) {
                pageDataArray = await this._convertPDFToPageData(blob);
            } else if (isTIFF) {
                pageDataArray = await this._convertTIFFToPageData(blob);
            } else if (isImage) {
                pageDataArray = await this._convertImageToPageData(blob);
            } else {
                throw new Error('Unsupported file type. Please provide an image, TIFF, or PDF file.');
            }

            // Check if pageDataArray is valid
            if (!pageDataArray || pageDataArray.length === 0) {
                throw new Error('Failed to extract pages from the file. The file may be corrupted or unsupported.');
            }

            this._notifyProgress(progressCallback, `Processing ${pageDataArray.length} page(s) with OCR...`, 20);

            // First, perform OCR on all pages and collect successful results
            const successfulPages = [];
            let failedCount = 0;

            for (let i = 0; i < pageDataArray.length; i++) {
                const pageData = pageDataArray[i];
                const progress = 20 + (i / pageDataArray.length) * 60; // 20-80% for OCR

                this._notifyProgress(progressCallback, `OCR processing page ${i + 1}/${pageDataArray.length}...`, progress);

                // Validate page data
                if (!pageData || !pageData.dataURL) {
                    console.warn(`Skipping page ${i + 1}: Invalid page data`);
                    failedCount++;
                    continue;
                }

                // Perform OCR on this page
                let ocrResult;
                try {
                    switch (config.engine) {
                        case 'tesseract':
                            ocrResult = await this._performTesseractOCRForBlob(pageData.dataURL, config.language);
                            break;
                        case 'ocr.space':
                            ocrResult = await this._performOCRSpaceOCRForBlob(await this._dataURLToBlob(pageData.dataURL), config.language);
                            break;
                        case 'google':
                            ocrResult = await this._performGoogleOCRForBlob(pageData.dataURL, config.language, config.apiKeys.google);
                            break;
                        case 'azure':
                            ocrResult = await this._performAzureOCRForBlob(await this._dataURLToBlob(pageData.dataURL), config.language, config.apiKeys.azure);
                            break;
                        default:
                            throw new Error(`Unsupported OCR engine: ${config.engine}`);
                    }

                    // Only include pages with successful OCR (has meaningful text)
                    if (ocrResult && ocrResult.text && ocrResult.text.trim().length > 0) {
                        successfulPages.push({
                            pageData: pageData,
                            ocrResult: ocrResult,
                            pageNumber: i + 1
                        });
                    } else {
                        console.warn(`Page ${i + 1}: OCR completed but no text detected`);
                        failedCount++;
                    }
                } catch (ocrError) {
                    console.warn(`OCR failed for page ${i + 1}:`, ocrError);
                    failedCount++;
                }
            }

            // Check if we have any successful pages
            if (successfulPages.length === 0) {
                throw new Error('OCR failed on all pages. No searchable content could be extracted.');
            }

            // Log summary of processing
            if (failedCount > 0) {
                console.log(`Processed ${pageDataArray.length} pages: ${successfulPages.length} successful, ${failedCount} failed/skipped`);
            }

            this._notifyProgress(progressCallback, 'Generating searchable PDF...', 85);

            // Create searchable PDF with only successful pages
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                unit: 'pt',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Process only successful pages
            for (let i = 0; i < successfulPages.length; i++) {
                const { pageData, ocrResult } = successfulPages[i];
                const progress = 85 + (i / successfulPages.length) * 10; // 85-95% for PDF generation

                this._notifyProgress(progressCallback, `Adding page ${i + 1}/${successfulPages.length} to PDF...`, progress);

                if (i > 0) pdf.addPage();

                // Calculate image dimensions to fit in PDF while maintaining aspect ratio
                const imgAspect = (pageData.width && pageData.height) ? pageData.width / pageData.height : 1;
                const pdfAspect = pdfWidth / pdfHeight;

                let imgWidth, imgHeight, offsetX = 0, offsetY = 0;

                if (imgAspect > pdfAspect) {
                    imgWidth = pdfWidth;
                    imgHeight = pdfWidth / imgAspect;
                    offsetY = (pdfHeight - imgHeight) / 2;
                } else {
                    imgHeight = pdfHeight;
                    imgWidth = pdfHeight * imgAspect;
                    offsetX = (pdfWidth - imgWidth) / 2;
                }

                // Compress image before adding to PDF
                const compressedImageData = await this._compressImageData(
                    pageData.dataURL,
                    pageData.width || 800,
                    pageData.height || 600,
                    config.compressionQuality
                );

                // Add compressed image to PDF
                pdf.addImage(compressedImageData, 'JPEG', offsetX, offsetY, imgWidth, imgHeight);

                // Add invisible text layer for searchability
                if (ocrResult && ocrResult.words && Array.isArray(ocrResult.words) && ocrResult.words.length > 0) {
                    const pdfScaleX = imgWidth / (pageData.width || 800);
                    const pdfScaleY = imgHeight / (pageData.height || 600);

                    pdf.setTextColor(0, 0, 0); // Black text (will be invisible)

                    ocrResult.words.forEach((word, wordIndex) => {
                        try {
                            if (word && word.confidence > 40 && word.bbox && word.text) {
                                const bbox = word.bbox;
                                const fontSize = Math.max(10, (bbox.y1 - bbox.y0) * pdfScaleY);

                                pdf.setFontSize(fontSize);

                                // Set font type if available from OCR data
                                const fontInfo = this._getFontFromOCRData(word, ocrResult);
                                if (fontInfo && fontInfo.family && fontInfo.style) {
                                    try {
                                        pdf.setFont(fontInfo.family, fontInfo.style);
                                    } catch (e) {
                                        // Fallback to default font if custom font fails
                                        pdf.setFont('helvetica', 'normal');
                                    }
                                } else {
                                    pdf.setFont('helvetica', 'normal');
                                }

                                const x = offsetX + (bbox.x0 * pdfScaleX);
                                const y = offsetY + (bbox.y0 * pdfScaleY) + ((bbox.y1 - bbox.y0) * pdfScaleY);
                                const maxWidth = (bbox.x1 - bbox.x0) * pdfScaleX;

                                pdf.text(word.text, x, y, {
                                    baseline: 'bottom',
                                    renderingMode: 'invisible',
                                    maxWidth: maxWidth
                                });
                            }
                        } catch (wordError) {
                            console.warn(`Error processing word ${wordIndex} on page ${i + 1}:`, wordError);
                            // Continue with next word
                        }
                    });
                }
            }

            this._notifyProgress(progressCallback, 'Finalizing PDF...', 95);

            // Convert PDF to blob
            const pdfArrayBuffer = pdf.output('arraybuffer');
            const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });

            // Return blob with metadata
            pdfBlob.metadata = {
                totalPages: pageDataArray.length,
                successfulPages: successfulPages.length,
                failedPages: failedCount,
                engine: config.engine,
                language: config.language
            };

            this._notifyProgress(progressCallback, 'Conversion completed!', 100);

            return pdfBlob;

        } catch (error) {
            console.error('convert2searchable error:', error);
            throw new Error(`Failed to convert file to searchable PDF: ${error.message}`);
        }
    }

    /**
     * Perform OCR on a single image and return structured results
     * @param {Blob} blob - Image blob
     * @param {Object} config - OCR configuration
     * @returns {Promise<Object>} - OCR results with text, confidence, and word positions
     */
    async performOCR(blob, config = {}) {
        const mergedConfig = { ...this.defaultConfig, ...config };

        const pageData = await this._convertImageToPageData(blob);
        if (!pageData || pageData.length === 0) {
            throw new Error('Failed to process image data');
        }

        const imageData = pageData[0];

        switch (mergedConfig.engine) {
            case 'tesseract':
                return await this._performTesseractOCRForBlob(imageData.dataURL, mergedConfig.language);
            case 'ocr.space':
                return await this._performOCRSpaceOCRForBlob(await this._dataURLToBlob(imageData.dataURL), mergedConfig.language);
            case 'google':
                return await this._performGoogleOCRForBlob(imageData.dataURL, mergedConfig.language, mergedConfig.apiKeys.google);
            case 'azure':
                return await this._performAzureOCRForBlob(await this._dataURLToBlob(imageData.dataURL), mergedConfig.language, mergedConfig.apiKeys.azure);
            default:
                throw new Error(`Unsupported OCR engine: ${mergedConfig.engine}`);
        }
    }

    // Private helper methods
    _notifyProgress(callback, message, percentage) {
        if (typeof callback === 'function') {
            callback(message, percentage);
        }
    }

    // Helper function to convert PDF to page data array
    async _convertPDFToPageData(blob) {
        try {
            const arrayBuffer = await blob.arrayBuffer();
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                throw new Error('Empty or invalid PDF file');
            }

            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            if (!pdf || pdf.numPages === 0) {
                throw new Error('PDF has no pages');
            }

            const pageDataArray = [];

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                try {
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

                    pageDataArray.push({
                        dataURL: canvas.toDataURL(),
                        width: canvas.width,
                        height: canvas.height
                    });
                } catch (pageError) {
                    console.warn(`Failed to process PDF page ${pageNum}:`, pageError);
                    // Continue with other pages
                }
            }

            if (pageDataArray.length === 0) {
                throw new Error('Failed to extract any pages from PDF');
            }

            return pageDataArray;
        } catch (error) {
            console.error('Error in convertPDFToPageData:', error);
            throw new Error(`Failed to process PDF: ${error.message}`);
        }
    }

    // Helper function to convert TIFF to page data array
    async _convertTIFFToPageData(blob) {
        try {
            if (typeof UTIF === 'undefined') {
                throw new Error('UTIF library not available for TIFF processing');
            }

            const arrayBuffer = await blob.arrayBuffer();
            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                throw new Error('Empty or invalid TIFF file');
            }

            const uint8Array = new Uint8Array(arrayBuffer);
            const ifds = UTIF.decode(uint8Array);

            if (!ifds || ifds.length === 0) {
                throw new Error('No pages found in TIFF file');
            }

            const pageDataArray = [];

            for (let i = 0; i < ifds.length; i++) {
                try {
                    const ifd = ifds[i];
                    UTIF.decodeImage(uint8Array, ifd);
                    const rgba = UTIF.toRGBA8(ifd);

                    if (!ifd.width || !ifd.height || ifd.width === 0 || ifd.height === 0) {
                        console.warn(`Skipping TIFF page ${i + 1}: Invalid dimensions`);
                        continue;
                    }

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = ifd.width;
                    canvas.height = ifd.height;

                    const imageData = new ImageData(new Uint8ClampedArray(rgba), ifd.width, ifd.height);
                    ctx.putImageData(imageData, 0, 0);

                    pageDataArray.push({
                        dataURL: canvas.toDataURL('image/png'),
                        width: canvas.width,
                        height: canvas.height
                    });
                } catch (pageError) {
                    console.warn(`Failed to process TIFF page ${i + 1}:`, pageError);
                    // Continue with other pages
                }
            }

            if (pageDataArray.length === 0) {
                throw new Error('Failed to extract any pages from TIFF file');
            }

            return pageDataArray;
        } catch (error) {
            console.error('Error in convertTIFFToPageData:', error);
            throw new Error(`Failed to process TIFF: ${error.message}`);
        }
    }

    // Helper function to convert image to page data array
    async _convertImageToPageData(blob) {
        try {
            const dataURL = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(new Error('Failed to read image file'));
                reader.readAsDataURL(blob);
            });

            if (!dataURL) {
                throw new Error('Failed to convert image to data URL');
            }

            const { width, height } = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    if (img.width === 0 || img.height === 0) {
                        reject(new Error('Image has invalid dimensions'));
                    } else {
                        resolve({ width: img.width, height: img.height });
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = dataURL;
            });

            return [{
                dataURL: dataURL,
                width: width,
                height: height
            }];
        } catch (error) {
            console.error('Error in convertImageToPageData:', error);
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }

    // Helper function to compress image data
    async _compressImageData(dataURL, width, height, quality) {
        return new Promise((resolve, reject) => {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = width;
            tempCanvas.height = height;

            const tempImg = new Image();
            tempImg.onload = () => {
                tempCtx.drawImage(tempImg, 0, 0);
                const compressed = tempCanvas.toDataURL('image/jpeg', quality);
                resolve(compressed);
            };
            tempImg.onerror = reject;
            tempImg.src = dataURL;
        });
    }

    // Helper function to convert data URL to blob
    async _dataURLToBlob(dataURL) {
        const response = await fetch(dataURL);
        return await response.blob();
    }

    // OCR Engine implementations
    async _performTesseractOCRForBlob(imageData, language) {
        const worker = await Tesseract.createWorker(language, 1);
        const { data } = await worker.recognize(imageData);
        await worker.terminate();
        return data;
    }

    async _performOCRSpaceOCRForBlob(blob, language) {
        const langMap = {
            'eng': 'eng', 'chi_sim': 'chs', 'chi_tra': 'cht',
            'spa': 'spa', 'fra': 'fre', 'deu': 'ger',
            'jpn': 'jpn', 'rus': 'rus'
        };

        const formData = new FormData();
        formData.append('file', blob, 'image.png');
        formData.append('language', langMap[language] || 'eng');
        formData.append('isOverlayRequired', 'true');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');

        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            headers: { 'apikey': 'helloworld' },
            body: formData
        });

        const result = await response.json();
        if (result.IsErroredOnProcessing) {
            throw new Error(result.ErrorMessage || 'OCR.space processing failed');
        }

        const parsedResult = result.ParsedResults[0];
        const lines = parsedResult.TextOverlay?.Lines || [];
        const words = [];
        let allText = '';

        lines.forEach(line => {
            line.Words.forEach(word => {
                words.push({
                    text: word.WordText,
                    confidence: 90,
                    bbox: {
                        x0: word.Left, y0: word.Top,
                        x1: word.Left + word.Width, y1: word.Top + word.Height
                    }
                });
                allText += word.WordText + ' ';
            });
            allText += '\n';
        });

        return { text: allText.trim(), confidence: 90, words: words };
    }

    async _performGoogleOCRForBlob(imageData, language, apiKey) {
        if (!apiKey) {
            throw new Error('Google API key required');
        }

        const langMap = {
            'eng': 'en', 'chi_sim': 'zh', 'chi_tra': 'zh-TW',
            'spa': 'es', 'fra': 'fr', 'deu': 'de',
            'jpn': 'ja', 'rus': 'ru'
        };

        const base64Data = imageData.split(',')[1];
        const requestBody = {
            requests: [{
                image: { content: base64Data },
                features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
                imageContext: { languageHints: [langMap[language] || 'en'] }
            }]
        };

        const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

        return { text: annotation.text, confidence: 95, words: words };
    }

    async _performAzureOCRForBlob(blob, language, apiKey) {
        if (!apiKey) {
            throw new Error('Azure API key required');
        }

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

        const operationLocation = ocrResponse.headers.get('Operation-Location');
        let result;
        let attempts = 0;

        do {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const resultResponse = await fetch(operationLocation, {
                headers: { 'Ocp-Apim-Subscription-Key': apiKey }
            });
            result = await resultResponse.json();
            attempts++;
        } while (result.status === 'running' && attempts < 30);

        if (result.status !== 'succeeded') {
            throw new Error('Azure OCR processing failed or timed out');
        }

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

        return { text: allText.trim(), confidence: 95, words: words };
    }

    // Font handling methods
    _getFontFromOCRData(word, ocrResult) {
        const defaultFont = { family: 'helvetica', style: 'normal' };

        // Try to extract font information if available from different OCR engines
        if (word.font_name || word.fontName) {
            const fontName = (word.font_name || word.fontName).toLowerCase();
            return this._mapToJsPDFFont(fontName);
        }

        // Check if OCR result has font information at page level
        if (ocrResult.blocks) {
            for (const block of ocrResult.blocks) {
                if (block.property && block.property.detectedLanguages) {
                    const lang = block.property.detectedLanguages[0];
                    if (lang && lang.languageCode) {
                        return this._getDefaultFontForLanguage(lang.languageCode);
                    }
                }
            }
        }

        // Check for text style properties
        if (word.is_bold || word.bold) {
            return { family: 'helvetica', style: 'bold' };
        }

        if (word.is_italic || word.italic) {
            return { family: 'helvetica', style: 'italic' };
        }

        return defaultFont;
    }

    _mapToJsPDFFont(fontName) {
        const fontMappings = {
            'arial': { family: 'helvetica', style: 'normal' },
            'helvetica': { family: 'helvetica', style: 'normal' },
            'times': { family: 'times', style: 'normal' },
            'courier': { family: 'courier', style: 'normal' },
            'calibri': { family: 'helvetica', style: 'normal' },
            'georgia': { family: 'times', style: 'normal' },
            'verdana': { family: 'helvetica', style: 'normal' },
            'tahoma': { family: 'helvetica', style: 'normal' },
            'comic': { family: 'helvetica', style: 'normal' },
            'impact': { family: 'helvetica', style: 'bold' },
            'trebuchet': { family: 'helvetica', style: 'normal' }
        };

        for (const [key, value] of Object.entries(fontMappings)) {
            if (fontName.includes(key)) {
                return value;
            }
        }

        const isBold = fontName.includes('bold') || fontName.includes('black') || fontName.includes('heavy');
        const isItalic = fontName.includes('italic') || fontName.includes('oblique');

        let style = 'normal';
        if (isBold && isItalic) {
            style = 'bolditalic';
        } else if (isBold) {
            style = 'bold';
        } else if (isItalic) {
            style = 'italic';
        }

        return { family: 'helvetica', style: style };
    }

    _getDefaultFontForLanguage(languageCode) {
        const languageFonts = {
            'zh': { family: 'helvetica', style: 'normal' },
            'ja': { family: 'helvetica', style: 'normal' },
            'ko': { family: 'helvetica', style: 'normal' },
            'ar': { family: 'helvetica', style: 'normal' },
            'he': { family: 'helvetica', style: 'normal' },
            'hi': { family: 'helvetica', style: 'normal' },
            'th': { family: 'helvetica', style: 'normal' },
            'default': { family: 'helvetica', style: 'normal' }
        };

        return languageFonts[languageCode] || languageFonts.default;
    }
}

// Create global instance for backward compatibility
window.OCRLib = new OCRLibrary();

// Expose the convert2searchable function globally for backward compatibility
window.convert2searchable = (blob, apiConfig, progressCallback) => {
    return window.OCRLib.convert2searchable(blob, apiConfig, progressCallback);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OCRLibrary;
}
