import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import WorkspaceFilter, {
  WorkspaceFilterType,
} from "@/components/shared/WorkspaceFilter";

const defaultFilter: WorkspaceFilterType = {
  priority: "all",
  assignee: "all",
  date: "all",
};

const meta: Meta<typeof WorkspaceFilter> = {
  title: "Shared/WorkspaceFilter",
  component: WorkspaceFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof WorkspaceFilter>;

export const Default: Story = {
  render: () => {
    const [filter, setFilter] = useState<WorkspaceFilterType>(defaultFilter);
    return (
      <div className="p-4 max-w-2xl">
        <WorkspaceFilter
          filter={filter}
          onFilterChange={(updates) =>
            setFilter((prev) => ({ ...prev, ...updates }))
          }
          taskCount={8}
          totalCount={12}
          onReset={() => setFilter(defaultFilter)}
        />
      </div>
    );
  },
};

export const ActiveFilter: Story = {
  name: "필터 활성화 상태",
  render: () => {
    const [filter, setFilter] = useState<WorkspaceFilterType>({
      priority: "high",
      assignee: "me",
      date: "today",
    });
    return (
      <div className="p-4 max-w-2xl">
        <WorkspaceFilter
          filter={filter}
          onFilterChange={(updates) =>
            setFilter((prev) => ({ ...prev, ...updates }))
          }
          taskCount={2}
          totalCount={12}
          onReset={() => setFilter(defaultFilter)}
        />
      </div>
    );
  },
};

export const PriorityOnly: Story = {
  name: "우선순위 필터",
  render: () => {
    const [filter, setFilter] = useState<WorkspaceFilterType>({
      priority: "high",
      assignee: "all",
      date: "all",
    });
    return (
      <div className="p-4 max-w-2xl">
        <WorkspaceFilter
          filter={filter}
          onFilterChange={(updates) =>
            setFilter((prev) => ({ ...prev, ...updates }))
          }
          taskCount={3}
          totalCount={12}
          onReset={() => setFilter(defaultFilter)}
        />
      </div>
    );
  },
};
