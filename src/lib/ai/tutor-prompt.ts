export const TUTOR_SYSTEM_PROMPT = `당신은 AI 튜터입니다. Guided Learning 방식으로 학생이 개념을 이해하도록 안내합니다.

## 핵심 원칙 — 개인 과외 선생님

ChatGPT는 긴 답변을 한 번에 쏟아내고 "더 알려드릴까요?"라고 묻습니다. 우리는 다릅니다.

1. **한 턴에 대략 10줄 이내.** 개념 하나를 설명하고 다음 가이드 질문으로 넘깁니다.
2. **질문 → 학생 답 → 명명·설명·배경(~10줄) → 가이드 질문.** 이 리듬을 반복합니다.
3. **학생이 모르면 바로 알려줍니다.** "잘 모르겠어요" → "방법은 이렇습니다." 힌트를 반복하며 괴롭히지 않습니다.
4. **"더 알려드릴까요?" 절대 금지.** 대신 "이것은 어떻게 ~할 수 있을까요?", "이것의 특징은 무엇일까요?" 로 다음 사고를 안내합니다.
5. 항상 한국어 존댓말, 격려를 아끼지 않습니다.
6. 요약은 **학생이 요약 정리 버튼을 누를 때만** 제공합니다. 대화 중에는 구조화된 긴 요약을 하지 않습니다.

## AI 응답의 구조 (매 턴 ~10줄)

[명명] "그것을 ~라고 부릅니다. ~의 약자입니다."
[배경] "~는 누가 언제 만든 것으로, ~에 쓰이고 있어요."
[설명] 핵심 원리나 작동 방식을 2~4문장으로 설명
[실전] 필요시 명령어, 코드, 구체적 예시 1~2줄
[가이드 질문] "그러면 이것은 어떻게 ~할까요?" / "이것의 특징은 무엇일까요?"

**절대 하지 않는 것:**
- 한 턴에 20줄 이상의 긴 설명
- "더 궁금한 점이 있으신가요?", "더 알려드릴까요?" 같은 수동적 마무리
- 대화 중에 표나 목록으로 10개 항목을 한 번에 나열 (요약 버튼 전용)
- 한 턴에 2개 이상의 새로운 개념을 동시에 설명

## 예시 대화 — MCP 단원

**AI**: "AI가 아무리 똑똒해도 혼자서는 데이터베이스를 조회하거나 브라우저를 열 수 없어요. 어떤 것이 있어야 가능할까요?"

**학생**: "뭔가 연결해주는 게 필요하지 않을까요?"

**AI**: "맞습니다! 바로 그 '연결해주는 것'을 **MCP**라고 부릅니다. **Model Context Protocol**의 약자예요.

Anthropic이 2024년 말에 공개한 오픈 표준 프로토콜인데요, 쉽게 말하면 AI에게 '손과 발'을 달아주는 규격이에요. AI가 직접 할 수 없는 일(DB 조회, 브라우저 열기, 파일 읽기 등)을 MCP 서버라는 중간 다리를 통해 실행할 수 있게 해줍니다.

이것은 어떻게 AI가 데이터베이스에 연결할 수 있게 해줄까요?"

**학생**: "잘 모르겠습니다."

**AI**: "방법은 이렇습니다. MCP는 AI와 외부 도구 사이에 '서버'를 하나 두는 구조예요.

예를 들어 Supabase MCP 서버가 있으면, AI가 '유저 테이블 조회해줘'라고 요청하면 MCP 서버가 그 요청을 받아서 실제 Supabase DB에 SQL을 실행하고 결과를 AI에게 돌려줍니다. AI → MCP 서버 → 외부 도구, 이 흐름이에요.

Claude Code에서 설치는 한 줄입니다: \`claude mcp add supabase -- npx -y @anthropic/mcp-supabase\`

그러면 DB 말고 또 어떤 외부 도구를 MCP로 연결할 수 있을까요?"

**학생**: "브라우저요?"

**AI**: "정확해요! 브라우저를 조작하는 MCP 서버를 **Playwright MCP**라고 합니다. Playwright는 Microsoft가 만든 브라우저 자동화 도구인데, MCP 서버로 연결하면 AI가 직접 웹페이지를 열고, 클릭하고, 스크린샷을 찍을 수 있어요.

테스트할 때 정말 강력한데요, AI에게 '로그인 페이지 열어서 버튼 눌러봐'라고 하면 실제로 브라우저를 열어서 실행하고 결과를 보고해줍니다.

그런데 아무 MCP 서버나 무조건 연결하면 위험할 수도 있는데, 어떤 보안 문제가 있을까요?"

이런 리듬으로 **학생이 한 걸음 걸을 때마다 이름을 붙여주고, 배경을 알려주고, 다음 걸음을 안내**합니다.

## 힌트 레벨 시스템
- **Lv1 (방향 제시)**: 넓은 질문으로 생각 유도
- **Lv2 (설명 + 확인)**: 개념을 직접 설명하고 이해 여부 확인
- **Lv3 (실전 안내)**: 명령어, 코드, 단계별 절차를 구체적으로 제공

## 커리큘럼 주도 — 개념 체크리스트

당신에게는 이 단원에서 가르쳐야 할 **핵심 개념 목록(concepts)**이 주어집니다. 이것은 당신의 수업 체크리스트입니다.

### 수업 진행 흐름
1. 개념 목록의 **첫 번째 개념**부터 순서대로 가르칩니다.
2. 각 개념을 2~3턴으로 가르칩니다 (질문 → 설명 → 확인).
3. 개념 이해가 확인되면 **[CONCEPT_DONE]** 마커 + 짧은 중간 요약(2~3줄) → 다음 개념으로 전환.
4. **모든 개념을 다 가르치면** 단원 완료 안내를 합니다.

### 단원 완료 시 (모든 개념 [CONCEPT_DONE] 후)
반드시 다음 형식으로 마무리합니다:

"이번 단원 **[단원명]**에서 공부할 내용을 모두 살펴봤습니다! 🎉

📋 **이번 단원 핵심 정리**
- ✅ 개념A: 한 줄 요약
- ✅ 개념B: 한 줄 요약
- ✅ 개념C: 한 줄 요약
...

이번 주제에 대해 더 궁금한 점이 있으신가요? 없으시면 왼쪽 사이드바에서 다음에 배우고 싶은 단원을 선택해주세요!"

### 주제 이탈 대응
- **관련 질문** (현재 개념과 연결되는 질문) → 정확하고 충분하게 답변한 후, "자, 다시 돌아와서 [현재 개념]을 계속 알아볼게요."로 원래 주제로 복귀합니다.
- **무관 질문** (현재 단원과 상관없는 질문) → 짧게 핵심만 답변(2~3줄)한 후, "다시 돌아와서 [현재 개념]을 마저 알아볼까요?"로 복귀합니다.
- 어떤 경우든 **반드시 원래 진행 중이던 개념으로 돌아옵니다.** 학생의 질문을 따라가서 주제가 표류하지 않도록 하세요.

### 중간 요약 — 개념 전환 시마다
하나의 개념이 끝나면:

> [CONCEPT_DONE: MCP 아키텍처]
>
> 📌 **정리하면**, MCP는 AI와 외부 도구를 연결하는 표준 프로토콜이에요.
>
> 좋아요! 다음으로 **실전 MCP 서버 종류**에 대해 알아볼게요. Supabase, Playwright 말고 어떤 MCP 서버가 있을 것 같아요?

- 2~3줄로 짧게. 표나 긴 목록은 요약 정리 버튼 전용.
- "다음으로 ~에 대해 알아볼게요"로 명시적 전환.

## 행동 규칙
- **질문만 반복하지 마세요.** 학생이 답하면 반드시 개념을 가르치고 다음으로 넘어갑니다.
- 학생이 "모르겠어요"라고 하면 바로 설명해줍니다.
- 하나의 개념에서 3턴 이상 머물지 않습니다. 2~3턴 후 중간 요약 → 다음 개념.
- 실전 명령어, 코드, 설정 파일 예시를 적극 포함합니다.
- 바이브코딩 교과에서는 웹 검색 도구를 적극 활용하세요.
- 자유 질문으로 시작한 경우, 관련 개념을 파악하여 Guided Learning을 시작합니다.

## 개념 완료 마커 (필수)
- 학생이 개념을 이해했다고 판단할 때, 마이크로 요약 **직전에** 다음 마커를 삽입하세요:
  [CONCEPT_DONE: 개념명]
- 예: [CONCEPT_DONE: MCP 아키텍처]
- 마커는 한 줄에 단독으로 작성하세요.

## 웹 검색 도구 활용 (RAG)
당신에게는 searchWeb 도구가 있습니다. 다음 상황에서 **반드시** 사용하세요:

### 검색해야 하는 경우
1. **최신 시사/뉴스 주제**: 2025년 이후 사건, 기술 동향, 시장 변화 등
2. **학생이 새로운 정보를 제시할 때**: 확인이 필요한 사실적 주장 (예: "최근 미국이 이란과...")
3. **내 지식이 불확실할 때**: 구체적 수치, 날짜, 최신 연구 결과 등
4. **"시사 · 최신 주제" 교과를 선택한 경우**: 수업 시작 전 반드시 검색하여 배경 지식 확보

### 검색하지 않아도 되는 경우
- 교과서 수준의 확립된 지식 (세포분열, 삼각함수, 문법 등)
- 이미 검색한 내용에 대한 후속 질문

### 검색 결과 활용 규칙
1. 검색 결과를 **그대로 전달하지 마세요**. 소크라테스식 질문으로 변환하세요.
2. 출처가 있는 사실을 언급할 때는 간단히 출처를 밝히세요: "최근 보도에 따르면..."
3. 검색 결과와 학생의 답변이 다르면, "흥미로운 시각이네요. 그런데 최근 자료를 보면 ~라는 관점도 있는데, 어떻게 생각하세요?" 식으로 대화하세요.
4. 검색 결과에서 핵심 개념을 추출하여 학습 구조를 만드세요.

## 교과 정보
학생이 선택한 교과와 단원에 맞는 내용만 다룹니다.
"시사 · 최신 주제" 교과의 경우 학생이 제시한 주제에 맞게 자유롭게 학습을 진행합니다.
`;

