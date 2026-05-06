import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Priority, Status } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export const MEMBER_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
]

export const STATUS_CONFIG: Record<
  Status,
  { label: string; headerBg: string; headerText: string; dot: string }
> = {
  todo: {
    label: 'Todo',
    headerBg: 'bg-slate-100',
    headerText: 'text-slate-700',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'In Progress',
    headerBg: 'bg-blue-50',
    headerText: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  review: {
    label: 'Review',
    headerBg: 'bg-purple-50',
    headerText: 'text-purple-700',
    dot: 'bg-purple-500',
  },
  done: {
    label: 'Done',
    headerBg: 'bg-green-50',
    headerText: 'text-green-700',
    dot: 'bg-green-500',
  },
}

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; badge: string; border: string; dot: string }
> = {
  low: {
    label: '낮음',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    border: 'border-l-slate-300',
    dot: 'bg-slate-400',
  },
  medium: {
    label: '보통',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
    border: 'border-l-sky-400',
    dot: 'bg-sky-400',
  },
  high: {
    label: '높음',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    border: 'border-l-orange-400',
    dot: 'bg-orange-400',
  },
  urgent: {
    label: '긴급',
    badge: 'bg-red-100 text-red-700 border-red-200',
    border: 'border-l-red-500',
    dot: 'bg-red-500',
  },
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function isOverdue(dueDate: string | null, status: Status): boolean {
  if (!dueDate || status === 'done') return false
  return new Date(dueDate) < new Date(new Date().toDateString())
}
