// Document Viewer Application - Professional Edition

// --- DBManager Class ---
class DBManager {
    constructor() {
        this.dbName = 'DocumentViewerDB';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject('Error opening database');
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('appState')) {
                    db.createObjectStore('appState', { keyPath: 'id' });
                }
            };
        });
    }

    async saveState(state) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['appState'], 'readwrite');
            const store = transaction.objectStore('appState');
            // We need to serialize the state properly, removing circular refs or non-clonable objects
            const serializedState = {
                currentPageIndex: state.currentPageIndex,
                pages: state.pages.map(p => ({
                    type: p.type,
                    data: p.data, // Base64 or URL
                    name: p.name,
                    rotation: p.rotation,
                    scale: p.scale,
                    pdfPageNum: p.pdfPageNum,
                    annotations: p.annotations.map(a => {
                        const { image, ...rest } = a; // Exclude image object
                        return rest;
                    })
                }))
            };
            const request = store.put({ id: 'currentState', data: serializedState });

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async loadState() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['appState'], 'readonly');
            const store = transaction.objectStore('appState');
            const request = store.get('currentState');

            request.onsuccess = () => resolve(request.result ? request.result.data : null);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async clearState() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['appState'], 'readwrite');
            const store = transaction.objectStore('appState');
            const request = store.delete('currentState');

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
}

// --- Annotation Classes ---
class Annotation {
    constructor(type, data = {}) {
        this.id = data.id || Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.type = type;
        this.color = data.color || '#ff0000';
        this.lineWidth = data.lineWidth || 2;
        this.selected = false;
    }

    draw(ctx) {
        // Abstract method
    }

    isPointIn(x, y, ctx) {
        return false;
    }
}

class PenAnnotation extends Annotation {
    constructor(data) {
        super('pen', data);
        this.points = data.points || [];
    }

    draw(ctx) {
        if (this.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
    }

    isPointIn(x, y, ctx) {
        if (this.points.length < 2) return false;
        // Simple proximity check for performance
        const threshold = this.lineWidth + 5;
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            // Check distance from point (x,y) to segment p1-p2
            const dist = this.distToSegment({ x, y }, p1, p2);
            if (dist < threshold) return true;
        }
        return false;
    }

    distToSegment(p, v, w) {
        const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
        if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
    }
}

class TextAnnotation extends Annotation {
    constructor(data) {
        super('text', data);
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.text = data.text || '';
        this.fontSize = data.fontSize || 20;
        this.fontFamily = data.fontFamily || 'Arial';
    }

    draw(ctx) {
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        if (this.selected) {
            const metrics = ctx.measureText(this.text);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y - this.fontSize, metrics.width, this.fontSize + 5);
        }
    }

    isPointIn(x, y, ctx) {
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        const metrics = ctx.measureText(this.text);
        const height = this.fontSize;
        return x >= this.x && x <= this.x + metrics.width && y >= this.y - height && y <= this.y + 5;
    }
}

class RectAnnotation extends Annotation {
    constructor(data) {
        super('rect', data);
        this.startX = data.startX || 0;
        this.startY = data.startY || 0;
        this.endX = data.endX || 0;
        this.endY = data.endY || 0;
        this.shapeType = data.shapeType || 'rect'; // rect, ellipse, line, arrow
    }

