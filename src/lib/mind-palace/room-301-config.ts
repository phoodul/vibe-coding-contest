import type { RoomSceneConfig, ObjectType, SceneObject } from "./scene-config";

export const ROOM_301_CONFIG: RoomSceneConfig = {
  roomId: "301",
  sectionId: "ch3_s1",
  title: "직업과 청렴의 윤리",
  background: "classroom",

  objects: [
    // ── North wall (c1): 직업의 의미와 직업 윤리 ──

    {
      id: "blackboard_job",
      type: "blackboard",
      x: 350,
      y: 60,
      keyword: "직업",
      label: "직업의 의미 칠판",
      noteId: "ch3_s1_c1",
      parts: [
        {
          id: "blackboard_job_main",
          keyword: "직업",
          text: "직업: 생계 수단 + 사회적 역할 분담 + 자아실현의 수단",
          flatIndex: 0,
        },
      ],
    },
    {
      id: "painting_mengzi",
      type: "painting",
      x: 150,
      y: 70,
      keyword: "맹자",
      label: "맹자 초상 액자",
      noteId: "ch3_s1_c1",
      parts: [
        {
          id: "mengzi_branch_eastern",
          keyword: "동양",
          text: "동양적 관점",
          flatIndex: 1,
        },
        {
          id: "mengzi_branch_name",
          keyword: "맹자",
          text: "맹자(孟子)",
          flatIndex: 2,
        },
        {
          id: "mengzi_left",
          keyword: "분업 강조",
          text: "사회적 분업 필요성 강조",
          flatIndex: 3,
        },
        {
          id: "mengzi_right",
          keyword: "노심/노력",
          text: "노심(勞心)자와 노력(勞力)자 구분",
          flatIndex: 4,
        },
      ],
    },
    {
      id: "scroll_xunzi",
      type: "scroll",
      x: 250,
      y: 130,
      keyword: "순자",
      label: "순자 두루마리",
      noteId: "ch3_s1_c1",
      parts: [
        {
          id: "xunzi_branch",
          keyword: "순자",
          text: "순자(荀子)",
          flatIndex: 5,
        },
        {
          id: "xunzi_top",
          keyword: "직분 의식",
          text: "예(禮)에 기반한 직분 의식 강조",
          flatIndex: 6,
        },
        {
          id: "xunzi_bottom",
          keyword: "질서 유지",
          text: "사회 질서 유지 목적",
          flatIndex: 7,
        },
      ],
    },
    {
      id: "book_calvin",
      type: "book",
      x: 550,
      y: 70,
      keyword: "칼뱅",
      label: "칼뱅 소명설 책",
      noteId: "ch3_s1_c1",
      parts: [
        {
          id: "calvin_branch_western",
          keyword: "서양",
          text: "서양적 관점",
          flatIndex: 8,
        },
        {
          id: "calvin_branch_name",
          keyword: "칼뱅",
          text: "칼뱅(Calvin)",
          flatIndex: 9,
        },
        {
          id: "calvin_cover",
          keyword: "소명설",
          text: "소명설(Calling): 직업 = 신이 부여한 소명",
          flatIndex: 10,
        },
        {
          id: "calvin_page",
          keyword: "구원 증거",
          text: "직업적 성공 = 구원의 증거",
          flatIndex: 11,
        },
        {
          id: "calvin_bookmark",
          keyword: "베버 분석",
          text: "베버(Weber)가 '프로테스탄티즘의 윤리와 자본주의 정신'에서 분석함",
          flatIndex: 12,
        },
      ],
    },
    {
      id: "book_marx",
      type: "book",
      x: 700,
      y: 90,
      keyword: "마르크스",
      label: "마르크스 노동론 책",
      noteId: "ch3_s1_c1",
      parts: [
        {
          id: "marx_branch",
          keyword: "마르크스",
          text: "마르크스(Marx)",
          flatIndex: 13,
        },
        {
          id: "marx_front",
          keyword: "소외",
          text: "자본주의적 노동 → 인간 소외 초래",
          flatIndex: 14,
        },
        {
          id: "marx_back",
          keyword: "자아실현",
          text: "노동은 자아실현의 수단이어야 함",
          flatIndex: 15,
        },
      ],
    },

    // ── West wall (c2): 전문직 윤리와 기업 윤리 ──

    {
      id: "cert_professional",
      type: "certificate",
      x: 50,
      y: 220,
      keyword: "전문직",
      label: "전문직 윤리 선서문",
      noteId: "ch3_s1_c2",
      parts: [
        {
          id: "cert_branch",
          keyword: "전문직",
          text: "전문직 윤리",
          flatIndex: 16,
        },
        {
          id: "cert_main",
          keyword: "윤리적 책임",
          text: "의사, 변호사, 교사 등 높은 수준의 윤리적 책임 부담",
          flatIndex: 17,
        },
      ],
    },
    {
      id: "painting_ethics3",
      type: "painting",
      x: 50,
      y: 310,
      keyword: "직업윤리",
      label: "전문직 윤리 사례 액자",
      noteId: "ch3_s1_c2",
      parts: [
        {
          id: "ethics_branch",
          keyword: "대표 사례",
          text: "대표 사례",
          flatIndex: 18,
        },
        {
          id: "ethics_doctor",
          keyword: "의사",
          text: "의사: 히포크라테스 선서 ('해를 끼치지 말라')",
          flatIndex: 19,
        },
        {
          id: "ethics_lawyer",
          keyword: "변호사",
          text: "변호사: 의뢰인 비밀 보호 의무",
          flatIndex: 20,
        },
        {
          id: "ethics_teacher",
          keyword: "교사",
          text: "교사: 교육적 양심",
          flatIndex: 21,
        },
      ],
    },
    {
      id: "scale_public",
      type: "scale",
      x: 160,
      y: 250,
      keyword: "공익우선",
      label: "공익 우선 저울",
      noteId: "ch3_s1_c2",
      parts: [
        {
          id: "scale_main",
          keyword: "공익우선",
          text: "핵심 원칙: 공공 이익 > 사적 이익",
          flatIndex: 22,
        },
      ],
    },
    {
      id: "nameplate_friedman",
      type: "nameplate",
      x: 50,
      y: 420,
      keyword: "프리드먼",
      label: "프리드먼 명패",
      noteId: "ch3_s1_c2",
      parts: [
        {
          id: "friedman_branch_csr",
          keyword: "CSR",
          text: "기업의 사회적 책임(CSR)",
          flatIndex: 23,
        },
        {
          id: "friedman_branch_name",
          keyword: "프리드먼",
          text: "프리드먼(Friedman): 주주 자본주의",
          flatIndex: 24,
        },
        {
          id: "friedman_main",
          keyword: "이윤 극대화",
          text: "기업의 유일한 책임 = 이윤 극대화",
          flatIndex: 25,
        },
      ],
    },
    {
      id: "nameplate_freeman",
      type: "nameplate",
      x: 160,
      y: 420,
      keyword: "프리먼",
      label: "프리먼 명패",
      noteId: "ch3_s1_c2",
      parts: [
        {
          id: "freeman_branch",
          keyword: "이해관계자",
          text: "프리먼(Freeman): 이해관계자 자본주의",
          flatIndex: 26,
        },
        {
          id: "freeman_main",
          keyword: "모두에 책임",
          text: "주주, 종업원, 소비자, 지역사회 모두에 책임 있음",
          flatIndex: 27,
        },
      ],
    },

    // ── Center desk (c2b): 노동의 의미와 노동자의 권리 ──

    {
      id: "portrait_hegel",
      type: "portrait",
      x: 370,
      y: 360,
      keyword: "헤겔",
      label: "헤겔 초상화",
      noteId: "ch3_s1_c2b",
      parts: [
        {
          id: "hegel_branch_philosophy",
          keyword: "철학적 관점",
          text: "노동에 대한 철학적 관점",
          flatIndex: 28,
        },
        {
          id: "hegel_branch_name",
          keyword: "헤겔",
          text: "헤겔(Hegel)",
          flatIndex: 29,
        },
        {
          id: "hegel_left",
          keyword: "자기 외화",
          text: "노동 = 자기 외화(Entäußerung)",
          flatIndex: 30,
        },
        {
          id: "hegel_right",
          keyword: "자기 실현",
          text: "자연 변형을 통한 자기 실현",
          flatIndex: 31,
        },
      ],
    },
    {
      id: "notebook_alienation",
      type: "notebook",
      x: 470,
      y: 380,
      keyword: "소외",
      label: "소외된 노동 노트",
      noteId: "ch3_s1_c2b",
      parts: [
        {
          id: "alienation_branch_marx",
          keyword: "마르크스",
          text: "마르크스(Marx)",
          flatIndex: 32,
        },
        {
          id: "alienation_main",
          keyword: "소외된 노동",
          text: "자본주의 노동 = 소외된 노동(entfremdete Arbeit)",
          flatIndex: 33,
        },
        {
          id: "alienation_branch_4",
          keyword: "소외 4가지",
          text: "소외 4가지",
          flatIndex: 34,
        },
        {
          id: "alienation_product",
          keyword: "생산물",
          text: "노동 생산물로부터",
          flatIndex: 35,
        },
        {
          id: "alienation_process",
          keyword: "노동 과정",
          text: "노동 과정으로부터",
          flatIndex: 36,
        },
        {
          id: "alienation_species",
          keyword: "유적 본질",
          text: "유적 본질(Gattungswesen)로부터",
          flatIndex: 37,
        },
        {
          id: "alienation_others",
          keyword: "타인",
          text: "타인으로부터",
          flatIndex: 38,
        },
      ],
    },
    {
      id: "book_arendt",
      type: "book",
      x: 580,
      y: 360,
      keyword: "아렌트",
      label: "한나 아렌트 저서",
      noteId: "ch3_s1_c2b",
      parts: [
        {
          id: "arendt_branch_name",
          keyword: "아렌트",
          text: "아렌트(Hannah Arendt)",
          flatIndex: 39,
        },
        {
          id: "arendt_branch_3types",
          keyword: "3분류",
          text: "인간 활동 3분류",
          flatIndex: 40,
        },
        {
          id: "arendt_labor",
          keyword: "노동",
          text: "노동(labor): 생존을 위한 반복적 활동",
          flatIndex: 41,
        },
        {
          id: "arendt_work",
          keyword: "작업",
          text: "작업(work): 내구적 대상물의 제작",
          flatIndex: 42,
        },
        {
          id: "arendt_action",
          keyword: "행위",
          text: "행위(action): 공적 영역에서의 자유로운 활동",
          flatIndex: 43,
        },
        {
          id: "arendt_core",
          keyword: "행위 = 인간다움",
          text: "핵심: 인간다운 삶 = 행위에 있음",
          flatIndex: 44,
        },
      ],
    },
    {
      id: "lawbook_labor3",
      type: "lawbook",
      x: 370,
      y: 470,
      keyword: "노동3권",
      label: "노동 3권 법전",
      noteId: "ch3_s1_c2b",
      parts: [
        {
          id: "labor3_branch",
          keyword: "노동 3권",
          text: "노동 3권",
          flatIndex: 45,
        },
        {
          id: "labor3_union",
          keyword: "단결권",
          text: "단결권: 노동조합 결성",
          flatIndex: 46,
        },
        {
          id: "labor3_bargain",
          keyword: "단체 교섭권",
          text: "단체 교섭권: 사용자와 협상",
          flatIndex: 47,
        },
        {
          id: "labor3_action",
          keyword: "단체 행동권",
          text: "단체 행동권: 파업",
          flatIndex: 48,
        },
      ],
    },
    {
      id: "phone_modern",
      type: "phone",
      x: 500,
      y: 480,
      keyword: "현대쟁점",
      label: "현대 노동 쟁점 스마트폰",
      noteId: "ch3_s1_c2b",
      parts: [
        {
          id: "modern_branch",
          keyword: "현대 쟁점",
          text: "현대적 쟁점",
          flatIndex: 49,
        },
        {
          id: "modern_platform",
          keyword: "플랫폼 노동",
          text: "플랫폼 노동자(배달·택시)의 노동자성",
          flatIndex: 50,
        },
        {
          id: "modern_irregular",
          keyword: "비정규직",
          text: "비정규직 차별",
          flatIndex: 51,
        },
        {
          id: "modern_wage",
          keyword: "최저임금",
          text: "최저임금 논쟁",
          flatIndex: 52,
        },
        {
          id: "modern_4day",
          keyword: "주 4일제",
          text: "주 4일제 논의",
          flatIndex: 53,
        },
      ],
    },

    // ── East wall (c2c): 시장경제 윤리와 기업의 사회적 책임 ──

    {
      id: "portrait_smith",
      type: "portrait",
      x: 900,
      y: 120,
      keyword: "스미스",
      label: "애덤 스미스 초상화",
      noteId: "ch3_s1_c2c",
      parts: [
        {
          id: "smith_branch",
          keyword: "스미스",
          text: "애덤 스미스(Adam Smith)",
          flatIndex: 54,
        },
        {
          id: "smith_invisible",
          keyword: "보이지 않는 손",
          text: "'보이지 않는 손(invisible hand)': 개인 이익 추구 → 사회 전체 이익 증진",
          flatIndex: 55,
        },
        {
          id: "smith_moral",
          keyword: "도덕감정론",
          text: "'도덕감정론': 공감(sympathy)과 정의(justice)가 시장의 전제 조건임",
          flatIndex: 56,
        },
      ],
    },
    {
      id: "sign_marketfail",
      type: "sign",
      x: 880,
      y: 250,
      keyword: "시장실패",
      label: "시장 실패 표지판",
      noteId: "ch3_s1_c2c",
      parts: [
        {
          id: "marketfail_branch_limit",
          keyword: "윤리적 한계",
          text: "시장경제의 윤리적 한계",
          flatIndex: 57,
        },
        {
          id: "marketfail_branch_name",
          keyword: "시장 실패",
          text: "시장 실패(Market Failure)",
          flatIndex: 58,
        },
        {
          id: "marketfail_public",
          keyword: "공공재",
          text: "공공재",
          flatIndex: 59,
        },
        {
          id: "marketfail_external",
          keyword: "외부효과",
          text: "외부효과",
          flatIndex: 60,
        },
        {
          id: "marketfail_info",
          keyword: "정보 비대칭",
          text: "정보 비대칭",
          flatIndex: 61,
        },
        {
          id: "marketfail_monopoly",
          keyword: "독과점",
          text: "독과점",
          flatIndex: 62,
        },
      ],
    },
    {
      id: "chart_inequality",
      type: "chart",
      x: 1000,
      y: 250,
      keyword: "불평등",
      label: "소득 불평등 차트",
      noteId: "ch3_s1_c2c",
      parts: [
        {
          id: "inequality_main",
          keyword: "불평등",
          text: "소득 불평등: 출발선 불평등(상속, 교육 격차) → 결과적 불평등 심화",
          flatIndex: 63,
        },
      ],
    },
    {
      id: "globe_env",
      type: "globe",
      x: 1050,
      y: 150,
      keyword: "환경",
      label: "환경 파괴 지구본",
      noteId: "ch3_s1_c2c",
      parts: [
        {
          id: "env_main",
          keyword: "환경 파괴",
          text: "환경 파괴: 환경은 가격 미반영 외부효과 → 과도 소비됨",
          flatIndex: 64,
        },
      ],
    },
    {
      id: "poster_esg",
      type: "poster",
      x: 950,
      y: 360,
      keyword: "ESG",
      label: "ESG 경영 포스터",
      noteId: "ch3_s1_c2c",
      parts: [
        {
          id: "esg_branch",
          keyword: "최근 동향",
          text: "최근 동향",
          flatIndex: 65,
        },
        {
          id: "esg_main",
          keyword: "ESG",
          text: "ESG(환경·사회·거버넌스) 경영이 투자 기준으로 부상",
          flatIndex: 66,
        },
        {
          id: "esg_stakeholder",
          keyword: "이해관계자",
          text: "이해관계자 자본주의가 주주 자본주의를 대체하는 추세",
          flatIndex: 67,
        },
      ],
    },

    // ── South/door (c3): 청렴과 부패 방지 ──

    {
      id: "stone_integrity",
      type: "stone",
      x: 350,
      y: 540,
      keyword: "청렴",
      label: "청렴 비석",
      noteId: "ch3_s1_c3",
      parts: [
        {
          id: "integrity_main",
          keyword: "청렴",
          text: "청렴(廉): 공직자가 사적 이익 배제, 공공 이익 위해 직무 수행하는 것",
          flatIndex: 68,
        },
      ],
    },
    {
      id: "scroll_jeong",
      type: "scroll",
      x: 450,
      y: 530,
      keyword: "정약용",
      label: "정약용 목민심서 두루마리",
      noteId: "ch3_s1_c3",
      parts: [
        {
          id: "jeong_main",
          keyword: "목민심서",
          text: "정약용 '목민심서': 청렴 = 목민관의 본무(本務)",
          flatIndex: 69,
        },
      ],
    },
    {
      id: "shield_corruption",
      type: "shield",
      x: 560,
      y: 550,
      keyword: "부패유형",
      label: "부패 유형 방패",
      noteId: "ch3_s1_c3",
      parts: [
        {
          id: "corruption_branch",
          keyword: "부패 유형",
          text: "부패(Corruption) 유형",
          flatIndex: 70,
        },
        {
          id: "corruption_bribe",
          keyword: "뇌물",
          text: "뇌물 수수",
          flatIndex: 71,
        },
        {
          id: "corruption_embezzle",
          keyword: "횡령",
          text: "횡령",
          flatIndex: 72,
        },
        {
          id: "corruption_breach",
          keyword: "배임",
          text: "배임",
          flatIndex: 73,
        },
        {
          id: "corruption_interest",
          keyword: "이권 개입",
          text: "이권 개입",
          flatIndex: 74,
        },
      ],
    },
    {
      id: "sign_cause",
      type: "sign",
      x: 670,
      y: 530,
      keyword: "부패원인",
      label: "부패 원인 표지판",
      noteId: "ch3_s1_c3",
      parts: [
        {
          id: "cause_branch",
          keyword: "부패 원인",
          text: "부패 원인",
          flatIndex: 75,
        },
        {
          id: "cause_system",
          keyword: "제도적 허점",
          text: "제도적 허점",
          flatIndex: 76,
        },
        {
          id: "cause_culture",
          keyword: "관행적 부패",
          text: "관행적 부패 문화",
          flatIndex: 77,
        },
        {
          id: "cause_moral",
          keyword: "도덕적 해이",
          text: "공직자 도덕적 해이",
          flatIndex: 78,
        },
      ],
    },
    {
      id: "flag_prevention",
      type: "flag",
      x: 770,
      y: 540,
      keyword: "방지방안",
      label: "부패 방지 방안 깃발",
      noteId: "ch3_s1_c3",
      parts: [
        {
          id: "prevention_branch",
          keyword: "방지 방안",
          text: "부패 방지 방안",
          flatIndex: 79,
        },
        {
          id: "prevention_law",
          keyword: "반부패 법률",
          text: "반부패 법률 + 내부 고발자 보호",
          flatIndex: 80,
        },
        {
          id: "prevention_transparent",
          keyword: "투명 행정",
          text: "투명한 행정 시스템",
          flatIndex: 81,
        },
        {
          id: "prevention_citizen",
          keyword: "시민 감시",
          text: "시민 사회의 감시",
          flatIndex: 82,
        },
        {
          id: "prevention_education",
          keyword: "윤리 교육",
          text: "윤리 교육과 청렴 문화 확산",
          flatIndex: 83,
        },
      ],
    },
  ],

  walkPath: [
    // North wall (c1)
    "blackboard_job",
    "painting_mengzi",
    "scroll_xunzi",
    "book_calvin",
    "book_marx",
    // West wall (c2)
    "cert_professional",
    "painting_ethics3",
    "scale_public",
    "nameplate_friedman",
    "nameplate_freeman",
    // Center desk (c2b)
    "portrait_hegel",
    "notebook_alienation",
    "book_arendt",
    "lawbook_labor3",
    "phone_modern",
    // East wall (c2c)
    "portrait_smith",
    "sign_marketfail",
    "chart_inequality",
    "globe_env",
    "poster_esg",
    // South/door (c3)
    "stone_integrity",
    "scroll_jeong",
    "shield_corruption",
    "sign_cause",
    "flag_prevention",
  ],
};

