import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProjectCard from "@/features/project/ui/ProjectCard";
import {
  mockProject,
  mockProjectCompleted,
  mockProjectArchived,
  mockProjectLongText,
} from "../mocks/projects";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const QCWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// meta decorator: 너비 제한 없이 QueryClient만 제공
// 너비 제한은 단일 카드 story에서 각자 적용 (Grid story가 max-w-sm에 갇히는 것을 방지)
const meta: Meta<typeof ProjectCard> = {
  title: "Features/ProjectCard",
  component: ProjectCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <QCWrapper>
        <Story />
      </QCWrapper>
    ),
  ],
  parameters: {
    nextjs: { appDirectory: true },
  },
};

export default meta;
type Story = StoryObj<typeof ProjectCard>;

// 단일 카드 story 공통 너비 wrapper
const singleCardDecorator = (Story: React.ComponentType) => (
  <div className="p-6 w-full max-w-sm min-w-[280px]">
    <Story />
  </div>
);

export const Active: Story = {
  name: "진행중 프로젝트",
  decorators: [singleCardDecorator],
  args: {
    project: mockProject,
    projectMember: { "project-1": 4 },
  },
};

export const Completed: Story = {
  name: "완료된 프로젝트",
  decorators: [singleCardDecorator],
  args: {
    project: mockProjectCompleted,
    projectMember: { "project-2": 6 },
  },
};

export const Archived: Story = {
  name: "보관된 프로젝트",
  decorators: [singleCardDecorator],
  args: {
    project: mockProjectArchived,
    projectMember: {},
  },
};

export const NoDescription: Story = {
  name: "설명 없음",
  decorators: [singleCardDecorator],
  args: {
    project: {
      ...mockProject,
      project_id: "project-nd",
      description: undefined,
    },
    projectMember: { "project-nd": 1 },
  },
};

export const NoDeadline: Story = {
  name: "마감일 없음",
  decorators: [singleCardDecorator],
  args: {
    project: {
      ...mockProject,
      project_id: "project-ndd",
      ended_at: undefined,
    },
    projectMember: { "project-ndd": 2 },
  },
};

export const LongText: Story = {
  name: "긴 텍스트 — 오버플로 테스트",
  decorators: [singleCardDecorator],
  args: {
    project: mockProjectLongText,
    projectMember: { "project-long": 12 },
  },
};

export const NarrowCard: Story = {
  name: "좁은 카드 (280px 최소 너비 확인)",
  decorators: [
    (Story) => (
      <div className="p-4 w-[280px]">
        <Story />
      </div>
    ),
  ],
  args: {
    project: mockProjectLongText,
    projectMember: { "project-long": 12 },
  },
};

