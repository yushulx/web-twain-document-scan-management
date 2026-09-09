import { defineConfig, loadEnv, Plugin } from "vite";

/* ------------------------------------------------------------------ */
/*  Codepool demo build                                               */
/* ------------------------------------------------------------------ */
/*  `npm run build:demo` (vite build --mode demo) produces a variant   */
/*  for https://www.dynamsoft.com/codepool/demos/pdf-image-annotation/ */
/*  with:                                                              */
/*    • no license screen — the domain-bound key from VITE_DDVR_LICENSE */
/*    • GTM + shared analytics + SEO meta + footer CTA                 */
/*  Set VITE_DEMO_MODE=true and the license keys in .env.demo[.local]. */
/* ------------------------------------------------------------------ */

const DEMO_URL = "https://www.dynamsoft.com/codepool/demos/pdf-image-annotation/";
const DEMO_TITLE = "Online PDF & Image Annotation Studio | Dynamsoft Codepool Demo";
const DEMO_DESCRIPTION =
  "Free online PDF and image annotation studio: open PDFs and images, append scanned pages or camera photos, annotate and redact, then export to PDF, PNG, JPEG or TIFF — all in the browser.";
const GTM_ID = "GTM-538F83";
const TUTORIAL_URL =
  "https://www.dynamsoft.com/codepool/build-pdf-image-annotation-document-viewer.html";
const TRIAL_URL =
  "https://www.dynamsoft.com/customer/license/trialLicense/?product=ddv&deploymenttype=browser";

function demoHead(assetVersion: string): string {
  return `  <!-- Google Tag Manager -->
  <script>(function (w, d, s, l, i) {
      w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true; j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', '${GTM_ID}');</script>
  <!-- End Google Tag Manager -->

  <link rel="canonical" href="${DEMO_URL}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${DEMO_TITLE}">
  <meta property="og:description" content="${DEMO_DESCRIPTION}">
  <meta property="og:url" content="${DEMO_URL}">
  <meta property="og:image" content="${DEMO_URL}thumbnail.png">
  <meta name="twitter:card" content="summary_large_image">
  <script src="../shared/analytics.js?v=${assetVersion}"></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Online PDF & Image Annotation Studio",
    "url": "${DEMO_URL}",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any (web browser)",
    "browserRequirements": "Requires a secure context (HTTPS) for camera capture",
    "description": "${DEMO_DESCRIPTION}",
    "featureList": [
      "Open and append PDF, PNG, JPEG, TIFF and BMP files",
      "Capture pages from a camera or a TWAIN/WIA/SANE scanner",
      "Detect document edges and correct perspective",
      "Annotate, stamp and redact with the Dynamsoft Document Viewer toolbar",
      "Export to editable or flattened PDF, PNG, JPEG or multi-page TIFF"
    ],
    "isAccessibleForFree": true,
    "publisher": {
      "@type": "Organization",
      "name": "Dynamsoft",
      "url": "https://www.dynamsoft.com/"
    }
  }
  </script>
`;
}

function demoFooter(): string {
  return `  <footer class="demo-footer">
    <p>
      Built with <a href="https://www.dynamsoft.com/document-viewer/overview/" data-demo-cta="document-viewer">Dynamsoft Document Viewer</a>.
      <a href="${TUTORIAL_URL}" data-demo-cta="tutorial">Read the tutorial</a>
      <a class="demo-footer-cta" href="${TRIAL_URL}" data-demo-cta="trial">Get a 30-day free trial license</a>
    </p>
  </footer>
`;
}

const DEMO_FOOTER_STYLE = `  <style>
    .demo-footer {
      flex: 0 0 auto;
      padding: 10px 16px;
      background: var(--header-bg, #111722);
      color: #c9d2e3;
      font-size: 13px;
      text-align: center;
      line-height: 1.6;
    }
    .demo-footer p { margin: 0; }
    .demo-footer a { color: #8ab4ff; text-decoration: none; }
    .demo-footer a:hover { text-decoration: underline; }
    .demo-footer .demo-footer-cta {
      display: inline-block;
      margin-left: 10px;
      padding: 3px 12px;
      border-radius: 999px;
      background: #2563eb;
      color: #fff;
      font-weight: 600;
    }
    .demo-footer .demo-footer-cta:hover { background: #1d4ed8; text-decoration: none; }
    @media (max-width: 640px) {
      .demo-footer { font-size: 12px; padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px)); }
      .demo-footer .demo-footer-cta { margin: 6px 0 0; }
    }
  </style>
`;

function codepoolDemoPlugin(assetVersion: string): Plugin {
  return {
    name: "codepool-demo-html",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html: string) {
        // Remove the license screen (its markup is wrapped in strip markers).
        html = html.replace(
          /[ \t]*<!--\s*DEMO:STRIP:START[\s\S]*?<!--\s*DEMO:STRIP:END\s*-->\s*/,
          ""
        );
        // Demo-specific SEO/analytics head.
        html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${DEMO_TITLE}</title>`);
        html = html.replace(
          /<meta name="description"[\s\S]*?>/,
          `<meta name="description" content="${DEMO_DESCRIPTION}" />`
        );
        html = html.replace("</head>", `${DEMO_FOOTER_STYLE}${demoHead(assetVersion)}</head>`);
        // GTM noscript right after <body>, footer CTA before </body>.
        html = html.replace(
          /<body([^>]*)>/,
          `<body$1>\n  <!-- Google Tag Manager (noscript) -->\n  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n  <!-- End Google Tag Manager (noscript) -->`
        );
        html = html.replace("</body>", `${demoFooter()}</body>`);
        return html;
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isDemo = env.VITE_DEMO_MODE === "true";

  return {
    root: ".",
    base: "./",
    build: {
      outDir: isDemo ? "dist-demo" : "dist",
      emptyOutDir: true,
    },
    plugins: isDemo ? [codepoolDemoPlugin(env.DEMO_ASSET_VERSION || "20260909a")] : [],
    // VITE_DDVR_LICENSE / VITE_DWT_LICENSE / VITE_GDRIVE_CLIENT_ID are
    // available via import.meta.env automatically — no define needed.
  };
});
