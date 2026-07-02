"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { format, isSameDay } from "date-fns";
import { Task, TaskStatus } from "@/types/kanban";
import {
  getTaskStatusBarStyle,
  getTaskStatusDotColor,
  isTaskOverdue,
} from "@/lib/utils/taskUtils";

interface WeekGridProps {
  weekDays: Date[];
  hours: number[];
  tasksByDate: Record<string, Task[]>;
  isOutsideProjectRange: (date: Date) => boolean;
  onSelectSlot: (
    startDate: Date,
    endDate: Date,
    startHour?: number,
    endHour?: number
  ) => void;
  onSelectEvent: (task: Task) => void;
}

const getPriorityIcon = (priority: string | undefined) => {
  switch (priority) {
    case "high":   return <span className="text-red-500">▲</span>;
    case "normal": return <span className="text-yellow-500">▲</span>;
    case "low":    return <span className="text-green-500">▲</span>;
    default:       return null;
  }
};

const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

interface PositionedTask extends Task {
  top: number;
  height: number;
  column: number;
  totalColumns: number;
}

/**
 * 단일일 시간 지정 태스크만 위치 계산
 * 다중일 태스크는 WeekMultiDayEvents에서 처리하므로 제외
 */
const getPositionedTasksForDay = (
  tasks: Task[],
  hours: number[]
): PositionedTask[] => {
  const minHour = hours[0];
  const maxHour = hours[hours.length - 1] + 1;
  const totalMinutes = (maxHour - minHour) * 60;

  const timedTasks = tasks.filter((task) => {
    if (!task.use_time || !task.start_time) return false;
    if (!task.started_at || !task.ended_at) return true;
    return task.started_at.split("T")[0] === task.ended_at.split("T")[0];
  });

  const positioned: PositionedTask[] = timedTasks.map((task) => {
    const startMin = timeToMinutes(task.start_time!);
    const endMin   = task.end_time ? timeToMinutes(task.end_time) : startMin + 60;
    const cStart   = Math.max(startMin, minHour * 60);
    const cEnd     = Math.min(endMin, maxHour * 60);
    const top      = ((cStart - minHour * 60) / totalMinutes) * 100;
    const height   = Math.max(((cEnd - cStart) / totalMinutes) * 100, 1.5);
    return { ...task, top, height, column: 0, totalColumns: 1 };
  });

  // 겹침 탐지 및 컬럼 할당
  const isOverlapping = (a: PositionedTask, b: PositionedTask) =>
    a.top < b.top + b.height && a.top + a.height > b.top;

  const processed = new Set<string>();

  for (const task of positioned) {
    if (processed.has(task.id)) continue;

    const group: PositionedTask[] = [task];
    let added = true;
    while (added) {
      added = false;
      for (const t of positioned) {
        if (!group.includes(t) && group.some((g) => isOverlapping(g, t))) {
          group.push(t);
          added = true;
        }
      }
    }

    const sortedGroup = group.sort(
      (a, b) => a.top - b.top || a.id.localeCompare(b.id)
    );
    const columns: PositionedTask[][] = [];

    for (const t of sortedGroup) {
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        if (!isOverlapping(columns[col][columns[col].length - 1], t)) {
          columns[col].push(t);
          t.column = col;
          placed = true;
          break;
        }
      }
      if (!placed) {
        t.column = columns.length;
        columns.push([t]);
      }
    }

    const totalCols = columns.length;
    for (const t of sortedGroup) {
      t.totalColumns = totalCols;
      processed.add(t.id);
    }
  }

  return positioned;
};

interface DragState {
  isDragging: boolean;
  startDay: Date | null;
  startHour: number | null;
  endDay: Date | null;
  endHour: number | null;
}

