export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'todo' | 'in_progress' | 'review' | 'done'

export interface Member {
  id: string
  name: string
  color: string
  initials: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}
