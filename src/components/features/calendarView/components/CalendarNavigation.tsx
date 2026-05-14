/**
 * 캘린더 네비게이션 컴포넌트
 *
 * 사용 위치: CalendarView (커스텀 주간 뷰에서 사용)
 * 역할: 이전/다음/오늘 버튼 및 뷰 선택 버튼 제공
 * 참고: react-big-calendar의 기본 툴바 대신 사용
 */

import {
  format,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addDays,
  subDays,
} from "date-fns";
import { ko } from "date-fns/locale";
import { View } from "react-big-calendar";
import { CALENDAR_MESSAGES } from "../constants/calendarConfig";

interface CalendarNavigationProps {
  currentDate: Date;
  currentView: View;
  onNavigate: (date: Date) => void;
  onViewChange: (view: View) => void;
}

// 뷰별 한국어 라벨
const VIEW_LABELS: Record<View, string> = {
  month: "월",
  week: "주",
  day: "일",
  agenda: "일정",
  work_week: "근무주",
};

export default function CalendarNavigation({
  currentDate,
  currentView,
  onNavigate,
  onViewChange,
}: CalendarNavigationProps) {
  // 이전 버튼 핸들러
  const handlePrev = () => {
    switch (currentView) {
      case "month":
        onNavigate(subMonths(currentDate, 1));
        break;
      case "week":
        onNavigate(subWeeks(currentDate, 1));
        break;
      case "day":
        onNavigate(subDays(currentDate, 1));
        break;
      default:
        onNavigate(subWeeks(currentDate, 1));
    }
  };

  // 다음 버튼 핸들러
  const handleNext = () => {
    switch (currentView) {
      case "month":
        onNavigate(addMonths(currentDate, 1));
        break;
      case "week":
        onNavigate(addWeeks(currentDate, 1));
        break;
      case "day":
        onNavigate(addDays(currentDate, 1));
        break;
      default:
        onNavigate(addWeeks(currentDate, 1));
    }
  };

  // 오늘 버튼 핸들러
  const handleToday = () => {
    onNavigate(new Date());
  };

  // 날짜 표시 포맷
  const getDateLabel = () => {
    switch (currentView) {
      case "month":
        return format(currentDate, "yyyy년 M월", { locale: ko });
      case "week":
        return format(currentDate, "yyyy년 M월 d일 주", { locale: ko });
      case "day":
        return format(currentDate, "yyyy년 M월 d일 (E)", { locale: ko });
      case "agenda":
        return "전체 일정";
      default:
        return format(currentDate, "yyyy년 M월", { locale: ko });
    }
  };

  const views: View[] = ["month", "week", "day", "agenda"];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 sm:px-4 py-2 gap-2 border-b border-border bg-muted/40 rounded-t-lg">
      {/* 상단/왼쪽: 네비게이션 버튼 */}
      <div className="flex items-center justify-between sm:justify-start gap-2">
        {/* 이전/다음 버튼 */}
        <div className="flex items-center">
          <button
            onClick={handlePrev}
            className="p-1.5 sm:p-2 text-foreground hover:bg-muted rounded-l-md border border-border bg-card"
            title={CALENDAR_MESSAGES.previous}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={handleToday}
            className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-foreground bg-card border-y border-border hover:bg-muted transition-colors"
          >
            {CALENDAR_MESSAGES.today}
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 sm:p-2 text-foreground hover:bg-muted rounded-r-md border border-border bg-card"
            title={CALENDAR_MESSAGES.next}
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* 현재 날짜 표시 */}
        <span className="text-sm sm:text-lg font-semibold text-foreground sm:ml-2">
          {getDateLabel()}
        </span>
      </div>

      {/* 하단/오른쪽: 뷰 선택 버튼 */}
      <div className="flex items-center gap-0.5 sm:gap-1 bg-card border border-border rounded-md p-0.5 self-center sm:self-auto">
        {views.map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded transition-colors ${
              currentView === view
                ? "bg-main-500 text-white"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {VIEW_LABELS[view]}
          </button>
        ))}
      </div>
    </div>
  );
}
