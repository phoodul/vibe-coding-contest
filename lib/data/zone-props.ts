/**
 * 기억의 궁전 소품(Props) 시스템
 *
 * 각 장소의 구역에 배치 가능한 가구/구조물/소품.
 * 교과서 콘텐츠의 계층 구조에 따라 소품에 개념을 매핑한다.
 *
 * 핵심 원칙: 각 소품은 해당 공간에만 존재하는 고유한 것이어야 한다.
 * "탁자"가 아니라 "조선시대 주칠 소반", "기둥"이 아니라 "근정전의 쌍룡 기둥"
 *
 * 소품 = 상위 개념을 담는 "가구"
 * 소품 위의 슬롯 = 하위 개념을 담는 "위치"
 */

export interface PropSlot {
  id: string;
  label: string; // "1층 선반", "왼쪽 서랍" 등 -- 소품 위의 구체적 위치
  relativePosition: { x: number; y: number }; // 소품 내 상대 위치 (%)
}

export interface ZoneProp {
  id: string;
  name: string; // 고유하고 구체적인 이름
  emoji: string;
  description: string; // 시각적 특징 묘사 (색상, 질감, 크기 등)
  position: { x: number; y: number }; // 구역 내 위치 (0-100%)
  slots: PropSlot[]; // 하위 개념을 배치할 자리들 (2-5개)
}

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

import { BIO_ISLAND_ZONE_PROPS, KOREAN_LANG_ZONE_PROPS } from "./zone-props-special";

// ===== 기본 소품 (매핑되지 않은 구역용) =====

const DEFAULT_PROPS: ZoneProp[] = [
  {
    id: "default_desk", name: "참나무 책상", emoji: "🪵",
    description: "튼튼한 참나무로 만든 넓은 책상. 서랍이 양쪽에 달려 있다",
    position: { x: 25, y: 40 },
    slots: [
      { id: "desk_top", label: "책상 위", relativePosition: { x: 0, y: -10 } },
      { id: "desk_drawer_l", label: "왼쪽 서랍", relativePosition: { x: -12, y: 8 } },
      { id: "desk_drawer_r", label: "오른쪽 서랍", relativePosition: { x: 12, y: 8 } },
    ],
  },
  {
    id: "default_shelf", name: "4단 나무 선반", emoji: "📚",
    description: "벽에 기대어 선 4단 선반. 각 층에 물건을 올려놓을 수 있다",
    position: { x: 75, y: 35 },
    slots: [
      { id: "shelf_1", label: "1단 선반", relativePosition: { x: 0, y: 15 } },
      { id: "shelf_2", label: "2단 선반", relativePosition: { x: 0, y: 5 } },
      { id: "shelf_3", label: "3단 선반", relativePosition: { x: 0, y: -5 } },
      { id: "shelf_4", label: "4단 선반", relativePosition: { x: 0, y: -15 } },
    ],
  },
  {
    id: "default_board", name: "코르크 게시판", emoji: "📋",
    description: "벽에 걸린 코르크 게시판. 핀으로 메모를 꽂을 수 있다",
    position: { x: 50, y: 15 },
    slots: [
      { id: "board_left", label: "게시판 왼쪽", relativePosition: { x: -18, y: 0 } },
      { id: "board_center", label: "게시판 중앙", relativePosition: { x: 0, y: 0 } },
      { id: "board_right", label: "게시판 오른쪽", relativePosition: { x: 18, y: 0 } },
    ],
  },
  {
    id: "default_cabinet", name: "서류 캐비넷", emoji: "🗄️",
    description: "3단 철제 서류 캐비넷. 서랍을 열면 파일이 정리되어 있다",
    position: { x: 50, y: 70 },
    slots: [
      { id: "cab_top", label: "상단 서랍", relativePosition: { x: 0, y: -10 } },
      { id: "cab_mid", label: "중단 서랍", relativePosition: { x: 0, y: 0 } },
      { id: "cab_bottom", label: "하단 서랍", relativePosition: { x: 0, y: 10 } },
    ],
  },
];

// =========================================================
// 한국 명소 10곳 x 5구역 = 50개 구역별 고유 소품
// =========================================================

