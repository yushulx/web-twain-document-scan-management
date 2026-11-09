# deskew

A collection of document deskewing methods, plus a browser demo of the text-line contour algorithm.

## Browser demos

- [`index.html`](./index.html) — **OpenCV.js baseline.** Pick the bundled photo of a page lying on a desk (default) or a flat scan, detect the skew angle from dilated text-line contours, and rotate the page back with `warpAffine`. The detected rectangles and the measured tilt are drawn over the input; a correction-angle slider lets you override the median estimate. The banner explains when a simple deskew is not enough and links to the [Dynamsoft Capture Vision production scanner tutorial](https://www.dynamsoft.com/codepool/build-multi-page-document-scanner-web-app.html) and the [online demo](https://www.dynamsoft.com/codepool/demos/multi-document-capture/).
- [`dwt-index.html`](./dwt-index.html) — the original [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview) 19.5.0 desktop scanning app with `GetSkewAngle` / `Rotate`, kept as the product-side reference.

Serve the folder over any static server (camera/OpenCV.js loading needs a real origin):

```bash
python -m http.server 8000
# then open http://localhost:8000/
```

OpenCV.js 4.13.0 is loaded from `https://docs.opencv.org/4.13.0/opencv.js`. For offline use, download that file next to `index.html` and change the `<script src>`.

## Command-line methods

- `run-python.py` — deskew with Python + OpenCV.
- `run-magick.bat` — deskew with ImageMagick `-deskew`.
- `samples/sample-desk.jpg` — a page photographed on a desk, tilted 2.94°, used as the demo's default input.
- `samples/1.jpg`, `samples/2.jpg` — flat scans of a tilted table of contents, used by both the script and the browser demo.

## Delve into deskewing

1. Normalize the image: grayscale, blur, remove scan borders, invert, Otsu threshold.
2. Dilate the text horizontally to connect each line.
3. Find contours, take each `minAreaRect` angle, drop the paper outline (contours thicker than ~5% of the image's short side), and use the median as the skew estimate.
4. Run an affine rotation, filling the empty corners with the page's average corner colour.

This corrects **tilted text lines on an already flat page**. A page photographed at an angle has perspective distortion as well; that needs four-corner detection and normalization. See the [Capture Vision multi-page scanner tutorial](https://www.dynamsoft.com/codepool/build-multi-page-document-scanner-web-app.html) for `DetectDocumentBoundaries_Default` / `NormalizeDocument_Default`.

## Blog

[How to Auto-Deskew Scanned Documents with OpenCV and Python](https://www.dynamsoft.com/codepool/deskew-scanned-document.html)
