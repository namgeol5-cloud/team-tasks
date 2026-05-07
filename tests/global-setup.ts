import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  for (const rawLine of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const line = rawLine.replace(/\r$/, '') // CRLF 처리
    const m = line.match(/^([^#=\s][^=]*)=(.*)/)
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
}

const AUTH_FILE = 'playwright/.auth/user.json'

export default async function globalSetup() {
  loadEnvLocal()
  fs.mkdirSync('playwright/.auth', { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto('http://localhost:3000/login')
  await page.getByTestId('email-input').fill(process.env.TEST_USER_EMAIL!)
  await page.getByTestId('password-input').fill(process.env.TEST_USER_PASSWORD!)
  await page.getByTestId('email-login-submit').click()
  await page.waitForURL('http://localhost:3000/')

  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()
}
