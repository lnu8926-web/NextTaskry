import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import CommonPagination from "@/components/ui/CommonPagination";

const meta: Meta<typeof CommonPagination> = {
  title: "UI/CommonPagination",
  component: CommonPagination,
  tags: ["autodocs"],
  argTypes: {
    currentPage: { control: { type: "number", min: 1 } },
    totalPages: { control: { type: "number", min: 1 } },
    pageGroupSize: {
      control: "select",
      options: [false, 3, 5, 10],
      description: "페이지 그룹 크기 (false = 전체 표시)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommonPagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const MiddlePage: Story = {
  name: "중간 페이지",
  args: {
    currentPage: 5,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const LastPage: Story = {
  name: "마지막 페이지",
  args: {
    currentPage: 10,
    totalPages: 10,
    onPageChange: () => {},
  },
};

export const GroupMode: Story = {
  name: "그룹 모드 (5개씩)",
  args: {
    currentPage: 1,
    totalPages: 20,
    pageGroupSize: 5,
    onPageChange: () => {},
  },
};

export const GroupModeSecond: Story = {
  name: "그룹 모드 — 2페이지 그룹",
  args: {
    currentPage: 7,
    totalPages: 20,
    pageGroupSize: 5,
    onPageChange: () => {},
  },
};

export const Interactive: Story = {
  name: "인터랙티브",
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <p className="text-sm font-medium text-muted-foreground">
          현재 페이지:{" "}
          <span className="text-foreground font-bold">{page}</span> / 15
        </p>
        <CommonPagination
          currentPage={page}
          totalPages={15}
          pageGroupSize={5}
          onPageChange={setPage}
        />
      </div>
    );
  },
};
