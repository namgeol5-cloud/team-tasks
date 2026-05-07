import { test, expect } from '@playwright/test'

const EMAIL = process.env.TEST_USER_EMAIL!
const PASSWORD = process.env.TEST_USER_PASSWORD!

// serial describe 전체에서 공유하는 고유 일감 제목
const TASK_TITLE = `e2e-task-${Date.now()}`

// ── 1. 로그인 ─────────────────────────────────────────────────────────────────

test('로그인 – Email/Password 폼으로 메인 화면 진입', async ({ page }) => {
  await page.goto('/login')

  await page.getByTestId('email-input').fill(EMAIL)
  await page.getByTestId('password-input').fill(PASSWORD)
  await page.getByTestId('email-login-submit').click()

  await page.waitForURL('/')
  await expect(page.getByRole('heading', { name: 'Team Tasks' })).toBeVisible()
})

// ── 2-4. 인증된 흐름 (serial: 추가 → 토글 → 삭제) ────────────────────────────

test.describe('인증된 흐름', () => {
  test.describe.configure({ mode: 'serial' })
  test.use({ storageState: 'playwright/.auth/user.json' })

  test('일감 추가 – 입력 후 목록에 표시', async ({ page }) => {
    await page.goto('/')

    await page.getByPlaceholder('새 일감 제목').fill(TASK_TITLE)
    await page.getByRole('button', { name: '추가' }).click()

    await expect(page.locator('li').filter({ hasText: TASK_TITLE })).toBeVisible()
  })

  test('상태 토글 – todo → done (완료 표시 → 완료 취소)', async ({ page }) => {
    await page.goto('/')

    const row = page.locator('li').filter({ hasText: TASK_TITLE })
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: '완료 표시' }).click()

    await expect(row.getByRole('button', { name: '완료 취소' })).toBeVisible()
  })

  test('일감 삭제 – 삭제 후 목록에서 사라짐', async ({ page }) => {
    await page.goto('/')

    const row = page.locator('li').filter({ hasText: TASK_TITLE })
    await expect(row).toBeVisible()

    await row.getByRole('button', { name: '삭제' }).click()

    await expect(page.locator('li').filter({ hasText: TASK_TITLE })).not.toBeVisible()
  })
})
