import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader } from "@/components/shared/SectionHeader";

const meta: Meta<typeof SectionHeader> = {
  title: "Shared/SectionHeader",
  component: SectionHeader,
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof SectionHeader>;

export const Default: Story = {
  args: {
    title: "프로젝트 목록",
    description: "진행 중인 프로젝트를 관리합니다.",
  },
};

export const TitleOnly: Story = {
  name: "제목만",
  args: {
    title: "대시보드",
  },
};

export const WithHtml: Story = {
  name: "HTML 포함 설명",
  args: {
    title: "설정",
    description: "계정 정보와 <strong>알림 설정</strong>을 관리합니다.",
  },
};

export const AllVariants: Story = {
  name: "사용 예시",
  render: () => (
    <div className="flex flex-col gap-6 p-6 max-w-xl">
      <SectionHeader title="대시보드" />
      <SectionHeader title="프로젝트 목록" description="진행 중인 모든 프로젝트를 한눈에 확인하세요." />
      <SectionHeader
        title="공지사항"
        description="팀 전체에 공유할 <strong>중요한 공지</strong>를 확인하세요."
      />
    </div>
  ),
};
