/**
 * Phase G-06 — ReasoningTreeView E2E (Δ4).
 *
 * 본 파일은 G06-19 산출 spec 이며, 실제 E2E 통합 실행은 G06-22 KPI 측정 task 에서
 * 평가셋 자동 풀이 → R1 fixture seed 후 진행한다 (현 시점 mock-session 라우트 미존재).
 * 본 task 는 visual 검증만 명세하며 인프라는 G06-22 가 추가한다.
 */
import { test, expect } from '@playwright/test';

test.describe('ReasoningTreeView', () => {
  test('preview 모드 트리 렌더 + 풀스크린 모달 진입', async ({ page }) => {
    // mock session id 로 진입 (실제 fixture seed 는 G06-22 에서 추가)
    await page.goto('/legend/solve/mock-session?problem_text=test');

    // 트리 컨테이너 노출
    await expect(page.locator('.legend-tree')).toBeVisible();

    // 풀스크린 진입 버튼
    await page.click('text=전체 트리 펼쳐보기');
    await expect(page.locator('text=✕ 닫기')).toBeVisible();

    // ESC 닫기
    await page.keyboard.press('Escape');
    await expect(page.locator('text=✕ 닫기')).not.toBeVisible();
  });

  test('모바일 뷰포트 INP 측정 (visual 검증)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 13
    await page.goto('/legend/solve/mock-session?problem_text=test');
    await expect(page.locator('.legend-tree')).toBeVisible();
    // INP ≤ 200ms 정량 측정은 별도 lighthouse 통합 (G06-22) 필요 — 본 task 에서 visual 검증만
  });
});
