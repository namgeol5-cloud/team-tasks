'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Trash2, UserPlus } from 'lucide-react'
import { useStore } from '@/lib/store'

interface MemberDialogProps {
  open: boolean
  onClose: () => void
}

export function MemberDialog({ open, onClose }: MemberDialogProps) {
  const { members, tasks, addMember, removeMember } = useStore()
  const [name, setName] = useState('')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addMember(trimmed)
    setName('')
  }

  const getTaskCount = (memberId: string) =>
    tasks.filter((t) => t.assigneeId === memberId && t.status !== 'done').length

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>팀원 관리</DialogTitle>
          <DialogDescription>팀원을 추가하거나 삭제할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Member list */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                팀원이 없습니다. 아래에서 추가해주세요.
              </p>
            ) : (
              members.map((member) => {
                const activeTasks = getTaskCount(member.id)
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-lg border p-3 bg-background"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className="text-xs font-bold text-white"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        진행 중 일감 {activeTasks}개
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeMember(member.id)}
                      className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>

          <Separator />

          {/* Add member form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="팀원 이름"
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!name.trim()}>
              <UserPlus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
