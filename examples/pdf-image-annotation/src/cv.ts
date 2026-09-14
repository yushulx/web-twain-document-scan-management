/**
 * cv.ts — the one Dynamsoft Capture Vision router behind every "Detect" action.
 *
 * The header's Detect menu offers three unrelated jobs — document boundary
 * detection, barcode decoding and MRZ reading — and all three run through the
 * same engine. Creating three routers would mean three copies of the WASM
 * engine and three model caches, so this module owns a single lazily-created
 * `CaptureVisionRouter` and hands out `capturePage()` calls.
 *
 * The awkward part is template switching. A router cannot hold a built-in
 * preset template (`DetectDocumentBoundaries_Default`,
 * `ReadBarcodes_ReadRateFirst`) and a template injected with `initSettings()`
 * (`ReadMRZ`, see `mrz-settings.ts`) at the same time: Dynamsoft's own
 * `document_annotation` sample calls `resetSettings()` before every preset
 * capture and `initSettings()` before every MRZ capture. Rather than repeat
 * that dance at each call site, `capturePage()` tracks which template is
 * currently live and switches only when the request actually changes.
 */

import {
  CaptureVisionRouter,
  CodeParser,
  CodeParserModule,
  CoreModule,
  EnumPresetTemplate,
  LicenseManager,
} from "dynamsoft-capture-vision-bundle";
import type { CapturedResult } from "dynamsoft-capture-vision-bundle";

import { MRZ_SETTINGS } from "./mrz-settings";

/** Every capture template this app drives. */
export type CaptureTemplate =
  | "DetectDocumentBoundaries_Default"
  | "ReadBarcodes_ReadRateFirst"
  | "ReadMRZ";

/**
 * Deep-learning models the MRZ template depends on. The `MRZLocalization`
 * localiser is what lets the template find small MRZ text; none of the three
 * ships with the bundle by default, so they are appended to the model buffer on
 * first use and then stay resident.
 */
const MRZ_DL_MODELS = [
  "MRZCharRecognition",
  "MRZTextLineRecognition",
  "MRZLocalization",
];

/** Machine-readable travel-document specifications the code parser needs. */
const MRTD_SPECS = [
  "MRTD_TD3_PASSPORT",
  "MRTD_TD1_ID",
  "MRTD_TD2_ID",
  "MRTD_TD2_VISA",
  "MRTD_TD3_VISA",
];

let routerPromise: Promise<CaptureVisionRouter> | null = null;
let licenseInitialized = false;
let activeTemplate: CaptureTemplate | null = null;
let mrzModelsLoaded = false;
let mrtdSpecsLoaded = false;
let parserPromise: Promise<CodeParser> | null = null;

/* ------------------------------------------------------------------ */
/*  Init                                                               */
/* ------------------------------------------------------------------ */

/**
 * Activates the license and warms up the router. Call once at startup with the
 * same license key DDV uses — Capture Vision and Document Viewer share one key.
 *
 * The engine's wasm/worker assets come from the jsDelivr CDN. This has to be
 * set explicitly: when the SDK is bundled (by Vite, say) it cannot infer its
 * own script URL, so without `rootDirectory` it would request the assets from
 * the app's own origin, receive `index.html` back and fail with
 * "Unexpected token '<'".
 */
export async function initCaptureVision(license: string): Promise<void> {
  if (!licenseInitialized) {
    CoreModule.engineResourcePaths.rootDirectory = "https://cdn.jsdelivr.net/npm/";
    await LicenseManager.initLicense(license);
    licenseInitialized = true;
  }
  await getRouter();
}

/* ------------------------------------------------------------------ */
/*  Capture                                                            */
/* ------------------------------------------------------------------ */

/**
 * Runs `template` over `blob` and returns the raw captured result.
 *
 * Switches the router's runtime settings when — and only when — the requested
 * template is not the one already loaded, so repeated Detect clicks on the same
 * mode do no extra work.
 */