    draw(ctx) {
        const w = this.endX - this.startX;
        const h = this.endY - this.startY;
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;

        if (this.shapeType === 'ellipse') {
            const centerX = this.startX + w / 2;
            const centerY = this.startY + h / 2;
            ctx.ellipse(centerX, centerY, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.shapeType === 'line') {
            ctx.moveTo(this.startX, this.startY);
            ctx.lineTo(this.endX, this.endY);
            ctx.stroke();
        } else if (this.shapeType === 'arrow') {
            // Draw line
            ctx.moveTo(this.startX, this.startY);
            ctx.lineTo(this.endX, this.endY);
            ctx.stroke();
            // Draw arrowhead
            const angle = Math.atan2(this.endY - this.startY, this.endX - this.startX);
            const arrowLen = 15;
            ctx.beginPath();
            ctx.moveTo(this.endX, this.endY);
            ctx.lineTo(this.endX - arrowLen * Math.cos(angle - Math.PI / 6), this.endY - arrowLen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(this.endX, this.endY);
            ctx.lineTo(this.endX - arrowLen * Math.cos(angle + Math.PI / 6), this.endY - arrowLen * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
        } else {
            // Default rect
            ctx.rect(this.startX, this.startY, w, h);
            ctx.stroke();
        }

        if (this.selected) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(Math.min(this.startX, this.endX) - 5, Math.min(this.startY, this.endY) - 5, Math.abs(w) + 10, Math.abs(h) + 10);
            ctx.setLineDash([]);
        }
    }

    isPointIn(x, y, ctx) {
        const w = this.endX - this.startX;
        const h = this.endY - this.startY;
        // Check if point is near the border
        const outer = { x: Math.min(this.startX, this.endX) - 5, y: Math.min(this.startY, this.endY) - 5, w: Math.abs(w) + 10, h: Math.abs(h) + 10 };
        const inner = { x: Math.min(this.startX, this.endX) + 5, y: Math.min(this.startY, this.endY) + 5, w: Math.abs(w) - 10, h: Math.abs(h) - 10 };

        const inOuter = x >= outer.x && x <= outer.x + outer.w && y >= outer.y && y <= outer.y + outer.h;
        const inInner = x >= inner.x && x <= inner.x + inner.w && y >= inner.y && y <= inner.y + inner.h;

        return inOuter && !inInner;
    }
}

class ImageAnnotation extends Annotation {
    constructor(data) {
        super('image', data);
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.width = data.width || 100;
        this.height = data.height || 100;
        this.imageData = data.imageData;
        this.image = null;
        if (this.imageData) {
            this.image = new Image();
            this.image.src = this.imageData;
        }
    }

    draw(ctx) {
        if (this.image && this.image.complete) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            if (this.selected) {
                // Draw selection border
                ctx.strokeStyle = '#1a73e8';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
                ctx.setLineDash([]);

                // Draw resize handles at corners
                const handleSize = 8;
                ctx.fillStyle = '#1a73e8';
                const corners = [
                    { x: this.x, y: this.y },                          // top-left
                    { x: this.x + this.width, y: this.y },             // top-right
                    { x: this.x, y: this.y + this.height },            // bottom-left
                    { x: this.x + this.width, y: this.y + this.height } // bottom-right
                ];
                corners.forEach(corner => {
                    ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
                });
            }
        }
    }

    isPointIn(x, y, ctx) {
        return x >= this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.height;
    }
}

// --- Page Class ---
class Page {
    constructor(type, data, name) {
        this.type = type; // 'image' (all pages stored as images)
        this.data = data; // image data URL
        this.name = name;
        this.rotation = 0;
        this.scale = 1.0;
        this.annotations = [];
        this.originalImage = null;
    }

    async load() {
        // All pages are images
        if (!this.originalImage) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.originalImage = img;
                    resolve();
                };
                img.src = this.data;
            });
        }
    }

    addAnnotation(annotation) {
        this.annotations.push(annotation);
    }

    removeAnnotation(id) {
        this.annotations = this.annotations.filter(a => a.id !== id);
    }

    getAnnotationAt(x, y, ctx) {
        for (let i = this.annotations.length - 1; i >= 0; i--) {
            if (this.annotations[i].isPointIn(x, y, ctx)) {
                return this.annotations[i];
            }
        }
        return null;
    }
}

// --- Operation Class ---
class Operation {
    static rotate(page, direction) {
        if (direction === 'left') page.rotation = (page.rotation - 90) % 360;
        else page.rotation = (page.rotation + 90) % 360;
        if (page.rotation < 0) page.rotation += 360;
    }

    static zoom(page, factor) {
        page.scale *= factor;
        page.scale = Math.max(0.1, Math.min(5.0, page.scale));
    }
}

