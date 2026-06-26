import { KanbanBoardType } from "@/types/kanban";

export const mockKanbanBoards: KanbanBoardType[] = [
  {
    id: "d3e16696-fa4a-4b25-8d40-90bf691d579b",
    name: "TaskFlow 리디자인 보드",
    description: "UI 리뉴얼 칸반 보드",
    project_id: "d12d6c50-d77b-453b-b0ce-59fbdbc953a5",
    columns: "todo,inprogress,done",
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-06-26T00:00:00Z",
  },
  {
    id: "c45339b3-7695-4a33-9afa-c1510a268e45",
    name: "쇼핑몰 백엔드 보드",
    description: "API 개편 칸반 보드",
    project_id: "ffb9dc8c-a01d-42a0-9a1c-826959a4c511",
    columns: "todo,inprogress,done",
    created_at: "2026-04-15T00:00:00Z",
    updated_at: "2026-06-26T00:00:00Z",
  },
  {
    id: "0130bf82-e86f-4475-b894-7666bb6985da",
    name: "마케팅 캠페인 보드",
    description: "Q2 캠페인 칸반 보드",
    project_id: "deb83065-5c87-4394-bd19-8f6385537242",
    columns: "todo,inprogress,done",
    created_at: "2026-06-01T00:00:00Z",
    updated_at: "2026-06-26T00:00:00Z",
  },
];
