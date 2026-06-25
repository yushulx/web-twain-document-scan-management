/**
 * camera.ts — Camera photo capture dialog.
 *
 * Opens a modal with a live camera stream. The user can snap multiple
 * photos; each captured frame appears as a thumbnail with a delete
 * button. When the user confirms, all retained photos are returned as
 * Blobs so the caller can insert them into the DDV document.
 *
 * Uses the native MediaDevices API (getUserMedia) for full control over
 * the snapshot / thumbnail UI. Camera access requires HTTPS or localhost.
 */

import { showToast } from "./toolbar";

export interface CapturedPhoto {
  blob: Blob;
  url: string;
}

let stream: MediaStream | null = null;

/**
 * Opens the camera capture dialog and resolves with the confirmed photos.
 * Resolves with an empty array if the user cancels.
 */
export async function openCameraCapture(): Promise<CapturedPhoto[]> {
  const dialog = document.getElementById("camera-dialog") as HTMLDialogElement;
  const video = document.getElementById("camera-video") as HTMLVideoElement;
  const thumbStrip = document.getElementById("camera-thumbs")!;
  const btnCapture = document.getElementById("btn-camera-capture") as HTMLButtonElement;
  const btnAdd = document.getElementById("btn-camera-add") as HTMLButtonElement;
  const btnClose = document.getElementById("btn-camera-close") as HTMLButtonElement;
  const deviceSelect = document.getElementById("camera-device-select") as HTMLSelectElement;

  const photos: CapturedPhoto[] = [];

  // Reset UI
  thumbStrip.innerHTML = "";
  updateAddButtonLabel(btnAdd, 0);

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      audio: false,
    });
  } catch (err: any) {
    showToast(`Camera access failed: ${err?.message ?? err}`, "error");
    return [];
  }

  video.srcObject = stream;
  await video.play().catch(() => {});

  // Populate device list
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter((d) => d.kind === "videoinput");
  deviceSelect.innerHTML = "";
  videoDevices.forEach((d, i) => {
    deviceSelect.appendChild(new Option(d.label || `Camera ${i + 1}`, d.deviceId));
  });
  const currentTrack = stream.getVideoTracks()[0];
  const currentSettings = currentTrack.getSettings();
  if (currentSettings.deviceId) deviceSelect.value = currentSettings.deviceId;

  deviceSelect.onchange = async () => {
    stopStream();
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceSelect.value }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      video.srcObject = stream;
      await video.play().catch(() => {});
    } catch (err: any) {
      showToast(`Could not switch camera: ${err?.message ?? err}`, "error");
    }
  };

  dialog.showModal();

  return new Promise<CapturedPhoto[]>((resolve) => {
    let resolved = false;

    function finish(result: CapturedPhoto[]) {
      if (resolved) return;
      resolved = true;
      stopStream();
      if (dialog.open) dialog.close();
      // Revoke object URLs for photos that were NOT confirmed
      if (result.length === 0) {
        photos.forEach((p) => URL.revokeObjectURL(p.url));
      }
      deviceSelect.onchange = null;
      btnCapture.onclick = null;
      btnAdd.onclick = null;
      btnClose.onclick = null;
      dialog.oncancel = null;
      resolve(result);
    }

    btnCapture.onclick = () => {
      captureFrame(video, (photo) => {
        if (!photo) return;
        photos.push(photo);
        renderThumbs(thumbStrip, photos, btnAdd);
        updateAddButtonLabel(btnAdd, photos.length);
      });
    };

    btnAdd.onclick = () => finish(photos);
    btnClose.onclick = () => finish([]);
    dialog.oncancel = () => finish([]);
  });
}

/** Grabs the current video frame into a JPEG Blob. */
function captureFrame(
  video: HTMLVideoElement,
  cb: (photo: CapturedPhoto | null) => void
): void {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  if (!canvas.width || !canvas.height) {
    cb(null);
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    cb(null);
    return;
  }
  ctx.drawImage(video, 0, 0);
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        cb(null);
        return;
      }
      cb({ blob, url: URL.createObjectURL(blob) });
    },
    "image/jpeg",
    0.92
  );
}

function renderThumbs(
  container: HTMLElement,
  photos: CapturedPhoto[],
  btnAdd: HTMLButtonElement
): void {
  container.innerHTML = "";
  photos.forEach((photo, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "cam-thumb";

    const img = document.createElement("img");
    img.src = photo.url;
    img.alt = `Capture ${index + 1}`;

    const delBtn = document.createElement("button");
    delBtn.className = "cam-thumb-del";
    delBtn.title = "Remove this photo";
    delBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>';
    delBtn.onclick = () => {
      URL.revokeObjectURL(photo.url);
      photos.splice(index, 1);
      renderThumbs(container, photos, btnAdd);
      updateAddButtonLabel(btnAdd, photos.length);
    };

    wrapper.appendChild(img);
    wrapper.appendChild(delBtn);
    container.appendChild(wrapper);
  });
}

function updateAddButtonLabel(btn: HTMLButtonElement, count: number): void {
  btn.disabled = count === 0;
  const label = btn.querySelector(".btn-label");
  if (label) {
    label.textContent = count > 0 ? `Add ${count} photo${count > 1 ? "s" : ""}` : "Add photos";
  }
}

function stopStream(): void {
  if (stream) {
    stream.getTracks().forEach((t) => t.stop());
    stream = null;
  }
}
