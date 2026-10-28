# Dynamic Web TWAIN — Content Security Policy (CSP) Support Notes

> 1. Strict CSP support
> - Is Dynamic Web TWAIN currently supported without > unsafe-inline in script-src and style-src?
> - Please answer Yes or No.
> - If Yes: provide exact product version, required > config steps, and a complete working CSP example.
> - If No: confirm this is not currently supported.

Yes. script-src and style-src without unsafe-inline is supported for the basic scanning flow. Although the inline script in the installation dialog is blocked, the user can still download the service installer.

See the sample in the attachment.

> 2. Inline behavior dependency
>- If we remove/replace the default install dialog, does that eliminate all unsafe-inline requirements, or only install-dialog-related requirements?
>- Please identify any remaining components that still require inline styles or inline event handlers.

Yes.

> 3. Required CSP directives
> - Please provide the minimum required production CSP directives for scan functionality.
> - Mark each directive as Required or Optional and explain why each Required directive is needed.
> - Please confirm whether any eval-like behavior requires unsafe-eval.

Minimum policy for scan + image processing

| Directive | Status | Why |
|---|---|---|
| `default-src 'none'` | Recommended (base) | Deny everything not explicitly listed below. Softer alternative: `'self'`. |
| `script-src 'self'` | **Required** | Loads the DWT core and the resource scripts it injects at runtime. This sample loads DWT from the local `Resources/` folder (`index.html`), so `'self'` alone is enough — add `https://cdn.jsdelivr.net` only if you load DWT from the CDN instead. Your own inline/app scripts can go through `'nonce-…'`/`'sha256-…'` — none of `'unsafe-inline'`, `'unsafe-eval'`, or `'wasm-unsafe-eval'` is required. Add `blob:` only if your flow creates scripts from blob URLs. |
| `style-src 'self'` | **Required** | DWT loads its viewer CSS as external `<link rel="stylesheet">` from the local `Resources/` folder — `'self'` alone is enough (add `https://cdn.jsdelivr.net` only for a CDN setup). No `'unsafe-inline'` needed. |
| `img-src 'self' data: blob: http://127.0.0.1:18622 https://127.0.0.1:18623` | **Required** | The local Service streams scanned images from `http://127.0.0.1:18622/…/img`; the viewer renders from `data:`/`blob:` URLs. |
| `connect-src 'self' https://mlds.dynamsoft.com https://sdls.dynamsoft.com http://127.0.0.1:18622 https://127.0.0.1:18623 ws://127.0.0.1:18622 wss://127.0.0.1:18623` | **Required** | License handshake (mlds/sdls — not needed with an offline license), the service API over HTTP(S) and WebSocket, plus the upload host you pass to `HTTPUpload` (e.g. `https://demo.dynamsoft.com`). |
| `font-src 'self' data:` | Optional | The viewer embeds its icon font as an inline `data:` woff. Only needed when a viewer is created. |
| `worker-src 'self' blob:` | Optional | Only if your flow spawns Web Workers from blob URLs. |
| `frame-src 'self' blob:` | Optional | Only if you rely on the default in-page dialogs that render an iframe. |
| `object-src 'none'` | Recommended | Baseline hardening; DWT does not use plugins/objects. |
| `base-uri 'self'` | Recommended | Baseline hardening against base-tag injection. |
| `form-action 'self'` | Recommended | Baseline hardening; DWT uploads use XHR, not forms. |

This sample loads DWT from the local `Resources/` folder, so `'self'` alone suffices for `script-src`/`style-src` — no `https://cdn.jsdelivr.net`. Use the CDN host only if you load DWT from `https://cdn.jsdelivr.net/npm/dwt/dist/…` instead.

eval-like behavior

unsafe-eval is not required. DWT contains no `eval()`, no `new Function`, and no `WebAssembly.compile`/`instantiate` — image processing runs in the local Web TWAIN Service, not in-browser WASM. `'wasm-unsafe-eval'` is unnecessary for the core scan flow.


> 4. Local service endpoints
> - Your note referenced localhost WebSocket ports (for example 18622/> 18623/18625/18626).
> - Please confirm the authoritative list of required local HTTP/WS/WSS endpoints and ports for current versions.

Ports: 18622, 18623
Endpoints: 127.0.0.1

> 5. Roadmap
> - If strict CSP (nonce/hash-compatible, no unsafe-inline) is not supported today, please provide:
> - Planned support status (Yes/No)
> - Target release timeline (quarter/year)
> - Public issue or tracking reference we can monitor

Yes.

See the demo in the attachment.

Attachment:

https://dynamsoft.sharepoint.com/sites/DynamsoftEnglishOnly/Shared%20Documents/PT-DWT,%20DDV/Samples/CSP-sample.zip?d=wede75c359d2a47ddb421ac5d1145054d&csf=1&web=1&e=al11ec