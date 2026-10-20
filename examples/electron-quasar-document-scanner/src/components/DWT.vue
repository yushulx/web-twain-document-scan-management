<template>
  <div ref='viewer' id='dwtcontrolContainer'></div>
</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue';
import Dynamsoft from 'dwt';
import { WebTwain } from 'dwt/dist/types/WebTwain';

const props = defineProps(['width','height','cols','rows','license']);
const emit = defineEmits(['onWebTWAINReady','onWebTWAINNotFound']);
const viewer = ref(null);
const ContainerId = 'dwtcontrolContainer';
let DWObject:WebTwain|undefined;

const initDWT = () => {
  Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
    DWObject = Dynamsoft.DWT.GetWebTwain(ContainerId);
    DWObject.Viewer.width = "100%";
    DWObject.Viewer.height = "100%";
    resizeViewer();
    updateViewMode();
    emit('onWebTWAINReady',DWObject);
  });
  if (props.license) {
    Dynamsoft.DWT.ProductKey = props.license;
  }

  const notfound = () => {
    emit('onWebTWAINNotFound');
  }

  let DynamsoftAny:any = Dynamsoft;
  DynamsoftAny.OnWebTwainNotFoundOnWindowsCallback = notfound;
  DynamsoftAny.OnWebTwainNotFoundOnMacCallback = notfound;
  DynamsoftAny.OnWebTwainNotFoundOnLinuxCallback = notfound;

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

const resizeViewer = () => {
  if (viewer.value && DWObject) {
    let ele = viewer.value as HTMLElement;
    if (props.width) {
      ele.style.width = props.width;
    }
    if (props.height) {
      ele.style.height = props.height;
    }
  }
}

const updateViewMode = () => {
  if (props.cols && props.rows && DWObject) {
    DWObject.Viewer.setViewMode(parseInt(props.cols),parseInt(props.rows));
  }
}

watch(() => [props.width,props.height], ([newWidth,oldWidth], [newHeight,oldHeight]) => {
  resizeViewer();
});

watch(() => [props.cols,props.rows], ([newCols,oldCols], [newRows,oldRows]) => {
  updateViewMode();
});

const reconnect = () => {
  let dwtport = 18622;
  let DynamsoftAny:any = Dynamsoft;
  if (location.protocol == "https:") {
    dwtport = 18623;
  }
  DynamsoftAny.DWT.CheckConnectToTheService("127.0.0.1",
    dwtport, 
    function () {
      initDWT();
    }, 
    function () {
      emit('onWebTWAINNotFound');
    }
  );
}

defineExpose({
  reconnect
})
</script>
