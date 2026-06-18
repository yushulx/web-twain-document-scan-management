/**
 * Document Capture Comparison Demo — app.js
 * =============================================
 * Three working demos:
 *  1. Physical Scanner (Dynamic Web TWAIN — TWAIN/WIA/SANE/ICA)
 *  2. Camera Capture (DCV Bundle — DCE CameraEnhancer + CVR CaptureVisionRouter)
 *  3. REST API (DWT Service REST endpoints via fetch)
 *
 * Requires a 30-day free trial license from Dynamsoft:
 *   https://www.dynamsoft.com/customer/license/trialLicense/?product=dcv&package=cross-platform
 */

// =========================================================================
// Shared Utilities
// =========================================================================

function $(id) { return document.getElementById(id); }

function setStatus(el, msg, type) {
    var status = typeof el === 'string' ? $(el) : el;
    status.textContent = msg;
    status.className = 'status-msg ' + (type || '');
}

function logTo(el, msg) {
    var pre = typeof el === 'string' ? $(el) : el;
    pre.textContent = msg;
}

// =========================================================================
// Shared License Helper
// =========================================================================

var DEFAULT_LICENSE = 'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';

function getLicense() {
    var val = $('shared-license').value.trim();
    if (!val) {
        val = DEFAULT_LICENSE;
        $('shared-license').value = DEFAULT_LICENSE;
        var hint = $('license-hint');
        if (hint) { hint.textContent = '✓ Public trial key active'; }
    }
    return val;
}

// =========================================================================
// Decision Framework — Interactive Q&A
// =========================================================================

(function () {
    var form = $('decision-form');
    var recommendation = $('recommendation');
    var recommendationText = $('recommendation-text');
    var badgesEl = $('recommendation-badges');

    var rules = {
        volume: { low: ['camera'], medium: ['physical'], high: ['physical'], enterprise: ['physical', 'network'] },
        'doc-type': { loose: ['physical'], bound: ['camera'], cards: ['camera'], mixed: ['camera', 'physical'] },
        location: { 'same-room': ['physical'], 'same-building': ['network'], remote: ['camera'], mixed: ['camera', 'network'] },
        integration: { webapp: ['physical', 'camera'], backend: ['network'], mobile: ['camera'], all: ['physical', 'camera', 'network'] }
    };

    var approachNames = { physical: 'Physical Scanner (TWAIN)', camera: 'Camera-Based Capture', network: 'Network / Remote (REST API)' };
    var approachBadgeClass = { physical: 'badge-physical', camera: 'badge-camera', network: 'badge-network' };

    form.addEventListener('change', function () {
        var answers = {};
        var radios = form.querySelectorAll('input[type="radio"]:checked');
        radios.forEach(function (r) { answers[r.name] = r.value; });

        form.querySelectorAll('.question-card').forEach(function (card) {
            var q = card.dataset.q;
            card.classList.toggle('has-answer', !!answers[q]);
        });

        if (Object.keys(answers).length < 4) {
            recommendation.classList.add('hidden');
            return;
        }

        var scores = { physical: 0, camera: 0, network: 0 };
        Object.keys(answers).forEach(function (q) {
            var vals = rules[q][answers[q]];
            if (vals) vals.forEach(function (v) { scores[v]++; });
        });

        var maxScore = Math.max(scores.physical, scores.camera, scores.network);
        var recommended = Object.keys(scores).filter(function (k) { return scores[k] === maxScore; });

        recommendation.classList.remove('hidden');
        recommendationText.textContent = recommended.length === 1
            ? 'Based on your answers, ' + approachNames[recommended[0]] + ' is the best fit.'
            : 'Based on your answers, a combination approach works best:';

        badgesEl.innerHTML = recommended.map(function (k) {
            return '<span class="approach-badge ' + approachBadgeClass[k] + '">' + approachNames[k] + '</span>';
        }).join('');
    });
})();

// =========================================================================
// Tab Switching for Live Demos
// =========================================================================

