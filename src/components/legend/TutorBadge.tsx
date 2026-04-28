/**
 * Phase G-06 — 튜터 이름 + 모델 한 줄 배지.
 *
 * 베이스: docs/architecture-g06-legend.md §6.
 * portraits.ts 의 src + label_ko + model_short 사용.
 *
 * G06-18: 본 구현.
 *   - next/image priority + sizes (라이프니츠 4.3MB 자동 최적화)
 *   - 글래스 ring + 다크 톤 (legend layout 과 일관)
 *   - sm / md / lg 3 사이즈
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
  /** 강제 모델 표기. 미지정 시 portraits.model_short */
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
        <span className="text-[11px] text-white/55">
          {model ?? portrait.model_short}
        </span>
      </div>
    </div>
  );
}
