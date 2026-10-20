<template>
  <q-page class="index">
    <div class="row container">
      <div class="col-8" id="left">
        <div class="toolbar">
          <q-btn class="toolbar-btn" v-on:click="deleteSelected" icon="delete" />
          <q-btn class="toolbar-btn" v-on:click="edit" icon="edit" />
          <q-btn class="toolbar-btn" v-on:click="rotate" icon="rotate_right" />
          <q-btn class="toolbar-btn" v-on:click="moveUp" icon="arrow_upward" />
          <q-btn class="toolbar-btn" v-on:click="moveDown" icon="arrow_downward" />
          <div v-if="isElectron">
            <q-dialog v-model="showOCRResult">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Result</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                  <pre>
                    {{OCRResult}}
                  </pre>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="OK" color="primary" v-close-popup />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </div>
          <q-btn v-if="isElectron" class="toolbar-btn" v-on:click="recognizeSelected">
            <img :src="OCR"/>
          </q-btn>
        </div>
        <div class="dwt">
          <DWT
            ref="dwtElement" 
            width="100%" 
            height="100%" 
            cols="2"
            rows="2"
            @onWebTWAINReady="onWebTWAINReady"
            @onWebTWAINNotFound="onWebTWAINNotFound">
          </DWT>
          <q-dialog v-model="confirm" persistent>
            <q-card>
              <q-card-section>
                <div>Dynamsoft Service is not found. Please download and install it first.</div>
                <div v-for="(installer, index) in serviceInstallers" :key="index">
                  <div><a :href='`assets/dwt-resources/dist/${installer}`'>{{ installer }}</a></div>
                </div>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Reconnect to the service" color="primary" v-close-popup v-on:click="reconnect" />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </div>
      </div>
      <div class="col-4" id="right">
        <q-list bordered class="rounded-borders">
          <q-expansion-item
            :model-value="true"
            expand-separator
            label="Scan"
          >
          <div class="inner">
            <q-select v-model="selectedScanner" :options="scanners" label="Selected Scanner" />
            <q-checkbox left-label v-model="showUI" label="Show UI" />
            <q-checkbox left-label v-model="feederEnabled" label="Auto Feeder" />
            <q-checkbox left-label v-model="duplexEnabled" label="Duplex" />
            <q-input
              v-model.number="resolution"
              type="number"
              style="max-width: 200px"
            >
            <template v-slot:before>
              <span style="font-size: 14px;color: black;">Resolution:</span>
            </template>
            </q-input>
            <div>
              <span>Pixel Type:</span>
              <q-radio v-model="pixelType" val="0" label="B&W" />
              <q-radio v-model="pixelType" val="1" label="Gray" />
              <q-radio v-model="pixelType" val="2" label="Color" />
            </div>
            
            <q-btn outline class="button" color="black" label="Scan" v-on:click="scan" />
          </div>
          </q-expansion-item>
          <q-expansion-item
            :model-value="true"
            expand-separator
            label="Save"
          >
            <div class="inner">
              <q-input outlined v-model="filename" label="Filename" />
              <q-btn outline class="button" color="black" label="Save as PDF" v-on:click="save" />
            </div>
          </q-expansion-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import DWT from 'components/DWT.vue';
import { WebTwain } from 'dwt/dist/types/WebTwain';
import { DeviceConfiguration } from 'dwt/dist/types/WebTwain.Acquire';
import { onMounted, ref } from 'vue';
import { Platform } from 'quasar';
import OCR from '../assets/ocr.svg';

let DWObject:WebTwain|undefined;
const selectedScanner = ref("");
const showUI = ref(false);
const feederEnabled = ref(false);
const duplexEnabled = ref(false);
const resolution = ref(200);
const pixelType = ref("0");
const scanners = ref([] as string[]);
const filename = ref("Scanned");
const confirm = ref(false);
const dwtElement = ref<any>();
const serviceInstallers = ref([] as string[]);
const isElectron = ref(false);
const OCRResult = ref("");
const showOCRResult = ref(false);

onMounted(async () => {
  if (Platform.is.electron) {
    isElectron.value = true;
  }
});

