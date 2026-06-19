import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Checkbox from "@/components/ui/Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
      description: "체크 상태",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    label: {
      control: "text",
      description: "체크박스 라벨 텍스트",
    },
    size: {
      control: "number",
      description: "아이콘 크기 (px)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {
  args: {
    id: "checkbox-unchecked",
    checked: false,
    label: "할 일",
    onChange: () => {},
  },
};

export const Checked: Story = {
  args: {
    id: "checkbox-checked",
    checked: true,
    label: "완료된 항목",
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    id: "checkbox-disabled",
    checked: false,
    label: "비활성화",
    disabled: true,
    onChange: () => {},
  },
};

export const DisabledChecked: Story = {
  name: "비활성화 + 체크",
  args: {
    id: "checkbox-disabled-checked",
    checked: true,
    label: "변경 불가",
    disabled: true,
    onChange: () => {},
  },
};

export const Interactive: Story = {
  name: "인터랙티브",
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="p-4">
        <Checkbox
          id="checkbox-interactive"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          label={checked ? "완료!" : "클릭해보세요"}
        />
      </div>
    );
  },
};

export const TaskList: Story = {
  name: "태스크 목록",
  render: () => {
    const [tasks, setTasks] = useState([
      { id: "1", label: "디자인 시스템 컴포넌트 설계", checked: true },
      { id: "2", label: "Storybook 스토리 작성", checked: true },
      { id: "3", label: "접근성 테스트", checked: false },
      { id: "4", label: "배포 파이프라인 구성", checked: false },
    ]);

    const toggle = (id: string) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
      );
    };

    return (
      <div className="flex flex-col gap-3 p-4">
        {tasks.map((task) => (
          <Checkbox
            key={task.id}
            id={task.id}
            checked={task.checked}
            label={task.label}
            onChange={() => toggle(task.id)}
          />
        ))}
      </div>
    );
  },
};
