"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Task, Member, Status, Priority, FilterState } from "./types";

interface State {
  tasks: Task[];
  members: Member[];
  filter: FilterState;
}

type Action =
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; task: Task }
  | { type: "DELETE_TASK"; id: string }
  | { type: "MOVE_TASK"; id: string; status: Status }
  | { type: "ADD_MEMBER"; member: Member }
  | { type: "DELETE_MEMBER"; id: string }
  | { type: "SET_FILTER"; filter: Partial<FilterState> }
  | { type: "HYDRATE"; state: Pick<State, "tasks" | "members"> };

const initialMembers: Member[] = [
  { id: "m1", name: "김민준", color: "#3B82F6" },
  { id: "m2", name: "이서연", color: "#10B981" },
  { id: "m3", name: "박지현", color: "#F59E0B" },
];

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "프로젝트 요구사항 분석",
    description: "고객과의 미팅을 통해 요구사항을 정리하고 문서화합니다.",
    status: "done",
    priority: "high",
    assigneeId: "m1",
    dueDate: "2026-04-30",
    createdAt: new Date().toISOString(),
    tags: ["분석", "기획"],
  },
  {
    id: "t2",
    title: "UI 디자인 시스템 구축",
    description: "공통 컴포넌트와 디자인 토큰을 정의하고 스토리북을 작성합니다.",
    status: "in-progress",
    priority: "high",
    assigneeId: "m2",
    dueDate: "2026-05-10",
    createdAt: new Date().toISOString(),
    tags: ["디자인", "개발"],
  },
  {
    id: "t3",
    title: "REST API 엔드포인트 개발",
    description: "인증, 사용자, 게시물 관련 API를 설계하고 구현합니다.",
    status: "in-progress",
    priority: "medium",
    assigneeId: "m3",
    dueDate: "2026-05-15",
    createdAt: new Date().toISOString(),
    tags: ["백엔드"],
  },
  {
    id: "t4",
    title: "단위 테스트 작성",
    description: "핵심 비즈니스 로직에 대한 테스트 커버리지를 80% 이상으로 높입니다.",
    status: "todo",
    priority: "medium",
    assigneeId: "m1",
    dueDate: "2026-05-20",
    createdAt: new Date().toISOString(),
    tags: ["테스트"],
  },
  {
    id: "t5",
    title: "성능 최적화",
    description: "Lighthouse 점수 90점 이상을 목표로 최적화 작업을 진행합니다.",
    status: "todo",
    priority: "low",
    assigneeId: "m2",
    dueDate: "2026-05-25",
    createdAt: new Date().toISOString(),
    tags: ["최적화"],
  },
  {
    id: "t6",
    title: "CI/CD 파이프라인 설정",
    description: "GitHub Actions를 이용해 자동 빌드, 테스트, 배포 환경을 구성합니다.",
    status: "todo",
    priority: "high",
    dueDate: "2026-05-12",
    createdAt: new Date().toISOString(),
    tags: ["DevOps"],
  },
];

const initialState: State = {
  tasks: initialTasks,
  members: initialMembers,
  filter: { search: "", priority: "all", assigneeId: "all" },
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, tasks: action.state.tasks, members: action.state.members };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.task.id ? action.task : t)),
      };
    case "DELETE_TASK":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.id) };
    case "MOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: action.status } : t
        ),
      };
    case "ADD_MEMBER":
      return { ...state, members: [...state.members, action.member] };
    case "DELETE_MEMBER":
      return {
        ...state,
        members: state.members.filter((m) => m.id !== action.id),
        tasks: state.tasks.map((t) =>
          t.assigneeId === action.id ? { ...t, assigneeId: undefined } : t
        ),
      };
    case "SET_FILTER":
      return { ...state, filter: { ...state.filter, ...action.filter } };
    default:
      return state;
  }
}

interface TaskContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem("team-tasks-store");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: "HYDRATE", state: parsed });
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "team-tasks-store",
      JSON.stringify({ tasks: state.tasks, members: state.members })
    );
  }, [state.tasks, state.members]);

  return <TaskContext.Provider value={{ state, dispatch }}>{children}</TaskContext.Provider>;
}

export function useTaskStore() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTaskStore must be used within TaskProvider");
  return ctx;
}

export function useFilteredTasks(status: Status) {
  const { state } = useTaskStore();
  const { tasks, filter } = state;
  return tasks.filter((t) => {
    if (t.status !== status) return false;
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase()))
      return false;
    if (filter.priority !== "all" && t.priority !== filter.priority) return false;
    if (filter.assigneeId !== "all" && t.assigneeId !== filter.assigneeId) return false;
    return true;
  });
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}