const loadScanners = () => {
  if (DWObject) {
    let sourceNames = DWObject.GetSourceNames(false) as string[]; 
    scanners.value = sourceNames;
    if (sourceNames.length > 0 ) {
      selectedScanner.value = sourceNames[0];
    }
  }
}

const scan = () => {
  if (DWObject) {
    let selectedIndex = scanners.value.indexOf(selectedScanner.value);
    let deviceConfiguration:DeviceConfiguration = {};
      deviceConfiguration.IfShowUI = showUI.value;
      deviceConfiguration.IfFeederEnabled = feederEnabled.value;
      deviceConfiguration.IfDuplexEnabled = duplexEnabled.value;
      deviceConfiguration.SelectSourceByIndex = selectedIndex;
      deviceConfiguration.Resolution = resolution.value;
      deviceConfiguration.PixelType = pixelType.value;
      console.log(deviceConfiguration);
      DWObject.AcquireImage(deviceConfiguration);
  }
}

const save = () => {
  if (DWObject) {
    DWObject.SaveAllAsPDF(filename.value);
  }
}

const deleteSelected = () => {
  if (DWObject) {
    DWObject.RemoveAllSelectedImages();
  }
}

const edit = () => {
  if (DWObject) {
    let imageEditor = DWObject.Viewer.createImageEditor();
    imageEditor.show();
  }
}

const rotate = () => {
  if (DWObject) {
    DWObject.RotateRight(DWObject.CurrentImageIndexInBuffer);
  }
}

const moveUp = () => {
  if (DWObject) {
    DWObject.MoveImage(DWObject.CurrentImageIndexInBuffer,DWObject.CurrentImageIndexInBuffer-1);
  }
}

const moveDown = () => {
  if (DWObject) {
    DWObject.MoveImage(DWObject.CurrentImageIndexInBuffer,DWObject.CurrentImageIndexInBuffer+1);
  }
}

const onWebTWAINReady = (dwt:WebTwain) => {
  console.log("web twain ready");
  console.log(dwt);
  DWObject = dwt;
  loadScanners();
};

const onWebTWAINNotFound = () => {
  console.log("web twain not found");
  const platform = Platform.is.platform;
  console.log(platform);
  if (platform === 'win') {
    serviceInstallers.value = ['DynamsoftServiceSetup.msi'];
  }else if (platform === 'mac') {
    serviceInstallers.value = ['DynamsoftServiceSetup.pkg'];
  }else {
    serviceInstallers.value = ['DynamsoftServiceSetup.rpm','DynamsoftServiceSetup.deb','DynamsoftServiceSetup-arm64.deb']; 
  }
  confirm.value = true;
}

const reconnect = () => {
  if (dwtElement.value) {
    dwtElement.value.reconnect();
  }
}

const recognizeSelected = async () => {
  if (DWObject) {
    DWObject.IfShowFileDialog = false;
    let windowAny = window as any;
    let imgPath = windowAny.myAPI.tmpDir() + "/out.jpg";
    console.log(imgPath);
    //If the current image is B&W
    //1 is B&W, 8 is Gray, 24 is RGB
    if (DWObject.GetImageBitDepth(DWObject.CurrentImageIndexInBuffer) == 1) {
      //If so, convert the image to Gray
      DWObject.ConvertToGrayScale(DWObject.CurrentImageIndexInBuffer);
    }
    DWObject.SaveAsJPEG(imgPath,DWObject.CurrentImageIndexInBuffer,
    function() {
      const OCR = async () => {
        let text = await windowAny.myAPI.recognize(imgPath);
        OCRResult.value = text;
        showOCRResult.value = true;
      }
      OCR();
    },
    function() {
      console.log("failed");
    });
  }
}

</script>

<style>
.index {
  height: calc(100% - 50px);
}

.container {
  width: 100%;
  height: 100%;
  padding: 10px;
  position: absolute;
}

.inner {
  padding: 10px;
}

.button {
  margin-top: 10px;
}

#left {
  display: flex;
  height: 100%;
}

#right {
  height: 100%;
  overflow: auto;
}

.toolbar {
  width: 50px;
  height: 100%;
  overflow: auto;
  padding: 5px;
  font-size: 21px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

.dwt {
  width: calc(100% - 50px);
  height: 100%;
}

.toolbar-btn {
  width: 100%;
}

</style>