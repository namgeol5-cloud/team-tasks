// 인증 실패 응답: 단위 테스트(핸들러 직접)→ 401, 통합(proxy.ts 경유)→ 307 redirect /login
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildTaskRecord } from './build-record'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = buildTaskRecord(body, user)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert(result.record)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
