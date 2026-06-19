import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import SidePanel from "@/components/ui/SidePanel";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const meta: Meta<typeof SidePanel> = {
  title: "UI/SidePanel",
  component: SidePanel,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof SidePanel>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8 min-h-screen bg-muted/30">
        <Button btnType="basic" variant="primary" onClick={() => setOpen(true)}>
          패널 열기
        </Button>
        <SidePanel isOpen={open} onClose={() => setOpen(false)}>
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold">태스크 상세</h2>
            <div className="flex gap-2">
              <Badge type="inProgress" />
              <Badge type="normal" />
            </div>
            <p className="text-sm text-muted-foreground">
              SidePanel은 태스크 상세, 설정 등 보조 콘텐츠를 오른쪽에서
              슬라이드로 표시합니다. ESC 키 또는 배경 클릭으로 닫을 수
              있습니다.
            </p>
          </div>
        </SidePanel>
      </div>
    );
  },
};