(function () {
    var tabs = document.querySelectorAll('.tab-btn');
    var panels = document.querySelectorAll('.demo-panel');

    tabs.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = btn.dataset.tab;
            tabs.forEach(function (t) { t.classList.remove('active'); });
            panels.forEach(function (p) { p.classList.remove('active'); });
            btn.classList.add('active');
            var panel = document.getElementById(target);
            if (panel) panel.classList.add('active');
        });
    });
})();

// =========================================================================
// 1. Physical Scanner Demo (Dynamic Web TWAIN)
// =========================================================================

(function () {
    var dwtObject = null;
    var devices = [];

    $('dwt-init-btn').addEventListener('click', function () {
        var license = getLicense();

        setStatus('dwt-status', 'Initializing Dynamic Web TWAIN...', '');
        $('dwt-init-btn').disabled = true;

        // Defensive check: DWT library must be loaded
        if (!Dynamsoft || !Dynamsoft.DWT) {
            setStatus('dwt-status', 'DWT library not loaded. Check that the DWT script tag is present and loaded.', 'error');
            $('dwt-init-btn').disabled = false;
            return;
        }

        // Configure DWT — use the latest v19.4.x
        Dynamsoft.DWT.ProductKey = license;
        Dynamsoft.DWT.ResourcesPath = 'https://cdn.jsdelivr.net/npm/dwt@19.4.1/dist';
        Dynamsoft.DWT.AutoLoad = false;
        Dynamsoft.DWT.UseDefaultViewer = false;

        // Pre-check: is the Dynamsoft Service running?
        var serviceUrl = 'http://127.0.0.1:18625/';
        setStatus('dwt-status', 'Checking Dynamsoft Service...', '');

        var serviceCheckDone = false;
        var serviceTimeout = setTimeout(function () {
            if (!serviceCheckDone) {
                serviceCheckDone = true;
                setStatus('dwt-status',
                    'Dynamsoft Service not detected. Please install it from https://www.dynamsoft.com/web-twain/downloads/ and ensure it is running.',
                    'error');
                $('dwt-init-btn').disabled = false;
            }
        }, 5000);

        fetch(serviceUrl, { mode: 'no-cors' })
            .then(function () {
                if (serviceCheckDone) return;
                serviceCheckDone = true;
                clearTimeout(serviceTimeout);
                initDWT();
            })
            .catch(function () {
                if (serviceCheckDone) return;
                serviceCheckDone = true;
                clearTimeout(serviceTimeout);
                setStatus('dwt-status',
                    'Dynamsoft Service not reachable at ' + serviceUrl + '. Please install it from https://www.dynamsoft.com/web-twain/downloads/ and ensure it is running.',
                    'error');
                $('dwt-init-btn').disabled = false;
            });
    });

    function initDWT() {
        setStatus('dwt-status', 'Creating DWT object...', '');

        var initTimeout = setTimeout(function () {
            setStatus('dwt-status', 'DWT initialization timed out. The Dynamsoft Service may not be responding.', 'error');
            $('dwt-init-btn').disabled = false;
        }, 30000);

        Dynamsoft.DWT.CreateDWTObjectEx(
            {
                WebTwainId: 'dwtScanner'
            },
            function (obj) {
                clearTimeout(initTimeout);
                dwtObject = obj;
                // The demo displays scanned images in its own <img> / thumbnail strip,
                // so we don't need to bind the built-in DWT viewer here. Just hide the empty state.
                $('dwt-empty').style.display = 'none';
                setStatus('dwt-status', 'DWT initialized. Discovering scanners...', 'success');
                loadScanners();
            },
            function (error) {
                clearTimeout(initTimeout);
                var code = error.code || '';
                var msg = error.message || String(error);
                if (String(msg).indexOf('service') !== -1 || String(msg).indexOf('install') !== -1 || code === -1 || String(msg).indexOf('Server') !== -1) {
                    setStatus('dwt-status',
                        'DWT Service not detected. Please install the Dynamsoft Service from https://www.dynamsoft.com/web-twain/downloads/',
                        'error');
                } else {
                    setStatus('dwt-status', 'Init failed: ' + msg + ' (code: ' + code + ')', 'error');
                }
                console.error('DWT init error:', error);
                $('dwt-init-btn').disabled = false;
            }
        );
    }

    function loadScanners() {
        if (!dwtObject) return;
        dwtObject.GetDevicesAsync().then(function (devs) {
            devices = devs;
            var sel = $('dwt-scanner-select');
            sel.innerHTML = '';
            sel.disabled = false;

            if (devs.length === 0) {
                sel.innerHTML = '<option>No scanners found</option>';
                setStatus('dwt-status', 'No TWAIN/SANE/ICA scanners detected. Connect a scanner and reload.', 'error');
                return;
            }

            devs.forEach(function (d, i) {
                var opt = document.createElement('option');
                opt.value = i;
                opt.textContent = d.displayName || d.name || ('Scanner ' + (i + 1));
                sel.appendChild(opt);
            });

            $('dwt-scan-btn').disabled = false;
            setStatus('dwt-status', 'Found ' + devs.length + ' scanner(s). Ready to scan.', 'success');
        }).catch(function (err) {
            setStatus('dwt-status', 'Scanner list error: ' + (err.message || err), 'error');
            $('dwt-init-btn').disabled = false;
        });
    }

    $('dwt-scan-btn').addEventListener('click', function () {
        if (!dwtObject || devices.length === 0) {
            setStatus('dwt-status', 'No scanner available. Initialize DWT first.', 'error');
            return;
        }

        var sel = $('dwt-scanner-select');
        var idx = parseInt(sel.value);
        if (isNaN(idx) || !devices[idx]) {
            setStatus('dwt-status', 'Please select a scanner.', 'error');
            return;
        }

        var adf = $('dwt-adf').checked;
        var duplex = $('dwt-duplex').checked;
        var resolution = parseInt($('dwt-resolution').value);
        var pixelType = parseInt($('dwt-pixeltype').value);

        setStatus('dwt-status', 'Scanning…', '');

        dwtObject.SelectDeviceAsync(devices[idx]).then(function () {
            return dwtObject.AcquireImageAsync({
                IfShowUI: false,
                PixelType: pixelType,
                Resolution: resolution,
                IfFeederEnabled: adf,
                IfDuplexEnabled: duplex,
                IfCloseSourceAfterAcquire: true,
            });
        }).then(function () {
            var count = dwtObject.HowManyImagesInBuffer;
            setStatus('dwt-status', 'Scan complete. ' + count + ' page(s) captured.', 'success');
            $('dwt-empty').style.display = 'none';
            $('dwt-save-btn').disabled = false;
            showScannedImage(dwtObject, count);
        }).catch(function (err) {
            setStatus('dwt-status', 'Scan error: ' + (err.message || err), 'error');
        });
    });

    function showScannedImage(dwtObj, count) {
        if (count > 0) {
            // Get the last scanned image and show it in our img element
            var url = dwtObj.GetImageURL(count - 1);
            var img = $('dwt-image');
            img.src = url;
            img.style.display = 'block';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '420px';
            img.style.border = '1px solid #d0d0e0';
            img.style.borderRadius = '6px';
            img.style.background = '#fff';
        }
        // Update thumbnail strip
        var thumbs = $('dwt-thumbs');
        thumbs.innerHTML = '';
        for (var i = 0; i < count; i++) {
            var thumbUrl = dwtObj.GetImageURL(i);
            var thumbImg = document.createElement('img');
            thumbImg.src = thumbUrl;
            thumbImg.className = 'thumb';
            thumbImg.title = 'Page ' + (i + 1);
            thumbImg.addEventListener('click', (function (idx) {
                return function () {
                    var img = $('dwt-image');
                    img.src = dwtObj.GetImageURL(idx);
                    img.style.display = 'block';
                };
            })(i));
            thumbs.appendChild(thumbImg);
        }
    }

    $('dwt-save-btn').addEventListener('click', function () {
        if (!dwtObject || dwtObject.HowManyImagesInBuffer === 0) {
            setStatus('dwt-status', 'No images to save.', 'error');
            return;
        }

        dwtObject.IfShowFileDialog = true;
        dwtObject.SaveAllAsPDF('scanned-records.pdf',
            function () { setStatus('dwt-status', 'PDF saved successfully.', 'success'); },
            function (code, msg) { setStatus('dwt-status', 'Save failed: ' + msg, 'error'); }
        );
    });
})();

