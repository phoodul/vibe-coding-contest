/**
 * Canvas → PNG dataURL + 메타 인코더.
 * 800KB 초과 시 단계적 다운스케일 (1280px 가로 한도) + 품질 0.85 → 0.7 → 0.5 폴백.
 */

const MAX_BYTES = 800 * 1024;
const MAX_WIDTH = 1280;

export interface CanvasPayload {
  /** image/png base64 dataURL */
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
  downscaled: boolean;
}

function dataUrlBytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return dataUrl.length;
  const b64 = dataUrl.slice(comma + 1);
  // padding 보정
  const pad = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - pad;
}

function downscale(source: HTMLCanvasElement, targetWidth: number): HTMLCanvasElement {
  const ratio = source.height / source.width;
  const w = Math.min(targetWidth, source.width);
  const h = Math.round(w * ratio);
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  return out;
}

export function encodeCanvasToPayload(source: HTMLCanvasElement): CanvasPayload {
  // 1) 원본 PNG
  let dataUrl = source.toDataURL("image/png");
  let bytes = dataUrlBytes(dataUrl);
  let width = source.width;
  let height = source.height;
  let downscaled = false;

  if (bytes <= MAX_BYTES) {
    return { dataUrl, width, height, bytes, downscaled };
  }

  // 2) 1280px 로 다운스케일
  const small = downscale(source, MAX_WIDTH);
  dataUrl = small.toDataURL("image/png");
  bytes = dataUrlBytes(dataUrl);
  width = small.width;
  height = small.height;
  downscaled = true;

  if (bytes <= MAX_BYTES) {
    return { dataUrl, width, height, bytes, downscaled };
  }

  // 3) JPEG 품질 단계적 폴백
  for (const q of [0.85, 0.7, 0.5]) {
    dataUrl = small.toDataURL("image/jpeg", q);
    bytes = dataUrlBytes(dataUrl);
    if (bytes <= MAX_BYTES) {
      return { dataUrl, width, height, bytes, downscaled };
    }
  }

  // 4) 최후: 가로 800px JPEG 0.5
  const tiny = downscale(source, 800);
  dataUrl = tiny.toDataURL("image/jpeg", 0.5);
  bytes = dataUrlBytes(dataUrl);
  return { dataUrl, width: tiny.width, height: tiny.height, bytes, downscaled: true };
}