export interface Topic {
  name: string;
  concepts: string[];
  opener: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  topics: Topic[];
}

export const SUBJECTS: Subject[] = [
  {
    id: "korean",
    name: "국어 — 언어와 매체",
    icon: "📝",
    topics: [
      {
        name: "음운 체계와 변동",
        concepts: ["자음/모음 체계", "음운 변동 규칙(동화, 탈락, 축약, 첨가)", "표준 발음법"],
        opener: "우리가 '같이'를 발음할 때 [가치]로 발음하죠? 왜 글자와 소리가 다를까요? 혹시 이런 현상이 왜 일어나는지 생각해본 적 있나요?",
      },
      {
        name: "단어의 형성과 의미",
        concepts: ["형태소", "단어 형성법(합성어, 파생어)", "어휘 의미 관계(유의어, 반의어, 다의어)"],
        opener: "'풋사과'라는 단어를 들어본 적 있죠? 이 단어가 '풋'과 '사과' 두 부분으로 나뉜다는 걸 알고 있나요? 그러면 '풋'은 어떤 의미를 더해줄까요?",
      },
      {
        name: "문장의 구조",
        concepts: ["문장 성분(주어, 서술어, 목적어, 보어, 부사어, 관형어)", "홑문장과 겹문장", "안은문장과 이어진문장"],
        opener: "'비가 와서 우산을 가져왔다'와 '비가 오는 날은 좋다' — 이 두 문장은 구조적으로 어떻게 다를까요? 한번 나눠서 생각해볼까요?",
      },
      {
        name: "매체 언어의 특성",
        concepts: ["매체별 특성(인쇄, 영상, 디지털)", "복합 양식 텍스트", "매체 리터러시"],
        opener: "유튜브 영상과 신문 기사는 같은 사건을 전달해도 느낌이 다르죠? 각각 어떤 요소들이 메시지를 전달하는 데 사용될까요?",
      },
      {
        name: "담화와 의사소통",
        concepts: ["담화의 구성요소", "발화의 의미(직접/간접 발화)", "맥락과 의사소통 전략"],
        opener: "친구가 '여기 좀 춥지 않아?'라고 말하면 정말 온도를 묻는 걸까요, 아니면 다른 뜻이 있을까요? 이런 경우를 뭐라고 부르는지 알고 있나요?",
      },
    ],
  },
  {
    id: "ethics",
    name: "사회 — 생활과 윤리",
    icon: "⚖️",
    topics: [
      {
        name: "생명윤리와 의료윤리",
        concepts: ["생명의 존엄성", "안락사 찬반", "장기 이식 윤리", "유전자 편집 윤리"],
        opener: "만약 불치병에 걸린 환자가 '더 이상 고통받고 싶지 않다'고 한다면, 의사는 그 요청을 들어줘야 할까요? 생명의 존엄성과 개인의 자유 중 무엇이 더 중요하다고 생각하나요?",
      },
      {
        name: "사회윤리와 정의",
        concepts: ["분배적 정의", "공정과 평등의 차이", "롤스의 정의론", "공리주의 vs 의무론"],
        opener: "10명이 나눠 먹을 피자가 한 판이 있는데, 한 명은 아침부터 아무것도 못 먹었어요. 모두에게 똑같이 나눌까요, 아니면 굶은 사람에게 더 줄까요? 이 선택의 차이에는 어떤 윤리적 관점이 있을까요?",
      },
      {
        name: "과학기술 윤리",
        concepts: ["AI 윤리", "자율주행 트롤리 문제", "빅데이터와 프라이버시", "기술 발전의 책임"],
        opener: "자율주행 자동차가 사고를 피할 수 없는 상황에서 보행자 5명과 탑승자 1명 중 누구를 보호해야 할까요? 이 유명한 '트롤리 문제'에 대해 어떻게 생각하나요?",
      },
      {
        name: "환경윤리와 지속가능성",
        concepts: ["인간중심주의 vs 생태중심주의", "기후변화 윤리", "미래세대 책임", "탄소 발자국"],
        opener: "우리가 오늘 편하게 쓰는 에너지 때문에 50년 후 사람들이 고통받을 수 있다면, 지금 우리에게 어떤 책임이 있을까요? 아직 태어나지 않은 사람에게도 권리가 있다고 할 수 있을까요?",
      },
      {
        name: "정보사회와 직업윤리",
        concepts: ["정보 격차", "저작권과 표절", "내부 고발 윤리", "직업적 양심"],
        opener: "회사에서 상사가 불법적인 일을 하고 있다는 걸 알게 됐어요. 신고하면 나한테 불이익이 올 수도 있는데, 어떻게 해야 할까요? 이것을 윤리적으로 어떻게 판단할 수 있을까요?",
      },
    ],
  },
  {
    id: "biology",
    name: "과학 — 생명과학 I",
    icon: "🧬",
    topics: [
      {
        name: "세포의 구조와 기능",
        concepts: ["세포막", "핵과 소기관", "원핵세포 vs 진핵세포", "세포 소기관의 역할"],
        opener: "세포를 하나의 도시에 비유해볼까요? 도시에는 시청, 발전소, 공장, 도로가 있죠. 세포 안에도 비슷한 역할을 하는 것들이 있는데, 혹시 아는 게 있나요?",
      },
      {
        name: "세포분열과 세포주기",
        concepts: ["체세포분열", "감수분열", "DNA 복제", "세포주기(G1-S-G2-M)"],
        opener: "우리 몸의 세포는 약 37조 개인데, 처음에는 하나의 세포(수정란)에서 시작했어요. 이 하나의 세포가 어떻게 37조 개가 될 수 있었을까요?",
      },
      {
        name: "유전의 원리",
        concepts: ["멘델의 유전법칙", "우성과 열성", "유전자형과 표현형", "독립의 법칙"],
        opener: "부모님 두 분 다 쌍꺼풀이 있는데 자녀에게 쌍꺼풀이 없을 수 있을까요? 어떻게 그런 일이 가능한지 생각해본 적 있나요?",
      },
      {
        name: "사람의 유전",
        concepts: ["ABO 혈액형", "성염색체와 반성유전", "가계도 분석", "유전병"],
        opener: "ABO 혈액형에서 A형 부모와 B형 부모 사이에서 O형 아이가 태어날 수 있을까요? 가능하다면 그 이유가 무엇일지 생각해볼까요?",
      },
      {
        name: "생태계와 상호작용",
        concepts: ["먹이사슬과 먹이그물", "생태 피라미드", "개체군과 군집", "물질 순환과 에너지 흐름"],
        opener: "늑대가 사라진 옐로스톤 국립공원에서 강의 흐름이 바뀌었다는 이야기를 들어본 적 있나요? 동물 하나가 사라지는 것이 어떻게 강의 흐름까지 바꿀 수 있을까요?",
      },
    ],
  },
  {
    id: "math",
    name: "수학 — 수학 I",
    icon: "📐",
    topics: [
      {
        name: "지수함수와 로그함수",
        concepts: ["지수법칙", "지수함수의 그래프", "로그의 정의와 성질", "로그함수의 그래프"],
        opener: "종이를 반으로 접으면 두께가 2배가 되죠? 42번 접으면 지구에서 달까지 닿는다고 해요. 이게 정말 가능할까요? 한번 계산해볼까요?",
      },
      {
        name: "삼각함수",
        concepts: ["호도법", "삼각함수의 정의(sin, cos, tan)", "삼각함수의 그래프", "삼각함수의 활용"],
        opener: "관람차를 타면 높이가 올라갔다 내려갔다를 반복하죠? 이 높이의 변화를 수학적으로 표현할 수 있을까요? 어떤 함수의 그래프와 비슷할까요?",
      },
      {
        name: "수열",
        concepts: ["등차수열", "등비수열", "수열의 합(시그마)", "수학적 귀납법"],
        opener: "1, 3, 5, 7, ... 이 수들의 규칙을 알겠죠? 그러면 이 수들을 1번째부터 100번째까지 전부 더하면 얼마일까요? 가우스는 이 문제를 몇 초 만에 풀었다는데, 어떻게 했을까요?",
      },
      {
        name: "수열의 극한",
        concepts: ["수열의 수렴과 발산", "무한급수", "등비급수의 합", "극한의 성질"],
        opener: "1/2 + 1/4 + 1/8 + 1/16 + ... 이렇게 계속 더하면 결국 어디에 도달할까요? 무한히 더하는데 값이 무한대가 아니라 특정한 수에 도달한다는 게 직관적으로 이해가 되나요?",
      },
    ],
  },
  {
    id: "english",
    name: "영어 — 영어 I",
    icon: "🌍",
    topics: [
      {
        name: "Reading Comprehension",
        concepts: ["main idea 파악", "supporting details", "inference", "글의 구조(cause-effect, compare-contrast)"],
        opener: "영어 지문을 읽을 때 가장 먼저 찾아야 하는 것은 뭘까요? 모든 문장을 다 읽기 전에 글의 핵심을 빠르게 파악하는 방법이 있는데, 혹시 알고 있나요?",
      },
      {
        name: "Grammar & Sentence Structure",
        concepts: ["시제(현재완료, 과거완료)", "관계대명사", "분사구문", "가정법"],
        opener: "'I have lived in Seoul for 10 years'와 'I lived in Seoul for 10 years' — 이 두 문장의 뜻이 어떻게 다를까요? 작은 차이인 것 같지만 의미가 꽤 달라지거든요.",
      },
      {
        name: "Vocabulary in Context",
        concepts: ["문맥 추론", "접두사/접미사", "동의어/반의어", "콜로케이션"],
        opener: "'un-', 're-', 'dis-' 같은 접두사를 알면 모르는 단어도 뜻을 추측할 수 있어요. 예를 들어 'unprecedented'라는 단어를 분해하면 뜻을 알 수 있는데, 한번 시도해볼까요?",
      },
      {
        name: "Writing & Essay",
        concepts: ["에세이 구조(서론-본론-결론)", "thesis statement", "supporting evidence", "transitions"],
        opener: "좋은 영어 에세이는 항상 첫 문단에 '이 글의 핵심 주장'이 들어가요. 이것을 thesis statement라고 하는데, 예를 들어 '학교 교복은 폐지해야 한다'는 주제로 thesis를 어떻게 쓸 수 있을까요?",
      },
    ],
  },
  {
    id: "vibe-coding",
    name: "바이브코딩",
    icon: "🎧",
    topics: [
      // ── 초급: 개념과 도구 ──
      {
        name: "바이브코딩 입문 — 패러다임의 전환",
        concepts: ["Andrej Karpathy의 바이브코딩 정의와 배경", "전통 코딩 vs 바이브코딩 — 타이핑에서 오케스트레이션으로", "Investor Hat · Architect Hat · Vibe Coder Hat 역할 분리", "바이브코딩의 한계 — 언제 직접 코드를 봐야 하는가", "Collins Dictionary 올해의 단어 — 문화적 의미"],
        opener: "Andrej Karpathy는 '코드를 보지 않고 분위기(vibe)로 코딩한다'고 했어요. 그런데 코드를 보지 않는다는 게 정말 가능할까요? AI가 코드를 짜면 인간은 뭘 해야 할까요?",
      },
      {
        name: "도구 생태계 총정리",
        concepts: ["CLI 기반 — Claude Code, OpenAI Codex CLI, Gemini CLI, Aider", "IDE 통합 — Cursor, Windsurf(Codeium), GitHub Copilot, Cline", "노코드/로코드 — Bolt.new, Lovable, Replit Agent, v0.dev", "Google Antigravity(Project Mariner) — 브라우저 기반 AI 자동화", "모바일/크로스플랫폼 — Flutter 바이브코딩, React Native + AI", "프로젝트 규모·성격별 도구 조합 전략", "비용 구조 비교 — 토큰 과금 vs 구독제 vs 무료 티어"],
        opener: "Claude Code, Cursor, Bolt, Lovable, Codex, Windsurf, Antigravity — 도구가 10개가 넘어요. CLI에서 코딩하는 것과 GUI에서 클릭하는 것, 브라우저에서 자동화하는 것은 근본적으로 어떤 차이가 있을까요?",
      },
      {
        name: "Git · GitHub 필수 — 바이브코딩의 안전망",
        concepts: ["Git 기초 — commit, branch, merge, rebase의 핵심", "GitHub Flow — 브랜치 전략과 PR 기반 워크플로우", "Conventional Commits — AI가 읽기 좋은 커밋 메시지 작성법", "AI 에이전트와 Git — 자동 커밋, 자동 브랜치, 워크트리 격리", ".gitignore와 보안 — .env, 자격증명 파일 보호", "GitHub Actions CI/CD — 자동 빌드·테스트·배포 파이프라인"],
        opener: "바이브코딩을 하다가 AI가 파일 100개를 한꺼번에 수정했는데 앱이 망가졌어요. 이전 상태로 돌아가려면 어떻게 해야 할까요? Git을 모르면 바이브코딩이 위험한 이유가 바로 여기에 있어요.",
      },
      // ── 중급: 하네스 엔지니어링 ──
      {
        name: "하네스 엔지니어링 — AI를 제어하는 핵심 구조",
        concepts: ["CLAUDE.md — 프로젝트 규칙과 행동 제약의 설계", ".cursorrules / .windsurfrules — IDE 도구별 규칙 파일", "Hooks 시스템 — PreToolUse, PostToolUse, Stop 자동화", "Memory 시스템 — 대화 간 컨텍스트 유지와 자동 기억", "컨텍스트 윈도우 관리 — 1M 토큰을 효율적으로 쓰는 법", "settings.json — 권한 모드, 모델 선택, 환경 설정"],
        opener: "AI에게 '좋은 웹사이트 만들어줘'라고 하면 매번 다른 결과가 나오죠. 그런데 CLAUDE.md 파일 하나를 잘 작성하면 AI가 항상 일관된 품질을 만들어요. 이 파일이 왜 그렇게 강력한지 생각해본 적 있나요?",
      },
      {
        name: "Skills · Rules · Slash Commands 설계",
        concepts: ["Claude Code Skills(.claude/skills/) — 슬래시 커맨드 재사용 레시피", "Cursor Rules(.cursor/rules/) — 프로젝트별 코딩 컨벤션 자동 강제", "Custom Instructions 계층 — 글로벌 > 프로젝트 > 세션", "Slash Commands — /commit, /review, /simplify + 커스텀 명령", "토큰 절약을 위한 규칙 최적화 — 반복 프롬프트 제거"],
        opener: "같은 프로젝트에서 매번 'Tailwind CSS를 써줘', 'TypeScript strict 모드로 해줘'라고 반복하면 비효율적이죠. 이걸 한 번만 설정하고 자동 적용되게 하는 방법이 있는데, 어떤 구조일까요?",
      },
      {
        name: "프롬프트 엔지니어링 실전",
        concepts: ["구조화된 프롬프트 — 역할·맥락·제약·출력 형식 명시", "Chain of Thought(CoT) 유도 — AI 사고 과정을 이끄는 기법", "Few-shot vs Zero-shot 전략", "멀티턴 대화 설계 — 한 번에 다 시키기 vs 단계적 지시", "네거티브 프롬프팅 — '하지 말아야 할 것' 명시", "프롬프트 디버깅 — 원하는 결과가 안 나올 때 진단하는 법"],
        opener: "'로그인 기능 만들어줘'와 'Next.js App Router에서 Supabase Auth로 Google OAuth를 구현해줘. 미들웨어로 세션 관리하고 /dashboard로 리다이렉트' — 이 두 프롬프트의 결과 차이가 얼마나 클까요?",
      },
      // ── 중상급: 에이전틱 엔지니어링 ──
      {
        name: "에이전틱 엔지니어링 — 다중 에이전트 시스템",
        concepts: ["서브 에이전트 패턴 — 역할 분리(Architect, Implementer, Reviewer, Debugger)", "Claude Code Agent SDK — /v1/agents, /v1/sessions API", "도구 접근 제한으로 역할 경계 강제 — 화이트리스트 패턴", "에이전트 간 핸드오프와 오케스트레이션", "Worktree 격리 — 에이전트별 독립 Git 작업 공간", "병렬 에이전트 실행 — 독립 작업 동시 처리로 속도 극대화"],
        opener: "한 명의 AI에게 '설계도 하고, 코딩도 하고, 테스트도 해줘'라고 하면 어떤 문제가 생길까요? 사람도 혼자 다 하면 실수가 늘듯이, AI도 마찬가지예요. 그러면 어떻게 해야 할까요?",
      },
      {
        name: "MCP(Model Context Protocol) 심화",
        concepts: ["MCP 아키텍처 — Transport, Tools, Resources, Prompts", "실전 MCP 서버 — Supabase, Playwright, Context7, Vercel, Firebase", "나만의 MCP 서버 만들기 — TypeScript SDK 활용", "MCP 마켓플레이스 — Smithery, Glama", "Middleware 패턴 — MCP 요청 전후처리 파이프라인", "보안 — MCP 서버 권한 관리와 샌드박싱"],
        opener: "AI가 아무리 똑똑해도 DB에 직접 접근하거나 브라우저를 조작할 수는 없죠. 그런데 MCP라는 프로토콜을 쓰면 AI에게 손과 발이 생겨요. 어떤 원리일까요?",
      },
      // ── 고급: AI 프레임워크와 인프라 ──
      {
        name: "LangChain · LangGraph · LangSmith — AI 앱 프레임워크",
        concepts: ["LangChain — LLM 호출 체이닝과 도구 통합 프레임워크", "LangGraph — 상태 기반 멀티 에이전트 그래프 설계", "LangSmith — LLM 앱 추적·평가·디버깅 플랫폼", "LangChain vs Vercel AI SDK vs 직접 구현 — 선택 기준", "RAG(Retrieval-Augmented Generation) 파이프라인 구축", "벡터 DB — Pinecone, Weaviate, Supabase pgvector 연동"],
        opener: "AI 앱을 만들 때 API 직접 호출과 LangChain 같은 프레임워크의 차이가 뭘까요? 단순 챗봇이면 직접 호출로 충분한데, 복잡한 에이전트는 왜 프레임워크가 필요할까요?",
      },
      {
        name: "Vercel AI SDK · Next.js — 풀스택 AI 앱 아키텍처",
        concepts: ["Vercel AI SDK — streamText, useChat, useCompletion", "Middleware — Next.js 미들웨어로 인증·라우팅·AI 요청 제어", "Server Actions과 AI 스트리밍 통합", "Edge Runtime vs Node.js Runtime — AI 앱의 선택", "AI SDK Tool Use — 함수 호출과 멀티스텝 에이전트", "프롬프트 캐싱과 비용 최적화", "Vercel 배포 — 서버리스 함수 타임아웃, 환경변수 관리"],
        opener: "AI 챗봇 응답이 한 글자씩 나타나는 스트리밍을 직접 구현하려면 SSE, 청크 파싱 등 복잡한 작업이 필요해요. Vercel AI SDK를 쓰면 몇 줄로 끝나는데, 어떻게 가능한 걸까요?",
      },
      {
        name: "Flutter 바이브코딩 — 크로스플랫폼 AI 앱",
        concepts: ["Flutter + Cursor/Claude Code로 Dart 코드 생성", "flutter_ai_toolkit — Google AI 통합 위젯", "플랫폼 네이티브 기능 — 백그라운드 오디오, 카메라, 푸시 알림", "Supabase Flutter SDK — 인증·DB·스토리지", "상태 관리 — Riverpod, BLoC 패턴과 AI 생성 코드", "웹(Next.js) vs 네이티브(Flutter) — 프로젝트별 선택 기준"],
        opener: "웹 앱은 브라우저 안에서 돌지만, Flutter 앱은 네이티브라서 백그라운드 오디오 같은 기능이 가능해요. 바이브코딩으로 Flutter 앱을 만들 때 웹과 가장 크게 다른 점이 뭘까요?",
      },
      // ── 고급: 인프라·백엔드·테스팅·UI ──
      {
        name: "Docker · 컨테이너 — 개발 환경의 표준화",
        concepts: ["Docker 핵심 개념 — 이미지, 컨테이너, Dockerfile, 레이어", "Docker Compose — 멀티 컨테이너 로컬 개발 환경 구성", "Dev Containers — VS Code/Cursor에서 컨테이너 기반 개발", "Supabase 로컬 개발 — supabase start로 Docker 기반 로컬 DB·Auth", "CI/CD에서 Docker — GitHub Actions + Docker 빌드 자동화", "Docker vs 서버리스 — 언제 컨테이너가 필요하고 언제 불필요한가"],
        opener: "'내 컴퓨터에서는 되는데 서버에서 안 돼요' — 이 문제를 한 번에 해결하는 기술이 Docker예요. 근데 바이브코딩할 때 Docker가 왜 중요할까요? Supabase 로컬 개발은 사실 Docker 위에서 돌아가거든요.",
      },
      {
        name: "Supabase 완전 정복 — BaaS로 백엔드 없이 풀스택",
        concepts: ["Supabase 아키텍처 — PostgreSQL + GoTrue + PostgREST + Realtime + Storage", "Auth — 소셜 로그인(Google, GitHub, Kakao), JWT, 세션 관리", "RLS(Row Level Security) — 데이터베이스 수준 접근 제어", "Edge Functions — Deno 기반 서버리스 함수", "Realtime — 실시간 구독과 Broadcast", "Storage — 파일 업로드·변환·CDN", "마이그레이션 — supabase db diff, 스키마 버전 관리", "Supabase vs Firebase vs Appwrite vs Convex — BaaS 비교"],
        opener: "백엔드 서버를 직접 만들지 않고도 인증, DB, 파일 저장, 실시간 통신까지 다 할 수 있다면? Supabase가 바로 그거예요. 그런데 RLS라는 걸 설정 안 하면 큰일 나는데, 왜 그럴까요?",
      },
      {
        name: "데이터베이스 설계 · ORM · 마이그레이션",
        concepts: ["PostgreSQL 기초 — 테이블, 관계, 인덱스, 제약조건", "스키마 설계 원칙 — 정규화, 비정규화의 트레이드오프", "ORM 선택 — Prisma vs Drizzle vs Supabase JS Client", "마이그레이션 전략 — Prisma Migrate, Drizzle Kit, Supabase CLI", "벡터 DB — pgvector로 AI 임베딩 저장과 유사도 검색", "AI에게 스키마 설계 시키기 — 효과적인 프롬프트와 검증법"],
        opener: "AI에게 '유저 테이블 만들어줘'라고 하면 만들어주긴 하는데, 인덱스도 없고 관계도 엉성할 수 있어요. 좋은 DB 스키마와 나쁜 스키마의 차이가 뭔지, AI에게 어떻게 시켜야 좋은 설계가 나올까요?",
      },
      {
        name: "인증 · 보안 · 환경변수 관리",
        concepts: ["OAuth 2.0 / OIDC — Google, GitHub, Kakao 소셜 로그인 원리", "JWT와 세션 — 토큰 기반 vs 쿠키 기반 인증", "Next.js Middleware — 인증 가드, 라우트 보호, 세션 갱신", "환경변수 — .env, .env.local, Vercel 환경변수, 시크릿 관리", "OWASP Top 10 — XSS, CSRF, SQL Injection 방어", "API 키 보호 — 서버 사이드 전용 키 vs 클라이언트 공개 키", "바이브코딩에서의 보안 실수 — AI가 만드는 흔한 취약점"],
        opener: "바이브코딩으로 만든 앱에서 가장 흔한 보안 실수가 뭘까요? AI가 코드를 짤 때 .env 파일을 깜빡 커밋하거나, API 키를 클라이언트에 노출하는 일이 실제로 많아요. 어떻게 방지할까요?",
      },
      {
        name: "테스팅 — Playwright · Vitest · AI 테스트 전략",
        concepts: ["테스트 피라미드 — Unit, Integration, E2E의 비율과 전략", "Vitest — 빠른 단위 테스트와 컴포넌트 테스트", "Playwright — 브라우저 E2E 테스트 자동화", "MCP로 Playwright 연동 — AI가 직접 브라우저를 조작해서 테스트", "테스트 주도 바이브코딩(TDVC) — AI에게 테스트 먼저 작성시키기", "스냅샷 테스트와 시각적 회귀 테스트"],
        opener: "AI가 만든 코드가 맞는지 어떻게 확인하죠? '돌아가니까 됐다'가 아니라 체계적으로 검증하는 방법이 있어요. 특히 AI에게 테스트를 먼저 짜게 하면 코드 품질이 확 올라가는데, 왜 그럴까요?",
      },
      {
        name: "UI/UX 프레임워크 — Tailwind · Shadcn · Framer Motion",
        concepts: ["Tailwind CSS — 유틸리티 퍼스트 CSS와 디자인 토큰", "Shadcn/ui — 복사해서 커스텀하는 컴포넌트 라이브러리", "Framer Motion — React 애니메이션과 마이크로 인터랙션", "글래스모피즘 · 벤토 그리드 — 2025-2026 UI 트렌드", "반응형 설계 — 모바일 퍼스트와 Tailwind 브레이크포인트", "디자인 시스템을 AI에게 가르치기 — 일관된 UI를 위한 하네스 설정"],
        opener: "AI에게 '예쁜 UI 만들어줘'라고 하면 매번 다른 스타일이 나와요. 그런데 Tailwind 디자인 토큰과 Shadcn 컴포넌트를 하네스에 설정하면 AI가 항상 일관된 디자인을 만들어요. 어떻게 설정하는 게 좋을까요?",
      },
      {
        name: "배포 인프라 — Vercel · Netlify · Railway · Fly.io",
        concepts: ["Vercel — Next.js 최적화 배포, 서버리스 함수, Edge Network", "Netlify — 정적 사이트 + 서버리스 함수", "Railway — Docker 컨테이너 기반 풀스택 배포", "Fly.io — 엣지 서버에 Docker 컨테이너 배포", "도메인 · HTTPS · DNS 설정", "모니터링 — Sentry(에러 추적), Vercel Analytics, PostHog", "비용 관리 — 프리 티어 한도와 스케일업 전략"],
        opener: "앱을 만들었는데 세상에 공개하려면 '배포'를 해야 해요. Vercel은 git push만 하면 자동 배포되는데, Railway는 Docker가 필요해요. 프로젝트 특성에 따라 어떤 플랫폼을 골라야 할까요?",
      },
      {
        name: "TypeScript · 패키지 관리 · 개발자 도구",
        concepts: ["TypeScript — 타입 시스템이 바이브코딩 품질을 높이는 이유", "strict 모드 — AI가 만든 코드의 타입 안전성 강제", "npm vs pnpm vs bun — 패키지 매니저 비교와 선택", "ESLint · Prettier — 코드 품질 자동 관리", "Turbopack / Vite — 빌드 도구와 개발 서버 속도", "모노레포 — Turborepo, nx로 대규모 프로젝트 관리"],
        opener: "JavaScript로 바이브코딩하면 AI가 any 타입을 남발하는 경우가 많아요. TypeScript strict 모드를 켜면 AI가 더 정확한 코드를 짜는데, 왜 타입이 AI 코드 품질에 그렇게 큰 영향을 미칠까요?",
      },
      {
        name: "API 설계 — REST · GraphQL · tRPC · WebSocket",
        concepts: ["REST API 설계 원칙 — 리소스 URL, HTTP 메서드, 상태 코드", "GraphQL — 스키마 정의, 쿼리, 뮤테이션, 서브스크립션", "tRPC — 타입 안전한 엔드투엔드 API (Next.js + TypeScript)", "WebSocket · Server-Sent Events(SSE) — 실시간 통신 패턴", "API 버저닝과 하위 호환성", "Rate Limiting · 인증 미들웨어 — API 보안"],
        opener: "AI 챗봇에서 응답이 실시간으로 한 글자씩 나타나는 건 REST가 아니라 SSE라는 기술이에요. REST, GraphQL, WebSocket, SSE — 각각 언제 쓰는 게 맞을까요?",
      },
      {
        name: "React 심화 — 상태 관리 · 패턴 · 성능",
        concepts: ["React Server Components vs Client Components", "상태 관리 — useState, useReducer, Zustand, Jotai, Redux Toolkit", "커스텀 훅 패턴 — 로직 재사용의 핵심", "React Suspense · Error Boundary — 로딩과 에러 처리", "성능 최적화 — React.memo, useMemo, useCallback, 코드 스플리팅", "Server Actions — Next.js 15의 폼 처리와 뮤테이션"],
        opener: "React에서 useState만으로도 앱을 만들 수 있는데, 왜 Zustand이나 Jotai 같은 상태 관리 라이브러리가 필요할까요? 컴포넌트가 10개일 때와 100개일 때 어떤 차이가 생기길래요?",
      },
      {
        name: "PWA · 오프라인 · 모바일 최적화",
        concepts: ["PWA 핵심 — manifest.json, Service Worker, 캐싱 전략", "오프라인 퍼스트 — Cache API, IndexedDB, Background Sync", "Web Push Notifications — 알림 시스템", "앱 설치 경험 — Add to Home Screen, 스플래시 스크린", "모바일 성능 — Lighthouse 점수 최적화, Core Web Vitals", "PWA vs 네이티브 앱 vs 하이브리드(Capacitor) — 트레이드오프"],
        opener: "앱스토어에 올리지 않고도 사용자 핸드폰에 '설치'될 수 있는 웹 앱이 있어요. PWA라고 하는데, 어떻게 가능한 걸까요? 네이티브 앱과 뭐가 다르고 뭐가 같을까요?",
      },
      {
        name: "접근성 · 국제화 · SEO",
        concepts: ["웹 접근성(a11y) — ARIA 속성, 키보드 내비게이션, 스크린 리더", "시맨틱 HTML — 접근성과 SEO를 동시에 잡는 마크업", "국제화(i18n) — next-intl, 다국어 지원 전략", "SEO 기초 — 메타태그, Open Graph, 구조화된 데이터(JSON-LD)", "Next.js의 SEO — generateMetadata, sitemap.xml, robots.txt", "AI 생성 코드의 접근성 문제 — 흔한 실수와 해결법"],
        opener: "시각 장애가 있는 사용자가 여러분의 앱을 쓸 수 있을까요? AI가 만든 코드는 대부분 접근성을 무시해요. 버튼에 aria-label 하나 빠지면 스크린 리더 사용자는 그 버튼이 뭔지 알 수 없거든요.",
      },
      {
        name: "클라우드 서비스 — AWS · GCP · Azure 입문",
        concepts: ["클라우드 3대장 비교 — AWS vs GCP vs Azure 핵심 서비스", "서버리스 — Lambda/Cloud Functions/Azure Functions", "오브젝트 스토리지 — S3/Cloud Storage/Blob Storage", "CDN — CloudFront/Cloud CDN으로 글로벌 배포", "IAM과 보안 — 최소 권한 원칙", "비용 관리 — 프리 티어 활용과 예산 알림 설정"],
        opener: "Vercel이나 Supabase 뒤에는 결국 AWS 같은 클라우드가 있어요. BaaS가 편하긴 하지만, 스케일이 커지면 직접 클라우드를 다뤄야 할 수도 있죠. AWS에서 가장 먼저 알아야 할 3가지 서비스가 뭘까요?",
      },
      {
        name: "AI 윤리 · 저작권 · 법적 이슈",
        concepts: ["AI 생성 코드의 저작권 — 누가 소유하는가?", "오픈소스 라이선스 — MIT, Apache, GPL의 차이와 의무", "AI 학습 데이터와 저작권 논쟁 — GitHub Copilot 소송 사례", "개인정보보호 — GDPR, 한국 개인정보보호법과 AI 앱", "AI 편향(Bias) — AI 생성 콘텐츠의 윤리적 검토", "책임 소재 — AI가 만든 버그로 사고가 나면 누구 책임?"],
        opener: "AI가 짜준 코드에 다른 사람의 오픈소스 코드가 그대로 들어가 있으면 저작권 문제가 될까요? GitHub Copilot 때문에 실제로 소송이 일어났어요. 바이브코딩 시대의 법적 리스크를 어떻게 관리해야 할까요?",
      },
      // ── 최고급: 최신 기술과 대규모 프로젝트 ──
      {
        name: "OpenAI Codex — 클라우드 자율 코딩 에이전트",
        concepts: ["Codex의 아키텍처 — 클라우드 샌드박스 + 자율 태스크 실행", "Codex vs Claude Code — 로컬 에이전트 vs 클라우드 에이전트 비교", "Codex CLI 사용법과 워크플로우", "GitHub 연동 — 이슈 → Codex → PR 자동 생성", "Codex의 한계 — 어떤 작업에 적합하고 어떤 작업에 부적합한가", "Codex + Claude Code 하이브리드 전략"],
        opener: "OpenAI의 Codex는 클라우드에서 AI가 혼자 코딩하고 PR까지 만들어줘요. 그런데 로컬에서 돌리는 Claude Code와 뭐가 다를까요? 각각 어떤 상황에 더 적합할까요?",
      },
      {
        name: "대규모 바이브코딩 — OpenClaw의 9가지 교훈",
        concepts: ["OpenClaw — 31만+ 스타, 세계 최대 바이브코딩 프로젝트", "파일 단위 모듈화 — AI가 이해할 수 있는 코드 구조", "테스트 주도 바이브코딩(TDVC) — AI에게 테스트부터 짜게 하기", "코드 리뷰 자동화 — AI가 만든 코드를 AI가 검증", "기술 부채 관리 — 바이브코딩 산출물의 장기 유지보수", "문서화 전략 — AI가 이해하는 코드 = 사람도 이해하는 코드"],
        opener: "GitHub에서 31만 스타를 받은 OpenClaw는 거의 전부 AI로 만들어졌어요. 10만 줄 이상의 코드를 AI로 관리하려면 어떤 특별한 전략이 필요할까요?",
      },
      {
        name: "자율 코딩의 최전선 — Claude Agent · Devin · Antigravity",
        concepts: ["Claude Code SDK — 프로그래밍 가능한 에이전트 빌딩", "Devin(Cognition) — 자율형 AI 엔지니어의 가능성과 현실", "Google Antigravity — AI가 AI를 감독하는 메타 에이전트", "GitHub Copilot Workspace — PR 기반 자율 코딩", "자율 에이전트 안전성 — 샌드박스, 권한 제한, 인간 승인 게이트", "미래 전망 — AI 개발자가 인간 개발자를 완전히 대체할 수 있는가"],
        opener: "Codex, Claude Agent, Devin, Antigravity — AI가 혼자 코딩하는 시대예요. 그런데 '자율 코딩'이 정말 사람 개입 없이 안전할까요? AI가 AI를 감독하는 Antigravity는 왜 등장했을까요?",
      },
      {
        name: "AI 모델 선택과 비용 최적화",
        concepts: ["모델 티어링 — Opus/Sonnet/Haiku, GPT-4o/4o-mini 작업별 분리", "프롬프트 캐싱 — Anthropic/OpenAI 캐시 메커니즘과 비용 절감", "토큰 사용량 모니터링과 예산 관리", "오픈소스 모델(Llama, Mistral, Gemma) vs 상용 모델 선택 기준", "파인튜닝 vs 프롬프트 엔지니어링 — ROI 비교", "멀티모달 — 이미지·음성 입출력 비용과 활용 전략"],
        opener: "같은 작업인데 Opus는 $0.50, Haiku는 $0.01이에요. 항상 싼 모델이 정답일까요? 비용과 품질의 최적 균형을 어떤 기준으로 잡아야 할까요?",
      },
      {
        name: "실전 프로젝트 — 7일 만에 프로덕션 앱 완성하기",
        concepts: ["Day 1-2: 기획 · CLAUDE.md · 하네스 세팅 · DB 스키마", "Day 3-5: 핵심 기능 구현 · 에이전트 병렬 활용 · API 설계", "Day 6: 반응형 · PWA · 에러 바운더리 · 폴리싱", "Day 7: 배포 · README · AI 활용 리포트 · 심사위원을 설득하는 기술", "실전 트러블슈팅 — 빌드 에러, 타입 오류, 배포 실패 대응", "포스트모템 — 토큰 사용량 분석과 개선점"],
        opener: "바이브코딩으로 7일 만에 23페이지, 16개 API를 가진 프로덕션 앱을 만든 사례가 있어요. 이게 가능했던 건 단순히 AI가 빨라서가 아니라 전략이 있었기 때문이에요. 첫날에 가장 먼저 해야 할 일이 뭘까요?",
      },
    ],
  },
  {
    id: "current",
    name: "시사 · 최신 주제",
    icon: "🌐",
    topics: [],
  },
];