export async function capturePage(
  template: CaptureTemplate,
  blob: Blob
): Promise<CapturedResult> {
  const router = await getRouter();

  if (activeTemplate !== template) {
    if (template === "ReadMRZ") {
      await prepareMrzTemplate(router);
    } else {
      await router.resetSettings();
      if (template === "DetectDocumentBoundaries_Default") {
        await applyDetectSettings(router);
      }
    }
    activeTemplate = template;
  }

  return router.capture(blob, template);
}

/* ------------------------------------------------------------------ */
/*  Internals                                                          */
/* ------------------------------------------------------------------ */

/**
 * Returns the shared router, creating it on first use.
 *
 * `maxImageSideLength = Infinity` disables the engine's default down-scaling:
 * the detection and MRZ results are mapped back onto the page using the ratio
 * between the captured image and the page's media box, so the capture has to
 * keep the page's full resolution for that ratio to be uniform.
 */
async function getRouter(): Promise<CaptureVisionRouter> {
  if (!routerPromise) {
    routerPromise = (async () => {
      const router = await CaptureVisionRouter.createInstance();
      router.maxImageSideLength = Infinity;
      await applyDetectSettings(router);
      activeTemplate = EnumPresetTemplate.PT_DETECT_DOCUMENT_BOUNDARIES;
      return router;
    })();
  }
  return routerPromise;
}

/**
 * Keeps the original frame in the result. Only the detected quad is read —
 * `outputOriginalImage` is enabled to match the official
 * `document-scanner-javascript` sample that this detection path is based on,
 * and because `resetSettings()` clears it on every template switch.
 */
async function applyDetectSettings(router: CaptureVisionRouter): Promise<void> {
  const settings = await router.getSimplifiedSettings(
    EnumPresetTemplate.PT_DETECT_DOCUMENT_BOUNDARIES
  );
  settings.outputOriginalImage = true;
  await router.updateSettings(
    EnumPresetTemplate.PT_DETECT_DOCUMENT_BOUNDARIES,
    settings
  );
}

/**
 * Makes the `ReadMRZ` template available: pull the MRTD model weights into the
 * model buffer once, load the MRTD code specifications once, then inject the
 * template definition. `resetSettings()` (run before the previous preset
 * capture) wipes injected templates, so the `initSettings()` call has to be
 * repeated on every switch back to MRZ — the downloads do not.
 */
async function prepareMrzTemplate(router: CaptureVisionRouter): Promise<void> {
  if (!mrzModelsLoaded) {
    await CaptureVisionRouter.appendDLModelBuffer(MRZ_DL_MODELS);
    mrzModelsLoaded = true;
  }
  await ensureMrtdSpecs();
  await router.initSettings(MRZ_SETTINGS);
}

/** Loads the MRTD code specifications once per session. */
async function ensureMrtdSpecs(): Promise<void> {
  if (mrtdSpecsLoaded) return;
  await CodeParserModule.loadSpec(MRTD_SPECS);
  mrtdSpecsLoaded = true;
}

/* ------------------------------------------------------------------ */
/*  Code parsing                                                       */
/* ------------------------------------------------------------------ */

/**
 * Returns the shared code parser used to turn recognised MRZ text into fields.
 *
 * The `ReadMRZ` template's semantic step also emits a `CRIT_PARSED_RESULT`
 * item, but on the bundle tested here that item's field values all read back as
 * `undefined` — only the raw lines survive. Parsing the joined text lines with
 * a `CodeParser` is what Dynamsoft's own `document_annotation` and this repo's
 * `mrz-scanner` demo both do, and it is the path whose values are actually
 * populated.
 */
export async function getCodeParser(): Promise<CodeParser> {
  if (!parserPromise) {
    parserPromise = (async () => {
      await ensureMrtdSpecs();
      return CodeParser.createInstance();
    })();
  }
  return parserPromise;
}
