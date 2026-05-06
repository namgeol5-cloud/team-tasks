"use client";

import React, { useState } from "react";
import { Task, Status } from "@/lib/types";
import { useTaskStore } from "@/lib/store";
import { TaskDialog } from "./TaskDialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  CalendarDays,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const priorityConfig = {
  high: { label: "높음", className: "bg-red-100 text-red-700 border-red-200" },
  medium: { label: "보통", className: "bg-amber-100 text-amber-700 border-amber-200" },
  low: { label: "낮음", className: "bg-green-100 text-green-700 border-green-200" },
};

const statusMoves: Record<Status, { label: string; next: Status }[]> = {
  todo: [{ label: "진행 중으로", next: "in-progress" }],
  "in-progress": [
    { label: "할 일로", next: "todo" },
    { label: "완료로", next: "done" },
  ],
  done: [{ label: "진행 중으로", next: "in-progress" }],
};

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { state, dispatch } = useTaskStore();
  const [editOpen, setEditOpen] = useState(false);

  const assignee = state.members.find((m) => m.id === task.assigneeId);
  const priority = priorityConfig[task.priority];
  const isOverdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  function getInitials(name: string) {
    return name.slice(0, 2);
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  return (
    <>
      <Card className="group cursor-default select-none p-3 shadow-none hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug flex-1">{task.title}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                수정
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {statusMoves[task.status].map((move) => (
                <DropdownMenuItem
                  key={move.next}
                  onClick={() =>
                    dispatch({ type: "MOVE_TASK", id: task.id, status: move.next })
                  }
                >
                  <ArrowRight className="mr-2 h-3.5 w-3.5" />
                  {move.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => dispatch({ type: "DELETE_TASK", id: task.id })}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between">
          <Badge className={cn("text-[10px] px-1.5 py-0 h-4 border", priority.className)}>
            {priority.label}
          </Badge>

          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-[10px]",
                  isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                )}
              >
                <CalendarDays className="h-3 w-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
            {assignee && (
              <Avatar className="h-5 w-5">
                <AvatarFallback
                  style={{ backgroundColor: assignee.color, color: "#fff" }}
                  className="text-[9px]"
                >
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </Card>

      <TaskDialog open={editOpen} onOpenChange={setEditOpen} task={task} />
    </>
  );
}
