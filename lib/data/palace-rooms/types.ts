/** Mind Palace — 1 Hotspot = 1 keyword = 1 말풍선 */

/** 말풍선 내 bullet 하나 = object 특정 부위와 연결선 */
export interface BulletItem {
  text: string;
  /** 사진 위 이 bullet이 가리키는 위치 (viewport %) */
  pointer: { x: number; y: number };
}

/** 1 Hotspot = 1 개념 = 1 말풍선 */
export interface Hotspot {
  id: string;
  keyword: string;
  /** 사진 위 클릭 영역 (viewport %) */
  region: { x: number; y: number; w: number; h: number };
  /** flat bullet list — 하위 그룹 없음 */
  bullets: BulletItem[];
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
