import { KanbanBoardType } from "@/types/kanban";

export const mockKanbanBoards: KanbanBoardType[] = [
  {
    id: "board-001",
    name: "웹 서비스 리뉴얼 보드",
    description: "웹 서비스 리뉴얼 프로젝트 칸반 보드",
    project_id: "project-001",
    columns: "todo,inprogress,done",
    created_at: "2026-02-20T09:00:00Z",
    updated_at: "2026-05-10T09:00:00Z",
  },
  {
    id: "board-002",
    name: "모바일 앱 개발 보드",
    description: "모바일 앱 개발 프로젝트 칸반 보드",
    project_id: "project-002",
    columns: "todo,inprogress,done",
    created_at: "2026-03-15T09:00:00Z",
    updated_at: "2026-05-12T09:00:00Z",
  },
  {
    id: "board-003",
    name: "백엔드 API 개선 보드",
    description: "백엔드 API 개선 프로젝트 칸반 보드",
    project_id: "project-003",
    columns: "todo,inprogress,done",
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-04-30T17:00:00Z",
  },
];
