import { describe, it, expect } from 'vitest'
import { buildTaskRecord } from './build-record'

const user = { id: 'u1' }

describe('buildTaskRecord', () => {
  it('title undefined → ok: false', () => {
    expect(buildTaskRecord({}, user)).toEqual({
      ok: false,
      error: 'title is required',
    })
  })

  it('title 빈 문자열 → ok: false', () => {
    expect(buildTaskRecord({ title: '' }, user)).toEqual({
      ok: false,
      error: 'title is required',
    })
  })

  it('title 공백만 → ok: false', () => {
    expect(buildTaskRecord({ title: '   ' }, user)).toEqual({
      ok: false,
      error: 'title is required',
    })
  })

  it('title 앞뒤 공백 + assignee_id 없음 → trim, assignee_id = user.id', () => {
    expect(buildTaskRecord({ title: ' hi ' }, user)).toEqual({
      ok: true,
      record: { title: 'hi', created_by: 'u1', assignee_id: 'u1' },
    })
  })

  it('title 정상 + assignee_id 있음 → 그대로 사용', () => {
    expect(buildTaskRecord({ title: 'hi', assignee_id: 'a1' }, user)).toEqual({
      ok: true,
      record: { title: 'hi', created_by: 'u1', assignee_id: 'a1' },
    })
  })

  // ?? vs || 구별: "" 는 falsy 이지만 null/undefined 가 아니므로 ?? 는 그대로 통과
  it('assignee_id "" → ?? 로 빈 문자열 유지 (|| 이었다면 user.id 로 바뀜)', () => {
    expect(buildTaskRecord({ title: 'hi', assignee_id: '' }, user)).toEqual({
      ok: true,
      record: { title: 'hi', created_by: 'u1', assignee_id: '' },
    })
  })
})
