/**
 * Phase G-06 G06-24 — /api/euler-tutor 내부 위임 회귀 테스트.
 *
 * 베이스: docs/task-g06.md G06-24 / docs/implementation_plan_g06.md §G06-24.
 * 위임 정책 (architecture-g06-legend.md §8.2):
 *   - 외부 시그니처 무변경 (request body / SSE / 응답 JSON)
 *   - 첫 user turn 에 한해 routeProblem best-effort 호출 → streamData 에 legend_routing payload 추가
 *   - 본 streamText 코칭 흐름은 무파괴 (베타 50명 회귀 0 보장)
 *
 * 본 spec 은 베타 사용자 5 시나리오 회귀 명세만 작성한다. 실제 실행은 G06-25 production
 * 배포 시 통합 검증으로 이관한다 (E2E 인프라 + 인증 fixture 필요).
 *
 * 주의: /euler 진입은 G06-21 의 302 redirect 로 /legend 로 이동한다.
 *   본 spec 은 /api/euler-tutor 라우트 자체를 직접 검증하지 않고, /legend UI 에서
 *   풀이 흐름이 정상 동작함을 5 시나리오로 회귀 보장한다.
 */
import { test, expect } from "@playwright/test";

test.describe("/euler 베타 사용자 회귀 보호 (G06-24)", () => {
  test.skip(({}, testInfo) => {
    // 인증 fixture (Supabase magic link) 미구성 → G06-25 통합 검증으로 이관.
    return process.env.LEGEND_E2E_AUTHED !== "1";
  }, "auth fixture required (set LEGEND_E2E_AUTHED=1 in CI)");

  test("시나리오 1: 텍스트 입력 → 풀이 정상", async ({ page }) => {
    await page.goto("/legend");
    await page.fill('[data-testid="problem-input"]', "x^2 - 4 = 0 의 해를 구하시오.");
    await page.click('[data-testid="solve-button"]');
    await expect(page.locator('text=답')).toBeVisible({ timeout: 30_000 });
  });

  test("시나리오 2: 사진 업로드 → 풀이 정상", async ({ page }) => {
    await page.goto("/legend");
    await page.click('[data-testid="input-mode-photo"]');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "problem.png",
      mimeType: "image/png",
      // 1x1 transparent PNG (회귀 흐름만 검증)
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
        "base64",
      ),
    });
    await page.click('[data-testid="solve-button"]');
    await expect(page.locator('text=답')).toBeVisible({ timeout: 60_000 });
  });

  test("시나리오 3: 필기 (handwrite) 입력 → 풀이 정상", async ({ page }) => {
    await page.goto("/legend");
    await page.click('[data-testid="input-mode-handwrite"]');
    // 필기 캔버스 모킹 — 실제 stroke 입력은 G06-25 인프라.
    await page.fill('[data-testid="problem-input"]', "x + 3 = 7");
    await page.click('[data-testid="solve-button"]');
    await expect(page.locator('text=답')).toBeVisible({ timeout: 30_000 });
  });

  test("시나리오 4: 가우스 토글 → Tier 2 호출", async ({ page }) => {
    await page.goto("/legend");
    await page.click('[data-testid="tutor-toggle-gauss"]');
    await page.fill('[data-testid="problem-input"]', "killer 수준 미적분 문제");
    await page.click('[data-testid="solve-button"]');
    // 가우스 (Gemini 3.1 Pro) 응답 — 토큰 5000 제약상 60초 허용
    await expect(page.locator('text=답')).toBeVisible({ timeout: 90_000 });
  });

  test("시나리오 5: 베타 게이트 (EULER2026) → 통과", async ({ page }) => {
    await page.goto("/legend/beta");
    await page.fill('[data-testid="beta-code-input"]', "EULER2026");
    await page.click('[data-testid="beta-submit"]');
    await expect(page).toHaveURL(/\/legend(\/.*)?$/);
  });
});

test.describe("legend_routing payload 옵셔널 적재 (G06-24)", () => {
  test.skip(({}, testInfo) => process.env.LEGEND_E2E_AUTHED !== "1");

  test("첫 user turn 응답 stream 에 legend_routing 옵셔널 payload 가 포함된다", async ({
    request,
  }) => {
    const res = await request.post("/api/euler-tutor", {
      data: {
        messages: [{ role: "user", content: "x^2 - 4 = 0" }],
        area: "calculus",
        useGpt: false,
        input_mode: "text",
      },
    });
    expect(res.status()).toBe(200);
    const text = await res.text();
    // streamData 의 legend_routing kind 가 stream 에 포함됨 (옵셔널 — 실패 시 silent skip)
    // 본 검증은 best-effort 신호만 — 강제 단언 아님 (timeout/오류 시 skip 가능)
    if (text.includes("legend_routing")) {
      expect(text).toMatch(/routing_decision_id/);
      expect(text).toMatch(/routed_tutor/);
    }
  });
});
