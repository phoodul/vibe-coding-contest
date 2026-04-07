/** Mind Palace - 사진 기반 공간 + 계층적 Hotspot */

/** 구조화된 목록 아이템 (말풍선에 표시) */
export interface OutlineItem {
  text: string;
  /** 이 항목이 가리키는 사진 위 위치 (%) */
  pointer: { x: number; y: number };
  children?: OutlineItem[];
}

/** 하나의 학습 주제 */
export interface Hotspot {
  id: string;
  keyword: string;
  section: string;
  /** 사진 위 클릭 영역 (%) */
  region: { x: number; y: number; w: number; h: number };
  /** 말풍선에 보여줄 계층적 구조 텍스트 */
  outline: OutlineItem[];
  /** 나레이터가 읽을 교과서 본문 (서술형) */
  narratorText: string;
}

export interface PalaceRoomData {
  id: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  attribution?: string;
  hotspots: Hotspot[];
}
