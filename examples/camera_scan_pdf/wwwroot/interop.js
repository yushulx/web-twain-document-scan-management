// interop.js
// https://github.com/Dynamsoft/mobile-web-capture/tree/master/samples/relatively-complete-doc-capturing-workflow
var isInitialized = false;
import { isMobile, initDocDetectModule } from "./utils.js";
import {
    mobileCaptureViewerUiConfig,
    mobilePerspectiveUiConfig,
    mobileEditViewerUiConfig,
    pcCaptureViewerUiConfig,
    pcPerspectiveUiConfig,
    pcEditViewerUiConfig
} from "./uiConfig.js";

window.initSDK = async function (license) {
    if (isInitialized) return true;

    let result = true;
    try {
        //let baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
        Dynamsoft.DDV.Core.engineResourcePath = "/libs/dynamsoft-document-viewer/dist/engine";
        Dynamsoft.Core.CoreModule.loadWasm(["DDN"]);
        Dynamsoft.DDV.Core.loadWasm();
        await Dynamsoft.License.LicenseManager.initLicense(license, true);
        isInitialized = true;
    } catch (e) {
        console.log(e);
        result = false;
    }
    return result;
},

window.initializeCaptureViewer = async (dotnetRef) => {    
    try {
        await Dynamsoft.DDV.Core.init();
        await initDocDetectModule(Dynamsoft.DDV, Dynamsoft.CVR);

        const captureViewer = new Dynamsoft.DDV.CaptureViewer({
            container: "container",
            uiConfig: isMobile() ? mobileCaptureViewerUiConfig : pcCaptureViewerUiConfig,
            viewerConfig: {
                acceptedPolygonConfidence: 60,
                enableAutoDetect: true,
            }
        });

        await captureViewer.play({ resolution: [1920, 1080] });
        captureViewer.on("showPerspectiveViewer", () => switchViewer(0, 1, 0));

        const perspectiveViewer = new Dynamsoft.DDV.PerspectiveViewer({
            container: "container",
            groupUid: captureViewer.groupUid,
            uiConfig: isMobile() ? mobilePerspectiveUiConfig : pcPerspectiveUiConfig,
            viewerConfig: { scrollToLatest: true }
        });

        perspectiveViewer.hide();
        perspectiveViewer.on("backToCaptureViewer", () => {
            switchViewer(1, 0, 0);
            captureViewer.play();
        });

        perspectiveViewer.on("showEditViewer", () => switchViewer(0, 0, 1));

        const editViewer = new Dynamsoft.DDV.EditViewer({
            container: "container",
            groupUid: captureViewer.groupUid,
            uiConfig: isMobile() ? mobileEditViewerUiConfig : pcEditViewerUiConfig
        });

        editViewer.hide();
        editViewer.on("backToPerspectiveViewer", () => switchViewer(0, 1, 0));
        editViewer.on("save", async () => {
            // https://www.dynamsoft.com/document-viewer/docs/api/interface/idocument/index.html#savetopdf
            const pdfSettings = {
                saveAnnotation: "annotation",
            };

            let blob = await editViewer.currentDocument.saveToPdf(pdfSettings);

            // convert blob to base64
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
                let base64data = reader.result;
                if (dotnetRef) {
                    dotnetRef.invokeMethodAsync('SavePdfFromBlob', base64data.split(',')[1])
                }
            }

        });

        const switchViewer = (c, p, e) => {
            captureViewer.hide();
            perspectiveViewer.hide();
            editViewer.hide();
            if (c) captureViewer.show();
            else captureViewer.stop();
            if (p) perspectiveViewer.show();
            if (e) editViewer.show();
        };
    }
    catch (e) {
        alert(e);
    }
};

//document.addEventListener("DOMContentLoaded", function () {
//    initializeCaptureViewer();
//});

window.displayAlert = function(message) {
    alert(message);
}