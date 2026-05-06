"use client";

import React, { useState } from "react";
import { Status } from "@/lib/types";
import { useFilteredTasks, useTaskStore } from "@/lib/store";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const columns: { status: Status; label: string; color: string; dotColor: string }[] = [
  { status: "todo", label: "할 일", color: "bg-slate-50 border-slate-200", dotColor: "bg-slate-400" },
  {
    status: "in-progress",
    label: "진행 중",
    color: "bg-blue-50 border-blue-200",
    dotColor: "bg-blue-500",
  },
  {
    status: "done",
    label: "완료",
    color: "bg-green-50 border-green-200",
    dotColor: "bg-green-500",
  },
];

function Column({ status, label, color, dotColor }: (typeof columns)[number]) {
  const tasks = useFilteredTasks(status);
  const { state } = useTaskStore();
  const totalCount = state.tasks.filter((t) => t.status === status).length;
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className={cn("rounded-t-lg border px-3 py-2.5", color)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", dotColor)} />
            <span className="text-sm font-semibold">{label}</span>
            <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
              {totalCount}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setAddOpen(true)}
            title="일감 추가"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto rounded-b-lg border border-t-0 p-2 space-y-2",
          color,
          "min-h-[400px] max-h-[calc(100vh-220px)]"
        )}
      >
        {tasks.length === 0 && (
          <div className="flex h-24 items-center justify-center">
            <p className="text-xs text-muted-foreground">일감이 없습니다</p>
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

      <TaskDialog open={addOpen} onOpenChange={setAddOpen} defaultStatus={status} />
    </div>
  );
}

export function TaskBoard() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {columns.map((col) => (
        <Column key={col.status} {...col} />
      ))}
    </div>
  );
}
