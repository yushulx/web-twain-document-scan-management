import "dynamsoft-document-viewer/dist/ddv.css";
import { DDV } from 'dynamsoft-document-viewer';

DDV.on("error", e => { console.log(e.cause); });
DDV.on("warning", e => { console.log(e.cause); });
(window as any)["DDV"] = DDV;

await (async () => {
  DDV.Core.license = "t0115uQAAAJJfo6BBRS2nKlciU3D43dj7VHCcttUcCvbCsPEBUWPpoKVg/3acGSopnBBrweZotGHlXWpXlwd0xCvWJDxjF33PYb3Nj6Xch9NZQI4NwWEOcUSHNsBGxsvrG3poM3UbgFq5VfUOPYqYqr4BIl0nmw==";
  DDV.Core.engineResourcePath = "assets/ddv-resources/engine";
  DDV.Core.loadWasm();
  await DDV.Core.init();
})();


DDV.setProcessingHandler("imageFilter", new DDV.ImageFilter());

const editViewer = new DDV.EditViewer({
  container: "container",
});

(window as any)["editViewer"] = editViewer;