export const ZONE_SPECIFIC_PROPS: Record<string, ZoneProp[]> = {
  // 바이오 아일랜드 + 언어의 궁전 소품 (zone-props-special.ts에서 import)
  ...BIO_ISLAND_ZONE_PROPS,
  ...KOREAN_LANG_ZONE_PROPS,
  // 한국 명소 소품 (아래에 직접 정의)

  // ─── 1. 경복궁 (gyeongbokgung) ─────────────────────────

  gwanghwamun: [
    {
      id: "gwh_haetae", name: "해태 석상", emoji: "🦁",
      description: "화강암을 깎아 만든 해태. 불의를 물리치는 상서로운 짐승으로, 이마에 뿔이 솟아 있다",
      position: { x: 20, y: 60 },
      slots: [
        { id: "haetae_horn", label: "해태 뿔 위", relativePosition: { x: 0, y: -15 } },
        { id: "haetae_back", label: "해태 등 위", relativePosition: { x: 5, y: -5 } },
        { id: "haetae_paw", label: "해태 앞발 옆", relativePosition: { x: -10, y: 10 } },
      ],
    },
    {
      id: "gwh_dancheong", name: "오색 단청 문틀", emoji: "🎨",
      description: "청, 적, 황, 백, 흑 오방색으로 칠한 광화문 문틀. 연화문과 뇌문 무늬가 정교하다",
      position: { x: 50, y: 20 },
      slots: [
        { id: "dancheong_left", label: "왼쪽 문틀 단청", relativePosition: { x: -15, y: 0 } },
        { id: "dancheong_top", label: "상인방 단청", relativePosition: { x: 0, y: -8 } },
        { id: "dancheong_right", label: "오른쪽 문틀 단청", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "gwh_hongyemun", name: "홍예문 아치", emoji: "🏛️",
      description: "무지개처럼 휜 돌 아치 3개가 나란히 뚫린 광화문의 통로. 중앙 아치가 가장 크다",
      position: { x: 50, y: 50 },
      slots: [
        { id: "hongye_left", label: "좌측 아치", relativePosition: { x: -18, y: 0 } },
        { id: "hongye_center", label: "중앙 아치(어도)", relativePosition: { x: 0, y: 0 } },
        { id: "hongye_right", label: "우측 아치", relativePosition: { x: 18, y: 0 } },
      ],
    },
    {
      id: "gwh_sumunjang", name: "궁궐 수문장", emoji: "💂",
      description: "붉은 철릭에 전립을 쓰고 장창을 든 수문장. 미동도 없이 직립부동 자세다",
      position: { x: 80, y: 55 },
      slots: [
        { id: "sumun_spear", label: "수문장 장창 끝", relativePosition: { x: 5, y: -15 } },
        { id: "sumun_shield", label: "수문장 방패", relativePosition: { x: -8, y: 0 } },
        { id: "sumun_hat", label: "수문장 전립", relativePosition: { x: 0, y: -20 } },
      ],
    },
  ],

  geunjeongjeon: [
    {
      id: "gnj_throne", name: "어좌와 일월오봉도 병풍", emoji: "👑",
      description: "금박 용문이 새겨진 어좌 뒤로 해와 달, 다섯 봉우리가 그려진 병풍이 펼쳐져 있다",
      position: { x: 50, y: 25 },
      slots: [
        { id: "throne_seat", label: "어좌 좌석", relativePosition: { x: 0, y: 5 } },
        { id: "throne_sun", label: "병풍 속 해(좌)", relativePosition: { x: -15, y: -10 } },
        { id: "throne_moon", label: "병풍 속 달(우)", relativePosition: { x: 15, y: -10 } },
        { id: "throne_peaks", label: "병풍 속 오봉", relativePosition: { x: 0, y: -15 } },
      ],
    },
    {
      id: "gnj_dragon_pillar", name: "쌍룡 기둥", emoji: "🐉",
      description: "근정전 내부의 붉은 기둥. 두 마리 용이 여의주를 물고 기둥을 감아 올라간다",
      position: { x: 20, y: 40 },
      slots: [
        { id: "dragon_up", label: "승천하는 용 머리", relativePosition: { x: -5, y: -15 } },
        { id: "dragon_mid", label: "용 몸통 감긴 곳", relativePosition: { x: 5, y: 0 } },
        { id: "dragon_jewel", label: "여의주", relativePosition: { x: 0, y: -20 } },
      ],
    },
    {
      id: "gnj_pumgyeseok", name: "품계석", emoji: "🪨",
      description: "정일품부터 종구품까지 관직 등급이 새겨진 편평한 석판이 좌우로 도열해 있다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "pumgye_1", label: "정일품 석판", relativePosition: { x: -15, y: 0 } },
        { id: "pumgye_3", label: "정삼품 석판", relativePosition: { x: 0, y: 0 } },
        { id: "pumgye_9", label: "종구품 석판", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "gnj_bakseok", name: "조정 박석 바닥", emoji: "🟫",
      description: "자연석을 다듬어 깐 너른 마당. 신하들이 도열하던 거친 질감의 화강암 바닥이다",
      position: { x: 80, y: 55 },
      slots: [
        { id: "bakseok_left", label: "박석 바닥 좌측", relativePosition: { x: -12, y: 0 } },
        { id: "bakseok_center", label: "박석 바닥 어도", relativePosition: { x: 0, y: -5 } },
        { id: "bakseok_right", label: "박석 바닥 우측", relativePosition: { x: 12, y: 0 } },
      ],
    },
  ],

  sajeongjeon: [
    {
      id: "sjj_seoan", name: "편전 서안(왕의 업무 책상)", emoji: "📜",
      description: "흑칠을 한 낮은 서안. 왕이 문서를 펼쳐놓고 업무를 보던 정갈한 책상이다",
      position: { x: 50, y: 35 },
      slots: [
        { id: "seoan_top", label: "서안 위 문서 자리", relativePosition: { x: 0, y: -5 } },
        { id: "seoan_left", label: "서안 왼쪽 끝", relativePosition: { x: -15, y: 0 } },
        { id: "seoan_right", label: "서안 오른쪽 끝", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "sjj_brush", name: "붓과 벼루 세트", emoji: "🖌️",
      description: "양모 붓, 오석 벼루, 먹, 화선지가 가지런히 놓인 문방사우. 먹물 냄새가 난다",
      position: { x: 25, y: 50 },
      slots: [
        { id: "brush_tip", label: "붓끝", relativePosition: { x: -5, y: -10 } },
        { id: "inkstone", label: "벼루 위", relativePosition: { x: 5, y: 0 } },
        { id: "paper_stack", label: "화선지 묶음", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "sjj_eocheop", name: "만기친람 어첩", emoji: "📖",
      description: "왕이 친히 열람하던 국정 보고서 묶음. 비단 표지에 '만기친람'이라 쓰여 있다",
      position: { x: 75, y: 45 },
      slots: [
        { id: "eocheop_cover", label: "어첩 표지", relativePosition: { x: 0, y: -8 } },
        { id: "eocheop_page", label: "펼친 면", relativePosition: { x: 0, y: 5 } },
        { id: "eocheop_seal", label: "어보(어첩 위 도장)", relativePosition: { x: 10, y: -5 } },
      ],
    },
  ],

  gyeonghoeru: [
    {
      id: "gyh_stone_pillars", name: "연못 위 48개 돌기둥", emoji: "🏛️",
      description: "경회루를 떠받치는 48개의 화강암 기둥. 2층 누각이 연못 위에 떠 있는 듯하다",
      position: { x: 30, y: 40 },
      slots: [
        { id: "pillar_outer", label: "외진 기둥(바깥줄)", relativePosition: { x: -15, y: 0 } },
        { id: "pillar_inner", label: "내진 기둥(안쪽줄)", relativePosition: { x: 0, y: 0 } },
        { id: "pillar_corner", label: "모서리 기둥", relativePosition: { x: 15, y: 10 } },
      ],
    },
    {
      id: "gyh_stone_lotus", name: "난간 위 석조 연꽃", emoji: "🪷",
      description: "경회루 난간 기둥마다 올려진 돌 연꽃봉오리. 연잎 위에 연봉이 솟아 있다",
      position: { x: 70, y: 25 },
      slots: [
        { id: "lotus_bud", label: "연꽃 봉오리", relativePosition: { x: 0, y: -10 } },
        { id: "lotus_leaf", label: "연잎 받침", relativePosition: { x: 0, y: 5 } },
        { id: "lotus_stem", label: "연줄기", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "gyh_hyunpan", name: "경회루 현판", emoji: "🪧",
      description: "'慶會樓' 세 글자가 금박으로 쓰인 검은 현판. 2층 정면에 높이 걸려 있다",
      position: { x: 50, y: 10 },
      slots: [
        { id: "hyunpan_char1", label: "경(慶) 자", relativePosition: { x: -12, y: 0 } },
        { id: "hyunpan_char2", label: "회(會) 자", relativePosition: { x: 0, y: 0 } },
        { id: "hyunpan_char3", label: "루(樓) 자", relativePosition: { x: 12, y: 0 } },
      ],
    },
    {
      id: "gyh_pond", name: "경회루 연못", emoji: "💧",
      description: "경회루를 감싸는 사각 연못. 수면에 누각이 비치고, 여름엔 연꽃이 핀다",
      position: { x: 50, y: 75 },
      slots: [
        { id: "pond_surface", label: "수면 위 반영", relativePosition: { x: 0, y: -5 } },
        { id: "pond_edge_l", label: "연못 왼쪽 둑", relativePosition: { x: -18, y: 0 } },
        { id: "pond_edge_r", label: "연못 오른쪽 둑", relativePosition: { x: 18, y: 0 } },
      ],
    },
  ],

  hyangwonjeong: [
    {
      id: "hwj_bridge", name: "취향교 나무다리", emoji: "🌉",
      description: "향원정으로 건너는 긴 나무다리. 붉은 칠을 한 난간이 양옆으로 뻗어 있다",
      position: { x: 50, y: 65 },
      slots: [
        { id: "bridge_start", label: "다리 입구", relativePosition: { x: -18, y: 5 } },
        { id: "bridge_mid", label: "다리 중간", relativePosition: { x: 0, y: 0 } },
        { id: "bridge_end", label: "다리 끝(정자 쪽)", relativePosition: { x: 18, y: -5 } },
      ],
    },
    {
      id: "hwj_lotus_pond", name: "연꽃 연못", emoji: "🪷",
      description: "향원지 수면을 덮은 분홍 연꽃과 초록 연잎. 잉어가 그 아래를 오간다",
      position: { x: 25, y: 50 },
      slots: [
        { id: "lotus_pink", label: "분홍 연꽃 위", relativePosition: { x: -5, y: -5 } },
        { id: "lotus_pad", label: "연잎 위 물방울", relativePosition: { x: 8, y: 5 } },
        { id: "lotus_fish", label: "수면 아래 잉어", relativePosition: { x: 0, y: 12 } },
      ],
    },
    {
      id: "hwj_wind_chime", name: "육각정 처마 풍경", emoji: "🔔",
      description: "향원정 육각 처마 끝마다 매달린 청동 풍경. 바람에 맑은 소리를 낸다",
      position: { x: 50, y: 15 },
      slots: [
        { id: "chime_east", label: "동쪽 풍경", relativePosition: { x: 12, y: 0 } },
        { id: "chime_west", label: "서쪽 풍경", relativePosition: { x: -12, y: 0 } },
        { id: "chime_south", label: "남쪽 풍경", relativePosition: { x: 0, y: 8 } },
      ],
    },
    {
      id: "hwj_hexagonal_roof", name: "육각 지붕 꼭지(절병통)", emoji: "🏯",
      description: "향원정 꼭대기의 절병통. 여섯 갈래 처마가 하늘을 향해 살짝 치켜 올라간다",
      position: { x: 75, y: 25 },
      slots: [
        { id: "roof_apex", label: "절병통 꼭대기", relativePosition: { x: 0, y: -12 } },
        { id: "roof_eave", label: "처마 끝", relativePosition: { x: 10, y: 5 } },
      ],
    },
  ],

  // ─── 2. 한옥마을 (hanok) ────────────────────────────────

  madang: [
    {
      id: "md_jangdokdae", name: "장독대", emoji: "🏺",
      description: "뒤뜰 양지바른 곳에 놓인 옹기 항아리들. 된장, 간장, 고추장이 익어간다",
      position: { x: 30, y: 45 },
      slots: [
        { id: "jangdok_big", label: "큰 항아리(된장독)", relativePosition: { x: -8, y: 0 } },
        { id: "jangdok_mid", label: "중간 항아리(간장독)", relativePosition: { x: 5, y: -5 } },
        { id: "jangdok_small", label: "작은 항아리(고추장독)", relativePosition: { x: 10, y: 8 } },
      ],
    },
    {
      id: "md_dolhwak", name: "돌확(절구)", emoji: "🪨",
      description: "마당 한쪽에 놓인 검은 돌확. 곡식을 빻거나 떡을 치는 데 쓴다",
      position: { x: 65, y: 60 },
      slots: [
        { id: "dolhwak_bowl", label: "돌확 안쪽", relativePosition: { x: 0, y: 0 } },
        { id: "dolhwak_pestle", label: "절굿공이", relativePosition: { x: 8, y: -10 } },
      ],
    },
    {
      id: "md_persimmon", name: "감나무", emoji: "🌳",
      description: "마당 한가운데 선 감나무. 가을이면 주황 감이 주렁주렁 매달린다",
      position: { x: 50, y: 25 },
      slots: [
        { id: "persimmon_fruit", label: "감 열매 가지", relativePosition: { x: 5, y: -15 } },
        { id: "persimmon_trunk", label: "감나무 줄기", relativePosition: { x: 0, y: 5 } },
        { id: "persimmon_root", label: "감나무 뿌리 옆", relativePosition: { x: -5, y: 15 } },
      ],
    },
    {
      id: "md_wall", name: "빗살무늬 담장", emoji: "🧱",
      description: "기와를 비스듬히 쌓아 만든 빗살무늬 담장. 흙과 기와가 번갈아 층을 이룬다",
      position: { x: 85, y: 35 },
      slots: [
        { id: "wall_pattern_l", label: "담장 왼쪽 무늬", relativePosition: { x: -10, y: 0 } },
        { id: "wall_pattern_r", label: "담장 오른쪽 무늬", relativePosition: { x: 10, y: 0 } },
        { id: "wall_top", label: "담장 위 기와", relativePosition: { x: 0, y: -10 } },
      ],
    },
  ],

  daecheong: [
    {
      id: "dc_maru", name: "나무 마루판", emoji: "🪵",
      description: "반질반질 윤이 나는 넓은 마루판. 맨발로 걸으면 나무 결이 느껴진다",
      position: { x: 50, y: 75 },
      slots: [
        { id: "maru_center", label: "마루 한가운데", relativePosition: { x: 0, y: 0 } },
        { id: "maru_edge", label: "마루 가장자리", relativePosition: { x: 18, y: 0 } },
        { id: "maru_corner", label: "마루 구석", relativePosition: { x: -18, y: 5 } },
      ],
    },
    {
      id: "dc_door", name: "문풍지 바른 미닫이문", emoji: "🚪",
      description: "창호지를 바른 나무 살 미닫이문. 밖의 빛이 은은하게 스며든다",
      position: { x: 20, y: 35 },
      slots: [
        { id: "door_left", label: "왼쪽 문짝", relativePosition: { x: -8, y: 0 } },
        { id: "door_right", label: "오른쪽 문짝", relativePosition: { x: 8, y: 0 } },
        { id: "door_handle", label: "문손잡이(들쇠)", relativePosition: { x: 0, y: 5 } },
      ],
    },
    {
      id: "dc_daedulbo", name: "대들보", emoji: "🏗️",
      description: "대청 천장을 가로지르는 거대한 소나무 대들보. 세월의 결이 짙다",
      position: { x: 50, y: 10 },
      slots: [
        { id: "beam_left", label: "대들보 왼쪽 끝", relativePosition: { x: -20, y: 0 } },
        { id: "beam_center", label: "대들보 한가운데", relativePosition: { x: 0, y: 0 } },
        { id: "beam_right", label: "대들보 오른쪽 끝", relativePosition: { x: 20, y: 0 } },
      ],
    },
  ],

  sarangbang: [
    {
      id: "sr_munbangsawu", name: "서예 문방사우", emoji: "🖌️",
      description: "먹, 붓, 벼루, 종이 네 벗이 서안 위에 가지런히 놓여 있다",
      position: { x: 40, y: 40 },
      slots: [
        { id: "brush", label: "양모 붓", relativePosition: { x: -10, y: -5 } },
        { id: "inkstick", label: "먹", relativePosition: { x: -3, y: 5 } },
        { id: "inkstone_sr", label: "오석 벼루", relativePosition: { x: 8, y: 0 } },
        { id: "paper", label: "한지 화선지", relativePosition: { x: 15, y: -5 } },
      ],
    },
    {
      id: "sr_candlestick", name: "놋쇠 촛대", emoji: "🕯️",
      description: "사랑방 구석의 놋쇠 촛대. 붉은 밀초가 꽂혀 은은한 불빛을 드리운다",
      position: { x: 80, y: 30 },
      slots: [
        { id: "candle_flame", label: "촛불", relativePosition: { x: 0, y: -12 } },
        { id: "candle_base", label: "촛대 받침", relativePosition: { x: 0, y: 8 } },
      ],
    },
    {
      id: "sr_byeongpung", name: "산수화 병풍", emoji: "🖼️",
      description: "수묵 산수화가 그려진 8폭 병풍. 안개 낀 산봉우리와 폭포가 이어진다",
      position: { x: 50, y: 15 },
      slots: [
        { id: "screen_left", label: "병풍 왼쪽 4폭", relativePosition: { x: -15, y: 0 } },
        { id: "screen_center", label: "병풍 중앙", relativePosition: { x: 0, y: 0 } },
        { id: "screen_right", label: "병풍 오른쪽 4폭", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "sr_yulpan", name: "윤판(율판)", emoji: "🎲",
      description: "윷놀이에 쓰는 나무 윤판. 둥근 판 위에 29개의 말길이 새겨져 있다",
      position: { x: 25, y: 70 },
      slots: [
        { id: "yulpan_center", label: "윤판 중앙(모)", relativePosition: { x: 0, y: 0 } },
        { id: "yulpan_outer", label: "윤판 바깥줄", relativePosition: { x: 10, y: 8 } },
      ],
    },
  ],

  anbang: [
    {
      id: "ab_jagaejang", name: "자개장", emoji: "✨",
      description: "흑칠 위에 자개(전복 껍데기)로 학과 모란을 박아넣은 2층 의류장",
      position: { x: 20, y: 30 },
      slots: [
        { id: "jagae_top", label: "자개장 윗칸", relativePosition: { x: 0, y: -12 } },
        { id: "jagae_bottom", label: "자개장 아랫칸", relativePosition: { x: 0, y: 5 } },
        { id: "jagae_door", label: "자개장 문짝 장식", relativePosition: { x: -8, y: -3 } },
      ],
    },
    {
      id: "ab_ibulbo", name: "수놓은 이불보", emoji: "🧵",
      description: "모란과 나비를 수놓은 비단 이불보. 붉은 바탕에 금실 자수가 빛난다",
      position: { x: 50, y: 60 },
      slots: [
        { id: "ibul_center", label: "이불보 중앙 문양", relativePosition: { x: 0, y: 0 } },
        { id: "ibul_border", label: "이불보 테두리", relativePosition: { x: 15, y: 5 } },
      ],
    },
    {
      id: "ab_jangjimun", name: "장지문", emoji: "🚪",
      description: "안방과 건넌방 사이의 넓은 장지문. 네 짝으로 이루어져 모두 열면 통간이 된다",
      position: { x: 80, y: 35 },
      slots: [
        { id: "jangji_1", label: "첫째 짝 장지문", relativePosition: { x: -10, y: 0 } },
        { id: "jangji_2", label: "둘째 짝 장지문", relativePosition: { x: 0, y: 0 } },
        { id: "jangji_3", label: "셋째 짝 장지문", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "ab_dadumidol", name: "다듬이돌", emoji: "🪨",
      description: "옷감을 올려놓고 방망이로 두드려 다듬는 납작한 돌. 매끄럽게 닳아 있다",
      position: { x: 45, y: 80 },
      slots: [
        { id: "dadum_stone", label: "다듬이돌 위", relativePosition: { x: 0, y: -5 } },
        { id: "dadum_stick", label: "다듬이 방망이", relativePosition: { x: 10, y: 5 } },
      ],
    },
  ],

  bueok: [
    {
      id: "bk_gamasot", name: "가마솥", emoji: "🍲",
      description: "부뚜막 위의 커다란 무쇠 가마솥. 밥을 지을 때 뚜껑에서 김이 모락모락 난다",
      position: { x: 35, y: 40 },
      slots: [
        { id: "gamasot_inside", label: "가마솥 안", relativePosition: { x: 0, y: 0 } },
        { id: "gamasot_lid", label: "가마솥 뚜껑", relativePosition: { x: 0, y: -12 } },
        { id: "gamasot_handle", label: "가마솥 손잡이", relativePosition: { x: 12, y: -5 } },
      ],
    },
    {
      id: "bk_siru", name: "시루", emoji: "🫕",
      description: "떡을 찌는 질그릇 시루. 바닥에 구멍이 뚫려 김이 오른다",
      position: { x: 65, y: 35 },
      slots: [
        { id: "siru_inside", label: "시루 안쪽(떡 자리)", relativePosition: { x: 0, y: 0 } },
        { id: "siru_hole", label: "시루 바닥 구멍", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "bk_jori", name: "조리(고리)", emoji: "🧹",
      description: "대나무를 엮어 만든 조리. 쌀을 일며 돌을 골라내는 데 쓰며, 설날에 문에 건다",
      position: { x: 80, y: 25 },
      slots: [
        { id: "jori_mouth", label: "조리 입구", relativePosition: { x: 0, y: -5 } },
        { id: "jori_handle", label: "조리 자루", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "bk_buttumak", name: "부뚜막", emoji: "🔥",
      description: "흙과 돌로 쌓은 아궁이 위의 부뚜막. 불이 활활 타며 솥을 데운다",
      position: { x: 35, y: 70 },
      slots: [
        { id: "buttumak_fire", label: "아궁이 불", relativePosition: { x: 0, y: 5 } },
        { id: "buttumak_shelf", label: "부뚜막 선반", relativePosition: { x: 12, y: -8 } },
        { id: "buttumak_chimney", label: "굴뚝", relativePosition: { x: -12, y: -10 } },
      ],
    },
  ],

  // ─── 3. 국립중앙박물관 (museum) ────────────────────────

  lobby: [
    {
      id: "lb_stone_pagoda", name: "경천사지 십층석탑(복제)", emoji: "🗼",
      description: "대리석으로 조각한 10층 석탑. 각 층에 부처와 보살이 정교하게 새겨져 있다",
      position: { x: 50, y: 40 },
      slots: [
        { id: "pagoda_top", label: "석탑 상륜부", relativePosition: { x: 0, y: -20 } },
        { id: "pagoda_mid", label: "석탑 중간층", relativePosition: { x: 0, y: -5 } },
        { id: "pagoda_base", label: "석탑 기단부", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "lb_led_board", name: "대형 LED 안내판", emoji: "📺",
      description: "로비 벽면의 초대형 LED 디스플레이. 전시 일정과 관람 안내가 흐른다",
      position: { x: 80, y: 25 },
      slots: [
        { id: "led_left", label: "LED 왼쪽 영역", relativePosition: { x: -12, y: 0 } },
        { id: "led_center", label: "LED 중앙 영역", relativePosition: { x: 0, y: 0 } },
        { id: "led_right", label: "LED 오른쪽 영역", relativePosition: { x: 12, y: 0 } },
      ],
    },
    {
      id: "lb_mosaic", name: "대리석 바닥 모자이크", emoji: "🟫",
      description: "로비 바닥의 대리석 모자이크. 기하학 무늬가 방사형으로 퍼져나간다",
      position: { x: 50, y: 75 },
      slots: [
        { id: "mosaic_center", label: "모자이크 중심", relativePosition: { x: 0, y: 0 } },
        { id: "mosaic_ring", label: "모자이크 바깥 고리", relativePosition: { x: 15, y: 5 } },
      ],
    },
  ],

  prehistoric: [
    {
      id: "ph_pottery", name: "빗살무늬 토기", emoji: "🏺",
      description: "뾰족한 바닥에 빗살 무늬가 새겨진 신석기 토기. 갈색 점토로 빚어졌다",
      position: { x: 25, y: 35 },
      slots: [
        { id: "pottery_rim", label: "토기 입구 테두리", relativePosition: { x: 0, y: -10 } },
        { id: "pottery_body", label: "토기 몸통 무늬", relativePosition: { x: 0, y: 0 } },
        { id: "pottery_base", label: "토기 뾰족 바닥", relativePosition: { x: 0, y: 12 } },
      ],
    },
    {
      id: "ph_rock_art", name: "반구대 암각화 모형", emoji: "🪨",
      description: "고래, 사슴, 거북이가 새겨진 바위면 복제품. 선각으로 동물의 윤곽이 뚜렷하다",
      position: { x: 60, y: 40 },
      slots: [
        { id: "rock_whale", label: "고래 그림", relativePosition: { x: -10, y: -5 } },
        { id: "rock_deer", label: "사슴 그림", relativePosition: { x: 5, y: 0 } },
        { id: "rock_turtle", label: "거북 그림", relativePosition: { x: 10, y: 8 } },
      ],
    },
    {
      id: "ph_gold_crown", name: "금관(금관총 출토)", emoji: "👑",
      description: "나뭇가지 모양 세움 장식과 곡옥이 달린 신라 금관. 순금으로 빛난다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "crown_branch", label: "출(出)자형 세움장식", relativePosition: { x: 0, y: -12 } },
        { id: "crown_band", label: "금관 띠(대륜)", relativePosition: { x: 0, y: 0 } },
        { id: "crown_jade", label: "곡옥 달개장식", relativePosition: { x: 10, y: 5 } },
      ],
    },
  ],

  medieval: [
    {
      id: "mv_celadon", name: "청자 상감운학문 매병", emoji: "🏺",
      description: "비취색 바탕에 구름과 학이 상감된 고려 매병. 국보 제68호의 기품이 있다",
      position: { x: 30, y: 35 },
      slots: [
        { id: "celadon_neck", label: "매병 목 부분", relativePosition: { x: 0, y: -12 } },
        { id: "celadon_crane", label: "학 문양", relativePosition: { x: -5, y: 0 } },
        { id: "celadon_cloud", label: "구름 문양", relativePosition: { x: 5, y: 5 } },
      ],
    },
    {
      id: "mv_movable_type", name: "고려 금속활자", emoji: "🔤",
      description: "세계 최초의 금속활자. 작은 동(銅) 글자들이 나무 활자판에 빼곡히 박혀 있다",
      position: { x: 65, y: 40 },
      slots: [
        { id: "type_block", label: "활자판 전체", relativePosition: { x: 0, y: 0 } },
        { id: "type_single", label: "낱개 활자 하나", relativePosition: { x: -10, y: 8 } },
        { id: "type_ink", label: "먹물 묻은 활자", relativePosition: { x: 10, y: -5 } },
      ],
    },
    {
      id: "mv_cheugugi", name: "측우기", emoji: "🌧️",
      description: "세종 때 발명된 세계 최초의 강우 측정기. 원통형 그릇에 빗물이 모인다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "cheug_bowl", label: "측우기 원통 안", relativePosition: { x: 0, y: 0 } },
        { id: "cheug_ruler", label: "측우 자(자)", relativePosition: { x: 8, y: 5 } },
        { id: "cheug_stand", label: "석대(돌 받침)", relativePosition: { x: 0, y: 12 } },
      ],
    },
  ],

  special: [
    {
      id: "sp_partition", name: "이동식 칸막이 벽", emoji: "🧱",
      description: "흰색 가벽으로 나뉜 전시 공간. 벽면마다 다른 작품이 걸릴 수 있다",
      position: { x: 30, y: 35 },
      slots: [
        { id: "partition_front", label: "칸막이 앞면", relativePosition: { x: 0, y: -5 } },
        { id: "partition_back", label: "칸막이 뒷면", relativePosition: { x: 0, y: 8 } },
        { id: "partition_side", label: "칸막이 측면", relativePosition: { x: 12, y: 0 } },
      ],
    },
    {
      id: "sp_spotlight", name: "스포트라이트 조명", emoji: "💡",
      description: "천장 레일에 매달린 할로겐 스포트라이트. 작품을 비추며 그림자를 드리운다",
      position: { x: 60, y: 15 },
      slots: [
        { id: "spot_left", label: "왼쪽 조명 원", relativePosition: { x: -12, y: 5 } },
        { id: "spot_center", label: "중앙 조명 원", relativePosition: { x: 0, y: 5 } },
        { id: "spot_right", label: "오른쪽 조명 원", relativePosition: { x: 12, y: 5 } },
      ],
    },
    {
      id: "sp_glass_case", name: "유리 진열장", emoji: "🔲",
      description: "사면이 유리인 진열장. 안에 유물이 놓이고 아래에서 은은한 조명이 비친다",
      position: { x: 50, y: 65 },
      slots: [
        { id: "case_inside", label: "진열장 안쪽", relativePosition: { x: 0, y: 0 } },
        { id: "case_label", label: "진열장 설명 패널", relativePosition: { x: 0, y: 12 } },
      ],
    },
  ],

  garden: [
    {
      id: "gd_stone_lantern", name: "석등", emoji: "🏮",
      description: "팔각 지붕돌 아래 화창(불 켜는 구멍)이 뚫린 통일신라 양식 석등",
      position: { x: 30, y: 40 },
      slots: [
        { id: "lantern_fire", label: "화창(불빛 구멍)", relativePosition: { x: 0, y: -5 } },
        { id: "lantern_shaft", label: "간주석(기둥)", relativePosition: { x: 0, y: 5 } },
        { id: "lantern_base", label: "하대석(받침)", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "gd_millstone", name: "연자방아 맷돌", emoji: "🫓",
      description: "소가 돌리던 큰 맷돌. 위짝과 아래짝 사이에서 곡식을 갈았다",
      position: { x: 65, y: 50 },
      slots: [
        { id: "mill_upper", label: "맷돌 윗짝", relativePosition: { x: 0, y: -8 } },
        { id: "mill_lower", label: "맷돌 아랫짝", relativePosition: { x: 0, y: 5 } },
        { id: "mill_handle", label: "맷돌 손잡이", relativePosition: { x: 12, y: 0 } },
      ],
    },
    {
      id: "gd_buddha", name: "석조 불상", emoji: "🧘",
      description: "야외에 좌정한 화강암 불상. 반가사유상 자세로 미소 짓고 있다",
      position: { x: 50, y: 75 },
      slots: [
        { id: "buddha_face", label: "불상 얼굴(미소)", relativePosition: { x: 0, y: -15 } },
        { id: "buddha_hand", label: "불상 손(수인)", relativePosition: { x: 8, y: -5 } },
        { id: "buddha_lotus", label: "연화대좌", relativePosition: { x: 0, y: 8 } },
      ],
    },
  ],

  // ─── 4. 서울도서관 (library) ────────────────────────────

  entrance: [
    {
      id: "en_arch_columns", name: "아치형 기둥열(네오르네상스)", emoji: "🏛️",
      description: "1926년 건축된 네오르네상스 양식 기둥열. 코린트식 주두가 얹힌 석조 기둥이다",
      position: { x: 25, y: 35 },
      slots: [
        { id: "column_1", label: "첫 번째 기둥", relativePosition: { x: -10, y: 0 } },
        { id: "column_2", label: "두 번째 기둥", relativePosition: { x: 0, y: 0 } },
        { id: "column_3", label: "세 번째 기둥", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "en_stained_glass", name: "돔형 천장 스테인드글라스", emoji: "🌈",
      description: "로비 천장의 돔에 끼워진 색유리. 햇빛이 들면 바닥에 무지갯빛이 퍼진다",
      position: { x: 50, y: 10 },
      slots: [
        { id: "glass_center", label: "스테인드글라스 중심", relativePosition: { x: 0, y: 0 } },
        { id: "glass_border", label: "스테인드글라스 테두리", relativePosition: { x: 15, y: 5 } },
      ],
    },
    {
      id: "en_bronze_handle", name: "청동 문고리", emoji: "🚪",
      description: "정문의 청동 문고리. 세월에 닳아 손잡이 부분만 금빛으로 반짝인다",
      position: { x: 75, y: 55 },
      slots: [
        { id: "handle_left", label: "왼쪽 문고리", relativePosition: { x: -8, y: 0 } },
        { id: "handle_right", label: "오른쪽 문고리", relativePosition: { x: 8, y: 0 } },
      ],
    },
  ],

  reading: [
    {
      id: "rd_green_lamp", name: "초록 독서등", emoji: "💚",
      description: "에메랄드 유리 갓이 씌워진 놋쇠 독서등. 따뜻한 노란빛을 내리쬔다",
      position: { x: 30, y: 35 },
      slots: [
        { id: "lamp_shade", label: "초록 유리 갓", relativePosition: { x: 0, y: -10 } },
        { id: "lamp_light", label: "불빛 원(바닥에 비친)", relativePosition: { x: 0, y: 8 } },
      ],
    },
    {
      id: "rd_oak_desk", name: "참나무 열람 데스크", emoji: "🪵",
      description: "양옆에 칸막이가 있는 1인용 참나무 열람 데스크. 가죽 매트가 깔려 있다",
      position: { x: 60, y: 45 },
      slots: [
        { id: "desk_mat", label: "가죽 매트 위", relativePosition: { x: 0, y: 0 } },
        { id: "desk_divider_l", label: "왼쪽 칸막이", relativePosition: { x: -12, y: 0 } },
        { id: "desk_divider_r", label: "오른쪽 칸막이", relativePosition: { x: 12, y: 0 } },
      ],
    },
    {
      id: "rd_card_catalog", name: "카드 목록 서랍장", emoji: "🗃️",
      description: "알파벳순으로 분류된 나무 카드 서랍장. 작은 놋쇠 손잡이가 줄지어 달렸다",
      position: { x: 50, y: 75 },
      slots: [
        { id: "card_top", label: "상단 서랍(ㄱ~ㄷ)", relativePosition: { x: 0, y: -10 } },
        { id: "card_mid", label: "중단 서랍(ㄹ~ㅂ)", relativePosition: { x: 0, y: 0 } },
        { id: "card_bottom", label: "하단 서랍(ㅅ~ㅎ)", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],

  stacks: [
    {
      id: "st_mobile_shelf", name: "높이 3m 이동식 철재 서가", emoji: "📚",
      description: "핸들을 돌리면 좌우로 밀리는 이동식 서가. 빼곡한 책등이 벽처럼 서 있다",
      position: { x: 35, y: 40 },
      slots: [
        { id: "shelf_high", label: "서가 맨 위칸", relativePosition: { x: 0, y: -15 } },
        { id: "shelf_eye", label: "서가 눈높이칸", relativePosition: { x: 0, y: 0 } },
        { id: "shelf_low", label: "서가 맨 아래칸", relativePosition: { x: 0, y: 15 } },
      ],
    },
    {
      id: "st_ladder", name: "나무 사다리", emoji: "🪜",
      description: "높은 선반의 책을 꺼내기 위한 레일 부착 나무 사다리. 바퀴로 옆으로 이동한다",
      position: { x: 70, y: 35 },
      slots: [
        { id: "ladder_top", label: "사다리 맨 위 단", relativePosition: { x: 0, y: -12 } },
        { id: "ladder_mid", label: "사다리 중간 단", relativePosition: { x: 0, y: 0 } },
        { id: "ladder_foot", label: "사다리 바닥 바퀴", relativePosition: { x: 0, y: 12 } },
      ],
    },
    {
      id: "st_class_tag", name: "분류 태그", emoji: "🏷️",
      description: "서가 끝마다 붙은 십진분류 태그. '800 문학', '500 자연과학' 등이 적혀 있다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "tag_100", label: "100번대 태그", relativePosition: { x: -12, y: 0 } },
        { id: "tag_500", label: "500번대 태그", relativePosition: { x: 0, y: 0 } },
        { id: "tag_900", label: "900번대 태그", relativePosition: { x: 12, y: 0 } },
      ],
    },
  ],

  stairs: [
    {
      id: "sta_marble_spiral", name: "대리석 나선 계단", emoji: "🌀",
      description: "흰 대리석으로 된 나선 계단. 가운데가 비어 위를 올려다보면 나선이 끝없이 이어진다",
      position: { x: 50, y: 45 },
      slots: [
        { id: "spiral_bottom", label: "계단 아래(1층)", relativePosition: { x: -10, y: 10 } },
        { id: "spiral_mid", label: "계단 중간(2층)", relativePosition: { x: 0, y: 0 } },
        { id: "spiral_top", label: "계단 꼭대기(3층)", relativePosition: { x: 10, y: -10 } },
      ],
    },
    {
      id: "sta_railing", name: "연철 난간 장식", emoji: "⚜️",
      description: "아르누보 양식의 연철 난간. 포도넝쿨과 잎사귀가 철로 구부려져 있다",
      position: { x: 25, y: 30 },
      slots: [
        { id: "railing_vine", label: "넝쿨 장식", relativePosition: { x: -5, y: -5 } },
        { id: "railing_leaf", label: "잎사귀 장식", relativePosition: { x: 8, y: 5 } },
      ],
    },
    {
      id: "sta_wall_clock", name: "벽면 시계", emoji: "🕰️",
      description: "계단 중간 벽에 걸린 원형 괘종시계. 로마 숫자 문자판에 추가 좌우로 흔들린다",
      position: { x: 75, y: 25 },
      slots: [
        { id: "clock_face", label: "시계 문자판", relativePosition: { x: 0, y: -5 } },
        { id: "clock_pendulum", label: "시계 추", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],

  rooftop: [
    {
      id: "rt_pergola", name: "옥상 퍼골라", emoji: "🏗️",
      description: "나무 격자로 된 퍼골라. 등나무가 감아 올라가 여름에 그늘을 드리운다",
      position: { x: 40, y: 30 },
      slots: [
        { id: "pergola_top", label: "퍼골라 격자 지붕", relativePosition: { x: 0, y: -10 } },
        { id: "pergola_vine", label: "등나무 넝쿨", relativePosition: { x: -8, y: 0 } },
        { id: "pergola_post", label: "퍼골라 기둥", relativePosition: { x: 8, y: 8 } },
      ],
    },
    {
      id: "rt_telescope", name: "세종대로 방향 전망 망원경", emoji: "🔭",
      description: "동전을 넣으면 작동하는 전망 망원경. 세종대로와 광화문을 바라본다",
      position: { x: 70, y: 40 },
      slots: [
        { id: "scope_lens", label: "망원경 렌즈", relativePosition: { x: 0, y: -5 } },
        { id: "scope_stand", label: "망원경 삼각대", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "rt_bench", name: "옥상 나무 벤치", emoji: "🪑",
      description: "도시 전망을 바라보며 쉴 수 있는 원목 벤치. 등받이에 도서관 엠블럼이 새겨져 있다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "bench_seat", label: "벤치 좌석", relativePosition: { x: 0, y: 0 } },
        { id: "bench_back", label: "벤치 등받이", relativePosition: { x: 0, y: -8 } },
        { id: "bench_armrest", label: "벤치 팔걸이", relativePosition: { x: 15, y: 0 } },
      ],
    },
  ],

  // ─── 5. 남산타워 (namsan) ───────────────────────────────

  cable: [
    {
      id: "cb_gondola", name: "빨간 곤돌라", emoji: "🚠",
      description: "선명한 빨간색 케이블카 캐빈. 8인승으로, 유리창 너머로 서울 전경이 보인다",
      position: { x: 50, y: 35 },
      slots: [
        { id: "gondola_window", label: "곤돌라 유리창", relativePosition: { x: 0, y: -5 } },
        { id: "gondola_inside", label: "곤돌라 내부", relativePosition: { x: 0, y: 5 } },
        { id: "gondola_handle", label: "곤돌라 손잡이", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "cb_cable", name: "강철 케이블", emoji: "🔗",
      description: "곤돌라를 매달고 있는 굵은 강철 와이어. 끊임없이 팽팽하게 당겨져 있다",
      position: { x: 50, y: 15 },
      slots: [
        { id: "cable_top", label: "케이블 상부(산쪽)", relativePosition: { x: 15, y: -5 } },
        { id: "cable_bottom", label: "케이블 하부(도심쪽)", relativePosition: { x: -15, y: 5 } },
      ],
    },
    {
      id: "cb_station", name: "산 아래 승강장", emoji: "🏢",
      description: "케이블카 탑승 대기 승강장. 철제 지붕 아래 줄을 서서 기다린다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "station_gate", label: "승강장 탑승구", relativePosition: { x: 0, y: -5 } },
        { id: "station_queue", label: "대기줄 시작점", relativePosition: { x: 0, y: 8 } },
        { id: "station_sign", label: "승강장 안내판", relativePosition: { x: -12, y: 0 } },
      ],
    },
  ],

  stairs_namsan: [
    {
      id: "stn_stone_steps", name: "돌계단 난간", emoji: "🪨",
      description: "자연석을 다듬어 깐 남산 등산 계단. 쇠파이프 난간이 양옆에 이어진다",
      position: { x: 40, y: 50 },
      slots: [
        { id: "steps_bottom", label: "계단 아래쪽", relativePosition: { x: -10, y: 10 } },
        { id: "steps_mid", label: "계단 중간", relativePosition: { x: 0, y: 0 } },
        { id: "steps_top", label: "계단 꼭대기", relativePosition: { x: 10, y: -10 } },
      ],
    },
    {
      id: "stn_pine_forest", name: "소나무 숲", emoji: "🌲",
      description: "계단 양옆으로 우거진 소나무 숲. 솔향이 가득하고 바닥에 솔잎이 깔려 있다",
      position: { x: 75, y: 35 },
      slots: [
        { id: "pine_trunk", label: "소나무 줄기", relativePosition: { x: 0, y: 0 } },
        { id: "pine_branch", label: "소나무 가지(솔잎)", relativePosition: { x: 5, y: -12 } },
        { id: "pine_needle", label: "바닥 솔잎 카펫", relativePosition: { x: -5, y: 12 } },
      ],
    },
    {
      id: "stn_marker_stone", name: "계단 번호 표지석", emoji: "🪧",
      description: "'237/480단' 같은 숫자가 새겨진 표지석. 현재 위치를 알려준다",
      position: { x: 25, y: 70 },
      slots: [
        { id: "marker_number", label: "표지석 숫자", relativePosition: { x: 0, y: -5 } },
        { id: "marker_base", label: "표지석 받침", relativePosition: { x: 0, y: 8 } },
      ],
    },
  ],

  palgakjeong: [
    {
      id: "plg_octagonal_roof", name: "팔각 지붕 꼭지", emoji: "🏯",
      description: "팔각정의 여덟 갈래 처마가 하늘을 향해 살짝 치켜 올라간 지붕 꼭대기",
      position: { x: 50, y: 15 },
      slots: [
        { id: "roof_apex_plg", label: "꼭지(절병통)", relativePosition: { x: 0, y: -8 } },
        { id: "roof_eave_plg", label: "처마 끝", relativePosition: { x: 12, y: 5 } },
      ],
    },
    {
      id: "plg_dancheong_beam", name: "단청 서까래", emoji: "🎨",
      description: "녹색과 적색으로 칠한 서까래. 연화문 무늬가 반복되며 처마를 받치고 있다",
      position: { x: 35, y: 35 },
      slots: [
        { id: "beam_dancheong_1", label: "첫째 서까래 단청", relativePosition: { x: -10, y: 0 } },
        { id: "beam_dancheong_2", label: "중간 서까래 단청", relativePosition: { x: 0, y: 0 } },
        { id: "beam_dancheong_3", label: "마지막 서까래 단청", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "plg_stone_railing", name: "돌 난간", emoji: "🪨",
      description: "팔각정을 두르는 화강암 난간. 각 면에 구름 무늬가 부조로 새겨져 있다",
      position: { x: 65, y: 60 },
      slots: [
        { id: "railing_front", label: "정면 난간", relativePosition: { x: 0, y: -5 } },
        { id: "railing_side", label: "측면 난간", relativePosition: { x: 12, y: 5 } },
        { id: "railing_corner", label: "모서리 난간 기둥", relativePosition: { x: -8, y: 8 } },
      ],
    },
  ],

  locks: [
    {
      id: "lk_fence", name: "알록달록 자물쇠 울타리", emoji: "🔐",
      description: "수천 개의 자물쇠가 빼곡히 채워진 철조망 울타리. 모든 색상이 뒤섞여 있다",
      position: { x: 50, y: 40 },
      slots: [
        { id: "fence_left", label: "울타리 왼쪽 구역", relativePosition: { x: -18, y: 0 } },
        { id: "fence_center", label: "울타리 중앙 구역", relativePosition: { x: 0, y: 0 } },
        { id: "fence_right", label: "울타리 오른쪽 구역", relativePosition: { x: 18, y: 0 } },
      ],
    },
    {
      id: "lk_heart_lock", name: "하트 모양 자물쇠", emoji: "❤️",
      description: "커플 이름이 새겨진 분홍 하트 자물쇠. 다른 자물쇠들 사이에서 유독 눈에 띈다",
      position: { x: 30, y: 65 },
      slots: [
        { id: "heart_front", label: "하트 자물쇠 앞면(이름)", relativePosition: { x: 0, y: -5 } },
        { id: "heart_back", label: "하트 자물쇠 뒷면(날짜)", relativePosition: { x: 0, y: 5 } },
      ],
    },
    {
      id: "lk_key_box", name: "열쇠 투하함", emoji: "📮",
      description: "자물쇠를 잠근 뒤 열쇠를 버리는 철제 함. '영원한 사랑'이 적혀 있다",
      position: { x: 70, y: 65 },
      slots: [
        { id: "box_slot", label: "투하구", relativePosition: { x: 0, y: -8 } },
        { id: "box_body", label: "투하함 몸통", relativePosition: { x: 0, y: 5 } },
        { id: "box_label", label: "투하함 문구", relativePosition: { x: 0, y: 12 } },
      ],
    },
  ],

  observatory: [
    {
      id: "obs_glass_wall", name: "360도 유리 전망창", emoji: "🪟",
      description: "전망대 전면을 두른 통유리. 서울의 사방이 한눈에 내려다보인다",
      position: { x: 50, y: 30 },
      slots: [
        { id: "glass_north", label: "북쪽 전망(북한산)", relativePosition: { x: 0, y: -10 } },
        { id: "glass_south", label: "남쪽 전망(한강)", relativePosition: { x: 0, y: 10 } },
        { id: "glass_east", label: "동쪽 전망(동대문)", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "obs_digital_screen", name: "디지털 도시 안내 스크린", emoji: "📱",
      description: "터치스크린 키오스크. 건물 위로 손가락을 올리면 이름과 정보가 뜬다",
      position: { x: 25, y: 55 },
      slots: [
        { id: "screen_map", label: "지도 화면", relativePosition: { x: 0, y: -5 } },
        { id: "screen_info", label: "정보 패널", relativePosition: { x: 0, y: 8 } },
      ],
    },
    {
      id: "obs_restaurant_table", name: "회전 레스토랑 테이블", emoji: "🍽️",
      description: "천천히 회전하는 레스토랑의 창가 테이블. 식사하며 야경이 돌아간다",
      position: { x: 75, y: 65 },
      slots: [
        { id: "table_plate", label: "접시 위", relativePosition: { x: 0, y: -5 } },
        { id: "table_glass", label: "와인잔 옆", relativePosition: { x: 10, y: 0 } },
        { id: "table_view", label: "창밖 야경", relativePosition: { x: -10, y: -8 } },
      ],
    },
  ],

  // ─── 6. 광화문광장 (gwanghwamun_plaza) ──────────────────

  sejong: [
    {
      id: "sj_statue", name: "세종대왕 좌상", emoji: "🪑",
      description: "금빛 용포를 입고 의자에 앉은 세종대왕 동상. 오른손에 책을 들고 있다",
      position: { x: 50, y: 35 },
      slots: [
        { id: "sejong_book", label: "세종 손의 책", relativePosition: { x: 10, y: -5 } },
        { id: "sejong_face", label: "세종 얼굴", relativePosition: { x: 0, y: -18 } },
        { id: "sejong_robe", label: "금빛 용포", relativePosition: { x: -5, y: 5 } },
      ],
    },
    {
      id: "sj_hunminjeongeum", name: "훈민정음 해례본 모형", emoji: "📜",
      description: "세종대왕상 앞에 펼쳐진 거대한 훈민정음 해례본 석조 모형",
      position: { x: 50, y: 65 },
      slots: [
        { id: "haerye_title", label: "해례본 제목란", relativePosition: { x: 0, y: -8 } },
        { id: "haerye_body", label: "해례본 본문", relativePosition: { x: 0, y: 5 } },
        { id: "haerye_seal", label: "해례본 어보 자리", relativePosition: { x: 12, y: -3 } },
      ],
    },
    {
      id: "sj_yongpo", name: "금빛 용포 자락", emoji: "✨",
      description: "세종의 어깨에서 흘러내리는 금실 용포. 다섯 발톱 용이 수놓아져 있다",
      position: { x: 25, y: 45 },
      slots: [
        { id: "dragon_embroid", label: "용 자수", relativePosition: { x: -5, y: -5 } },
        { id: "robe_fold", label: "용포 주름", relativePosition: { x: 5, y: 5 } },
      ],
    },
  ],

  yi_sun_sin: [
    {
      id: "yss_statue", name: "장검을 든 이순신 동상", emoji: "⚔️",
      description: "갑옷을 입고 장검을 앞으로 내리 세운 이순신 장군 동상. 12m 높이의 위엄",
      position: { x: 50, y: 30 },
      slots: [
        { id: "yss_sword", label: "장검 칼끝", relativePosition: { x: 0, y: 15 } },
        { id: "yss_armor", label: "갑옷 가슴판", relativePosition: { x: 0, y: -5 } },
        { id: "yss_face", label: "장군 얼굴", relativePosition: { x: 0, y: -18 } },
      ],
    },
    {
      id: "yss_turtle_ship", name: "거북선 모형", emoji: "🐢",
      description: "동상 앞 바닥에 설치된 거북선 축소 모형. 용머리와 철갑 등판이 보인다",
      position: { x: 30, y: 65 },
      slots: [
        { id: "turtle_head", label: "거북선 용머리", relativePosition: { x: -10, y: -5 } },
        { id: "turtle_deck", label: "거북선 갑판", relativePosition: { x: 0, y: 0 } },
        { id: "turtle_cannon", label: "거북선 포구", relativePosition: { x: 10, y: 5 } },
      ],
    },
    {
      id: "yss_diary_stone", name: "난중일기 비석", emoji: "📖",
      description: "난중일기 구절이 새겨진 화강암 비석. '필사즉생 필생즉사'가 음각되어 있다",
      position: { x: 70, y: 60 },
      slots: [
        { id: "diary_quote", label: "비석 명문", relativePosition: { x: 0, y: -5 } },
        { id: "diary_base", label: "비석 받침돌", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],

  fountain: [
    {
      id: "ft_water", name: "12.23 분수", emoji: "⛲",
      description: "매 시각 12분과 23분에 물줄기가 솟는 분수. 12척과 23전을 상징한다",
      position: { x: 50, y: 40 },
      slots: [
        { id: "fountain_jet_12", label: "12줄기 분수(좌)", relativePosition: { x: -12, y: -10 } },
        { id: "fountain_jet_23", label: "23줄기 분수(우)", relativePosition: { x: 12, y: -10 } },
        { id: "fountain_pool", label: "분수 수반", relativePosition: { x: 0, y: 8 } },
      ],
    },
    {
      id: "ft_led_floor", name: "바닥 LED 조명", emoji: "💡",
      description: "분수 바닥에 매립된 LED 조명. 밤에 물줄기를 무지갯빛으로 비춘다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "led_blue", label: "파란 LED 영역", relativePosition: { x: -10, y: 0 } },
        { id: "led_red", label: "빨간 LED 영역", relativePosition: { x: 0, y: 0 } },
        { id: "led_green", label: "초록 LED 영역", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],

  haechi: [
    {
      id: "hc_pair", name: "해치 석상 한 쌍", emoji: "🦁",
      description: "광화문광장을 지키는 해치 석상 한 쌍. 둥근 눈과 넓적한 코가 친근하다",
      position: { x: 50, y: 40 },
      slots: [
        { id: "haechi_left", label: "왼쪽 해치", relativePosition: { x: -15, y: 0 } },
        { id: "haechi_right", label: "오른쪽 해치", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "hc_horn", name: "불의 뿔", emoji: "🦄",
      description: "해치 이마 위의 외뿔. 불의를 저지르면 이 뿔로 들이받는다고 전해진다",
      position: { x: 35, y: 25 },
      slots: [
        { id: "horn_tip", label: "뿔 끝", relativePosition: { x: 0, y: -10 } },
        { id: "horn_base", label: "뿔 뿌리", relativePosition: { x: 0, y: 5 } },
      ],
    },
    {
      id: "hc_scales", name: "비늘 무늬", emoji: "🐉",
      description: "해치 몸통을 덮은 비늘 무늬. 물고기도 아니고 짐승도 아닌 신수의 비늘이다",
      position: { x: 65, y: 60 },
      slots: [
        { id: "scale_chest", label: "가슴팍 비늘", relativePosition: { x: 0, y: -5 } },
        { id: "scale_back", label: "등 비늘", relativePosition: { x: 5, y: 5 } },
        { id: "scale_tail", label: "꼬리 비늘", relativePosition: { x: 10, y: 10 } },
      ],
    },
  ],

  yukjo: [
    {
      id: "yj_stone_road", name: "청계천 방향 돌판도로", emoji: "🛤️",
      description: "육조거리의 넓적한 돌판 도로. 조선 관청가의 주요 통행로였다",
      position: { x: 50, y: 55 },
      slots: [
        { id: "road_start", label: "도로 시작(광화문 쪽)", relativePosition: { x: -15, y: 0 } },
        { id: "road_mid", label: "도로 중간", relativePosition: { x: 0, y: 0 } },
        { id: "road_end", label: "도로 끝(청계천 쪽)", relativePosition: { x: 15, y: 0 } },
      ],
    },
    {
      id: "yj_gov_pillar", name: "정부서울청사 기둥", emoji: "🏛️",
      description: "정부서울청사 정면의 거대한 콘크리트 기둥. 현대 권위의 상징이다",
      position: { x: 25, y: 30 },
      slots: [
        { id: "gov_pillar_1", label: "첫째 기둥", relativePosition: { x: -8, y: 0 } },
        { id: "gov_pillar_2", label: "둘째 기둥", relativePosition: { x: 8, y: 0 } },
      ],
    },
    {
      id: "yj_history_panel", name: "역사 안내판", emoji: "🪧",
      description: "육조거리의 역사를 설명하는 야외 안내판. 조선 6조의 위치가 표시되어 있다",
      position: { x: 75, y: 40 },
      slots: [
        { id: "panel_title", label: "안내판 제목", relativePosition: { x: 0, y: -10 } },
        { id: "panel_map", label: "안내판 지도", relativePosition: { x: 0, y: 0 } },
        { id: "panel_text", label: "안내판 설명문", relativePosition: { x: 0, y: 10 } },
      ],
    },
  ],

  // ─── 7. 창덕궁 후원 (changdeokgung) ────────────────────

  buyongjeong: [
    {
      id: "byj_square_pond", name: "네모난 연못과 원형 섬", emoji: "💧",
      description: "하늘은 둥글고(원형 섬) 땅은 네모(사각 연못)라는 천원지방 사상을 담은 부용지",
      position: { x: 50, y: 55 },
      slots: [
        { id: "pond_island", label: "원형 섬", relativePosition: { x: 0, y: 0 } },
        { id: "pond_corner_ne", label: "연못 북동 모서리", relativePosition: { x: 15, y: -10 } },
        { id: "pond_corner_sw", label: "연못 남서 모서리", relativePosition: { x: -15, y: 10 } },
      ],
    },
    {
      id: "byj_cross_pavilion", name: "십자형 정자(부용정)", emoji: "🏯",
      description: "연못 위에 두 기둥만 물에 담근 채 걸쳐진 십자형 정자. 한쪽이 물 위로 나와 있다",
      position: { x: 30, y: 30 },
      slots: [
        { id: "pavilion_floor", label: "정자 마루", relativePosition: { x: 0, y: 0 } },
        { id: "pavilion_water_pillar", label: "물속 기둥", relativePosition: { x: -5, y: 10 } },
        { id: "pavilion_eave", label: "정자 처마", relativePosition: { x: 5, y: -10 } },
      ],
    },
    {
      id: "byj_eosumun", name: "어수문", emoji: "🚪",
      description: "'물고기가 변해 용이 되는 문'이란 뜻의 어수문. 과거 급제자가 이 문으로 나왔다",
      position: { x: 70, y: 25 },
      slots: [
        { id: "eosumun_arch", label: "어수문 아치", relativePosition: { x: 0, y: -5 } },
        { id: "eosumun_door", label: "어수문 문짝", relativePosition: { x: 0, y: 5 } },
      ],
    },
  ],

  yeongyeongdang: [
    {
      id: "yyd_house", name: "사대부 생활 가옥", emoji: "🏘️",
      description: "왕이 사대부 생활을 체험하기 위해 지은 99칸 저택. 소박한 기와지붕이 인상적이다",
      position: { x: 40, y: 30 },
      slots: [
        { id: "house_gate", label: "대문", relativePosition: { x: -12, y: 5 } },
        { id: "house_room", label: "사랑채", relativePosition: { x: 5, y: 0 } },
        { id: "house_roof", label: "기와지붕", relativePosition: { x: 0, y: -12 } },
      ],
    },
    {
      id: "yyd_byeoru", name: "마루 위 벼루", emoji: "🖌️",
      description: "연경당 사랑채 마루 위에 놓인 왕의 사용 벼루. 먹물 자국이 세월을 말한다",
      position: { x: 65, y: 45 },
      slots: [
        { id: "byeoru_surface", label: "벼루 먹가는 면", relativePosition: { x: 0, y: -5 } },
        { id: "byeoru_pool", label: "벼루 먹물 웅덩이", relativePosition: { x: 0, y: 8 } },
      ],
    },
    {
      id: "yyd_suban", name: "뜰의 석조 수반", emoji: "🫧",
      description: "빗물을 받아 손을 씻던 돌 수반. 거북 모양 받침 위에 넓적한 돌 대야가 얹혀 있다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "suban_water", label: "수반 물 위", relativePosition: { x: 0, y: -5 } },
        { id: "suban_turtle", label: "거북 받침", relativePosition: { x: 0, y: 8 } },
        { id: "suban_rim", label: "수반 테두리", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],

  ongnyucheon: [
    {
      id: "ony_royal_script", name: "바위에 새긴 인조 어필", emoji: "📝",
      description: "계곡 바위에 인조 임금이 직접 새긴 글씨 '玉流川'. 이끼 사이로 글자가 보인다",
      position: { x: 40, y: 35 },
      slots: [
        { id: "script_ok", label: "옥(玉) 자", relativePosition: { x: -8, y: 0 } },
        { id: "script_ryu", label: "류(流) 자", relativePosition: { x: 0, y: 0 } },
        { id: "script_cheon", label: "천(川) 자", relativePosition: { x: 8, y: 0 } },
      ],
    },
    {
      id: "ony_waterfall", name: "작은 폭포", emoji: "🌊",
      description: "바위 틈을 타고 흘러내리는 옥류천의 작은 폭포. 맑은 물소리가 골짜기에 울린다",
      position: { x: 65, y: 50 },
      slots: [
        { id: "fall_top", label: "폭포 꼭대기", relativePosition: { x: 0, y: -12 } },
        { id: "fall_stream", label: "물줄기", relativePosition: { x: 0, y: 0 } },
        { id: "fall_pool", label: "폭포 아래 소(沼)", relativePosition: { x: 0, y: 12 } },
      ],
    },
    {
      id: "ony_moss_rock", name: "이끼 낀 돌", emoji: "🪨",
      description: "초록 이끼가 두텁게 덮인 계곡 바위. 습기를 머금어 비단처럼 미끈하다",
      position: { x: 30, y: 70 },
      slots: [
        { id: "moss_top", label: "이끼 윗면", relativePosition: { x: 0, y: -5 } },
        { id: "moss_side", label: "바위 측면", relativePosition: { x: 10, y: 5 } },
      ],
    },
  ],

  jondeokjeong: [
    {
      id: "jdj_double_roof", name: "부채꼴 이중지붕", emoji: "🏯",
      description: "존덕정의 독특한 부채꼴 이중 겹처마. 아래층과 위층 지붕이 겹쳐 있다",
      position: { x: 50, y: 20 },
      slots: [
        { id: "roof_upper", label: "상층 지붕", relativePosition: { x: 0, y: -10 } },
        { id: "roof_lower", label: "하층 지붕", relativePosition: { x: 0, y: 5 } },
        { id: "roof_gap", label: "지붕 사이 공간", relativePosition: { x: 10, y: -3 } },
      ],
    },
    {
      id: "jdj_reflection", name: "연못 위 반영", emoji: "🪞",
      description: "잔잔한 연못 수면에 비친 존덕정의 거꾸로 된 모습. 바람이 불면 흔들린다",
      position: { x: 50, y: 65 },
      slots: [
        { id: "reflect_pavilion", label: "반영 속 정자", relativePosition: { x: 0, y: 0 } },
        { id: "reflect_sky", label: "반영 속 하늘", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "jdj_stone_rail", name: "돌난간", emoji: "🪨",
      description: "존덕정을 두르는 팔각 돌난간. 네모꼴 돌기둥마다 연꽃이 조각되어 있다",
      position: { x: 75, y: 45 },
      slots: [
        { id: "rail_lotus_1", label: "첫째 연꽃 기둥", relativePosition: { x: -10, y: 0 } },
        { id: "rail_lotus_2", label: "둘째 연꽃 기둥", relativePosition: { x: 0, y: 0 } },
        { id: "rail_lotus_3", label: "셋째 연꽃 기둥", relativePosition: { x: 10, y: 0 } },
      ],
    },
  ],

  gwallamjeong: [
    {
      id: "glj_fan_pavilion", name: "부채꼴 정자", emoji: "🏯",
      description: "반달처럼 휜 부채꼴 평면의 정자. 펼친 부채 모양으로 독특한 형태다",
      position: { x: 45, y: 30 },
      slots: [
        { id: "fan_wide", label: "부채 넓은 쪽", relativePosition: { x: -10, y: 0 } },
        { id: "fan_tip", label: "부채 좁은 쪽(손잡이)", relativePosition: { x: 10, y: 5 } },
        { id: "fan_center", label: "부채 중심", relativePosition: { x: 0, y: 0 } },
      ],
    },
    {
      id: "glj_half_moon_pond", name: "반달형 연못", emoji: "🌙",
      description: "관람정 앞의 반달 모양 연못. 초승달처럼 휜 수면에 하늘이 비친다",
      position: { x: 50, y: 60 },
      slots: [
        { id: "halfmoon_crescent", label: "반달 안쪽(볼록면)", relativePosition: { x: -8, y: 0 } },
        { id: "halfmoon_tip", label: "반달 끝(뾰족면)", relativePosition: { x: 12, y: 0 } },
      ],
    },
    {
      id: "glj_maple", name: "주변 단풍나무", emoji: "🍁",
      description: "관람정을 둘러싼 단풍나무 숲. 가을이면 붉고 노란 잎이 연못 위에 떨어진다",
      position: { x: 75, y: 45 },
      slots: [
        { id: "maple_red", label: "붉은 단풍 가지", relativePosition: { x: -5, y: -10 } },
        { id: "maple_gold", label: "노란 단풍 가지", relativePosition: { x: 5, y: -5 } },
        { id: "maple_fallen", label: "떨어진 낙엽", relativePosition: { x: 0, y: 12 } },
      ],
    },
  ],

  // ─── 8. 제주 돌하르방공원 (jeju) ────────────────────────

  entrance_jeju: [
    {
      id: "ej_dolhareubang", name: "3m 높이 돌하르방(왕눈이 코)", emoji: "🗿",
      description: "커다란 둥근 눈과 뭉툭한 코의 3m 현무암 돌하르방. 두 손을 배 위에 모으고 있다",
      position: { x: 50, y: 40 },
      slots: [
        { id: "dol_eyes", label: "돌하르방 왕눈이", relativePosition: { x: 0, y: -15 } },
        { id: "dol_nose", label: "돌하르방 코", relativePosition: { x: 0, y: -8 } },
        { id: "dol_hands", label: "돌하르방 모은 손", relativePosition: { x: 0, y: 5 } },
        { id: "dol_hat", label: "돌하르방 벙거지(모자)", relativePosition: { x: 0, y: -22 } },
      ],
    },
    {
      id: "ej_basalt_gate", name: "현무암 관문", emoji: "🪨",
      description: "검은 현무암을 쌓아 만든 입구 관문. 제주 돌의 거친 기공이 그대로 살아있다",
      position: { x: 50, y: 75 },
      slots: [
        { id: "gate_left", label: "관문 왼쪽 기둥", relativePosition: { x: -12, y: 0 } },
        { id: "gate_arch", label: "관문 아치", relativePosition: { x: 0, y: -8 } },
        { id: "gate_right", label: "관문 오른쪽 기둥", relativePosition: { x: 12, y: 0 } },
      ],
    },
  ],

  stone_path: [
    {
      id: "sp_doldam", name: "검은 현무암 돌담", emoji: "🪨",
      description: "시멘트 없이 현무암만 맞물려 쌓은 제주 돌담. 바람이 통하도록 틈이 있다",
      position: { x: 20, y: 40 },
      slots: [
        { id: "doldam_left", label: "돌담 왼쪽 구간", relativePosition: { x: -10, y: 0 } },
        { id: "doldam_gap", label: "돌담 틈새(바람길)", relativePosition: { x: 0, y: 0 } },
        { id: "doldam_right", label: "돌담 오른쪽 구간", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "sp_canola", name: "유채꽃", emoji: "🌼",
      description: "돌담 옆에 노랗게 핀 유채꽃밭. 봄이면 온 들판이 금빛으로 물든다",
      position: { x: 55, y: 55 },
      slots: [
        { id: "canola_left", label: "유채꽃밭 왼쪽", relativePosition: { x: -10, y: 0 } },
        { id: "canola_center", label: "유채꽃밭 한가운데", relativePosition: { x: 0, y: 0 } },
        { id: "canola_right", label: "유채꽃밭 오른쪽", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "sp_silvergrass", name: "바람에 흔들리는 억새", emoji: "🌾",
      description: "제주 바람에 한쪽으로 누운 은빛 억새밭. 가을 석양에 금빛으로 빛난다",
      position: { x: 80, y: 30 },
      slots: [
        { id: "grass_wave", label: "억새 물결", relativePosition: { x: 0, y: -5 } },
        { id: "grass_root", label: "억새 뿌리", relativePosition: { x: 0, y: 8 } },
      ],
    },
  ],

  tangerine: [
    {
      id: "tg_fruit", name: "주황 감귤", emoji: "🍊",
      description: "탐스럽게 익은 주황 감귤. 껍질에서 상큼한 향이 퍼진다",
      position: { x: 40, y: 30 },
      slots: [
        { id: "tangerine_top", label: "감귤 꼭지(잎 달린)", relativePosition: { x: 0, y: -8 } },
        { id: "tangerine_body", label: "감귤 몸통", relativePosition: { x: 0, y: 0 } },
        { id: "tangerine_slice", label: "감귤 단면(쪽)", relativePosition: { x: 10, y: 5 } },
      ],
    },
    {
      id: "tg_basket", name: "감귤 채집 바구니", emoji: "🧺",
      description: "대나무로 엮은 둥근 채집 바구니. 갓 딴 감귤이 수북이 담겨 있다",
      position: { x: 65, y: 50 },
      slots: [
        { id: "basket_inside", label: "바구니 안 감귤 더미", relativePosition: { x: 0, y: 0 } },
        { id: "basket_handle", label: "바구니 손잡이", relativePosition: { x: 0, y: -12 } },
        { id: "basket_bottom", label: "바구니 바닥", relativePosition: { x: 0, y: 10 } },
      ],
    },
    {
      id: "tg_windbreak", name: "방풍림 삼나무", emoji: "🌲",
      description: "감귤밭을 둘러싼 삼나무 방풍림. 제주 바람을 막아주는 초록 장벽이다",
      position: { x: 15, y: 60 },
      slots: [
        { id: "cedar_row", label: "삼나무 줄(나무벽)", relativePosition: { x: 0, y: 0 } },
        { id: "cedar_gap", label: "삼나무 사이 틈", relativePosition: { x: 8, y: 5 } },
      ],
    },
  ],

  viewpoint: [
    {
      id: "vp_hallasan", name: "한라산 실루엣", emoji: "🏔️",
      description: "멀리 보이는 한라산의 완만한 실루엣. 구름이 허리를 감아 돌고 있다",
      position: { x: 50, y: 20 },
      slots: [
        { id: "halla_peak", label: "한라산 백록담", relativePosition: { x: 0, y: -10 } },
        { id: "halla_cloud", label: "허리 구름", relativePosition: { x: 10, y: 0 } },
        { id: "halla_slope", label: "한라산 능선", relativePosition: { x: -10, y: 5 } },
      ],
    },
    {
      id: "vp_skywalk", name: "구름다리 전망대", emoji: "🌁",
      description: "절벽 끝에서 허공으로 뻗은 유리 바닥 전망대. 발 아래로 바다가 보인다",
      position: { x: 50, y: 55 },
      slots: [
        { id: "skywalk_glass", label: "유리 바닥", relativePosition: { x: 0, y: 0 } },
        { id: "skywalk_rail", label: "전망대 난간", relativePosition: { x: 12, y: -5 } },
        { id: "skywalk_end", label: "전망대 끝(허공)", relativePosition: { x: -10, y: 5 } },
      ],
    },
    {
      id: "vp_oreum_sign", name: "오름 안내판", emoji: "🪧",
      description: "주변 오름의 이름과 높이가 적힌 안내판. 화살표로 방향을 가리킨다",
      position: { x: 75, y: 70 },
      slots: [
        { id: "sign_title", label: "안내판 제목", relativePosition: { x: 0, y: -8 } },
        { id: "sign_arrow", label: "방향 화살표", relativePosition: { x: 0, y: 5 } },
      ],
    },
  ],

  coast: [
    {
      id: "co_jusangjeolli", name: "주상절리 현무암 절벽", emoji: "🪨",
      description: "육각기둥 모양으로 갈라진 현무암 절벽. 용암이 식으며 만든 자연의 기하학이다",
      position: { x: 35, y: 35 },
      slots: [
        { id: "basalt_top", label: "절벽 꼭대기", relativePosition: { x: 0, y: -12 } },
        { id: "basalt_column", label: "육각 기둥면", relativePosition: { x: 0, y: 0 } },
        { id: "basalt_base", label: "절벽 아래(파도 닿는 곳)", relativePosition: { x: 0, y: 12 } },
      ],
    },
    {
      id: "co_waves", name: "하얀 파도", emoji: "🌊",
      description: "현무암 절벽에 부딪혀 하얗게 부서지는 파도. 소금기 섞인 물보라가 튄다",
      position: { x: 65, y: 60 },
      slots: [
        { id: "wave_crest", label: "파도 꼭대기(흰 포말)", relativePosition: { x: 0, y: -8 } },
        { id: "wave_body", label: "파도 몸통", relativePosition: { x: 0, y: 0 } },
        { id: "wave_spray", label: "물보라", relativePosition: { x: 10, y: -5 } },
      ],
    },
    {
      id: "co_haenyeo", name: "해녀 물질 도구", emoji: "🤿",
      description: "해녀의 물질 도구 세트. 테왁(부력 도구), 빗창(해산물 채취 칼), 망사리(그물 주머니)",
      position: { x: 50, y: 80 },
      slots: [
        { id: "tewak", label: "테왁(부력 박)", relativePosition: { x: -10, y: -5 } },
        { id: "bitchang", label: "빗창(채취 칼)", relativePosition: { x: 0, y: 0 } },
        { id: "mangsari", label: "망사리(그물 주머니)", relativePosition: { x: 10, y: 5 } },
      ],
    },
  ],

  // ─── 9. 불국사 (bulguksa) ───────────────────────────────

  cheongungyo: [
    {
      id: "cug_33steps", name: "33계단(33천)", emoji: "🪜",
      description: "33천을 상징하는 33개의 돌계단. 위 17단이 청운교, 아래 16단이 백운교다",
      position: { x: 50, y: 45 },
      slots: [
        { id: "steps_cheong", label: "청운교(위 17단)", relativePosition: { x: 5, y: -12 } },
        { id: "steps_baek", label: "백운교(아래 16단)", relativePosition: { x: -5, y: 8 } },
        { id: "steps_landing", label: "계단 중간 쉼터", relativePosition: { x: 0, y: 0 } },
      ],
    },
    {
      id: "cug_railing", name: "연화·보상화 난간", emoji: "🪷",
      description: "계단 양옆의 돌난간. 연꽃과 보상화(상상의 꽃) 무늬가 번갈아 새겨져 있다",
      position: { x: 25, y: 30 },
      slots: [
        { id: "rail_lotus_cug", label: "연화 문양", relativePosition: { x: -8, y: 0 } },
        { id: "rail_bosang", label: "보상화 문양", relativePosition: { x: 8, y: 0 } },
      ],
    },
    {
      id: "cug_gate_top", name: "자하문(계단 위 문)", emoji: "🚪",
      description: "청운교를 올라서면 만나는 자하문. 부처의 세계로 들어가는 관문이다",
      position: { x: 75, y: 20 },
      slots: [
        { id: "gate_signboard", label: "자하문 현판", relativePosition: { x: 0, y: -10 } },
        { id: "gate_threshold", label: "자하문 문턱", relativePosition: { x: 0, y: 5 } },
      ],
    },
  ],

  dabotap: [
    {
      id: "dbt_layers", name: "사각/팔각/원형 겹층", emoji: "🗼",
      description: "사각→팔각→원형으로 변하는 복잡한 층. 석가모니의 다보여래 설법을 형상화했다",
      position: { x: 50, y: 35 },
      slots: [
        { id: "layer_square", label: "사각 기단", relativePosition: { x: 0, y: 10 } },
        { id: "layer_octagon", label: "팔각 중층", relativePosition: { x: 0, y: 0 } },
        { id: "layer_circle", label: "원형 상층", relativePosition: { x: 0, y: -10 } },
      ],
    },
    {
      id: "dbt_lion", name: "돌사자", emoji: "🦁",
      description: "다보탑 기단 모서리의 돌사자(현재 1마리만 남음). 영국에 반출된 3마리가 그립다",
      position: { x: 25, y: 60 },
      slots: [
        { id: "lion_face", label: "사자 얼굴", relativePosition: { x: 0, y: -8 } },
        { id: "lion_body", label: "사자 몸통", relativePosition: { x: 0, y: 5 } },
      ],
    },
    {
      id: "dbt_lotus_granite", name: "화강암 연꽃 장식", emoji: "🪷",
      description: "다보탑 각 층을 받치는 연꽃 모양 화강암 장식. 꽃잎이 위로 펼쳐져 있다",
      position: { x: 75, y: 50 },
      slots: [
        { id: "granite_petal", label: "연꽃 꽃잎", relativePosition: { x: -5, y: -5 } },
        { id: "granite_center", label: "연꽃 중심", relativePosition: { x: 5, y: 0 } },
        { id: "granite_base_dbt", label: "연꽃 받침대", relativePosition: { x: 0, y: 8 } },
      ],
    },
  ],

  seokgatap: [
    {
      id: "sgt_three_story", name: "단아한 3층 석탑", emoji: "🗼",
      description: "군더더기 없이 단아한 3층 석탑. 석가모니의 깨달음을 상징한다",
      position: { x: 50, y: 40 },
      slots: [
        { id: "story_1", label: "1층 탑신", relativePosition: { x: 0, y: 8 } },
        { id: "story_2", label: "2층 탑신", relativePosition: { x: 0, y: 0 } },
        { id: "story_3", label: "3층 탑신", relativePosition: { x: 0, y: -8 } },
        { id: "story_top", label: "상륜부", relativePosition: { x: 0, y: -16 } },
      ],
    },
    {
      id: "sgt_shadow_legend", name: "무영탑 전설의 그림자 자리", emoji: "🌑",
      description: "석가탑은 '그림자가 비치지 않는 탑'이라 불린다. 아사녀의 전설이 깃든 자리",
      position: { x: 30, y: 70 },
      slots: [
        { id: "shadow_spot", label: "그림자 없는 땅", relativePosition: { x: 0, y: 0 } },
        { id: "shadow_pool", label: "아사녀 연못 자리", relativePosition: { x: 10, y: 5 } },
      ],
    },
    {
      id: "sgt_base_stone", name: "기단석(이중 기단)", emoji: "🪨",
      description: "석가탑을 받치는 이중 기단. 아래 기단이 넓고, 위 기단이 좁아 안정감을 준다",
      position: { x: 70, y: 65 },
      slots: [
        { id: "base_upper", label: "상층 기단", relativePosition: { x: 0, y: -5 } },
        { id: "base_lower", label: "하층 기단", relativePosition: { x: 0, y: 5 } },
      ],
    },
  ],

  daeungjeon: [
    {
      id: "duj_trinity", name: "석가모니불 삼존상", emoji: "🧘",
      description: "중앙의 석가모니불, 좌측 문수보살, 우측 보현보살 삼존 불상",
      position: { x: 50, y: 30 },
      slots: [
        { id: "buddha_center", label: "석가모니불", relativePosition: { x: 0, y: 0 } },
        { id: "buddha_left", label: "문수보살(좌)", relativePosition: { x: -15, y: 5 } },
        { id: "buddha_right", label: "보현보살(우)", relativePosition: { x: 15, y: 5 } },
      ],
    },
    {
      id: "duj_canopy", name: "닫집(천개)", emoji: "🪶",
      description: "불상 위의 나무 닫집. 용, 봉황, 연꽃이 조각된 화려한 보개(덮개)다",
      position: { x: 50, y: 10 },
      slots: [
        { id: "canopy_dragon", label: "닫집 용 조각", relativePosition: { x: -10, y: 0 } },
        { id: "canopy_phoenix", label: "닫집 봉황 조각", relativePosition: { x: 10, y: 0 } },
        { id: "canopy_lotus_duj", label: "닫집 연꽃 조각", relativePosition: { x: 0, y: 5 } },
      ],
    },
    {
      id: "duj_gwangbae", name: "금빛 광배", emoji: "✨",
      description: "불상 뒤의 금빛 원형 광배. 부처의 깨달음의 빛을 상징하는 원광이다",
      position: { x: 50, y: 55 },
      slots: [
        { id: "gwangbae_halo", label: "두광(머리 빛)", relativePosition: { x: 0, y: -10 } },
        { id: "gwangbae_body_light", label: "신광(몸 빛)", relativePosition: { x: 0, y: 0 } },
        { id: "gwangbae_flame", label: "화염 무늬 테두리", relativePosition: { x: 12, y: 5 } },
      ],
    },
  ],

  geungnakjeon: [
    {
      id: "gnk_amitabha", name: "아미타불상", emoji: "🧘",
      description: "극락전의 아미타불. 서방 극락세계의 주불로, 자비로운 미소를 띠고 있다",
      position: { x: 50, y: 35 },
      slots: [
        { id: "amita_face", label: "아미타불 얼굴", relativePosition: { x: 0, y: -12 } },
        { id: "amita_mudra", label: "아미타불 수인(손 모양)", relativePosition: { x: 8, y: 0 } },
        { id: "amita_robe", label: "아미타불 법의", relativePosition: { x: -5, y: 5 } },
      ],
    },
    {
      id: "gnk_lotus_pedestal", name: "연화대좌", emoji: "🪷",
      description: "아미타불을 받치는 연꽃 모양 대좌. 겹겹이 핀 연꽃잎이 위를 향해 펼쳐져 있다",
      position: { x: 50, y: 60 },
      slots: [
        { id: "pedestal_petal_up", label: "위로 향한 연잎(앙련)", relativePosition: { x: -5, y: -5 } },
        { id: "pedestal_petal_down", label: "아래로 향한 연잎(복련)", relativePosition: { x: 5, y: 5 } },
      ],
    },
    {
      id: "gnk_mural", name: "극락 정토 벽화", emoji: "🖼️",
      description: "극락전 벽면의 극락세계 벽화. 칠보 연못, 보배 나무, 천인(하늘 사람)이 그려져 있다",
      position: { x: 20, y: 40 },
      slots: [
        { id: "mural_pond", label: "벽화 속 칠보 연못", relativePosition: { x: -5, y: 5 } },
        { id: "mural_tree", label: "벽화 속 보배 나무", relativePosition: { x: 5, y: -5 } },
        { id: "mural_angel", label: "벽화 속 천인(비천상)", relativePosition: { x: 10, y: -10 } },
      ],
    },
  ],

  // ─── 10. 수원화성 (hwaseong) ────────────────────────────

  janganmun: [
    {
      id: "jam_ongseong", name: "이층 누각 옹성", emoji: "🏯",
      description: "장안문을 감싸는 반달 모양 옹성. 적의 공격을 삼면에서 막아내는 방어 시설이다",
      position: { x: 50, y: 35 },
      slots: [
        { id: "ong_wall", label: "옹성 벽체", relativePosition: { x: 0, y: 0 } },
        { id: "ong_gate", label: "옹성 출입구", relativePosition: { x: 0, y: 10 } },
        { id: "ong_top", label: "옹성 위 여장", relativePosition: { x: 0, y: -10 } },
      ],
    },
    {
      id: "jam_brick_wall", name: "전벽돌 성벽", emoji: "🧱",
      description: "회색 전벽돌로 쌓은 성벽. 정조의 실학 정신으로 서양 축성술을 접목했다",
      position: { x: 25, y: 55 },
      slots: [
        { id: "brick_face", label: "벽돌 전면", relativePosition: { x: 0, y: -5 } },
        { id: "brick_mortar", label: "벽돌 사이 줄눈", relativePosition: { x: 0, y: 5 } },
        { id: "brick_corner", label: "성벽 모서리", relativePosition: { x: 10, y: 0 } },
      ],
    },
    {
      id: "jam_iron_bar", name: "철제 문빗장", emoji: "🔒",
      description: "장안문의 거대한 철제 문빗장. 두 짝 문을 가로질러 잠그는 빗장이다",
      position: { x: 75, y: 65 },
      slots: [
        { id: "bar_left", label: "빗장 왼쪽 끝", relativePosition: { x: -12, y: 0 } },
        { id: "bar_center", label: "빗장 중앙(잠금부)", relativePosition: { x: 0, y: 0 } },
        { id: "bar_right", label: "빗장 오른쪽 끝", relativePosition: { x: 12, y: 0 } },
      ],
    },
  ],

  hwahongmun: [
    {
      id: "hhm_arches", name: "7개 무지개 아치 수문", emoji: "🌈",
      description: "수원천이 흘러나가는 7개의 무지개 아치형 수문. 물이 아치 사이로 쏟아진다",
      position: { x: 50, y: 45 },
      slots: [
        { id: "arch_1", label: "첫째 아치(좌측)", relativePosition: { x: -18, y: 0 } },
        { id: "arch_4", label: "넷째 아치(중앙)", relativePosition: { x: 0, y: 0 } },
        { id: "arch_7", label: "일곱째 아치(우측)", relativePosition: { x: 18, y: 0 } },
      ],
    },
    {
      id: "hhm_water_sound", name: "수원천 물소리", emoji: "💧",
      description: "아치 아래를 통과하는 수원천. 수문을 빠져나온 물이 폭포처럼 쏟아진다",
      position: { x: 50, y: 70 },
      slots: [
        { id: "water_upstream", label: "수문 위(상류)", relativePosition: { x: -10, y: -5 } },
        { id: "water_fall_hhm", label: "수문 아래(낙수)", relativePosition: { x: 0, y: 5 } },
        { id: "water_downstream", label: "수문 밑(하류)", relativePosition: { x: 10, y: 10 } },
      ],
    },
    {
      id: "hhm_pavilion", name: "석축 위 누각", emoji: "🏯",
      description: "수문 위에 세운 누각. 성벽 위에서 수원천과 도시를 내려다본다",
      position: { x: 50, y: 15 },
      slots: [
        { id: "pavilion_floor_hhm", label: "누각 마루", relativePosition: { x: 0, y: 0 } },
        { id: "pavilion_railing", label: "누각 난간", relativePosition: { x: 12, y: 5 } },
      ],
    },
  ],

  banghwasuryujeong: [
    {
      id: "bhs_reflection", name: "용연 연못 위 반영", emoji: "🪞",
      description: "용연 연못 수면에 비친 방화수류정. 달밤에 정자와 달이 함께 수면에 뜬다",
      position: { x: 50, y: 60 },
      slots: [
        { id: "yongyeon_surface", label: "용연 수면", relativePosition: { x: 0, y: 0 } },
        { id: "yongyeon_moon", label: "수면 위 달 반영", relativePosition: { x: -10, y: -5 } },
        { id: "yongyeon_pavilion", label: "수면 위 정자 반영", relativePosition: { x: 10, y: 5 } },
      ],
    },
    {
      id: "bhs_willow", name: "버드나무", emoji: "🌳",
      description: "연못가에 늘어진 수양버들. 가지가 수면에 닿을 듯 늘어져 바람에 흔들린다",
      position: { x: 25, y: 40 },
      slots: [
        { id: "willow_branch", label: "늘어진 가지", relativePosition: { x: -5, y: 10 } },
        { id: "willow_trunk_bhs", label: "버드나무 줄기", relativePosition: { x: 0, y: -5 } },
        { id: "willow_tip", label: "수면 닿는 가지 끝", relativePosition: { x: 5, y: 15 } },
      ],
    },
    {
      id: "bhs_moonlight", name: "달빛 정자", emoji: "🌙",
      description: "방화수류정 자체. '꽃을 찾고 버들을 따라가는 정자'라는 뜻의 정자다",
      position: { x: 70, y: 25 },
      slots: [
        { id: "jeongja_floor", label: "정자 마루", relativePosition: { x: 0, y: 0 } },
        { id: "jeongja_eave", label: "정자 처마", relativePosition: { x: 5, y: -10 } },
        { id: "jeongja_pillar", label: "정자 기둥", relativePosition: { x: -8, y: 5 } },
      ],
    },
  ],

  seojangdae: [
    {
      id: "sjd_flag", name: "팔달산 정상 깃발", emoji: "🚩",
      description: "서장대 꼭대기에 펄럭이는 장수 깃발. 정조가 야간 군사 훈련을 지휘한 곳이다",
      position: { x: 50, y: 15 },
      slots: [
        { id: "flag_cloth", label: "깃발 천(바람에 펄럭)", relativePosition: { x: 5, y: -5 } },
        { id: "flag_pole", label: "깃대", relativePosition: { x: -3, y: 5 } },
      ],
    },
    {
      id: "sjd_yeojang", name: "성곽 여장", emoji: "🏰",
      description: "성벽 위의 톱니 모양 여장(女墻). 총안과 타구멍이 뚫려 있다",
      position: { x: 30, y: 45 },
      slots: [
        { id: "yeojang_merlon", label: "여장 돌출부(타)", relativePosition: { x: -8, y: 0 } },
        { id: "yeojang_crenel", label: "여장 홈(총안)", relativePosition: { x: 0, y: 0 } },
        { id: "yeojang_back", label: "여장 안쪽(은신처)", relativePosition: { x: 8, y: 5 } },
      ],
    },
    {
      id: "sjd_drum", name: "군사 지휘 북", emoji: "🥁",
      description: "서장대에 놓인 큰 군사 북. 이 북소리로 진퇴를 명령했다",
      position: { x: 70, y: 55 },
      slots: [
        { id: "drum_head", label: "북 가죽면(치는 곳)", relativePosition: { x: 0, y: -5 } },
        { id: "drum_body_sjd", label: "북통", relativePosition: { x: 0, y: 5 } },
        { id: "drum_stick", label: "북채", relativePosition: { x: 10, y: -8 } },
      ],
    },
  ],

  gongsimdon: [
    {
      id: "gsd_tower", name: "원통형 3층 망루", emoji: "🏰",
      description: "둥근 원통형으로 솟은 3층 돌망루. 화성에서 가장 독특한 군사 시설이다",
      position: { x: 50, y: 35 },
      slots: [
        { id: "tower_floor1", label: "1층(입구)", relativePosition: { x: 0, y: 10 } },
        { id: "tower_floor2", label: "2층(감시)", relativePosition: { x: 0, y: 0 } },
        { id: "tower_floor3", label: "3층(최상단)", relativePosition: { x: 0, y: -10 } },
      ],
    },
    {
      id: "gsd_gunhole", name: "총안(총구멍)", emoji: "🎯",
      description: "성벽에 뚫린 총안. 안에서 밖을 조준할 수 있지만, 밖에서는 안이 보이지 않는다",
      position: { x: 25, y: 55 },
      slots: [
        { id: "gunhole_upper", label: "상단 총안", relativePosition: { x: 0, y: -8 } },
        { id: "gunhole_mid", label: "중단 총안", relativePosition: { x: 0, y: 0 } },
        { id: "gunhole_lower", label: "하단 총안", relativePosition: { x: 0, y: 8 } },
      ],
    },
    {
      id: "gsd_spiral_stairs", name: "나선 계단", emoji: "🌀",
      description: "공심돈 내부의 좁은 나선 계단. 벽에 바짝 붙어 한 사람씩 올라가야 한다",
      position: { x: 75, y: 60 },
      slots: [
        { id: "spiral_entry", label: "나선 계단 입구", relativePosition: { x: 0, y: 8 } },
        { id: "spiral_turn", label: "나선 계단 회전부", relativePosition: { x: 5, y: 0 } },
        { id: "spiral_exit", label: "나선 계단 출구(꼭대기)", relativePosition: { x: -5, y: -8 } },
      ],
    },
  ],
};

// ===== 배정 함수 =====

/**
 * 콘텐츠 항목들을 소품에 자동 배정한다.
 *
 * @param itemCount - 배치할 개념 수
 * @param zoneId - 구역 ID (예: "gwanghwamun", "geunjeongjeon")
 * @returns 각 item이 어떤 소품의 어떤 슬롯에 배치되는지
 */
export function assignItemsToProps(
  itemCount: number,
  zoneId: string
): PropAssignment[] {
  const props = ZONE_SPECIFIC_PROPS[zoneId] || DEFAULT_PROPS;
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
