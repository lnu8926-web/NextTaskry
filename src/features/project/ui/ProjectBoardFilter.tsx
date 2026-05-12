"use client";

import { useProjectBoard } from "@/providers/ProjectBoardProvider";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const VIEW_OPTIONS = [
  { value: "all",      label: "전체 프로젝트" },
  { value: "personal", label: "내 프로젝트" },
];

export default function ProjectBoardFilter() {
  const { filter, setFilter } = useProjectBoard();

  const sortLabel = filter.sort === "desc" ? "최근 순" : "오래된 순";

  return (
    <div className="flex items-center justify-between border-b border-border mb-6">
      <div className="flex items-center gap-6">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter((f) => ({ ...f, view: opt.value }))}
            className={cn(
              "pb-2.5 text-base font-medium transition-colors border-b-2 -mb-px",
              filter.view === opt.value
                ? "border-main-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setFilter((f) => ({ ...f, sort: f.sort === "desc" ? "asc" : "desc" }))}
        className="flex items-center gap-1 pb-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {sortLabel}
        <ChevronDown className={cn("w-4 h-4 transition-transform", filter.sort === "asc" && "rotate-180")} />
      </button>
    </div>
  );
}
