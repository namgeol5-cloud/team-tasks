import { vi, describe, it, expect, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { makeChain, makeMockSupabase, MOCK_USER, MOCK_COMMENT } from '@/test-utils/supabase'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

const mockCreateClient = vi.mocked(createClient)
let supabase: ReturnType<typeof makeMockSupabase>

beforeEach(() => {
  vi.clearAllMocks()
  supabase = makeMockSupabase()
  mockCreateClient.mockResolvedValue(supabase as never)
})

describe('GET /api/comments', () => {
  it('미인증 시 401', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await GET(new Request('http://localhost/api/comments'))).status).toBe(401)
  })

  it('task_id 없이 전체 댓글 반환', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabase.from.mockReturnValue(makeChain({ data: [MOCK_COMMENT], error: null }))

    const res = await GET(new Request('http://localhost/api/comments'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([MOCK_COMMENT])
  })

  it('task_id 필터 쿼리 파라미터 처리', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    const chain = makeChain({ data: [MOCK_COMMENT], error: null })
    supabase.from.mockReturnValue(chain)

    const res = await GET(new Request('http://localhost/api/comments?task_id=task-1'))
    expect(res.status).toBe(200)
    expect(chain.eq).toHaveBeenCalledWith('task_id', 'task-1')
  })
})

describe('POST /api/comments', () => {
  const json = (body: unknown) =>
    new Request('http://localhost/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  it('미인증 시 401', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await POST(json({ body: 'hi', task_id: 'task-1' }))).status).toBe(401)
  })

  it('body 없으면 400', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    expect((await POST(json({ body: '', task_id: 'task-1' }))).status).toBe(400)
  })

  it('task_id 없으면 400', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    expect((await POST(json({ body: 'hi' }))).status).toBe(400)
  })

  it('댓글 생성 후 201', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabase.from.mockReturnValue(makeChain({ data: MOCK_COMMENT, error: null }))

    const res = await POST(json({ body: 'Test comment', task_id: 'task-1' }))
    expect(res.status).toBe(201)
    expect((await res.json()).body).toBe('Test comment')
  })
})