export default function WeekGrid({
  weekDays,
  hours,
  tasksByDate,
  isOutsideProjectRange,
  onSelectSlot,
  onSelectEvent,
}: WeekGridProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startDay: null,
    startHour: null,
    endDay: null,
    endHour: null,
  });
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // 날짜별 시간 지정 이벤트 위치 계산
  const positionedTasksByDay = useMemo(
    () =>
      weekDays.map((day) => {
        const dateKey = format(day, "yyyy-MM-dd");
        return getPositionedTasksForDay(tasksByDate[dateKey] || [], hours);
      }),
    [weekDays, tasksByDate, hours]
  );

  // 현재 시간선 위치 (셀 내 %)
  const getCurrentTimePosition = (hour: number) => {
    if (currentTime.getHours() !== hour) return null;
    return (currentTime.getMinutes() / 60) * 100;
  };

  const isToday      = (day: Date) => isSameDay(day, currentTime);
  const isWorkingHour = (hour: number) => hour >= 9 && hour < 18;

  const handleMouseDown = useCallback(
    (day: Date, hour: number, isOutside: boolean) => {
      if (isOutside) return;
      isMouseDownRef.current = true;
      setDragState({
        isDragging: true,
        startDay: day,
        startHour: hour,
        endDay: day,
        endHour: hour,
      });
    },
    []
  );

  const handleMouseEnter = useCallback(
    (day: Date, hour: number, isOutside: boolean) => {
      if (!isMouseDownRef.current || isOutside) return;
      setDragState((prev) => ({ ...prev, endDay: day, endHour: hour }));
    },
    []
  );

  const handleMouseUp = useCallback(() => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;

    if (
      dragState.startDay &&
      dragState.startHour !== null &&
      dragState.endDay &&
      dragState.endHour !== null
    ) {
      let startDay  = dragState.startDay;
      let endDay    = dragState.endDay;
      let startHour = dragState.startHour;
      let endHour   = dragState.endHour + 1;

      if (format(startDay, "yyyy-MM-dd") > format(endDay, "yyyy-MM-dd")) {
        [startDay, endDay]     = [endDay, startDay];
        [startHour, endHour]   = [dragState.endHour, dragState.startHour + 1];
      } else if (
        format(startDay, "yyyy-MM-dd") === format(endDay, "yyyy-MM-dd") &&
        startHour > dragState.endHour
      ) {
        startHour = dragState.endHour;
        endHour   = dragState.startHour + 1;
      }

      onSelectSlot(startDay, endDay, startHour, endHour);
    }

    setDragState({
      isDragging: false,
      startDay: null,
      startHour: null,
      endDay: null,
      endHour: null,
    });
  }, [dragState, onSelectSlot]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDownRef.current) handleMouseUp();
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [handleMouseUp]);

  const isInDragRange = useCallback(
    (day: Date, hour: number) => {
      if (
        !dragState.isDragging ||
        !dragState.startDay ||
        dragState.startHour === null ||
        !dragState.endDay ||
        dragState.endHour === null
      ) return false;

      const dayStr      = format(day, "yyyy-MM-dd");
      const startDayStr = format(dragState.startDay, "yyyy-MM-dd");
      const endDayStr   = format(dragState.endDay, "yyyy-MM-dd");
      const [minDayStr, maxDayStr] =
        startDayStr <= endDayStr
          ? [startDayStr, endDayStr]
          : [endDayStr, startDayStr];
      const [minHour, maxHour] =
        dragState.startHour <= dragState.endHour
          ? [dragState.startHour, dragState.endHour]
          : [dragState.endHour, dragState.startHour];

      if (dayStr >= minDayStr && dayStr <= maxDayStr) {
        return hour >= minHour && hour <= maxHour;
      }
      return false;
    },
    [dragState]
  );

  return (
    <div className="select-none relative">
      {/* 시간대 그리드 (배경 + 드래그 인터랙션) */}
      {hours.map((hour) => (
        <div
          key={hour}
          className="flex border-b border-gray-100 dark:border-gray-800 last:border-b-0 h-[60px]"
        >
          {/* 시간 레이블 */}
          <div className="w-10 sm:w-16 shrink-0 p-1 sm:p-2 text-right pr-1 sm:pr-3 border-r border-gray-200 dark:border-gray-700">
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {hour.toString().padStart(2, "0")}:00
            </span>
          </div>

          {weekDays.map((day) => {
            const dateKey  = format(day, "yyyy-MM-dd");
            const isOutside = isOutsideProjectRange(day);
            const isSelected = isInDragRange(day, hour);
            const timePos  = getCurrentTimePosition(hour);

            return (
              <div
                key={`${dateKey}-${hour}`}
                className={`
                  flex-1 relative border-r border-gray-100 dark:border-gray-800 last:border-r-0
                  transition-colors cursor-pointer
                  ${
                    isOutside
                      ? "bg-gray-100 dark:bg-gray-900 cursor-not-allowed"
                      : isSelected
                      ? "bg-main-200 dark:bg-main-700/50"
                      : isWorkingHour(hour)
                      ? "bg-main-100/20 dark:bg-main-800/15 hover:bg-main-100/40 dark:hover:bg-main-800/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }
                `}
                onMouseDown={() => handleMouseDown(day, hour, isOutside)}
                onMouseEnter={() => handleMouseEnter(day, hour, isOutside)}
                onMouseUp={handleMouseUp}
              >
                {/* 30분 구분선 */}
                <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-200 dark:border-gray-700 pointer-events-none" />

                {/* 현재 시간 표시선 */}
                {isToday(day) && timePos !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${timePos}%` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-main-500 rounded-full -ml-1" />
                      <div className="flex-1 border-t-2 border-main-500" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* 시간 지정 이벤트 오버레이 — 지속 시간 기반 절대 배치 */}
      <div className="absolute inset-0 pointer-events-none flex">
        {/* 시간 레이블 공백 */}
        <div className="w-10 sm:w-16 shrink-0" />

        {/* 요일별 이벤트 컬럼 */}
        {weekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="flex-1 relative">
            {positionedTasksByDay[dayIndex].map((task) => {
              const overdue  = isTaskOverdue(task);
              const colWidth = 100 / task.totalColumns;

              return (
                <div
                  key={task.id}
                  className={`
                    absolute rounded border cursor-pointer pointer-events-auto
                    hover:shadow-md hover:brightness-95 transition-all duration-150
                    ${getTaskStatusBarStyle(task.status as TaskStatus)}
                  `}
                  style={{
                    top:       `${task.top}%`,
                    height:    `${task.height}%`,
                    left:      `${task.column * colWidth}%`,
                    width:     `calc(${colWidth}% - 3px)`,
                    minHeight: "20px",
                    zIndex:    10,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEvent(task);
                  }}
                >
                  <div className="p-1 h-full flex flex-col overflow-hidden">
                    <div className="flex items-center gap-0.5">
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${getTaskStatusDotColor(
                          task.status as TaskStatus
                        )}`}
                      />
                      {overdue && (
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500" />
                      )}
                      {task.priority && (
                        <span className="text-[8px] shrink-0">
                          {getPriorityIcon(task.priority)}
                        </span>
                      )}
                      <span className="text-[9px] sm:text-[10px] font-medium truncate flex-1">
                        {task.title}
                      </span>
                    </div>
                    {task.height > 8 && (
                      <div className="text-[8px] sm:text-[9px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {task.start_time}
                        {task.end_time ? `–${task.end_time}` : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