// --- DocumentViewer Class ---
class DocumentViewer {
    constructor() {
        this.db = new DBManager();
        this.canvas = document.getElementById('document-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.pages = [];
        this.currentPageIndex = -1;
        this.currentTool = 'select';
        this.currentColor = '#0000ff';
        this.currentLineWidth = 2;
        this.isDrawing = false;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeCorner = null;
        this.resizeStartX = 0;
        this.resizeStartY = 0;
        this.resizeStartWidth = 0;
        this.resizeStartHeight = 0;
        this.selectedAnnotation = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.tempAnnotation = null;

        this.undoStack = [];
        this.redoStack = [];

        this.init();
    }

    get currentPage() {
        return this.pages[this.currentPageIndex] || null;
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.loadInitialState();
    }

    async loadInitialState() {
        try {
            const state = await this.db.loadState();
            if (state && state.pages && state.pages.length > 0) {
                this.pages = [];
                for (const pData of state.pages) {
                    // All pages are stored as images
                    const page = new Page('image', pData.data, pData.name);
                    page.rotation = pData.rotation || 0;
                    page.scale = pData.scale || 1;

                    if (pData.annotations) {
                        page.annotations = pData.annotations.map(aData => {
                            switch (aData.type) {
                                case 'pen': return new PenAnnotation(aData);
                                case 'text': return new TextAnnotation(aData);
                                case 'rect': return new RectAnnotation(aData);
                                case 'image': return new ImageAnnotation(aData);
                                default: return new Annotation(aData.type, aData);
                            }
                        });
                    }

                    await page.load();
                    this.pages.push(page);
                }
                this.currentPageIndex = state.currentPageIndex || 0;
                this.renderCurrentView();
                this.renderThumbnails();
                this.updatePageInfo();
            }
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }

    setupEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const openFileBtn = document.getElementById('openFileBtn');
        if (openFileBtn && fileInput) {
            openFileBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const rotateLeftBtn = document.getElementById('rotateLeftBtn');
        const rotateRightBtn = document.getElementById('rotateRightBtn');
        const fitPageBtn = document.getElementById('fitPageBtn');
        const fitWidthBtn = document.getElementById('fitWidthBtn');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => { this.saveStateToStack(); this.performOperation('zoom', 1.1); });
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { this.saveStateToStack(); this.performOperation('zoom', 0.9); });
        if (rotateLeftBtn) rotateLeftBtn.addEventListener('click', () => { this.saveStateToStack(); this.performOperation('rotate', 'left'); });
        if (rotateRightBtn) rotateRightBtn.addEventListener('click', () => { this.saveStateToStack(); this.performOperation('rotate', 'right'); });
        if (fitPageBtn) fitPageBtn.addEventListener('click', () => this.fitPage());
        if (fitWidthBtn) fitWidthBtn.addEventListener('click', () => this.fitWidth());
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => this.changePage(-1));
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => this.changePage(1));

        const undoBtn = document.getElementById('undoBtn');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

        const redoBtn = document.getElementById('redoBtn');
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.downloadDocument());

        const printBtn = document.getElementById('printBtn');
        if (printBtn) printBtn.addEventListener('click', () => this.printDocument());

        const toggleToolsBtn = document.getElementById('toggleToolsBtn');
        if (toggleToolsBtn) toggleToolsBtn.addEventListener('click', () => {
            const toolbar = document.getElementById('annotationToolbar');
            if (toolbar) toolbar.classList.toggle('hidden');
        });

        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        const saveBtn = document.getElementById('saveBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const removeBtn = document.getElementById('removeBtn');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveDocument());
        if (clearAllBtn) clearAllBtn.addEventListener('click', () => { this.saveStateToStack(); this.clearAll(); });
        if (removeBtn) removeBtn.addEventListener('click', () => { this.saveStateToStack(); this.removePage(); });

        // Tools
        const tools = ['select', 'pen', 'text', 'rect', 'highlight', 'line', 'arrow', 'ellipse', 'signature', 'delete'];
        tools.forEach(tool => {
            const btn = document.querySelector(`[data-tool="${tool}"]`) || document.getElementById(`${tool}Tool`);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Tool clicked:', tool);
                    this.setTool(tool);
                });
            } else {
                console.warn('Tool button not found:', tool);
            }
        });

        // Insert Image button - directly opens file picker
        const insertImageBtn = document.querySelector('[data-tool="image"]') || document.getElementById('insertImageBtn');
        if (insertImageBtn) {
            insertImageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.currentPage) {
                    alert('Please load a document first');
                    return;
                }
                this.setTool('image');
                // Set default position to center of canvas
                this.imageInsertPos = {
                    x: this.canvas.width / (2 * this.currentPage.scale),
                    y: this.canvas.height / (2 * this.currentPage.scale)
                };
                const imageInput = document.getElementById('insertImageInput');
                if (imageInput) imageInput.click();
            });
        }

        // Clear annotations button
        const clearAnnotationsBtn = document.getElementById('clearAnnotationsBtn');
        if (clearAnnotationsBtn) {
            clearAnnotationsBtn.addEventListener('click', () => {
                if (this.currentPage && confirm('Clear all annotations on this page?')) {
                    this.saveStateToStack();
                    this.currentPage.annotations = [];
                    this.renderCurrentView();
                }
            });
        }

        // Insert Image input handler
        const insertImageInput = document.getElementById('insertImageInput');
        if (insertImageInput) {
            insertImageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && this.currentPage && this.imageInsertPos) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const img = new Image();
                        img.onload = () => {
                            this.saveStateToStack();
                            const ann = new ImageAnnotation({
                                x: this.imageInsertPos.x,
                                y: this.imageInsertPos.y,
                                width: img.width / 2,
                                height: img.height / 2,
                                imageData: ev.target.result
                            });
                            ann.image = img;
                            this.currentPage.addAnnotation(ann);
                            this.renderCurrentView();
                            this.saveDocument();
                        };
                        img.src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                }
                e.target.value = '';
            });
        }

        // Signature modal handlers
        this.setupSignatureModal();

        // Canvas Events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Color Picker
        document.querySelectorAll('.color-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
                e.target.classList.add('active');
                this.currentColor = e.target.dataset.color;
            });
        });

        // window.addEventListener('resize', () => this.updateToolbarWidth());
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
        });
    }

    setupSignatureModal() {
        const signatureCanvas = document.getElementById('signatureCanvas');
        const clearSignatureBtn = document.getElementById('clearSignatureBtn');
        const signatureModalOk = document.getElementById('signatureModalOk');
        const signatureModal = document.getElementById('signatureModal');

        if (!signatureCanvas) return;

        const sigCtx = signatureCanvas.getContext('2d');
        let isDrawing = false;

        signatureCanvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            sigCtx.beginPath();
            const rect = signatureCanvas.getBoundingClientRect();
            sigCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        });

        signatureCanvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = signatureCanvas.getBoundingClientRect();
            sigCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
            sigCtx.strokeStyle = '#000';
            sigCtx.lineWidth = 2;
            sigCtx.lineCap = 'round';
            sigCtx.stroke();
        });

        signatureCanvas.addEventListener('mouseup', () => isDrawing = false);
        signatureCanvas.addEventListener('mouseleave', () => isDrawing = false);

        if (clearSignatureBtn) {
            clearSignatureBtn.addEventListener('click', () => {
                sigCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
            });
        }

        if (signatureModalOk) {
            signatureModalOk.addEventListener('click', () => {
                if (!this.currentPage || !this.signatureInsertPos) return;

                const dataURL = signatureCanvas.toDataURL();
                const img = new Image();
                img.onload = () => {
                    this.saveStateToStack();
                    const ann = new ImageAnnotation({
                        x: this.signatureInsertPos.x,
                        y: this.signatureInsertPos.y,
                        width: signatureCanvas.width / 2,
                        height: signatureCanvas.height / 2,
                        imageData: dataURL
                    });
                    ann.image = img;
                    this.currentPage.addAnnotation(ann);
                    this.renderCurrentView();
                    this.saveDocument();
                };
                img.src = dataURL;

                signatureModal.style.display = 'none';
                sigCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
            });
        }
    }

    async handleFileUpload(e) {
        const files = e.target.files;
        if (!files.length) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type === 'application/pdf') {
                await this.loadPdf(file);
            } else if (file.type.startsWith('image/')) {
                await this.loadImage(file);
            }
        }
        // Select the latest added page
        this.currentPageIndex = this.pages.length - 1;
        this.renderCurrentView();
        this.renderThumbnails();
        this.updatePageInfo();
    }

    async loadPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;

        // Render each PDF page to canvas and store as image
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const pdfPage = await pdfDoc.getPage(i);
            const viewport = pdfPage.getViewport({ scale: 1.5 }); // Higher scale for better quality

            // Create temporary canvas to render PDF page
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            const tempCtx = tempCanvas.getContext('2d');

            await pdfPage.render({
                canvasContext: tempCtx,
                viewport: viewport
            }).promise;

            // Convert canvas to image data URL
            const imageData = tempCanvas.toDataURL('image/png');

            // Create page as image type
            const page = new Page('image', imageData, `${file.name} - Page ${i}`);
            await page.load();
            this.pages.push(page);
        }
        if (this.currentPageIndex === -1) this.currentPageIndex = 0;
    }

    arrayBufferToBase64(buffer) {
        return new Promise((resolve) => {
            const blob = new Blob([buffer]);
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    base64ToArrayBuffer(base64) {
        return new Promise((resolve) => {
            // Remove data URL prefix if present
            const base64String = base64.includes(',') ? base64.split(',')[1] : base64;
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            resolve(bytes.buffer);
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    async loadImage(file) {
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onload = (e) => {
                const page = new Page('image', e.target.result, file.name);
                page.load().then(() => {
                    this.pages.push(page);
                    if (this.currentPageIndex === -1) this.currentPageIndex = 0;
                    resolve();
                });
            };
            reader.readAsDataURL(file);
        });
    }

    performOperation(op, arg) {
        if (!this.currentPage) return;

        if (op === 'rotate') {
            Operation.rotate(this.currentPage, arg);
        } else if (op === 'zoom') {
            Operation.zoom(this.currentPage, arg);
        }

        this.renderCurrentView();
        document.getElementById('zoomLevel').textContent = `${Math.round(this.currentPage.scale * 100)}%`;
    }

    fitPage() {
        if (!this.currentPage) return;
        const container = this.canvas.parentElement;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const availableWidth = rect.width - 40; // padding
        const availableHeight = rect.height - 40;

        // All pages are images
        if (!this.currentPage.originalImage) return;

        const w = this.currentPage.originalImage.width;
        const h = this.currentPage.originalImage.height;

        const scaleW = availableWidth / w;
        const scaleH = availableHeight / h;
        this.currentPage.scale = Math.min(scaleW, scaleH);
        this.renderCurrentView();
        document.getElementById('zoomLevel').textContent = `${Math.round(this.currentPage.scale * 100)}%`;
    }

    fitWidth() {
        if (!this.currentPage) return;
        const container = this.canvas.parentElement;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const availableWidth = rect.width - 40;

        // All pages are images
        if (!this.currentPage.originalImage) return;

        const w = this.currentPage.originalImage.width;
        this.currentPage.scale = availableWidth / w;
        this.renderCurrentView();
        document.getElementById('zoomLevel').textContent = `${Math.round(this.currentPage.scale * 100)}%`;
    }

    updatePageInfo() {
        const currentPageEl = document.getElementById('currentPage');
        const totalPagesEl = document.getElementById('totalPages');
        if (currentPageEl) {
            currentPageEl.textContent = this.pages.length > 0 ? this.currentPageIndex + 1 : 0;
        }
        if (totalPagesEl) {
            totalPagesEl.textContent = this.pages.length;
        }
    }

    changePage(delta) {
        const newIndex = this.currentPageIndex + delta;
        if (newIndex >= 0 && newIndex < this.pages.length) {
            this.currentPageIndex = newIndex;
            this.renderCurrentView();
            this.renderThumbnails();
            this.updatePageInfo();
        }
    }

    setTool(tool) {
        console.log('setTool called with:', tool);
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`[data-tool="${tool}"]`) || document.getElementById(`${tool}Tool`);
        if (btn) {
            btn.classList.add('active');
            console.log('Tool button activated:', btn);
        }
        this.canvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';

        if (tool !== 'select') {
            this.selectedAnnotation = null;
            if (this.currentPage) {
                this.currentPage.annotations.forEach(a => a.selected = false);
                this.renderCurrentView();
            }
        }
    }

    async renderPageToCanvas(page, canvas) {
        const ctx = canvas.getContext('2d');

        // All pages are stored as images
        if (!page.originalImage) await page.load();

        const radians = (page.rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        const w = page.originalImage.width * page.scale;
        const h = page.originalImage.height * page.scale;

        canvas.width = w * cos + h * sin;
        canvas.height = w * sin + h * cos;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians);
        ctx.drawImage(page.originalImage, -w / 2, -h / 2, w, h);
        ctx.restore();

        // Render Annotations
        ctx.save();
        const radians2 = (page.rotation * Math.PI) / 180;
        const w2 = page.originalImage.width * page.scale;
        const h2 = page.originalImage.height * page.scale;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians2);
        ctx.translate(-w2 / 2, -h2 / 2);
        ctx.scale(page.scale, page.scale);

        page.annotations.forEach(ann => ann.draw(ctx));
        ctx.restore();
    }

    updateToolbarWidth() {
        // Removed as per user request for standard positioning
    }

    async renderCurrentView() {
        const page = this.currentPage;
        const placeholder = document.getElementById('no-document-placeholder');

        if (!page) {
            this.canvas.classList.remove('loaded');
            if (placeholder) placeholder.style.display = 'block';
            return;
        }

        if (placeholder) placeholder.style.display = 'none';
        await this.renderPageToCanvas(page, this.canvas);
        this.canvas.classList.add('loaded');

        document.getElementById('currentPage').textContent = this.currentPageIndex + 1;
        document.getElementById('totalPages').textContent = this.pages.length;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;

        // We need to inverse transform to get back to annotation coordinates (unscaled, unrotated)
        const page = this.currentPage;
        if (page) {
            if (page.type === 'image') {
                const radians = (page.rotation * Math.PI) / 180;
                const sin = Math.abs(Math.sin(radians));
                const cos = Math.abs(Math.cos(radians));
                const img = page.originalImage;
                const w = img.width * page.scale;
                const h = img.height * page.scale;

                // Inverse translate center
                x -= this.canvas.width / 2;
                y -= this.canvas.height / 2;

                // Inverse rotate
                const rx = x * Math.cos(-radians) - y * Math.sin(-radians);
                const ry = x * Math.sin(-radians) + y * Math.cos(-radians);

                // Inverse translate origin
                x = rx + w / 2;
                y = ry + h / 2;

                // Inverse scale
                x /= page.scale;
                y /= page.scale;
            } else {
                // PDF
                x /= page.scale;
                y /= page.scale;
            }
        }

        return { x, y };
    }

    getResizeCorner(ann, x, y) {
        if (!(ann instanceof ImageAnnotation)) return null;

        const handleSize = 10;
        const corners = {
            tl: { x: ann.x, y: ann.y },
            tr: { x: ann.x + ann.width, y: ann.y },
            bl: { x: ann.x, y: ann.y + ann.height },
            br: { x: ann.x + ann.width, y: ann.y + ann.height }
        };

        for (const [corner, pos] of Object.entries(corners)) {
            if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
                return corner;
            }
        }
        return null;
    }

    handleMouseDown(e) {
        if (!this.currentPage) return;
        const pos = this.getMousePos(e);

        if (this.currentTool === 'select') {
            // Check if clicking on a resize handle of currently selected annotation
            if (this.selectedAnnotation instanceof ImageAnnotation) {
                const corner = this.getResizeCorner(this.selectedAnnotation, pos.x, pos.y);
                if (corner) {
                    this.saveStateToStack();
                    this.isResizing = true;
                    this.resizeCorner = corner;
                    this.resizeStartX = pos.x;
                    this.resizeStartY = pos.y;
                    this.resizeStartWidth = this.selectedAnnotation.width;
                    this.resizeStartHeight = this.selectedAnnotation.height;
                    return;
                }
            }

            const ann = this.currentPage.getAnnotationAt(pos.x, pos.y, this.ctx);
            if (ann) {
                this.saveStateToStack();
                this.selectedAnnotation = ann;
                this.currentPage.annotations.forEach(a => a.selected = (a === ann));
                this.isDragging = true;
                this.dragStartX = pos.x;
                this.dragStartY = pos.y;
                this.renderCurrentView();
            } else {
                this.selectedAnnotation = null;
                this.currentPage.annotations.forEach(a => a.selected = false);
                this.renderCurrentView();
            }
        } else if (this.currentTool === 'delete') {
            const ann = this.currentPage.getAnnotationAt(pos.x, pos.y, this.ctx);
            if (ann) {
                this.saveStateToStack();
                const idx = this.currentPage.annotations.indexOf(ann);
                if (idx > -1) {
                    this.currentPage.annotations.splice(idx, 1);
                    this.renderCurrentView();
                    this.saveDocument();
                }
            }
        } else {
            this.saveStateToStack();
            this.isDrawing = true;
            this.startX = pos.x;
            this.startY = pos.y;

            if (this.currentTool === 'pen' || this.currentTool === 'highlight') {
                this.tempAnnotation = new PenAnnotation({
                    color: this.currentTool === 'highlight' ? 'rgba(255, 255, 0, 0.4)' : this.currentColor,
                    lineWidth: this.currentTool === 'highlight' ? 20 : this.currentLineWidth,
                    points: [{ x: pos.x, y: pos.y }]
                });
            } else if (this.currentTool === 'rect' || this.currentTool === 'ellipse' || this.currentTool === 'line' || this.currentTool === 'arrow') {
                this.tempAnnotation = new RectAnnotation({
                    color: this.currentColor,
                    lineWidth: this.currentLineWidth,
                    startX: pos.x,
                    startY: pos.y,
                    endX: pos.x,
                    endY: pos.y,
                    shapeType: this.currentTool // Store the actual shape type
                });
            } else if (this.currentTool === 'text') {
                const text = prompt('Enter text:');
                if (text) {
                    const ann = new TextAnnotation({
                        color: this.currentColor,
                        x: pos.x,
                        y: pos.y,
                        text: text
                    });
                    this.currentPage.addAnnotation(ann);
                    this.renderCurrentView();
                    this.saveDocument();
                }
                this.isDrawing = false;
                return;
            } else if (this.currentTool === 'signature') {
                // Open signature modal
                const modal = document.getElementById('signatureModal');
                if (modal) {
                    modal.style.display = 'flex';
                    this.signatureInsertPos = { x: pos.x, y: pos.y };
                }
                this.isDrawing = false;
                return;
            } else if (this.currentTool === 'image') {
                // Trigger image input
                const imageInput = document.getElementById('insertImageInput');
                if (imageInput) {
                    this.imageInsertPos = { x: pos.x, y: pos.y };
                    imageInput.click();
                }
                this.isDrawing = false;
                return;
            }

            if (this.tempAnnotation) {
                this.currentPage.addAnnotation(this.tempAnnotation);
            }
        }
    }

    handleMouseMove(e) {
        if (!this.currentPage) return;
        const pos = this.getMousePos(e);

        // Handle resizing when dragging a corner
        if (this.isResizing && this.selectedAnnotation) {
            if (this.selectedAnnotation instanceof ImageAnnotation) {
                const dx = pos.x - this.resizeStartX;
                const dy = pos.y - this.resizeStartY;

                // Maintain aspect ratio
                const aspectRatio = this.selectedAnnotation.width / this.selectedAnnotation.height;

                if (this.resizeCorner === 'br') {
                    this.selectedAnnotation.width = Math.max(20, this.resizeStartWidth + dx);
                    this.selectedAnnotation.height = this.selectedAnnotation.width / aspectRatio;
                } else if (this.resizeCorner === 'bl') {
                    const newWidth = Math.max(20, this.resizeStartWidth - dx);
                    this.selectedAnnotation.x = this.resizeStartX + (this.resizeStartWidth - newWidth);
                    this.selectedAnnotation.width = newWidth;
                    this.selectedAnnotation.height = newWidth / aspectRatio;
                } else if (this.resizeCorner === 'tr') {
                    this.selectedAnnotation.width = Math.max(20, this.resizeStartWidth + dx);
                    const newHeight = this.selectedAnnotation.width / aspectRatio;
                    this.selectedAnnotation.y = this.resizeStartY + (this.resizeStartHeight - newHeight);
                    this.selectedAnnotation.height = newHeight;
                } else if (this.resizeCorner === 'tl') {
                    const newWidth = Math.max(20, this.resizeStartWidth - dx);
                    this.selectedAnnotation.x = this.resizeStartX + (this.resizeStartWidth - newWidth);
                    const newHeight = newWidth / aspectRatio;
                    this.selectedAnnotation.y = this.resizeStartY + (this.resizeStartHeight - newHeight);
                    this.selectedAnnotation.width = newWidth;
                    this.selectedAnnotation.height = newHeight;
                }
            }
            this.renderCurrentView();
            return;
        }

        if (this.isDragging && this.selectedAnnotation) {
            const dx = pos.x - this.dragStartX;
            const dy = pos.y - this.dragStartY;

            if (this.selectedAnnotation instanceof RectAnnotation) {
                this.selectedAnnotation.startX += dx;
                this.selectedAnnotation.startY += dy;
                this.selectedAnnotation.endX += dx;
                this.selectedAnnotation.endY += dy;
            } else if (this.selectedAnnotation instanceof TextAnnotation || this.selectedAnnotation instanceof ImageAnnotation) {
                this.selectedAnnotation.x += dx;
                this.selectedAnnotation.y += dy;
            } else if (this.selectedAnnotation instanceof PenAnnotation) {
                this.selectedAnnotation.points.forEach(p => {
                    p.x += dx;
                    p.y += dy;
                });
            }

            this.dragStartX = pos.x;
            this.dragStartY = pos.y;
            this.renderCurrentView();
        } else if (this.isDrawing && this.tempAnnotation) {
            if (this.currentTool === 'pen' || this.currentTool === 'highlight') {
                this.tempAnnotation.points.push({ x: pos.x, y: pos.y });
            } else if (this.currentTool === 'rect' || this.currentTool === 'ellipse' || this.currentTool === 'line' || this.currentTool === 'arrow') {
                this.tempAnnotation.endX = pos.x;
                this.tempAnnotation.endY = pos.y;
            }
            this.renderCurrentView();
        }
    }

    handleMouseUp(e) {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.tempAnnotation = null;
            this.saveDocument();
        }
        if (this.isDragging) {
            this.isDragging = false;
            this.saveDocument();
        }
        if (this.isResizing) {
            this.isResizing = false;
            this.saveDocument();
        }
    }

    async saveDocument() {
        await this.db.saveState({
            pages: this.pages,
            currentPageIndex: this.currentPageIndex
        });
    }

    async clearAll() {
        if (confirm('Clear all pages?')) {
            this.pages = [];
            this.currentPageIndex = -1;
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderThumbnails();
            this.renderCurrentView();
            this.updatePageInfo();
            await this.db.clearState();
        }
    }

    async removePage() {
        if (this.currentPageIndex >= 0) {
            this.pages.splice(this.currentPageIndex, 1);
            if (this.currentPageIndex >= this.pages.length) {
                this.currentPageIndex = this.pages.length - 1;
            }
            this.renderCurrentView();
            this.renderThumbnails();
            this.updatePageInfo();
            this.saveDocument();
        }
    }

    saveStateToStack() {
        const state = {
            pages: this.pages.map(p => ({
                type: p.type,
                data: p.data,
                name: p.name,
                rotation: p.rotation,
                scale: p.scale,
                pdfPageNum: p.pdfPageNum,
                annotations: p.annotations.map(a => {
                    if (a.type === 'pen') return { ...a, points: a.points.map(pt => ({ ...pt })) };
                    return { ...a };
                })
            })),
            currentPageIndex: this.currentPageIndex
        };
        this.undoStack.push(state);
        this.redoStack = [];
        if (this.undoStack.length > 20) this.undoStack.shift();
        this.updateUndoRedoButtons();
    }

    async restoreState(state) {
        const newPages = [];
        for (let i = 0; i < state.pages.length; i++) {
            const pData = state.pages[i];
            let page = this.pages.find(p => p.data === pData.data && p.pdfPageNum === pData.pdfPageNum);

            if (!page) {
                page = new Page(pData.type, pData.data, pData.name);
            }

            page.rotation = pData.rotation;
            page.scale = pData.scale;
            page.annotations = pData.annotations.map(aData => {
                switch (aData.type) {
                    case 'pen': return new PenAnnotation(aData);
                    case 'text': return new TextAnnotation(aData);
                    case 'rect': return new RectAnnotation(aData);
                    case 'image': return new ImageAnnotation(aData);
                    default: return new Annotation(aData.type, aData);
                }
            });

            newPages.push(page);
        }
        this.pages = newPages;
        this.currentPageIndex = state.currentPageIndex;

        await this.renderCurrentView();
        this.renderThumbnails();
        this.updateUndoRedoButtons();
        this.saveDocument();
    }

    async undo() {
        if (this.undoStack.length === 0) return;

        const currentState = {
            pages: this.pages.map(p => ({
                type: p.type,
                data: p.data,
                name: p.name,
                rotation: p.rotation,
                scale: p.scale,
                pdfPageNum: p.pdfPageNum,
                annotations: p.annotations.map(a => {
                    if (a.type === 'pen') return { ...a, points: a.points.map(pt => ({ ...pt })) };
                    return { ...a };
                })
            })),
            currentPageIndex: this.currentPageIndex
        };
        this.redoStack.push(currentState);

        const prevState = this.undoStack.pop();
        await this.restoreState(prevState);
    }

    async redo() {
        if (this.redoStack.length === 0) return;

        const currentState = {
            pages: this.pages.map(p => ({
                type: p.type,
                data: p.data,
                name: p.name,
                rotation: p.rotation,
                scale: p.scale,
                pdfPageNum: p.pdfPageNum,
                annotations: p.annotations.map(a => {
                    if (a.type === 'pen') return { ...a, points: a.points.map(pt => ({ ...pt })) };
                    return { ...a };
                })
            })),
            currentPageIndex: this.currentPageIndex
        };
        this.undoStack.push(currentState);

        const nextState = this.redoStack.pop();
        await this.restoreState(nextState);
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        if (undoBtn) undoBtn.disabled = this.undoStack.length === 0;
        if (redoBtn) redoBtn.disabled = this.redoStack.length === 0;
    }

    async downloadDocument() {
        if (this.pages.length === 0) return;

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        for (let i = 0; i < this.pages.length; i++) {
            if (i > 0) doc.addPage();

            const page = this.pages[i];
            const tempCanvas = document.createElement('canvas');
            await this.renderPageToCanvas(page, tempCanvas);

            const imgData = tempCanvas.toDataURL('image/jpeg', 0.95);
            const imgProps = doc.getImageProperties(imgData);
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        }

        doc.save('document.pdf');
    }

    async printDocument() {
        if (this.pages.length === 0) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Print</title></head><body>');

        for (let i = 0; i < this.pages.length; i++) {
            const page = this.pages[i];
            const tempCanvas = document.createElement('canvas');
            await this.renderPageToCanvas(page, tempCanvas);
            printWindow.document.write(`<img src="${tempCanvas.toDataURL()}" style="max-width:100%; margin-bottom: 20px; display: block;">`);
        }

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
    }

    renderThumbnails() {
        const container = document.getElementById('thumbnails-list');
        if (!container) return;

        container.innerHTML = '';

        if (this.pages.length === 0) {
            container.innerHTML = '<p class="text-muted">No document loaded</p>';
            return;
        }

        this.pages.forEach((page, index) => {
            const div = document.createElement('div');
            div.className = `thumbnail ${index === this.currentPageIndex ? 'active' : ''}`;

            // All pages are images - create thumbnail preview
            const imgContainer = document.createElement('div');
            imgContainer.style.width = '100%';
            imgContainer.style.height = '120px';
            imgContainer.style.display = 'flex';
            imgContainer.style.justifyContent = 'center';
            imgContainer.style.alignItems = 'center';
            imgContainer.style.overflow = 'hidden';

            const img = document.createElement('img');
            img.src = page.data;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '4px';
            imgContainer.appendChild(img);
            div.appendChild(imgContainer);

            // Add page label
            const label = document.createElement('div');
            label.style.textAlign = 'center';
            label.style.marginTop = '8px';
            label.style.fontSize = '12px';
            label.style.color = '#5f6368';
            label.textContent = page.name || `Page ${index + 1}`;
            div.appendChild(label);

            div.onclick = () => {
                this.currentPageIndex = index;
                this.renderCurrentView();
                this.renderThumbnails();
            };
            container.appendChild(div);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new DocumentViewer();
});
