'use client';

/**
 * UserMenu — 우상단 My Profile 드롭다운.
 *
 * 표시: 표시 이름 + 이메일 헤더 + (admin) 관리자 페이지 + 계정 설정 + 로그아웃.
 * 비-로그인 시: "로그인" 버튼.
 *
 * 위치: dashboard / 기타 페이지 헤더의 우측 끝. fixed 가 아닌 inline (flex justify-between).
 */
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { isAdminEmail } from '@/lib/legend/access-tier';

interface Props {
  email: string | null;
  displayName: string | null;
}

export function UserMenu({ email, displayName }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 외부 클릭 시 닫기
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  // ESC 닫기
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!email) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
      >
        로그인
      </Link>
    );
  }

  const isAdmin = isAdminEmail(email);
  const initial = (displayName || email).slice(0, 1).toUpperCase();

  async function handleLogout() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-colors px-2 py-1.5"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden sm:block text-xs font-medium text-white/80 max-w-[120px] truncate">
          {displayName || email}
        </span>
        <svg
          aria-hidden="true"
          className={`h-3 w-3 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            role="menu"
            className="absolute right-0 mt-2 w-64 rounded-xl border border-white/15 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-40"
          >
            {/* 헤더 — 이름 + 이메일 */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="text-sm font-semibold text-white truncate">
                {displayName || '사용자'}
              </div>
              <div className="text-[11px] text-white/50 truncate">{email}</div>
            </div>

            {/* 메뉴 */}
            <div className="py-1">
              {isAdmin && (
                <Link
                  href="/admin/beta-applications"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-200 hover:bg-amber-400/10 transition-colors"
                  role="menuitem"
                >
                  <span className="text-base">🔐</span>
                  <span>관리자 페이지</span>
                </Link>
              )}
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                role="menuitem"
              >
                <span className="text-base">⚙️</span>
                <span>계정 설정</span>
                <span className="ml-auto text-[10px] text-white/40">로그인 연결·비밀번호</span>
              </Link>
            </div>

            <div className="border-t border-white/10 py-1">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-200 hover:bg-rose-500/10 transition-colors"
                role="menuitem"
              >
                <span className="text-base">🚪</span>
                <span>로그아웃</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
