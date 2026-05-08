/**
 * 22차 (2026-05-09) — Maestro trigger 시드 loader.
 *
 * 사용자 신고: "Maestro Trigger 에 왜 Legend trigger 로 연결되는 거야"
 *
 * Legend 는 math_tool_triggers + math_tools DB 테이블. Maestro 는 data/seeds/*.json
 * 정적 시드. 본 loader 는 maestro 전용 시드를 server component 에서 안전하게 읽어
 * /maestro/[subject]/triggers 페이지에 공급한다.
 *
 * 시드 schema (data/seeds/{subject}-anchors.json):
 *   - subject_anchor: 'earth-science' | 'biology' | 'physics' | 'chemistry'
 *   - personas: 4 인물 id
 *   - anchors: [{ anchor, anchor_id, primary_persona, tools: [...] }]
 *   - tools: [{ id, name, knowledge_layer, tool_proposition, triggers: [...] }]
 *   - triggers: [{ ko, en }]
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Subject } from '@/lib/legend/types';

export interface MaestroTrigger {
  ko: string;
  en?: string;
}

export interface MaestroTool {
  id: string;
  name: string;
  knowledge_layer: number;
  tool_proposition: string;
  triggers: MaestroTrigger[];
  common_mistake_example?: string;
}

export interface MaestroAnchor {
  anchor: string;
  anchor_en?: string;
  anchor_id: string;
  primary_persona: string;
  tools: MaestroTool[];
}

export interface MaestroSeed {
  subject_anchor: string;
  subject_grade?: string;
  version?: string;
  purpose?: string;
  personas: string[];
  anchors: MaestroAnchor[];
}

const MAESTRO_SUBJECTS: Subject[] = [
  'earth-science',
  'biology',
  'physics',
  'chemistry',
];

export function isMaestroSubject(subject: string): subject is Subject {
  return (MAESTRO_SUBJECTS as string[]).includes(subject);
}

/**
 * data/seeds/{subject}-anchors.json 로드. 미존재·파싱 실패 시 null.
 */
export function loadMaestroSeed(subject: Subject): MaestroSeed | null {
  if (!isMaestroSubject(subject)) return null;
  const path = resolve(process.cwd(), 'data', 'seeds', `${subject}-anchors.json`);
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, 'utf-8');
    const parsed = JSON.parse(raw) as MaestroSeed;
    if (!parsed || !Array.isArray(parsed.anchors)) return null;
    return parsed;
  } catch (err) {
    console.warn(`[maestro/seed-loader] failed: ${subject}`, err);
    return null;
  }
}
