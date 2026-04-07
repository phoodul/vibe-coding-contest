/**
 * 경복궁 근정전 — ch3 "사회와 윤리"
 *
 * 1 hotspot = 1 개념, 하위 목록 2~4개만
 * 각 하위 항목이 사진 속 특정 오브젝트 부위를 가리킴
 */

import type { PalaceRoomData } from "./types";

export const GEUNJEONGJEON_ROOM: PalaceRoomData = {
  id: "ch3",
  title: "사회와 윤리",
  subtitle: "경복궁 근정전",
  backgroundImage: "/spaces/geunjeongjeon-interior.jpg",
  attribution: "Wikimedia Commons, CC BY-SA 4.0",
  hotspots: [

    // ──── 일월오봉도 (어좌 뒤 그림) ────
    {
      id: "job_meaning",
      keyword: "직업의 의미",
      section: "s1-c1",
      region: { x: 37, y: 19, w: 26, h: 17 },
      outline: [
        { text: "사회적 역할 분담", pointer: { x: 43, y: 24 } },
        { text: "자아실현의 수단", pointer: { x: 57, y: 24 } },
      ],
      narratorText: "직업은 단순한 생계 수단을 넘어 사회적 역할 분담과 자아실현의 수단입니다.",
    },

    // ──── 어좌 (중앙 금색 왕좌) ────
    {
      id: "calvin",
      keyword: "칼뱅의 소명설",
      section: "s1-c1",
      region: { x: 42, y: 37, w: 16, h: 15 },
      outline: [
        { text: "직업 = 신이 부여한 소명", pointer: { x: 48, y: 40 } },
        { text: "직업적 성공 = 구원의 증거", pointer: { x: 52, y: 45 } },
        { text: "베버 — 프로테스탄티즘과 자본주의", pointer: { x: 50, y: 50 } },
      ],
      narratorText: "칼뱅의 소명설에 따르면 직업은 신이 부여한 소명이며, 직업적 성공은 구원의 증거입니다. 이 사상은 막스 베버가 분석한 프로테스탄티즘의 윤리와 자본주의 정신의 핵심입니다.",
    },

    // ──── 닫집/보개 (어좌 위 장식 지붕) ────
    {
      id: "integrity",
      keyword: "청렴",
      section: "s1-c3",
      region: { x: 38, y: 10, w: 24, h: 9 },
      outline: [
        { text: "군자의 핵심 덕목", pointer: { x: 45, y: 13 } },
        { text: "정약용 — 목민심서, 본무", pointer: { x: 55, y: 13 } },
      ],
      narratorText: "청렴은 공직자가 공공의 이익을 위해 직무를 수행하는 것입니다. 동양에서 청렴은 군자의 핵심 덕목이며, 정약용은 목민심서에서 청렴을 목민관의 본무라고 강조했습니다.",
    },

    // ──── 좌측 앞 기둥 상단 ────
    {
      id: "mencius",
      keyword: "맹자",
      section: "s1-c1",
      region: { x: 7, y: 8, w: 7, h: 22 },
      outline: [
        { text: "사회적 분업의 필요성", pointer: { x: 10, y: 14 } },
        { text: "노심·노력 — 마음 쓰는 자와 몸 쓰는 자", pointer: { x: 10, y: 24 } },
      ],
      narratorText: "맹자는 사회적 분업의 필요성을 강조했습니다. 어떤 사람은 마음을 쓰고, 어떤 사람은 몸을 씁니다.",
    },

    // ──── 좌측 앞 기둥 중단 ────
    {
      id: "xunzi",
      keyword: "순자",
      section: "s1-c1",
      region: { x: 7, y: 30, w: 7, h: 18 },
      outline: [
        { text: "예(禮) 기반 직분 의식", pointer: { x: 10, y: 35 } },
        { text: "사회 질서 유지", pointer: { x: 10, y: 43 } },
      ],
      narratorText: "순자는 사회 질서 유지를 위한 예에 기반한 직분 의식을 강조했습니다.",
    },

    // ──── 좌측 앞 기둥 하단 ────
    {
      id: "marx_job",
      keyword: "마르크스 (직업관)",
      section: "s1-c1",
      region: { x: 7, y: 48, w: 7, h: 22 },
      outline: [
        { text: "노동 소외 비판", pointer: { x: 10, y: 53 } },
        { text: "노동 = 자아실현의 수단", pointer: { x: 10, y: 63 } },
      ],
      narratorText: "마르크스는 자본주의적 노동이 인간을 소외시킨다고 비판하며, 노동이 자아실현의 수단이 되어야 한다고 주장했습니다.",
    },

    // ──── 좌측 뒤 기둥 상단 ────
    {
      id: "hegel",
      keyword: "헤겔",
      section: "s1-c2b",
      region: { x: 19, y: 12, w: 7, h: 18 },
      outline: [
        { text: "자기 외화의 과정", pointer: { x: 22, y: 17 } },
        { text: "자연 변형을 통한 자기 실현", pointer: { x: 22, y: 25 } },
      ],
      narratorText: "헤겔에 따르면 노동은 자기 외화의 과정입니다. 인간은 노동을 통해 자연을 변형시키고 그 과정에서 자기 자신을 실현합니다.",
    },

    // ──── 좌측 뒤 기둥 중단 ────
    {
      id: "marx_labor",
      keyword: "마르크스 (노동 소외)",
      section: "s1-c2b",
      region: { x: 19, y: 30, w: 7, h: 18 },
      outline: [
        { text: "소외된 노동", pointer: { x: 22, y: 35 } },
        { text: "4가지 소외 — 생산물·과정·본질·타인", pointer: { x: 22, y: 43 } },
      ],
      narratorText: "마르크스에 따르면 자본주의적 노동은 소외된 노동입니다. 노동자는 생산물로부터, 노동과정으로부터, 유적 본질로부터, 타인으로부터 소외됩니다.",
    },

    // ──── 좌측 뒤 기둥 하단 ────
    {
      id: "arendt",
      keyword: "아렌트",
      section: "s1-c2b",
      region: { x: 19, y: 48, w: 7, h: 18 },
      outline: [
        { text: "노동 — 생존을 위한 반복", pointer: { x: 22, y: 52 } },
        { text: "작업 — 내구적 대상물 제작", pointer: { x: 22, y: 57 } },
        { text: "행위 — 공적 자유활동 (인간다운 삶)", pointer: { x: 22, y: 62 } },
      ],
      narratorText: "아렌트는 인간의 활동을 세 가지로 구분했습니다. 노동은 생존을 위한 반복적 활동이고, 작업은 내구적 대상물의 제작이며, 행위는 공적 영역에서의 자유로운 활동입니다. 인간다운 삶은 행위에 있습니다.",
    },

    // ──── 우측 앞 기둥 상단 ────
    {
      id: "hobbes",
      keyword: "홉스",
      section: "s3-c1",
      region: { x: 86, y: 8, w: 8, h: 20 },
      outline: [
        { text: "만인의 만인에 대한 투쟁", pointer: { x: 90, y: 14 } },
        { text: "절대적 주권자에게 권리 양도", pointer: { x: 90, y: 23 } },
      ],
      narratorText: "홉스에 따르면 자연 상태는 만인의 만인에 대한 투쟁이므로, 개인은 절대적 주권자에게 자연권을 양도하여 안전을 보장받습니다.",
    },

    // ──── 우측 앞 기둥 중단 ────
    {
      id: "locke",
      keyword: "로크",
      section: "s3-c1",
      region: { x: 86, y: 28, w: 8, h: 20 },
      outline: [
        { text: "자연법 — 생명·자유·재산 보호", pointer: { x: 90, y: 33 } },
        { text: "저항권 — 기본권 침해 시 행사", pointer: { x: 90, y: 42 } },
      ],
      narratorText: "로크에 따르면 자연 상태에서도 생명, 자유, 재산을 보호하는 자연법이 존재합니다. 국가가 국민의 기본권을 침해하면 국민은 저항권을 행사할 수 있습니다.",
    },

    // ──── 우측 앞 기둥 하단 ────
    {
      id: "rousseau",
      keyword: "루소",
      section: "s3-c1",
      region: { x: 86, y: 48, w: 8, h: 22 },
      outline: [
        { text: "일반 의지에 의한 국가 운영", pointer: { x: 90, y: 53 } },
        { text: "인민 주권론 — 주권은 양도 불가", pointer: { x: 90, y: 63 } },
      ],
      narratorText: "루소는 국가가 일반 의지에 의해 운영되어야 하며, 주권은 양도 불가능하고 분할 불가능하다는 인민 주권론을 제시했습니다.",
    },

    // ──── 우측 뒤 기둥 상단 ────
    {
      id: "thoreau",
      keyword: "소로",
      section: "s3-c2",
      region: { x: 74, y: 12, w: 7, h: 18 },
      outline: [
        { text: "부당한 법에 복종 = 부정의 가담", pointer: { x: 77, y: 17 } },
        { text: "시민 불복종의 시작", pointer: { x: 77, y: 25 } },
      ],
      narratorText: "소로는 시민 불복종에서 부당한 법에 복종하는 것은 부정의에 가담하는 것이라고 주장했습니다.",
    },

    // ──── 우측 뒤 기둥 중단 ────
    {
      id: "rawls_civil",
      keyword: "롤스의 불복종 4조건",
      section: "s3-c2",
      region: { x: 74, y: 30, w: 7, h: 22 },
      outline: [
        { text: "심각한 부정의 존재", pointer: { x: 77, y: 34 } },
        { text: "최후의 수단", pointer: { x: 77, y: 39 } },
        { text: "비폭력·공개적", pointer: { x: 77, y: 44 } },
        { text: "처벌 감수 의사", pointer: { x: 77, y: 49 } },
      ],
      narratorText: "롤스가 제시한 시민 불복종의 정당화 조건은 네 가지입니다. 심각하고 명백한 부정의에 대한 것이어야 하고, 합법적 수단이 소진된 후의 최후의 수단이어야 하며, 공개적이고 비폭력적이어야 하고, 처벌을 감수할 의사가 있어야 합니다.",
    },

    // ──── 우측 뒤 기둥 하단 ────
    {
      id: "democracy",
      keyword: "민주주의",
      section: "s3-c3",
      region: { x: 74, y: 52, w: 7, h: 16 },
      outline: [
        { text: "직접 민주주의 — 아테네", pointer: { x: 77, y: 55 } },
        { text: "대의 민주주의 — 대표자 선출", pointer: { x: 77, y: 60 } },
        { text: "심의 민주주의 — 하버마스, 공론장", pointer: { x: 77, y: 65 } },
      ],
      narratorText: "민주주의의 유형에는 시민이 직접 참여하는 직접 민주주의, 대표자를 선출하는 대의 민주주의, 그리고 하버마스가 강조한 공론장에서의 합리적 토론을 통한 심의 민주주의가 있습니다.",
    },

    // ──── 좌측 등 ────
    {
      id: "rawls_justice",
      keyword: "롤스의 정의론",
      section: "s2-c2",
      region: { x: 15, y: 48, w: 5, h: 14 },
      outline: [
        { text: "무지의 베일 — 지위·능력 모르는 상태", pointer: { x: 17, y: 51 } },
        { text: "제1원칙 — 평등한 자유", pointer: { x: 17, y: 56 } },
        { text: "차등의 원칙 — 최소수혜자 최대이익", pointer: { x: 17, y: 61 } },
      ],
      narratorText: "롤스는 정의론에서 무지의 베일을 제시했습니다. 자신의 사회적 지위와 능력을 모르는 상태에서 선택하는 원칙이 공정합니다. 제1원칙은 모든 사람이 기본적 자유에 대해 평등한 권리를 가진다는 것이고, 차등의 원칙은 불평등이 최소 수혜자에게 최대 이익이 될 때만 허용된다는 것입니다.",
    },

    // ──── 우측 등 ────
    {
      id: "human_rights",
      keyword: "인권의 세대",
      section: "s3-c3",
      region: { x: 80, y: 48, w: 5, h: 14 },
      outline: [
        { text: "1세대 — 시민적·정치적 자유", pointer: { x: 82, y: 51 } },
        { text: "2세대 — 경제적·사회적 권리", pointer: { x: 82, y: 56 } },
        { text: "3세대 — 집단적 권리 (평화·발전·환경)", pointer: { x: 82, y: 61 } },
      ],
      narratorText: "인권은 세대적으로 발전해 왔습니다. 1세대는 시민적, 정치적 자유이고, 2세대는 경제적, 사회적 권리이며, 3세대는 평화, 발전, 환경 등 집단적 권리입니다.",
    },

    // ──── 계단 ────
    {
      id: "professional_ethics",
      keyword: "전문직 윤리",
      section: "s1-c2",
      region: { x: 35, y: 53, w: 30, h: 10 },
      outline: [
        { text: "의사 — 히포크라테스 선서", pointer: { x: 40, y: 56 } },
        { text: "변호사 — 비밀 보호 의무", pointer: { x: 50, y: 58 } },
        { text: "교사 — 교육적 양심", pointer: { x: 60, y: 56 } },
      ],
      narratorText: "전문직은 높은 수준의 윤리적 책임을 집니다. 의사의 히포크라테스 선서, 변호사의 의뢰인 비밀 보호 의무, 교사의 교육적 양심이 대표적입니다. 핵심은 공공의 이익을 사적 이익보다 우선해야 한다는 것입니다.",
    },

    // ──── 단청 천장 ────
    {
      id: "justice_types",
      keyword: "정의의 세 유형",
      section: "s2-c1",
      region: { x: 20, y: 0, w: 60, h: 8 },
      outline: [
        { text: "분배적 정의 — 재화의 공정 분배", pointer: { x: 35, y: 3 } },
        { text: "교정적 정의 — 부당행위 시정", pointer: { x: 50, y: 3 } },
        { text: "절차적 정의 — 과정의 공정성", pointer: { x: 65, y: 3 } },
      ],
      narratorText: "정의에는 세 가지 유형이 있습니다. 분배적 정의는 사회적 재화를 공정하게 분배하는 문제이고, 교정적 정의는 부당한 행위를 바로잡는 문제이며, 절차적 정의는 의사결정 과정 자체가 공정한가의 문제입니다.",
    },

    // ──── 대들보 ────
    {
      id: "four_theories",
      keyword: "4대 정의론",
      section: "s4-c1",
      region: { x: 8, y: 8, w: 84, h: 4 },
      outline: [
        { text: "롤스 — 차등의 원칙", pointer: { x: 25, y: 10 } },
        { text: "노직 — 최소 국가", pointer: { x: 42, y: 10 } },
        { text: "왈처 — 복합 평등", pointer: { x: 58, y: 10 } },
        { text: "마르크스 — 필요에 따른 분배", pointer: { x: 75, y: 10 } },
      ],
      narratorText: "4대 정의론을 비교하면, 롤스는 차등의 원칙을, 노직은 최소 국가를, 왈처는 복합 평등을, 마르크스는 필요에 따른 분배를 핵심으로 합니다.",
    },

    // ──── 바닥 좌측 ────
    {
      id: "adam_smith",
      keyword: "애덤 스미스",
      section: "s1-c2c",
      region: { x: 10, y: 68, w: 25, h: 15 },
      outline: [
        { text: "보이지 않는 손", pointer: { x: 18, y: 73 } },
        { text: "도덕감정론 — 공감과 정의가 시장 전제", pointer: { x: 28, y: 78 } },
      ],
      narratorText: "애덤 스미스의 보이지 않는 손에 따르면 개인이 자기 이익을 추구하면 사회 전체의 이익도 증진됩니다. 그러나 스미스는 도덕감정론에서 공감과 정의가 시장의 전제 조건임을 강조했습니다.",
    },

    // ──── 바닥 우측 ────
    {
      id: "market_failure",
      keyword: "시장의 한계",
      section: "s1-c2c",
      region: { x: 60, y: 68, w: 30, h: 15 },
      outline: [
        { text: "시장 실패 — 공공재, 외부효과, 정보비대칭", pointer: { x: 68, y: 73 } },
        { text: "소득 불평등 — 출발선 격차", pointer: { x: 78, y: 73 } },
        { text: "환경 파괴 — 가격 미반영 외부효과", pointer: { x: 73, y: 80 } },
      ],
      narratorText: "시장경제의 한계로는 공공재, 외부효과, 정보 비대칭에 의한 시장 실패가 있습니다. 또한 상속과 교육 격차에 의한 소득 불평등, 가격이 매겨지지 않는 외부효과에 의한 환경 파괴가 있습니다.",
    },

    // ──── 좌측 난간/창호 ────
    {
      id: "nozick",
      keyword: "노직",
      section: "s2-c3",
      region: { x: 0, y: 32, w: 6, h: 30 },
      outline: [
        { text: "취득의 정의 — 무주물의 정당한 취득", pointer: { x: 3, y: 38 } },
        { text: "이전의 정의 — 자발적 거래·증여", pointer: { x: 3, y: 48 } },
        { text: "최소 국가 — 재분배는 소유권 침해", pointer: { x: 3, y: 56 } },
      ],
      narratorText: "노직은 소유 권리론을 제시했습니다. 무주물의 정당한 취득, 자발적 이전의 결과는 정당합니다. 부당한 것은 바로잡아야 합니다. 국가의 재분배는 소유권 침해이며, 국가 역할은 최소한에 그쳐야 합니다.",
    },

    // ──── 우측 난간/창호 ────
    {
      id: "walzer",
      keyword: "왈처",
      section: "s2-c4",
      region: { x: 94, y: 32, w: 6, h: 30 },
      outline: [
        { text: "영역별 분배 — 교육=능력, 의료=필요", pointer: { x: 97, y: 40 } },
        { text: "지배 금지 — 부가 정치를 좌우하면 안 됨", pointer: { x: 97, y: 52 } },
      ],
      narratorText: "왈처는 사회적 재화의 영역마다 다른 분배 기준이 적용되어야 한다고 주장했습니다. 교육은 능력에 따라, 의료는 필요에 따라, 시장은 자유 교환에 따라 분배해야 합니다. 핵심은 한 영역의 우위가 다른 영역을 지배해서는 안 된다는 것입니다.",
    },
  ],
};
