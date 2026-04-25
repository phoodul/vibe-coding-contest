export const metadata = { title: "개인정보처리방침 | EduFlow AI" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white/90 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">개인정보처리방침</h1>
      <p className="text-xs text-white/40 mb-8">최종 수정일: 2026-04-26 (초안 — 법무 검토 전)</p>

      <Section title="1. 수집하는 개인정보 항목">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>필수</strong>: 이메일, 비밀번호 해시 (또는 OAuth 식별자), 가입일</li>
          <li><strong>선택</strong>: 닉네임, 학년, 생년월일 (만 14세 미만 판별 목적)</li>
          <li><strong>자동 수집</strong>: 풀이 이력 (problem_text, area, difficulty, stuck_reason), 사용 도구 통계</li>
          <li><strong>결제</strong>: Toss Payments 가 처리. 회사는 결제 키(billing_key) 만 보관</li>
        </ul>
      </Section>

      <Section title="2. 수집 목적">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>서비스 제공 (코칭, 약점 분석, 진척 대시보드)</li>
          <li>구독 결제 처리</li>
          <li>법정 의무 이행 (만 14세 미만 부모 동의 등)</li>
          <li>서비스 품질 개선 (익명 통계)</li>
        </ul>
      </Section>

      <Section title="3. 보유 및 이용 기간">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>일반: 회원 탈퇴 시점까지</li>
          <li>학생 회원: 졸업일 + 1년 후 자동 익명화 (이름·이메일 hash). 풀이 통계는 익명 보존</li>
          <li>결제 기록: 「전자상거래법」 5년</li>
          <li>로그: 「통신비밀보호법」 3개월</li>
        </ul>
      </Section>

      <Section title="4. 제3자 제공">
        회사는 원칙적으로 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우 제한적으로 제공합니다:
        <ul className="list-disc list-inside space-y-1 text-sm mt-2">
          <li>Anthropic / OpenAI: AI 추론 (문제 텍스트만 전송, 개인정보 미포함)</li>
          <li>Mathpix / Upstage: 수식 OCR (이미지 데이터)</li>
          <li>Toss Payments: 결제 처리</li>
          <li>Supabase: 데이터 저장 (회사가 직접 운영)</li>
          <li>Vercel / Railway: 호스팅</li>
        </ul>
      </Section>

      <Section title="5. 만 14세 미만 보호">
        만 14세 미만 가입 시 법정대리인의 이메일 인증 동의가 필수입니다. 동의 없는 가입은 차단됩니다.
      </Section>

      <Section title="6. 회원 권리">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>개인정보 열람·정정·삭제 요청 (계정 설정 또는 phoodul@gmail.com)</li>
          <li>처리 정지 요청</li>
          <li>탈퇴 즉시 이메일 hash 화 (재로그인 불가)</li>
        </ul>
      </Section>

      <Section title="7. 안전성 확보 조치">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>비밀번호 해시 저장 (bcrypt 동급)</li>
          <li>HTTPS 전 구간 암호화</li>
          <li>관리자 접근 로깅</li>
          <li>RLS (Row Level Security) — 본인 데이터만 접근</li>
        </ul>
      </Section>

      <Section title="8. 개인정보 보호책임자">
        <p className="text-sm">phoodul@gmail.com</p>
      </Section>

      <p className="mt-10 text-xs text-amber-300/80">
        ⚠ 본 방침은 변호사 자문(LEG-02) 통과 전 초안입니다. 정식 노출 전 검토 후 갱신됩니다.
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="text-sm text-white/80">{children}</div>
    </section>
  );
}
