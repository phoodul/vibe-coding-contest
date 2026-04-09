/**
 * 원본 교과서 텍스트 조회 유틸리티
 * structured note의 id로 원본 detail(서술형 텍스트)을 가져옴
 * 나레이터가 이 텍스트를 읽음
 */
import { ETHICS_CH3_SECTIONS } from "../../../lib/data/textbooks/ethics-ch3";

const detailMap = new Map<string, string>();

// 모든 원본 section/content를 Map에 캐시
for (const section of ETHICS_CH3_SECTIONS) {
  for (const content of section.contents) {
    detailMap.set(content.id, content.detail);
  }
}

/**
 * note id로 원본 교과서 텍스트(detail) 조회
 * 기호(※, ●, ①~⑩ 등)를 제거하여 TTS에 적합하게 반환
 */
export function getOriginalText(noteId: string): string | undefined {
  const raw = detailMap.get(noteId);
  if (!raw) return undefined;
  // TTS용: 기호 제거
  return raw
    .replace(/[※●◆◇▶▷★☆■□①②③④⑤⑥⑦⑧⑨⑩【】]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 모든 note id → originalText 매핑 반환 */
export function getAllOriginalTexts(): Map<string, string> {
  const cleaned = new Map<string, string>();
  for (const [id, raw] of detailMap) {
    cleaned.set(
      id,
      raw.replace(/[※●◆◇▶▷★☆■□①②③④⑤⑥⑦⑧⑨⑩【】]/g, "").replace(/\s+/g, " ").trim()
    );
  }
  return cleaned;
}
