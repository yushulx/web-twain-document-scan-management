(function () {
  'use strict';
  const VERSION = '19.5.0';
  // Match the hosted/license-fallback convention used by other Codepool demos.
  const CODEPOOL_LICENSE_KEY = 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAwLTEwMTY0ODQ5MCIsIm1haW5TZXJ2ZXJVUkwiOiJodHRwczovL21sdHMuZHluYW1zb2Z0LmNvbS8iLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMCIsInN0YW5kYnlTZXJ2ZXJVUkwiOiJodHRwczovL3NsdHMuZHluYW1zb2Z0LmNvbS8iLCJjaGVja0NvZGUiOjE0MDA4MDY1Mjl9';
  const TRIAL_LICENSE_KEY = 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';
  const ids = ['connect', 'scanner', 'resolution', 'color', 'feeder', 'duplex', 'driver-ui', 'scan', 'import', 'previous', 'next', 'rotate', 'delete', 'clear', 'zoom-in', 'zoom-out', 'zoom-fit', 'zoom-original', 'zoom-level', 'virtual-setup', 'format', 'save', 'count', 'status', 'viewer', 'ocr-engine', 'ocr-language', 'ocr-run', 'ocr-pdf', 'ocr-text'];
  const ui = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
  let object = null;
  let devices = [];
  let busy = false;
  let sdkLoading = null;
  let instanceSequence = 0;
  let instanceId = null;
  let ocrEngines = [];
  let ocrReady = false;
  const analytics = window.DemoAnalytics || { ready() {}, action() {}, start() {}, success() {}, fail() {} };
  const host = window.location.hostname.toLowerCase();
  const isCodepoolHost = host === 'dynamsoft.com' || host.endsWith('.dynamsoft.com');
  const LICENSE = isCodepoolHost ? CODEPOOL_LICENSE_KEY : TRIAL_LICENSE_KEY;
  if (!isCodepoolHost) {
    console.info('[Web TWAIN Scanner] Using the public trial license outside dynamsoft.com.');
    analytics.action('license_fallback', { host: window.location.hostname });
  }

  function status(message, error = false) {
    ui.status.textContent = message;
    ui.status.dataset.error = String(error);
  }

  function update() {
    const count = object ? object.HowManyImagesInBuffer : 0;
    const index = object ? object.CurrentImageIndexInBuffer : -1;
    ui.count.textContent = count ? `Page ${index + 1} of ${count}` : '0 pages';
    ui.connect.disabled = busy;
    ui.scanner.disabled = busy || !devices.length;
    ui.scan.disabled = busy || !object || !devices.length || ui.scanner.value === '';
    ui.import.disabled = busy || !object;
    ['resolution', 'color', 'feeder', 'duplex', 'driver-ui', 'format'].forEach(id => { ui[id].disabled = busy; });
    ['rotate', 'delete', 'clear', 'save', 'zoom-in', 'zoom-out', 'zoom-fit', 'zoom-original'].forEach(id => { ui[id].disabled = busy || !count; });
    ui['zoom-level'].textContent = count ? `${Math.round(object.Viewer.zoom * 100)}%` : '—';
    ui['ocr-run'].disabled = busy || !count || !ocrReady;
    ui['ocr-pdf'].disabled = busy || !count || !ocrReady;
    ui['ocr-engine'].disabled = busy || !ocrReady;
    ui['ocr-language'].disabled = busy || !ocrReady;
    ui.previous.disabled = busy || count < 2 || index <= 0;
    ui.next.disabled = busy || count < 2 || index >= count - 1;
    ui.viewer.setAttribute('aria-busy', String(busy));
  }

  async function run(message, task) {
    if (busy) return;
    busy = true;
    status(message);
    update();
    try { await task(); }
    catch (error) {
      const detail = typeof error === 'string' ? error : (error.message || error.string || String(error));
      status(detail + ' Check the local service, scanner driver and license, then retry.', true);
      // Only a category is logged; SDK error strings can contain local paths.
      analytics.fail('document', 'scanner');
    } finally { busy = false; update(); }
  }

  function loadSDK() {
    if (window.Dynamsoft && window.Dynamsoft.DWT) return Promise.resolve();
    if (sdkLoading) return sdkLoading;
    sdkLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => fail(), 45000);
      function fail() {
        clearTimeout(timer);
        script.remove();
        sdkLoading = null;
        reject(new Error('The scanner SDK could not load. Check your network connection.'));
      }
      script.src = `https://cdn.jsdelivr.net/npm/dwt@${VERSION}/dist/dynamsoft.webtwain.min.js`;
      script.onload = () => {
        clearTimeout(timer);
        if (!window.Dynamsoft || !window.Dynamsoft.DWT) { fail(); return; }
        resolve();
      };
      script.onerror = fail;
      document.head.appendChild(script);
    });
    return sdkLoading;
  }

  function createObject() {
    return new Promise((resolve, reject) => {
      const dwt = window.Dynamsoft.DWT;
      const id = `codepoolScanner${++instanceSequence}`;
      instanceId = id;
      let finished = false;
      const timer = setTimeout(() => {
        finished = true;
        dwt.DeleteDWTObject(id);
        reject(new Error('Connection timed out. Install or restart the local service and click Connect again.'));
      }, 45000);
      dwt.ResourcesPath = `https://cdn.jsdelivr.net/npm/dwt@${VERSION}/dist/`;
      dwt.ServiceInstallerLocation = `https://unpkg.com/dwt@${VERSION}/dist/dist/`;
      dwt.ProductKey = LICENSE;
      dwt.AutoLoad = false;
      dwt.Containers = [];
      dwt.UseLocalService = true;
      dwt.CreateDWTObjectEx({ WebTwainId: id }, instance => {
        if (finished) { dwt.DeleteDWTObject(id); return; }
        finished = true;
        clearTimeout(timer);
        resolve(instance);
      }, error => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  function callbackTask(start) {
    return new Promise((resolve, reject) => start(resolve, (code, message) => reject(new Error(message || String(code)))));
  }

  // OCR Connector (19.5) exposes every engine the local service can drive: the OS
  // built-in OCR on Windows and macOS plus any ONNX Runtime engine. Linux is not supported.
  async function setupOCR() {
    const engineSelect = ui['ocr-engine'];
    const output = ui['ocr-text'];
    engineSelect.replaceChildren();
    ui['ocr-language'].replaceChildren();
    try {
      const info = await object.Addon.OCRConnector.GetInstalledOCRInfo();
      ocrEngines = (info && info.engines) || [];
      if (!ocrEngines.length) throw new Error('The local service reported no OCR engine.');
      ocrEngines.forEach(engine => engineSelect.add(new Option(engine.name, engine.name)));
      fillOCRLanguages(ocrEngines[0].name);
      ocrReady = true;
    } catch (error) {
      ocrReady = false;
      engineSelect.add(new Option('Not available', ''));
      output.hidden = false;
      output.textContent = 'OCR is not available here: ' + (error.message || error) +
        '\nOCR Connector runs on Windows and macOS only. Linux is not supported yet.';
    }
    update();
  }

  function fillOCRLanguages(engineName) {
    const select = ui['ocr-language'];
    const engine = ocrEngines.find(item => item.name === engineName);
    select.replaceChildren();
    ((engine && engine.languages) || []).forEach(language => select.add(new Option(language, language)));
  }

  function ocrOptions() {
    const options = { settings: { language: ui['ocr-language'].value } };
    if (ui['ocr-engine'].value) options.engine = { name: ui['ocr-engine'].value };
    return options;
  }

  function formatOCRText(result) {
    const lines = [];
    ((result && result.blocks) || []).forEach(block => {
      ((block && block.lines) || []).forEach(line => {
        const words = ((line && line.words) || []).map(word => word.value).join(' ');
        if (words) lines.push(words);
      });
    });
    return lines.join('\n').trim();
  }

  ui['ocr-engine'].addEventListener('change', () => fillOCRLanguages(ui['ocr-engine'].value));

  ui['ocr-run'].addEventListener('click', () => run('Recognizing text on the current page…', async () => {
    const index = object.CurrentImageIndexInBuffer;
    const result = await object.Addon.OCRConnector.Recognize(index, ocrOptions());
    ui['ocr-text'].hidden = false;
    ui['ocr-text'].textContent = formatOCRText(result) || 'No text was found on this page.';
    status('Text recognized. Nothing left this computer.');
    analytics.action('ocr_recognize', { pages: 1 });
  }));

  ui['ocr-pdf'].addEventListener('click', () => run('Building a searchable PDF…', async () => {
    const indices = Array.from({ length: object.HowManyImagesInBuffer }, (_, i) => i);
    const format = window.Dynamsoft.DWT.EnumDWT_OCRConnectorOutputFormat.PDF_WITH_EXTRA_TEXTLAYER;
    await object.Addon.OCRConnector.SaveToPath(indices, format, 'searchable-document.pdf');
    status('Searchable PDF saved. Every page carries an invisible text layer.');
    analytics.action('ocr_pdf', { pages: indices.length });
  }));

  ui.connect.addEventListener('click', () => run('Connecting to the local scanning service…', async () => {
    const start = Date.now();
    await loadSDK();
    if (!object) {
      const instance = await createObject();
      try {
        if (instance.Viewer.bind(ui.viewer) === false) throw new Error('Could not initialize document preview.');
        instance.Viewer.width = '100%';
        instance.Viewer.height = '100%';
        instance.Viewer.singlePageMode = true;
        instance.Viewer.zoomOrigin = { x: 'center', y: 'center' };
        instance.Viewer.cursor = 'pointer';
        instance.Viewer.show();
        const thumbnails = instance.Viewer.createThumbnailViewer({
          location: 'left', size: '26%', columns: 1, rows: 3,
          scrollDirection: 'vertical', pageMargin: 10,
          background: '#f5f5f5', border: '1px solid #ddd',
          allowKeyboardControl: true, allowPageDragging: false,
          selectedPageBorder: '2px solid #fe8e14',
          selectedPageBackground: '#fff3e5'
        });
        thumbnails.show();
        thumbnails.on('click', event => {
          if (busy || !Number.isInteger(event.index) || event.index < 0 || event.index >= instance.HowManyImagesInBuffer) return;
          instance.CurrentImageIndexInBuffer = event.index;
          update();
        });
        thumbnails.on('keydown', () => setTimeout(update, 0));
        instance.Viewer.on('click', () => setTimeout(update, 0));
        instance.Viewer.on('keydown', () => setTimeout(update, 0));
        instance.Viewer.on('pageRendered', update);
        instance.Viewer.on('resize', () => setTimeout(update, 0));
      } catch (error) {
        window.Dynamsoft.DWT.DeleteDWTObject(instanceId);
        throw error;
      }
      object = instance;
      const empty = document.getElementById('empty');
      if (empty) empty.remove();
      analytics.ready(Date.now() - start);
    }
    // Clear stale selections even if enumeration fails after a disconnected device.
    devices = [];
    ui.scanner.replaceChildren();
    devices = await object.GetDevicesAsync(undefined, true);
    ui['virtual-setup'].open = devices.length === 0;
    devices.forEach((device, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = device.displayName || device.name || `Scanner ${index + 1}`;
      ui.scanner.appendChild(option);
    });
    await setupOCR();
    status(devices.length ? `Connected. ${devices.length} scanner(s) available.` : 'Service connected. No scanners found. Install a virtual scanner using the links on the left, then refresh, or import images to try the preview and export tools.');
  }));

  ui.scan.addEventListener('click', () => run('Scanning… Finish or cancel in the scanner dialog.', async () => {
    const device = devices[Number(ui.scanner.value)];
    if (!device) throw new Error('Select a scanner first.');
    const before = object.HowManyImagesInBuffer;
    analytics.start('document', 'scanner');
    await object.SelectDeviceAsync(device);
    await object.AcquireImageAsync({
      IfShowUI: ui['driver-ui'].checked,
      IfCloseSourceAfterAcquire: true,
      IfFeederEnabled: ui.feeder.checked,
      IfDuplexEnabled: ui.feeder.checked && ui.duplex.checked,
      PixelType: Number(ui.color.value),
      Resolution: Number(ui.resolution.value)
    });
    const added = object.HowManyImagesInBuffer - before;
    status(added ? `Scanned ${added} page(s). Review the pages before saving.` : 'No pages added. Load paper and try again.');
    if (added) analytics.success('document', 'scanner', { page_count: added });
  }));

  function configurePdfReader() {
    const pdf = object.Addon && object.Addon.PDF;
    if (!pdf) throw new Error('This Dynamic Web TWAIN package does not expose its PDF addon.');
    const configured = pdf.SetReaderOptions({
      convertMode: window.Dynamsoft.DWT.EnumDWT_ConvertMode.CM_RENDERALL,
      renderOptions: { resolution: 200, renderAnnotations: true }
    });
    if (configured === false) {
      throw new Error(object.ErrorString || 'Could not configure the Dynamic Web TWAIN PDF rasterizer.');
    }
  }

  ui.import.addEventListener('change', () => {
    const files = Array.from(ui.import.files || []);
    if (!files.length) return;
    return run('Importing document files…', async () => {
      const before = object.HowManyImagesInBuffer;
      let pdfCount = 0;
      try {
        for (const file of files) {
          const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
          if (isPdf) {
            configurePdfReader();
            pdfCount += 1;
            status('Rasterizing PDF with Dynamic Web TWAIN…');
          }
          await callbackTask((success, failure) => object.LoadImageFromBinary(file, success, failure));
        }
        const added = object.HowManyImagesInBuffer - before;
        status(`Imported ${files.length} file(s), ${added} page(s)${pdfCount ? `, including ${pdfCount} PDF(s)` : ''}.`);
        analytics.action('file_import', { file_count: files.length, page_count: added, pdf_count: pdfCount });
      } finally { ui.import.value = ''; }
    });
  });

  function edit(id, operation) {
    ui[id].addEventListener('click', () => run('Updating pages…', async () => {
      if (operation() === false) throw new Error(object.ErrorString || 'Could not update the page.');
      status('Pages updated.');
    }));
  }
  edit('previous', () => { object.CurrentImageIndexInBuffer -= 1; });
  edit('next', () => { object.CurrentImageIndexInBuffer += 1; });
  edit('rotate', () => object.RotateRight(object.CurrentImageIndexInBuffer));
  edit('delete', () => object.RemoveImage(object.CurrentImageIndexInBuffer));
  edit('clear', () => object.RemoveAllImages());

  function zoom(id, operation) {
    ui[id].addEventListener('click', () => {
      if (busy || !object || !object.HowManyImagesInBuffer) return;
      operation(object.Viewer);
      update();
    });
  }
  zoom('zoom-in', viewer => { viewer.zoom = Math.min(65, viewer.zoom * 1.25); });
  zoom('zoom-out', viewer => { viewer.zoom = Math.max(0.02, viewer.zoom / 1.25); });
  zoom('zoom-fit', viewer => viewer.fitWindow());
  zoom('zoom-original', viewer => { viewer.zoom = 1; });

  ui.save.addEventListener('click', () => run('Preparing your download…', async () => {
    const format = ui.format.value;
    const types = window.Dynamsoft.DWT.EnumDWT_ImageType;
    const type = { pdf: types.IT_PDF, tiff: types.IT_TIF, png: types.IT_PNG }[format];
    const indices = format === 'png' ? [object.CurrentImageIndexInBuffer] : Array.from({ length: object.HowManyImagesInBuffer }, (_, i) => i);
    const blob = await callbackTask((success, failure) => object.ConvertToBlob(indices, type, success, failure));
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scanned-document.${format === 'tiff' ? 'tif' : format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    analytics.action('download', { format, page_count: indices.length });
    status('Download prepared. Your documents have not been uploaded.');
  }));
  update();
})();
