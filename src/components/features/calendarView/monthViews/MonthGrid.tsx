"use client";

import { useState, useCallback, useMemo } from "react";
import {
  format,
  isSameDay,
  parseISO,
  startOfDay,
  endOfDay,
  differenceInDays,
  addDays,
  isBefore,
  isAfter,
} from "date-fns";
import { Task } from "@/types/kanban";
import { getTaskCalendarBarStyle, isTaskOverdue } from "@/lib/utils/taskUtils";

interface MonthGridProps {
  weeks: Date[][];
  tasks: Task[];
  isOutsideProjectRange: (date: Date) => boolean;
  isCurrentMonth: (date: Date) => boolean;
  onSelectSlot: (date: Date) => void;
  onSelectRange?: (startDate: Date, endDate: Date) => void;
  onSelectEvent: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

type EventBar = {
  task: Task;
  startCol: number;
  span: number;
  isStart: boolean;
  isEnd: boolean;
  lane: number;
};

const BAR_H = 20;
const BAR_GAP = 3;
const DATE_H = 28;
const MAX_LANES = 3;
const DOUBLE_CLICK_MS = 300;

function computeWeekBars(week: Date[], tasks: Task[]): EventBar[] {
  const weekStart = startOfDay(week[0]);
  const weekEnd = endOfDay(week[6]);

  const bars: EventBar[] = [];

  tasks.forEach((task) => {
    if (!task.started_at && !task.ended_at) return;

    const taskStart = task.started_at
      ? startOfDay(parseISO(task.started_at))
      : startOfDay(parseISO(task.ended_at!));
    const taskEnd = task.ended_at
      ? endOfDay(parseISO(task.ended_at))
      : endOfDay(parseISO(task.started_at!));

    if (isBefore(taskEnd, weekStart) || isAfter(taskStart, weekEnd)) return;

    const displayStart = isBefore(taskStart, weekStart) ? weekStart : taskStart;
    const displayEnd = isAfter(taskEnd, weekEnd) ? weekEnd : taskEnd;

    const startIdx = week.findIndex((d) => isSameDay(d, displayStart));
    const endIdx = week.findIndex((d) => isSameDay(d, displayEnd));
    const sc = startIdx >= 0 ? startIdx : 0;
    const ec = endIdx >= 0 ? endIdx : 6;

    bars.push({
      task,
      startCol: sc,
      span: Math.max(1, ec - sc + 1),
      isStart: !isBefore(taskStart, weekStart),
      isEnd: !isAfter(taskEnd, weekEnd),
      lane: 0,
    });
  });

  // Sort: earlier start first, then longer span first
  bars.sort((a, b) =>
    a.startCol !== b.startCol ? a.startCol - b.startCol : b.span - a.span
  );

  // Greedy lane assignment
  const laneEnds: number[] = [];
  bars.forEach((bar) => {
    let placed = false;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] < bar.startCol) {
        bar.lane = i;
        laneEnds[i] = bar.startCol + bar.span - 1;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bar.lane = laneEnds.length;
      laneEnds.push(bar.startCol + bar.span - 1);
    }
  });

  return bars;
}

