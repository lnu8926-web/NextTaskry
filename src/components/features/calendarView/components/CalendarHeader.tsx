/**
 * 캘린더 헤더 컴포넌트
 *
 * 사용 위치: CalendarView 상단
 * 표시 내용: 프로젝트명 , 기간, 진행률, 뷰 정보, 도움말
 */

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { View } from "react-big-calendar";
import { VIEW_LABELS } from "../constants/calendarConfig";
import { showToast } from "@/lib/utils/toast";

interface CalendarHeaderProps {
  projectName: string;
  currentView: View;
  currentDate: Date;
  eventsCount: number;
  showHelp: boolean;
  showMemo?: boolean;
  showFilter?: boolean;
  projectStartedAt?: string;
  projectEndedAt?: string;
  onToggleHelp: () => void;
  onToggleFilter?: () => void;
  onAddTask?: () => void;
  onProjectInfoClick?: () => void;
  onToggleMemo?: () => void;
}

export default function CalendarHeader({
  projectName,
  projectStartedAt,
  projectEndedAt,
  currentView,
  currentDate,
  eventsCount,
  showMemo,
  showHelp,
  showFilter,
  onToggleMemo,
  onToggleHelp,
  onToggleFilter,
  onAddTask,
  onProjectInfoClick,
}: CalendarHeaderProps) {
  // 뷰별 날짜 포맷
  const getDateFormat = () => {
    switch (currentView) {
      case "month":
        return format(currentDate, "yyyy년 M월", { locale: ko });
      case "week":
        return format(currentDate, "M월 d일 주", { locale: ko });
      case "day":
        return format(currentDate, "M월 d일 (E)", { locale: ko });
      case "agenda":
        return "전체 일정";
      default:
        return "";
    }
  };

  // 뷰 라벨 가져오기 (타입 안전하게)
  const getViewLabel = () => {
    if (currentView in VIEW_LABELS) {
      return VIEW_LABELS[currentView as keyof typeof VIEW_LABELS];
    }
    return currentView;
  };

  /**
   * 프로젝트 기간 정보 계산 (KanbanHeader와 동일한 로직)
   */
  const getProjectPeriodInfo = () => {
    if (!projectStartedAt || !projectEndedAt) return null;

    const startDate = new Date(projectStartedAt);
    const endDate = new Date(projectEndedAt);
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

    // 남은 일수 계산
    const timeDiff = endDate.getTime() - today.getTime();
    const remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // 시작까지 남은 일수
    const timeToStart = startDate.getTime() - today.getTime();
    const daysToStart = Math.ceil(timeToStart / (1000 * 3600 * 24));

    // 프로젝트 상태 판단
    let status: "before" | "active" | "warning" | "ended";
    let badgeText: string;
    let badgeColor: string;

    if (today < startDate) {
      status = "before";
      badgeText = `시작 D-${daysToStart}`;
      badgeColor = "bg-main-500/10 text-main-600 dark:bg-main-400/10 dark:text-main-300";
    } else if (today > endDate) {
      status = "ended";
      badgeText = "종료";
      badgeColor = "bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
    } else if (remainingDays <= 3) {
      status = "warning";
      badgeText = `D-${remainingDays} ⚠️`;
      badgeColor = "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400";
    } else {
      status = "active";
      badgeText = `D-${remainingDays}`;
      badgeColor = "bg-main-500/10 text-main-600 dark:bg-main-400/10 dark:text-main-300";
    }

    return {
      startStr,
      endStr,
      remainingDays,
      status,
      badgeText,
      badgeColor,
    };
  };

  const projectPeriod = getProjectPeriodInfo();

  // 프로젝트 종료 체크 (KanbanHeader와 동일한 로직)
  const handleAddTaskClick = () => {
    if (projectStartedAt && projectEndedAt) {
      const today = new Date().toISOString().split("T")[0];

      if (today < projectStartedAt) {
        showToast("아직 프로젝트가 시작되지 않았습니다.", "warning");
        return;
      }

      if (today > projectEndedAt) {
        showToast("종료된 프로젝트입니다.", "warning");
        return;
      }
    }
    onAddTask?.();
  };

  return (
    <div className="px-4 sm:px-6 py-3 sm:py-4 min-h-[60px] border-b border-border bg-main-500/5 dark:bg-main-400/5">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 제목 + 프로젝트 정보 버튼 + 기간 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              {projectName || "캘린더"}
            </h2>
            {/* 프로젝트 정보 버튼 */}
            {onProjectInfoClick && (
              <button
                onClick={onProjectInfoClick}
                className="p-1 hover:bg-muted/40 rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="프로젝트 정보"
                aria-label="프로젝트 정보"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}
          </div>
          {/* 프로젝트 기간 & 상태 뱃지 (KanbanHeader와 동일) */}
          {projectPeriod && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{projectPeriod.startStr} ~ {projectPeriod.endStr}</span>
              <span
                className={`px-2 py-0.5 rounded-full font-medium text-xs ${projectPeriod.badgeColor}`}
              >
                {projectPeriod.badgeText}
              </span>
            </div>
          )}
          {/* 종료된 프로젝트 안내 문구 */}
          {projectPeriod?.status === "ended" && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              종료된 프로젝트입니다. 일정 추가/수정이 제한됩니다.
            </p>
          )}
        </div>

        {/* 오른쪽: 뷰/일정/도움말 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 현재 뷰 표시 */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="px-2 py-1 bg-main-500/10 rounded-full text-xs text-main-600 dark:text-main-400 font-medium">
              {getViewLabel()}
            </div>
          </div>

          {/* 일정 개수 및 날짜 */}
          <div className="text-sm text-right text-muted-foreground">
            <div className="font-medium text-foreground">{eventsCount}개 일정</div>
            <div className="text-xs">{getDateFormat()}</div>
          </div>

          {/* 새 작업 버튼 */}
          {onAddTask && (
            <button
              onClick={handleAddTaskClick}
              className="flex items-center gap-1 px-3 py-2 bg-main-500 dark:bg-main-400 text-white rounded-[10px] hover:bg-main-600 dark:hover:bg-main-500 transition-colors text-sm font-medium"
              aria-label="새 작업 추가"
            >
              <span className="hidden sm:inline">+ 새 작업</span>
              <span className="sm:hidden">+</span>
            </button>
          )}

          {/* 메모 버튼 */}
          {onToggleMemo && (
            <button
              onClick={onToggleMemo}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/40 ${showMemo ? "bg-muted/40 text-foreground" : ""}`}
              title={showMemo ? "메모 닫기" : "메모 열기"}
              aria-label={showMemo ? "메모 닫기" : "메모 열기"}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {/* 필터 버튼 */}
          {onToggleFilter && (
            <button
              onClick={onToggleFilter}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/40 ${
                showFilter ? "bg-muted/40 text-foreground" : ""
              }`}
              title="필터"
              aria-label="필터"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
                />
              </svg>
            </button>
          )}

          {/* 도움말 버튼 */}
          <button
            onClick={onToggleHelp}
            className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/40"
            title={showHelp ? "도움말 닫기" : "도움말 열기"}
            aria-label={showHelp ? "도움말 닫기" : "도움말 열기"}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${showHelp ? "scale-110" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
