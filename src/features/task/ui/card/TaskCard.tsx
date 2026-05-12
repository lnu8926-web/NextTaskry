import { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { Task } from "@/types";
import { CSS } from "@dnd-kit/utilities";
import { Check } from "lucide-react";
import PriorityBadge from "@/features/task/ui/fields/PriorityBadge";
import DateInfo from "@/features/task/ui/fields/DateInfo";

interface TaskCardProps {
  task: Task;
  projectId: string;
  onClick?: () => void;
  isOverlay?: boolean;
  onTitleUpdate?: (title: string) => void;
}

const TaskCard = ({
  task,
  projectId: _projectId,
  onClick,
  isOverlay = false,
  onTitleUpdate,
}: TaskCardProps) => {
  const [isNew, setIsNew] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);

  const isOverdue = useMemo(() => {
    if (!task.ended_at || task.status === "done") return false;
    const now = new Date();
    if (task.use_time && task.end_time) {
      const endDateStr = task.ended_at.includes("T")
        ? task.ended_at.split("T")[0]
        : task.ended_at;
      return now > new Date(`${endDateStr}T${task.end_time}`);
    }
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDateStr = task.ended_at.includes("T")
      ? task.ended_at.split("T")[0]
      : task.ended_at;
    const [year, month, day] = endDateStr.split("-").map(Number);
    return new Date(year, month - 1, day) < today;
  }, [task.ended_at, task.end_time, task.use_time, task.status]);

  const isCompleted = task.status === "done";

  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleSave = useCallback(() => {
    const trimmed = editedTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onTitleUpdate?.(trimmed);
    }
    setIsEditingTitle(false);
  }, [editedTitle, task.title, onTitleUpdate]);

  const handleTitleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isOverlay || !onTitleUpdate) return;
      e.stopPropagation();
      setEditedTitle(task.title);
      setIsEditingTitle(true);
    },
    [isOverlay, onTitleUpdate, task.title]
  );

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleTitleSave();
      }
      if (e.key === "Escape") {
        setIsEditingTitle(false);
        setEditedTitle(task.title);
      }
    },
    [handleTitleSave, task.title]
  );

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id: task.id,
      animateLayoutChanges: () => false,
      disabled: isEditingTitle,
    });

  const dragStyle = useMemo(
    () => ({
      transform: transform ? CSS.Transform.toString(transform) : undefined,
      transition: isDragging ? "none" : undefined,
      opacity: isDragging ? 0 : 1,
      zIndex: isDragging ? 999 : isOverlay ? 500 : 1,
    }),
    [transform, isDragging, isOverlay]
  );

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...(!isOverlay ? attributes : {})}
      {...(!isOverlay ? listeners : {})}
      onClick={onClick}
      className={`
        bg-card text-foreground
        p-4 rounded-[10px] border shadow-[0_1px_3px_rgba(0,0,0,0.08)]
        cursor-grab active:cursor-grabbing
        ${
          isCompleted
            ? "border-l-[3px] border-l-emerald-500 border-border opacity-70"
            : isOverdue
            ? "border-l-[3px] border-l-red-500 border-border"
            : "border-border"
        }
        ${!isDragging ? "hover:shadow-md hover:border-main-300 dark:hover:border-main-500" : ""}
        ${isOverlay ? "shadow-2xl scale-[1.02]" : ""}
        ${isNew && !isOverlay ? "animate-slide-in-down" : ""}
        transition-shadow duration-150
      `}
    >
      {/* 제목 행 */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {isCompleted && !isEditingTitle && (
            <div className="shrink-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5">
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            </div>
          )}
          {isEditingTitle ? (
            <textarea
              ref={titleInputRef}
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              onClick={(e) => e.stopPropagation()}
              rows={2}
              className="w-full text-sm font-semibold text-foreground leading-snug bg-muted/50 border border-main-300 rounded px-1.5 py-0.5 resize-none focus:outline-none focus:ring-1 focus:ring-main-500"
            />
          ) : (
            <h3
              onDoubleClick={handleTitleDoubleClick}
              className={`font-semibold text-sm flex-1 line-clamp-2 leading-snug ${
                onTitleUpdate ? "cursor-text" : ""
              } ${
                isCompleted
                  ? "text-muted-foreground line-through"
                  : "text-foreground"
              }`}
            >
              {task.title}
            </h3>
          )}
        </div>
        {task.priority && <PriorityBadge priority={task.priority} />}
      </div>

      {/* 마감일 */}
      {(task.started_at || task.ended_at) && !isOverlay && (
        <div className="mt-2">
          <DateInfo
            startedAt={task.started_at ?? undefined}
            endedAt={task.ended_at ?? undefined}
            startTime={task.start_time || undefined}
            endTime={task.end_time || undefined}
            useTime={task.use_time ?? false}
            status={task.status}
          />
        </div>
      )}

      {/* 서브태스크 진행률 */}
      {Array.isArray(task.subtasks) && task.subtasks.length > 0 && !isOverlay && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-main-500 dark:bg-main-400 rounded-full transition-all"
              style={{
                width: `${Math.round(
                  (task.subtasks.filter((s) => s.completed).length /
                    task.subtasks.length) *
                    100
                )}%`,
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
