import { showToast, setBusy } from "./toolbar";

type DwtDevice = Record<string, any>;

export interface ScannerOption {
  index: number;
  name: string;
}

export interface ScanResult {
  blob: Blob;
  pageCount: number;
}

const DWT_VERSION = "19.4.1";
const DWT_CDN = `https://cdn.jsdelivr.net/npm/dwt@${DWT_VERSION}/dist`;
const DWT_SERVICE_INSTALLER_PATH = `https://unpkg.com/dwt@${DWT_VERSION}/dist/dist`;
const DWT_SCRIPT = `${DWT_CDN}/dynamsoft.webtwain.min.js`;
const DWT_LICENSE = import.meta.env.VITE_DWT_LICENSE ?? "";

let dwtObject: any | null = null;
let devices: DwtDevice[] = [];
let loadingPromise: Promise<void> | null = null;

declare global {
  interface Window {
    Dynamsoft?: any;
  }
}

export async function listScanners(refresh = false): Promise<ScannerOption[]> {
  const dwt = await getDwtObject();
  devices = await dwt.GetDevicesAsync(undefined, refresh);
  return devices.map((device, index) => ({
    index,
    name: scannerName(device, index),
  }));
}

export async function scanFromDevice(deviceIndex: number): Promise<ScanResult | null> {
  const dwt = await getDwtObject();
  if (!devices.length) devices = await dwt.GetDevicesAsync(undefined, true);

  const device = devices[deviceIndex];
  if (!device) {
    showToast("Select a scanner first.", "error");
    return null;
  }

  const before = imageCount(dwt);
  setBusy(true, `Scanning from ${scannerName(device, deviceIndex)}…`);

  try {
    await dwt.SelectDeviceAsync(device);
    await dwt.AcquireImageAsync({
      IfShowUI: false,
      IfCloseSourceAfterAcquire: true,
      IfFeederEnabled: true,
      IfDuplexEnabled: false,
      PixelType: window.Dynamsoft?.DWT?.EnumDWT_PixelType?.TWPT_RGB ?? 2,
      Resolution: 200,
    });

    const after = imageCount(dwt);
    if (after <= before) {
      showToast("No pages were scanned.", "info");
      return null;
    }

    const indices = Array.from({ length: after - before }, (_, i) => before + i);
    const blob = await convertToPdfBlob(dwt, indices);
    return { blob, pageCount: indices.length };
  } finally {
    setBusy(false);
  }
}

async function getDwtObject(): Promise<any> {
  await ensureDwtLoaded();
  if (dwtObject) return dwtObject;

  const dwt = window.Dynamsoft?.DWT;
  if (!dwt) throw new Error("Dynamic Web TWAIN failed to load.");

  dwt.ResourcesPath = DWT_CDN;
  dwt.ServiceInstallerLocation = DWT_SERVICE_INSTALLER_PATH;
  dwt.ProductKey = DWT_LICENSE;
  dwt.UseLocalService = true;

  dwtObject = await new Promise((resolve, reject) => {
    dwt.CreateDWTObjectEx(
      { WebTwainId: "scanBridge" },
      (object: any) => resolve(object),
      (error: any) => reject(error)
    );
  });

  return dwtObject;
}

async function ensureDwtLoaded(): Promise<void> {
  if (window.Dynamsoft?.DWT) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = DWT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Dynamic Web TWAIN."));
    document.head.appendChild(script);
  });

  return loadingPromise;
}

function convertToPdfBlob(dwt: any, indices: number[]): Promise<Blob> {
  return new Promise((resolve, reject) => {
    dwt.ConvertToBlob(
      indices,
      window.Dynamsoft!.DWT.EnumDWT_ImageType.IT_PDF,
      (result: Blob) => resolve(result),
      (_code: number, message: string) => reject(new Error(message))
    );
  });
}

function imageCount(dwt: any): number {
  const value = dwt.HowManyImagesInBuffer;
  return Number(typeof value === "function" ? value.call(dwt) : value ?? 0);
}

function scannerName(device: DwtDevice, index: number): string {
  return (
    device.displayName ??
    device.name ??
    device.deviceName ??
    device.label ??
    device.DeviceName ??
    `Scanner ${index + 1}`
  );
}
