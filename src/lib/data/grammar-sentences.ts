/**
 * ESL 핵심 영문법 100문장
 *
 * 선정 기준 (Applied Linguistics + TESOL 기반):
 * - 각 문장이 하나의 핵심 문법 포인트를 대표하는 프로토타입
 * - 일상 실용성이 높은 자연스러운 문장
 * - 10개 카테고리 × 10문장 = 100문장
 * - 난이도 점진적 상승 (A2 → C1)
 *
 * 참고: Pimsleur Method, Audio-Lingual Method, Cambridge English Corpus
 */

export interface GrammarSentence {
  id: number;
  en: string;
  ko: string;
  category: string;
  grammar: string;
}

export const GRAMMAR_CATEGORIES = [
  "Sentence Patterns",
  "Present Tenses",
  "Past Tenses",
  "Future & Perfect",
  "Modal Verbs",
  "Infinitives & Gerunds",
  "Conditionals",
  "Passive Voice",
  "Relative Clauses & Connectors",
  "Advanced Structures",
] as const;

export const GRAMMAR_SENTENCES: GrammarSentence[] = [
  // ── 1. Sentence Patterns (문장 형식) ──
  { id: 1, en: "The sun rises in the east.", ko: "태양은 동쪽에서 뜬다.", category: "Sentence Patterns", grammar: "1형식 (S+V)" },
  { id: 2, en: "She looks happy today.", ko: "그녀는 오늘 행복해 보인다.", category: "Sentence Patterns", grammar: "2형식 (S+V+C)" },
  { id: 3, en: "I enjoy reading books on weekends.", ko: "나는 주말에 책 읽는 것을 즐긴다.", category: "Sentence Patterns", grammar: "3형식 (S+V+O)" },
  { id: 4, en: "She gave me a wonderful birthday present.", ko: "그녀는 나에게 멋진 생일 선물을 주었다.", category: "Sentence Patterns", grammar: "4형식 (S+V+IO+DO)" },
  { id: 5, en: "The news made everyone surprised.", ko: "그 소식은 모든 사람을 놀라게 했다.", category: "Sentence Patterns", grammar: "5형식 (S+V+O+OC)" },
  { id: 6, en: "There are many students in the classroom.", ko: "교실에 많은 학생들이 있다.", category: "Sentence Patterns", grammar: "There + be 구문" },
  { id: 7, en: "It is important to be honest with yourself.", ko: "자기 자신에게 정직한 것이 중요하다.", category: "Sentence Patterns", grammar: "가주어 It 구문" },
  { id: 8, en: "What she said was absolutely true.", ko: "그녀가 말한 것은 절대적으로 사실이었다.", category: "Sentence Patterns", grammar: "명사절 주어" },
  { id: 9, en: "He asked me to help him with his homework.", ko: "그는 나에게 숙제를 도와달라고 부탁했다.", category: "Sentence Patterns", grammar: "5형식 (to부정사 보어)" },
  { id: 10, en: "They elected her class president.", ko: "그들은 그녀를 반장으로 선출했다.", category: "Sentence Patterns", grammar: "5형식 (명사 보어)" },

  // ── 2. Present Tenses (현재 시제) ──
  { id: 11, en: "I usually wake up at seven in the morning.", ko: "나는 보통 아침 7시에 일어난다.", category: "Present Tenses", grammar: "현재 단순 (습관)" },
  { id: 12, en: "Water boils at one hundred degrees Celsius.", ko: "물은 섭씨 100도에서 끓는다.", category: "Present Tenses", grammar: "현재 단순 (과학적 사실)" },
  { id: 13, en: "She doesn't eat meat because she is vegetarian.", ko: "그녀는 채식주의자라서 고기를 먹지 않는다.", category: "Present Tenses", grammar: "현재 단순 부정문" },
  { id: 14, en: "Do you speak any other languages?", ko: "다른 언어를 할 줄 아시나요?", category: "Present Tenses", grammar: "현재 단순 의문문" },
  { id: 15, en: "I am currently working on a new project.", ko: "나는 현재 새 프로젝트를 진행하고 있다.", category: "Present Tenses", grammar: "현재 진행형" },
  { id: 16, en: "The children are playing in the park right now.", ko: "아이들이 지금 공원에서 놀고 있다.", category: "Present Tenses", grammar: "현재 진행형 (현재 동작)" },
  { id: 17, en: "He is always complaining about the weather.", ko: "그는 항상 날씨에 대해 불평한다.", category: "Present Tenses", grammar: "현재 진행형 (반복적 불만)" },
  { id: 18, en: "We are meeting our friends for dinner tonight.", ko: "우리는 오늘 저녁 친구들과 만나기로 했다.", category: "Present Tenses", grammar: "현재 진행형 (확정된 미래)" },
  { id: 19, en: "I have lived in this city for ten years.", ko: "나는 이 도시에 10년 동안 살고 있다.", category: "Present Tenses", grammar: "현재 완료 (계속)" },
  { id: 20, en: "Have you ever been to London?", ko: "런던에 가 본 적 있나요?", category: "Present Tenses", grammar: "현재 완료 (경험)" },

  // ── 3. Past Tenses (과거 시제) ──
  { id: 21, en: "I visited my grandparents last weekend.", ko: "나는 지난 주말에 조부모님을 방문했다.", category: "Past Tenses", grammar: "과거 단순" },
  { id: 22, en: "She didn't come to the meeting yesterday.", ko: "그녀는 어제 회의에 오지 않았다.", category: "Past Tenses", grammar: "과거 단순 부정문" },
  { id: 23, en: "What did you do during the summer vacation?", ko: "여름 방학 동안 무엇을 했나요?", category: "Past Tenses", grammar: "과거 단순 의문문" },
  { id: 24, en: "I was reading a book when the phone rang.", ko: "전화가 울렸을 때 나는 책을 읽고 있었다.", category: "Past Tenses", grammar: "과거 진행형 (when절)" },
  { id: 25, en: "While she was cooking, he was setting the table.", ko: "그녀가 요리하는 동안 그는 식탁을 차리고 있었다.", category: "Past Tenses", grammar: "과거 진행형 (while절)" },
  { id: 26, en: "I had already finished my homework before dinner.", ko: "나는 저녁 식사 전에 이미 숙제를 끝냈었다.", category: "Past Tenses", grammar: "과거 완료 (대과거)" },
  { id: 27, en: "By the time we arrived, the movie had started.", ko: "우리가 도착했을 때, 영화는 이미 시작했었다.", category: "Past Tenses", grammar: "과거 완료 (by the time)" },
  { id: 28, en: "She used to play the piano when she was young.", ko: "그녀는 어렸을 때 피아노를 치곤 했다.", category: "Past Tenses", grammar: "used to (과거 습관)" },
  { id: 29, en: "I would often walk along the river after school.", ko: "나는 방과 후에 종종 강을 따라 걷곤 했다.", category: "Past Tenses", grammar: "would (과거 반복 행동)" },
  { id: 30, en: "It took me three hours to finish the report.", ko: "보고서를 끝내는 데 세 시간이 걸렸다.", category: "Past Tenses", grammar: "It takes + 시간 (과거)" },

  // ── 4. Future & Perfect (미래 & 완료) ──
  { id: 31, en: "I will call you as soon as I arrive.", ko: "도착하면 바로 전화할게요.", category: "Future & Perfect", grammar: "will + 시간 부사절" },
  { id: 32, en: "She is going to study abroad next year.", ko: "그녀는 내년에 유학을 갈 예정이다.", category: "Future & Perfect", grammar: "be going to (계획)" },
  { id: 33, en: "The train leaves at nine o'clock tomorrow morning.", ko: "기차는 내일 아침 9시에 출발한다.", category: "Future & Perfect", grammar: "현재 단순 (시간표 미래)" },
  { id: 34, en: "By next month, I will have completed this course.", ko: "다음 달이면 나는 이 과정을 마치게 될 것이다.", category: "Future & Perfect", grammar: "미래 완료" },
  { id: 35, en: "I have been studying English for five years.", ko: "나는 5년 동안 영어를 공부해 오고 있다.", category: "Future & Perfect", grammar: "현재 완료 진행형" },
  { id: 36, en: "She had been waiting for two hours before he came.", ko: "그가 오기 전에 그녀는 두 시간 동안 기다리고 있었다.", category: "Future & Perfect", grammar: "과거 완료 진행형" },
  { id: 37, en: "This time next week, I will be lying on the beach.", ko: "다음 주 이맘때 나는 해변에 누워 있을 것이다.", category: "Future & Perfect", grammar: "미래 진행형" },
  { id: 38, en: "I have just finished reading this novel.", ko: "나는 방금 이 소설을 다 읽었다.", category: "Future & Perfect", grammar: "현재 완료 (완료)" },
  { id: 39, en: "They have known each other since childhood.", ko: "그들은 어린 시절부터 서로 알고 지내왔다.", category: "Future & Perfect", grammar: "현재 완료 (since)" },
  { id: 40, en: "He has gone to Paris, so he is not here.", ko: "그는 파리에 갔기 때문에 여기에 없다.", category: "Future & Perfect", grammar: "have gone vs have been" },

  // ── 5. Modal Verbs (조동사) ──
  { id: 41, en: "You must wear a seatbelt while driving.", ko: "운전할 때 반드시 안전벨트를 매야 한다.", category: "Modal Verbs", grammar: "must (의무)" },
  { id: 42, en: "Can you help me carry these boxes?", ko: "이 상자들 옮기는 것을 도와줄 수 있나요?", category: "Modal Verbs", grammar: "can (요청)" },
  { id: 43, en: "You should see a doctor if you feel unwell.", ko: "몸이 안 좋으면 의사를 만나봐야 해요.", category: "Modal Verbs", grammar: "should (조언)" },
  { id: 44, en: "May I use your phone for a moment?", ko: "잠깐 전화기를 써도 될까요?", category: "Modal Verbs", grammar: "may (정중한 허가)" },
  { id: 45, en: "She might be late because of the heavy traffic.", ko: "교통이 심해서 그녀가 늦을 수도 있다.", category: "Modal Verbs", grammar: "might (추측)" },
  { id: 46, en: "Would you mind opening the window?", ko: "창문을 열어 주시겠어요?", category: "Modal Verbs", grammar: "would you mind (정중한 요청)" },
  { id: 47, en: "You don't have to come if you're busy.", ko: "바쁘면 올 필요 없어요.", category: "Modal Verbs", grammar: "don't have to (불필요)" },
  { id: 48, en: "He must have forgotten about the appointment.", ko: "그는 약속을 잊어버렸음에 틀림없다.", category: "Modal Verbs", grammar: "must have p.p. (과거 추측)" },
  { id: 49, en: "You could have told me about it earlier.", ko: "더 일찍 나에게 말해줄 수도 있었잖아.", category: "Modal Verbs", grammar: "could have p.p. (과거 가능)" },
  { id: 50, en: "We had better leave now, or we'll miss the bus.", ko: "지금 출발하는 게 좋겠어요, 안 그러면 버스를 놓칠 거예요.", category: "Modal Verbs", grammar: "had better (충고/경고)" },

  // ── 6. Infinitives & Gerunds (준동사) ──
  { id: 51, en: "I decided to change my career path.", ko: "나는 진로를 바꾸기로 결심했다.", category: "Infinitives & Gerunds", grammar: "to부정사 목적어 (decide)" },
  { id: 52, en: "She enjoys listening to music while studying.", ko: "그녀는 공부하면서 음악 듣는 것을 즐긴다.", category: "Infinitives & Gerunds", grammar: "동명사 목적어 (enjoy)" },
  { id: 53, en: "I stopped to drink some water during the hike.", ko: "등산 중에 물을 마시기 위해 멈추었다.", category: "Infinitives & Gerunds", grammar: "stop + to부정사 (목적)" },
  { id: 54, en: "He stopped smoking last year for his health.", ko: "그는 건강을 위해 작년에 담배를 끊었다.", category: "Infinitives & Gerunds", grammar: "stop + 동명사 (중단)" },
  { id: 55, en: "I remember meeting her at the conference.", ko: "나는 학회에서 그녀를 만난 것을 기억한다.", category: "Infinitives & Gerunds", grammar: "remember + 동명사 (과거)" },
  { id: 56, en: "Remember to lock the door when you leave.", ko: "나갈 때 문을 잠그는 것을 잊지 마세요.", category: "Infinitives & Gerunds", grammar: "remember + to부정사 (미래)" },
  { id: 57, en: "It is no use crying over spilled milk.", ko: "엎질러진 물에 우는 것은 소용없다.", category: "Infinitives & Gerunds", grammar: "It is no use + 동명사" },
  { id: 58, en: "To be honest, I didn't understand the lecture.", ko: "솔직히 말하면, 나는 그 강의를 이해하지 못했다.", category: "Infinitives & Gerunds", grammar: "독립 부정사" },
  { id: 59, en: "She made her children clean their rooms.", ko: "그녀는 아이들에게 방을 청소하게 했다.", category: "Infinitives & Gerunds", grammar: "사역동사 make + 원형부정사" },
  { id: 60, en: "I saw him cross the street a moment ago.", ko: "나는 조금 전에 그가 길을 건너는 것을 보았다.", category: "Infinitives & Gerunds", grammar: "지각동사 + 원형부정사" },

  // ── 7. Conditionals (조건문 & 가정법) ──
  { id: 61, en: "If you heat ice, it melts.", ko: "얼음을 가열하면 녹는다.", category: "Conditionals", grammar: "조건문 0형 (과학적 사실)" },
  { id: 62, en: "If it rains tomorrow, we will cancel the picnic.", ko: "내일 비가 오면 소풍을 취소할 것이다.", category: "Conditionals", grammar: "조건문 1형 (실현 가능)" },
  { id: 63, en: "If I had more time, I would travel around the world.", ko: "시간이 더 있다면 세계 여행을 할 텐데.", category: "Conditionals", grammar: "가정법 과거 (현재 반대)" },
  { id: 64, en: "If I had studied harder, I would have passed the exam.", ko: "더 열심히 공부했더라면 시험에 합격했을 텐데.", category: "Conditionals", grammar: "가정법 과거완료" },
  { id: 65, en: "I wish I could speak French fluently.", ko: "프랑스어를 유창하게 말할 수 있으면 좋겠다.", category: "Conditionals", grammar: "I wish + 가정법 과거" },
  { id: 66, en: "I wish I had taken that opportunity.", ko: "그 기회를 잡았더라면 좋았을 텐데.", category: "Conditionals", grammar: "I wish + 가정법 과거완료" },
  { id: 67, en: "If I were you, I would accept the offer.", ko: "내가 너라면 그 제안을 받아들이겠어.", category: "Conditionals", grammar: "If I were you (조언)" },
  { id: 68, en: "Unless you hurry up, we will be late.", ko: "서두르지 않으면 우리는 늦을 것이다.", category: "Conditionals", grammar: "unless (= if not)" },
  { id: 69, en: "As long as you do your best, I'll be proud of you.", ko: "최선을 다하는 한, 난 네가 자랑스러울 거야.", category: "Conditionals", grammar: "as long as (조건)" },
  { id: 70, en: "Without water, nothing on earth could survive.", ko: "물이 없다면, 지구상의 어떤 것도 생존할 수 없을 것이다.", category: "Conditionals", grammar: "Without + 가정법" },

  // ── 8. Passive Voice (수동태) ──
  { id: 71, en: "English is spoken in many countries around the world.", ko: "영어는 전 세계 많은 나라에서 사용된다.", category: "Passive Voice", grammar: "현재 수동태" },
  { id: 72, en: "The bridge was built over a hundred years ago.", ko: "그 다리는 100년이 넘게 전에 건설되었다.", category: "Passive Voice", grammar: "과거 수동태" },
  { id: 73, en: "A new hospital will be opened next year.", ko: "새 병원이 내년에 개원될 것이다.", category: "Passive Voice", grammar: "미래 수동태" },
  { id: 74, en: "The letter has already been sent to the client.", ko: "편지는 이미 고객에게 발송되었다.", category: "Passive Voice", grammar: "완료 수동태" },
  { id: 75, en: "The room is being cleaned at the moment.", ko: "방이 지금 청소되고 있다.", category: "Passive Voice", grammar: "진행 수동태" },
  { id: 76, en: "He is said to be the best teacher in the school.", ko: "그는 학교에서 최고의 선생님이라고 한다.", category: "Passive Voice", grammar: "It is said that 변환" },
  { id: 77, en: "She was given a scholarship for her academic achievements.", ko: "그녀는 학업 성취도로 장학금을 받았다.", category: "Passive Voice", grammar: "4형식 수동태" },
  { id: 78, en: "The meeting has been postponed until next Monday.", ko: "회의는 다음 주 월요일로 연기되었다.", category: "Passive Voice", grammar: "완료 수동태 (비즈니스)" },
  { id: 79, en: "The suspect is believed to have left the country.", ko: "용의자는 나라를 떠난 것으로 추정된다.", category: "Passive Voice", grammar: "수동태 + to have p.p." },
  { id: 80, en: "Children should be encouraged to read more books.", ko: "아이들이 더 많은 책을 읽도록 격려해야 한다.", category: "Passive Voice", grammar: "조동사 수동태" },

  // ── 9. Relative Clauses & Connectors (관계절 & 접속) ──
  { id: 81, en: "The woman who lives next door is a famous writer.", ko: "옆집에 사는 여자는 유명한 작가이다.", category: "Relative Clauses & Connectors", grammar: "주격 관계대명사 who" },
  { id: 82, en: "This is the book that changed my life.", ko: "이것은 내 인생을 바꾼 책이다.", category: "Relative Clauses & Connectors", grammar: "주격 관계대명사 that" },
  { id: 83, en: "The restaurant where we had dinner was excellent.", ko: "우리가 저녁을 먹은 식당은 훌륭했다.", category: "Relative Clauses & Connectors", grammar: "관계부사 where" },
  { id: 84, en: "I'll never forget the day when I graduated.", ko: "나는 졸업한 날을 절대 잊지 못할 것이다.", category: "Relative Clauses & Connectors", grammar: "관계부사 when" },
  { id: 85, en: "Although it was raining, we decided to go hiking.", ko: "비가 오고 있었지만, 우리는 등산을 가기로 했다.", category: "Relative Clauses & Connectors", grammar: "양보 접속사 although" },
  { id: 86, en: "Not only is she smart, but she is also kind.", ko: "그녀는 똑똑할 뿐만 아니라 친절하기도 하다.", category: "Relative Clauses & Connectors", grammar: "not only ~ but also (도치)" },
  { id: 87, en: "The harder you work, the more successful you will be.", ko: "더 열심히 일할수록, 더 성공할 것이다.", category: "Relative Clauses & Connectors", grammar: "the 비교급, the 비교급" },
  { id: 88, en: "He studied hard so that he could pass the exam.", ko: "그는 시험에 합격할 수 있도록 열심히 공부했다.", category: "Relative Clauses & Connectors", grammar: "so that (목적)" },
  { id: 89, en: "Whether you agree or not, we have to follow the rules.", ko: "네가 동의하든 안 하든, 우리는 규칙을 따라야 한다.", category: "Relative Clauses & Connectors", grammar: "whether ~ or not" },
  { id: 90, en: "I have a friend whose father is a diplomat.", ko: "나는 아버지가 외교관인 친구가 있다.", category: "Relative Clauses & Connectors", grammar: "소유격 관계대명사 whose" },

  // ── 10. Advanced Structures (고급 구문) ──
  { id: 91, en: "It was not until midnight that he finished the project.", ko: "자정이 되어서야 그는 프로젝트를 끝냈다.", category: "Advanced Structures", grammar: "강조 구문 (It was ~ that)" },
  { id: 92, en: "Had I known the truth, I would have acted differently.", ko: "사실을 알았더라면, 나는 다르게 행동했을 것이다.", category: "Advanced Structures", grammar: "가정법 도치" },
  { id: 93, en: "So beautiful was the sunset that everyone stopped to watch.", ko: "석양이 너무 아름다워서 모두가 멈춰 서서 보았다.", category: "Advanced Structures", grammar: "So ~ that 도치" },
  { id: 94, en: "No sooner had I arrived than it started to rain.", ko: "내가 도착하자마자 비가 내리기 시작했다.", category: "Advanced Structures", grammar: "No sooner ~ than 도치" },
  { id: 95, en: "Little did I know that the decision would change my life.", ko: "그 결정이 내 인생을 바꿀 줄은 꿈에도 몰랐다.", category: "Advanced Structures", grammar: "부정어 도치 (Little)" },
  { id: 96, en: "Not until you experience failure do you truly appreciate success.", ko: "실패를 경험하고 나서야 비로소 성공을 진정으로 감사할 수 있다.", category: "Advanced Structures", grammar: "Not until 도치" },
  { id: 97, en: "What matters most is not where you start but where you finish.", ko: "가장 중요한 것은 어디서 시작하느냐가 아니라 어디서 끝나느냐이다.", category: "Advanced Structures", grammar: "What 명사절 + not A but B" },
  { id: 98, en: "The more I learn, the more I realize how much I don't know.", ko: "배우면 배울수록 내가 얼마나 모르는지 더 깨닫게 된다.", category: "Advanced Structures", grammar: "the 비교급 + 간접의문" },
  { id: 99, en: "It is essential that every student attend the orientation.", ko: "모든 학생이 오리엔테이션에 참석하는 것이 필수적이다.", category: "Advanced Structures", grammar: "당위의 should 생략 (가정법 현재)" },
  { id: 100, en: "Were it not for your support, I could not have succeeded.", ko: "당신의 도움이 아니었다면, 나는 성공하지 못했을 것이다.", category: "Advanced Structures", grammar: "가정법 도치 (Were it not for)" },
];
