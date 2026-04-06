export interface PalaceZone {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
}

export interface PalaceLocation {
  key: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string; // 장소 분위기를 나타내는 CSS 그라디언트
  zones: PalaceZone[];
}

export const LOCATIONS: PalaceLocation[] = [
  {
    key: "gyeongbokgung",
    name: "경복궁",
    description: "조선 왕조의 법궁, 서울 종로구에 위치한 대한민국 대표 궁궐",
    emoji: "🏯",
    gradient: "linear-gradient(135deg, #8B4513 0%, #D4A574 50%, #C0392B 100%)",
    zones: [
      { id: "gwanghwamun", name: "광화문", description: "경복궁의 정문, 웅장한 석축 위의 2층 누각", position: { x: 50, y: 90 } },
      { id: "geunjeongjeon", name: "근정전", description: "왕의 즉위식과 외국 사신 접견이 이루어진 정전", position: { x: 50, y: 70 } },
      { id: "sajeongjeon", name: "사정전", description: "왕이 매일 업무를 보던 편전", position: { x: 50, y: 55 } },
      { id: "gyeonghoeru", name: "경회루", description: "연못 위에 지어진 아름다운 2층 누각", position: { x: 25, y: 45 } },
      { id: "hyangwonjeong", name: "향원정", description: "연꽃이 피는 연못 한가운데 육각정", position: { x: 50, y: 30 } },
    ],
  },
  {
    key: "hanok",
    name: "한옥마을",
    description: "전통 한옥의 아름다움을 간직한 북촌 한옥마을",
    emoji: "🏠",
    gradient: "linear-gradient(135deg, #5D4037 0%, #A1887F 50%, #8D6E63 100%)",
    zones: [
      { id: "madang", name: "마당", description: "한옥 중앙의 열린 공간, 하늘이 보이는 곳", position: { x: 50, y: 85 } },
      { id: "daecheong", name: "대청마루", description: "여름에 시원한 바람이 부는 나무 마루", position: { x: 50, y: 60 } },
      { id: "sarangbang", name: "사랑방", description: "주인이 손님을 맞이하고 공부하는 방", position: { x: 25, y: 45 } },
      { id: "anbang", name: "안방", description: "가족이 모여 쉬는 따뜻한 온돌방", position: { x: 75, y: 45 } },
      { id: "bueok", name: "부엌", description: "음식을 만들고 불을 때는 공간", position: { x: 50, y: 25 } },
    ],
  },
  {
    key: "museum",
    name: "국립중앙박물관",
    description: "대한민국의 역사와 문화를 담은 아시아 최대 박물관",
    emoji: "🏛️",
    gradient: "linear-gradient(135deg, #37474F 0%, #78909C 50%, #546E7A 100%)",
    zones: [
      { id: "lobby", name: "1층 로비", description: "높은 천장의 탁 트인 입구 공간", position: { x: 50, y: 85 } },
      { id: "prehistoric", name: "선사·고대관", description: "구석기부터 삼국시대까지의 유물", position: { x: 25, y: 60 } },
      { id: "medieval", name: "중·근세관", description: "고려·조선 시대의 역사를 보여주는 전시실", position: { x: 75, y: 60 } },
      { id: "special", name: "기획전시실", description: "특별 전시가 열리는 독립 공간", position: { x: 50, y: 40 } },
      { id: "garden", name: "야외 정원", description: "석탑과 석조물이 있는 평화로운 정원", position: { x: 50, y: 20 } },
    ],
  },
  {
    key: "library",
    name: "서울도서관",
    description: "옛 서울시청 건물을 리모델링한 시민 도서관",
    emoji: "📚",
    gradient: "linear-gradient(135deg, #1A237E 0%, #3F51B5 50%, #7986CB 100%)",
    zones: [
      { id: "entrance", name: "1층 로비", description: "높은 기둥이 늘어선 웅장한 입구", position: { x: 50, y: 85 } },
      { id: "reading", name: "열람실", description: "조용히 책을 읽는 넓은 공간", position: { x: 30, y: 60 } },
      { id: "stacks", name: "서고", description: "책장이 빼곡히 늘어선 보관 공간", position: { x: 70, y: 60 } },
      { id: "stairs", name: "계단홀", description: "나선형으로 올라가는 아름다운 계단", position: { x: 50, y: 40 } },
      { id: "rooftop", name: "옥상정원", description: "서울 시내가 내려다보이는 하늘정원", position: { x: 50, y: 20 } },
    ],
  },
  {
    key: "namsan",
    name: "남산타워",
    description: "서울의 상징, 남산 위의 전망 타워",
    emoji: "🗼",
    gradient: "linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #FF6F00 100%)",
    zones: [
      { id: "cable", name: "케이블카", description: "산 아래에서 위로 올라가는 공중 이동", position: { x: 50, y: 85 } },
      { id: "stairs_namsan", name: "남산 계단", description: "숲속을 지나는 긴 돌계단", position: { x: 30, y: 65 } },
      { id: "palgakjeong", name: "팔각정", description: "전통 양식의 8각 정자", position: { x: 70, y: 65 } },
      { id: "locks", name: "사랑의 자물쇠", description: "연인들이 자물쇠를 걸어두는 울타리", position: { x: 50, y: 40 } },
      { id: "observatory", name: "전망대", description: "서울 전체가 360도로 보이는 꼭대기", position: { x: 50, y: 15 } },
    ],
  },
  {
    key: "gwanghwamun",
    name: "광화문광장",
    description: "세종대왕과 이순신 장군 동상이 있는 서울의 중심 광장",
    emoji: "🏙️",
    gradient: "linear-gradient(135deg, #263238 0%, #455A64 50%, #90A4AE 100%)",
    zones: [
      { id: "sejong", name: "세종대왕상", description: "한글을 창제한 세종대왕의 거대한 좌상", position: { x: 50, y: 80 } },
      { id: "yi_sun_sin", name: "이순신장군상", description: "거북선을 이끈 명장의 우뚝 선 동상", position: { x: 50, y: 60 } },
      { id: "fountain", name: "분수대", description: "물이 솟아오르는 시원한 분수", position: { x: 30, y: 45 } },
      { id: "haechi", name: "해치상", description: "정의를 상징하는 신화 속 동물 석상", position: { x: 70, y: 45 } },
      { id: "yukjo", name: "육조거리", description: "조선 시대 6개 관청이 있던 역사의 거리", position: { x: 50, y: 25 } },
    ],
  },
  {
    key: "changdeokgung",
    name: "창덕궁 후원",
    description: "유네스코 세계문화유산, 자연과 건축이 조화로운 비밀의 정원",
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #1B5E20 0%, #4CAF50 50%, #81C784 100%)",
    zones: [
      { id: "buyongjeong", name: "부용정", description: "네모난 연못 위 십자형 정자", position: { x: 30, y: 80 } },
      { id: "yeongyeongdang", name: "연경당", description: "왕이 사대부 생활을 체험한 집", position: { x: 70, y: 65 } },
      { id: "ongnyucheon", name: "옥류천", description: "바위에 새긴 글씨와 작은 폭포", position: { x: 30, y: 45 } },
      { id: "jondeokjeong", name: "존덕정", description: "부채꼴 모양의 독특한 정자", position: { x: 70, y: 35 } },
      { id: "gwallamjeong", name: "관람정", description: "연못을 내려다보는 부채꼴 정자", position: { x: 50, y: 20 } },
    ],
  },
  {
    key: "jeju",
    name: "제주 돌하르방공원",
    description: "제주도의 상징 돌하르방과 아름다운 자연이 어우러진 공원",
    emoji: "🗿",
    gradient: "linear-gradient(135deg, #006064 0%, #00ACC1 50%, #26C6DA 100%)",
    zones: [
      { id: "entrance_jeju", name: "입구", description: "커다란 돌하르방이 맞이하는 정문", position: { x: 50, y: 85 } },
      { id: "stone_path", name: "돌담길", description: "현무암 돌담이 이어진 제주 전통 길", position: { x: 30, y: 65 } },
      { id: "tangerine", name: "감귤밭", description: "주황빛 감귤이 주렁주렁 달린 밭", position: { x: 70, y: 50 } },
      { id: "viewpoint", name: "전망대", description: "한라산이 보이는 탁 트인 전망 포인트", position: { x: 50, y: 35 } },
      { id: "coast", name: "해안절벽", description: "파도가 부딪히는 검은 현무암 절벽", position: { x: 50, y: 15 } },
    ],
  },
  {
    key: "bulguksa",
    name: "불국사",
    description: "유네스코 세계문화유산, 신라 불교 예술의 정수",
    emoji: "🛕",
    gradient: "linear-gradient(135deg, #BF360C 0%, #E64A19 50%, #FF8A65 100%)",
    zones: [
      { id: "cheongungyo", name: "청운교·백운교", description: "극락으로 향하는 아름다운 돌다리 계단", position: { x: 50, y: 85 } },
      { id: "dabotap", name: "다보탑", description: "화려하고 복잡한 조형미의 석탑", position: { x: 70, y: 60 } },
      { id: "seokgatap", name: "석가탑", description: "단아하고 균형 잡힌 3층 석탑", position: { x: 30, y: 60 } },
      { id: "daeungjeon", name: "대웅전", description: "석가모니 부처를 모신 본전", position: { x: 50, y: 40 } },
      { id: "geungnakjeon", name: "극락전", description: "아미타불을 모신 극락세계의 전각", position: { x: 50, y: 20 } },
    ],
  },
  {
    key: "hwaseong",
    name: "수원화성",
    description: "유네스코 세계문화유산, 정조의 효심으로 지은 성곽",
    emoji: "🏰",
    gradient: "linear-gradient(135deg, #4E342E 0%, #795548 50%, #A1887F 100%)",
    zones: [
      { id: "janganmun", name: "장안문", description: "화성의 북문, 국내 최대 규모의 성문", position: { x: 50, y: 85 } },
      { id: "hwahongmun", name: "화홍문", description: "수원천 위 7개 무지개 아치의 수문", position: { x: 30, y: 65 } },
      { id: "banghwasuryujeong", name: "방화수류정", description: "성곽 위 가장 아름다운 누각, 용연 연못 옆", position: { x: 70, y: 50 } },
      { id: "seojangdae", name: "서장대", description: "군사를 지휘하던 팔달산 정상의 지휘소", position: { x: 50, y: 30 } },
      { id: "gongsimdon", name: "공심돈", description: "적을 관측하는 독특한 원통형 망루", position: { x: 50, y: 15 } },
    ],
  },
];

export function getLocation(key: string): PalaceLocation | undefined {
  return LOCATIONS.find((l) => l.key === key);
}
