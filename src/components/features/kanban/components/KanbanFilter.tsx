// src/components/features/kanban/components/KanbanFilter.tsx
"use client";

import { TaskPriority } from "@/types";

interface KanbanFilterType {
  priority: TaskPriority | "all";
  assignee: "all" | "assigned" | "unassigned" | "me";
  date: "all" | "today" | "thisWeek" | "overdue";
}

interface KanbanFilterProps {
  filter: KanbanFilterType;
  onFilterChange: (key: keyof KanbanFilterType, value: string) => void;
  showFilter: boolean;
  taskCount: number;
  totalCount: number;
  onReset?: () => void;
}

export type { KanbanFilterType };

export default function KanbanFilter({
  filter,
  onFilterChange,
  showFilter,
  taskCount,
  totalCount,
  onReset,
}: KanbanFilterProps) {
  const hasActiveFilter =
    filter.priority !== "all" || filter.assignee !== "all" || filter.date !== "all";
  if (!showFilter) return null;

  return (
    <div className="mt-4 mb-4 px-5 py-4 border border-border bg-muted/40 rounded-lg">
      <div className="flex flex-col gap-3">
        {/* 우선순위 */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium w-16">
            우선순위
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange("priority", "all")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.priority === "all"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => onFilterChange("priority", "high")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.priority === "high"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              높음
            </button>
            <button
              onClick={() => onFilterChange("priority", "normal")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.priority === "normal"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              보통
            </button>
            <button
              onClick={() => onFilterChange("priority", "low")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.priority === "low"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              낮음
            </button>
          </div>
        </div>

        {/* 담당자 */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium w-16">
            담당자
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange("assignee", "all")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.assignee === "all"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => onFilterChange("assignee", "me")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.assignee === "me"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              내 작업
            </button>
            <button
              onClick={() => onFilterChange("assignee", "assigned")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.assignee === "assigned"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              할당됨
            </button>
            <button
              onClick={() => onFilterChange("assignee", "unassigned")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.assignee === "unassigned"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              미할당
            </button>
          </div>
        </div>

        {/* 기간 */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium w-16">
            기간
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onFilterChange("date", "all")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.date === "all"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              전체
            </button>
            <button
              onClick={() => onFilterChange("date", "today")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.date === "today"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              오늘
            </button>
            <button
              onClick={() => onFilterChange("date", "thisWeek")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.date === "thisWeek"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              이번주
            </button>
            <button
              onClick={() => onFilterChange("date", "overdue")}
              className={`text-sm px-3 py-1.5 rounded transition-all ${
                filter.date === "overdue"
                  ? "bg-main-500 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              지연
            </button>
          </div>
        </div>

        {/* 구분선 + 결과 카운트 */}
        <div className="pt-3 mt-1 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {taskCount}개 / 전체 {totalCount}개
            {taskCount === 0 && hasActiveFilter && (
              <span className="ml-2 text-main-600 dark:text-main-400">
                — 조건에 맞는 작업이 없어요
              </span>
            )}
          </span>
          {hasActiveFilter && onReset && (
            <button
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
