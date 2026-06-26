import type { Meta, StoryObj } from "@storybook/react";
import {
  EmptyState,
  NoMembersState,
  NoResultsState,
} from "@/components/shared/EmptyState";
import Button from "@/components/ui/Button";

const meta: Meta<typeof EmptyState> = {
  title: "Shared/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "dashed", "minimal"],
      description: "레이아웃 스타일",
    },
    icon: { control: "text", description: "아이콘 타입" },
    iconSize: { control: "number" },
    title: { control: "text" },
    description: { control: "text" },
    info: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "데이터가 없습니다",
    description: "아직 추가된 항목이 없어요",
    variant: "default",
  },
};

export const Dashed: Story = {
  name: "Dashed 스타일",
  args: {
    icon: "plus",
    title: "항목을 추가해보세요",
    description: "버튼을 클릭해서 첫 번째 항목을 만들어보세요",
    variant: "dashed",
  },
};

export const Minimal: Story = {
  name: "Minimal 스타일",
  args: {
    icon: "search",
    title: "검색 결과가 없습니다",
    variant: "minimal",
  },
};

export const WithAction: Story = {
  name: "액션 버튼 포함",
  args: {
    icon: "folder",
    title: "프로젝트가 없어요",
    description: "새 프로젝트를 만들어 팀과 협업을 시작해보세요",
    info: "프로젝트는 팀별로 관리할 수 있습니다",
    variant: "dashed",
    action: (
      <Button btnType="basic" variant="primary" icon="plus" size={16}>
        프로젝트 만들기
      </Button>
    ),
  },
};

export const NoMembers: Story = {
  name: "프리셋 — 팀원 없음",
  render: () => (
    <div className="max-w-sm p-4">
      <NoMembersState />
    </div>
  ),
};

export const NoResults: Story = {
  name: "프리셋 — 검색 결과 없음",
  render: () => (
    <div className="max-w-sm p-4">
      <NoResultsState />
    </div>
  ),
};

export const AllVariants: Story = {
  name: "모든 변형 비교",
  render: () => (
    <div className="flex flex-col gap-4 p-4 max-w-md">
      <EmptyState title="Default 스타일" variant="default" icon="inbox" />
      <EmptyState title="Dashed 스타일" variant="dashed" icon="inbox" />
      <EmptyState title="Minimal 스타일" variant="minimal" icon="inbox" />
    </div>
  ),
};
