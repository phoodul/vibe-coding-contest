/**
 * 19차 (2026-05-06) — Earth Science Maestro PoC 진입.
 *
 * Phase B 진행 중: 베게너·갈릴레이·허블 페르소나 + 자체 교과서 (200p) trigger
 * 시드 추출 + 도표 5단계 system prompt + BetaChat subject 통합 작업 진행 중.
 *
 * 본 페이지는 PoC 골격 — Phase B 단계별 commit 따라 채팅 통합 추가.
 */
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserAccessTier, getBetaInviteMeta } from '@/lib/legend/access-tier';
import { BetaChat } from '@/components/legend/BetaChat';
import { TrialChat } from '@/components/legend/TrialChat';

export const dynamic = 'force-dynamic';

/**
 * 4 인물 = 4 가지 다른 사고방식의 가이드.
 * 영역 매칭이 아니며, 학생은 어떤 인물에게도 어떤 단원이든 질문 가능.
 * 차이는 코칭 스타일 — 호기심 자극 + 학생이 직접 선택 (또는 자동 라우팅).
 */
const PERSONAS = [
  {
    src: '/wegener-portrait.jpg',
    name: '베게너',
    tagline: '대륙을 움직인 사색가',
    hint: '꼼꼼하게, 한 단계씩 — 일상 풀이의 동반자',
    tier: '기본',
  },
  {
    src: '/galilei-portrait.jpg',
    name: '갈릴레이',
    tagline: '하늘을 처음 들여다본 거장',
    hint: '관찰과 추론으로 함정을 가려낸다',
    tier: '거장',
  },
  {
    src: '/hubble-portrait.jpg',
    name: '허블',
    tagline: '우주가 팽창함을 본 사람',
    hint: '도표·그래프 깊이 읽기',
    tier: '거장',
  },
  {
    src: '/sagan-portrait.jpg',
    name: '칼 세이건',
    tagline: '코스모스의 이야기꾼',
    hint: '큰 그림·맥락으로 풀이를 설계',
    tier: '거장',
  },
];

const CHAPTERS = [
  { ch: 1, title: '지권의 변동' },
  { ch: 2, title: '지구의 역사' },
  { ch: 3, title: '대기와 해양의 변화' },
  { ch: 4, title: '대기와 해양의 상호작용' },
  { ch: 5, title: '별과 우주' },
];

export default async function EarthScienceMainPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/earth-science');
  }

  const tier = await getUserAccessTier(user.id);
  const userProp = { id: user.id, email: user.email ?? null };
  const betaMeta = tier === 'beta' ? await getBetaInviteMeta(user.id) : null;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
          🌍 Earth Science Maestro · 베타 PoC
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          베게너·갈릴레이·허블·세이건과 함께 푸는 지구과학
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          수능 지구과학Ⅰ 의 그래프·층서 단면·천체 도식을 함께 읽고,
          정답으로 가는 최적의 길을 단계별로 배우는 maestro 입니다.
          <br />
          개념 학습은 <Link href="/tutor" className="text-cyan-300 underline">소크라테스 튜터</Link> /
          전체 구조 탐색은 <Link href="/mind-map?subject=earth-science" className="text-emerald-300 underline">마인드맵</Link>{' '}
          과 짝을 이룹니다.
        </p>
      </section>

      {/* 4 인물 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
          4 인물 — 4 가지 사고방식
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PERSONAS.map((p) => (
            <div
              key={p.name}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            >
              <div className="relative aspect-[4/5] w-full bg-slate-800">
                <Image
                  src={p.src}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
                <span className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-white/80">
                  {p.tier}
                </span>
              </div>
              <div className="px-3 py-3">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="mt-0.5 text-[11px] text-emerald-300/80">{p.tagline}</div>
                <div className="mt-2 text-[11px] leading-snug text-white/60">{p.hint}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-white/40">
          어느 인물에게도 어떤 단원이든 질문할 수 있어요. 사고방식의 차이를 즐겨보세요.
        </p>
      </section>

      {/* 5 챕터 */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
          학습 영역 (자체 교과서 196 content / 200p)
        </h2>
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CHAPTERS.map((c) => (
            <li
              key={c.ch}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="text-sm font-semibold">
                Chapter {c.ch}. {c.title}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 채팅 (BetaChat / TrialChat 분기) */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
          maestro 와 함께 풀이하기
        </h2>
        {tier === 'beta' ? (
          <BetaChat
            user={userProp}
            betaMeta={betaMeta ?? undefined}
            subject="earth-science"
          />
        ) : (
          <TrialChat user={userProp} subject="earth-science" />
        )}
      </section>
    </div>
  );
}
