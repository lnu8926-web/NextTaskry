"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Task, TaskStatus } from "@/types/kanban";
import {
  getTaskStatusBarStyle,
  getTaskStatusDotColor,
  getTaskStatusBgColor,
  isTaskOverdue,
  getPriorityIconColor,
} from "@/lib/utils/taskUtils";

interface WeekMultiDayEventsProps {
  tasks: Task[];
  weekDays: Date[];
  onSelectEvent: (task: Task) => void;
}

interface MultiDayTask extends Task {
  startCol: number;
  endCol: number;
  row: number;
}

export default function WeekMultiDayEvents({
  tasks,
  weekDays,
  onSelectEvent,
}: WeekMultiDayEventsProps) {
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [isHoveringArea, setIsHoveringArea] = useState(false);

  const weekDayStrings = useMemo(
    () => weekDays.map((d) => format(d, "yyyy-MM-dd")),
    [weekDays]
  );

  // ── 태스크 분류 ──────────────────────────────────────────────────────────
  // 기간 태스크: 여러 날에 걸친 일정 (시간 지정 여부 무관)
  // 종일 태스크: 단일일이면서 시간 미지정
  const { spanningTasks, singleDayAllDayByDate } = useMemo(() => {
    const weekStart = weekDayStrings[0];
    const weekEnd   = weekDayStrings[6];

    const spanning: Task[]                  = [];
    const byDate: Record<string, Task[]>    = {};
    weekDayStrings.forEach((d) => { byDate[d] = []; });

    tasks.forEach((task) => {
      if (!task.started_at || !task.ended_at) return;

      const taskStart    = task.started_at.split("T")[0];
      const taskEnd      = task.ended_at.split("T")[0];
      const hasTime      = task.use_time && task.start_time;
      const overlapsWeek = taskStart <= weekEnd && taskEnd >= weekStart;

      if (!overlapsWeek) return;

      if (taskStart !== taskEnd) {
        // 다중일 → 기간 바
        spanning.push(task);
      } else if (!hasTime && byDate[taskStart]) {
        // 단일일 + 시간 미지정 → 종일 칩
        byDate[taskStart].push(task);
      }
    });

    return { spanningTasks: spanning, singleDayAllDayByDate: byDate };
  }, [tasks, weekDayStrings]);

  const hasSingleDayAllDay = weekDayStrings.some(
    (d) => singleDayAllDayByDate[d]?.length > 0
  );

  // ── 기간 태스크 배치 계산 ────────────────────────────────────────────────
  const positionedSpanning = useMemo(() => {
    const weekStart = weekDayStrings[0];
    const weekEnd   = weekDayStrings[6];
    const rows: MultiDayTask[][] = [];

    const sorted = [...spanningTasks].sort((a, b) => {
      const aStart = a.started_at!.split("T")[0];
      const bStart = b.started_at!.split("T")[0];
      if (aStart !== bStart) return aStart.localeCompare(bStart);
      return b.ended_at!.split("T")[0].localeCompare(a.ended_at!.split("T")[0]);
    });

    sorted.forEach((task) => {
      const taskStart = task.started_at!.split("T")[0];
      const taskEnd   = task.ended_at!.split("T")[0];

      const clampedStart = taskStart < weekStart ? weekStart : taskStart;
      const clampedEnd   = taskEnd   > weekEnd   ? weekEnd   : taskEnd;

      const startCol = weekDayStrings.indexOf(clampedStart);
      const endCol   = weekDayStrings.indexOf(clampedEnd);
      if (startCol === -1 || endCol === -1) return;

      const entry: MultiDayTask = { ...task, startCol, endCol, row: 0 };

      let rowIndex = 0;
      let placed   = false;
      while (!placed) {
        if (!rows[rowIndex]) rows[rowIndex] = [];
        const hasOverlap = rows[rowIndex].some(
          (t) => !(endCol < t.startCol || startCol > t.endCol)
        );
        if (!hasOverlap) {
          entry.row = rowIndex;
          rows[rowIndex].push(entry);
          placed = true;
        } else {
          rowIndex++;
        }
      }
    });

    return rows.flat();
  }, [spanningTasks, weekDayStrings]);

  const maxRows     = positionedSpanning.length === 0 ? 0 : Math.max(...positionedSpanning.map((t) => t.row)) + 1;
  const ROW_HEIGHT  = 22;
  const MAX_ROWS    = 3;
  const visibleRows = Math.max(Math.min(maxRows, MAX_ROWS), 1);
  const visibleTasks = positionedSpanning.filter((t) => t.row < MAX_ROWS);
  const hiddenCount  = positionedSpanning.length - visibleTasks.length;

  // 둘 다 없으면 렌더링하지 않음
  if (spanningTasks.length === 0 && !hasSingleDayAllDay) return null;

  return (
    <div>
      {/* 기간 섹션 — 다중일 태스크 */}
      {spanningTasks.length > 0 && (
        <div
          className="flex border-b border-gray-200 dark:border-gray-700 overflow-visible relative"
          style={{ height: `${visibleRows * ROW_HEIGHT + 6}px` }}
          onMouseEnter={() => setIsHoveringArea(true)}
          onMouseLeave={() => setIsHoveringArea(false)}
        >
          <div className="w-10 sm:w-16 shrink-0 border-r border-gray-200 dark:border-gray-700 flex items-center justify-end pr-1 sm:pr-2">
            <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
              기간
            </span>
          </div>

          <div className="flex-1 flex relative overflow-hidden">
            {weekDays.map((_, colIndex) => (
              <div
                key={colIndex}
                className="flex-1 border-r border-gray-100 dark:border-gray-800 last:border-r-0"
              />
            ))}

            {visibleTasks.map((task) => {
              const leftPercent  = (task.startCol / 7) * 100;
              const widthPercent = ((task.endCol - task.startCol + 1) / 7) * 100;
              const isHovered    = hoveredTask === task.id;
              const overdue      = isTaskOverdue(task);

              return (
                <div
                  key={task.id}
                  className="absolute cursor-pointer px-0.5"
                  style={{
                    left:   `${leftPercent}%`,
                    width:  `${widthPercent}%`,
                    top:    `${task.row * ROW_HEIGHT + 2}px`,
                    height: "18px",
                  }}
                  onClick={() => onSelectEvent(task)}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <div
                    className={`
                      w-full h-full rounded transition-all flex items-center px-1.5 gap-1
                      ${getTaskStatusBarStyle(task.status as TaskStatus)}
                      ${isHovered ? "ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500 brightness-95" : ""}
                    `}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${getTaskStatusDotColor(task.status as TaskStatus)}`} />
                    {overdue && <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />}
                    {task.priority && (
                      <span className={`text-[9px] shrink-0 ${getPriorityIconColor(task.priority)}`}>▲</span>
                    )}
                    <span className="text-[10px] sm:text-[11px] truncate font-medium">
                      {task.title}
                    </span>
                  </div>
                </div>
              );
            })}

            {hiddenCount > 0 && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 dark:text-gray-500">
                +{hiddenCount}
              </div>
            )}
          </div>

          {/* 기간 태스크 호버 팝업 */}
          {isHoveringArea && spanningTasks.length > 0 && (
            <div className="absolute left-10 sm:left-16 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-[220px] max-w-[280px]">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 pb-1 border-b border-gray-100 dark:border-gray-700">
                기간 일정 ({spanningTasks.length}개)
              </div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {spanningTasks.map((task) => {
                  const overdue = isTaskOverdue(task);
                  return (
                    <div
                      key={task.id}
                      className={`p-2 rounded-md text-xs cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-all ${getTaskStatusBgColor(task.status as TaskStatus)}`}
                      onClick={() => onSelectEvent(task)}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${getTaskStatusDotColor(task.status as TaskStatus)}`} />
                        {overdue && <div className="w-2 h-2 rounded-full shrink-0 bg-red-500" />}
                        <span className="font-medium truncate text-gray-800 dark:text-gray-200">
                          {task.title}
                        </span>
                      </div>
                      {task.started_at && task.ended_at && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 ml-3.5">
                          {task.started_at.split("T")[0]} ~ {task.ended_at.split("T")[0]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 종일 섹션 — 단일일 시간 미지정 태스크 */}
      {hasSingleDayAllDay && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-blue-50/40 dark:bg-blue-900/10">
          <div className="w-10 sm:w-16 shrink-0 border-r border-gray-200 dark:border-gray-700 flex items-center justify-end pr-1 sm:pr-2">
            <span className="text-[9px] sm:text-[10px] font-medium text-blue-500 dark:text-blue-400">
              종일
            </span>
          </div>

          <div className="flex-1 flex">
            {weekDays.map((day, colIndex) => {
              const dateKey    = format(day, "yyyy-MM-dd");
              const dayTasks   = singleDayAllDayByDate[dateKey] || [];
              const visible    = dayTasks.slice(0, 2);
              const hiddenMore = dayTasks.length - visible.length;

              return (
                <div
                  key={colIndex}
                  className="flex-1 border-r border-gray-100 dark:border-gray-800 last:border-r-0 p-1 flex flex-col gap-1 min-h-8"
                >
                  {visible.map((task) => {
                    const overdue = isTaskOverdue(task);
                    return (
                      <div
                        key={task.id}
                        className={`
                          rounded px-1.5 py-1 cursor-pointer flex items-center gap-1
                          hover:brightness-95 transition-all
                          ${getTaskStatusBarStyle(task.status as TaskStatus)}
                        `}
                        onClick={() => onSelectEvent(task)}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getTaskStatusDotColor(task.status as TaskStatus)}`} />
                        {overdue && <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-red-500" />}
                        <span className="text-[9px] sm:text-[10px] font-medium truncate">
                          {task.title}
                        </span>
                      </div>
                    );
                  })}
                  {hiddenMore > 0 && (
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 pl-0.5">
                      +{hiddenMore}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
