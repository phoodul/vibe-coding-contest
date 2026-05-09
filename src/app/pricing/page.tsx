/**
 * 22차 (2026-05-09) — 가격 페이지 (/pricing).
 *
 * 3 tier 카드 (Basic / Standard / Premium) + Top-up 안내.
 * 베타 동안: "베타 종료 후 활성화" 배너 + 결제 버튼 disabled.
 * 베타 종료 시점: NEXT_PUBLIC_PAYMENT_ACTIVE=true env 추가하면 결제 버튼 활성.
 */
import Link from 'next/link';
import { PricingClient } from '@/components/payment/PricingClient';

export const metadata = {
  title: '요금제 — easyedu.ai',
  description:
    'Basic ₩29,000 / Standard ₩49,000 / Premium ₩99,000 — Legend Tutor + Maestro 4 과목 + 무제한 부가 도구',
};

export default function PricingPage() {
  const paymentActive = process.env.NEXT_PUBLIC_PAYMENT_ACTIVE === 'true';
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            매일 쓰는 학습 코치, 단과 학원 1자리 가격으로
          </h1>
          <p className="text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            Legend Tutor (수학) + Maestro 4 과목 (물리·화학·생명과학·지구과학) + 영문법
            헤밍웨이 + 마인드맵·독서로그 등 모든 부속 도구를 하나의 구독으로.
          </p>
          {!paymentActive && (
            <div className="mt-6 inline-block px-4 py-2 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-200 text-xs font-semibold">
              ⏳ 베타 테스트 진행 중 — 결제는 베타 종료 후 활성화됩니다
            </div>
          )}
        </header>

        <PricingClient paymentActive={paymentActive} />

        <section className="mt-16 max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">자주 묻는 질문</h2>
          <div className="space-y-3 text-left text-sm text-white/75">
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="font-semibold cursor-pointer">
                100회는 정확히 무엇이 1회인가요?
              </summary>
              <p className="mt-2 text-white/60">
                Legend Tutor 또는 Maestro 와 한 문제를 끝까지 푸는 1 세션 = 1회 입니다.
                같은 문제 안에서 5~10번 메시지를 주고받아도 1회로만 계산됩니다.
                라마누잔 (Haiku) · 마인드맵 · 헤밍웨이 영문법 등 부속 도구는 무제한이며
                횟수에 포함되지 않습니다.
              </p>
            </details>
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="font-semibold cursor-pointer">
                100회를 다 쓰면 어떻게 되나요?
              </summary>
              <p className="mt-2 text-white/60">
                남은 한도가 0이 되면 다음 결제일까지 Legend·Maestro 가 일시 중단됩니다.
                그 사이에도 라마누잔 · 부속 도구는 그대로 사용 가능합니다. 추가 100회가
                필요하면 ₩14,900 Top-up 으로 즉시 충전 가능합니다.
              </p>
            </details>
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="font-semibold cursor-pointer">환불은 가능한가요?</summary>
              <p className="mt-2 text-white/60">
                결제일로부터 7일 이내 + 미사용 시 전액 환불입니다. 일부 사용한 경우 사용
                횟수만큼 일할 차감 후 환불됩니다. 정기결제는 언제든지 해지 가능하며
                현재 결제 기간이 종료될 때까지 정상 이용 가능합니다. 자세한 내용은{' '}
                <Link href="/refund" className="underline">
                  환불 정책
                </Link>{' '}
                을 확인해 주세요.
              </p>
            </details>
            <details className="rounded-xl border border-white/10 bg-white/5 p-4">
              <summary className="font-semibold cursor-pointer">
                미성년자도 결제할 수 있나요?
              </summary>
              <p className="mt-2 text-white/60">
                만 14세 이상은 본인 명의 결제 가능하며, 만 14세 미만은 법정대리인의 동의가
                필요합니다. 부모님 결제 시 결제 후 영수증이 자동 발송됩니다.
              </p>
            </details>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-white/40">
          <Link href="/terms" className="mx-2 hover:text-white/70">이용약관</Link>·
          <Link href="/privacy" className="mx-2 hover:text-white/70">개인정보처리방침</Link>·
          <Link href="/refund" className="mx-2 hover:text-white/70">환불 정책</Link>·
          <Link href="/business-info" className="mx-2 hover:text-white/70">사업자 정보</Link>
        </footer>
      </div>
    </div>
  );
}
