/**
 * Phase G-06 — 튜터 이름 + 페르소나 설명 한 줄 배지.
 *
 * 베이스: docs/architecture-g06-legend.md §6.
 * portraits.ts 의 src + label_ko + persona_desc 사용 (G06-35c — 모델명 X).
 *
 * G06-18: 본 구현.
 *   - next/image priority + sizes (라이프니츠 4.3MB 자동 최적화)
 *   - 글래스 ring + 다크 톤 (legend layout 과 일관)
 *   - sm / md / lg 3 사이즈
 *
 * G06-35c (Δ12): raw 모델명 (Gemini 3.1 Pro 등) 학생 노출 금지.
 *   - 기본은 persona_desc ("수학의 왕자" 등) 노출.
 *   - admin/dev 페이지에서만 model 명시 prop 으로 모델명 표기 가능.
 */
'use client';

import Image from 'next/image';
import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { PORTRAITS } from '@/lib/legend/portraits';
import type { TutorName } from '@/lib/legend/types';

export interface TutorBadgeProps {
  tutor: TutorName;
  /** 강제 라벨 (포털 외부 컨텍스트). 미지정 시 portraits.label_ko */
  label?: string;
  /**
   * 강제 부제 표기 (admin/dev 페이지에서 model 명 노출 시).
   * 미지정 시 학생 안전 default = portraits.persona_desc (모델명 X — G06-35c).
   */
  model?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_PX: Record<'sm' | 'md' | 'lg', number> = { sm: 32, md: 48, lg: 64 };

export function TutorBadge({
  tutor,
  label,
  model,
  size = 'md',
  className,
}: TutorBadgeProps): ReactElement {
  const portrait = PORTRAITS[tutor];
  const px = SIZE_PX[size];
  // G06-35c: default 학생 화면은 persona_desc — model_short 노출 금지.
  const subtitle = model ?? portrait.persona_desc;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src={portrait.src}
        alt={portrait.alt}
        width={px}
        height={px}
        priority
        sizes={`${px}px`}
        className="rounded-full object-cover ring-2 ring-white/20"
      />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-white">
          {label ?? portrait.label_ko}
        </span>
        <span className="text-[11px] text-white/55">{subtitle}</span>
      </div>
    </div>
  );
}
