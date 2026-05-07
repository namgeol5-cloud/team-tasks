import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('task_id')

  let query = supabase
    .from('comments')
    .select('*')
    .order('created_at', { ascending: false })

  if (taskId) query = query.eq('task_id', taskId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { body, task_id } = await request.json()

  if (!body?.trim()) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }
  if (!task_id) {
    return NextResponse.json({ error: 'task_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({ body: body.trim(), task_id, created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
