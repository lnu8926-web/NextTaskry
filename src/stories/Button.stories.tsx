import type { Meta, StoryObj } from "@storybook/react";
import Button from "@/components/ui/Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    btnType: {
      control: "select",
      options: ["basic", "nav", "tab", "form", "icon", "form_s"],
      description: "버튼의 레이아웃 타입",
    },
    variant: {
      control: "select",
      options: ["basic", "warning", "success", "new", "list", "white", "primary"],
      description: "버튼의 색상 변형",
    },
    isActive: {
      control: "boolean",
      description: "활성화 상태 (nav, tab 타입에서 사용)",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    children: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: "기본 버튼",
    btnType: "basic",
    variant: "basic",
  },
};

export const Primary: Story = {
  args: {
    children: "확인",
    btnType: "basic",
    variant: "primary",
  },
};

export const Warning: Story = {
  args: {
    children: "삭제",
    btnType: "basic",
    variant: "warning",
  },
};

export const NavInactive: Story = {
  name: "Nav — 비활성",
  args: {
    children: "대시보드",
    btnType: "nav",
    isActive: false,
  },
};

export const NavActive: Story = {
  name: "Nav — 활성",
  args: {
    children: "대시보드",
    btnType: "nav",
    isActive: true,
  },
};

export const TabInactive: Story = {
  name: "Tab — 비활성",
  args: {
    children: "전체",
    btnType: "tab",
    isActive: false,
  },
};

export const TabActive: Story = {
  name: "Tab — 활성",
  args: {
    children: "전체",
    btnType: "tab",
    isActive: true,
  },
};

export const FormButton: Story = {
  name: "폼 버튼",
  args: {
    children: "저장",
    btnType: "form",
  },
};

export const Disabled: Story = {
  args: {
    children: "비활성화",
    btnType: "basic",
    variant: "primary",
    disabled: true,
  },
};

export const AllBasicVariants: Story = {
  name: "Basic — 모든 변형",
  render: () => (
    <div className="flex flex-wrap gap-3 p-4">
      <Button btnType="basic" variant="basic">기본</Button>
      <Button btnType="basic" variant="primary">확인</Button>
      <Button btnType="basic" variant="warning">삭제</Button>
    </div>
  ),
};

export const NavButtons: Story = {
  name: "Nav — 활성/비활성",
  render: () => (
    <div className="flex gap-2 p-4">
      <Button btnType="nav" isActive={false}>대시보드</Button>
      <Button btnType="nav" isActive={true}>칸반보드</Button>
      <Button btnType="nav" isActive={false}>캘린더</Button>
    </div>
  ),
};

export const TabButtons: Story = {
  name: "Tab — 활성/비활성",
  render: () => (
    <div className="flex gap-2 p-4">
      <Button btnType="tab" isActive={true}>전체</Button>
      <Button btnType="tab" isActive={false}>진행중</Button>
      <Button btnType="tab" isActive={false}>완료</Button>
    </div>
  ),
};
