"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { showToast } from "@/lib/utils/toast";
import { Info, SlidersHorizontal, HelpCircle, Plus } from "lucide-react";

interface KanbanHeaderProps {
  projectName: string;
  onAddClick: () => void;
  onToggleFilter: () => void;
  onToggleHelp: () => void;
  showHelp: boolean;
  tasksCount: number;
  project?: {
    project_id?: string;
    project_name: string;
    started_at?: string;
    ended_at?: string;
  } | null;
  onProjectInfoClick?: () => void;
}

export default function KanbanHeader({
  projectName,
  onAddClick,
  onToggleFilter,
  onToggleHelp,
  showHelp,
  tasksCount,
  project,
  onProjectInfoClick,
}: KanbanHeaderProps) {
  const getProjectPeriodInfo = () => {
    if (!project?.started_at || !project?.ended_at) return null;

    const startDate = new Date(project.started_at);
    const endDate = new Date(project.ended_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startStr = startDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const endStr = endDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timeDiff = endDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const timeToStart = startDate.getTime() - today.getTime();
    const daysToStart = Math.ceil(timeToStart / (1000 * 3600 * 24));

    let badgeText: string;
    let badgeClass: string;
    let status: "before" | "active" | "warning" | "ended";

    if (today < startDate) {
      status = "before";
      badgeText = `시작 D-${daysToStart}`;
      badgeClass = "bg-main-500/10 text-main-600 dark:bg-main-400/10 dark:text-main-300";
    } else if (today > endDate) {
      status = "ended";
      badgeText = "종료";
      badgeClass = "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
    } else if (remainingDays <= 3) {
      status = "warning";
      badgeText = `D-${remainingDays} ⚠️`;
      badgeClass = "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400";
    } else {
      status = "active";
      badgeText = `D-${remainingDays}`;
      badgeClass = "bg-main-500/10 text-main-600 dark:bg-main-400/10 dark:text-main-300";
    }

    return { startStr, endStr, remainingDays, status, badgeText, badgeClass };
  };

  const projectPeriod = getProjectPeriodInfo();

  const handleAddClick = () => {
    if (project?.ended_at) {
      const today = new Date().toISOString().split("T")[0];
      if (today < project.started_at!) {
        showToast("아직 프로젝트가 시작되지 않았습니다.", "warning");
        return;
      }
      if (today > project.ended_at) {
        showToast("종료된 프로젝트입니다.", "warning");
        return;
      }
    }
    onAddClick();
  };

  const iconBtn = "p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors";

  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4 min-h-[60px] border-b border-border bg-main-500/5 dark:bg-main-400/5">
      <div className="flex items-center justify-between gap-4">
        {/* 왼쪽: 프로젝트명 + 기간 */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground truncate">
              {projectName}
            </h2>
            <button onClick={onProjectInfoClick} className={iconBtn} title="프로젝트 정보">
              <Info className="w-4 h-4" />
            </button>
          </div>
          {projectPeriod && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{projectPeriod.startStr} ~ {projectPeriod.endStr}</span>
              <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${projectPeriod.badgeClass}`}>
                {projectPeriod.badgeText}
              </span>
            </div>
          )}
          {projectPeriod?.status === "ended" && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              종료된 프로젝트입니다. 일정 추가/수정이 제한됩니다.
            </p>
          )}
        </div>

        {/* 오른쪽: 날짜 + 작업 수 + 버튼 */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block text-right text-xs text-muted-foreground">
            <div className="font-medium text-foreground">{tasksCount}개 작업</div>
            <div>{format(new Date(), "M월 d일 (E)", { locale: ko })}</div>
          </div>

          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 px-3 py-2 bg-main-500 dark:bg-main-400 text-white rounded-[10px] hover:bg-main-600 dark:hover:bg-main-500 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">새 작업</span>
          </button>

          <button onClick={onToggleFilter} className={iconBtn} title="필터">
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button onClick={onToggleHelp} className={iconBtn} title={showHelp ? "도움말 닫기" : "도움말 열기"}>
            <HelpCircle className={`w-4 h-4 transition-colors ${showHelp ? "text-main-500 dark:text-main-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