export default function MonthGrid({
  weeks,
  tasks,
  isOutsideProjectRange,
  isCurrentMonth,
  onSelectSlot,
  onSelectRange,
  onSelectEvent,
  onUpdateTask,
}: MonthGridProps) {
  // ── Range-select state (create new task) ──────────────────────────────────
  const [lastClickTime, setLastClickTime] = useState(0);
  const [lastClickedSlot, setLastClickedSlot] = useState("");
  const [isRangeDragging, setIsRangeDragging] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  // ── Drag-to-reschedule state ───────────────────────────────────────────────
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<Date | null>(null);

  // ── Per-week bar layouts ───────────────────────────────────────────────────
  const weekBars = useMemo(
    () => weeks.map((week) => computeWeekBars(week, tasks)),
    [weeks, tasks]
  );

  // ── Range-select handlers ─────────────────────────────────────────────────
  const handleCellMouseDown = useCallback(
    (day: Date, isOutside: boolean) => {
      if (isOutside || draggedTask) return;
      setIsRangeDragging(true);
      setRangeStart(day);
      setRangeEnd(day);
    },
    [draggedTask]
  );

  const handleCellMouseEnter = useCallback(
    (day: Date, isOutside: boolean) => {
      if (!isRangeDragging || isOutside) return;
      setRangeEnd(day);
    },
    [isRangeDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (!isRangeDragging || !rangeStart || !rangeEnd) {
      setIsRangeDragging(false);
      return;
    }
    const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
    const end = rangeStart <= rangeEnd ? rangeEnd : rangeStart;

    if (!isSameDay(start, end) && onSelectRange) {
      onSelectRange(start, end);
    }
    setIsRangeDragging(false);
    setRangeStart(null);
    setRangeEnd(null);
  }, [isRangeDragging, rangeStart, rangeEnd, onSelectRange]);

  const isInRangeSelect = useCallback(
    (day: Date) => {
      if (!isRangeDragging || !rangeStart || !rangeEnd) return false;
      const s = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
      const e = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
      return day >= s && day <= e;
    },
    [isRangeDragging, rangeStart, rangeEnd]
  );

  const handleSlotClick = useCallback(
    (day: Date, isOutside: boolean) => {
      if (isOutside) return;
      const key = format(day, "yyyy-MM-dd");
      const now = Date.now();
      if (key === lastClickedSlot && now - lastClickTime < DOUBLE_CLICK_MS) {
        onSelectSlot(day);
        setLastClickTime(0);
        setLastClickedSlot("");
      } else {
        setLastClickTime(now);
        setLastClickedSlot(key);
      }
    },
    [lastClickTime, lastClickedSlot, onSelectSlot]
  );

  // ── Drag-to-reschedule handlers ───────────────────────────────────────────
  const handleBarDragStart = useCallback(
    (e: React.DragEvent, task: Task) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      setDraggedTask(task);
      // Prevent range-select from firing
      setIsRangeDragging(false);
    },
    []
  );

  const handleCellDragOver = useCallback(
    (e: React.DragEvent, day: Date, isOutside: boolean) => {
      if (!draggedTask || isOutside) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDropTargetDate(day);
    },
    [draggedTask]
  );

  const handleCellDrop = useCallback(
    (e: React.DragEvent, day: Date, isOutside: boolean) => {
      e.preventDefault();
      if (!draggedTask || isOutside || !onUpdateTask) {
        setDraggedTask(null);
        setDropTargetDate(null);
        return;
      }

      const duration =
        draggedTask.started_at && draggedTask.ended_at
          ? differenceInDays(
              parseISO(draggedTask.ended_at),
              parseISO(draggedTask.started_at)
            )
          : 0;

      const newStart = day;
      const newEnd = addDays(newStart, duration);

      onUpdateTask(draggedTask.id, {
        started_at: format(newStart, "yyyy-MM-dd"),
        ended_at: format(newEnd, "yyyy-MM-dd"),
      });

      setDraggedTask(null);
      setDropTargetDate(null);
    },
    [draggedTask, onUpdateTask]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDropTargetDate(null);
  }, []);

  return (
    <div
      className="flex-1 min-h-0 flex flex-col select-none"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {weeks.map((week, weekIdx) => {
        const bars = weekBars[weekIdx];

        // Count overflowing bars per column
        const overflowByCol: Record<number, number> = {};
        bars.forEach((bar) => {
          if (bar.lane >= MAX_LANES) {
            for (let c = bar.startCol; c < bar.startCol + bar.span; c++) {
              overflowByCol[c] = (overflowByCol[c] ?? 0) + 1;
            }
          }
        });

        return (
          <div
            key={weekIdx}
            className="flex flex-1 min-h-0 relative border-b border-gray-100 dark:border-gray-800 last:border-b-0"
            style={{ minHeight: DATE_H + MAX_LANES * (BAR_H + BAR_GAP) + 8 }}
          >
            {/* ── Date cells layer ─────────────────────────────────────── */}
            <div className="absolute inset-0 flex">
              {week.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const isOutside = isOutsideProjectRange(day);
                const isOtherMonth = !isCurrentMonth(day);
                const isToday = isSameDay(day, new Date());
                const dow = day.getDay();
                const inRange = isInRangeSelect(day);
                const isDropTarget =
                  dropTargetDate && isSameDay(dropTargetDate, day);

                return (
                  <div
                    key={dateKey}
                    className={[
                      "flex-1 min-w-0 relative border-r border-gray-100 dark:border-gray-800 last:border-r-0",
                      "transition-colors cursor-pointer overflow-hidden flex flex-col",
                      inRange
                        ? "bg-main-100/30 dark:bg-main-700/20"
                        : isDropTarget
                        ? "bg-main-100/50 dark:bg-main-700/30 ring-1 ring-inset ring-main-400"
                        : isOutside
                        ? "bg-gray-100 dark:bg-gray-900 cursor-not-allowed"
                        : isOtherMonth
                        ? "bg-gray-50 dark:bg-gray-800/50"
                        : dow === 6
                        ? "bg-blue-50/30 dark:bg-blue-900/10"
                        : dow === 0
                        ? "bg-red-50/30 dark:bg-red-900/10"
                        : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800",
                    ].join(" ")}
                    onClick={() => handleSlotClick(day, isOutside)}
                    onMouseDown={() => handleCellMouseDown(day, isOutside)}
                    onMouseEnter={() => handleCellMouseEnter(day, isOutside)}
                    onDragOver={(e) => handleCellDragOver(e, day, isOutside)}
                    onDrop={(e) => handleCellDrop(e, day, isOutside)}
                    onDragLeave={() => setDropTargetDate(null)}
                  >
                    {/* Date number */}
                    <div
                      className={[
                        "text-xs sm:text-sm font-medium w-5 h-5 sm:w-7 sm:h-7 m-0.5",
                        "flex items-center justify-center rounded-full shrink-0",
                        isToday
                          ? "bg-main-500 dark:bg-main-400 text-white"
                          : isOutside
                          ? "text-gray-300 dark:text-gray-600"
                          : isOtherMonth
                          ? "text-gray-400 dark:text-gray-500"
                          : dow === 0
                          ? "text-red-500 dark:text-red-400"
                          : dow === 6
                          ? "text-blue-500 dark:text-blue-400"
                          : "text-gray-800 dark:text-gray-200",
                      ].join(" ")}
                    >
                      {format(day, "d")}
                    </div>

                    {/* Overflow indicator */}
                    {overflowByCol[week.indexOf(day)] != null && (
                      <div className="absolute bottom-1 left-0 right-0 text-center text-[10px] text-gray-400 dark:text-gray-500 pointer-events-none">
                        +{overflowByCol[week.indexOf(day)]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Event bars layer ─────────────────────────────────────── */}
            <div
              className="absolute left-0 right-0 overflow-visible pointer-events-none"
              style={{ top: DATE_H }}
            >
              {bars
                .filter((bar) => bar.lane < MAX_LANES)
                .map((bar) => {
                  const overdue = isTaskOverdue(bar.task);
                  const colorCls = getTaskCalendarBarStyle(
                    bar.task.status,
                    overdue
                  );
                  const isDragging =
                    draggedTask?.id === bar.task.id;

                  const leftPx = bar.isStart ? 2 : 0;
                  const rightPx = bar.isEnd ? 2 : 0;

                  return (
                    <div
                      key={`${bar.task.id}-${weekIdx}`}
                      draggable
                      onDragStart={(e) => handleBarDragStart(e, bar.task)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(bar.task);
                      }}
                      title={bar.task.title}
                      className={[
                        "absolute flex items-center px-1.5 text-[11px] font-medium truncate",
                        "pointer-events-auto cursor-grab active:cursor-grabbing",
                        "transition-opacity",
                        colorCls,
                        bar.isStart ? "rounded-l-full" : "rounded-l-none",
                        bar.isEnd ? "rounded-r-full" : "rounded-r-none",
                        isDragging ? "opacity-40" : "opacity-100 hover:brightness-90",
                      ].join(" ")}
                      style={{
                        height: BAR_H,
                        top: bar.lane * (BAR_H + BAR_GAP),
                        left: `calc(${(bar.startCol / 7) * 100}% + ${leftPx}px)`,
                        width: `calc(${(bar.span / 7) * 100}% - ${leftPx + rightPx}px)`,
                      }}
                    >
                      {bar.isStart && bar.task.title}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
