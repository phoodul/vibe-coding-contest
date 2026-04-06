/**
 * 생활과 윤리 주요 사상가 데이터
 * 기억의 궁전에서 사상가가 자신의 공간에서 주장을 설명하는 데 사용
 */

export interface Thinker {
  id: string;
  name: string;
  nameEn: string;
  era: string;
  emoji: string; // 사상가를 대표하는 이모지
  tagline: string; // 핵심 한 줄
  keyQuote: string; // 대표 명언
  school: string; // 학파/이론
}

export const THINKERS: Thinker[] = [
  // 1장 — 윤리 이론
  {
    id: "kant",
    name: "칸트",
    nameEn: "Immanuel Kant",
    era: "1724-1804",
    emoji: "🎩",
    tagline: "의무론의 창시자",
    keyQuote: "네 의지의 준칙이 항상 동시에 보편적 법칙이 될 수 있도록 행위하라",
    school: "의무론",
  },
  {
    id: "bentham",
    name: "벤담",
    nameEn: "Jeremy Bentham",
    era: "1748-1832",
    emoji: "⚖️",
    tagline: "양적 공리주의",
    keyQuote: "최대 다수의 최대 행복",
    school: "공리주의",
  },
  {
    id: "mill",
    name: "밀",
    nameEn: "John Stuart Mill",
    era: "1806-1873",
    emoji: "📖",
    tagline: "질적 공리주의",
    keyQuote: "만족한 돼지보다 불만족한 소크라테스가 낫다",
    school: "공리주의",
  },
  {
    id: "aristotle",
    name: "아리스토텔레스",
    nameEn: "Aristoteles",
    era: "BC 384-322",
    emoji: "🏛️",
    tagline: "덕 윤리의 창시자",
    keyQuote: "덕은 두 극단 사이의 중용이다",
    school: "덕 윤리",
  },
  {
    id: "gilligan",
    name: "길리건",
    nameEn: "Carol Gilligan",
    era: "1936-",
    emoji: "💜",
    tagline: "배려 윤리",
    keyQuote: "도덕적 판단에서 관계와 돌봄이 정의만큼 중요하다",
    school: "배려 윤리",
  },
  {
    id: "habermas",
    name: "하버마스",
    nameEn: "Jürgen Habermas",
    era: "1929-",
    emoji: "🗣️",
    tagline: "담론 윤리",
    keyQuote: "모든 관련 당사자가 합의할 수 있는 규범만이 타당하다",
    school: "담론 윤리",
  },

  // 2장 — 생명 윤리
  {
    id: "singer",
    name: "싱어",
    nameEn: "Peter Singer",
    era: "1946-",
    emoji: "🐾",
    tagline: "동물 해방론",
    keyQuote: "종(種)을 이유로 차별하는 것은 종차별주의이다",
    school: "공리주의/동물 해방",
  },
  {
    id: "regan",
    name: "레건",
    nameEn: "Tom Regan",
    era: "1938-2017",
    emoji: "🦁",
    tagline: "동물 권리론",
    keyQuote: "동물은 삶의 주체로서 내재적 가치를 가진다",
    school: "동물 권리",
  },

  // 3장 — 사회 윤리
  {
    id: "rawls",
    name: "롤스",
    nameEn: "John Rawls",
    era: "1921-2002",
    emoji: "⚖️",
    tagline: "정의론",
    keyQuote: "무지의 베일 뒤에서 선택된 원칙이 공정하다",
    school: "자유주의적 평등주의",
  },
  {
    id: "nozick",
    name: "노직",
    nameEn: "Robert Nozick",
    era: "1938-2002",
    emoji: "🗽",
    tagline: "자유지상주의",
    keyQuote: "국가의 재분배는 개인의 소유권을 침해하는 강제 노동이다",
    school: "자유지상주의",
  },
  {
    id: "walzer",
    name: "왈처",
    nameEn: "Michael Walzer",
    era: "1935-",
    emoji: "🔮",
    tagline: "다원적 정의",
    keyQuote: "한 영역에서의 우위가 다른 영역을 지배해서는 안 된다",
    school: "공동체주의",
  },
  {
    id: "marx",
    name: "마르크스",
    nameEn: "Karl Marx",
    era: "1818-1883",
    emoji: "✊",
    tagline: "자본주의 비판",
    keyQuote: "능력에 따라 일하고 필요에 따라 분배받는다",
    school: "사회주의/공산주의",
  },

  // 4장 — 과학/환경 윤리
  {
    id: "jonas",
    name: "요나스",
    nameEn: "Hans Jonas",
    era: "1903-1993",
    emoji: "🌍",
    tagline: "책임의 원칙",
    keyQuote: "최악의 결과를 먼저 상상하고 그것을 피하기 위해 행동하라",
    school: "책임 윤리",
  },
  {
    id: "leopold",
    name: "레오폴드",
    nameEn: "Aldo Leopold",
    era: "1887-1948",
    emoji: "🌿",
    tagline: "대지 윤리",
    keyQuote: "공동체의 온전함, 안정성, 아름다움을 보전하는 것은 옳다",
    school: "생태 중심주의",
  },
  {
    id: "schweitzer",
    name: "슈바이처",
    nameEn: "Albert Schweitzer",
    era: "1875-1965",
    emoji: "🕊️",
    tagline: "생명 외경",
    keyQuote: "나는 살고자 하는 의지에 둘러싸여 살고자 하는 의지이다",
    school: "생명 중심주의",
  },

  // 6장 — 평화
  {
    id: "hobbes",
    name: "홉스",
    nameEn: "Thomas Hobbes",
    era: "1588-1679",
    emoji: "👑",
    tagline: "사회 계약론",
    keyQuote: "만인의 만인에 대한 투쟁",
    school: "사회 계약론",
  },
  {
    id: "locke",
    name: "로크",
    nameEn: "John Locke",
    era: "1632-1704",
    emoji: "🔑",
    tagline: "자연권과 저항권",
    keyQuote: "생명, 자유, 재산은 양도할 수 없는 자연권이다",
    school: "자유주의",
  },
  {
    id: "confucius",
    name: "공자",
    nameEn: "Confucius",
    era: "BC 551-479",
    emoji: "📜",
    tagline: "인(仁)과 예(禮)",
    keyQuote: "기소불욕 물시어인(己所不欲 勿施於人)",
    school: "유교",
  },
  {
    id: "mencius",
    name: "맹자",
    nameEn: "Mencius",
    era: "BC 372-289",
    emoji: "🌱",
    tagline: "성선설과 왕도정치",
    keyQuote: "사람에게는 차마 남을 해치지 못하는 마음이 있다(不忍人之心)",
    school: "유교",
  },
  {
    id: "mozi",
    name: "묵자",
    nameEn: "Mozi",
    era: "BC 470-391",
    emoji: "🤝",
    tagline: "겸애와 비공",
    keyQuote: "모든 사람을 차별 없이 사랑하라(兼愛)",
    school: "묵가",
  },
];

export function getThinker(id: string): Thinker | undefined {
  return THINKERS.find((t) => t.id === id);
}

export function getThinkersBySchool(school: string): Thinker[] {
  return THINKERS.filter((t) => t.school.includes(school));
}
