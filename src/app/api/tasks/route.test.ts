import { vi, describe, it, expect, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { makeChain, makeMockSupabase, MOCK_USER, MOCK_TASK } from '@/test-utils/supabase'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

const mockCreateClient = vi.mocked(createClient)
let supabase: ReturnType<typeof makeMockSupabase>

beforeEach(() => {
  vi.clearAllMocks()
  supabase = makeMockSupabase()
  mockCreateClient.mockResolvedValue(supabase as never)
})

describe('GET /api/tasks', () => {
  it('미인증 시 401', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('인증 시 일감 목록 반환', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabase.from.mockReturnValue(makeChain({ data: [MOCK_TASK], error: null }))

    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([MOCK_TASK])
  })

  it('DB 오류 시 500', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabase.from.mockReturnValue(makeChain({ data: null, error: { message: 'db error' } }))

    const res = await GET()
    expect(res.status).toBe(500)
  })
})

describe('POST /api/tasks', () => {
  const json = (body: unknown) =>
    new Request('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  it('미인증 시 401', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(json({ title: 'New' }))
    expect(res.status).toBe(401)
  })

  it('title 없으면 400', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    const res = await POST(json({ title: '   ' }))
    expect(res.status).toBe(400)
  })

  it('일감 생성 후 201', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabase.from.mockReturnValue(makeChain({ data: MOCK_TASK, error: null }))

    const res = await POST(json({ title: 'Test Task' }))
    expect(res.status).toBe(201)
    expect((await res.json()).title).toBe('Test Task')
  })
})
