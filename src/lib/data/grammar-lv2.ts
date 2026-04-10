/**
 * Lv2 — Intermediate (B1-B2) 100문장
 * 중급 문법: 완료 시제, 조건문, 수동태, 관계절, 화법, 비교급 등
 * 10 카테고리 × 10문장
 */
import type { GrammarSentence } from "./grammar-sentences";

export const GRAMMAR_LV2_CATEGORIES = [
  "Perfect Tenses",
  "Conditionals",
  "Passive Voice",
  "Relative Clauses",
  "Reported Speech",
  "Comparatives & Superlatives",
  "Infinitives & Gerunds",
  "Phrasal Verbs",
  "Conjunctions & Transitions",
  "Tag Questions & Emphasis",
] as const;

export const GRAMMAR_LV2: GrammarSentence[] = [
  // ── 1. Perfect Tenses 완료 시제 (1-10) ──
  { id: 1, en: "I have lived in Seoul for ten years.", ko: "나는 서울에서 10년 동안 살았다.", category: "Perfect Tenses", grammar: "현재완료 계속" },
  { id: 2, en: "She has already finished her homework.", ko: "그녀는 이미 숙제를 끝냈다.", category: "Perfect Tenses", grammar: "현재완료 완료" },
  { id: 3, en: "Have you ever been to Japan?", ko: "일본에 가본 적 있나요?", category: "Perfect Tenses", grammar: "현재완료 경험" },
  { id: 4, en: "They had left before the storm arrived.", ko: "폭풍이 오기 전에 그들은 떠났다.", category: "Perfect Tenses", grammar: "과거완료" },
  { id: 5, en: "By next month, I will have graduated from college.", ko: "다음 달이면 나는 대학을 졸업했을 것이다.", category: "Perfect Tenses", grammar: "미래완료" },
  { id: 6, en: "We have been waiting here since two o'clock.", ko: "우리는 2시부터 여기서 기다리고 있다.", category: "Perfect Tenses", grammar: "현재완료진행" },
  { id: 7, en: "He had been studying for three hours when I called.", ko: "내가 전화했을 때 그는 3시간째 공부하고 있었다.", category: "Perfect Tenses", grammar: "과거완료진행" },
  { id: 8, en: "I have never seen such a beautiful sunset.", ko: "나는 이렇게 아름다운 일몰을 본 적이 없다.", category: "Perfect Tenses", grammar: "현재완료 + never" },
  { id: 9, en: "She has just arrived at the airport.", ko: "그녀는 방금 공항에 도착했다.", category: "Perfect Tenses", grammar: "현재완료 + just" },
  { id: 10, en: "By the time we got there, the movie had already started.", ko: "우리가 도착했을 때 영화는 이미 시작되었다.", category: "Perfect Tenses", grammar: "과거완료 + by the time" },

  // ── 2. Conditionals 조건문 (11-20) ──
  { id: 11, en: "If you heat water to 100 degrees, it boils.", ko: "물을 100도로 가열하면 끓는다.", category: "Conditionals", grammar: "zero conditional" },
  { id: 12, en: "If it rains tomorrow, we will cancel the picnic.", ko: "내일 비가 오면 소풍을 취소할 것이다.", category: "Conditionals", grammar: "1st conditional" },
  { id: 13, en: "If I had more time, I would learn another language.", ko: "시간이 더 있다면 다른 언어를 배울 텐데.", category: "Conditionals", grammar: "2nd conditional" },
  { id: 14, en: "If I were you, I would accept that job offer.", ko: "내가 너라면 그 일자리 제안을 수락할 텐데.", category: "Conditionals", grammar: "2nd conditional (were)" },
  { id: 15, en: "Unless you study hard, you won't pass the exam.", ko: "열심히 공부하지 않으면 시험에 통과하지 못할 것이다.", category: "Conditionals", grammar: "unless 조건" },
  { id: 16, en: "As long as you keep trying, you will eventually succeed.", ko: "계속 노력하는 한 결국 성공할 것이다.", category: "Conditionals", grammar: "as long as" },
  { id: 17, en: "Provided that the weather is good, we will go hiking.", ko: "날씨가 좋다면 우리는 하이킹을 갈 것이다.", category: "Conditionals", grammar: "provided that" },
  { id: 18, en: "If I won the lottery, I would travel around the world.", ko: "복권에 당첨되면 세계 여행을 할 텐데.", category: "Conditionals", grammar: "2nd conditional 가정" },
  { id: 19, en: "Even if it snows, the event will take place.", ko: "눈이 오더라도 행사는 진행될 것이다.", category: "Conditionals", grammar: "even if" },
  { id: 20, en: "If you should have any questions, please let me know.", ko: "혹시 질문이 있으시면 알려주세요.", category: "Conditionals", grammar: "should 도치 조건" },

  // ── 3. Passive Voice 수동태 (21-30) ──
  { id: 21, en: "The report was written by the research team.", ko: "그 보고서는 연구팀에 의해 작성되었다.", category: "Passive Voice", grammar: "단순 수동태" },
  { id: 22, en: "English is spoken in many countries around the world.", ko: "영어는 전 세계 많은 나라에서 사용된다.", category: "Passive Voice", grammar: "일반적 사실 수동태" },
  { id: 23, en: "The bridge is being repaired at the moment.", ko: "그 다리는 현재 수리 중이다.", category: "Passive Voice", grammar: "진행형 수동태" },
  { id: 24, en: "The package has been delivered to your address.", ko: "소포가 당신의 주소로 배달되었습니다.", category: "Passive Voice", grammar: "완료 수동태" },
  { id: 25, en: "He was given a second chance by the committee.", ko: "그는 위원회로부터 두 번째 기회를 받았다.", category: "Passive Voice", grammar: "간접목적어 수동태" },
  { id: 26, en: "The children were told to be quiet during the ceremony.", ko: "아이들은 행사 중 조용히 하라는 말을 들었다.", category: "Passive Voice", grammar: "수동태 + to부정사" },
  { id: 27, en: "It is believed that the universe is expanding.", ko: "우주가 팽창하고 있다고 믿어진다.", category: "Passive Voice", grammar: "It is + p.p. + that" },
  { id: 28, en: "The new policy will be announced next week.", ko: "새 정책은 다음 주에 발표될 것이다.", category: "Passive Voice", grammar: "미래 수동태" },
  { id: 29, en: "This car was made in Germany.", ko: "이 차는 독일에서 만들어졌다.", category: "Passive Voice", grammar: "과거 수동태" },
  { id: 30, en: "She is said to be the best doctor in the city.", ko: "그녀는 도시 최고의 의사라고 전해진다.", category: "Passive Voice", grammar: "be said to" },

  // ── 4. Relative Clauses 관계절 (31-40) ──
  { id: 31, en: "The woman who lives next door is a doctor.", ko: "옆집에 사는 여자는 의사이다.", category: "Relative Clauses", grammar: "주격 관계대명사 who" },
  { id: 32, en: "The book that I borrowed from the library was fascinating.", ko: "도서관에서 빌린 책은 매우 흥미로웠다.", category: "Relative Clauses", grammar: "목적격 관계대명사 that" },
  { id: 33, en: "The city where I grew up has changed completely.", ko: "내가 자란 도시가 완전히 변했다.", category: "Relative Clauses", grammar: "관계부사 where" },
  { id: 34, en: "She is the teacher whose classes are always full.", ko: "그녀는 항상 수업이 꽉 차는 선생님이다.", category: "Relative Clauses", grammar: "소유격 관계대명사 whose" },
  { id: 35, en: "The reason why he was late is still unclear.", ko: "그가 늦은 이유는 아직 불분명하다.", category: "Relative Clauses", grammar: "관계부사 why" },
  { id: 36, en: "My sister, who lives in London, is visiting us next week.", ko: "런던에 사는 내 언니가 다음 주에 방문한다.", category: "Relative Clauses", grammar: "비제한적 관계절" },
  { id: 37, en: "The moment when I realized my mistake was too late.", ko: "실수를 깨달은 순간은 너무 늦었다.", category: "Relative Clauses", grammar: "관계부사 when" },
  { id: 38, en: "The project which we completed last month won an award.", ko: "지난달에 완성한 프로젝트가 상을 받았다.", category: "Relative Clauses", grammar: "목적격 관계대명사 which" },
  { id: 39, en: "Anyone who wants to join the club is welcome.", ko: "클럽에 가입하고 싶은 사람은 누구든 환영한다.", category: "Relative Clauses", grammar: "anyone who" },
  { id: 40, en: "That is the restaurant where we had our first date.", ko: "저곳이 우리가 첫 데이트를 한 식당이다.", category: "Relative Clauses", grammar: "관계부사 where (장소)" },

  // ── 5. Reported Speech 화법 (41-50) ──
  { id: 41, en: "She said that she was feeling much better.", ko: "그녀는 많이 나아졌다고 말했다.", category: "Reported Speech", grammar: "간접화법 기본" },
  { id: 42, en: "He told me that he had finished the project.", ko: "그는 프로젝트를 끝냈다고 나에게 말했다.", category: "Reported Speech", grammar: "간접화법 과거완료" },
  { id: 43, en: "She asked me if I wanted to go to the movies.", ko: "그녀는 나에게 영화 보러 갈지 물었다.", category: "Reported Speech", grammar: "간접 의문문 (yes/no)" },
  { id: 44, en: "He asked me where I had been the previous night.", ko: "그는 전날 밤 어디 있었는지 나에게 물었다.", category: "Reported Speech", grammar: "간접 의문문 (wh-)" },
  { id: 45, en: "The teacher told the students not to use their phones.", ko: "선생님은 학생들에게 전화기를 사용하지 말라고 했다.", category: "Reported Speech", grammar: "간접 명령문 (부정)" },
  { id: 46, en: "She promised that she would help me with the presentation.", ko: "그녀는 발표를 도와주겠다고 약속했다.", category: "Reported Speech", grammar: "약속 전달" },
  { id: 47, en: "He suggested that we should take a different route.", ko: "그는 다른 길로 가자고 제안했다.", category: "Reported Speech", grammar: "suggest + should" },
  { id: 48, en: "She admitted that she had made a serious mistake.", ko: "그녀는 심각한 실수를 했다고 인정했다.", category: "Reported Speech", grammar: "admit 간접화법" },
  { id: 49, en: "They announced that the flight would be delayed.", ko: "그들은 비행기가 지연될 것이라고 발표했다.", category: "Reported Speech", grammar: "announce 간접화법" },
  { id: 50, en: "He warned me that the road was very slippery.", ko: "그는 나에게 길이 매우 미끄럽다고 경고했다.", category: "Reported Speech", grammar: "warn 간접화법" },

  // ── 6. Comparatives & Superlatives 비교급·최상급 (51-60) ──
  { id: 51, en: "This problem is more complicated than I expected.", ko: "이 문제는 내가 예상한 것보다 더 복잡하다.", category: "Comparatives & Superlatives", grammar: "more + 형용사 비교급" },
  { id: 52, en: "The sooner we leave, the earlier we will arrive.", ko: "빨리 떠날수록 더 일찍 도착할 것이다.", category: "Comparatives & Superlatives", grammar: "the + 비교급, the + 비교급" },
  { id: 53, en: "This is the most interesting book I have ever read.", ko: "이것은 내가 읽어본 중 가장 흥미로운 책이다.", category: "Comparatives & Superlatives", grammar: "the most + 형용사" },
  { id: 54, en: "He is not as tall as his brother.", ko: "그는 그의 형만큼 키가 크지 않다.", category: "Comparatives & Superlatives", grammar: "not as ... as" },
  { id: 55, en: "The more you practice, the better you become.", ko: "연습할수록 더 잘하게 된다.", category: "Comparatives & Superlatives", grammar: "the more ... the better" },
  { id: 56, en: "She runs faster than anyone else on the team.", ko: "그녀는 팀에서 누구보다 빨리 달린다.", category: "Comparatives & Superlatives", grammar: "비교급 + than anyone" },
  { id: 57, en: "This smartphone is twice as expensive as that one.", ko: "이 스마트폰은 저것보다 두 배 비싸다.", category: "Comparatives & Superlatives", grammar: "배수 + as ... as" },
  { id: 58, en: "Of all the seasons, I like autumn the best.", ko: "모든 계절 중에서 나는 가을을 가장 좋아한다.", category: "Comparatives & Superlatives", grammar: "of all + 최상급" },
  { id: 59, en: "It is getting colder and colder every day.", ko: "날마다 점점 더 추워지고 있다.", category: "Comparatives & Superlatives", grammar: "비교급 + and + 비교급" },
  { id: 60, en: "No other city in the country is larger than Seoul.", ko: "나라에서 서울보다 큰 도시는 없다.", category: "Comparatives & Superlatives", grammar: "no other + 비교급" },

  // ── 7. Infinitives & Gerunds 부정사·동명사 (61-70) ──
  { id: 61, en: "I decided to take a year off before starting college.", ko: "나는 대학에 가기 전 1년을 쉬기로 결정했다.", category: "Infinitives & Gerunds", grammar: "decide + to부정사" },
  { id: 62, en: "She enjoys spending time with her grandchildren.", ko: "그녀는 손주들과 시간 보내는 것을 좋아한다.", category: "Infinitives & Gerunds", grammar: "enjoy + 동명사" },
  { id: 63, en: "He stopped smoking after the doctor's warning.", ko: "의사의 경고 후 그는 담배를 끊었다.", category: "Infinitives & Gerunds", grammar: "stop + 동명사 (중단)" },
  { id: 64, en: "She stopped to buy some flowers on her way home.", ko: "그녀는 집에 가는 길에 꽃을 사려고 멈추었다.", category: "Infinitives & Gerunds", grammar: "stop + to부정사 (목적)" },
  { id: 65, en: "I remember meeting him at the conference last year.", ko: "나는 작년 학회에서 그를 만난 것을 기억한다.", category: "Infinitives & Gerunds", grammar: "remember + 동명사 (과거)" },
  { id: 66, en: "Please remember to lock the door when you leave.", ko: "나갈 때 문 잠그는 것을 기억해주세요.", category: "Infinitives & Gerunds", grammar: "remember + to부정사 (미래)" },
  { id: 67, en: "It is no use complaining about the situation.", ko: "상황에 대해 불평해봐야 소용없다.", category: "Infinitives & Gerunds", grammar: "It is no use + 동명사" },
  { id: 68, en: "He is looking forward to starting his new job.", ko: "그는 새 직장을 시작하는 것을 기대하고 있다.", category: "Infinitives & Gerunds", grammar: "look forward to + 동명사" },
  { id: 69, en: "To master a language requires years of practice.", ko: "언어를 마스터하려면 수년간의 연습이 필요하다.", category: "Infinitives & Gerunds", grammar: "to부정사 주어" },
  { id: 70, en: "She avoided making eye contact with the stranger.", ko: "그녀는 낯선 사람과 눈을 마주치는 것을 피했다.", category: "Infinitives & Gerunds", grammar: "avoid + 동명사" },

  // ── 8. Phrasal Verbs 구동사 (71-80) ──
  { id: 71, en: "Can you figure out how to solve this problem?", ko: "이 문제를 어떻게 풀지 알아낼 수 있니?", category: "Phrasal Verbs", grammar: "figure out" },
  { id: 72, en: "The meeting has been put off until next Monday.", ko: "회의가 다음 월요일로 연기되었다.", category: "Phrasal Verbs", grammar: "put off (연기하다)" },
  { id: 73, en: "She turned down the job offer because the salary was too low.", ko: "급여가 너무 낮아 그녀는 일자리 제안을 거절했다.", category: "Phrasal Verbs", grammar: "turn down (거절하다)" },
  { id: 74, en: "We need to come up with a new marketing strategy.", ko: "우리는 새로운 마케팅 전략을 내놓아야 한다.", category: "Phrasal Verbs", grammar: "come up with" },
  { id: 75, en: "He grew up in a small town in the countryside.", ko: "그는 시골의 작은 마을에서 자랐다.", category: "Phrasal Verbs", grammar: "grow up" },
  { id: 76, en: "I ran into an old friend at the supermarket yesterday.", ko: "어제 슈퍼마켓에서 옛 친구를 우연히 만났다.", category: "Phrasal Verbs", grammar: "run into (우연히 만나다)" },
  { id: 77, en: "Please look after my cat while I am on vacation.", ko: "내가 휴가 중일 때 고양이를 돌봐주세요.", category: "Phrasal Verbs", grammar: "look after" },
  { id: 78, en: "The airplane took off right on schedule.", ko: "비행기가 정시에 이륙했다.", category: "Phrasal Verbs", grammar: "take off (이륙하다)" },
  { id: 79, en: "She broke down in tears when she heard the news.", ko: "그녀는 소식을 듣고 울음을 터뜨렸다.", category: "Phrasal Verbs", grammar: "break down (감정)" },
  { id: 80, en: "He called off the wedding at the last minute.", ko: "그는 마지막 순간에 결혼을 취소했다.", category: "Phrasal Verbs", grammar: "call off (취소하다)" },

  // ── 9. Conjunctions & Transitions 접속사·연결어 (81-90) ──
  { id: 81, en: "Although it was raining heavily, we decided to go for a walk.", ko: "비가 심하게 왔지만 우리는 산책하기로 했다.", category: "Conjunctions & Transitions", grammar: "although 양보절" },
  { id: 82, en: "She studied hard so that she could pass the exam.", ko: "그녀는 시험에 합격하기 위해 열심히 공부했다.", category: "Conjunctions & Transitions", grammar: "so that 목적" },
  { id: 83, en: "Not only did he apologize, but he also offered to pay.", ko: "그는 사과했을 뿐만 아니라 비용도 지불하겠다고 했다.", category: "Conjunctions & Transitions", grammar: "not only ... but also" },
  { id: 84, en: "While some prefer coffee, others prefer tea.", ko: "어떤 사람은 커피를, 다른 사람은 차를 선호한다.", category: "Conjunctions & Transitions", grammar: "while 대조" },
  { id: 85, en: "I will help you on condition that you help me in return.", ko: "네가 나를 도와준다는 조건으로 나도 도와줄게.", category: "Conjunctions & Transitions", grammar: "on condition that" },
  { id: 86, en: "Whether you agree or not, I am going ahead with the plan.", ko: "네가 동의하든 하지 않든 나는 계획을 진행할 것이다.", category: "Conjunctions & Transitions", grammar: "whether ... or not" },
  { id: 87, en: "In spite of the difficulties, they managed to complete the project.", ko: "어려움에도 불구하고 그들은 프로젝트를 완성했다.", category: "Conjunctions & Transitions", grammar: "in spite of" },
  { id: 88, en: "As soon as the bell rings, the students rush out of the classroom.", ko: "종이 울리자마자 학생들이 교실 밖으로 뛰쳐나간다.", category: "Conjunctions & Transitions", grammar: "as soon as" },
  { id: 89, en: "Due to the heavy traffic, we arrived thirty minutes late.", ko: "심한 교통 체증으로 우리는 30분 늦게 도착했다.", category: "Conjunctions & Transitions", grammar: "due to + 명사" },
  { id: 90, en: "He went to work even though he had a terrible cold.", ko: "심한 감기에도 불구하고 그는 출근했다.", category: "Conjunctions & Transitions", grammar: "even though" },

  // ── 10. Tag Questions & Emphasis 부가의문·강조 (91-100) ──
  { id: 91, en: "You are coming to the party tonight, aren't you?", ko: "오늘 밤 파티에 오는 거지, 그렇지?", category: "Tag Questions & Emphasis", grammar: "긍정문 + 부정 꼬리" },
  { id: 92, en: "She doesn't know the answer, does she?", ko: "그녀는 답을 모르지, 그렇지?", category: "Tag Questions & Emphasis", grammar: "부정문 + 긍정 꼬리" },
  { id: 93, en: "It is you who should take responsibility for this.", ko: "이것에 대해 책임져야 할 사람은 바로 너다.", category: "Tag Questions & Emphasis", grammar: "It is ... who 강조" },
  { id: 94, en: "I do believe that honesty is the best policy.", ko: "나는 정직이 최선의 정책이라고 정말로 믿는다.", category: "Tag Questions & Emphasis", grammar: "do 강조" },
  { id: 95, en: "What I need is a long vacation by the sea.", ko: "내가 필요한 것은 바닷가에서의 긴 휴가이다.", category: "Tag Questions & Emphasis", grammar: "What절 강조" },
  { id: 96, en: "It was in Paris that they first met each other.", ko: "그들이 처음 만난 곳은 파리였다.", category: "Tag Questions & Emphasis", grammar: "It was ... that 강조구문" },
  { id: 97, en: "Let's finish this by Friday, shall we?", ko: "금요일까지 이것을 끝내자, 그렇게 할까?", category: "Tag Questions & Emphasis", grammar: "Let's + shall we" },
  { id: 98, en: "He did pass the exam, despite what everyone expected.", ko: "모두의 예상과 달리 그는 정말로 시험에 통과했다.", category: "Tag Questions & Emphasis", grammar: "did + 동사원형 강조" },
  { id: 99, en: "Never have I seen such a breathtaking landscape.", ko: "이렇게 숨 막히는 풍경은 본 적이 없다.", category: "Tag Questions & Emphasis", grammar: "부정부사 도치 강조" },
  { id: 100, en: "All I want is a chance to prove myself.", ko: "내가 원하는 건 나를 증명할 기회뿐이다.", category: "Tag Questions & Emphasis", grammar: "All + 관계절 강조" },
];
