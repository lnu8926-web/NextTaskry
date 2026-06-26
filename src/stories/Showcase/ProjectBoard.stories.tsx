import type { Meta, StoryObj } from "@storybook/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProjectCard from "@/features/project/ui/ProjectCard";
import { EmptyState } from "@/components/shared/EmptyState";
import Button from "@/components/ui/Button";
import {
  mockProjects,
  mockProjectMemberCounts,
} from "../mocks/projects";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const QCWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

const tabs = ["전체", "진행중", "완료", "보관"] as const;

const ProjectBoardPage = ({ tab = "전체" }: { tab?: string }) => {
  const filtered = mockProjects.filter((p) => {
    if (tab === "전체") return true;
    if (tab === "진행중") return p.status === "active";
    if (tab === "완료") return p.status === "completed";
    if (tab === "보관") return p.status === "archived";
    return true;
  });

  return (
    <QCWrapper>
      <div className="min-h-screen bg-background p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-foreground">프로젝트</h2>
          <Button btnType="basic" icon="plus" variant="primary" size={16}>
            새 프로젝트
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <Button key={t} btnType="tab" isActive={t === tab}>
              {t}
            </Button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
          >
            {filtered.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                projectMember={mockProjectMemberCounts}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <EmptyState
              icon="folder"
              title="프로젝트가 없습니다"
              description="새 프로젝트를 만들어 팀과 협업을 시작해보세요"
              variant="dashed"
              className="max-w-sm w-full"
              action={
                <Button btnType="basic" variant="primary" icon="plus" size={16}>
                  프로젝트 만들기
                </Button>
              }
            />
          </div>
        )}
      </div>
    </QCWrapper>
  );
};

const meta: Meta = {
  title: "Showcase/ProjectBoard",
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
};

export default meta;
type Story = StoryObj;

export const AllProjects: Story = {
  name: "전체 프로젝트",
  render: () => <ProjectBoardPage tab="전체" />,
};

export const ActiveProjects: Story = {
  name: "진행중 프로젝트",
  render: () => <ProjectBoardPage tab="진행중" />,
};

export const CompletedProjects: Story = {
  name: "완료된 프로젝트",
  render: () => <ProjectBoardPage tab="완료" />,
};

export const EmptyBoard: Story = {
  name: "빈 보드",
  render: () => <ProjectBoardPage tab="보관" />,
};
