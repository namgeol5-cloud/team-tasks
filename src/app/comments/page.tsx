'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/lib/database.types'

type Task = Tables<'tasks'>
type Comment = Tables<'comments'>

export default function CommentsPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editBody, setEditBody] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUserId(data.user.id)
    })
    fetch('/api/tasks')
      .then((r) => r.json())
      .then((data) => { setTasks(data); setLoading(false) })
  }, [router])

  async function loadComments(taskId: string) {
    const res = await fetch(`/api/comments?task_id=${taskId}`)
    if (res.ok) setComments(await res.json())
  }

  function selectTask(task: Task) {
    setSelectedTaskId(task.id)
    setBody('')
    setEditingId(null)
    startTransition(() => loadComments(task.id))
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || !selectedTaskId) return
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, task_id: selectedTaskId }),
    })
    setBody('')
    startTransition(() => loadComments(selectedTaskId))
  }

  async function saveEdit(id: string) {
    if (!editBody.trim()) return
    await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: editBody }),
    })
    setEditingId(null)
    if (selectedTaskId) startTransition(() => loadComments(selectedTaskId))
  }

  async function removeComment(id: string) {
    await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (selectedTaskId) startTransition(() => loadComments(selectedTaskId))
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">댓글 관리</h1>
        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
          ← 일감 목록
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">로딩 중…</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* 일감 목록 */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">일감 선택</p>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">일감이 없습니다.</p>
            ) : (
              <ul className="space-y-1">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <button
                      onClick={() => selectTask(task)}
                      className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selectedTaskId === task.id
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'hover:border-primary/40'
                      }`}
                    >
                      {task.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 댓글 패널 */}
          <div className="space-y-4">
            {selectedTask ? (
              <>
                <p className="text-sm font-medium text-muted-foreground">
                  &ldquo;{selectedTask.title}&rdquo; 댓글
                </p>

                {/* 댓글 작성 폼 */}
                <form onSubmit={addComment} className="flex gap-2">
                  <Input
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="댓글 내용"
                    disabled={isPending}
                  />
                  <Button type="submit" disabled={!body.trim() || isPending}>
                    등록
                  </Button>
                </form>

                {/* 댓글 목록 */}
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">댓글이 없습니다.</p>
                ) : (
                  <ul className="space-y-2">
                    {comments.map((comment) => (
                      <li key={comment.id} className="rounded-lg border px-3 py-2 space-y-2">
                        {editingId === comment.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={editBody}
                              onChange={(e) => setEditBody(e.target.value)}
                              autoFocus
                            />
                            <Button size="sm" onClick={() => saveEdit(comment.id)}>
                              저장
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              취소
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <p className="flex-1 text-sm">{comment.body}</p>
                            {comment.created_by === userId && (
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => {
                                    setEditingId(comment.id)
                                    setEditBody(comment.body)
                                  }}
                                >
                                  수정
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                                  onClick={() => removeComment(comment.id)}
                                >
                                  삭제
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">왼쪽에서 일감을 선택하세요.</p>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
