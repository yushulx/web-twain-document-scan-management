import { useEffect, useRef, useState } from 'react'
import './App.css'
import { DDV, EditViewer, UiConfig } from 'dynamsoft-document-viewer';
import "dynamsoft-document-viewer/dist/ddv.css";

function App() {
  const initializing = useRef(false);
  const [initialized,setInitialized] = useState(false);
  const editViewer = useRef<EditViewer|undefined>();
  useEffect(()=>{
    console.log("mounted");
    if (initializing.current == false) {
      initializing.current = true;
      initDDV();
    }
  },[])

  const initDDV = async () => {
    DDV.Core.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ=="; // Public trial license which is valid for 24 hours
    DDV.Core.engineResourcePath = "assets/ddv-resources/engine";// Lead to a folder containing the distributed WASM files
    await DDV.Core.loadWasm();
    await DDV.Core.init(); 
    // Configure image filter feature which is in edit viewer
    DDV.setProcessingHandler("imageFilter", new DDV.ImageFilter());
    const config = DDV.getDefaultUiConfig("editViewer", {includeAnnotationSet: true}) as UiConfig;
    // Create an edit viewer
    editViewer.current = new DDV.EditViewer({
      container: "container",
      uiConfig: config,
    });
    setInitialized(true);
  }

  return (
    <div id="app">
      <h2>Document Viewer Demo</h2>
      {!initialized &&
        <div>Initializing...</div>
      }
      <div id="container"></div>
    </div>
  )
}

export default App
