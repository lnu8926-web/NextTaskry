"use client";

import { useState, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KANBAN_COLUMNS } from "@/lib/constants";
import { Task, TaskStatus } from "@/types";
import KanbanColumn from "@/components/features/kanban/KanbanColumn";
import TaskCard from "@/features/task/ui/card/TaskCard";
import Modal from "@/components/ui/Modal";
import TaskDetail from "@/features/task/ui/detail/TaskDetail";
import TaskAdd from "@/features/task/ui/add/TaskAdd";
import KanbanLayout from "@/components/layout/KanbanLayout";
import { showToast } from "@/lib/utils/toast";
import KanbanHeader from "./components/KanbanHeader";
import KanbanHelp from "./components/KanbanHelp";
import KanbanLegend from "./components/KanbanLegend";
import KanbanFilterComponent, {
  KanbanFilterType,
} from "./components/KanbanFilter";
import SidePanel from "@/components/ui/SidePanel";
import { useKanbanKeyboard } from "@/hooks/kanban/useKanbanKeyboard";

interface KanbanBoardProps {
  tasks: Task[];
  boardId: string;
  project?: {
    project_id?: string;
    project_name: string;
    started_at?: string;
    ended_at?: string;
  } | null;
  onCreateTask?: (
    taskData: Omit<Task, "id" | "created_at" | "updated_at">
  ) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask?: (taskId: string) => void;
  onSelectTask?: (task: Task) => void;
  onTaskCreated?: () => void;
  onProjectInfoClick?: () => void;
}

