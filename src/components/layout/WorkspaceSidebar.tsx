"use client";

import Link from "next/link";

type NavItem = "calendar" | "kanban" | "memo" | "project";

interface WorkspaceSidebarProps {
  projectName?: string;
  currentView: NavItem;
  showMemoPanel: boolean;
  onViewChange: (view: NavItem) => void;
}

const navItems = [
  {
    id: "kanban" as NavItem,
    label: "칸반보드",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    id: "calendar" as NavItem,
    label: "캘린더",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "memo" as NavItem,
    label: "메모",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

export default function WorkspaceSidebar({
  projectName,
  currentView,
  showMemoPanel,
  onViewChange,
}: WorkspaceSidebarProps) {
  const isActive = (id: NavItem) => {
    if (id === "memo") return showMemoPanel;
    return currentView === id && !showMemoPanel;
  };

  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-border bg-card">
      {projectName && (
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">워크스페이스</p>
          <p className="text-sm font-semibold text-foreground truncate mt-0.5">{projectName}</p>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              isActive(item.id)
                ? "bg-main-500/10 text-main-700 dark:text-main-300 font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-2 border-t border-border">
        <Link
          href="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>프로젝트 목록</span>
        </Link>
      </div>
    </aside>
  );
}
