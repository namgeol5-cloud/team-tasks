import type { TablesInsert } from '@/lib/database.types'

type Body = { title?: string; assignee_id?: string }
type User = { id: string }

type Ok = { ok: true; record: TablesInsert<'tasks'> }
type Err = { ok: false; error: string }

export function buildTaskRecord(body: Body, user: User): Ok | Err {
  if (!body.title?.trim()) {
    return { ok: false, error: 'title is required' }
  }
  return {
    ok: true,
    record: {
      title: body.title.trim(),
      created_by: user.id,
      assignee_id: body.assignee_id ?? user.id,
    },
  }
}
