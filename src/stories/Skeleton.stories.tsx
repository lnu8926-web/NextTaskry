import type { Meta, StoryObj } from "@storybook/react";
import ProjectCardSkeleton from "@/components/ui/ProjectCardSkeleton";
import UserTableSkeleton from "@/components/ui/UserTableSkeleton";

const projectMeta: Meta<typeof ProjectCardSkeleton> = {
  title: "UI/Skeleton/ProjectCard",
  component: ProjectCardSkeleton,
  tags: ["autodocs"],
};

export default projectMeta;
type ProjectStory = StoryObj<typeof ProjectCardSkeleton>;

export const Single: ProjectStory = {
  name: "프로젝트 카드",
  render: () => (
    <div className="w-[320px] p-4">
      <ProjectCardSkeleton />
    </div>
  ),
};

export const Grid: ProjectStory = {
  name: "그리드 목록",
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-4 max-w-[700px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  ),
};

export const UserTable: ProjectStory = {
  name: "유저 테이블",
  render: () => (
    <div className="p-4 max-w-[700px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <UserTableSkeleton key={i} />
      ))}
    </div>
  ),
};
