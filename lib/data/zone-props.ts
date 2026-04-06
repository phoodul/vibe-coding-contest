/**
 * 기억의 궁전 소품(Props) 시스템
 *
 * 각 장소의 구역에 배치 가능한 가구/구조물/소품.
 * 교과서 콘텐츠의 계층 구조에 따라 소품에 개념을 매핑한다.
 *
 * 소품 = 상위 개념을 담는 "가구"
 * 소품 위의 슬롯 = 하위 개념을 담는 "위치"
 *
 * 예: 책장(소품) → 1층 선반(슬롯)=개념A, 2층 선반(슬롯)=개념B, 3층 선반(슬롯)=개념C
 */

export interface PropSlot {
  id: string;
  label: string; // "1층 선반", "왼쪽 서랍" 등
  relativePosition: { x: number; y: number }; // 소품 내 상대 위치 (%)
}

export interface ZoneProp {
  id: string;
  name: string;
  emoji: string;
  description: string;
  /** 소품의 위치 (구역 내 %) */
  position: { x: number; y: number };
  /** 소품 위의 슬롯들 — 하위 개념을 배치할 자리 */
  slots: PropSlot[];
}

/** 장소 유형별 사용 가능한 소품 세트 */
export interface PropSet {
  locationType: string; // "palace", "library", "museum", "nature", "lab" 등
  props: ZoneProp[];
}

// ===== 소품 프리셋 =====

const PALACE_PROPS: ZoneProp[] = [
  {
    id: "pillar", name: "기둥", emoji: "🏛️",
    description: "공간을 떠받치는 거대한 기둥. 각 면에 개념을 배치",
    position: { x: 20, y: 40 },
    slots: [
      { id: "pillar_front", label: "기둥 앞면", relativePosition: { x: 0, y: -15 } },
      { id: "pillar_left", label: "기둥 왼쪽", relativePosition: { x: -12, y: 0 } },
      { id: "pillar_right", label: "기둥 오른쪽", relativePosition: { x: 12, y: 0 } },
      { id: "pillar_back", label: "기둥 뒷면", relativePosition: { x: 0, y: 15 } },
    ],
  },
  {
    id: "throne", name: "옥좌/의자", emoji: "🪑",
    description: "중앙의 핵심 자리. 가장 중요한 개념을 배치",
    position: { x: 50, y: 30 },
    slots: [
      { id: "throne_seat", label: "좌석", relativePosition: { x: 0, y: 0 } },
      { id: "throne_arm_l", label: "왼쪽 팔걸이", relativePosition: { x: -15, y: 5 } },
      { id: "throne_arm_r", label: "오른쪽 팔걸이", relativePosition: { x: 15, y: 5 } },
    ],
  },
  {
    id: "table", name: "탁자", emoji: "🪵",
    description: "물건을 올려놓는 탁자. 관련 개념들을 모아 배치",
    position: { x: 75, y: 50 },
    slots: [
      { id: "table_top", label: "탁자 위", relativePosition: { x: 0, y: -10 } },
      { id: "table_drawer_l", label: "왼쪽 서랍", relativePosition: { x: -10, y: 8 } },
      { id: "table_drawer_r", label: "오른쪽 서랍", relativePosition: { x: 10, y: 8 } },
    ],
  },
  {
    id: "wall_art", name: "벽면 액자", emoji: "🖼️",
    description: "벽에 걸린 액자들. 순서대로 나열되는 개념에 적합",
    position: { x: 50, y: 15 },
    slots: [
      { id: "frame_1", label: "첫 번째 액자", relativePosition: { x: -20, y: 0 } },
      { id: "frame_2", label: "두 번째 액자", relativePosition: { x: 0, y: 0 } },
      { id: "frame_3", label: "세 번째 액자", relativePosition: { x: 20, y: 0 } },
    ],
  },
  {
    id: "shelf", name: "선반/책장", emoji: "📚",
    description: "층층이 쌓인 선반. 계층적 개념을 위에서 아래로 배치",
    position: { x: 15, y: 65 },
    slots: [
      { id: "shelf_1", label: "1층 선반", relativePosition: { x: 0, y: 15 } },
      { id: "shelf_2", label: "2층 선반", relativePosition: { x: 0, y: 5 } },
      { id: "shelf_3", label: "3층 선반", relativePosition: { x: 0, y: -5 } },
      { id: "shelf_4", label: "4층 선반", relativePosition: { x: 0, y: -15 } },
    ],
  },
  {
    id: "floor_mat", name: "바닥 깔개", emoji: "🟫",
    description: "바닥에 펼쳐진 깔개. 기초적인 개념을 배치",
    position: { x: 50, y: 80 },
    slots: [
      { id: "mat_center", label: "깔개 중앙", relativePosition: { x: 0, y: 0 } },
      { id: "mat_edge_l", label: "깔개 왼쪽", relativePosition: { x: -15, y: 0 } },
      { id: "mat_edge_r", label: "깔개 오른쪽", relativePosition: { x: 15, y: 0 } },
    ],
  },
  {
    id: "window", name: "창문", emoji: "🪟",
    description: "빛이 들어오는 창문. 밖을 바라보는 관점/시각 개념에 적합",
    position: { x: 85, y: 25 },
    slots: [
      { id: "window_sill", label: "창턱", relativePosition: { x: 0, y: 10 } },
      { id: "window_pane", label: "유리면", relativePosition: { x: 0, y: -5 } },
    ],
  },
  {
    id: "chest", name: "보물함/상자", emoji: "📦",
    description: "뚜껑을 열면 내용이 나오는 상자. 정의/핵심 개념에 적합",
    position: { x: 80, y: 75 },
    slots: [
      { id: "chest_inside", label: "상자 안", relativePosition: { x: 0, y: -5 } },
      { id: "chest_lid", label: "뚜껑 위", relativePosition: { x: 0, y: -15 } },
    ],
  },
];

