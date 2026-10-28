#!/usr/bin/env python3
"""
Strict-CSP demo server for Dynamic Web TWAIN.

Run:
    python csp-server.py

Then open:  http://127.0.0.1:8123/

What this demonstrates
----------------------
* A strict Content-Security-Policy with NO 'unsafe-inline' / 'unsafe-eval'.
  The policy is the static one from index.html's <meta> tag. When the page
  is served by this server, the same policy is also sent as an HTTP
  response header and the <meta> tag is stripped, so the header is the
  single source of truth (no double-policy intersection).
* DWT is loaded from the local Resources/ folder, so script-src / style-src
  only need 'self' — no CDN host, no nonce required (the page contains no
  inline scripts).
* The local Web TWAIN Service streams scan data over HTTP(S)/WebSocket on
  127.0.0.1:18622 / 127.0.0.1:18623, and the viewer renders data:/blob:
  images, so img-src / connect-src must allow those origins.
* Everything under this directory — index.html, dwt-script.js, Resources/
  — is served as static files, letting DWT load its library, CSS and
  addons from the same origin.

How to verify
-------------
1. Open DevTools -> Network and reload. The HTML response carries the
   Content-Security-Policy header above (identical to the <meta> policy
   in index.html).
2. In the console, DWT should load from Resources/ and scan/upload work.
3. Add an inline <script> to index.html (without a hash/nonce) and reload
   -> the browser blocks it with a CSP error.
"""

import re
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# 8000 is commonly occupied on Windows (http.sys); pick a less busy one.
PORT = 8123

# The static policy. It mirrors the <meta> CSP in index.html, which takes
# over whenever the page is served by a plain static server.
CSP = (
    "default-src 'none'; "
    "script-src 'self'; "
    "style-src 'self'; "
    "img-src 'self' data: blob: "
    "http://127.0.0.1:18622 https://127.0.0.1:18623; "
    "font-src 'self' data:; "
    "connect-src 'self' blob: "
    "https://www.dynamsoft.com https://demo.dynamsoft.com "
    "https://mlds.dynamsoft.com https://sdls.dynamsoft.com "
    "http://127.0.0.1:18622 https://127.0.0.1:18623 "
    "ws://127.0.0.1:18622 wss://127.0.0.1:18623; "
    "worker-src 'self' blob:; "
    "frame-src 'self' blob:; "
    "object-src 'none'; base-uri 'self'; form-action 'self'"
)

MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".ts": "text/plain; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".md": "text/markdown; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".wasm": "application/wasm",
    ".map": "application/json; charset=utf-8",
}


def strip_meta_csp(html: str) -> str:
    """Remove the <meta> CSP from the HTML so the response header is the
    ONLY policy in effect. (If both were present the browser would enforce
    the intersection.)"""
    return re.sub(
        r"<meta\b[^>]*http-equiv=[\"']Content-Security-Policy[\"'][^>]*>",
        "",
        html,
        flags=re.IGNORECASE,
    )


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Strip query string / fragment and map the root to index.html.
        url_path = self.path.split("?", 1)[0].split("#", 1)[0]
        if url_path == "/":
            url_path = "/index.html"

        file_path = (ROOT / url_path.lstrip("/")).resolve()
        # Refuse anything outside the project directory (path traversal).
        try:
            file_path.relative_to(ROOT.resolve())
        except ValueError:
            self._send(404, None, None)
            return

        if not file_path.is_file():
            self._send(404, None, None)
            return

        content_type = MIME_TYPES.get(file_path.suffix.lower(), "application/octet-stream")

        if file_path.suffix.lower() == ".html":
            html = strip_meta_csp(file_path.read_text(encoding="utf-8"))
            body = html.encode("utf-8")
            self._send(200, body, content_type, csp=CSP)
        else:
            body = file_path.read_bytes()
            self._send(200, body, content_type)

    def _send(self, status, body, content_type, csp=None):
        self.send_response(status)
        if body is not None:
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
        if csp:
            self.send_header("Content-Security-Policy", csp)
        self.end_headers()
        if body is not None:
            self.wfile.write(body)

    def log_message(self, fmt, *args):
        # Keep the console clean.
        pass


if __name__ == "__main__":
    print(f"DWT strict-CSP demo server on http://127.0.0.1:{PORT}/")
    print("Press Ctrl+C to stop.")
    HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
