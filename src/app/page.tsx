'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/database.types'

type Task = Tables<'tasks'>

export default function Home() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function load() {
    const res = await fetch('/api/tasks')
    if (res.ok) setTasks(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
    })
    load()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    setTitle('')
    startTransition(load)
  }

  async function toggle(task: Task) {
    const next = task.status === 'todo' ? 'done' : 'todo'
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    startTransition(load)
  }

  async function remove(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    startTransition(load)
  }

  return (
    <main className="max-w-xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Tasks</h1>
          <p className="text-sm text-muted-foreground">내가 만들거나 내게 배정된 일감만 표시됩니다.</p>
        </div>
        <div className="flex items-center gap-3">
          {email && (
            <span className="text-sm text-muted-foreground">{email}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </div>

      <form onSubmit={addTask} className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 일감 제목"
          disabled={isPending}
        />
        <Button type="submit" disabled={!title.trim()}>
          추가
        </Button>
      </form>

      {loading ? (
        <p className="text-sm text-muted-foreground">로딩 중…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">일감이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg border px-4 py-3"
            >
              <button
                onClick={() => toggle(task)}
                aria-label={task.status === 'done' ? '완료 취소' : '완료 표시'}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
                  task.status === 'done'
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              />
              <span
                className={`flex-1 text-sm ${
                  task.status === 'done'
                    ? 'line-through text-muted-foreground'
                    : ''
                }`}
              >
                {task.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(task.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                삭제
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
