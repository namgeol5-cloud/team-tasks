'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Member, Priority, Status, Task } from './types'
import { getInitials, MEMBER_COLORS } from './utils'

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: '김지훈', color: MEMBER_COLORS[0], initials: '김지' },
  { id: 'm2', name: '이수진', color: MEMBER_COLORS[1], initials: '이수' },
  { id: 'm3', name: '박민준', color: MEMBER_COLORS[2], initials: '박민' },
]

const now = new Date().toISOString()

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: '사용자 인증 시스템 구현',
    description: 'JWT 기반 로그인/회원가입 API 개발 및 미들웨어 연동',
    status: 'done',
    priority: 'high',
    assigneeId: 'm1',
    dueDate: '2026-05-01',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't2',
    title: '대시보드 UI 디자인',
    description: '메인 대시보드 컴포넌트 개발 및 반응형 레이아웃 적용',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'm2',
    dueDate: '2026-05-10',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't3',
    title: '데이터베이스 스키마 설계',
    description: '핵심 엔티티 테이블 설계 및 인덱싱 전략 수립',
    status: 'review',
    priority: 'urgent',
    assigneeId: 'm1',
    dueDate: '2026-05-08',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't4',
    title: 'API 문서화',
    description: 'Swagger/OpenAPI 스펙 작성 및 예시 요청/응답 추가',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'm3',
    dueDate: '2026-05-20',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't5',
    title: '성능 최적화',
    description: 'N+1 쿼리 문제 해결 및 Redis 캐싱 전략 수립',
    status: 'todo',
    priority: 'medium',
    assigneeId: null,
    dueDate: '2026-05-25',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't6',
    title: '단위 테스트 작성',
    description: '핵심 비즈니스 로직 테스트 커버리지 80% 달성 목표',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'm3',
    dueDate: '2026-05-15',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 't7',
    title: '배포 파이프라인 구축',
    description: 'GitHub Actions CI/CD 설정 및 스테이징 환경 구성',
    status: 'todo',
    priority: 'low',
    assigneeId: 'm2',
    dueDate: '2026-05-30',
    createdAt: now,
    updatedAt: now,
  },
]

export interface Filters {
  search: string
  priority: Priority | 'all'
  assigneeId: string | 'all'
}

interface AppStore {
  tasks: Task[]
  members: Member[]
  filters: Filters
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, status: Status) => void
  addMember: (name: string) => void
  removeMember: (id: string) => void
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void
  resetFilters: () => void
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  priority: 'all',
  assigneeId: 'all',
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      tasks: INITIAL_TASKS,
      members: INITIAL_MEMBERS,
      filters: DEFAULT_FILTERS,

      addTask: (taskData) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...taskData,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
          ),
        })),

      addMember: (name) =>
        set((state) => ({
          members: [
            ...state.members,
            {
              id: crypto.randomUUID(),
              name,
              color: MEMBER_COLORS[state.members.length % MEMBER_COLORS.length],
              initials: getInitials(name),
            },
          ],
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          tasks: state.tasks.map((t) =>
            t.assigneeId === id ? { ...t, assigneeId: null } : t
          ),
        })),

      setFilter: (key, value) =>
        set((state) => ({ filters: { ...state.filters, [key]: value } })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),
    }),
    { name: 'team-tasks-store' }
  )
)