/* ── 84개 단일-파트 오브젝트로 확장 ── */

// 각 noteId → 방 안 배치 영역
const ZONES: Record<string, { x: number; y: number; w: number; h: number }> = {
  ch3_s1_c1:  { x: 100, y: 30,  w: 680, h: 190 },  // North wall
  ch3_s1_c2:  { x: 20,  y: 220, w: 240, h: 290 },  // West wall
  ch3_s1_c2b: { x: 280, y: 340, w: 440, h: 240 },  // Center desk
  ch3_s1_c2c: { x: 840, y: 30,  w: 330, h: 350 },  // East wall
  ch3_s1_c3:  { x: 280, y: 530, w: 540, h: 150 },  // South/door
};

// 타입 순환 — 시각적 다양성 부여
const ALT_TYPES: ObjectType[] = [
  "scroll", "notebook", "certificate", "poster", "sign",
  "flag", "shield", "chart", "nameplate", "stone",
  "globe", "phone", "lawbook", "scale", "book", "painting",
];

export function expandToSinglePartObjects(compact: RoomSceneConfig): RoomSceneConfig {
  // 1) noteId별 파트 수집 (원본 순서 유지)
  const byZone = new Map<string, { part: typeof compact.objects[0]["parts"][0]; parentType: ObjectType; isFirst: boolean }[]>();
  for (const obj of compact.objects) {
    const list = byZone.get(obj.noteId) ?? [];
    for (let i = 0; i < obj.parts.length; i++) {
      list.push({ part: obj.parts[i], parentType: obj.type, isFirst: i === 0 });
    }
    byZone.set(obj.noteId, list);
  }

  // 2) 존 내 그리드 배치
  const expanded: SceneObject[] = [];
  let altIdx = 0;

  for (const [noteId, entries] of byZone) {
    const zone = ZONES[noteId];
    if (!zone) continue;

    const count = entries.length;
    const cols = Math.ceil(Math.sqrt(count * (zone.w / zone.h)));
    const rows = Math.ceil(count / cols);
    const cellW = zone.w / cols;
    const cellH = zone.h / rows;

    entries.forEach((entry, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = Math.round(zone.x + cellW * col + cellW / 2);
      const y = Math.round(zone.y + cellH * row + cellH / 2);
      const type = entry.isFirst ? entry.parentType : ALT_TYPES[altIdx++ % ALT_TYPES.length];

      expanded.push({
        id: entry.part.id,
        type,
        x, y,
        keyword: entry.part.keyword,
        label: entry.part.keyword,
        noteId,
        scale: 0.5,
        parts: [entry.part],
      });
    });
  }

  // flatIndex 순 정렬
  expanded.sort((a, b) => a.parts[0].flatIndex - b.parts[0].flatIndex);

  return {
    ...compact,
    objects: expanded,
    walkPath: expanded.map((o) => o.id),
  };
}
