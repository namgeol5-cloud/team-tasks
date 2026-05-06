"use client";

import React from "react";
import { useTaskStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

export function FilterBar() {
  const { state, dispatch } = useTaskStore();
  const { filter, members } = state;

  const hasFilter =
    filter.search !== "" || filter.priority !== "all" || filter.assigneeId !== "all";

  function reset() {
    dispatch({ type: "SET_FILTER", filter: { search: "", priority: "all", assigneeId: "all" } });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 w-52 pl-8 text-sm"
          placeholder="일감 검색..."
          value={filter.search}
          onChange={(e) =>
            dispatch({ type: "SET_FILTER", filter: { search: e.target.value } })
          }
        />
      </div>

      <Select
        value={filter.priority}
        onValueChange={(v) =>
          dispatch({
            type: "SET_FILTER",
            filter: { priority: v as typeof filter.priority },
          })
        }
      >
        <SelectTrigger className="h-9 w-32 text-sm">
          <SelectValue placeholder="우선순위" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 우선순위</SelectItem>
          <SelectItem value="high">높음</SelectItem>
          <SelectItem value="medium">보통</SelectItem>
          <SelectItem value="low">낮음</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filter.assigneeId}
        onValueChange={(v) =>
          dispatch({ type: "SET_FILTER", filter: { assigneeId: v } })
        }
      >
        <SelectTrigger className="h-9 w-36 text-sm">
          <SelectValue placeholder="담당자" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 담당자</SelectItem>
          {members.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilter && (
        <Button variant="ghost" size="sm" className="h-9 px-2 text-muted-foreground" onClick={reset}>
          <X className="mr-1 h-3.5 w-3.5" />
          초기화
        </Button>
      )}
    </div>
  );
}
