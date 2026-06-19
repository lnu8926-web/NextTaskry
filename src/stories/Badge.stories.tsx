import type { Meta, StoryObj } from "@storybook/react";
import Badge, { badgeConfigs } from "@/components/ui/Badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: Object.keys(badgeConfigs),
      description: "뱃지 타입",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const DueSoon: Story = { args: { type: "dueSoon" } };
export const OverDue: Story = { args: { type: "overDue" } };
export const Todo: Story = { args: { type: "todo" } };
export const InProgress: Story = { args: { type: "inProgress" } };
export const Done: Story = { args: { type: "done" } };
export const PriorityHigh: Story = { name: "우선순위 — 높음", args: { type: "high" } };
export const PriorityNormal: Story = { name: "우선순위 — 보통", args: { type: "normal" } };
export const PriorityLow: Story = { name: "우선순위 — 낮음", args: { type: "low" } };

export const AllStatus: Story = {
  name: "상태 — 전체",
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      <Badge type="todo" />
      <Badge type="inProgress" />
      <Badge type="done" />
      <Badge type="dueSoon" />
      <Badge type="overDue" />
    </div>
  ),
};

export const AllPriority: Story = {
  name: "우선순위 — 전체",
  render: () => (
    <div className="flex flex-wrap gap-2 p-4">
      <Badge type="high" />
      <Badge type="normal" />
      <Badge type="low" />
    </div>
  ),
};
