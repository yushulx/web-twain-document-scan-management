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
const DEMO_TITLE = "Free Online PDF & Image Annotation Studio | Dynamsoft Codepool Demo";
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
    "name": "Free Online PDF & Image Annotation Studio",
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
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free to use on dynamsoft.com/codepool — the hosted demo carries a domain-bound license, so no account, no key and no installation are needed. Self-hosting the code requires your own Dynamsoft license. Nothing you open or upload leaves your device."
    },
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
  /* The last sentence matters: the page is free because the Codepool host serves a
     license bound to dynamsoft.com. Someone who clones this example and runs it
     elsewhere gets no bound license, so say so where the "Built with" line already
     puts the SDK in a reuser's field of view. */
  return `  <footer class="demo-footer">
    <p>
      Built with <a href="https://www.dynamsoft.com/document-viewer/overview/" data-demo-cta="document-viewer">Dynamsoft Document Viewer</a>.
      This page is free because it activates a Codepool license bound to dynamsoft.com; the sample
      code on GitHub is a separate thing and needs your own license to run.
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
      background: var(--header-bg, #323234);
      color: #cccccc;
      font-size: 13px;
      text-align: center;
      line-height: 1.6;
    }
    .demo-footer p { margin: 0; }
    .demo-footer a { color: #DDDDDD; text-decoration: none; }
    .demo-footer a:hover { text-decoration: underline; }
    .demo-footer .demo-footer-cta {
      display: inline-block;
      margin-left: 10px;
      padding: 3px 12px;
      border-radius: 999px;
      background: #FE8E14;
      color: #fff;
      font-weight: 600;
    }
    .demo-footer .demo-footer-cta:hover { background: #e07d0b; text-decoration: none; }
    @media (max-width: 640px) {
      .demo-footer { font-size: 12px; padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px)); }
      .demo-footer .demo-footer-cta { margin: 6px 0 0; }
    }
  </style>
`;

/* Cache-busting token for the hand-written tags in demoHead() — currently just
   ../shared/analytics.js. Keep it in step with the `?v=` on the other
   demos/<slug>/ pages: the analytics file is shared across every demo, and a page
   serving a stale token hands some visitors a day-old copy while the rest get the
   new one. DEMO_ASSET_VERSION overrides it for a one-off build.

   This used to default to a hardcoded date, and because nothing in package.json
   sets the env var, every `npm run build:demo` silently re-emitted that old value
   and reverted whatever the deployed page had. Bumping the page by hand and
   rebuilding therefore did not stick — pass the version on the command line
   (`DEMO_ASSET_VERSION=... npm run build:demo`) or change this constant, but do
   not rely on a manual edit of the built index.html. */
const DEMO_ASSET_VERSION = process.env.DEMO_ASSET_VERSION || "20260917l";

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
    plugins: isDemo ? [codepoolDemoPlugin(DEMO_ASSET_VERSION)] : [],
    // VITE_DDVR_LICENSE / VITE_DWT_LICENSE / VITE_GDRIVE_CLIENT_ID are
    // available via import.meta.env automatically — no define needed.
  };
});
