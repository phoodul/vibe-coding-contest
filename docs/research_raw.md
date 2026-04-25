# 수학 튜터 SaaS 아키텍처 결정을 위한 추가 리서치 (2026-04-25)

> 1차 보고서(`user_docs/LLM_math_solver.md`) 이후 변경된 4가지 항목만 확인. Vercel + Next.js 15 + 1인 운영 SaaS 관점으로 평가.

---

## 섹션 1. 2026년 4월 기준 최신 LLM 수능 수학 정답률

### 주요 벤치마크 데이터 (2026년 2~4월 기준)

| 모델 | AIME 2025 (도구 없음) | AIME 2025 (코드 실행 허용) | MATH 벤치마크 |
|---|---|---|---|
| Gemini 3.1 Pro Preview | 92% | 100% | 95.1% |
| GPT-5.4 | 100% (확인) | 100% | 88.6% |
| Claude Sonnet 4.6 | ~89% | — | 89% |
| Claude Opus 4 | 90% (pass@1) | — | — |

출처: [Apiyi Math AI Comparison 2026](https://help.apiyi.com/en/best-ai-model-for-math-2026-en.html), [LM Council Benchmarks](https://lmcouncil.ai/benchmarks), [Automatio Claude Sonnet 4.6](https://automatio.ai/models/claude-sonnet-4-6)

- 신뢰도: MEDIUM (apiyi.com은 3rd-party 집계 사이트. Anthropic/OpenAI 공식 발표와 교차 확인 필요)
- 프로젝트 관련성: 9/10
- 최신성: 2026-02~04

### 한국 수능 수학 실측 데이터 (2026학년도 수능)

연세대 인공지능융합대 연구팀이 2026학년도 수능에 4개 모델(GPT-5, Gemini 2.5 Flash, Perplexity Sonus, DeepSeek)을 투입하여 평가:

- **GPT-5**: 확통 96점, 미적분 92점, 기하 84점 → 킬러문항인 확통 30번 1개만 정답, 나머지 고난도 전부 실패
- **DeepSeek**: 2위권, 일부 문항 무작위 추측 의심
- **Gemini 2.5 Flash**: ChatGPT 수준의 수학 정확도
- **Perplexity Sonus**: 최저 성적, 시스템 오류 다수

출처: [팩트체크 AI 수능 풀이 다음](https://v.daum.net/v/20251115070121527), [GitHub 2026-CSAT](https://github.com/hehee9/2026-CSAT)

- 신뢰도: HIGH (연구팀 주관, GitHub 오픈소스 결과)
- 프로젝트 관련성: 10/10
- 최신성: 2025-11 ~ 2026-04

### 1차 보고서(2025-12) 대비 업데이트 요약

| 항목 | 1차 보고서 | 2026-04 현재 |
|---|---|---|
| Gemini 최고 점수 | Gemini 3 Pro 92점 | Gemini 3.1 Pro AIME 100% (도구 허용) |
| GPT | GPT-5.1 80점 | GPT-5.4 AIME 100%, 수능 확통 96점 |
| Claude | Opus 4.5 84점 | Sonnet 4.6 MATH 89% |
| 킬러문항 현실 | 미정 | 최고 모델도 대부분 실패. 도구 허용 시 AIME는 완성 |

**핵심 인사이트**: "도구 허용 시 AIME 100%" vs "수능 킬러문항은 도구 허용해도 대부분 실패"라는 괴리가 확인됨. AIME는 순수 계산 위주, 수능 킬러는 도형·함수 해석·케이스 분류가 결합된 구조이기 때문. 즉, **단순 LLM 호출로는 수능 30번 해결 불가 → 6계층 아키텍처 필요성이 더 명확히 입증됨**.

**실무 결론 (Vercel + Next.js 15 + 1인 SaaS)**: 현재 코드베이스의 Sonnet 4.5/4.6은 미적분 개념 설명·중간 난이도 문제(1~25번)에는 충분하지만, 킬러문항(28~30번) 정답 보증을 위해서는 도구 실행 계층(SymPy 연동)이 필수. Gemini 3.1 Pro는 비용/API 복잡도 대비 효용이 불분명하므로 현재 Anthropic 스택 유지 권장.

---

## 섹션 2. Next.js 15 + Vercel 환경에서 SymPy/CAS 통합 옵션

### 옵션별 비교

| 방식 | Latency | 비용 | DX | 한계 |
|---|---|---|---|---|
| **Vercel Python 함수 + SymPy** | Cold start 1~3초 + SymPy 로딩 | Hobby 무료/Pro $20/월 | 간단 | SymPy 패키지 크기로 cold start 악화, 250MB 번들 한계 |
| **Pyodide (WASM) 클라이언트** | 최초 로딩 5~15초, 이후 빠름 | 무료 (클라이언트) | 복잡 | 번들 최적화 시 2× 속도 개선, 모바일 저사양 기기 위험 |
| **Railway/Render FastAPI** | 웜 상태 50~200ms | Railway $5~20/월 | 중간 | 별도 서비스 운영 부담 |
| **Wolfram Alpha API** | 100~500ms | 월 2000 콜 무료, 이후 $25+/월 | 매우 간단 | 비용 증가, 한국어 수식 입력 파싱 이슈 |
| **MathJS (JS 기반)** | <10ms | 무료 | 매우 간단 | 심볼릭 연산 불가, 수치 계산만 가능 |

출처: [Vercel Runtimes 공식](https://vercel.com/docs/functions/runtimes), [Vercel Fluid Compute](https://vercel.com/docs/fluid-compute), [Python Hosting Comparison 2025](https://www.nandann.com/blog/python-hosting-options-comparison), [Pyodide WASM 2026 Guide](https://glinteco.com/en/post/beyond-the-server-running-high-performance-python-in-the-browser-with-pyodide-and-webassembly-2026-guide/)

- Vercel Python 함수는 SymPy 포함 시 번들 크기로 인해 cold start 문제가 구조적으로 심각함
- Pyodide는 최적화 시 번들 40~55% 절감 가능하나, 수학 연산 특화 용도로 SaaS에 도입 시 UX 불안정
- Vercel 공식 권고: "장시간 CPU 바운드 작업은 Vercel Functions 부적합"

**추천 구현 경로**: Railway 또는 Render에 FastAPI + SymPy 마이크로서비스 배포 (월 $5~20), Next.js 앱에서 `/api/sympy` 프록시 라우트로 호출. 이미 Mathpix/Upstage OCR 외부 API 패턴이 코드베이스에 존재하므로 DX 일관성 유지 가능.

[추측] Vercel Edge Runtime에서 Pyodide를 돌리는 것은 2026년 4월 기준 공식 지원 사례가 없음.

**실무 결론**: Railway FastAPI + SymPy 마이크로서비스가 가장 현실적. 월 $5 Hobby 플랜으로 시작, SymPy 호출 빈도가 낮은 초기 단계에서는 별도 서비스 대신 GPT-5.4 Code Interpreter(함수 호출)로 대체하는 것도 유효한 중간 단계.

---

## 섹션 3. Claude/GPT 파인튜닝 가능 여부 (2026년 4월 기준)

### Claude 파인튜닝 현황

- **Anthropic 직접 API**: 파인튜닝 미지원 (2026-04 기준). 직접 API로는 커스텀 모델 생성 불가.
- **Amazon Bedrock 경유**: Claude 3 Haiku 파인튜닝만 GA (일반 공개). US West (Oregon) 리전. 텍스트 파인튜닝만, 비전 미지원.
- Claude 4.x (Sonnet 4.5/4.6, Opus 4.x) 파인튜닝: 미지원 상태.

출처: [AWS 공식 블로그 - Claude 3 Haiku Fine-tuning](https://aws.amazon.com/blogs/aws/fine-tuning-for-anthropics-claude-3-haiku-model-in-amazon-bedrock-is-now-generally-available/), [Pieces.app Claude Fine-tuning Guide](https://pieces.app/blog/claude-fine-tuning)

### GPT 파인튜닝 현황 (OpenAI)

- **SFT (Supervised Fine-Tuning)**: GPT-4o, GPT-4o-mini, GPT-4.1 nano 지원. GPT-5.4는 [추측] 아직 파인튜닝 미지원 가능성 높음.
- **RFT (Reinforcement Fine-Tuning)**: **o4-mini 전용**, 현재 GA. 비용 $100/시간(학습 루프 기준), 자동 상한 $5,000/작업.
- RFT 적합 조건: 전문가들이 독립적으로 채점 시 동의하는 명확한 정답이 있는 태스크 → 수능 수학 정답 정확도에 이상적.
- 데이터 요구량: 공식 문서에는 최소 수량 미명시, 단 "모델이 일부 성공 사례를 가져야 함" 조건.

출처: [OpenAI RFT 공식 문서](https://platform.openai.com/docs/guides/reinforcement-fine-tuning), [OpenAI Community 발표](https://community.openai.com/t/fine-tuning-updates-reinforcement-fine-tuning-now-available-gpt-4-1-nano-fine-tuning/1255539), [VentureBeat o4-mini RFT](https://venturebeat.com/ai/you-can-now-fine-tune-your-enterprises-own-version-of-openais-o4-mini-reasoning-model-with-reinforcement-learning/)

### 오픈소스 모델 파인튜닝 비교

- **Qwen3-8B**: DeepSeek-R1 CoT 출력으로 파인튜닝 시 Qwen3-32B보다 AIME 성능 우수. 한국어 추론 RL 파인튜닝 연구 존재 (30,000 샘플, DeepSeek-R1 蒸馏).
- **Qwen2.5-Math**: 수학 특화 사전학습 모델, 자체 개선(Self-Improvement) 아키텍처.
- 한국어 교사 1인이 자신의 풀이 스타일로 학습: **현실적으로 매우 어려움** — 오픈소스 모델 파인튜닝은 GPU 서버 필요 (A100 × 수 대), 데이터 큐레이션 전문성 필요.

출처: [Qwen3 Technical Report arXiv](https://arxiv.org/pdf/2505.09388), [Making Qwen3 Think in Korean arXiv](https://arxiv.org/html/2508.10355v1)

### "교사 1인 스타일 학습" 현실성 평가

| 접근법 | 데이터 필요량 | 비용 | 현실성 |
|---|---|---|---|
| Claude Bedrock 파인튜닝 | ~수백 샘플 | 추정 수십만 원 + AWS 비용 | 낮음 (Haiku만 가능, 성능 낮음) |
| GPT-4.1 nano SFT | ~수십~수백 샘플 | 학습 $X/1K토큰 | 중간 (4.1 nano는 성능 낮음) |
| o4-mini RFT | 불명확, grader 함수 필요 | $100/시간, 상한 $5,000 | 중간 (비용 고려 필요) |
| Qwen3-8B 오픈소스 SFT | ~1,000~30,000 샘플 | GPU 서버 $50~500 | 낮음 (인프라 부담) |
| **프롬프트 + RAG + few-shot** | 0 | API 호출 비용만 | **높음** |

**실무 결론**: 1인 SaaS 단계에서 파인튜닝은 ROI가 낮음. 현재 530문항 수능 풀이 DB를 RAG로 활용하는 방식이 파인튜닝보다 훨씬 실용적. 향후 사용자 수가 수천 명 이상 확보된 후 o4-mini RFT를 검토하는 것이 타당.

---

## 섹션 4. Mathpix API 가격 + 한국어 교과서 OCR 대안

### Mathpix Convert API 가격 (2026년 기준)

| 서비스 | 단가 (0~100만 건) | 단가 (100만 건+) | 비고 |
|---|---|---|---|
| 이미지 OCR (v3/text 등) | $0.002/이미지 | $0.0015/이미지 | |
| PDF OCR (v3/pdf) | $0.005/페이지 | $0.0035/페이지 | |
| 디지털 펜 세션 (1K 이하) | 무료 | — | |
| 설정 비용 | $19.99 (1회) | — | $29 크레딧 지급 |

출처: [Mathpix Convert API Pricing](https://mathpix.com/pricing/api)

- 무료 티어: 없음 (테스트용 $29 크레딧만 제공)
- 한국어(한글) 지원: 공식 언어 목록에 포함 ([Mathpix Language Support](https://mathpix.com/language-support))
- 신뢰도: HIGH (공식 페이지)

**사용 시나리오별 월 비용 예시**: 학생 100명 × 월 10문항 촬영 = 1,000 이미지 → $2/월

### Upstage Document Parse 가격 비교

| 서비스 | 단가 |
|---|---|
| Document Parse Standard | $0.01/페이지 |
| Document Parse Enhanced | $0.03/페이지 |
| Document OCR (텍스트만) | $0.0015/페이지 |
| Information Extract Standard | $0.04/페이지 |

출처: [Upstage Pricing](https://www.upstage.ai/pricing)

- Upstage Document Parse Enhanced 기준: Mathpix 이미지 단가($0.002)의 15배 비쌈
- 단, Upstage는 한국어에 최적화된 레이아웃 파싱 강점. 수식 OCR 전문성은 Mathpix가 우위.

### 오픈소스 대안: Pix2Text

- 최신 버전 v1.1.4 (2025-07): MFR-1.5 모델 기반
- 수식 OCR 정확도: 표준 벤치마크 95%+ (Mathpix 97% 대비 약 2% 낮음)
- 한국어: 80개+ 언어 지원 목록에 포함되나 한국어 특화 테스트 데이터 없음
- 모바일 사진: 인쇄물 OK, 필기체는 VLM(GPT-4V, Claude) 병행 필요
- 비용: 무료 (자체 서버 필요, GPU 없이도 CPU 동작 가능)

출처: [Pix2Text GitHub](https://github.com/breezedeus/Pix2Text), [Pix2Text BrightCoding 2026](https://www.blog.brightcoding.dev/2026/03/13/pix2text-the-revolutionary-markdown-converter-every-developer-needs)

### 한국 학생 폰 사진 환경 평가

| 솔루션 | 수식 정확도 | 한국어 | 모바일 필기 | 비용 |
|---|---|---|---|---|
| Mathpix API | 99%+ | O | O (최고) | $0.002/이미지 |
| Upstage Document Parse | 높음 (문서 구조) | O (최적화) | 제한적 | $0.01~0.03/페이지 |
| Pix2Text v1.1.4 | 95%+ | 제한적 | VLM 필요 | 무료 (서버 필요) |
| Nougat (Meta) | 높음 | X (한국어 취약) | X | 무료 (GPU 필요) |

[추측] 한국 학생 실제 촬영 환경(기울어진 각도, 야간 조명, 형광펜 표시)에서 Mathpix vs Pix2Text 직접 비교 데이터는 공개된 벤치마크 없음.

**실무 결론**: 현재 코드베이스에 이미 Mathpix 라우트가 구현되어 있고, 초기 단계(학생 100명 미만)에서는 월 $2~5 수준으로 비용 부담이 없음. Pix2Text는 서버 운영 복잡도 증가 대비 절감 효과가 미미하므로, Mathpix 유지 + 페이지당 $0.002 이미지 단가를 기준으로 서비스 규모 측정 권장.

---

## 종합 요약 (1인 SaaS 실무 관점)

| 결정 항목 | 권장 방향 |
|---|---|
| 기반 모델 | Sonnet 4.6 유지 (킬러문항은 도구 실행으로 보완) |
| CAS/SymPy 통합 | Railway FastAPI 마이크로서비스 (월 $5~20) |
| 파인튜닝 | 현 단계 불필요. RAG + few-shot으로 충분. 추후 o4-mini RFT 검토 |
| OCR | Mathpix 유지 ($0.002/이미지, 현 코드베이스 호환) |
