import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DndContext } from "@dnd-kit/core";
import KanbanHeader from "@/components/features/kanban/components/KanbanHeader";
import KanbanColumn from "@/components/features/kanban/KanbanColumn";
import SidePanel from "@/components/ui/SidePanel";
import Badge from "@/components/ui/Badge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  mockTask,
  mockTaskTodo,
  mockTaskDone,
  mockTaskOverdue,
  mockTaskInProgress2,
} from "../mocks/tasks";
import { Task } from "@/types";

const mockProject = {
  project_id: "project-1",
  project_name: "Taskry 프로젝트 관리",
  started_at: "2026-01-01",
  ended_at: "2026-12-31",
};

const WorkspaceKanbanPage = () => {
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [hasFilter, setHasFilter] = useState(false);

  const todoTasks = [mockTaskTodo, mockTaskOverdue];
  const inProgressTasks = [mockTask, mockTaskInProgress2];
  const doneTasks = [mockTaskDone];

  const filter = (tasks: Task[]) => {
    if (!searchQuery) return tasks;
    return tasks.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <KanbanHeader
        projectName={mockProject.project_name}
        project={mockProject}
        showHelp={showHelp}
        tasksCount={todoTasks.length + inProgressTasks.length + doneTasks.length}
        searchQuery={searchQuery}
        hasActiveFilter={hasFilter}
        onAddClick={() => alert("새 작업 추가")}
        onToggleHelp={() => setShowHelp((v) => !v)}
        onToggleFilter={() => setHasFilter((v) => !v)}
        onSearchChange={setSearchQuery}
      />

      {showHelp && (
        <div className="px-4 sm:px-6 py-3 bg-main-500/5 border-b border-border text-sm text-muted-foreground">
          💡 카드를 드래그해서 상태를 변경하거나, 카드를 클릭해서 상세를 확인하세요.
        </div>
      )}

      <div className="flex-1 overflow-x-auto p-4 pb-6">
        <DndContext>
          <div className="flex gap-4 h-full min-w-max">
            <KanbanColumn
              id="todo"
              title="할 일"
              tasks={filter(todoTasks)}
              projectId="project-1"
              onTaskClick={setSelectedTask}
              onAddClick={() => {}}
            />
            <KanbanColumn
              id="inprogress"
              title="진행 중"
              tasks={filter(inProgressTasks)}
              projectId="project-1"
              onTaskClick={setSelectedTask}
              onAddClick={() => {}}
            />
            <KanbanColumn
              id="done"
              title="완료"
              tasks={filter(doneTasks)}
              projectId="project-1"
              onTaskClick={setSelectedTask}
              collapsible
            />
          </div>
        </DndContext>
      </div>

      <SidePanel isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
        {selectedTask && (
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold text-foreground leading-snug">
                {selectedTask.title}
              </h2>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge type={selectedTask.status === "inprogress" ? "inProgress" : selectedTask.status === "done" ? "done" : "todo"} />
              {selectedTask.priority && <Badge type={selectedTask.priority} />}
            </div>

            {selectedTask.description && (
              <p className="text-sm text-muted-foreground">
                {selectedTask.description}
              </p>
            )}

            {selectedTask.assignee && (
              <div className="flex items-center gap-2">
                <UserAvatar
                  userName={selectedTask.assignee.name}
                  profileImage={selectedTask.assignee.avatar_url}
                  size={28}
                />
                <span className="text-sm text-foreground">
                  {selectedTask.assignee.name}
                </span>
              </div>
            )}

            {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                  서브태스크
                </p>
                <ul className="flex flex-col gap-1">
                  {selectedTask.subtasks.map((s) => (
                    <li
                      key={s.id}
                      className={`text-sm flex items-center gap-2 ${
                        s.completed
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${
                          s.completed
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-muted-foreground"
                        }`}
                      />
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </SidePanel>
    </div>
  );
};

const meta: Meta = {
  title: "Showcase/WorkspaceKanban",
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: "워크스페이스 — 칸반보드",
  render: () => <WorkspaceKanbanPage />,
};
