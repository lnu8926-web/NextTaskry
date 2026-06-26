import type { Meta, StoryObj } from "@storybook/react";
import { DndContext } from "@dnd-kit/core";
import KanbanColumn from "@/components/features/kanban/KanbanColumn";
import {
  mockTask,
  mockTaskTodo,
  mockTasks,
  mockTasksDone,
  mockTaskOverdue,
} from "../mocks/tasks";

const DndWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>{children}</DndContext>
);

const meta: Meta<typeof KanbanColumn> = {
  title: "Features/KanbanColumn",
  component: KanbanColumn,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <DndWrapper>
        <div className="p-4 h-[600px] flex">
          <Story />
        </div>
      </DndWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KanbanColumn>;

export const Todo: Story = {
  name: "할 일 컬럼",
  args: {
    id: "todo",
    title: "할 일",
    tasks: [mockTaskTodo, mockTaskOverdue],
    projectId: "project-1",
    onTaskClick: () => {},
    onAddClick: () => {},
  },
};

export const InProgress: Story = {
  name: "진행중 컬럼",
  args: {
    id: "inprogress",
    title: "진행 중",
    tasks: mockTasks,
    projectId: "project-1",
    onTaskClick: () => {},
    onAddClick: () => {},
  },
};

export const Done: Story = {
  name: "완료 컬럼 (접기 가능)",
  args: {
    id: "done",
    title: "완료",
    tasks: mockTasksDone,
    projectId: "project-1",
    onTaskClick: () => {},
    collapsible: true,
  },
};

export const Empty: Story = {
  name: "빈 컬럼",
  args: {
    id: "todo",
    title: "할 일",
    tasks: [],
    projectId: "project-1",
    onTaskClick: () => {},
    onAddClick: () => {},
  },
};

export const BoardView: Story = {
  name: "전체 보드 레이아웃",
  render: () => (
    <DndWrapper>
      <div className="flex gap-4 p-4 h-[600px] overflow-x-auto">
        <KanbanColumn
          id="todo"
          title="할 일"
          tasks={[mockTaskTodo, mockTaskOverdue]}
          projectId="p1"
          onTaskClick={() => {}}
          onAddClick={() => {}}
        />
        <KanbanColumn
          id="inprogress"
          title="진행 중"
          tasks={[mockTask]}
          projectId="p1"
          onTaskClick={() => {}}
          onAddClick={() => {}}
        />
        <KanbanColumn
          id="done"
          title="완료"
          tasks={mockTasksDone}
          projectId="p1"
          onTaskClick={() => {}}
          collapsible
        />
      </div>
    </DndWrapper>
  ),
};
