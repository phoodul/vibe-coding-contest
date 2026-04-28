/**
 * Phase G-06 — Legend Tutor 메인 페이지 stub.
 *
 * 베이스: docs/architecture-g06-legend.md §8.1.
 * 기존 /euler 채팅 패턴 차용 — G06-21 에서 본격 구현.
 *
 * G06-17: stub.
 */
import type { ReactElement } from 'react';

export default function LegendPage(): ReactElement {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Legend Tutor</h1>
      <p className="text-sm text-white/70">
        라마누잔이 먼저 대답하고, 막히면 가우스·폰 노이만·오일러·라이프니츠 중 한 분께
        물어볼 수 있어요. 풀이 직후 추론 트리·단계 분해·트리거 카드까지 한 화면에서 확인하세요.
      </p>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-white/60">
          TODO: G06-21 에서 메인 채팅 UI 구현 (기존 /euler 패턴 차용).
        </p>
      </div>
    </section>
  );
}
