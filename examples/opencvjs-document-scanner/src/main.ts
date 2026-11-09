import './style.css';
import { DocumentScanner, type Point } from './document-scanner';

const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

const els = {
  engineBadge: byId<HTMLDivElement>('engineBadge'),
  engineText: byId<HTMLSpanElement>('engineText'),
  sampleBtn: byId<HTMLButtonElement>('sampleBtn'),
  uploadBtn: byId<HTMLButtonElement>('uploadBtn'),
  detectBtn: byId<HTMLButtonElement>('detectBtn'),
  downloadBtn: byId<HTMLButtonElement>('downloadBtn'),
  canny: byId<HTMLInputElement>('cannyToggle'),
  fileInput: byId<HTMLInputElement>('fileInput'),
  dropZone: byId<HTMLDivElement>('dropZone'),
  stageHint: byId<HTMLDivElement>('stageHint'),
  source: byId<HTMLImageElement>('sourceImage'),
  overlay: byId<HTMLCanvasElement>('overlay'),
  result: byId<HTMLImageElement>('resultImage'),
  emptyState: byId<HTMLDivElement>('emptyState'),
  resultStage: byId<HTMLDivElement>('resultStage'),
  inputMeta: byId<HTMLSpanElement>('inputMeta'),
  outputMeta: byId<HTMLSpanElement>('outputMeta'),
  status: byId<HTMLDivElement>('statusMessage'),
  metricTime: byId<HTMLElement>('metricTime'),
  metricSize: byId<HTMLElement>('metricSize'),
  metricCorners: byId<HTMLElement>('metricCorners'),
};

let scanner: DocumentScanner | null = null;
let points: Point[] | null = null;
let normalized: HTMLCanvasElement | null = null;

function setEngine(state: 'loading' | 'ready' | 'error', text: string): void {
  els.engineBadge.dataset.state = state;
  els.engineText.textContent = text;
}

function setStatus(message: string, tone: 'info' | 'ok' | 'warn' | 'error' = 'info'): void {
  els.status.textContent = message;
  els.status.dataset.tone = tone;
}

function waitForOpenCV(timeoutMs = 45000): Promise<void> {
  if ((window as any).cv?.Mat) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(timer);
      window.removeEventListener('opencv-ready', finish);
      resolve();
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(timer);
      window.removeEventListener('opencv-ready', finish);
      reject(new Error('OpenCV.js did not become ready in time'));
    };
    window.addEventListener('opencv-ready', finish, { once: true });
    // The event may have fired before this module ran, so also poll.
    const poll = window.setInterval(() => {
      if ((window as any).cv?.Mat) finish();
    }, 200);
    const timer = window.setTimeout(fail, timeoutMs);
  });
}

function loadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    els.source.onload = () => {
      els.stageHint.classList.add('is-hidden');
      els.inputMeta.textContent = `${els.source.naturalWidth} × ${els.source.naturalHeight} px`;
      clearResult();
      resolve();
    };
    els.source.onerror = () => reject(new Error('Could not load the image'));
    els.source.src = src;
  });
}

function clearResult(): void {
  points = null;
  normalized = null;
  els.result.removeAttribute('src');
  els.emptyState.classList.remove('is-hidden');
  els.outputMeta.textContent = '—';
  els.metricTime.textContent = '—';
  els.metricSize.textContent = '—';
  els.metricCorners.textContent = '—';
  els.downloadBtn.disabled = true;
  const ctx = els.overlay.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
}

function drawOverlay(corners: Point[]): void {
  const stageRect = els.dropZone.getBoundingClientRect();
  const imgRect = els.source.getBoundingClientRect();
  if (!els.source.naturalWidth || !imgRect.width) return;

  els.overlay.width = stageRect.width;
  els.overlay.height = stageRect.height;
  els.overlay.style.width = `${stageRect.width}px`;
  els.overlay.style.height = `${stageRect.height}px`;

  const scale = imgRect.width / els.source.naturalWidth;
  const offsetX = imgRect.left - stageRect.left;
  const offsetY = imgRect.top - stageRect.top;
  const mapped = corners.map((p) => ({ x: offsetX + p.x * scale, y: offsetY + p.y * scale }));

  const ctx = els.overlay.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);

  ctx.beginPath();
  ctx.moveTo(mapped[0].x, mapped[0].y);
  for (let i = 1; i < mapped.length; i++) ctx.lineTo(mapped[i].x, mapped[i].y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(79, 195, 247, 0.13)';
  ctx.fill();
  ctx.strokeStyle = '#4fc3f7';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([]);
  ctx.stroke();

  mapped.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#fe8e14';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = '600 11px Consolas, monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(String(i + 1), p.x + 11, p.y - 9);
  });
}

