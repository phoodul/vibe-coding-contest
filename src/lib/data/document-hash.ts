/**
 * 공문서 해시 생성 및 검증 유틸리티
 * Web Crypto API 기반 SHA-256 (외부 의존성 없음)
 */

/** 파일 바이트 → SHA-256 해시 (hex) */
export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return bufferToHex(hashBuffer);
}

/** 텍스트 → SHA-256 해시 (hex) */
export async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return bufferToHex(hashBuffer);
}

/** ArrayBuffer → hex string */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** 해시 앞 8자리 축약 (UI 표시용) */
export function shortHash(hash: string): string {
  return hash.slice(0, 8);
}

/** 두 해시 비교 → 위변조 여부 */
export function verifyHash(original: string, current: string): boolean {
  return original === current;
}

/** 문서 상태 타입 */
export type DocumentStatus =
  | "uploaded"
  | "pending_review"
  | "pending_approval"
  | "revision_requested"
  | "approved"
  | "issued";

/** 상태 한글 라벨 */
export const STATUS_LABELS: Record<DocumentStatus, string> = {
  uploaded: "업로드됨",
  pending_review: "양식 검토중",
  pending_approval: "승인 대기",
  revision_requested: "수정 요청",
  approved: "승인됨",
  issued: "발급 완료",
};

/** 상태 색상 */
export const STATUS_COLORS: Record<DocumentStatus, string> = {
  uploaded: "text-muted",
  pending_review: "text-yellow-400",
  pending_approval: "text-blue-400",
  revision_requested: "text-orange-400",
  approved: "text-emerald-400",
  issued: "text-primary",
};

/** 허용 파일 확장자 */
export const ALLOWED_EXTENSIONS = [".hwp", ".hwpx", ".docx", ".doc", ".txt", ".pdf"];

/** 파일 확장자 검증 */
export function isAllowedFile(fileName: string): boolean {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(ext);
}

/** 파일 크기 포맷 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
