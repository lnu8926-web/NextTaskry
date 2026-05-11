"use client";

import { useProjectBoard } from "@/providers/ProjectBoardProvider";
import { ArrowUpNarrowWide, ArrowDownWideNarrow, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const VIEW_OPTIONS = [
  { value: "all",      label: "전체" },
  { value: "personal", label: "내 프로젝트" },
];

const DATE_OPTIONS = [
  { value: "startedAt", label: "시작일" },
  { value: "endedAt",   label: "마감일" },
  { value: "createdAt", label: "생성일" },
  { value: "updatedAt", label: "수정일" },
];

const DEFAULT_FILTER = { view: "all", date: "startedAt", sort: "asc" };

const pill = (active: boolean) =>
  cn(
    "px-2.5 py-1 rounded-md text-sm transition-colors",
    active
      ? "bg-main-500/10 dark:bg-main-400/10 text-main-600 dark:text-main-300 font-medium"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
  );

const Divider = () => <span className="w-px h-4 bg-border shrink-0" />;

export default function ProjectBoardFilter() {
  const { filter, setFilter } = useProjectBoard();

  const isNonDefault =
    filter.view !== DEFAULT_FILTER.view ||
    filter.date !== DEFAULT_FILTER.date ||
    filter.sort !== DEFAULT_FILTER.sort;

  return (
    <div className="flex items-center gap-1 mb-5 flex-wrap">
      {VIEW_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFilter((f) => ({ ...f, view: opt.value }))}
          className={pill(filter.view === opt.value)}
        >
          {opt.label}
        </button>
      ))}

      <Divider />

      {DATE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setFilter((f) => ({ ...f, date: opt.value }))}
          className={pill(filter.date === opt.value)}
        >
          {opt.label}
        </button>
      ))}

      <Divider />

      <button
        onClick={() => setFilter((f) => ({ ...f, sort: "asc" }))}
        className={pill(filter.sort === "asc")}
        title="오름차순"
      >
        <ArrowUpNarrowWide className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setFilter((f) => ({ ...f, sort: "desc" }))}
        className={pill(filter.sort === "desc")}
        title="내림차순"
      >
        <ArrowDownWideNarrow className="w-3.5 h-3.5" />
      </button>

      {isNonDefault && (
        <>
          <Divider />
          <button
            onClick={() => setFilter(DEFAULT_FILTER)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/40"
          >
            <RotateCcw className="w-3 h-3" />
            초기화
          </button>
        </>
      )}
    </div>
  );
}
