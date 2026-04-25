export const metadata = { title: "이용약관 | EduFlow AI" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white/90 leading-relaxed">
      <h1 className="text-2xl font-bold mb-2">이용약관</h1>
      <p className="text-xs text-white/40 mb-8">최종 수정일: 2026-04-26 (초안 — 법무 검토 전)</p>

      <Section title="제1조 (목적)">
        본 약관은 EduFlow AI(이하 "회사")가 제공하는 Euler Tutor 외 교육 서비스(이하 "서비스")의 이용 조건과 절차, 회사와 회원의 권리·의무·책임 사항을 규정함을 목적으로 합니다.
      </Section>

      <Section title="제2조 (정의)">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>"회원": 본 약관에 동의하고 서비스 이용 자격을 부여받은 자.</li>
          <li>"미성년 회원": 만 14세 미만의 회원. 가입 시 법정대리인의 동의가 필요합니다.</li>
          <li>"AI 자체 표현": 서비스가 정석·교과서 원문을 인용하지 않고 자체적으로 재작성한 표현.</li>
        </ul>
      </Section>

      <Section title="제3조 (서비스 내용)">
        Euler Tutor 는 학생의 사고 과정을 코칭하는 AI 보조 학습 도구입니다. 정답을 직접 공개하지 않고, 학생이 스스로 풀이를 도출하도록 단계적으로 안내합니다. 부모/교사는 답 공개 잠금(lock_reveal) 을 활성화할 수 있습니다.
      </Section>

      <Section title="제4조 (저작권 및 콘텐츠)">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>회사는 외부 정석·교과서 원문을 직접 복제·인용하지 않습니다 (AI 자체 표현 강제).</li>
          <li>회원이 업로드한 문제 사진·필기 데이터는 학습 코칭 목적으로만 사용됩니다.</li>
          <li>도구 라이브러리(math_tools)는 회사가 자체 큐레이션 또는 회원 본인 업로드 콘텐츠로 구성됩니다.</li>
        </ul>
      </Section>

      <Section title="제5조 (만 14세 미만 회원)">
        만 14세 미만은 가입 시 법정대리인(부모) 의 이메일 인증을 통한 동의가 필요합니다. 동의 없이 수집된 개인정보는 즉시 삭제됩니다.
      </Section>

      <Section title="제6조 (데이터 보유 및 삭제)">
        회사는 회원의 졸업 또는 탈퇴 후 1년 경과 시점에 개인 식별 정보(이름·이메일)를 자동 익명화합니다. 풀이 통계는 익명 형태로 보존됩니다.
      </Section>

      <Section title="제7조 (결제 및 환불)">
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>구독료는 월 단위로 자동 결제됩니다 (Toss Payments).</li>
          <li>첫 7일 무료 체험. 체험 기간 내 취소 시 청구되지 않습니다.</li>
          <li>「전자상거래법」에 따라 결제 후 7일 이내 청약철회 가능 (서비스 이용 이력이 없는 경우).</li>
        </ul>
      </Section>

      <Section title="제8조 (책임의 제한)">
        AI 의 답변은 학습 보조 목적이며 100% 정확성을 보장하지 않습니다. 입시·시험 준비에 회사가 직접적인 책임을 지지 않습니다.
      </Section>

      <Section title="제9조 (분쟁 해결)">
        본 약관에 관한 분쟁은 회원의 주소지 관할 법원을 1심 관할 법원으로 합니다.
      </Section>

      <p className="mt-10 text-xs text-amber-300/80">
        ⚠ 본 약관은 변호사 자문(LEG-02) 통과 전 초안입니다. 정식 노출 전 검토 후 갱신됩니다.
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
