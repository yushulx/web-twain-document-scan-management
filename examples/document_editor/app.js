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

        // CSS-based zoom (GPU accelerated)
        this.cssZoom = 1.0;

        // Panning state (using CSS translate)
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.panOffsetX = 0;
        this.panOffsetY = 0;
        this.panStartOffsetX = 0;
        this.panStartOffsetY = 0;

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
                    this.setTool(tool);
                });
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

        // Mouse wheel zoom (Ctrl+Wheel) - CSS transform-based zoom
        const docContainer = document.getElementById('document-container');

        const handleWheelZoom = (e) => {
            if (e.ctrlKey && this.currentPage) {
                e.preventDefault();

                const canvas = this.canvas;

                // Calculate zoom factor
                const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;

                // Calculate new CSS zoom level
                const newCssZoom = Math.max(0.1, Math.min(10, this.cssZoom * zoomFactor));

                // Apply CSS transform for zoom (combine with pan offset)
                this.cssZoom = newCssZoom;
                canvas.style.transform = `scale(${this.cssZoom}) translate(${this.panOffsetX}px, ${this.panOffsetY}px)`;

                // Update zoom level display (combine base scale with CSS zoom)
                const effectiveZoom = this.currentPage.scale * this.cssZoom;
                document.getElementById('zoomLevel').textContent = `${Math.round(effectiveZoom * 100)}%`;
            }
        };

        this.canvas.addEventListener('wheel', handleWheelZoom, { passive: false });

        // Panning with mouse drag (hand/grab cursor) - using CSS translate
        // We need to handle this on the canvas directly to prevent annotation handlers from interfering
        if (docContainer) {
            const startPan = (e) => {
                // Allow panning when zoomed in
                if (this.currentPage && this.cssZoom > 1) {
                    this.isPanning = true;
                    this.panStartX = e.clientX;
                    this.panStartY = e.clientY;
                    this.panStartOffsetX = this.panOffsetX;
                    this.panStartOffsetY = this.panOffsetY;
                    this.canvas.classList.add('panning');
                    e.preventDefault();
                    e.stopPropagation();
                    return true;
                }
                return false;
            };

            // Handle on canvas first (capture phase)
            this.canvas.addEventListener('mousedown', (e) => {
                startPan(e);
            }, true); // Use capture phase to run before other handlers

            docContainer.addEventListener('mousemove', (e) => {
                if (this.isPanning) {
                    // Calculate the movement, adjusted for zoom level
                    const dx = (e.clientX - this.panStartX) / this.cssZoom;
                    const dy = (e.clientY - this.panStartY) / this.cssZoom;
                    this.panOffsetX = this.panStartOffsetX + dx;
                    this.panOffsetY = this.panStartOffsetY + dy;

                    // Apply combined transform
                    this.canvas.style.transform = `scale(${this.cssZoom}) translate(${this.panOffsetX}px, ${this.panOffsetY}px)`;
                }
            });

            docContainer.addEventListener('mouseup', () => {
                if (this.isPanning) {
                    this.isPanning = false;
                    this.canvas.classList.remove('panning');
                }
            });

            docContainer.addEventListener('mouseleave', () => {
                if (this.isPanning) {
                    this.isPanning = false;
                    this.canvas.classList.remove('panning');
                }
            });

            // Also handle wheel zoom on container
            docContainer.addEventListener('wheel', handleWheelZoom, { passive: false });

            // Prevent default drag behavior
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                docContainer.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });

            // Visual feedback
            ['dragenter', 'dragover'].forEach(eventName => {
                docContainer.addEventListener(eventName, () => {
                    docContainer.style.outline = '3px dashed rgba(255, 255, 255, 0.8)';
                    docContainer.style.outlineOffset = '-10px';
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                docContainer.addEventListener(eventName, () => {
                    docContainer.style.outline = '';
                    docContainer.style.outlineOffset = '';
                }, false);
            });

            // Handle dropped files
            docContainer.addEventListener('drop', async (e) => {
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                    for (const file of files) {
                        const ext = file.name.toLowerCase();
                        if (file.type === 'application/pdf') {
                            await this.loadPdf(file);
                        } else if (ext.endsWith('.tif') || ext.endsWith('.tiff')) {
                            await this.loadTIFF(file);
                        } else if (file.type.startsWith('image/') || ext.match(/\.(jpg|jpeg|png|bmp|gif)$/)) {
                            await this.loadImage(file);
                        } else {
                            console.warn('Unsupported file type:', file.name);
                        }
                    }

                    if (this.pages.length > 0) {
                        this.currentPageIndex = this.pages.length - 1;
                        this.renderCurrentView();
                        this.renderThumbnails();
                        this.updatePageInfo();
                    }
                }
            }, false);
        }

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
            const ext = file.name.toLowerCase();

            if (ext.endsWith('.json')) {
                // Load project file with editable annotations
                await this.loadProject(file);
            } else if (file.type === 'application/pdf') {
                await this.loadPdf(file);
            } else if (ext.endsWith('.tif') || ext.endsWith('.tiff')) {
                await this.loadTIFF(file);
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

    async loadTIFF(file) {
        if (typeof Tiff === 'undefined') {
            alert('TIFF library not loaded. Please refresh the page and try again.');
            return;
        }

        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onload = async (e) => {
                try {
                    const buffer = e.target.result;
                    const tiff = new Tiff({ buffer });
                    const pageCount = tiff.countDirectory();


                    for (let i = 0; i < pageCount; i++) {
                        tiff.setDirectory(i);
                        const canvas = tiff.toCanvas();
                        const dataURL = canvas.toDataURL('image/png');

                        const pageName = pageCount > 1 ? `${file.name} (Page ${i + 1})` : file.name;
                        const page = new Page('image', dataURL, pageName);

                        await page.load();

                        // Auto-scale very large images to prevent canvas size issues
                        const MAX_INITIAL_DIMENSION = 8000;
                        const maxDim = Math.max(page.originalImage.width, page.originalImage.height);
                        if (maxDim > MAX_INITIAL_DIMENSION) {
                            page.scale = MAX_INITIAL_DIMENSION / maxDim;
                        }

                        this.pages.push(page);
                        if (this.currentPageIndex === -1) this.currentPageIndex = 0;
                    }

                    resolve();
                } catch (error) {
                    console.error('Error loading TIFF:', error);
                    alert('Failed to load TIFF file: ' + error.message);
                    resolve();
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    async loadPdf(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;

        // Render each PDF page to canvas and store as image
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const pdfPage = await pdfDoc.getPage(i);
            const viewport = pdfPage.getViewport({ scale: 1.5 }); // Higher scale for better quality

            // Create temporary canvas to render PDF page WITHOUT annotations
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = viewport.width;
            tempCanvas.height = viewport.height;
            const tempCtx = tempCanvas.getContext('2d');

            // Render WITHOUT annotations (annotationMode: 0 = DISABLE)
            await pdfPage.render({
                canvasContext: tempCtx,
                viewport: viewport,
                annotationMode: 0  // Disable annotation rendering
            }).promise;

            // Convert canvas to image data URL
            const imageData = tempCanvas.toDataURL('image/png');

            // Create page as image type
            const page = new Page('image', imageData, `${file.name} - Page ${i}`);
            await page.load();

            // Extract PDF annotations and convert to our annotation format
            try {
                const pdfAnnotations = await pdfPage.getAnnotations();
                const scale = 1.5; // Same scale used for rendering

                for (const pdfAnn of pdfAnnotations) {
                    const annotation = this.convertPdfAnnotation(pdfAnn, viewport, scale);
                    if (annotation) {
                        page.annotations.push(annotation);
                    }
                }
            } catch (err) {
                // Could not extract PDF annotations
            }

            this.pages.push(page);
        }
        if (this.currentPageIndex === -1) this.currentPageIndex = 0;
    }

    // Convert PDF.js annotation to our annotation format
    convertPdfAnnotation(pdfAnn, viewport, scale) {
        const rect = pdfAnn.rect;
        if (!rect || rect.length < 4) return null;

        // PDF coordinates are bottom-left origin, convert to top-left
        const x = rect[0] * scale;
        const y = (viewport.height / scale - rect[3]) * scale;
        const width = (rect[2] - rect[0]) * scale;
        const height = (rect[3] - rect[1]) * scale;

        // Get color from annotation
        const color = pdfAnn.color ?
            `rgb(${Math.round(pdfAnn.color[0] * 255)}, ${Math.round(pdfAnn.color[1] * 255)}, ${Math.round(pdfAnn.color[2] * 255)})` :
            '#ff0000';

        // Check for our custom annotation data in multiple possible fields
        // PDF.js exposes Contents as contentsObj.str
        const possibleDataSources = [
            pdfAnn.contentsObj?.str,  // PDF.js uses contentsObj.str for Contents
            pdfAnn.contents,
            pdfAnn.annotationName,
            pdfAnn.NM,
            pdfAnn.nm
        ];

        for (const source of possibleDataSources) {
            if (source && typeof source === 'string' && source.startsWith('doceditor:')) {
                try {
                    const base64Data = source.substring('doceditor:'.length);
                    const annData = JSON.parse(decodeURIComponent(escape(atob(base64Data))));

                    // Reconstruct the annotation based on its type
                    switch (annData.type) {
                        case 'pen':
                            return new PenAnnotation(annData);
                        case 'rect':
                            return new RectAnnotation(annData);
                        case 'text':
                            return new TextAnnotation(annData);
                        case 'image':
                            const imgAnn = new ImageAnnotation(annData);
                            if (annData.imageData) {
                                const img = new Image();
                                img.src = annData.imageData;
                                imgAnn.image = img;
                            }
                            return imgAnn;
                        default:
                            break;
                    }
                } catch (e) {
                    // Not our custom data format, continue checking
                }
            }
        }

        // Also check if contentsObj.str looks like base64 encoded JSON (without prefix)
        const contentsStr = pdfAnn.contentsObj?.str;
        if (contentsStr && typeof contentsStr === 'string' && contentsStr.length > 50) {
            try {
                const annData = JSON.parse(decodeURIComponent(escape(atob(contentsStr))));
                if (annData && annData.type) {
                    switch (annData.type) {
                        case 'pen':
                            return new PenAnnotation(annData);
                        case 'rect':
                            return new RectAnnotation(annData);
                        case 'text':
                            return new TextAnnotation(annData);
                        case 'image':
                            const imgAnn = new ImageAnnotation(annData);
                            if (annData.imageData) {
                                const img = new Image();
                                img.src = annData.imageData;
                                imgAnn.image = img;
                            }
                            return imgAnn;
                    }
                }
            } catch (e) {
                // Not base64 JSON, continue with standard handling
            }
        }

        switch (pdfAnn.subtype) {
            case 'FreeText':
                return new TextAnnotation({
                    x: x,
                    y: y,
                    text: pdfAnn.contents || pdfAnn.title || 'Text',
                    color: color,
                    fontSize: pdfAnn.fontSize || 16
                });

            case 'Square':
            case 'Rect':
                return new RectAnnotation({
                    startX: x,
                    startY: y,
                    endX: x + width,
                    endY: y + height,
                    color: color,
                    lineWidth: pdfAnn.borderStyle?.width || 2,
                    fillColor: pdfAnn.interiorColor ?
                        `rgba(${Math.round(pdfAnn.interiorColor[0] * 255)}, ${Math.round(pdfAnn.interiorColor[1] * 255)}, ${Math.round(pdfAnn.interiorColor[2] * 255)}, 0.3)` :
                        null
                });

            case 'Highlight':
                return new RectAnnotation({
                    startX: x,
                    startY: y,
                    endX: x + width,
                    endY: y + height,
                    color: 'rgba(255, 255, 0, 0.4)',
                    lineWidth: 0,
                    fillColor: 'rgba(255, 255, 0, 0.4)'
                });

            case 'Ink':
                // Ink annotations have inkLists (arrays of points)
                // PDF.js provides inkLists in PDF coordinate space (unscaled, bottom-left origin)
                // We need to convert to our image coordinate space (scaled viewport, top-left origin)
                if (pdfAnn.inkLists && pdfAnn.inkLists.length > 0) {
                    const points = [];
                    // viewport.height is already scaled (e.g., pdfHeight * 1.5)
                    // inkList coordinates are in unscaled PDF space
                    for (const inkList of pdfAnn.inkLists) {
                        for (let j = 0; j < inkList.length; j += 2) {
                            const pdfX = inkList[j];
                            const pdfY = inkList[j + 1];
                            // Scale to match the rendered viewport
                            // Y needs to flip from bottom-left to top-left origin
                            points.push({
                                x: pdfX * scale,
                                y: viewport.height - (pdfY * scale)
                            });
                        }
                    }
                    if (points.length > 0) {
                        return new PenAnnotation({
                            points: points,
                            color: color,
                            lineWidth: pdfAnn.borderStyle?.width || 2
                        });
                    }
                }
                return null;

            case 'Line':
                // Line annotations - convert to pen with two points
                if (pdfAnn.lineCoordinates && pdfAnn.lineCoordinates.length >= 4) {
                    const coords = pdfAnn.lineCoordinates;
                    return new PenAnnotation({
                        points: [
                            { x: coords[0] * scale, y: (viewport.height / scale - coords[1]) * scale },
                            { x: coords[2] * scale, y: (viewport.height / scale - coords[3]) * scale }
                        ],
                        color: color,
                        lineWidth: pdfAnn.borderStyle?.width || 2
                    });
                }
                return null;

            case 'Text':
            case 'Popup':
                // Note/comment annotations
                if (pdfAnn.contents) {
                    return new TextAnnotation({
                        x: x,
                        y: y,
                        text: pdfAnn.contents,
                        color: color,
                        fontSize: 12
                    });
                }
                return null;

            case 'Link':
                // Check if this is our custom annotation link
                const url = pdfAnn.url || (pdfAnn.dest && pdfAnn.dest.url);
                if (url && url.startsWith('annotation:')) {
                    try {
                        const base64Data = url.substring('annotation:'.length);
                        const annData = JSON.parse(atob(base64Data));

                        // Reconstruct the annotation based on its type
                        switch (annData.type) {
                            case 'pen':
                                return new PenAnnotation(annData);
                            case 'rect':
                                return new RectAnnotation(annData);
                            case 'text':
                                return new TextAnnotation(annData);
                            case 'image':
                                const imgAnn = new ImageAnnotation(annData);
                                // Load the image asynchronously
                                if (annData.imageData) {
                                    const img = new Image();
                                    img.src = annData.imageData;
                                    imgAnn.image = img;
                                }
                                return imgAnn;
                            default:
                                return null;
                        }
                    } catch (e) {
                        // Could not parse custom annotation
                    }
                }
                return null;

            default:
                return null;
        }
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
                    // Auto-scale very large images to prevent canvas size issues
                    const MAX_INITIAL_DIMENSION = 8000;
                    const maxDim = Math.max(page.originalImage.width, page.originalImage.height);
                    if (maxDim > MAX_INITIAL_DIMENSION) {
                        page.scale = MAX_INITIAL_DIMENSION / maxDim;
                    }

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
            // Canvas-based zoom (re-rendering)
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
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`[data-tool="${tool}"]`) || document.getElementById(`${tool}Tool`);
        if (btn) {
            btn.classList.add('active');
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
        let w = page.originalImage.width * page.scale;
        let h = page.originalImage.height * page.scale;

        // Calculate target canvas size
        let targetWidth = w * cos + h * sin;
        let targetHeight = w * sin + h * cos;

        // Browser canvas size limits - only applied during initial render
        // CSS zoom handles further zooming without canvas size issues
        const MAX_CANVAS_SIZE = 16384;
        const MAX_CANVAS_AREA = 268435456;

        if (targetWidth > MAX_CANVAS_SIZE || targetHeight > MAX_CANVAS_SIZE ||
            (targetWidth * targetHeight) > MAX_CANVAS_AREA) {

            const scaleX = targetWidth > MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE / targetWidth : 1;
            const scaleY = targetHeight > MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE / targetHeight : 1;
            const areaScale = (targetWidth * targetHeight) > MAX_CANVAS_AREA ?
                Math.sqrt(MAX_CANVAS_AREA / (targetWidth * targetHeight)) : 1;

            const limitFactor = Math.min(scaleX, scaleY, areaScale) * 0.95;

            // Reduce page scale to fit in canvas
            page.scale = page.scale * limitFactor;

            // Recalculate dimensions
            w = page.originalImage.width * page.scale;
            h = page.originalImage.height * page.scale;
            targetWidth = w * cos + h * sin;
            targetHeight = w * sin + h * cos;
        }

        // Ensure minimum canvas size
        targetWidth = Math.max(1, Math.round(targetWidth));
        targetHeight = Math.max(1, Math.round(targetHeight));

        canvas.width = targetWidth;
        canvas.height = targetHeight;

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

    // Update container class based on whether content overflows (for proper centering vs scrolling)
    updateContainerOverflow() {
        const container = document.getElementById('document-container');
        if (!container) return;

        requestAnimationFrame(() => {
            const hasOverflow = container.scrollWidth > container.clientWidth ||
                container.scrollHeight > container.clientHeight;
            if (hasOverflow) {
                container.classList.add('overflow-scroll');
            } else {
                container.classList.remove('overflow-scroll');
            }
        });
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

        // Reset CSS zoom and pan offset when switching pages
        this.cssZoom = 1;
        this.panOffsetX = 0;
        this.panOffsetY = 0;
        this.canvas.style.transform = 'scale(1) translate(0px, 0px)';

        await this.renderPageToCanvas(page, this.canvas);
        this.canvas.classList.add('loaded');

        document.getElementById('currentPage').textContent = this.currentPageIndex + 1;
        document.getElementById('totalPages').textContent = this.pages.length;

        // Update zoom level display
        document.getElementById('zoomLevel').textContent = `${Math.round(page.scale * 100)}%`;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Account for CSS zoom: rect already reflects the zoomed size
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

        // Don't handle annotation events if we're panning
        if (this.isPanning) return;

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

        // Use pdf-lib for proper PDF annotation support
        const { PDFDocument, rgb, StandardFonts, PDFName, PDFString, PDFArray, PDFDict, PDFNumber } = PDFLib;
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        for (let i = 0; i < this.pages.length; i++) {
            const page = this.pages[i];

            // Render page WITHOUT annotations (base image only)
            const tempCanvas = document.createElement('canvas');
            await this.renderPageToCanvasWithoutAnnotations(page, tempCanvas);

            // Embed the image
            const imgData = tempCanvas.toDataURL('image/png');
            const imgBytes = await fetch(imgData).then(res => res.arrayBuffer());
            const pngImage = await pdfDoc.embedPng(imgBytes);

            // Create page with image dimensions
            const pdfPage = pdfDoc.addPage([pngImage.width, pngImage.height]);
            pdfPage.drawImage(pngImage, {
                x: 0,
                y: 0,
                width: pngImage.width,
                height: pngImage.height
            });

            const pageHeight = pngImage.height;

            // Add annotations using pdf-lib (coordinates are already in canvas space)
            for (const ann of page.annotations) {
                await this.addPdfLibAnnotation(pdfDoc, pdfPage, ann, pageHeight, font);
            }
        }

        // Save and download
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.pdf';
        a.click();
        URL.revokeObjectURL(url);
    }

    // Add annotation using pdf-lib (creates proper PDF annotation objects)
    async addPdfLibAnnotation(pdfDoc, pdfPage, ann, pageHeight, font) {
        const { rgb, PDFName, PDFString, PDFArray, PDFNumber } = PDFLib;

        const parseColor = (colorStr) => {
            if (!colorStr) return { r: 0, g: 0, b: 0 };
            if (colorStr.startsWith('#')) {
                const hex = colorStr.slice(1);
                return {
                    r: parseInt(hex.substr(0, 2), 16) / 255,
                    g: parseInt(hex.substr(2, 2), 16) / 255,
                    b: parseInt(hex.substr(4, 2), 16) / 255
                };
            }
            if (colorStr.startsWith('rgb')) {
                const match = colorStr.match(/[\d.]+/g);
                if (match && match.length >= 3) {
                    return {
                        r: parseFloat(match[0]) / 255,
                        g: parseFloat(match[1]) / 255,
                        b: parseFloat(match[2]) / 255
                    };
                }
            }
            return { r: 1, g: 0, b: 0 }; // Default red
        };

        try {
            // Serialize annotation data for re-import
            const annData = JSON.stringify(ann, (key, value) => {
                if (key === 'image' || key === 'selected') return undefined;
                return value;
            });
            const encodedData = btoa(unescape(encodeURIComponent(annData)));

            if (ann.type === 'text') {
                const x = ann.x;
                const y = pageHeight - ann.y; // PDF uses bottom-left origin
                const color = parseColor(ann.color);
                const fontSize = ann.fontSize || 16;

                // Only draw text on page (FreeText annotations don't render well in most viewers)
                pdfPage.drawText(ann.text || '', {
                    x: x,
                    y: y - fontSize,
                    size: fontSize,
                    font: font,
                    color: rgb(color.r, color.g, color.b)
                });

                // Create FreeText annotation for editability
                const textWidth = font.widthOfTextAtSize(ann.text || '', fontSize);
                this.createPdfAnnotation(pdfDoc, pdfPage, 'FreeText', {
                    rect: [x, y - fontSize * 1.5, x + textWidth + 10, y + 5],
                    contents: ann.text || '',
                    color: color,
                    encodedData: encodedData
                });

            } else if (ann.type === 'rect') {
                // RectAnnotation uses startX, startY, endX, endY
                const minX = Math.min(ann.startX, ann.endX);
                const minY = Math.min(ann.startY, ann.endY);
                const w = Math.abs(ann.endX - ann.startX);
                const h = Math.abs(ann.endY - ann.startY);

                const x = minX;
                const y = pageHeight - minY - h; // Convert to PDF coordinates (bottom-left origin)
                const color = parseColor(ann.color);
                const lineWidth = ann.lineWidth || 2;

                // DON'T draw on page content - only create annotation object
                // This prevents double rendering when re-importing

                // Create Square annotation with appearance stream
                this.createPdfAnnotation(pdfDoc, pdfPage, 'Square', {
                    rect: [x, y, x + w, y + h],
                    color: color,
                    lineWidth: lineWidth,
                    encodedData: encodedData
                });

            } else if (ann.type === 'pen' && ann.points && ann.points.length > 1) {
                const color = parseColor(ann.color);
                const lineWidth = ann.lineWidth || 2;

                // DON'T draw on page content - only create annotation object
                // This prevents double rendering when re-importing

                // Create Ink annotation
                const inkList = ann.points.map(p => [p.x, pageHeight - p.y]).flat();
                const minX = Math.min(...ann.points.map(p => p.x));
                const maxX = Math.max(...ann.points.map(p => p.x));
                const minY = Math.min(...ann.points.map(p => pageHeight - p.y));
                const maxY = Math.max(...ann.points.map(p => pageHeight - p.y));

                this.createPdfAnnotation(pdfDoc, pdfPage, 'Ink', {
                    rect: [minX - 5, minY - 5, maxX + 5, maxY + 5],
                    inkList: inkList,
                    color: color,
                    lineWidth: lineWidth,
                    encodedData: encodedData
                });

            } else if (ann.type === 'image' && ann.imageData) {
                const x = ann.x;
                const y = pageHeight - ann.y - ann.height;
                const w = ann.width;
                const h = ann.height;

                // Image annotations need to be drawn on page (no native PDF image annotation type)
                try {
                    const imgBytes = await fetch(ann.imageData).then(res => res.arrayBuffer());
                    let embeddedImg;
                    if (ann.imageData.includes('image/png')) {
                        embeddedImg = await pdfDoc.embedPng(imgBytes);
                    } else {
                        embeddedImg = await pdfDoc.embedJpg(imgBytes);
                    }
                    pdfPage.drawImage(embeddedImg, { x, y, width: w, height: h });

                    // Create a link annotation to store data for re-import
                    this.createPdfAnnotation(pdfDoc, pdfPage, 'Link', {
                        rect: [x, y, x + w, y + h],
                        encodedData: encodedData
                    });
                } catch (e) {
                    // Could not embed image annotation
                }
            }
        } catch (err) {
            // Error adding PDF annotation
        }
    }

    // Create PDF annotation dictionary
    createPdfAnnotation(pdfDoc, pdfPage, subtype, options) {
        const { PDFName, PDFString, PDFArray, PDFNumber, PDFDict, PDFHexString } = PDFLib;

        try {
            // Store our custom data with doceditor: prefix in Contents field
            // Use PDFHexString to avoid encoding issues
            const contentsValue = options.encodedData
                ? `doceditor:${options.encodedData}`
                : (options.contents || '');

            const annot = pdfDoc.context.obj({
                Type: 'Annot',
                Subtype: subtype,
                Rect: options.rect,
                Border: [0, 0, 0],
                F: 4, // Print flag
            });

            // Set Contents as PDFString explicitly
            if (contentsValue) {
                annot.set(PDFName.of('Contents'), PDFString.of(contentsValue));
            }

            // Add color if provided
            if (options.color) {
                annot.set(PDFName.of('C'), pdfDoc.context.obj([options.color.r, options.color.g, options.color.b]));
            }

            // Add InkList for Ink annotations
            if (subtype === 'Ink' && options.inkList) {
                annot.set(PDFName.of('InkList'), pdfDoc.context.obj([options.inkList]));
            }

            // Add border style
            if (options.lineWidth) {
                annot.set(PDFName.of('BS'), pdfDoc.context.obj({
                    Type: 'Border',
                    W: options.lineWidth,
                    S: 'S'
                }));
            }

            // Also store in NM field as backup
            if (options.encodedData) {
                annot.set(PDFName.of('NM'), PDFString.of(`doceditor:${options.encodedData}`));
            }

            // Add to page's annotations array
            const existingAnnots = pdfPage.node.get(PDFName.of('Annots'));
            if (existingAnnots) {
                existingAnnots.push(pdfDoc.context.register(annot));
            } else {
                pdfPage.node.set(PDFName.of('Annots'), pdfDoc.context.obj([pdfDoc.context.register(annot)]));
            }
        } catch (err) {
            // Error creating PDF annotation
        }
    }

    // Render page to canvas WITHOUT annotations (for PDF export)
    async renderPageToCanvasWithoutAnnotations(page, canvas) {
        const ctx = canvas.getContext('2d');

        if (!page.originalImage) await page.load();

        const radians = (page.rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));
        let w = page.originalImage.width * page.scale;
        let h = page.originalImage.height * page.scale;

        let targetWidth = w * cos + h * sin;
        let targetHeight = w * sin + h * cos;

        // Apply canvas size limits
        const MAX_CANVAS_SIZE = 16384;
        const MAX_CANVAS_AREA = 268435456;

        if (targetWidth > MAX_CANVAS_SIZE || targetHeight > MAX_CANVAS_SIZE ||
            (targetWidth * targetHeight) > MAX_CANVAS_AREA) {

            const scaleX = targetWidth > MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE / targetWidth : 1;
            const scaleY = targetHeight > MAX_CANVAS_SIZE ? MAX_CANVAS_SIZE / targetHeight : 1;
            const areaScale = (targetWidth * targetHeight) > MAX_CANVAS_AREA ?
                Math.sqrt(MAX_CANVAS_AREA / (targetWidth * targetHeight)) : 1;

            const limitFactor = Math.min(scaleX, scaleY, areaScale) * 0.95;
            page.scale = page.scale * limitFactor;

            w = page.originalImage.width * page.scale;
            h = page.originalImage.height * page.scale;
            targetWidth = w * cos + h * sin;
            targetHeight = w * sin + h * cos;
        }

        targetWidth = Math.max(1, Math.round(targetWidth));
        targetHeight = Math.max(1, Math.round(targetHeight));

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians);
        ctx.drawImage(page.originalImage, -w / 2, -h / 2, w, h);
        ctx.restore();

        // Don't render annotations - they will be added as PDF annotations
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
