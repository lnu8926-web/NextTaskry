import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { TaskCard } from "@/features/task";
import { Task, TaskStatus } from "@/types";
import { EmptyState } from "@/components/shared/EmptyState";
import { getTaskStatusColor, isTaskOverdue } from "@/lib/utils/taskUtils";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  projectId: string;
  onTaskClick: (task: Task) => void;
  isDragging?: boolean; // 현재 드래그 중인지
}

const KanbanColumn = ({
  id,
  title,
  tasks,
  projectId,
  onTaskClick,
  isDragging = false,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  // 다크 모드는 CSS 클래스로 처리하도록 변경
  const statusColors = getTaskStatusColor(id as TaskStatus);

  // 지연된 태스크 개수 (완료 컬럼 제외)
  const overdueCount =
    id !== "done" ? tasks.filter((task) => isTaskOverdue(task)).length : 0;

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
        flex flex-col shrink-0 h-full min-h-0
        w-[calc(100vw-3rem)] min-w-[260px]
        sm:w-80 sm:min-w-[280px]
        md:w-[300px] md:min-w-[300px]
        lg:w-80 lg:min-w-[320px]
        bg-card rounded-lg border border-border shadow-sm
        transition-all duration-200
        ${getColumnStyle()}
      `}
    >
      {/* 컬럼 헤더 */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border rounded-t-lg bg-[#F0F4F5] dark:bg-muted/30">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${statusColors.bg}`}
          />
          <h3
            className={`font-semibold text-sm ${statusColors.text}`}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {/* 지연 태스크 뱃지 - 동그라미에 숫자만 표시 */}
          {overdueCount > 0 && (
            <span
              className="flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold"
              title={`지연된 작업 ${overdueCount}개`}
            >
              {overdueCount}
            </span>
          )}
          {/* 전체 개수 */}
          <span className="bg-muted px-2 py-1 rounded-full text-xs font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Task Cards */}
      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`
            p-3 flex flex-col gap-2.5 overflow-y-auto flex-1 transition-all duration-200
            ${isOver ? "min-h-[100px]" : ""}
          `}
        >
          {tasks.length > 0
            ? tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  onClick={() => onTaskClick(task)}
                />
              ))
            : !isOver && (
                <EmptyState
                  icon="clipboard"
                  title="작업이 없어요"
                  variant="minimal"
                  className="py-10"
                />
              )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
