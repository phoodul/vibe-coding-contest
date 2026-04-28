/**
 * Phase G-06 — /euler → /legend 302 redirect E2E.
 *
 * 베이스: docs/architecture-g06-legend.md §8.1.
 * 본 파일은 G06-21 산출 spec 이며, 실제 통합 실행은 G06-22 KPI 측정 task 에서
 * dev server 기동 후 진행한다. 본 task 는 명세만 한다.
 */
import { test, expect } from "@playwright/test";

const PATHS: ReadonlyArray<readonly [string, string]> = [
  ["/euler", "/legend"],
  ["/euler/canvas", "/legend/canvas"],
  ["/euler/billing", "/legend/billing"],
  ["/euler/family", "/legend/family"],
  ["/euler/beta", "/legend/beta"],
  ["/euler/report", "/legend/report"],
];

test.describe("/euler → /legend 302 redirect", () => {
  for (const [from, to] of PATHS) {
    test(`${from} → ${to} (302)`, async ({ page }) => {
      const responses: number[] = [];
      page.on("response", (res) => {
        if (res.url().includes(from)) responses.push(res.status());
      });

      await page.goto(from);
      await page.waitForURL(`**${to}`);

      expect(page.url()).toContain(to);
      expect(responses.some((s) => s === 302 || s === 301)).toBe(true);
    });
  }

  test("/euler/canvas/<slug> 동적 경로도 redirect 보존", async ({ page }) => {
    await page.goto("/euler/canvas/abc-uuid-test");
    await page.waitForURL("**/legend/canvas/abc-uuid-test");
    expect(page.url()).toContain("/legend/canvas/abc-uuid-test");
  });
});
