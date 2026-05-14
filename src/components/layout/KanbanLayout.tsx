"use client";

import { ReactNode } from "react";

interface KanbanLayoutProps {
  children: ReactNode;
  projectId?: string;
}

export default function KanbanLayout({ children }: KanbanLayoutProps) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      <main className="h-full flex flex-col flex-1 min-w-0">{children}</main>
    </div>
  );
}
