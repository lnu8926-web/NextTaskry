import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const meta: Meta<typeof Modal> = {
  title: "UI/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const DeleteConfirm: Story = {
  name: "삭제 확인",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button btnType="basic" variant="warning" onClick={() => setOpen(true)}>
          삭제 모달 열기
        </Button>
        <Modal
          type="delete"
          isOpen={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const Success: Story = {
  name: "성공 알림",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button btnType="basic" variant="primary" onClick={() => setOpen(true)}>
          성공 모달 열기
        </Button>
        <Modal
          type="success"
          isOpen={open}
          onClose={() => setOpen(false)}
        />
      </div>
    );
  },
};

export const CustomContent: Story = {
  name: "커스텀 콘텐츠",
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-8">
        <Button btnType="basic" variant="basic" onClick={() => setOpen(true)}>
          커스텀 모달 열기
        </Button>
        <Modal isOpen={open} onClose={() => setOpen(false)}>
          <div className="text-center py-4 w-full">
            <h2 className="text-xl font-bold mb-2">커스텀 모달</h2>
            <p className="text-muted-foreground text-sm mb-6">
              children prop으로 자유롭게 콘텐츠를 구성할 수 있습니다.
            </p>
            <div className="flex gap-3 justify-center">
              <Button btnType="basic" variant="basic" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button btnType="basic" variant="primary" onClick={() => setOpen(false)}>
                확인
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  },
};
