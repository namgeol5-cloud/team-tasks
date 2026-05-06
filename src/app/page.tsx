"use client";

import React, { useState } from "react";
import { useTaskStore } from "@/lib/store";
import { TaskBoard } from "@/components/TaskBoard";
import { TaskDialog } from "@/components/TaskDialog";
import { MemberDialog } from "@/components/MemberDialog";
import { FilterBar } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutDashboard, Plus, Users } from "lucide-react";

function StatBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-xs font-medium shadow-sm">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{count}</span>
    </div>
  );
}

export default function Page() {
  const { state } = useTaskStore();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);

  const todoCount = state.tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = state.tasks.filter((t) => t.status === "in-progress").length;
  const doneCount = state.tasks.filter((t) => t.status === "done").length;

  function getInitials(name: string) {
    return name.slice(0, 2);
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex h-14 items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                <h1 className="text-base font-bold tracking-tight">팀 일감 관리</h1>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <StatBadge label="할 일" count={todoCount} color="bg-slate-400" />
                <StatBadge label="진행 중" count={inProgressCount} color="bg-blue-500" />
                <StatBadge label="완료" count={doneCount} color="bg-green-500" />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {state.members.map((m, i) => (
                    <Tooltip key={m.id}>
                      <TooltipTrigger asChild>
                        <Avatar
                          className="h-7 w-7 cursor-pointer ring-2 ring-white hover:z-10"
                          style={{ marginLeft: i > 0 ? "-6px" : 0 }}
                        >
                          <AvatarFallback
                            style={{ backgroundColor: m.color, color: "#fff" }}
                            className="text-[10px]"
                          >
                            {getInitials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>{m.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setMemberDialogOpen(true)}
                >
                  <Users className="h-3.5 w-3.5" />
                  멤버
                </Button>

                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => setTaskDialogOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  일감 추가
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          {/* Mobile stats */}
          <div className="mb-4 flex flex-wrap gap-2 sm:hidden">
            <StatBadge label="할 일" count={todoCount} color="bg-slate-400" />
            <StatBadge label="진행 중" count={inProgressCount} color="bg-blue-500" />
            <StatBadge label="완료" count={doneCount} color="bg-green-500" />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <FilterBar />
            <p className="text-xs text-muted-foreground">
              전체 {state.tasks.length}개 일감
            </p>
          </div>

          <Separator className="mb-5" />

          <TaskBoard />
        </main>

        <TaskDialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen} />
        <MemberDialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen} />
      </div>
    </TooltipProvider>
  );
}
