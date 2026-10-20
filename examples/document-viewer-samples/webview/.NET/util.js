class MyViewer {

    // purely virtual function
    getDocument() {
        throw new Error('getDocument() must be implemented by subclass');
    }
    
    async loadSource(base64Image) {
        const doc = this.getDocument();
        await doc.loadSource(MyViewerApp.base64toBlob(base64Image));
    }

    async loadDocument(url) {
        const response = await fetch(url, {
            method: "GET"
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const image = await response.arrayBuffer();
        const doc = this.getDocument();
        await doc?.loadSource(new Blob([image], { type: response.headers.get("content-type") }));
    }

    async saveToPng(index, settings) {
        const doc = this.getDocument();
        const file = await doc?.saveToPng(index, settings);
        return await fileToBase64(file);
    }

    async saveToJpeg(index, settings) {
        const doc = this.getDocument();
        const file = await doc?.saveToJpeg(index, settings);
        return await MyViewerApp.fileToBase64(file);
    }

    async saveAsTiff(indicies, settings) {
        const doc = this.getDocument();

        indicies = indicies ?? [...Array(doc?.pages.length).keys()];
        if (indicies.length === 0) {
            return "";
        }
        if (settings) {
            const file = await doc?.saveToTiff(indicies, settings);
            return await MyViewerApp.fileToBase64(file);
        }
        else {
            const file = await doc?.saveToTiff(indicies);
            return await MyViewerApp.fileToBase64(file);
        }
    }

    async saveAllAsTiff(settings) {
        return await this.saveAsTiff(null, settings);
    }

    async saveAsPdf(indicies, settings) {
        const doc = this.getDocument();

        indicies = indicies ?? [...Array(doc?.pages.length).keys()];
        if (indicies.length === 0) {
            return "";
        }
        if (settings) {
            const file = await doc?.saveToPdf(indicies, settings);
            return await MyViewerApp.fileToBase64(file);
        }
        else {
            const file = await doc?.saveToPdf(indicies);
            return await MyViewerApp.fileToBase64(file);
        }
    }

    async saveAllAsPdf(settings) {
        return await this.saveAsPdf(null, settings);
    }
}

class MyDesktopViewer extends MyViewer {
    editViewer = null;
    constructor(options) {
        super();
        let newUiConfig = Dynamsoft.DDV.getDefaultUiConfig("editViewer", { includeAnnotationSet: true });
        if (options.uiConfig === 'desktop-default') {
            newUiConfig = {
                type: Dynamsoft.DDV.Elements.Layout,
                flexDirection: "column",
                className: "ddv-edit-viewer-desktop",
                children: [
                    Dynamsoft.DDV.Elements.MainView,
                    {
                        type: Dynamsoft.DDV.Elements.Pagination,
                        className: "custom-pagination",
                    }
                ],
            };
        }

        this.editViewer = new Dynamsoft.DDV.EditViewer({
            container: "container",
            uiConfig: newUiConfig,
            viewerConfig: {
                canvasStyle: {
                    background: "rgb(255,255,255)"
                }
            },
            thumbnailConfig: {
                visibility: "visible",
                checkboxStyle: {
                    visibility: "hidden",
                },
                pageNumberStyle: {
                    visibility: "hidden",
                },
                canvasStyle: {
                    background: "rgb(244,244,244)"
                },
                selectedPageStyle: {
                    border: "2px solid rgb(153,209,255)",
                    background: "rgb(204,232,255)"
                },
                currentPageStyle: {
                    border: "0px solid blue"
                },
                hoveredPageStyle: {
                    border: "0px solid blue",
                    background: "rgb(229,243,255)"
                }
            },
            annotationConfig: {
                enableContinuousDrawing: true
            }
        });
        this.editViewer.displayMode = "single";
        let internalIndexChanged = false;
        this.editViewer.on("currentIndexChanged", (evt) => {
            let selectedIndices = this.editViewer.thumbnail?.getSelectedPageIndices();
            if (!internalIndexChanged) {
                selectedIndices = [];
            }

            if (evt.newIndex != -1 && !selectedIndices.includes(evt.newIndex)) {
                selectedIndices.push(evt.newIndex);
                this.editViewer.thumbnail?.selectPages(selectedIndices);
            }
        });

        this.editViewer.thumbnail?.on("selectedPagesChanged", (evt) => {
            const currentPageIndex = this.editViewer.getCurrentPageIndex();
            if (!evt.newIndices.includes(currentPageIndex) && evt.newIndices.length > 0) {
                internalIndexChanged = true;
                this.editViewer.goToPage(evt.newIndices[evt.newIndices.length - 1]);
                internalIndexChanged = false;
            }
        });
    }

    // override
    getDocument() {
        let doc = this.editViewer.currentDocument;
        if (!doc) {
            doc = Dynamsoft.DDV.documentManager.createDocument();
            this.editViewer.openDocument(doc.uid);
        }
        return doc;
    }

    setToolMode(mode) {
        this.editViewer.toolMode = mode;
        return (this.editViewer.toolMode === mode);
    }

    rotateCurrentPage(angle) {
        return this.editViewer.rotate(angle, [this.editViewer.getCurrentPageIndex()]);
    }

    rotateSelectedPages(angle) {
        return this.editViewer.rotate(angle, this.editViewer.thumbnail?.getSelectedPageIndices());
    }

    cropCurrentPage() {
        return this.editViewer.crop(this.editViewer.getCropRect(), [this.editViewer.getCurrentPageIndex()]);
    }

    cropSelectedPages() {
        return this.editViewer.crop(this.editViewer.getCropRect(), this.editViewer.thumbnail?.getSelectedPageIndices());
    }

    undo() {
        return this.editViewer.undo();
    }

    redo() {
        return this.editViewer.redo();
    }

    setFitMode(mode) {
        this.editViewer.fitMode = mode;
        return (this.editViewer.fitMode === mode);
    }

    setAnnotationMode(mode) {
        this.editViewer.toolMode = 'annotation';
        this.editViewer.annotationMode = mode;
        return (this.editViewer.annotationMode === mode);
    }

    deleteCurrentPage() {
        return this.editViewer.currentDocument?.deletePages([this.editViewer.getCurrentPageIndex()]);
    }

    deleteSelectedPages() {
        return this.editViewer.currentDocument?.deletePages(this.editViewer.thumbnail?.getSelectedPageIndices());
    }

    deleteAllPages() {
        return this.editViewer.currentDocument?.deleteAllPages();
    }

    getSelectedPagesCount() {
        return this.editViewer.thumbnail?.getSelectedPageIndices().length;
    }

    getPageCount() {
        return this.editViewer.getPageCount();
    }

    async saveCurrentToPng(settings) {
        if (this.editViewer.getPageCount() <= 0) {
            return "";
        }
        return await this.saveToPng(this.editViewer.getCurrentPageIndex(), settings);
    }

    async saveCurrentToJpeg(settings) {
        if (this.editViewer.getPageCount() <= 0) {
            return "";
        }
        return await this.saveToJpeg(this.editViewer.getCurrentPageIndex(), settings);
    }

    async saveCurrentAsTiff(settings) {
        return await this.saveAsTiff([this.editViewer.getCurrentPageIndex()], settings);
    }

    async saveSelectedAsTiff(settings) {
        return await this.saveAsTiff(this.editViewer.thumbnail?.getSelectedPageIndices(), settings);
    }

    async saveCurrentAsPdf(settings) {
        return await this.saveAsPdf([this.editViewer.getCurrentPageIndex()], settings);
    }

    async saveSelectedAsPdf(settings) {
        return await this.saveAsPdf(this.editViewer.thumbnail?.getSelectedPageIndices(), settings);
    }
}
class MyViewerApp {
    static productkey = "";
    static messageType = "";
    static myViewer = null;

    // Unified function to send messages to .NET
    static sendMessageToDotNet(message) {
        try {
            message = (this.messageType === '') ? message : `${this.messageType}|${message}`;
            if (window.chrome && window.chrome.webview) {
                // For WinForms and WPF (WebView2)
                window.chrome.webview.postMessage(message);
            }
            else if (window.DotNet) {
                // For Blazor, not sure if this is the right way
                DotNet.invokeMethodAsync(blazorAppName, blazorCallbackName, message);
            }
            else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.webwindowinterop) {
                // iOS and MacCatalyst WKWebView
                window.webkit.messageHandlers.webwindowinterop.postMessage(message);
            }
            else if (hybridWebViewHost) {
                // Android WebView
                hybridWebViewHost.sendMessage(message);
            }
            else {
                console.error("Unsupported platform or WebView environment.");
            }
        }
        catch (error) {
            console.error("Error sending message to .NET:", error);
        }
    }

    static invokeDotNet(context, result, error) {
        try {
            this.sendMessageToDotNet(JSON.stringify([context ?? '', result ?? '', error ?? '']));

        } catch (e) {
            console.error(`Error sending back: ${context}:`, e);
        }
    }

    static async initView(options) {
        return await MyViewerApp.createView(options);
    }

    static findFunction(ins, name) {
        if (!ins) {
            if (name === 'initView') {
                return this.initView;
            }
            return null;
        }

        let proto = Object.getPrototypeOf(ins);
        while (proto) {
            if (proto.hasOwnProperty(name)) {
                //console.log(`${name} defined on:`, proto.constructor.name);
                return proto[name];
            }
            proto = Object.getPrototypeOf(proto);
        }
        //console.log(`${name} not found in prototype chain.`);
        return null;
    }

    static async invokeJavaScript(name, params, context) {
        let error = '';
        try {
            context = context ?? '';
            const func = this.findFunction(this.myViewer, name);
            // Check if the function exists and is callable
            if (func) {
                // Decode the base64 string into a JSON array
                const decodedParams = JSON.parse(params);

                // Dynamically call the function with the provided parameters
                const result = await func.bind(this.myViewer)(...decodedParams);

                // If a callback is provided, call it with the result
                if (context) {
                    this.invokeDotNet(context, result ?? "", error);
                }
                return;
            } else {
                error = `Function ${name} is not defined or not callable.`;
                console.error(error);
                this.invokeDotNet(context, '', error);
            }
        } catch (e) {
            console.error(`Error invoking function ${name}:`, e);
            error = e.cause ?? JSON.stringify(e, Object.getOwnPropertyNames(e));
            this.invokeDotNet(context, '', error);
        }
    }

    static base64toBlob(base64Data, contentType = '', sliceSize = 512) {
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    static async fileToBase64(file) {
        if (!file) {
            return Promise.resolve("");
        }
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]); // Extract Base64 part
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    };

    static acquireImageFromCamera(mainViewer) {
        const pcCaptureUiConfig = {
            type: Dynamsoft.DDV.Elements.Layout,
            flexDirection: "column",
            className: "ddv-capture-viewer-desktop",
            children: [
                {
                    type: Dynamsoft.DDV.Elements.Layout,
                    className: "ddv-capture-viewer-header-desktop",
                    children: [
                        {
                            type: Dynamsoft.DDV.Elements.CameraResolution,
                            className: "ddv-capture-viewer-resolution-desktop",
                        },
                        Dynamsoft.DDV.Elements.AutoDetect,
                        {
                            type: Dynamsoft.DDV.Elements.Capture,
                            className: "ddv-capture-viewer-capture-desktop",
                        },
                        Dynamsoft.DDV.Elements.AutoCapture,
                        {
                            type: Dynamsoft.DDV.Elements.Button,
                            className: "ddv-button-close position-button-close", // Set the button's icon
                            tooltip: "close viewer", // Set tooltip for the button
                            events: {
                                click: "close", // Set the click event
                            },
                        },
                    ],
                },
                Dynamsoft.DDV.Elements.MainView,
                {
                    type: Dynamsoft.DDV.Elements.ImagePreview,
                    className: "ddv-capture-viewer-image-preview-desktop",
                },
            ],
        };


        mainViewer?.hide();
        const captureViewer = new Dynamsoft.DDV.CaptureViewer({
            container: "container",
            uiConfig: pcCaptureUiConfig
        });
        captureViewer.openDocument(mainViewer?.currentDocument.uid); // Open a document which has pages
        captureViewer.play();
        captureViewer.on("close", () => {
            captureViewer.destroy();
            mainViewer?.show();
        });
    }

    static async createView(options) {
        console.log(options.productKey);
        this.productkey = options.productKey;
        this.messageType = options.messageType;

        // Public trial license which is valid for 24 hours
        // You can request a 30-day trial key from https://www.dynamsoft.com/customer/license/trialLicense/?product=mwc
        Dynamsoft.DDV.Core.license = this.productkey;
        // Preload DDV Resource
        Dynamsoft.DDV.Core.loadWasm();
        await Dynamsoft.DDV.Core.init();
        Dynamsoft.DDV.setProcessingHandler("imageFilter", new Dynamsoft.DDV.ImageFilter());

        if (options.uiConfig === 'desktop-default') {
            this.myViewer = new MyDesktopViewer(options);
        }else if (options.uiConfig === 'mobile-default') {
            this.myViewer = new MyMobileViewer(options);
        }
        window["myViewer"] = this.myViewer;

        return location.origin;
    }
}

window.addEventListener("load", function () {
    MyViewerApp.messageType = '__RawMessage'; // hybridwebview require this
    MyViewerApp.invokeDotNet('load', 'true', '');
    MyViewerApp.messageType = ''; // reset this, after initView, we will set it as real type
});

async function invokeJavaScript(name, params, context) {
    return MyViewerApp.invokeJavaScript(name, params, context);
}


