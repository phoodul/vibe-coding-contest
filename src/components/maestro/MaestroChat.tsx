/**
 * 22차 (2026-05-09) — Maestro 4 과목 전용 채팅 컴포넌트.
 * 23차 (2026-05-10) B2 — BetaChat → LegendChat rename 반영.
 *
 * Maestro / Legend 분리 5 phase 의 Phase 4 (점진 분리 1단계, thin wrapper).
 *
 * 이전: 19차에 별도 MaestroChat stub 이 있었으나 LegendChat (구 BetaChat) 보다
 * 기능 미달 (multimodal marker · 풀이 정리 버튼 · 페르소나 4 카드 modal · 수능
 * 기출 panel · INPUT_PARSING_RULES 미지원) → 4 maestro 페이지가 LegendChat (subject
 * prop) 사용으로 통일됨.
 *
 * 진짜 분리 (LegendChat 의 maestro-specific 코드를 본 컴포넌트로 추출) 는 다음 세션
 * 사용자 manual smoke 후. 현재는 thin wrapper.
 *
 * 추출 예정 영역:
 *   - 페르소나 4 카드 + ScienceExamPanel + 수능 번호 클릭 multimodal 첨부
 *   - useChat api = `/api/maestro/${subject}/tutor` (이미 LegendChat 분기됨)
 *   - 입력 placeholder + INPUT_PARSING_RULES 안내 (이미 LegendChat 분기됨)
 *   - MaestroSolutionSummaryButton + MaestroSummaryCard
 *   - Trigger / 리포트 링크 maestro 분기
 */
'use client';

import { LegendChat } from '@/components/legend/LegendChat';
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
  return <LegendChat user={user} betaMeta={betaMeta} subject={subject} />;
}
