/**
 * Mind Palace Scene Config — 방 안 오브젝트 배치 + 데이터 매핑
 *
 * 각 leaf NoteNode가 정확히 1개의 ObjectPart에 매핑됨
 * walkPath: 시계 방향 탐색 순서
 */

export type ObjectType =
  | "painting"     // 액자
  | "book"         // 책
  | "scroll"       // 두루마리
  | "globe"        // 지구본
  | "clock"        // 시계
  | "scale"        // 저울
  | "plant"        // 화분
  | "lamp"         // 램프
  | "trophy"       // 트로피
  | "notebook"     // 노트
  | "gavel"        // 법봉
  | "shield"       // 방패
  | "flag"         // 깃발
  | "phone"        // 스마트폰
  | "poster"       // 포스터
  | "nameplate"    // 명패
  | "blackboard"   // 칠판
  | "handcuffs"    // 수갑
  | "magnifier"    // 돋보기
  | "stone"        // 비석
  | "chart"        // 차트
  | "sign"         // 표지판
  | "portrait"     // 초상화
  | "certificate"  // 선서문/증서
  | "lawbook";     // 법전

export interface ObjectPart {
  id: string;           // "mengzi_left"
  keyword: string;      // 작은 글씨 keyword ("분업")
  text: string;         // structured_text
  flatIndex: number;    // flattenStructuredSections의 globalIndex
}

export interface SceneObject {
  id: string;            // "obj_mengzi"
  type: ObjectType;
  x: number;             // SVG viewBox 내 좌표
  y: number;
  scale?: number;        // 기본 1
  keyword: string;       // 오브젝트 대표 keyword ("맹자")
  label: string;         // 오브젝트 설명 ("맹자 초상 액자")
  noteId: string;        // 소속 StructuredNote id
  parts: ObjectPart[];   // 1+ 개의 파트 (각각 1개 leaf node)
}

export interface RoomSceneConfig {
  roomId: string;
  sectionId: string;
  title: string;
  background: "classroom" | "library" | "courtroom" | "office";
  objects: SceneObject[];
  walkPath: string[];    // 오브젝트 ID 순서 (시계 방향)
}
