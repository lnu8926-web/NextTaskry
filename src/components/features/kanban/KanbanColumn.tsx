import { useState, useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, ArrowUpDown, CalendarDays, Flag, ChevronDown, ChevronRight } from "lucide-react";

import { TaskCard } from "@/features/task";
import { Task, TaskStatus } from "@/types";
import { EmptyState } from "@/components/shared/EmptyState";
import { getTaskStatusColor, isTaskOverdue } from "@/lib/utils/taskUtils";

type SortOrder = "default" | "deadline" | "priority";

const PRIORITY_RANK: Record<string, number> = { high: 0, normal: 1, low: 2 };

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  projectId: string;
  onTaskClick: (task: Task) => void;
  onAddClick?: () => void;
  onTitleUpdate?: (taskId: string, title: string) => void;
  isDragging?: boolean;
  collapsible?: boolean;
}

const KanbanColumn = ({
  id,
  title,
  tasks,
  projectId,
  onTaskClick,
  onAddClick,
  onTitleUpdate,
  isDragging = false,
  collapsible = false,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");
  const [collapsed, setCollapsed] = useState(false);

  const statusColors = getTaskStatusColor(id as TaskStatus);

  const overdueCount =
    id !== "done" ? tasks.filter((task) => isTaskOverdue(task)).length : 0;

  const sortedTasks = useMemo(() => {
    if (sortOrder === "deadline") {
      return [...tasks].sort((a, b) => {
        if (!a.ended_at && !b.ended_at) return 0;
        if (!a.ended_at) return 1;
        if (!b.ended_at) return -1;
        return a.ended_at.localeCompare(b.ended_at);
      });
    }
    if (sortOrder === "priority") {
      return [...tasks].sort(
        (a, b) =>
          (PRIORITY_RANK[a.priority ?? "low"] ?? 2) -
          (PRIORITY_RANK[b.priority ?? "low"] ?? 2)
      );
    }
    return tasks;
  }, [tasks, sortOrder]);

  const cycleSortOrder = () => {
    setSortOrder((prev) =>
      prev === "default" ? "deadline" : prev === "deadline" ? "priority" : "default"
    );
  };

  const SortIcon =
    sortOrder === "deadline" ? CalendarDays : sortOrder === "priority" ? Flag : ArrowUpDown;
  const sortTitle =
    sortOrder === "deadline" ? "마감일순" : sortOrder === "priority" ? "우선순위순" : "기본순";

  const getColumnStyle = () => {
    if (isOver) {
      switch (id) {
        case "todo":       return "ring-2 ring-border bg-muted/60";
        case "inprogress": return "ring-2 ring-main-500 dark:ring-main-400 bg-main-500/5";
        case "done":       return "ring-2 ring-emerald-500 dark:ring-emerald-400 bg-emerald-500/[0.063] dark:bg-emerald-900/20";
        default:           return "";
      }
    }
    if (isDragging) return "border-dashed";
    return "";
  };

  return (
    <div
      className={`
        flex flex-col shrink-0 min-h-0
        w-[calc(100vw-3rem)] min-w-[260px]
        sm:w-80 sm:min-w-[280px]
        md:w-[300px] md:min-w-[300px]
        lg:w-80 lg:min-w-[320px]
        bg-card rounded-lg border border-border shadow-sm
        transition-all duration-200
        ${collapsed ? "h-auto" : "h-full"}
        ${getColumnStyle()}
      `}
    >
      {/* 컬럼 헤더 */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border rounded-t-lg bg-muted/40 dark:bg-muted/30">
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={collapsed ? "펼치기" : "접기"}
            >
              {collapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors.bg}`} />
          <h3 className={`font-semibold text-sm ${statusColors.text}`}>{title}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {overdueCount > 0 && (
            <span
              className="flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold"
              title={`지연된 작업 ${overdueCount}개`}
            >
              {overdueCount}
            </span>
          )}
          <span className="bg-muted px-2 py-1 rounded-full text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
          {!collapsed && (
            <button
              onClick={cycleSortOrder}
              title={sortTitle}
              className={`p-1 rounded transition-colors ${
                sortOrder !== "default"
                  ? "text-main-500 dark:text-main-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SortIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Task Cards */}
      {!collapsed && (
        <SortableContext
          items={sortedTasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={`
              p-3 flex flex-col gap-2.5 overflow-y-auto flex-1 transition-all duration-200
              ${isOver ? "min-h-[100px]" : ""}
            `}
          >
            {sortedTasks.length > 0
              ? sortedTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    projectId={projectId}
                    onClick={() => onTaskClick(task)}
                    onTitleUpdate={
                      onTitleUpdate
                        ? (t) => onTitleUpdate(task.id, t)
                        : undefined
                    }
                  />
                ))
              : !isOver && (
                  <EmptyState
                    icon="clipboard"
                    title="작업이 없어요"
                    variant="minimal"
                    className="py-6"
                  />
                )}

            {onAddClick && (
              <button
                onClick={onAddClick}
                className="w-full mt-1 py-1.5 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>작업 추가</span>
              </button>
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
};

export default KanbanColumn;
