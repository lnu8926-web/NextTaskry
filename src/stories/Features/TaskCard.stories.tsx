import type { Meta, StoryObj } from "@storybook/react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import TaskCard from "@/features/task/ui/card/TaskCard";
import {
  mockTask,
  mockTaskTodo,
  mockTaskDone,
  mockTaskOverdue,
  mockAllTasks,
} from "../mocks/tasks";

const ALL_IDS = mockAllTasks.map((t) => t.id);

const DndWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndContext>
    <SortableContext items={ALL_IDS}>{children}</SortableContext>
  </DndContext>
);

const meta: Meta<typeof TaskCard> = {
  title: "Features/TaskCard",
  component: TaskCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <DndWrapper>
        <div className="w-72 p-4">
          <Story />
        </div>
      </DndWrapper>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

export const InProgress: Story = {
  name: "진행중 — 서브태스크 + 담당자",
  args: {
    task: mockTask,
    projectId: "project-1",
  },
};

export const Todo: Story = {
  name: "할 일 — 마감일 있음",
  args: {
    task: mockTaskTodo,
    projectId: "project-1",
  },
};

export const Done: Story = {
  name: "완료",
  args: {
    task: mockTaskDone,
    projectId: "project-1",
  },
};

export const Overdue: Story = {
  name: "기한 초과",
  args: {
    task: mockTaskOverdue,
    projectId: "project-1",
  },
};

export const WithoutDates: Story = {
  name: "날짜 없음",
  args: {
    task: {
      ...mockTask,
      started_at: null,
      ended_at: null,
      subtasks: [],
      assignee: null,
      memo: null,
    },
    projectId: "project-1",
  },
};

export const AllVariants: Story = {
  name: "모든 상태 비교",
  render: () => (
    <DndWrapper>
      <div className="flex flex-col gap-3 w-72 p-4">
        <TaskCard task={mockTask} projectId="p1" />
        <TaskCard task={mockTaskTodo} projectId="p1" />
        <TaskCard task={mockTaskDone} projectId="p1" />
        <TaskCard task={mockTaskOverdue} projectId="p1" />
      </div>
    </DndWrapper>
  ),
};
