<template>
  <div>
    <h2>Document Scanner</h2>
    <div id="viewer">
      <ClientOnly>
        <DocumentScanner @onWebTWAINReady="onWebTWAINReady"></DocumentScanner>
      </ClientOnly>
    </div>    
    <button @click="scan">Scan</button>
    <button @click="save">Save as PDF</button>
    <div>
      Powered by <a href="https://www.dynamsoft.com/web-twain/overview">Dynamic Web TWAIN</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { WebTwain } from 'dwt/dist/types/WebTwain';
let DWTObject:WebTwain|undefined;
const onWebTWAINReady = (dwt:WebTwain) => {
  DWTObject = dwt;
};

const scan = ()=> {
  if (DWTObject) {
    DWTObject.SelectSourceAsync()
      .then(function () {
        return DWTObject.AcquireImageAsync({
          IfCloseSourceAfterAcquire: true,
        });
      })
      .catch(function (exp) {
        alert(exp.message);
      });
  }
}

const save = ()=> {
  if (DWTObject) {
    DWTObject.SaveAllAsPDF("Scanned.pdf");
  }
}
</script>
<style lang="css" scoped>
#viewer {
  width: 320px;
  height: 320px;
}
</style>
