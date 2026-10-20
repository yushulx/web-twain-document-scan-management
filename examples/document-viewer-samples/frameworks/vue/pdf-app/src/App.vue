<script setup lang="ts">
import { DDV, UiConfig } from 'dynamsoft-document-viewer';
import "dynamsoft-document-viewer/dist/ddv.css";
import { onMounted, ref } from 'vue';
const initialized = ref(false);
let editViewer;

const initDDV = async () => {
  DDV.Core.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ=="; // Public trial license which is valid for 24 hours
  DDV.Core.engineResourcePath = "assets/ddv-resources/engine";// Lead to a folder containing the distributed WASM files
  await DDV.Core.loadWasm();
  await DDV.Core.init(); 
  // Configure image filter feature which is in edit viewer
  DDV.setProcessingHandler("imageFilter", new DDV.ImageFilter());
  const config = DDV.getDefaultUiConfig("editViewer", {includeAnnotationSet: true}) as UiConfig;
  // Create an edit viewer
  editViewer = new DDV.EditViewer({
    container: "container",
    uiConfig: config,
  });
  initialized.value = true;
}

onMounted(()=>{
  if (initialized.value === false) {
    initDDV();
  }
})
</script>

<template>
  <div id="app">
    <h2>Document Viewer Demo</h2>
    <div v-if="!initialized">Initializing...</div>
    <div id="container"></div>
  </div>
</template>

<style scoped>
#app {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
}

#container {
  max-width: 80%;
  width: 1280px;
  height: 480px;
}
</style>
