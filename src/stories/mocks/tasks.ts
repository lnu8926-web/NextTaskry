import { Task } from "@/types";

export const mockTask: Task = {
  id: "task-1",
  kanban_board_id: "board-1",
  project_id: "project-1",
  title: "디자인 시스템 컴포넌트 설계",
  description: "Button, Badge, Modal 등 공통 UI 컴포넌트를 설계합니다.",
  status: "inprogress",
  priority: "high",
  started_at: "2026-06-20",
  ended_at: "2026-06-30",
  use_time: false,
  memo: "figma 파일 참고",
  subtasks: [
    { id: "s1", title: "Button 설계", completed: true },
    { id: "s2", title: "Badge 설계", completed: true },
    { id: "s3", title: "Modal 설계", completed: false },
  ],
  assignee: {
    user_id: "user-1",
    name: "김개발",
    email: "dev@example.com",
    avatar_url: null,
  },
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-20T00:00:00Z",
};

export const mockTaskTodo: Task = {
  id: "task-2",
  kanban_board_id: "board-1",
  project_id: "project-1",
  title: "Storybook 스토리 작성",
  status: "todo",
  priority: "normal",
  ended_at: "2026-07-05",
  use_time: false,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-20T00:00:00Z",
};

export const mockTaskDone: Task = {
  id: "task-3",
  kanban_board_id: "board-1",
  project_id: "project-1",
  title: "배포 파이프라인 구성",
  description: "Chromatic 배포 설정 완료",
  status: "done",
  priority: "low",
  started_at: "2026-06-10",
  ended_at: "2026-06-15",
  use_time: false,
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-20T00:00:00Z",
};

export const mockTaskOverdue: Task = {
  id: "task-4",
  kanban_board_id: "board-1",
  project_id: "project-1",
  title: "API 문서화 작성",
  status: "todo",
  priority: "high",
  ended_at: "2026-06-01",
  use_time: false,
  assignee: {
    user_id: "user-2",
    name: "이디자인",
    email: "design@example.com",
    avatar_url: null,
  },
  created_at: "2026-05-01T00:00:00Z",
  updated_at: "2026-06-01T00:00:00Z",
};

export const mockTaskInProgress2: Task = {
  id: "task-5",
  kanban_board_id: "board-1",
  project_id: "project-1",
  title: "접근성 테스트 진행",
  status: "inprogress",
  priority: "normal",
  started_at: "2026-06-22",
  ended_at: "2026-07-01",
  use_time: false,
  subtasks: [
    { id: "s4", title: "스크린리더 테스트", completed: false },
    { id: "s5", title: "키보드 내비게이션 확인", completed: false },
  ],
  created_at: "2026-06-01T00:00:00Z",
  updated_at: "2026-06-22T00:00:00Z",
};

export const mockTasks: Task[] = [mockTask, mockTaskInProgress2];

export const mockTasksDone: Task[] = [mockTaskDone];

export const mockAllTasks: Task[] = [
  mockTask,
  mockTaskTodo,
  mockTaskDone,
  mockTaskOverdue,
  mockTaskInProgress2,
];
