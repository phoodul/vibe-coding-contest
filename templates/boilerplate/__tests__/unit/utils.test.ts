import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn()', () => {
  it('클래스를 병합한다', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('충돌하는 tailwind 클래스를 후자로 덮어쓴다', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('조건부 클래스를 처리한다', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible')
  })
})