const NATURE_PROPS: ZoneProp[] = [
  {
    id: "tree", name: "나무", emoji: "🌳",
    description: "뿌리→줄기→가지→열매로 구조화된 개념에 적합",
    position: { x: 25, y: 35 },
    slots: [
      { id: "tree_root", label: "뿌리", relativePosition: { x: 0, y: 20 } },
      { id: "tree_trunk", label: "줄기", relativePosition: { x: 0, y: 5 } },
      { id: "tree_branch_l", label: "왼쪽 가지", relativePosition: { x: -15, y: -10 } },
      { id: "tree_branch_r", label: "오른쪽 가지", relativePosition: { x: 15, y: -10 } },
      { id: "tree_top", label: "꼭대기", relativePosition: { x: 0, y: -20 } },
    ],
  },
  {
    id: "rock", name: "바위", emoji: "🪨",
    description: "견고한 기초 개념. 바위 위/옆에 배치",
    position: { x: 70, y: 60 },
    slots: [
      { id: "rock_top", label: "바위 위", relativePosition: { x: 0, y: -10 } },
      { id: "rock_side", label: "바위 옆", relativePosition: { x: 15, y: 0 } },
    ],
  },
  {
    id: "pond", name: "연못/호수", emoji: "💧",
    description: "흐름이 있는 개념. 수면 위와 아래에 배치",
    position: { x: 50, y: 75 },
    slots: [
      { id: "pond_surface", label: "수면 위", relativePosition: { x: 0, y: -5 } },
      { id: "pond_left", label: "왼쪽 둑", relativePosition: { x: -20, y: 0 } },
      { id: "pond_right", label: "오른쪽 둑", relativePosition: { x: 20, y: 0 } },
    ],
  },
  {
    id: "path", name: "오솔길", emoji: "🛤️",
    description: "순서가 있는 과정/단계. 길을 따라 배치",
    position: { x: 50, y: 50 },
    slots: [
      { id: "path_start", label: "길 시작", relativePosition: { x: -20, y: 10 } },
      { id: "path_mid", label: "길 중간", relativePosition: { x: 0, y: 0 } },
      { id: "path_end", label: "길 끝", relativePosition: { x: 20, y: -10 } },
    ],
  },
  {
    id: "flower_bed", name: "꽃밭", emoji: "🌸",
    description: "여러 종류가 모인 분류 개념에 적합",
    position: { x: 15, y: 70 },
    slots: [
      { id: "flower_1", label: "첫 번째 꽃", relativePosition: { x: -10, y: -5 } },
      { id: "flower_2", label: "두 번째 꽃", relativePosition: { x: 5, y: 0 } },
      { id: "flower_3", label: "세 번째 꽃", relativePosition: { x: -5, y: 10 } },
    ],
  },
  {
    id: "sign_post", name: "이정표", emoji: "🪧",
    description: "방향이나 선택지를 나타내는 개념에 적합",
    position: { x: 80, y: 30 },
    slots: [
      { id: "sign_top", label: "위쪽 표지판", relativePosition: { x: 0, y: -12 } },
      { id: "sign_mid", label: "중간 표지판", relativePosition: { x: 0, y: 0 } },
      { id: "sign_bottom", label: "아래쪽 표지판", relativePosition: { x: 0, y: 12 } },
    ],
  },
];

