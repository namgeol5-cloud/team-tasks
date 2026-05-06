"use client";

import React, { useEffect, useState } from "react";
import { Task, Priority, Status } from "@/lib/types";
import { useTaskStore, generateId } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: Status;
}

const emptyForm = {
  title: "",
  description: "",
  status: "todo" as Status,
  priority: "medium" as Priority,
  assigneeId: "",
  dueDate: "",
  tags: "",
};

export function TaskDialog({ open, onOpenChange, task, defaultStatus }: TaskDialogProps) {
  const { state, dispatch } = useTaskStore();
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId ?? "",
        dueDate: task.dueDate ?? "",
        tags: task.tags?.join(", ") ?? "",
      });
    } else {
      setForm({ ...emptyForm, status: defaultStatus ?? "todo" });
    }
  }, [task, defaultStatus, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (task) {
      dispatch({
        type: "UPDATE_TASK",
        task: {
          ...task,
          title: form.title,
          description: form.description || undefined,
          status: form.status,
          priority: form.priority,
          assigneeId: form.assigneeId || undefined,
          dueDate: form.dueDate || undefined,
          tags: tags.length ? tags : undefined,
        },
      });
    } else {
      dispatch({
        type: "ADD_TASK",
        task: {
          id: generateId(),
          title: form.title,
          description: form.description || undefined,
          status: form.status,
          priority: form.priority,
          assigneeId: form.assigneeId || undefined,
          dueDate: form.dueDate || undefined,
          tags: tags.length ? tags : undefined,
          createdAt: new Date().toISOString(),
        },
      });
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{task ? "일감 수정" : "새 일감 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="일감 제목을 입력하세요"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              placeholder="상세 내용을 입력하세요"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>상태</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">할 일</SelectItem>
                  <SelectItem value="in-progress">진행 중</SelectItem>
                  <SelectItem value="done">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>우선순위</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>담당자</Label>
              <Select
                value={form.assigneeId}
                onValueChange={(v) => setForm({ ...form, assigneeId: v === "__none__" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="담당자 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">없음</SelectItem>
                  {state.members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate">마감일</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
            <Input
              id="tags"
              placeholder="예: 디자인, 개발, 테스트"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!form.title.trim()}>
              {task ? "저장" : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
