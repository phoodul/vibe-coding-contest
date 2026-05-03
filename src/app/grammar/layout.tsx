import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '헤밍웨이 영문법 코치 | EasyEdu AI',
  description:
    '오류 패턴 진단 + 한 문장씩 교정 — 헤밍웨이 페르소나가 6 영역 영문법 trigger 라이브러리로 학생 문장을 코칭합니다.',
};

export default function GrammarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
