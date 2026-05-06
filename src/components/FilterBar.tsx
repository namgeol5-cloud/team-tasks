'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStore } from '@/lib/store'
import type { Priority } from '@/lib/types'

export function FilterBar() {
  const { members, filters, setFilter, resetFilters } = useStore()

  const hasActiveFilters =
    filters.search !== '' || filters.priority !== 'all' || filters.assigneeId !== 'all'

  return (
    <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b bg-white">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="제목으로 검색..."
          className="pl-9 h-9"
        />
      </div>

      {/* Priority filter */}
      <Select
        value={filters.priority}
        onValueChange={(v) => setFilter('priority', v as Priority | 'all')}
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="우선순위" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 우선순위</SelectItem>
          <SelectItem value="urgent">긴급</SelectItem>
          <SelectItem value="high">높음</SelectItem>
          <SelectItem value="medium">보통</SelectItem>
          <SelectItem value="low">낮음</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee filter */}
      <Select
        value={filters.assigneeId}
        onValueChange={(v) => setFilter('assigneeId', v)}
      >
        <SelectTrigger className="h-9 w-[130px]">
          <SelectValue placeholder="담당자" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 담당자</SelectItem>
          <SelectItem value="unassigned">미배정</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 text-muted-foreground">
          <X className="h-4 w-4 mr-1" />
          초기화
        </Button>
      )}
    </div>
  )
}
