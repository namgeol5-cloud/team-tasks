import { vi } from 'vitest'

export const MOCK_USER = { id: 'test-user-id', email: 'test@example.com' }

export const MOCK_TASK = {
  id: 'task-1',
  title: 'Test Task',
  created_by: 'test-user-id',
  assignee_id: 'test-user-id',
  status: 'todo',
  created_at: '2024-01-01T00:00:00Z',
}

export const MOCK_COMMENT = {
  id: 'comment-1',
  body: 'Test comment',
  task_id: 'task-1',
  created_by: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
}

/**
 * Supabase 쿼리 빌더 체인 mock
 * - 체인 메서드(select/order/eq/insert/update/delete)는 모두 chain 반환
 * - chain 자체가 thenable — `await query` 패턴 지원
 * - single()은 Promise 반환 — `await query.single()` 패턴 지원
 */
export function makeChain(result: { data: unknown; error: unknown }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {
    // thenable: `await chain` 시 result 로 resolve
    then: (
      onfulfilled: (v: unknown) => unknown,
      onrejected?: (e: unknown) => unknown,
    ) => Promise.resolve(result).then(onfulfilled, onrejected),
    single: vi.fn().mockResolvedValue(result),
  }
  for (const method of ['select', 'order', 'eq', 'insert', 'update', 'delete']) {
    chain[method] = vi.fn().mockReturnValue(chain)
  }
  return chain
}

export function makeMockSupabase() {
  return {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  }
}
