"use client";

import { useProjectBoard } from "@/providers/ProjectBoardProvider";
import { ArrowUpNarrowWide, ArrowDownWideNarrow, X } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const VIEW_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "personal", label: "내 프로젝트" },
];

const DATE_OPTIONS = [
  { value: "startedAt", label: "시작일" },
  { value: "endedAt", label: "마감일" },
  { value: "createdAt", label: "생성일" },
  { value: "updatedAt", label: "수정일" },
];

const DEFAULT_FILTER = { view: "all", date: "startedAt", sort: "asc" };

function PillGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border border-border">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            value === opt.value
              ? "bg-main-500 dark:bg-main-400 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function ProjectBoardFilter() {
  const { filter, setFilter } = useProjectBoard();

  const isNonDefault =
    filter.view !== DEFAULT_FILTER.view ||
    filter.date !== DEFAULT_FILTER.date ||
    filter.sort !== DEFAULT_FILTER.sort;

  const handleReset = () => setFilter(DEFAULT_FILTER);

  return (
    <div className="flex items-center gap-3 mb-5 flex-wrap">
      <PillGroup
        options={VIEW_OPTIONS}
        value={filter.view}
        onChange={(v) => setFilter((f) => ({ ...f, view: v }))}
      />

      <div className="w-px h-5 bg-border" />

      <PillGroup
        options={DATE_OPTIONS}
        value={filter.date}
        onChange={(v) => setFilter((f) => ({ ...f, date: v }))}
      />

      <div className="w-px h-5 bg-border" />

      <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border border-border">
        <button
          onClick={() => setFilter((f) => ({ ...f, sort: "asc" }))}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            filter.sort === "asc"
              ? "bg-main-500 dark:bg-main-400 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <ArrowUpNarrowWide className="w-3.5 h-3.5" />
          오름차순
        </button>
        <button
          onClick={() => setFilter((f) => ({ ...f, sort: "desc" }))}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
            filter.sort === "desc"
              ? "bg-main-500 dark:bg-main-400 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <ArrowDownWideNarrow className="w-3.5 h-3.5" />
          내림차순
        </button>
      </div>

      {isNonDefault && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/50 transition-all"
        >
          <X className="w-3.5 h-3.5" />
          초기화
        </button>
      )}
    </div>
  );
}