// =========================================================================
// 2. Camera Capture Demo (getUserMedia + CVR + DDN)
//    Pattern: video element for preview, CVR for detection & normalization
// =========================================================================

(function () {
    var cvr = null;
    var mediaStream = null;
    var isScanning = false;
    var scanLoopId = null;
    var isProcessingFrame = false;
    var isCaptureInProgress = false;
    var coolDown = false;
    var manualCapturePending = false;
    var captureTimeoutId = null;

    var latestDetectedQuad = null;
    var lastQuad = null;
    var stableCounter = 0;

    var STABLE_FRAME_COUNT = 3;
    var IOU_THRESHOLD = 0.85;
    var AREA_DELTA_THRESHOLD = 0.15;

    var videoEl = $('cam-video');
    var overlayCanvas = $('cam-overlay');
    var overlayCtx = overlayCanvas.getContext('2d');

    function pointsToBoundingBox(points) {
        var xs = points.map(function (p) { return p.x; });
        var ys = points.map(function (p) { return p.y; });
        var minX = Math.min.apply(null, xs);
        var minY = Math.min.apply(null, ys);
        var maxX = Math.max.apply(null, xs);
        var maxY = Math.max.apply(null, ys);
        return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }

    function computeIoU(a, b) {
        var x1 = Math.max(a.x, b.x);
        var y1 = Math.max(a.y, b.y);
        var x2 = Math.min(a.x + a.w, b.x + b.w);
        var y2 = Math.min(a.y + a.h, b.y + b.h);
        var interW = Math.max(0, x2 - x1);
        var interH = Math.max(0, y2 - y1);
        var inter = interW * interH;
        var union = a.w * a.h + b.w * b.h - inter;
        if (union <= 0) return 0;
        return inter / union;
    }

    function polygonArea(points) {
        var sum = 0;
        for (var i = 0; i < points.length; i++) {
            var next = (i + 1) % points.length;
            sum += points[i].x * points[next].y - points[next].x * points[i].y;
        }
        return Math.abs(sum) * 0.5;
    }

    function isQuadStable(current, previous) {
        if (!current || !previous || current.length !== 4 || previous.length !== 4) return false;
        var boxA = pointsToBoundingBox(current);
        var boxB = pointsToBoundingBox(previous);
        var iou = computeIoU(boxA, boxB);
        var areaA = polygonArea(current);
        var areaB = polygonArea(previous);
        var areaDelta = areaB === 0 ? 1 : Math.abs(areaA - areaB) / areaB;
        return iou >= IOU_THRESHOLD && areaDelta <= AREA_DELTA_THRESHOLD;
    }

    function resetStabilizer() {
        stableCounter = 0;
        lastQuad = null;
        latestDetectedQuad = null;
    }

    function resizeOverlay() {
        var rect = videoEl.getBoundingClientRect();
        overlayCanvas.width = rect.width;
        overlayCanvas.height = rect.height;
    }

    function clearOverlay() {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }

    function drawOverlay(points) {
        if (!points || points.length !== 4) return;
        resizeOverlay();
        clearOverlay();

        var videoWidth = videoEl.videoWidth;
        var videoHeight = videoEl.videoHeight;
        var displayWidth = overlayCanvas.width;
        var displayHeight = overlayCanvas.height;
        var videoAspect = videoWidth / videoHeight;
        var displayAspect = displayWidth / displayHeight;

        var scale, offsetX = 0, offsetY = 0;
        if (displayAspect > videoAspect) {
            scale = displayWidth / videoWidth;
            offsetY = (displayHeight - videoHeight * scale) / 2;
        } else {
            scale = displayHeight / videoHeight;
            offsetX = (displayWidth - videoWidth * scale) / 2;
        }

        var transformed = points.map(function (p) {
            return { x: p.x * scale + offsetX, y: p.y * scale + offsetY };
        });

        overlayCtx.beginPath();
        overlayCtx.moveTo(transformed[0].x, transformed[0].y);
        for (var i = 1; i < transformed.length; i++) {
            overlayCtx.lineTo(transformed[i].x, transformed[i].y);
        }
        overlayCtx.closePath();
        overlayCtx.fillStyle = 'rgba(106, 196, 187, 0.2)';
        overlayCtx.fill();
        overlayCtx.strokeStyle = '#6ac4bb';
        overlayCtx.lineWidth = 3;
        overlayCtx.stroke();
    }

    async function captureFrameCanvas() {
        var canvas = document.createElement('canvas');
        canvas.width = videoEl.videoWidth;
        canvas.height = videoEl.videoHeight;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(videoEl, 0, 0);
        return canvas;
    }

    async function normalizeDocument(frameCanvas, points) {
        try {
            var settings = await cvr.getSimplifiedSettings('NormalizeDocument_Default');
            settings.roi.points = points;
            settings.roiMeasuredInPercentage = 0;
            await cvr.updateSettings('NormalizeDocument_Default', settings);
            var normalizedResult = await cvr.capture(frameCanvas, 'NormalizeDocument_Default');
            for (var i = 0; i < (normalizedResult.items || []).length; i++) {
                var item = normalizedResult.items[i];
                if (item.toCanvas && typeof item.toCanvas === 'function') {
                    return item.toCanvas();
                }
            }
            return null;
        } catch (e) {
            console.warn('Normalize error:', e);
            return null;
        }
    }

    async function performCapture(options) {
        options = options || {};
        if (isCaptureInProgress || coolDown) return;
        isCaptureInProgress = true;

        try {
            var frameCanvas = await captureFrameCanvas();
            var resultCanvas = null;
            var quadPoints = options.quadPoints || null;

            if (quadPoints && quadPoints.length === 4) {
                resultCanvas = await normalizeDocument(frameCanvas, quadPoints);
            }

            if (!resultCanvas) {
                resultCanvas = frameCanvas;
            }

            // Show the captured image
            var img = $('cam-image');
            img.src = resultCanvas.toDataURL('image/png');
            img.style.display = 'block';

            // Add thumbnail
            var thumbs = $('cam-thumbs');
            var thumbImg = document.createElement('img');
            thumbImg.src = resultCanvas.toDataURL('image/png');
            thumbImg.className = 'thumb';
            thumbImg.title = 'Capture ' + (thumbs.children.length + 1);
            thumbImg.addEventListener('click', function () {
                $('cam-image').src = this.src;
            });
            thumbs.appendChild(thumbImg);

            $('cam-empty').style.display = 'none';
            setStatus('cam-status', 'Document captured!', 'success');
        } catch (err) {
            setStatus('cam-status', 'Capture error: ' + (err.message || err), 'error');
            console.error('Capture error:', err);
        } finally {
            isCaptureInProgress = false;
            coolDown = true;
            setTimeout(function () { coolDown = false; }, 1500);
        }
    }

    async function scanLoop() {
        if (!isScanning) return;
        if (isProcessingFrame || isCaptureInProgress) {
            scanLoopId = requestAnimationFrame(scanLoop);
            return;
        }

        isProcessingFrame = true;
        try {
            var result = await cvr.capture(videoEl, 'DetectDocumentBoundaries_Default');
            var quad = null;

            for (var i = 0; i < (result.items || []).length; i++) {
                var item = result.items[i];
                if (item.location && item.location.points && item.location.points.length === 4) {
                    quad = item.location.points;
                    break;
                }
            }

            if (quad) {
                latestDetectedQuad = quad;
                drawOverlay(quad);

                // Manual capture pending: capture with detected quad
                if (manualCapturePending) {
                    manualCapturePending = false;
                    if (captureTimeoutId) {
                        clearTimeout(captureTimeoutId);
                        captureTimeoutId = null;
                    }
                    resetStabilizer();
                    await performCapture({ quadPoints: quad });
                    isProcessingFrame = false;
                    if (isScanning) scanLoopId = requestAnimationFrame(scanLoop);
                    return;
                }

                // Stability check for auto-capture
                if (!lastQuad) {
                    lastQuad = quad;
                    stableCounter = 1;
                } else if (isQuadStable(quad, lastQuad)) {
                    stableCounter++;
                    lastQuad = quad;
                } else {
                    stableCounter = 0;
                    lastQuad = quad;
                }

                var autoCapture = $('cam-auto-capture').checked;
                if (autoCapture && stableCounter >= STABLE_FRAME_COUNT) {
                    resetStabilizer();
                    await performCapture({ quadPoints: quad });
                } else if (stableCounter > 0) {
                    var progress = Math.min(stableCounter / STABLE_FRAME_COUNT * 100, 100);
                    setStatus('cam-status', 'Hold steady... ' + Math.round(progress) + '%', '');
                }
            } else {
                clearOverlay();
                resetStabilizer();

                // Manual capture with no quad detected
                if (manualCapturePending) {
                    manualCapturePending = false;
                    if (captureTimeoutId) {
                        clearTimeout(captureTimeoutId);
                        captureTimeoutId = null;
                    }
                    await performCapture({ quadPoints: null });
                }
            }
        } catch (e) {
            clearOverlay();
        }

        isProcessingFrame = false;
        if (isScanning) {
            scanLoopId = requestAnimationFrame(scanLoop);
        }
    }

    function startScanning() {
        if (isScanning) return;
        isScanning = true;
        scanLoop();
    }

    function stopScanning() {
        isScanning = false;
        manualCapturePending = false;
        if (captureTimeoutId) {
            clearTimeout(captureTimeoutId);
            captureTimeoutId = null;
        }
        if (scanLoopId) {
            cancelAnimationFrame(scanLoopId);
            scanLoopId = null;
        }
        clearOverlay();
    }

    // Helper: release camera
    function releaseCamera() {
        stopScanning();
        if (mediaStream) {
            mediaStream.getTracks().forEach(function (t) { t.stop(); });
            mediaStream = null;
        }
        videoEl.srcObject = null;
    }

    // Release camera on page unload to prevent "device in use" on next load
    window.addEventListener('beforeunload', releaseCamera);

    // Init camera
    $('cam-init-btn').addEventListener('click', async function () {
        var license = getLicense();
        setStatus('cam-status', 'Initializing SDK and camera...', '');
        $('cam-init-btn').disabled = true;

        try {
            // Release any previous camera session first
            releaseCamera();

            // Step 1: Initialize license
            await Dynamsoft.License.LicenseManager.initLicense(license, true);

            // Step 2: Load DDN WASM module
            await Dynamsoft.Core.CoreModule.loadWasm(['DDN']);

            // Step 3: Create CVR
            cvr = await Dynamsoft.CVR.CaptureVisionRouter.createInstance();

            // Step 4: Open camera via getUserMedia
            var stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: { ideal: 'environment' } },
                audio: false
            });
            mediaStream = stream;
            videoEl.srcObject = stream;
            await new Promise(function (resolve) {
                videoEl.onloadedmetadata = function () {
                    videoEl.play();
                    resolve();
                };
            });

            // Show video
            $('cam-video-wrapper').style.display = 'block';
            $('cam-empty').style.display = 'none';
            $('cam-image').style.display = 'none';
            resizeOverlay();
            window.addEventListener('resize', resizeOverlay);

            // Enable buttons and start scanning
            $('cam-capture-btn').disabled = false;
            $('cam-stop-btn').disabled = false;
            setStatus('cam-status', 'Camera active. Point at a document. Detection overlay will appear.', 'success');
            startScanning();

        } catch (err) {
            var msg = err.message || String(err);
            var name = err.name || '';
            if (name === 'NotReadableError' || msg.indexOf('in use') !== -1 || name === 'TrackStartError') {
                setStatus('cam-status', 'Camera is in use by another app or tab. Close other camera apps and try again.', 'error');
            } else if (name === 'NotAllowedError' || name === 'SecurityError') {
                setStatus('cam-status', 'Camera permission denied. Please allow camera access in browser settings.', 'error');
            } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
                setStatus('cam-status', 'No camera found on this device.', 'error');
            } else {
                setStatus('cam-status', 'Init failed: ' + msg, 'error');
            }
            console.error('Camera init error:', err);
            releaseCamera();
            $('cam-init-btn').disabled = false;
        }
    });

    // Manual capture button
    $('cam-capture-btn').addEventListener('click', function () {
        if (!isScanning || coolDown) return;
        manualCapturePending = true;
        latestDetectedQuad = null;

        if (captureTimeoutId) clearTimeout(captureTimeoutId);
        captureTimeoutId = setTimeout(async function () {
            if (manualCapturePending) {
                manualCapturePending = false;
                await performCapture({ quadPoints: null });
            }
        }, 500);
    });

    // Stop camera
    $('cam-stop-btn').addEventListener('click', function () {
        releaseCamera();
        $('cam-video-wrapper').style.display = 'none';
        $('cam-image').style.display = 'none';
        $('cam-thumbs').innerHTML = '';
        $('cam-init-btn').disabled = false;
        $('cam-stop-btn').disabled = true;
        $('cam-capture-btn').disabled = true;
        setStatus('cam-status', 'Camera stopped.', '');
    });
})();

