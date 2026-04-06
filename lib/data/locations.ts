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

// === 바이오 아일랜드 — 생명과학 전용 기억의 궁전 ===
export const BIO_ISLAND_LOCATIONS: PalaceLocation[] = [
  {
    key: "cell_dome",
    name: "세포 돔",
    description: "거대한 투명 돔 안에 세포의 내부 구조를 실물 크기로 재현한 체험관",
    emoji: "🔬",
    gradient: "linear-gradient(135deg, #00695C 0%, #26A69A 50%, #80CBC4 100%)",
    zones: [
      { id: "cell_membrane_gate", name: "인지질 이중층 입구", description: "유동 모자이크 모델로 구현된 세포막, 채널 단백질이 문 역할", position: { x: 50, y: 90 } },
      { id: "nucleus_tower", name: "핵 관제탑", description: "이중막으로 둘러싸인 중앙 타워, DNA 설계도가 보관된 사령부", position: { x: 50, y: 50 } },
      { id: "mitochondria_plant", name: "미토콘드리아 발전소", description: "ATP를 생산하는 발전소, 크리스타(주름) 형태의 내막 구조", position: { x: 25, y: 65 } },
      { id: "ribosome_factory", name: "리보솜 공장", description: "mRNA 설계도를 읽어 단백질을 조립하는 나노 공장", position: { x: 75, y: 35 } },
      { id: "er_corridor", name: "소포체 복도", description: "거친면 소포체(리보솜 부착)와 매끈면 소포체(지질 합성)의 미로", position: { x: 30, y: 35 } },
      { id: "golgi_logistics", name: "골지체 물류센터", description: "단백질을 가공·포장·분류하여 목적지로 보내는 물류 허브", position: { x: 70, y: 65 } },
    ],
  },
  {
    key: "dna_tower",
    name: "DNA 나선탑",
    description: "높이 100m의 이중나선 형태 타워, 각 층에서 유전의 비밀을 탐험",
    emoji: "🧬",
    gradient: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #CE93D8 100%)",
    zones: [
      { id: "helix_stairs", name: "나선 계단", description: "A-T, G-C 염기쌍이 계단 난간을 이루는 이중나선 구조", position: { x: 50, y: 85 } },
      { id: "mendel_garden", name: "멘델의 완두콩 정원", description: "우열의 원리, 분리·독립의 법칙을 실험하는 온실 정원", position: { x: 25, y: 65 } },
      { id: "chromosome_gallery", name: "염색체 전시관", description: "46개 염색체 모형, 상동 염색체와 성염색체를 비교 전시", position: { x: 75, y: 65 } },
      { id: "pedigree_gallery", name: "가계도 갤러리", description: "ABO 혈액형, 색맹, 혈우병 등 사람의 유전 가계도 전시", position: { x: 50, y: 40 } },
      { id: "mutation_lab", name: "돌연변이 연구소", description: "유전자·염색체 이상을 연구하는 최첨단 실험실", position: { x: 50, y: 15 } },
    ],
  },
  {
    key: "division_plaza",
    name: "분열의 광장",
    description: "세포 분열의 전 과정을 실시간으로 보여주는 원형 야외 광장",
    emoji: "🔄",
    gradient: "linear-gradient(135deg, #E65100 0%, #FF9800 50%, #FFE0B2 100%)",
    zones: [
      { id: "interphase_garden", name: "간기 정원", description: "G1→S(DNA 복제)→G2 단계를 꽃밭으로 표현한 준비 정원", position: { x: 50, y: 85 } },
      { id: "spindle_fountain", name: "방추사 분수", description: "중심체에서 뻗어나온 방추사가 물줄기로 표현된 분수", position: { x: 30, y: 60 } },
      { id: "mitosis_hall", name: "체세포 분열관", description: "전기→중기→후기→말기, 2n→2n 과정을 순서대로 체험", position: { x: 70, y: 60 } },
      { id: "meiosis_hall", name: "감수 분열관", description: "감수1분열(상동 염색체 분리)→감수2분열(염색분체 분리), 2n→n", position: { x: 50, y: 35 } },
      { id: "gamete_hatchery", name: "생식세포 부화장", description: "정자와 난자가 만들어지는 과정, 수정과 발생의 시작점", position: { x: 50, y: 15 } },
    ],
  },
  {
    key: "homeostasis_center",
    name: "항상성 센터",
    description: "인체를 모방한 거대 건축물, 신경·호르몬·면역 시스템을 체험",
    emoji: "🏥",
    gradient: "linear-gradient(135deg, #B71C1C 0%, #E53935 50%, #EF9A9A 100%)",
    zones: [
      { id: "neuron_comm_tower", name: "신경 통신탑", description: "뉴런의 구조(가지돌기→세포체→축삭)를 타워 형태로 재현", position: { x: 50, y: 85 } },
      { id: "synapse_bridge", name: "시냅스 다리", description: "신경전달물질이 시냅스 틈을 건너는 과정을 보여주는 현수교", position: { x: 30, y: 65 } },
      { id: "hormone_post", name: "호르몬 우체국", description: "혈액을 통해 호르몬 '편지'를 표적 기관에 배달하는 우체국", position: { x: 70, y: 65 } },
      { id: "immune_fortress", name: "면역 요새", description: "1차 방어(피부·점막)→2차 방어(식세포)→3차 방어(림프구)의 다층 성벽", position: { x: 50, y: 40 } },
      { id: "glucose_control", name: "혈당 조절실", description: "인슐린과 글루카곤이 시소처럼 혈당을 조절하는 제어실", position: { x: 50, y: 15 } },
    ],
  },
  {
    key: "ecosystem_park",
    name: "생태계 자연공원",
    description: "섬의 야외 구역, 숲·호수·동굴에서 생태계의 모든 상호작용을 체험",
    emoji: "🌳",
    gradient: "linear-gradient(135deg, #1B5E20 0%, #388E3C 40%, #2196F3 100%)",
    zones: [
      { id: "canopy_viewpoint", name: "숲 캐노피 전망대", description: "수관층에서 생산자→소비자→분해자의 먹이사슬을 내려다보는 전망대", position: { x: 50, y: 85 } },
      { id: "food_web_trail", name: "먹이그물 트레일", description: "복잡하게 얽힌 먹이 관계를 따라 걷는 숲속 탐방로", position: { x: 30, y: 65 } },
      { id: "carbon_cycle_lake", name: "탄소순환 호수", description: "광합성·호흡·분해로 탄소가 순환하는 과정을 보여주는 호수", position: { x: 70, y: 50 } },
      { id: "nitrogen_cave", name: "질소 고정 동굴", description: "뿌리혹박테리아가 질소를 고정하는 지하 동굴 생태계", position: { x: 30, y: 35 } },
      { id: "biodiversity_reserve", name: "생물다양성 보호구역", description: "유전적·종·생태계 다양성을 보전하는 섬의 핵심 보호구역", position: { x: 60, y: 15 } },
    ],
  },
];