const LAB_PROPS: ZoneProp[] = [
  {
    id: "microscope", name: "현미경", emoji: "🔬",
    description: "미시적 관찰 대상. 렌즈/스테이지/조명에 배치",
    position: { x: 30, y: 40 },
    slots: [
      { id: "micro_lens", label: "접안렌즈", relativePosition: { x: 0, y: -15 } },
      { id: "micro_stage", label: "재물대", relativePosition: { x: 0, y: 5 } },
      { id: "micro_light", label: "조명장치", relativePosition: { x: 0, y: 15 } },
    ],
  },
  {
    id: "whiteboard", name: "화이트보드", emoji: "📋",
    description: "정리/비교에 적합. 왼쪽/중간/오른쪽으로 구분",
    position: { x: 50, y: 15 },
    slots: [
      { id: "board_left", label: "왼쪽 영역", relativePosition: { x: -20, y: 0 } },
      { id: "board_center", label: "중앙 영역", relativePosition: { x: 0, y: 0 } },
      { id: "board_right", label: "오른쪽 영역", relativePosition: { x: 20, y: 0 } },
    ],
  },
  {
    id: "test_tubes", name: "시험관 거치대", emoji: "🧪",
    description: "여러 항목을 나란히 비교. 각 시험관에 하나씩",
    position: { x: 70, y: 45 },
    slots: [
      { id: "tube_1", label: "1번 시험관", relativePosition: { x: -15, y: 0 } },
      { id: "tube_2", label: "2번 시험관", relativePosition: { x: -5, y: 0 } },
      { id: "tube_3", label: "3번 시험관", relativePosition: { x: 5, y: 0 } },
      { id: "tube_4", label: "4번 시험관", relativePosition: { x: 15, y: 0 } },
    ],
  },
  {
    id: "diagram_wall", name: "도해 벽면", emoji: "🗺️",
    description: "큰 도해/다이어그램. 계층적 구조를 한눈에",
    position: { x: 20, y: 20 },
    slots: [
      { id: "diagram_top", label: "도해 상단", relativePosition: { x: 0, y: -10 } },
      { id: "diagram_mid", label: "도해 중단", relativePosition: { x: 0, y: 0 } },
      { id: "diagram_bottom", label: "도해 하단", relativePosition: { x: 0, y: 10 } },
    ],
  },
  {
    id: "cabinet", name: "시약장", emoji: "🗄️",
    description: "분류별로 정리된 서랍. 범주화된 개념에 적합",
    position: { x: 85, y: 65 },
    slots: [
      { id: "cab_top", label: "상단 서랍", relativePosition: { x: 0, y: -12 } },
      { id: "cab_mid", label: "중단 서랍", relativePosition: { x: 0, y: 0 } },
      { id: "cab_bottom", label: "하단 서랍", relativePosition: { x: 0, y: 12 } },
    ],
  },
  {
    id: "model", name: "3D 모형", emoji: "🧬",
    description: "입체적 구조 모형. 각 부분에 개념 배치",
    position: { x: 50, y: 70 },
    slots: [
      { id: "model_top", label: "모형 상부", relativePosition: { x: 0, y: -10 } },
      { id: "model_core", label: "모형 핵심", relativePosition: { x: 0, y: 0 } },
      { id: "model_base", label: "모형 기반", relativePosition: { x: 0, y: 10 } },
    ],
  },
];

