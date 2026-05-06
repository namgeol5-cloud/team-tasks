'use client'

import { useState } from 'react'
import { CalendarDays, MoreHorizontal, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useStore } from '@/lib/store'
import type { Task, Status } from '@/lib/types'
import { PRIORITY_CONFIG, cn, formatDate, isOverdue } from '@/lib/utils'
import { TaskDialog } from './TaskDialog'

const STATUSES: { value: Status; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const { members, deleteTask, moveTask } = useStore()
  const [editOpen, setEditOpen] = useState(false)

  const assignee = members.find((m) => m.id === task.assigneeId)
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const overdue = isOverdue(task.dueDate, task.status)
  const otherStatuses = STATUSES.filter((s) => s.value !== task.status)

  return (
    <>
      <div
        className={cn(
          'group relative bg-white rounded-lg border border-l-[3px] shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer',
          priorityCfg.border
        )}
        onClick={() => setEditOpen(true)}
      >
        <div className="p-3 space-y-2">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug flex-1 line-clamp-2">{task.title}</p>
            <div
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    이동
                  </DropdownMenuLabel>
                  {otherStatuses.map((s) => (
                    <DropdownMenuItem
                      key={s.value}
                      onClick={() => moveTask(task.id, s.value)}
                      className="text-sm"
                    >
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setEditOpen(true)}
                    className="text-sm"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    수정
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteTask(task.id)}
                    className="text-sm text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {/* Priority badge */}
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                  priorityCfg.badge
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', priorityCfg.dot)} />
                {priorityCfg.label}
              </span>

              {/* Due date */}
              {task.dueDate && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-[10px]',
                    overdue ? 'text-red-500 font-semibold' : 'text-muted-foreground'
                  )}
                >
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(task.dueDate)}
                  {overdue && ' 초과'}
                </span>
              )}
            </div>

            {/* Assignee avatar */}
            {assignee ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback
                      className="text-[10px] font-bold text-white"
                      style={{ backgroundColor: assignee.color }}
                    >
                      {assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{assignee.name}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/30" />
            )}
          </div>
        </div>
      </div>

      <TaskDialog open={editOpen} onClose={() => setEditOpen(false)} task={task} />
    </>
  )
}
