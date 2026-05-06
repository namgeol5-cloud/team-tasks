"use client";

import React, { useState } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";

const PRESET_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
];

interface MemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDialog({ open, onOpenChange }: MemberDialogProps) {
  const { state, dispatch } = useTaskStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch({
      type: "ADD_MEMBER",
      member: { id: generateId(), name: name.trim(), color },
    });
    setName("");
    setColor(PRESET_COLORS[0]);
  }

  function getInitials(n: string) {
    return n.slice(0, 2);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>팀 멤버 관리</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="divide-y rounded-md border">
            {state.members.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">멤버가 없습니다</p>
            )}
            {state.members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback style={{ backgroundColor: m.color, color: "#fff" }}>
                      {getInitials(m.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{m.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => dispatch({ type: "DELETE_MEMBER", id: m.id })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="memberName">이름</Label>
              <Input
                id="memberName"
                placeholder="멤버 이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>색상</Label>
              <div className="flex gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="h-7 w-7 rounded-full ring-offset-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: color === c ? `2px solid ${c}` : "none",
                    }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={!name.trim()}>
              멤버 추가
            </Button>
          </form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
