바이브코딩 2026 본선까지 남은 일주일, 승패는 \*\*'에이전트에게 얼마나 명확한 페르소나와 권한을 부여하느냐'\*\*에 달려 있습니다. 사수로서 제안하신 7일 완성 파이프라인을 Claude Code(Antigravity)에서 실질적으로 구동하기 위한 **Rule, Skill, Workflow 최적화 세팅**을 정리해 드립니다.

-----

## 1\. Rules: 에이전트의 영혼 (Personality & Standards)

프로젝트 루트에 `.clauderules` 파일을 생성하고 아래 내용을 주입하세요. Claude 4.6 Opus가 단순한 코더를 넘어 '우승을 노리는 아키텍트'로 동작하게 만듭니다.

```markdown
# Vibe Coding 2026 Winning Rules

## Role & Vibe
- 너는 세계 최고의 Full-stack Senior Engineer이자 UX 디자이너이다.
- 모든 코드는 'Vibe'가 있어야 한다. 즉, 시각적으로 아름답고, 애니메이션이 매끄러우며, 사용자 경험이 직관적이어야 한다.

## Tech Stack Rules (Next.js 15 + Shadcn)
- **Shadcn UI:** 라이브러리가 아닌 '소스 코드'로 취급하라. 프로젝트의 디자인 토큰(`tailwind.config.ts`)과 일치하도록 적극적으로 커스텀하라.
- **Micro-interactions:** 모든 클릭 가능한 요소에는 Framer Motion 혹은 CSS Transition을 적용하여 '살아있는' 느낌을 주라.
- **Error Boundaries:** 모든 핵심 컴포넌트에 에러 바운더리와 스켈레톤 UI를 적용하여 완결성을 높여라.

## Communication Rule
- 코드를 수정하기 전 반드시 `implementation_plan.md`를 작성하고 승인을 받아라.
- "어떻게 구현할까요?"라고 묻기보다 "우승을 위해 A보다 B 방식이 더 임팩트 있어 보여 제안합니다"라고 능동적으로 의견을 제시하라.
```

-----

## 2\. Skills: 에이전트의 손발 (MCP & Tools)

Claude Code의 기능을 확장하는 **MCP(Model Context Protocol)** 서버를 연동하세요. 일주일이라는 짧은 시간 동안 수동 작업을 최소화합니다.

| 추천 MCP 스킬 | 목적 | 설치 및 활용 |
| :--- | :--- | :--- |
| **Supabase MCP** | DB 스키마 생성 및 관리 | `/mcp install supabase` (테이블 생성 및 RLS 설정을 자연어로 수행) |
| **Vercel MCP** | 즉시 배포 및 로그 확인 | `/mcp install vercel` (Day 6-7 배포 및 실시간 디버깅 자동화) |
| **Playwright MCP** | UI/UX 자동 검증 | 브라우저를 직접 띄워 화면을 캡처하고 Claude가 'Vibe'를 직접 확인하게 함. |
| **Sequential Thinking** | 복잡한 로직 설계 | 복잡한 비즈니스 로직(Day 3-4) 구현 시 논리적 오류를 스스로 방지함. |

-----

## 3\. Workflows: 에이전트의 작전 (Automation)

Claude Code 내에서 반복적으로 실행할 '커스텀 워크플로우'를 정의하세요. 터미널 명령어로 바로 호출할 수 있도록 설정하는 것이 핵심입니다.

### **Workflow A: [Day 1-2] "The Architect Mode"**

아이디어를 실제 프로젝트 구조로 즉시 변환합니다.

  * **명령어:** `claude "Architecture workflow: 아이디어를 분석하고 스키마와 폴더 구조를 생성해줘"`
  * **흐름:** 기획 분석 → `schema.sql` 생성 → `nextjs15-init` 스킬 호출 → 기본 레이아웃 구성.

### **Workflow B: [Day 5] "The Vibe Polishing"**

완성된 기능에 디자인 감각을 입힙니다.

  * **명령어:** `claude "Vibe-check workflow: 현재 페이지의 UI를 분석하고 애니메이션과 색감을 개선해줘"`
  * **흐름:** Playwright로 스크린샷 캡처 → 이미지 분석 → Framer Motion 코드 추가 → 스타일 최적화.

### **Workflow C: [Day 6] "Zero-Bug Deployment"**

배포 전 마지막 방어선을 구축합니다.

  * **명령어:** `claude "QA workflow: 보안 취약점을 찾고 Vercel에 배포해줘"`
  * **흐름:** 정적 코드 분석 → 엣지 케이스 테스트 코드 작성/실행 → 빌드 체크 → Vercel 배포.

-----

## 🔗 참고 및 도구 링크

  * **[Claude Code Official Documentation](https://code.claude.com/docs):** Antigravity 인터페이스의 최신 명령어와 설정법을 확인할 수 있습니다.
  * **[FastMCP Skill Registry](https://www.google.com/search?q=https://fastmcp.me/skills):** `nextjs15-init` 등 2026년형 최신 스킬셋을 검색하고 설치하세요.
  * **[Vibe Coding Trends 2026 (GitHub)](https://www.google.com/search?q=https://github.com/topics/vibe-coding):** 최근 우승자들이 사용한 `.clauderules` 템플릿과 디자인 트렌드를 참고하세요.

**마지막 조언:** 일주일간 Claude는 당신의 조수가 아니라 \*\*'공동 창업자'\*\*입니다. "이거 해줘"가 아니라 \*\*"우승하려면 여기서 어떤 Vibe를 더 추가해야 할까?"\*\*라고 물으세요. 그 질문 하나가 Day 7의 결과물을 바꿉니다. 행운을 빕니다\! 🏆