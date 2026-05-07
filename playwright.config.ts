import { defineConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// .env.local 을 수동으로 process.env 에 주입 (Playwright 는 Vite loadEnv 와 별개)
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const rawLine of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const line = rawLine.replace(/\r$/, '') // CRLF 처리
    const m = line.match(/^([^#=\s][^=]*)=(.*)/)
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '')
    }
  }
}

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
  },
  reporter: 'line',
})