function detect(): void {
  if (!scanner || !els.source.naturalWidth) return;
  els.detectBtn.classList.add('is-busy');
  setStatus('Running grayscale → blur → Otsu threshold → contours → warpPerspective…', 'info');

  // Let the browser paint the busy state before the synchronous WASM work.
  window.setTimeout(() => {
    try {
      const started = performance.now();
      // cv.imread() uses an element's DOM width/height, not its natural size.
      // Feed detection an offscreen canvas at full resolution so the quad and
      // the corrected page do not depend on how the image happens to be displayed.
      const working = document.createElement('canvas');
      working.width = els.source.naturalWidth;
      working.height = els.source.naturalHeight;
      working.getContext('2d')!.drawImage(els.source, 0, 0);
      const found = scanner!.detect(working, { useCanny: els.canny.checked });
      const elapsed = performance.now() - started;

      if (!found || found.length !== 4 || found.some((p) => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) {
        setStatus('No document boundary found. Try a higher-contrast image or enable Canny edges.', 'warn');
        els.detectBtn.classList.remove('is-busy');
        return;
      }

      const canvas = scanner!.crop(working, found);
      points = found;
      normalized = canvas;
      drawOverlay(found);

      els.result.src = canvas.toDataURL('image/png');
      els.emptyState.classList.add('is-hidden');
      els.outputMeta.textContent = `${canvas.width} × ${canvas.height} px`;
      els.metricTime.textContent = `${elapsed.toFixed(0)} ms`;
      els.metricSize.textContent = `${canvas.width}×${canvas.height}`;
      els.metricCorners.textContent = '4';
      els.downloadBtn.disabled = false;
      setStatus(`Document normalized${els.canny.checked ? ' with Canny edges' : ''}. You can download the corrected page.`, 'ok');
    } catch (error) {
      setStatus(`Detection failed: ${(error as Error).message}`, 'error');
    } finally {
      els.detectBtn.classList.remove('is-busy');
    }
  }, 40);
}

function download(): void {
  if (!normalized) return;
  const link = document.createElement('a');
  link.download = 'normalized-document.png';
  link.href = normalized.toDataURL('image/png');
  link.click();
  setStatus('Saved normalized-document.png.', 'ok');
}

function readFile(file: File): void {
  if (!file.type.startsWith('image/')) {
    setStatus('Please choose an image file.', 'warn');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    loadImage(reader.result as string)
      .then(() => setStatus(`${file.name} loaded. Run detection when ready.`, 'info'))
      .catch(() => setStatus('Could not read that image.', 'error'));
  };
  reader.onerror = () => setStatus('Could not read that file.', 'error');
  reader.readAsDataURL(file);
}

function bindEvents(): void {
  els.uploadBtn.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', () => {
    if (els.fileInput.files?.[0]) readFile(els.fileInput.files[0]);
    els.fileInput.value = '';
  });
  els.sampleBtn.addEventListener('click', () => {
    loadImage('/sample-document.jpg')
      .then(() => setStatus('Sample document loaded. Run detection when ready.', 'info'))
      .catch(() => setStatus('Sample image is missing.', 'error'));
  });
  els.detectBtn.addEventListener('click', detect);
  els.downloadBtn.addEventListener('click', download);
  els.canny.addEventListener('change', () => {
    setStatus(els.canny.checked
      ? 'Canny edge detection enabled — useful for uneven lighting. Run detection again.'
      : 'Otsu thresholding selected. Run detection again.', 'info');
  });

  ['dragenter', 'dragover'].forEach((type) => {
    els.dropZone.addEventListener(type, (e) => {
      e.preventDefault();
      els.dropZone.classList.add('is-dragover');
    });
  });
  ['dragleave', 'drop'].forEach((type) => {
    els.dropZone.addEventListener(type, (e) => {
      e.preventDefault();
      els.dropZone.classList.remove('is-dragover');
    });
  });
  els.dropZone.addEventListener('drop', (e) => {
    const file = (e as DragEvent).dataTransfer?.files?.[0];
    if (file) readFile(file);
  });
  window.addEventListener('resize', () => {
    if (points) drawOverlay(points);
  });
  // Showing the result can change the panel height and re-center the input
  // image. Redraw the quad after that layout settles, and on any size change.
  els.result.addEventListener('load', () => {
    if (points) window.requestAnimationFrame(() => drawOverlay(points!));
  });
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      if (points) drawOverlay(points);
    }).observe(els.source);
  }
}

async function start(): Promise<void> {
  bindEvents();
  try {
    await waitForOpenCV();
    scanner = new DocumentScanner();
    setEngine('ready', 'OpenCV.js 4.8.0 ready');
    els.detectBtn.disabled = false;
    await loadImage('/sample-document.jpg');
    setStatus('Sample document loaded. Click “Detect & normalize” to run the pipeline.', 'ok');
  } catch (error) {
    setEngine('error', 'OpenCV.js unavailable');
    setStatus(`${(error as Error).message}. Check the CDN connection and reload.`, 'error');
  }
}

void start();
