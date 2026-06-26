import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import KanbanHeader from "@/components/features/kanban/components/KanbanHeader";

const mockProject = {
  project_id: "project-1",
  project_name: "Taskry 프로젝트 관리",
  started_at: "2026-01-01",
  ended_at: "2026-12-31",
};

const urgentProject = {
  project_id: "project-urgent",
  project_name: "긴급 출시 프로젝트",
  started_at: "2026-06-01",
  ended_at: "2026-06-26",
};

const meta: Meta<typeof KanbanHeader> = {
  title: "Features/KanbanHeader",
  component: KanbanHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof KanbanHeader>;

export const Default: Story = {
  args: {
    projectName: "Taskry 프로젝트 관리",
    project: mockProject,
    showHelp: false,
    tasksCount: 12,
    hasActiveFilter: false,
    onAddClick: () => {},
    onToggleHelp: () => {},
    onToggleFilter: () => {},
  },
};

export const WithActiveFilter: Story = {
  name: "필터 활성화",
  args: {
    projectName: "Taskry 프로젝트 관리",
    project: mockProject,
    showHelp: false,
    tasksCount: 3,
    hasActiveFilter: true,
    onAddClick: () => {},
    onToggleHelp: () => {},
    onToggleFilter: () => {},
  },
};

export const DdayWarning: Story = {
  name: "마감 임박 (D-1)",
  args: {
    projectName: urgentProject.project_name,
    project: urgentProject,
    showHelp: false,
    tasksCount: 5,
    onAddClick: () => {},
    onToggleHelp: () => {},
    onToggleFilter: () => {},
  },
};

export const WithSearch: Story = {
  name: "인터랙티브 — 검색",
  render: () => {
    const [showHelp, setShowHelp] = useState(false);
    const [query, setQuery] = useState("");
    return (
      <KanbanHeader
        projectName="Taskry 프로젝트 관리"
        project={mockProject}
        showHelp={showHelp}
        tasksCount={12}
        searchQuery={query}
        hasActiveFilter={false}
        onAddClick={() => {}}
        onToggleHelp={() => setShowHelp((v) => !v)}
        onToggleFilter={() => {}}
        onSearchChange={setQuery}
      />
    );
  },
};

export const HelpOpen: Story = {
  name: "도움말 열림",
  args: {
    projectName: "Taskry 프로젝트 관리",
    project: mockProject,
    showHelp: true,
    tasksCount: 12,
    onAddClick: () => {},
    onToggleHelp: () => {},
    onToggleFilter: () => {},
  },
};

export const Interactive: Story = {
  name: "인터랙티브 — 전체",
  render: () => {
    const [showHelp, setShowHelp] = useState(false);
    const [showMemo, setShowMemo] = useState(false);
    const [query, setQuery] = useState("");
    return (
      <div className="flex flex-col gap-2">
        <KanbanHeader
          projectName="Taskry 프로젝트 관리"
          project={mockProject}
          showHelp={showHelp}
          showMemo={showMemo}
          tasksCount={12}
          searchQuery={query}
          hasActiveFilter={false}
          onAddClick={() => alert("새 작업 추가!")}
          onToggleHelp={() => setShowHelp((v) => !v)}
          onToggleMemo={() => setShowMemo((v) => !v)}
          onToggleFilter={() => {}}
          onSearchChange={setQuery}
        />
        <div className="p-4 text-sm text-muted-foreground flex gap-4">
          <span>도움말: {showHelp ? "열림" : "닫힘"}</span>
          <span>메모: {showMemo ? "열림" : "닫힘"}</span>
          {query && <span>검색어: "{query}"</span>}
        </div>
      </div>
    );
  },
};