// 장소 유형별 소품 세트 매핑
const PROP_SETS: Record<string, ZoneProp[]> = {
  // 한국 명소 — 궁궐/건축 소품
  gyeongbokgung: PALACE_PROPS,
  hanok: PALACE_PROPS,
  changdeokgung: PALACE_PROPS,
  hwaseong: PALACE_PROPS,
  gwanghwamun: PALACE_PROPS,
  bulguksa: PALACE_PROPS,
  // 자연/야외 — 자연 소품
  namsan: NATURE_PROPS,
  jeju: NATURE_PROPS,
  ecosystem_park: NATURE_PROPS,
  // 실내/연구 — 실험실 소품
  museum: [...PALACE_PROPS.slice(0, 4), ...LAB_PROPS.slice(0, 2)],
  library: PALACE_PROPS,
  // 바이오 아일랜드
  cell_dome: LAB_PROPS,
  dna_tower: LAB_PROPS,
  division_plaza: [...LAB_PROPS.slice(0, 3), ...NATURE_PROPS.slice(0, 3)],
  homeostasis_center: LAB_PROPS,
  // 언어의 궁전
  phoneme_fortress: PALACE_PROPS,
  morpheme_workshop: [...LAB_PROPS.slice(0, 3), ...PALACE_PROPS.slice(0, 3)],
  sentence_palace: PALACE_PROPS,
  jiphyeonjeon: PALACE_PROPS,
  media_square: [...LAB_PROPS.slice(0, 3), ...PALACE_PROPS.slice(0, 3)],
};

/**
 * 장소 키로 사용 가능한 소품 세트를 가져온다.
 * 콘텐츠 항목 수에 맞게 소품을 선택하고 슬롯을 배정한다.
 */
export function getPropsForLocation(locationKey: string): ZoneProp[] {
  return PROP_SETS[locationKey] || PALACE_PROPS;
}

/**
 * 콘텐츠 항목들을 소품에 자동 배정한다.
 * items: 배치할 개념들의 배열
 * props: 사용 가능한 소품 세트
 *
 * 반환: 각 item이 어떤 소품의 어떤 슬롯에 배치되는지
 */
export interface PropAssignment {
  propId: string;
  propName: string;
  propEmoji: string;
  propPosition: { x: number; y: number };
  slotId: string;
  slotLabel: string;
  /** 구역 내 절대 좌표 (소품 위치 + 슬롯 상대 위치) */
  absolutePosition: { x: number; y: number };
}

export function assignItemsToProps(
  itemCount: number,
  locationKey: string
): PropAssignment[] {
  const props = getPropsForLocation(locationKey);
  const assignments: PropAssignment[] = [];

  // 모든 슬롯을 순서대로 펼친다
  const allSlots: { prop: ZoneProp; slot: PropSlot }[] = [];
  for (const prop of props) {
    for (const slot of prop.slots) {
      allSlots.push({ prop, slot });
    }
  }

  // 항목 수만큼 슬롯을 배정
  for (let i = 0; i < itemCount; i++) {
    const { prop, slot } = allSlots[i % allSlots.length];
    assignments.push({
      propId: prop.id,
      propName: prop.name,
      propEmoji: prop.emoji,
      propPosition: prop.position,
      slotId: slot.id,
      slotLabel: slot.label,
      absolutePosition: {
        x: Math.max(5, Math.min(95, prop.position.x + slot.relativePosition.x)),
        y: Math.max(5, Math.min(95, prop.position.y + slot.relativePosition.y)),
      },
    });
  }

  return assignments;
}