// === 언어의 궁전 — 언어와 매체 전용 기억의 궁전 ===
export const KOREAN_LANG_LOCATIONS: PalaceLocation[] = [
  {
    key: "phoneme_fortress",
    name: "음운의 성",
    description: "음소에서 음절까지, 소리의 세계를 탐험하는 성채. 각 방마다 자음과 모음이 살아 숨쉰다",
    emoji: "🔤",
    gradient: "linear-gradient(135deg, #1565C0 0%, #42A5F5 50%, #90CAF9 100%)",
    zones: [
      { id: "consonant_hall", name: "자음의 전당", description: "19개 자음이 조음 위치와 방법에 따라 배열된 거대한 홀. 예송·평음·경음이 벽면을 장식", position: { x: 30, y: 85 } },
      { id: "vowel_garden", name: "모음의 정원", description: "10개 단모음이 혀 높이와 위치에 따라 심어진 정원. 하늘(ㆍ), 땅(ㅡ), 사람(ㅣ)의 원리", position: { x: 70, y: 85 } },
      { id: "syllable_tower", name: "음절 탑", description: "초성+중성+종성이 층층이 쌓이는 탑. 겹받침이 꼭대기를 장식", position: { x: 50, y: 65 } },
      { id: "change_bridge", name: "교체의 다리", description: "음운이 다른 음운으로 바뀌는 다리. 비음화, 유음화, 구개음화, 된소리되기의 4개 아치", position: { x: 30, y: 40 } },
      { id: "reduction_gate", name: "탈락과 축약의 문", description: "자음군 단순화로 받침이 하나 사라지는 문, 거센소리되기로 두 소리가 하나로 합쳐지는 관문", position: { x: 70, y: 40 } },
      { id: "addition_plaza", name: "첨가의 광장", description: "사이시옷이 솟아나고 'ㄴ'이 끼어드는 광장. 담요→담뇨, 색연필→생년필", position: { x: 50, y: 15 } },
    ],
  },
  {
    key: "morpheme_workshop",
    name: "형태소 공방",
    description: "어근과 접사가 결합하여 새로운 단어를 만드는 공방. 품사가 분류되고 문장이 조립된다",
    emoji: "🔨",
    gradient: "linear-gradient(135deg, #E65100 0%, #FF9800 50%, #FFE0B2 100%)",
    zones: [
      { id: "root_workbench", name: "어근 작업대", description: "자립 형태소와 의존 형태소, 실질 형태소와 형식 형태소가 정리된 작업대", position: { x: 50, y: 85 } },
      { id: "affix_shelf", name: "접사 선반", description: "접두사(풋-, 맨-, 헛-)와 접미사(-이, -음, -기, -답다)가 줄지어 꽂힌 선반", position: { x: 25, y: 65 } },
      { id: "derivation_bench", name: "파생어 조립대", description: "어근+접사를 결합하여 파생어를 만드는 곳. 품사가 바뀌는 마법의 작업대", position: { x: 75, y: 65 } },
      { id: "compound_forge", name: "합성어 용광로", description: "어근+어근이 녹아 합성어가 되는 용광로. 통사적/비통사적 합성어 구분", position: { x: 50, y: 40 } },
      { id: "pos_cabinet", name: "품사 분류함", description: "체언·용언·수식언·관계언·독립언, 9품사가 서랍별로 정리된 거대 캐비닛", position: { x: 50, y: 15 } },
    ],
  },
  {
    key: "sentence_palace",
    name: "문장의 궁전",
    description: "주어가 옥좌에 앉고 서술어가 판결을 내리는 궁전. 안은문장이 중첩되는 장엄한 구조",
    emoji: "🏛️",
    gradient: "linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #CE93D8 100%)",
    zones: [
      { id: "subject_throne", name: "주어의 옥좌", description: "문장의 주인공이 앉는 자리. '이/가' 표지를 달고 서술어를 향해 명령한다", position: { x: 50, y: 85 } },
      { id: "predicate_court", name: "서술어의 대전", description: "동사와 형용사가 판결을 내리는 법정. 주성분을 몇 개 요구하는지(자릿수)가 핵심", position: { x: 50, y: 60 } },
      { id: "object_courtyard", name: "목적어의 뜰", description: "'을/를'을 달고 서술어의 행위 대상이 되는 뜰. 보어도 이곳에 산다", position: { x: 25, y: 45 } },
      { id: "modifier_corridor", name: "수식어의 회랑", description: "관형어와 부사어가 꾸며주는 길고 아름다운 복도. 필수적 부사어는 VIP석", position: { x: 75, y: 45 } },
      { id: "embedded_chamber", name: "안은문장의 방", description: "명사절·관형절·부사절·서술절·인용절이 중첩되는 미로 같은 내실", position: { x: 30, y: 20 } },
      { id: "connected_hall", name: "이어진문장의 홀", description: "대등적 연결(-고, -지만)과 종속적 연결(-면, -므로)로 문장이 이어지는 대홀", position: { x: 70, y: 20 } },
    ],
  },
  {
    key: "jiphyeonjeon",
    name: "집현전",
    description: "세종대왕과 학자들이 훈민정음을 창제한 역사적 공간. 국어의 과거와 현재를 잇는 시간의 전당",
    emoji: "📜",
    gradient: "linear-gradient(135deg, #5D4037 0%, #8D6E63 40%, #D4A574 100%)",
    zones: [
      { id: "hunminjeongeum_room", name: "훈민정음 해례본실", description: "초성·중성·종성 창제 원리(발음기관 상형, 천지인, 초성 재활용)를 기록한 보물의 방", position: { x: 50, y: 85 } },
      { id: "medieval_archive", name: "중세국어 서고", description: "아래아(ㆍ), 방점, 이어적기, 모음조화가 살아 있는 고문서가 가득한 서고", position: { x: 25, y: 60 } },
      { id: "modern_transition", name: "근대국어 자료실", description: "아래아 소실, 구개음화, 두음법칙이 진행되는 언어 변화를 추적하는 방", position: { x: 75, y: 60 } },
      { id: "spelling_lecture", name: "한글 맞춤법 강의실", description: "'소리대로 적되 어법에 맞도록' 원칙을 배우는 강의실. 사이시옷, 띄어쓰기 코너", position: { x: 30, y: 30 } },
      { id: "standard_library", name: "표준어 도서관", description: "표준어 규정, 외래어 표기법, 로마자 표기법 참고서가 정리된 도서관", position: { x: 70, y: 30 } },
    ],
  },
  {
    key: "media_square",
    name: "매체의 광장",
    description: "인쇄에서 AI까지, 매체의 진화를 체험하는 미래형 광장. 미디어 리터러시의 중심지",
    emoji: "📱",
    gradient: "linear-gradient(135deg, #0D47A1 0%, #1976D2 40%, #00BCD4 100%)",
    zones: [
      { id: "print_pavilion", name: "인쇄 매체관", description: "신문의 역피라미드 구조, 잡지의 시각 편집, 책의 선형적 서사를 전시하는 파빌리온", position: { x: 25, y: 80 } },
      { id: "broadcast_studio", name: "방송 스튜디오", description: "카메라 앵글·편집·자막으로 의미를 구성하는 영상 언어의 제작 현장", position: { x: 75, y: 80 } },
      { id: "sns_cafe", name: "SNS 카페", description: "해시태그, 이모티콘, 밈이 소통의 도구가 되는 쌍방향 소통 공간", position: { x: 50, y: 55 } },
      { id: "factcheck_center", name: "팩트체크 센터", description: "가짜 뉴스를 판별하고 출처를 검증하는 미디어 리터러시 훈련소", position: { x: 30, y: 30 } },
      { id: "ai_media_lab", name: "AI 매체 연구소", description: "AI 생성 콘텐츠, 딥페이크, 챗봇 언어를 연구하고 디지털 시민성을 배우는 미래 연구소", position: { x: 70, y: 30 } },
    ],
  },
];

// 전체 장소 목록 (기본 + 바이오 아일랜드 + 언어의 궁전)
export const ALL_LOCATIONS = [...LOCATIONS, ...BIO_ISLAND_LOCATIONS, ...KOREAN_LANG_LOCATIONS];

export function getLocation(key: string): PalaceLocation | undefined {
  return ALL_LOCATIONS.find((l) => l.key === key);
}
