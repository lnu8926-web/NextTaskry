"use client";

import { TaskPriority } from "@/types";

export interface WorkspaceFilterType {
  priority: TaskPriority | "all";
  assignee: "all" | "assigned" | "unassigned" | "me";
  date: "all" | "today" | "thisWeek" | "overdue";
}

interface WorkspaceFilterProps {
  filter: WorkspaceFilterType;
  onFilterChange: (updates: Partial<WorkspaceFilterType>) => void;
  taskCount: number;
  totalCount: number;
  onReset?: () => void;
}

export default function WorkspaceFilter({
  filter,
  onFilterChange,
  taskCount,
  totalCount,
  onReset,
}: WorkspaceFilterProps) {
  const hasActiveFilter =
    filter.priority !== "all" || filter.assignee !== "all" || filter.date !== "all";

  const btn = (active: boolean) =>
    `text-sm px-3 py-1.5 rounded transition-all ${
      active
        ? "bg-main-500 text-white"
        : "bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    }`;

  return (
    <div className="mb-4 px-5 py-4 border border-border bg-muted/40 rounded-lg">
      <div className="flex flex-col gap-3">
        {/* 우선순위 */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium w-16">우선순위</span>
          <div className="flex gap-2">
            {(["all", "high", "normal", "low"] as const).map((v) => (
              <button key={v} onClick={() => onFilterChange({ priority: v })} className={btn(filter.priority === v)}>
                {{ all: "전체", high: "높음", normal: "보통", low: "낮음" }[v]}
              </button>
            ))}
          </div>
        </div>

        {/* 담당자 */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium w-16">담당자</span>
          <div className="flex gap-2">
            {(["all", "me", "assigned", "unassigned"] as const).map((v) => (
              <button key={v} onClick={() => onFilterChange({ assignee: v })} className={btn(filter.assignee === v)}>
                {{ all: "전체", me: "내 작업", assigned: "할당됨", unassigned: "미할당" }[v]}
              </button>
            ))}
          </div>
        </div>

        {/* 기간 */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-foreground font-medium w-16">기간</span>
          <div className="flex gap-2">
            {(["all", "today", "thisWeek", "overdue"] as const).map((v) => (
              <button key={v} onClick={() => onFilterChange({ date: v })} className={btn(filter.date === v)}>
                {{ all: "전체", today: "오늘", thisWeek: "이번주", overdue: "지연" }[v]}
              </button>
            ))}
          </div>
        </div>

        {/* 결과 카운트 + 초기화 */}
        <div className="pt-3 mt-1 border-t border-border flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {taskCount}개 / 전체 {totalCount}개
            {taskCount === 0 && hasActiveFilter && (
              <span className="ml-2 text-main-600 dark:text-main-400">— 조건에 맞는 작업이 없어요</span>
            )}
          </span>
          {hasActiveFilter && onReset && (
            <button onClick={onReset} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
              초기화
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
