<template>
  <div ref='viewer' id='dwtcontrolContainer'></div>
</template>
<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue';
import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';

const emit = defineEmits(['onWebTWAINReady']);
const viewer = ref(null);
const ContainerId = 'dwtcontrolContainer';
let DWObject:WebTwain|undefined;

const initDWT = () => {
  Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
    DWObject = Dynamsoft.DWT.GetWebTwain(ContainerId);
    DWObject.Viewer.width = "100%";
    DWObject.Viewer.height = "100%";
    emit('onWebTWAINReady',DWObject);
  });

  Dynamsoft.DWT.ResourcesPath = 'assets/dwt-resources';
  Dynamsoft.DWT.Containers = [{
    WebTwainId: 'dwtObject',
    ContainerId: ContainerId
  }];
  Dynamsoft.DWT.Load();
}

onMounted(async () => {
  initDWT();
});
</script>
<style lang="css" scoped>
#dwtcontrolContainer {
  width: 100%;
  height: 100%;
}
</style>