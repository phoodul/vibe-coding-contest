/**
 * 22차 (2026-05-09) — Maestro 4 과목 전용 채팅 컴포넌트.
 *
 * Maestro / Legend 분리 5 phase 의 Phase 4 (점진 분리 1단계).
 *
 * 이전: 19차에 별도 MaestroChat stub 이 있었으나 BetaChat 보다 기능 미달 (multimodal
 * marker · 풀이 정리 버튼 · 페르소나 4 카드 modal · 수능 기출 panel · INPUT_PARSING_RULES
 * 미지원) → 4 maestro 페이지가 BetaChat (subject prop) 사용으로 통일됨.
 *
 * 22차 (현재): 사용자 결정 = "Maestro와 Legend를 분리해". 진짜 분리는 BetaChat 1500+
 * 줄 추출 필요 = 큰 작업, 회귀 위험. 본 commit 은 점진 분리 1단계:
 *   - 4 maestro 페이지가 `@/components/maestro/MaestroChat` 으로 import 통일
 *   - 내부 구현은 BetaChat 재사용 (subject prop 강제)
 *   - 다음 commit: BetaChat 의 maestro-specific 코드를 본 컴포넌트로 추출
 *     wrapper 안만 변경 → 4 페이지 import 무영향 (점진 migration safe).
 *
 * 추출 예정 영역 (다음 commit):
 *   - 페르소나 4 카드 + ScienceExamPanel + 수능 번호 클릭 multimodal 첨부
 *   - useChat api = `/api/maestro/${subject}/tutor` (이미 BetaChat 분기됨)
 *   - 입력 placeholder + INPUT_PARSING_RULES 안내 (이미 BetaChat 분기됨)
 *   - MaestroSolutionSummaryButton + MaestroSummaryCard
 *   - Trigger / 리포트 링크 maestro 분기
 */
'use client';

import { BetaChat } from '@/components/legend/BetaChat';
import type { Subject } from '@/lib/types/subject';

interface User {
  id: string;
  email?: string | null;
}

interface BetaMeta {
  is_active: boolean;
  expires_at: string | null;
  days_left: number | null;
}

export interface MaestroChatProps {
  user: User;
  betaMeta?: BetaMeta;
  /** Maestro 4 과목 — physics / chemistry / biology / earth-science */
  subject: Exclude<Subject, 'math' | 'korean' | 'english'>;
}

export function MaestroChat({ user, betaMeta, subject }: MaestroChatProps) {
  return <BetaChat user={user} betaMeta={betaMeta} subject={subject} />;
}
