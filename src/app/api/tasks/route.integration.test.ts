// @vitest-environment node
import { beforeAll, afterEach, afterAll, describe, it, expect } from 'vitest'
import {
  waitForDevServer,
  signInTestUser,
  getAdminSupabase,
} from '@/test/integration-helpers'

const BASE_URL = 'http://localhost:3000'

describe('POST /api/tasks (integration)', () => {
  let cookieHeader: string
  let userId: string
  let admin: ReturnType<typeof getAdminSupabase>
  let createdTaskId: string | null = null

  beforeAll(async () => {
    await waitForDevServer(BASE_URL)
    ;({ cookieHeader, userId } = await signInTestUser())
    admin = getAdminSupabase()
  })

  afterEach(async () => {
    if (createdTaskId) {
      await admin.from('tasks').delete().eq('id', createdTaskId)
      createdTaskId = null
    }
  })

  afterAll(async () => {
    // beforeAll 실패 시 admin 이 미초기화일 수 있으므로 guard
    if (!admin) return
    await admin.from('tasks').delete().like('title', 'integration-%')
  })

  it('미인증: Cookie 없이 POST → proxy(미들웨어)가 307 /login 으로 리다이렉트', async () => {
    // 단위 테스트: 핸들러 직접 호출 → 401 반환.
    // 통합(실서버): proxy.ts 가 먼저 실행되어 307 redirect → /login.
    // redirect: 'manual' 로 fetch 가 리다이렉트를 따라가지 않게 해서 307 원본 응답을 단언.
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: `integration-${Date.now()}` }),
    })
    expect(res.status).toBe(307)
  })

  it('201: Cookie 포함 POST → 201, created_by/title 일치, id 보관', async () => {
    const title = `integration-${Date.now()}`
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ title }),
    })

    expect(res.status).toBe(201)
    const task = await res.json()
    expect(task.title).toBe(title)
    expect(task.created_by).toBe(userId)
    expect(typeof task.id).toBe('string')

    createdTaskId = task.id // afterEach 에서 삭제
  })
})