// =========================================================================
// 3. REST API Demo (DWT Service REST endpoints via fetch)
//    Supports v19+ API format: /api/device/scanners/...
// =========================================================================

(function () {
    var scanners = [];

    // Build the API base URL from the host input
    function apiBase() {
        var host = $('rest-host').value.trim().replace(/\/+$/, '');
        if (!/\/api\/?$/.test(host)) {
            host += '/api';
        }
        return host;
    }

    // Discover scanners
    $('rest-get-scanners').addEventListener('click', function () {
        var base = apiBase();
        if (!base) {
            setStatus('rest-status', 'Please enter a service host address.', 'error');
            return;
        }

        setStatus('rest-status', 'Discovering scanners at ' + base + '...', '');
        logTo('rest-response', 'GET ' + base + '/device/scanners ...');

        fetch(base + '/device/scanners')
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + res.statusText);
                return res.json();
            })
            .then(function (data) {
                logTo('rest-response', JSON.stringify(data, null, 2));
                scanners = data || [];
                var sel = $('rest-scanner-select');
                sel.innerHTML = '';

                if (scanners.length === 0) {
                    sel.innerHTML = '<option>No scanners found</option>';
                    sel.disabled = true;
                    $('rest-scan-btn').disabled = true;
                    setStatus('rest-status', 'No scanners found. Make sure a scanner is connected and the DWT Service is running.', 'error');
                    return;
                }

                scanners.forEach(function (scanner, i) {
                    var opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = (scanner.name || scanner.displayName || ('Scanner ' + (i + 1)));
                    sel.appendChild(opt);
                });

                sel.disabled = false;
                $('rest-scan-btn').disabled = false;
                setStatus('rest-status', 'Found ' + scanners.length + ' scanner(s). Select one and click "Scan & Fetch Images".', 'success');
            })
            .catch(function (err) {
                var hint = '';
                var msg = String(err.message || err);
                if (msg.indexOf('Failed to fetch') !== -1 || msg.indexOf('NetworkError') !== -1) {
                    hint = '\n\nPossible causes:\n' +
                        '1. The DWT Service is not running on the host machine.\n' +
                        '   -> Install it from: https://www.dynamsoft.com/web-twain/downloads\n' +
                        '2. The service port (default 18622 HTTP / 18623 HTTPS) is blocked by a firewall.\n' +
                        '3. CORS is not enabled for the calling origin.';
                }
                logTo('rest-response', 'Error: ' + msg + hint);
                setStatus('rest-status', 'Connection failed. Is the DWT Service running?', 'error');
            });
    });

    // Scan & Fetch Images (creates job + fetches pages in one flow)
    $('rest-scan-btn').addEventListener('click', function () {
        var base = apiBase();
        var license = getLicense();
        var sel = $('rest-scanner-select');
        var idx = parseInt(sel.value);

        if (isNaN(idx) || !scanners[idx]) {
            setStatus('rest-status', 'Please select a valid scanner.', 'error');
            return;
        }
        if (!license) {
            setStatus('rest-status', 'Please enter a license key.', 'error');
            return;
        }

        var scanner = scanners[idx];
        var params = {
            autoRun: true,
            device: scanner.device,
            name: scanner.name,
            config: {
                PixelType: 2,
                Resolution: 200,
                IfFeederEnabled: false,
                IfDuplexEnabled: false,
                IfCloseSourceAfterAcquire: true,
            },
        };

        setStatus('rest-status', 'Creating scan job for ' + (scanner.name || 'selected scanner') + '...', '');
        $('rest-scan-btn').disabled = true;
        logTo('rest-response', 'POST ' + base + '/device/scanners/jobs\n' +
            'Header: DWT-PRODUCT-KEY: ****\n' +
            JSON.stringify(params, null, 2));

        // Step 1: Create scan job
        fetch(base + '/device/scanners/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'DWT-PRODUCT-KEY': license,
            },
            body: JSON.stringify(params),
        })
            .then(function (res) {
                if (res.status === 201) return res.json();
                return res.json().then(function (data) {
                    throw new Error(data.message || 'HTTP ' + res.status);
                });
            })
            .then(function (data) {
                if (!data.jobuid) {
                    throw new Error('Job creation returned unexpected response: ' + JSON.stringify(data));
                }
                logTo('rest-response', 'Job created: ' + data.jobuid + '\n\nFetching images...');
                setStatus('rest-status', 'Job created: ' + data.jobuid + '. Fetching images...', '');
                $('rest-empty').style.display = 'none';

                // Step 2: Fetch all page images
                var jobUid = data.jobuid;
                var pageCount = 0;
                var thumbs = $('rest-thumbs');
                thumbs.innerHTML = '';

                function fetchNextPage() {
                    var url = base + '/device/scanners/jobs/' + jobUid + '/next-page?type=image/png';
                    return fetch(url, {
                        headers: { 'DWT-PRODUCT-KEY': license }
                    })
                        .then(function (res) {
                            if (res.status === 204) return null;
                            if (res.status === 410) return null;
                            if (!res.ok) throw new Error('HTTP ' + res.status);
                            return res.blob();
                        })
                        .then(function (blob) {
                            if (!blob) return;
                            pageCount++;

                            var imageUrl = URL.createObjectURL(blob);

                            var thumbImg = document.createElement('img');
                            thumbImg.src = imageUrl;
                            thumbImg.className = 'thumb';
                            thumbImg.title = 'Page ' + pageCount;
                            thumbImg.addEventListener('click', function () {
                                var img = $('rest-image');
                                img.src = this.src;
                                img.style.display = 'block';
                            });
                            thumbs.appendChild(thumbImg);

                            if (pageCount === 1) {
                                var img = $('rest-image');
                                img.src = imageUrl;
                                img.style.display = 'block';
                                $('rest-empty').style.display = 'none';
                            }

                            return fetchNextPage();
                        });
                }

                return fetchNextPage().then(function () {
                    // Step 3: Clean up - delete job
                    return fetch(base + '/device/scanners/jobs/' + jobUid, {
                        method: 'DELETE',
                        headers: { 'DWT-PRODUCT-KEY': license }
                    }).catch(function () { /* ignore cleanup errors */ });
                }).then(function () {
                    if (pageCount > 0) {
                        setStatus('rest-status', pageCount + ' page(s) scanned and displayed.', 'success');
                        logTo('rest-response', 'Fetched ' + pageCount + ' page image(s).\nClick any thumbnail to view it larger.');
                    } else {
                        setStatus('rest-status', 'No images returned. Scanner may have no paper loaded.', 'error');
                        logTo('rest-response', 'No images returned.\n\nPossible causes:\n' +
                            '- The scan job is still in progress (try again).\n' +
                            '- The scanner has no paper loaded.');
                    }
                });
            })
            .catch(function (err) {
                logTo('rest-response', 'Error: ' + (err.message || err));
                setStatus('rest-status', 'Scan failed: ' + (err.message || err), 'error');
            })
            .finally(function () {
                $('rest-scan-btn').disabled = false;
            });
    });

    $('rest-clear').addEventListener('click', function () {
        $('rest-thumbs').innerHTML = '';
        $('rest-image').style.display = 'none';
        $('rest-image').src = '';
        $('rest-empty').style.display = 'block';
        logTo('rest-response', 'Click "Discover Scanners" to start.');
        setStatus('rest-status', '', '');
        $('rest-scan-btn').disabled = true;
        $('rest-scanner-select').disabled = true;
        $('rest-scanner-select').innerHTML = '<option>Click "Discover Scanners" first</option>';
        scanners = [];
    });
})();
