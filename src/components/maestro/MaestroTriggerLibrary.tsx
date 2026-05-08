/**
 * 22차 (2026-05-09) — Maestro Trigger 라이브러리 카드.
 *
 * Legend 의 TriggerCardList 와 별개. 시드 JSON 의 anchor → tool → trigger 트리를
 * 그대로 표현. Layer 1~3 색상 차별화. KaTeX 미사용 (시드 텍스트는 plain).
 */
'use client';

import { motion } from 'framer-motion';
import type {
  MaestroAnchor,
  MaestroSeed,
  MaestroTool,
} from '@/lib/maestro/seed-loader';

const PERSONA_LABEL: Record<string, string> = {
  wegener: '베게너',
  galilei: '갈릴레이',
  hubble: '허블',
  sagan: '칼 세이건',
  pasteur: '파스퇴르',
  mendel: '멘델',
  watson: '왓슨',
  darwin: '다윈',
  fermi: '페르미',
  einstein: '아인슈타인',
  feynman: '파인만',
  newton: '뉴턴',
  curie: '마리 퀴리',
  lavoisier: '라부아지에',
  pauling: '폴링',
  mendeleev: '멘델레예프',
};

const LAYER_COLOR: Record<number, string> = {
  1: 'border-emerald-400/30 bg-emerald-500/5',
  2: 'border-cyan-400/30 bg-cyan-500/5',
  3: 'border-violet-400/30 bg-violet-500/5',
};

const LAYER_LABEL: Record<number, string> = {
  1: 'L1 기초',
  2: 'L2 응용',
  3: 'L3 통합',
};

function ToolCard({ tool }: { tool: MaestroTool }) {
  const layer = tool.knowledge_layer ?? 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      className={`rounded-xl border p-4 ${LAYER_COLOR[layer] ?? LAYER_COLOR[1]}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/15 text-white/70 font-mono">
          {LAYER_LABEL[layer] ?? `L${layer}`}
        </span>
        <h4 className="text-sm font-semibold text-white">{tool.name}</h4>
      </div>
      <p className="text-xs text-white/70 leading-relaxed mb-3">
        {tool.tool_proposition}
      </p>
      <div className="space-y-1.5">
        {tool.triggers.map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-2 text-xs text-white/85 rounded-lg bg-black/20 border border-white/5 px-2 py-1.5"
          >
            <span className="text-amber-300/80 mt-0.5">▸</span>
            <span className="flex-1">{t.ko}</span>
          </div>
        ))}
      </div>
      {tool.common_mistake_example && (
        <div className="mt-3 rounded-lg border border-rose-400/20 bg-rose-500/5 px-2.5 py-2 text-[11px] text-rose-100/80">
          <span className="font-semibold text-rose-200/90">⚠️ 자주 하는 실수: </span>
          {tool.common_mistake_example}
        </div>
      )}
    </motion.div>
  );
}

function AnchorBlock({ anchor }: { anchor: MaestroAnchor }) {
  const persona = PERSONA_LABEL[anchor.primary_persona] ?? anchor.primary_persona;
  return (
    <section className="mb-10">
      <header className="mb-4 flex items-baseline gap-3 border-b border-white/10 pb-2">
        <h2 className="text-lg md:text-xl font-bold text-white">{anchor.anchor}</h2>
        {anchor.anchor_en && (
          <span className="text-xs text-white/40">{anchor.anchor_en}</span>
        )}
        <span className="ml-auto text-xs text-cyan-200/80">
          담당 거장: <span className="font-semibold">{persona}</span>
        </span>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {anchor.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export function MaestroTriggerLibrary({
  seed,
  subjectKo,
  subjectEmoji,
  homePath,
}: {
  seed: MaestroSeed;
  subjectKo: string;
  subjectEmoji: string;
  homePath: string;
}) {
  const totalTools = seed.anchors.reduce((sum, a) => sum + a.tools.length, 0);
  const totalTriggers = seed.anchors.reduce(
    (sum, a) => sum + a.tools.reduce((s, t) => s + t.triggers.length, 0),
    0,
  );
  return (
    <div>
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl" aria-hidden>
            {subjectEmoji}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {subjectKo} Trigger 라이브러리
          </h1>
        </div>
        <p className="text-sm text-white/60 max-w-3xl leading-relaxed">
          “A 일 때 → B 를 한다” 형식의 정석 도구 모음입니다. {seed.anchors.length} 단원 ·
          <span className="mx-1 font-semibold text-cyan-200">{totalTools}</span>
          개 도구 ·
          <span className="mx-1 font-semibold text-cyan-200">{totalTriggers}</span>
          개 trigger 명제. 정답으로 가는 최적 방법을 한눈에.
        </p>
      </header>
      {seed.anchors.map((anchor) => (
        <AnchorBlock key={anchor.anchor_id} anchor={anchor} />
      ))}
      <footer className="mt-12 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
        <span>{subjectKo} Maestro · {seed.version ?? 'v1'}</span>
        <a href={homePath} className="hover:text-white/70 transition-colors">
          ← 채팅으로 돌아가기
        </a>
      </footer>
    </div>
  );
}
