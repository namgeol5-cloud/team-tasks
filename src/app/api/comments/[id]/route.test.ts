import { vi, describe, it, expect, beforeEach } from 'vitest'
import { GET, PATCH, DELETE } from './route'
import { makeChain, makeMockSupabase, MOCK_USER, MOCK_COMMENT } from '@/test-utils/supabase'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

const mockCreateClient = vi.mocked(createClient)
let supabase: ReturnType<typeof makeMockSupabase>

const params = { params: Promise.resolve({ id: 'comment-1' }) }
const req = new Request('http://localhost/api/comments/comment-1')

beforeEach(() => {
  vi.clearAllMocks()
  supabase = makeMockSupabase()
  mockCreateClient.mockResolvedValue(supabase as never)
})

describe('GET /api/comments/[id]', () => {
  it('미인증 시 401', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await GET(req, params)).status).toBe(401)
  })

  it('댓글 단건 반환', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabase.from.mockReturnValue(makeChain({ data: MOCK_COMMENT, error: null }))

    const res = await GET(req, params)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(MOCK_COMMENT)
  })
})

describe('PATCH /api/comments/[id]', () => {
  const patchReq = (body: unknown) =>
    new Request('http://localhost/api/comments/comment-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

  it('미인증 시 401', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await PATCH(patchReq({ body: 'updated' }), params)).status).toBe(401)
  })

  it('변경 필드 없으면 400', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    expect((await PATCH(patchReq({}), params)).status).toBe(400)
  })

  it('수정 후 200', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabase.from.mockReturnValue(
      makeChain({ data: { ...MOCK_COMMENT, body: 'updated' }, error: null }),
    )

    const res = await PATCH(patchReq({ body: 'updated' }), params)
    expect(res.status).toBe(200)
    expect((await res.json()).body).toBe('updated')
  })
})

describe('DELETE /api/comments/[id]', () => {
  it('미인증 시 401', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } })
    expect((await DELETE(req, params)).status).toBe(401)
  })

  it('삭제 후 204', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: MOCK_USER } })
    supabase.from.mockReturnValue(makeChain({ data: null, error: null }))

    expect((await DELETE(req, params)).status).toBe(204)
  })
})
