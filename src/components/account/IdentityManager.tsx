'use client';

/**
 * IdentityManager — OAuth provider 연결/해제 UI.
 *
 * Supabase Auth API:
 *  - getUserIdentities() — 현재 user 의 identity 배열 (provider, identity_data.email, ...)
 *  - linkIdentity({ provider, options }) — 로그인 후 다른 OAuth 추가 연결
 *  - unlinkIdentity(identity) — 연결 해제 (마지막 1개는 클라이언트에서 차단)
 *
 * Dashboard prereq: Authentication → Settings → "Manual linking" 활성화 필요.
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Provider, UserIdentity } from '@supabase/supabase-js';

interface ProviderMeta {
  id: Provider;
  label: string;
  emoji: string;
  color: string;
}

const PROVIDERS: ProviderMeta[] = [
  { id: 'google', label: 'Google', emoji: '🟢', color: 'border-white/20 bg-white/5' },
  { id: 'kakao', label: 'Kakao', emoji: '🟡', color: 'border-yellow-400/30 bg-yellow-400/5' },
  { id: 'github', label: 'GitHub', emoji: '⚫', color: 'border-white/20 bg-white/5' },
];

type Stage = 'loading' | 'ready' | 'linking' | 'unlinking';

export function IdentityManager() {
  const [stage, setStage] = useState<Stage>('loading');
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const { data, error: idErr } = await supabase.auth.getUserIdentities();
    if (idErr) {
      setError(idErr.message);
      setStage('ready');
      return;
    }
    setIdentities(data?.identities ?? []);
    setStage('ready');
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleLink(provider: Provider) {
    setError(null);
    setSuccess(null);
    setStage('linking');
    const supabase = createClient();
    const { error: linkErr } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${window.location.origin}/account`,
      },
    });
    if (linkErr) {
      // manual_linking_disabled, validation_failed 등 — 운영 안내
      const msg = linkErr.message ?? String(linkErr);
      if (/manual.?linking.?disabled/i.test(msg)) {
        setError(
          '운영자에게 문의: Supabase Dashboard → Authentication → Settings 에서 "Manual linking" 활성화가 필요해요.',
        );
      } else {
        setError(msg);
      }
      setStage('ready');
      return;
    }
    // OAuth 리다이렉트가 시작되면 페이지가 이동되므로 별도 처리 없음
  }

  async function handleUnlink(identity: UserIdentity) {
    setError(null);
    setSuccess(null);
    if (identities.length <= 1) {
      setError('최소 1개의 로그인 방식이 남아 있어야 해요.');
      return;
    }
    if (!confirm(`${identity.provider} 로그인을 해제할까요? 다른 로그인 방식으로 계속 접속할 수 있어요.`)) {
      return;
    }
    setStage('unlinking');
    const supabase = createClient();
    const { error: unlinkErr } = await supabase.auth.unlinkIdentity(identity);
    if (unlinkErr) {
      setError(unlinkErr.message);
      setStage('ready');
      return;
    }
    setSuccess(`${identity.provider} 로그인 연결을 해제했어요.`);
    await refresh();
  }

  if (stage === 'loading') {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
        연결 상태 확인 중…
      </div>
    );
  }

  const linkedProviderIds = new Set(identities.map((i) => i.provider));
  const unlinkedProviders = PROVIDERS.filter((p) => !linkedProviderIds.has(p.id));

  return (
    <div className="space-y-6">
      {/* 연결된 provider */}
      <section>
        <h2 className="text-sm font-semibold text-white/80 mb-3">연결된 로그인</h2>
        <div className="space-y-2">
          {identities.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/50">
              연결된 로그인이 없어요. (이메일 가입은 별도 표시)
            </div>
          ) : (
            identities.map((id) => {
              const meta =
                PROVIDERS.find((p) => p.id === (id.provider as Provider)) ?? {
                  id: id.provider as Provider,
                  label: id.provider,
                  emoji: '🔑',
                  color: 'border-white/10 bg-white/5',
                };
              const idEmail =
                (id.identity_data?.email as string | undefined) ?? '(이메일 미공개)';
              const canUnlink = identities.length > 1;
              return (
                <motion.div
                  key={id.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center justify-between rounded-xl border ${meta.color} p-4`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.emoji}</span>
                    <div>
                      <div className="text-sm font-semibold">{meta.label}</div>
                      <div className="text-[11px] text-white/50">{idEmail}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUnlink(id)}
                    disabled={!canUnlink || stage === 'unlinking'}
                    className="rounded-lg border border-rose-400/30 bg-rose-500/5 px-3 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={canUnlink ? '연결 해제' : '마지막 로그인은 해제할 수 없어요'}
                  >
                    {stage === 'unlinking' ? '...' : '해제'}
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* 미연결 provider */}
      {unlinkedProviders.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-white/80 mb-3">로그인 추가 연결</h2>
          <div className="space-y-2">
            {unlinkedProviders.map((p) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => handleLink(p.id)}
                disabled={stage === 'linking'}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full flex items-center justify-between rounded-xl border ${p.color} p-4 text-left transition-colors hover:bg-white/10 disabled:opacity-50`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-sm font-semibold">{p.label} 연결하기</span>
                </div>
                <span className="text-xs text-white/40">+ 연결</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* 알림 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-100"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-100"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