const KanbanBoard = ({
  tasks = [],
  boardId,
  project,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onSelectTask,
  onTaskCreated,
  onProjectInfoClick,
}: KanbanBoardProps) => {
  const projectId = project?.project_id || "";
  const projectName = project?.project_name || "이름 없는 프로젝트";
  const projectStartedAt = project?.started_at;
  const projectEndedAt = project?.ended_at;

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskAddModal, setShowTaskAddModal] = useState(false);
  const [addTaskDefaultStatus, setAddTaskDefaultStatus] = useState<TaskStatus | undefined>(undefined);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<KanbanFilterType>({
    priority: "all",
    assignee: "all",
    date: "all",
  });

  // 키보드 단축키
  useKanbanKeyboard({
    showTaskAddModal,
    showTaskDetailModal: !!selectedTask,
    setShowTaskAddModal,
    setShowTaskDetailModal: (show: boolean) => {
      if (!show) setSelectedTask(null);
    },
    setSelectedTask: () => setSelectedTask(null),
  });

  const { data: session, status } = useSession();

  const isOutsideProjectRange = useCallback(
    (date: Date) => {
      if (!projectStartedAt || !projectEndedAt) return false;

      const dateStr = format(date, "yyyy-MM-dd");
      return dateStr < projectStartedAt || dateStr > projectEndedAt;
    },
    [projectStartedAt, projectEndedAt]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = useMemo(() => {
    if (status === "loading") {
      return [];
    }

    return tasks.filter((task) => {
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (filter.priority !== "all" && task.priority !== filter.priority) {
        return false;
      }

      if (filter.assignee !== "all") {
        if (filter.assignee === "assigned" && !task.assigned_user_id) {
          return false;
        }
        if (filter.assignee === "unassigned" && task.assigned_user_id) {
          return false;
        }
        if (filter.assignee === "me") {
          const currentUserId = session?.user?.user_id;
          const taskUserId = task.assigned_user_id;

          const taskUserIdStr = taskUserId ? String(taskUserId) : null;
          const currentUserIdStr = currentUserId ? String(currentUserId) : null;

          if (!taskUserIdStr || taskUserIdStr !== currentUserIdStr) {
            return false;
          }
        }
      }

      if (filter.date !== "all") {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        if (filter.date === "today") {
          if (!task.ended_at) return false;

          const taskDate = task.ended_at.includes("T")
            ? new Date(task.ended_at)
            : new Date(task.ended_at + "T00:00:00");

          const taskDateOnly = new Date(
            taskDate.getFullYear(),
            taskDate.getMonth(),
            taskDate.getDate()
          );

          if (taskDateOnly.getTime() !== today.getTime()) {
            return false;
          }
        } else if (filter.date === "thisWeek") {
          if (!task.ended_at) return false;

          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          const taskDate = task.ended_at.includes("T")
            ? new Date(task.ended_at)
            : new Date(task.ended_at + "T00:00:00");

          const taskDateOnly = new Date(
            taskDate.getFullYear(),
            taskDate.getMonth(),
            taskDate.getDate()
          );

          if (taskDateOnly < weekStart || taskDateOnly > weekEnd) {
            return false;
          }
        } else if (filter.date === "overdue") {
          if (!task.ended_at || task.status === "done") return false;

          const taskDate = task.ended_at.includes("T")
            ? new Date(task.ended_at)
            : new Date(task.ended_at + "T00:00:00");

          const taskDateOnly = new Date(
            taskDate.getFullYear(),
            taskDate.getMonth(),
            taskDate.getDate()
          );

          if (taskDateOnly >= today) {
            return false;
          }
        }
      }

      return true;
    });
  }, [tasks, filter, session, status, searchQuery]);

  const groupedTasks = KANBAN_COLUMNS.reduce((acc, column) => {
    const columnTasks = filteredTasks.filter(
      (task) => task.status === column.id
    );
    acc[column.id] = columnTasks;
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const taskId = event.active.id as string;
      const task = tasks.find((t) => t.id === taskId);
      setActiveTask(task || null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveTask(null);
        return;
      }

      if (isOutsideProjectRange(new Date())) {
        showToast(
          projectEndedAt &&
            new Date().toISOString().split("T")[0] > projectEndedAt
            ? "종료된 프로젝트입니다."
            : "아직 시작되지 않은 프로젝트입니다.",
          "warning"
        );
        setActiveTask(null);
        return;
      }

      const taskId = active.id as string;
      let newStatus: TaskStatus;

      const isColumn = KANBAN_COLUMNS.some((col) => col.id === over.id);

      if (isColumn) {
        newStatus = over.id as TaskStatus;
      } else {
        const targetTask = tasks.find((t) => t.id === over.id);
        if (!targetTask) {
          setActiveTask(null);
          return;
        }
        newStatus = targetTask.status;
      }

      const task = tasks.find((t) => t.id === taskId);

      if (task && task.status !== newStatus) {
        onUpdateTask?.(task.id, { status: newStatus });
      }

      setActiveTask(null);
    },
    [tasks, onUpdateTask, projectEndedAt, isOutsideProjectRange]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTask(null);
  }, []);

  const handleFilterChange = (key: keyof KanbanFilterType, value: string) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilter({ priority: "all", assignee: "all", date: "all" });
  };

  const handleColumnAddClick = useCallback((status: TaskStatus) => {
    setAddTaskDefaultStatus(status);
    setShowTaskAddModal(true);
  }, []);

  const handleTaskAddSuccess = useCallback(
    (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
      onCreateTask?.(taskData);
      onTaskCreated?.();
      setShowTaskAddModal(false);
      setAddTaskDefaultStatus(undefined);
    },
    [onCreateTask, onTaskCreated]
  );

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    onUpdateTask?.(taskId, updates);
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, ...updates });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    onDeleteTask?.(taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    onSelectTask?.(task);
  };

  return (
    <KanbanLayout projectId={projectId}>
      {/* 전체 컨테이너 - 캘린더와 동일한 구조 */}
      <div className="h-full bg-card rounded-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-border overflow-hidden flex flex-col">
        {/* 칸반 헤더 */}
        <KanbanHeader
          projectName={projectName}
          onAddClick={() => setShowTaskAddModal(true)}
          onToggleFilter={() => setShowFilter(!showFilter)}
          onToggleHelp={() => setShowHelp(!showHelp)}
          showHelp={showHelp}
          hasActiveFilter={
            filter.priority !== "all" ||
            filter.assignee !== "all" ||
            filter.date !== "all"
          }
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          tasksCount={tasks.length}
          project={project}
          onProjectInfoClick={onProjectInfoClick}
        />

        {/* 도움말 */}
        {showHelp && <KanbanHelp />}

        {/* 활성 필터 태그 칩 */}
        <FilterChips filter={filter} onFilterChange={handleFilterChange} onReset={handleFilterReset} />

        {/* 필터 */}
        {showFilter && (
          <div className="px-2 sm:px-4 animate-in slide-in-from-top-2 duration-150">
            <KanbanFilterComponent
              filter={filter}
              onFilterChange={handleFilterChange}
              showFilter={showFilter}
              taskCount={filteredTasks.length}
              totalCount={tasks.length}
              onReset={handleFilterReset}
            />
          </div>
        )}

        {/* 칸반 본체 */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          modifiers={[]}
        >
          <ColumnGrid
            groupedTasks={groupedTasks}
            projectId={projectId}
            onTaskClick={handleTaskClick}
            onColumnAddClick={handleColumnAddClick}
            onTitleUpdate={handleUpdateTask}
            isDragging={!!activeTask}
          />

          <DragOverlay dropAnimation={null}>
            {activeTask && (
              <div className="transform-none opacity-90">
                <TaskCard
                  task={activeTask}
                  projectId={projectId}
                  onClick={() => {}}
                  isOverlay
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* 하단: 통계 + 범례 */}
        <div className="sm:hidden">
          <KanbanLegend tasks={tasks} compact />
        </div>
        <div className="hidden sm:block">
          <KanbanLegend tasks={tasks} />
        </div>
      </div>

      <SidePanel isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
        {selectedTask && (
          <TaskDetail
            task={{
              ...selectedTask,
              project_id: selectedTask.project_id || projectId,
            }}
            projectStartedAt={projectStartedAt}
            projectEndedAt={projectEndedAt}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </SidePanel>

      {showTaskAddModal && (
        <Modal isOpen onClose={() => { setShowTaskAddModal(false); setAddTaskDefaultStatus(undefined); }}>
          <TaskAdd
            boardId={boardId}
            projectId={projectId}
            projectStartedAt={projectStartedAt}
            projectEndedAt={projectEndedAt}
            initialStatus={addTaskDefaultStatus}
            onSuccess={handleTaskAddSuccess}
            onCancel={() => { setShowTaskAddModal(false); setAddTaskDefaultStatus(undefined); }}
          />
        </Modal>
      )}
    </KanbanLayout>
  );
};

function ColumnGrid({
  groupedTasks,
  projectId,
  onTaskClick,
  onColumnAddClick,
  onTitleUpdate,
  isDragging,
}: {
  groupedTasks: Record<TaskStatus, Task[]>;
  projectId: string;
  onTaskClick: (task: Task) => void;
  onColumnAddClick: (status: TaskStatus) => void;
  onTitleUpdate: (taskId: string, updates: Partial<Task>) => void;
  isDragging: boolean;
}) {
  return (
    <div className="flex-1 min-h-0 flex flex-col px-2 sm:px-4 py-2 sm:py-3">
      <div className="h-full flex flex-col rounded-lg border border-border overflow-hidden bg-[#F0F4F5] dark:bg-muted/20">
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <div className="flex gap-4 h-full justify-start sm:justify-center min-w-fit p-4">
            {KANBAN_COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={groupedTasks[column.id] || []}
                projectId={projectId}
                onTaskClick={onTaskClick}
                onAddClick={() => onColumnAddClick(column.id as TaskStatus)}
                onTitleUpdate={(taskId, title) => onTitleUpdate(taskId, { title })}
                isDragging={isDragging}
                collapsible={column.id === "done"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTER_LABELS: Record<string, Record<string, string>> = {
  priority: { high: "높음", normal: "보통", low: "낮음" },
  assignee: { me: "내 작업", assigned: "할당됨", unassigned: "미할당" },
  date:     { today: "오늘", thisWeek: "이번주", overdue: "지연" },
};
const FILTER_NAMES: Record<string, string> = {
  priority: "우선순위",
  assignee: "담당자",
  date: "기간",
};

function FilterChips({
  filter,
  onFilterChange,
  onReset,
}: {
  filter: KanbanFilterType;
  onFilterChange: (key: keyof KanbanFilterType, value: string) => void;
  onReset: () => void;
}) {
  const chips = (Object.keys(filter) as (keyof KanbanFilterType)[]).filter(
    (key) => filter[key] !== "all"
  );

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap px-4 py-1.5 border-b border-border animate-in slide-in-from-top-1 duration-150">
      {chips.map((key) => (
        <span
          key={key}
          className="flex items-center gap-1 px-2 py-0.5 bg-main-500/10 text-main-700 dark:text-main-300 text-xs rounded-full"
        >
          <span className="font-medium">{FILTER_NAMES[key]}:</span>
          <span>{FILTER_LABELS[key]?.[filter[key]] ?? filter[key]}</span>
          <button
            onClick={() => onFilterChange(key, "all")}
            className="ml-0.5 hover:text-main-900 dark:hover:text-main-100 transition-colors"
          >
            ×
          </button>
        </span>
      ))}
      <button
        onClick={onReset}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors ml-1"
      >
        전체 초기화
      </button>
    </div>
  );
}

export default KanbanBoard;
