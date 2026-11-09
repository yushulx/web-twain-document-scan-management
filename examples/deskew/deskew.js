/* Auto-deskew a scanned page with OpenCV.js.
   Baseline implementation of the text-line contour algorithm described in
   https://www.dynamsoft.com/codepool/deskew-scanned-document.html
   Perspective-distorted photos need a real document detector — see the banner. */

(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    engineBadge: $('engineBadge'), engineText: $('engineText'),
    sample1: $('sample1Btn'), sample2: $('sample2Btn'), upload: $('uploadBtn'),
    file: $('fileInput'), dropZone: $('dropZone'), hint: $('stageHint'),
    source: $('sourceImage'), overlay: $('overlay'),
    result: $('resultImage'), empty: $('emptyState'),
    detect: $('detectBtn'), download: $('downloadBtn'),
    slider: $('angleSlider'), angleValue: $('angleValue'),
    inputMeta: $('inputMeta'), outputMeta: $('outputMeta'),
    status: $('statusMessage'),
    metricAngle: $('metricAngle'), metricApplied: $('metricApplied'),
    metricContours: $('metricContours'), metricTime: $('metricTime')
  };

  const state = { cv: null, src: null, resultCanvas: null, angle: null, rects: [], busy: false };

  function setEngine(stateName, text) {
    els.engineBadge.dataset.state = stateName;
    els.engineText.textContent = text;
  }
  function setStatus(text, tone) {
    els.status.textContent = text;
    if (tone) els.status.dataset.tone = tone;
  }
  function setAngleLabel(v) { els.angleValue.textContent = Number(v).toFixed(1) + '°'; }

  function waitForOpenCV(timeoutMs) {
    if (window.cv && window.cv.Mat) return Promise.resolve();
    return new Promise((resolve, reject) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true; clearInterval(poll); clearTimeout(timer);
        window.removeEventListener('opencv-ready', finish); resolve();
      };
      const fail = () => {
        if (done) return;
        done = true; clearInterval(poll); clearTimeout(timer);
        window.removeEventListener('opencv-ready', finish);
        reject(new Error('OpenCV.js did not become ready in time'));
      };
      window.addEventListener('opencv-ready', finish, { once: true });
      const poll = window.setInterval(() => { if (window.cv && window.cv.Mat) finish(); }, 200);
      const timer = window.setTimeout(fail, timeoutMs || 45000);
    });
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      els.source.onload = () => {
        state.src = null;
        els.hint.classList.add('is-hidden');
        els.inputMeta.textContent = els.source.naturalWidth + ' × ' + els.source.naturalHeight + ' px';
        clearResult();
        resolve();
      };
      els.source.onerror = () => reject(new Error('Could not load the image'));
      els.source.src = src;
    });
  }

  function clearResult() {
    state.resultCanvas = null; state.angle = null; state.rects = [];
    els.result.removeAttribute('src');
    els.empty.classList.remove('is-hidden');
    els.outputMeta.textContent = '—';
    els.metricAngle.textContent = '—';
    els.metricApplied.textContent = '—';
    els.metricContours.textContent = '—';
    els.metricTime.textContent = '—';
    els.download.disabled = true;
    const ctx = els.overlay.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
  }

  // Work at the image's natural resolution; cv.imread() uses an element's DOM size.
  function readSource(cv) {
    const work = document.createElement('canvas');
    work.width = els.source.naturalWidth;
    work.height = els.source.naturalHeight;
    work.getContext('2d').drawImage(els.source, 0, 0);
    return cv.imread(work);
  }

  function detectAngle(cv, src) {
    const gray = new cv.Mat(), blur = new cv.Mat(), inv = new cv.Mat();
    const thresh = new cv.Mat(), dilate = new cv.Mat();
    const contours = new cv.MatVector(), hierarchy = new cv.Mat();
    let kernel = null;
    let result = { median: null, count: 0, rects: [] };
    try {
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, blur, new cv.Size(9, 9), 0);
      // A white frame suppresses scanner edge lines, as in the Python tutorial.
      cv.rectangle(blur, new cv.Point(0, 0), new cv.Point(blur.cols - 1, blur.rows - 1), new cv.Scalar(255), 10);
      cv.bitwise_not(blur, inv);
      cv.threshold(inv, thresh, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
      kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(30, 5));
      cv.dilate(thresh, dilate, kernel);
      cv.findContours(dilate, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

      const angles = [];
      for (let i = 0; i < contours.size(); i++) {
        const c = contours.get(i);
        if (cv.contourArea(c) < 100) continue;
        const r = cv.minAreaRect(c);
        let a = r.angle;
        while (a > 45) a -= 90;
        while (a < -45) a += 90;
        if (Math.abs(a) < 0.15 || Math.abs(a) > 20) continue;
        angles.push(a);
        if (result.rects.length < 50) {
          // Show the detected text-line region as an axis-aligned box; the
          // rotated rect's angle/size mapping differs across OpenCV builds.
          const box = cv.boundingRect(c);
          result.rects.push({ x: box.x, y: box.y, w: box.width, h: box.height });
        }
      }
      angles.sort((x, y) => x - y);
      result.count = angles.length;
      result.median = angles.length ? angles[Math.floor(angles.length / 2)] : null;
    } finally {
      [gray, blur, inv, thresh, kernel, dilate, contours, hierarchy].forEach((m) => {
        try { if (m && typeof m.delete === 'function') m.delete(); } catch (e) { /* already freed */ }
      });
    }
    return result;
  }

  function rotate(cv, src, angleDeg) {
    const dst = new cv.Mat();
    const center = new cv.Point(src.cols / 2, src.rows / 2);
    const M = cv.getRotationMatrix2D(center, angleDeg, 1);
    cv.warpAffine(src, dst, M, new cv.Size(src.cols, src.rows), cv.INTER_LINEAR,
      cv.BORDER_CONSTANT, new cv.Scalar(255, 255, 255, 255));
    M.delete();
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, dst);
    dst.delete();
    return canvas;
  }

  function drawOverlay(rects, angle) {
    const stage = els.dropZone.getBoundingClientRect();
    const img = els.source.getBoundingClientRect();
    if (!els.source.naturalWidth || !img.width) return;
    els.overlay.width = stage.width; els.overlay.height = stage.height;
    els.overlay.style.width = stage.width + 'px'; els.overlay.style.height = stage.height + 'px';
    const ctx = els.overlay.getContext('2d');
    ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
    const scale = img.width / els.source.naturalWidth;
    const ox = img.left - stage.left, oy = img.top - stage.top;

    ctx.strokeStyle = 'rgba(79, 195, 247, 0.95)';
    ctx.lineWidth = 2;
    rects.forEach((r) => {
      ctx.strokeRect(ox + r.x * scale, oy + r.y * scale, r.w * scale, r.h * scale);
    });

    // Level reference and detected tilt through the middle of the page.
    const cx = ox + (els.source.naturalWidth / 2) * scale;
    const cy = oy + (els.source.naturalHeight / 2) * scale;
    const half = Math.min(img.width, img.height) * 0.42;
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(233, 244, 251, 0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - half, cy); ctx.lineTo(cx + half, cy); ctx.stroke();
    ctx.setLineDash([]);
    const rad = angle * Math.PI / 180;
    const x1 = cx - half * Math.cos(rad), y1 = cy - half * Math.sin(rad);
    const x2 = cx + half * Math.cos(rad), y2 = cy + half * Math.sin(rad);
    ctx.strokeStyle = '#fe8e14'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    [ [x1, y1], [x2, y2] ].forEach(([px, py]) => {
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#fe8e14'; ctx.fill();
    });

    const label = rects.length + ' text-line regions  ·  orange = measured tilt';
    ctx.font = '600 11px "Segoe UI", system-ui, sans-serif';
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(7, 24, 39, 0.88)';
    ctx.fillRect(12, 12, tw + 20, 26);
    ctx.fillStyle = '#e9f4fb';
    ctx.fillText(label, 22, 29);
  }

  function renderResult(angle) {
    if (!state.src) return;
    const cv = state.cv;
    const canvas = rotate(cv, state.src, angle);
    state.resultCanvas = canvas;
    els.result.src = canvas.toDataURL('image/png');
    els.empty.classList.add('is-hidden');
    els.outputMeta.textContent = canvas.width + ' × ' + canvas.height + ' px';
    els.metricApplied.textContent = angle.toFixed(2) + '°';
    els.download.disabled = false;
  }

  function runDetection() {
    if (!state.cv || !els.source.naturalWidth || state.busy) return;
    state.busy = true;
    els.detect.classList.add('is-busy');
    setStatus('Grayscale → blur → Otsu → dilate → contours → median angle → warpAffine', 'info');
    window.setTimeout(() => {
      try {
        const cv = state.cv;
        const started = performance.now();
        if (!state.src) state.src = readSource(cv);
        const found = detectAngle(cv, state.src);
        const elapsed = performance.now() - started;
        if (found.median === null) {
          setStatus('No reliable text-line angle found. Try a sharper scan or set the angle manually.', 'warn');
          state.angle = 0;
        } else {
          state.angle = found.median;
          state.rects = found.rects;
          const clamped = Math.max(-15, Math.min(15, found.median));
          els.slider.value = String(clamped);
          setAngleLabel(clamped);
          drawOverlay(found.rects, clamped);
        }
        els.metricAngle.textContent = found.median === null ? 'n/a' : found.median.toFixed(2) + '°';
        els.metricContours.textContent = String(found.count);
        els.metricTime.textContent = elapsed.toFixed(0) + ' ms';
        renderResult(Number(els.slider.value));
        setStatus(found.median === null
          ? 'Detection inconclusive — adjust the angle slider and try again.'
          : 'Deskewed. Adjust the correction angle if the page still looks tilted.', 'ok');
      } catch (e) {
        setStatus('Detection failed: ' + e.message, 'error');
      } finally {
        state.busy = false;
        els.detect.classList.remove('is-busy');
      }
    }, 40);
  }

  function readFile(file) {
    if (!file || !file.type.startsWith('image/')) { setStatus('Please choose an image file.', 'warn'); return; }
    const reader = new FileReader();
    reader.onload = () => loadImage(reader.result).then(() => setStatus('Image loaded. Run detection.', 'info'));
    reader.onerror = () => setStatus('Could not read that file.', 'error');
    reader.readAsDataURL(file);
  }

  function bind() {
    els.sample1.addEventListener('click', () => loadImage('samples/1.jpg').then(() => setStatus('Sample 1 loaded. Run detection.', 'info')));
    els.sample2.addEventListener('click', () => loadImage('samples/2.jpg').then(() => setStatus('Sample 2 loaded. Run detection.', 'info')));
    els.upload.addEventListener('click', () => els.file.click());
    els.file.addEventListener('change', () => { if (els.file.files[0]) readFile(els.file.files[0]); els.file.value = ''; });
    els.detect.addEventListener('click', runDetection);
    els.download.addEventListener('click', () => {
      if (!state.resultCanvas) return;
      const a = document.createElement('a');
      a.download = 'deskewed-document.png'; a.href = state.resultCanvas.toDataURL('image/png'); a.click();
      setStatus('Saved deskewed-document.png.', 'ok');
    });
    els.slider.addEventListener('input', () => setAngleLabel(els.slider.value));
    els.slider.addEventListener('change', () => {
      if (!state.resultCanvas) return;
      renderResult(Number(els.slider.value));
      setStatus('Re-rotated with a ' + Number(els.slider.value).toFixed(1) + '° correction.', 'info');
    });
    ['dragenter', 'dragover'].forEach((t) => els.dropZone.addEventListener(t, (e) => {
      e.preventDefault(); els.dropZone.classList.add('is-dragover');
    }));
    ['dragleave', 'drop'].forEach((t) => els.dropZone.addEventListener(t, (e) => {
      e.preventDefault(); els.dropZone.classList.remove('is-dragover');
    }));
    els.dropZone.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) readFile(f); });
    window.addEventListener('resize', () => { if (state.rects.length) drawOverlay(state.rects, Number(els.slider.value)); });
  }

  async function start() {
    bind();
    setAngleLabel(0);
    try {
      await waitForOpenCV();
      state.cv = window.cv;
      setEngine('ready', 'OpenCV.js 4.13.0 ready');
      els.detect.disabled = false;
      await loadImage('samples/1.jpg');
      setStatus('Sample 1 loaded. Click “Detect & deskew” to measure the skew angle.', 'ok');
    } catch (e) {
      setEngine('error', 'OpenCV.js unavailable');
      setStatus(e.message + ' — check the CDN connection and reload.', 'error');
    }
  }

  void start();
})();
