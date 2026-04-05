import { test, expect } from '@playwright/test'

test('랜딩 페이지가 정상 로드된다', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
  // 빈 화면이 아닌지 확인
  const body = page.locator('body')
  await expect(body).not.toBeEmpty()
})

test('404 페이지가 존재한다', async ({ page }) => {
  const response = await page.goto('/this-does-not-exist')
  // Next.js가 404를 반환하는지 확인
  expect(response?.status()).toBe(404)
})
