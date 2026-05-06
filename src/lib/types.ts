export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "done";

export interface Member {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  assigneeId?: string;
  dueDate?: string;
  createdAt: string;
  tags?: string[];
}

export interface FilterState {
  search: string;
  priority: Priority | "all";
  assigneeId: string | "all";
}
