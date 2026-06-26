import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import DropdownToggle from "@/components/ui/Dropdown";

const meta: Meta<typeof DropdownToggle> = {
  title: "UI/Dropdown",
  component: DropdownToggle,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["view", "theme"],
      description: "드롭다운 타입",
    },
    currentValue: {
      control: "text",
      description: "현재 선택된 값",
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 min-h-[200px]">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DropdownToggle>;

export const ViewSelector: Story = {
  name: "뷰 선택",
  args: {
    type: "view",
    currentValue: "board",
    onChange: () => {},
  },
};

export const ThemeSelector: Story = {
  name: "테마 선택",
  args: {
    type: "theme",
    currentValue: "light",
    onChange: () => {},
  },
};

export const InteractiveView: Story = {
  name: "인터랙티브 — 뷰",
  render: () => {
    const [value, setValue] = useState("board");
    return (
      <div className="flex flex-col gap-3 p-8">
        <p className="text-sm text-muted-foreground">
          선택된 뷰: <span className="font-semibold text-foreground">{value}</span>
        </p>
        <DropdownToggle type="view" currentValue={value} onChange={setValue} />
      </div>
    );
  },
};

export const InteractiveTheme: Story = {
  name: "인터랙티브 — 테마",
  render: () => {
    const [value, setValue] = useState("light");
    return (
      <div className="flex flex-col gap-3 p-8">
        <p className="text-sm text-muted-foreground">
          선택된 테마: <span className="font-semibold text-foreground">{value}</span>
        </p>
        <DropdownToggle type="theme" currentValue={value} onChange={setValue} />
      </div>
    );
  },
};
