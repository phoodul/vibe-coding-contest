'use client';

/**
 * PasswordChange — 이메일·비밀번호 사용자 한정 비밀번호 변경.
 *
 * OAuth (Google·GitHub·Kakao) 만 연결된 사용자는 비번이 없으므로 안내만 표시.
 * 동작: 현재 비번 재인증 (signInWithPassword) → 새 비번 updateUser({ password }).
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

type Stage = 'checking' | 'no_password' | 'idle' | 'submitting' | 'success' | 'error';

export function PasswordChange() {
  const [stage, setStage] = useState<Stage>('checking');
  const [email, setEmail] = useState<string | null>(null);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 사용자 identity 확인 — 'email' provider 없으면 비번 변경 불가
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) {
        setStage('no_password');
        return;
      }
      setEmail(user.email ?? null);
      const { data: idData } = await supabase.auth.getUserIdentities();
      const hasEmail = (idData?.identities ?? []).some(
        (i) => i.provider === 'email',
      );
      if (cancelled) return;
      setStage(hasEmail ? 'idle' : 'no_password');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (next.length < 8) {
      setErrorMsg('새 비밀번호는 8자 이상이어야 해요.');
      return;
    }
    if (next !== confirm) {
      setErrorMsg('새 비밀번호 확인이 일치하지 않아요.');
      return;
    }
    if (next === current) {
      setErrorMsg('새 비밀번호가 현재 비밀번호와 같아요.');
      return;
    }
    if (!email) {
      setErrorMsg('이메일 정보를 확인할 수 없어요.');
      return;
    }

    setStage('submitting');

    const supabase = createClient();

    // 1) 현재 비번 검증 — signInWithPassword 재시도
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (signInErr) {
      setErrorMsg('현재 비밀번호가 일치하지 않아요.');
      setStage('idle');
      return;
    }

    // 2) 새 비번 적용
    const { error: updateErr } = await supabase.auth.updateUser({
      password: next,
    });
    if (updateErr) {
      setErrorMsg(updateErr.message);
      setStage('error');
      return;
    }

    setStage('success');
    setCurrent('');
    setNext('');
    setConfirm('');
  }

  if (stage === 'checking') {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
        확인 중…
      </div>
    );
  }

  if (stage === 'no_password') {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
        <p>
          현재 OAuth (Google · GitHub · Kakao) 로그인만 사용 중이라 비밀번호 변경이 필요 없어요.
          이메일·비밀번호로 가입한 계정만 이 항목이 활성돼요.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Field
        label="현재 비밀번호"
        value={current}
        onChange={setCurrent}
        type="password"
        disabled={stage === 'submitting'}
        autoComplete="current-password"
      />
      <Field
        label="새 비밀번호 (8자 이상)"
        value={next}
        onChange={setNext}
        type="password"
        disabled={stage === 'submitting'}
        autoComplete="new-password"
      />
      <Field
        label="새 비밀번호 확인"
        value={confirm}
        onChange={setConfirm}
        type="password"
        disabled={stage === 'submitting'}
        autoComplete="new-password"
      />

      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-100"
          >
            {errorMsg}
          </motion.div>
        )}
        {stage === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-100"
          >
            비밀번호가 성공적으로 변경됐어요.
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={stage === 'submitting' || !current || !next || !confirm}
        className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-[1.005] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {stage === 'submitting' ? '변경 중…' : '비밀번호 변경'}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  disabled,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-white/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-400 transition-colors disabled:opacity-50"
      />
    </label>
  );
}
