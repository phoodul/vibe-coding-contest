/**
 * /account — 계정 설정 페이지.
 *
 * 핵심 기능: OAuth provider manual linking. 같은 사용자가 Google·GitHub·Kakao 어느 것으로
 * 로그인해도 같은 user_id 로 묶여 학습 진도가 유지되게 한다.
 *
 * 배경: Supabase Auth 기본 동작 = OAuth provider 별 별도 user 생성. 이메일이 같으면 자동
 * link 하지만, 사용자가 provider 별로 다른 이메일을 등록한 경우 (예: Google=@gmail.com,
 * Kakao=@daum.net) 자동 link 가 작동 안 해 학생이 로그인 방식을 바꾸면 진도 0 으로 보임.
 *
 * 운영 prereq: Supabase Dashboard → Authentication → Settings → "Manual linking" 활성화.
 * 비활성 상태에선 linkIdentity 호출이 manual_linking_disabled 에러를 반환한다.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { IdentityManager } from '@/components/account/IdentityManager';
import { PasswordChange } from '@/components/account/PasswordChange';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '계정 설정 — EasyEdu AI',
  description: 'OAuth 로그인 연결·해제, 같은 사용자 한 계정으로 모든 진도 유지.',
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/account');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            ← 대시보드
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">계정 설정</h1>
        <p className="text-sm text-white/60 mb-8">
          {user.email ?? '(이메일 없음)'} · 로그인 ID: {user.id.slice(0, 8)}…
        </p>

        <IdentityManager />

        <section className="mt-10">
          <h2 className="text-sm font-semibold text-white/80 mb-3">비밀번호 변경</h2>
          <PasswordChange />
        </section>

        <div className="mt-10 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
          <h3 className="text-sm font-semibold text-amber-200 mb-2">
            💡 왜 로그인 연결이 필요한가요?
          </h3>
          <ul className="text-xs text-white/60 space-y-1.5 list-disc pl-4">
            <li>
              Google · GitHub · Kakao 는 각자 다른 이메일을 사용할 수 있어요. 처음 Google 로
              가입한 뒤 다음에 Kakao 로 로그인하면, 시스템은 다른 사람으로 인식해 학습 진도가
              0 으로 보일 수 있어요.
            </li>
            <li>
              현재 로그인 상태에서 다른 OAuth 를 추가로 연결하면, 어느 쪽으로 로그인해도 같은
              학습 데이터를 볼 수 있어요.
            </li>
            <li>
              연결 해제는 최소 1개 로그인이 남아 있을 때만 가능해요 (영구 잠금 방지).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
