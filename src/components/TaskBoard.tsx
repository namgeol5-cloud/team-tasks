'use client'

import { useState } from 'react'
import { Plus, Users, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/lib/store'
import type { Status, Task } from '@/lib/types'
import { STATUS_CONFIG, cn } from '@/lib/utils'
import { TaskCard } from './TaskCard'
import { TaskDialog } from './TaskDialog'
import { MemberDialog } from './MemberDialog'
import { FilterBar } from './FilterBar'

const COLUMNS: { status: Status }[] = [
  { status: 'todo' },
  { status: 'in_progress' },
  { status: 'review' },
  { status: 'done' },
]

export function TaskBoard() {
  const { tasks, filters } = useStore()
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<Status>('todo')

  const filteredTasks = tasks.filter((task) => {
    if (
      filters.search &&
      !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !task.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false
    if (filters.assigneeId !== 'all') {
      if (filters.assigneeId === 'unassigned' && task.assigneeId !== null) return false
      if (filters.assigneeId !== 'unassigned' && task.assigneeId !== filters.assigneeId) return false
    }
    return true
  })

  const openAddTask = (status: Status) => {
    setEditingTask(null)
    setDefaultStatus(status)
    setTaskDialogOpen(true)
  }

  const totalActive = tasks.filter((t) => t.status !== 'done').length
  const totalDone = tasks.filter((t) => t.status === 'done').length

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Team Tasks</h1>
            <p className="text-xs text-muted-foreground">
              진행 중 {totalActive}개 · 완료 {totalDone}개
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMemberDialogOpen(true)}
            className="hidden sm:flex"
          >
            <Users className="h-4 w-4" />
            팀원 관리
          </Button>
          <Button size="sm" onClick={() => openAddTask('todo')}>
            <Plus className="h-4 w-4" />
            새 일감
          </Button>
        </div>
      </header>

      {/* Filter bar */}
      <FilterBar />

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full p-4 min-w-max">
          {COLUMNS.map(({ status }) => {
            const cfg = STATUS_CONFIG[status]
            const columnTasks = filteredTasks.filter((t) => t.status === status)

            return (
              <div
                key={status}
                className="flex flex-col w-[288px] shrink-0 rounded-xl bg-muted/40 border"
              >
                {/* Column header */}
                <div
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-t-xl border-b',
                    cfg.headerBg
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                    <span className={cn('text-sm font-semibold', cfg.headerText)}>
                      {cfg.label}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/70',
                        cfg.headerText
                      )}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openAddTask(status)}
                    className={cn('hover:bg-white/50', cfg.headerText)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Task list */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {columnTasks.length === 0 ? (
                    <div
                      className="flex items-center justify-center h-16 rounded-lg border-2 border-dashed border-muted-foreground/20 cursor-pointer hover:border-muted-foreground/40 transition-colors"
                      onClick={() => openAddTask(status)}
                    >
                      <span className="text-xs text-muted-foreground">+ 일감 추가</span>
                    </div>
                  ) : (
                    columnTasks.map((task) => <TaskCard key={task.id} task={task} />)
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dialogs */}
      <TaskDialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
      <MemberDialog open={memberDialogOpen} onClose={() => setMemberDialogOpen(false)} />
    </div>
  )
}
