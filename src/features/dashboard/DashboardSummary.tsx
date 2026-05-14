"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isBefore, addDays, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";
import { AlertTriangle, Clock, CheckCircle2, PlayCircle, ListTodo } from "lucide-react";
import { supabase } from "@/lib/supabase/supabase";
import { queryKeys } from "@/lib/constants/queryKeys";
import { Task, TaskPriority } from "@/types";

type TaskWithProject = Task & { project_name: string };

type UrgencyTab = "overdue" | "today" | "upcoming";

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: "높음",
  normal: "보통",
  low: "낮음",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  high: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  normal: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export default function DashboardSummary() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.user_id;
  const userName = session?.user?.name;

  const [activeTab, setActiveTab] = useState<UrgencyTab>("overdue");

  const { data: tasks = [], isLoading } = useQuery<TaskWithProject[]>({
    queryKey: queryKeys.dashboard.myTasks(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          kanban_boards!inner(
            project_id,
            projects!inner(project_name)
          )
        `)
        .eq("assigned_user_id", userId)
        .order("ended_at", { ascending: true, nullsFirst: false });

      if (error) throw error;

      return (data || []).map((row: any) => {
        const { kanban_boards, ...task } = row;
        return {
          ...task,
          project_id: kanban_boards.project_id,
          project_name: kanban_boards.projects.project_name,
        } as TaskWithProject;
      });
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });

  const today = startOfDay(new Date());
  const threeDaysLater = addDays(today, 3);

  const stats = useMemo(() => {
    const total = tasks.length;
    const inprogress = tasks.filter((t) => t.status === "inprogress").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) => t.status !== "done" && t.ended_at && isBefore(new Date(t.ended_at), today)
    ).length;
    return { total, inprogress, done, overdue };
  }, [tasks, today]);

  const urgentTasks = useMemo(() => {
    const overdue = tasks
      .filter((t) => t.status !== "done" && t.ended_at && isBefore(new Date(t.ended_at), today))
      .slice(0, 5);

    const todayDue = tasks
      .filter((t) => t.status !== "done" && t.ended_at && isToday(new Date(t.ended_at)))
      .slice(0, 5);

    const upcoming = tasks
      .filter(
        (t) =>
          t.status !== "done" &&
          t.ended_at &&
          !isBefore(new Date(t.ended_at), today) &&
          !isToday(new Date(t.ended_at)) &&
          isBefore(new Date(t.ended_at), threeDaysLater)
      )
      .slice(0, 5);

    return { overdue, todayDue, upcoming };
  }, [tasks, today, threeDaysLater]);

  const tabCounts = {
    overdue: urgentTasks.overdue.length,
    today: urgentTasks.todayDue.length,
    upcoming: urgentTasks.upcoming.length,
  };

  const currentList =
    activeTab === "overdue"
      ? urgentTasks.overdue
      : activeTab === "today"
      ? urgentTasks.todayDue
      : urgentTasks.upcoming;

  const hasAnyUrgent =
    tabCounts.overdue + tabCounts.today + tabCounts.upcoming > 0;

  const todayStr = format(new Date(), "yyyy년 M월 d일 (E)", { locale: ko });

  return (
    <div className="space-y-6 mb-10">
      {/* 인사 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          안녕하세요, {userName ?? "사용자"}님
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{todayStr}</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="전체 작업"
          value={isLoading ? "-" : String(stats.total)}
          icon={<ListTodo size={18} />}
          iconBg="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
        />
        <StatCard
          label="진행 중"
          value={isLoading ? "-" : String(stats.inprogress)}
          icon={<PlayCircle size={18} />}
          iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400"
          valueColor="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="완료"
          value={isLoading ? "-" : String(stats.done)}
          icon={<CheckCircle2 size={18} />}
          iconBg="bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400"
          valueColor="text-green-600 dark:text-green-400"
        />
        <StatCard
          label="지연"
          value={isLoading ? "-" : String(stats.overdue)}
          icon={<AlertTriangle size={18} />}
          iconBg="bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"
          valueColor={stats.overdue > 0 ? "text-red-600 dark:text-red-400" : undefined}
        />
      </div>

      {/* 긴급 작업 */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* 탭 헤더 */}
        <div className="flex border-b border-border">
          {(
            [
              { key: "overdue", label: "지연", icon: <AlertTriangle size={14} /> },
              { key: "today", label: "오늘 마감", icon: <Clock size={14} /> },
              { key: "upcoming", label: "D-3 이내", icon: <Clock size={14} /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-main-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tabCounts[tab.key] > 0 && (
                <span
                  className={`ml-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    tab.key === "overdue"
                      ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 작업 목록 */}
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !hasAnyUrgent ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              모든 작업이 기한 내에 있어요 🎉
            </div>
          ) : currentList.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              해당하는 작업이 없어요
            </div>
          ) : (
            <ul className="space-y-2">
              {currentList.map((task) => (
                <li
                  key={task.id}
                  onClick={() => router.push(`/project/workspace/${task.project_id}`)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  {task.priority && (
                    <span
                      className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${
                        PRIORITY_COLOR[task.priority]
                      }`}
                    >
                      {PRIORITY_LABEL[task.priority]}
                    </span>
                  )}
                  <span className="flex-1 text-sm font-medium text-foreground truncate group-hover:text-main-600 dark:group-hover:text-main-400 transition-colors">
                    {task.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {task.project_name}
                  </span>
                  {task.ended_at && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {format(new Date(task.ended_at), "M/d")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}

function StatCard({ label, value, icon, iconBg, valueColor }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${valueColor ?? "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}
