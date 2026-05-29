"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  format,
  isToday,
  isBefore,
  addDays,
  startOfDay,
  differenceInDays,
  formatDistanceToNow,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { queryKeys } from "@/lib/constants/queryKeys";
import { Task, TaskPriority } from "@/types";
import Badge from "@/components/ui/Badge";

// ─── 타입 ────────────────────────────────────────────

type TaskWithProject = Task & { project_name: string };

type ProjectWithProgress = {
  project_id: string;
  project_name: string;
  status: string;
  total: number;
  done: number;
  rate: number;
};

type Notice = {
  announcement_id: string;
  title: string;
  is_important: boolean;
  created_at: string;
};

// ─── 상수 ────────────────────────────────────────────

const PRIORITY_MAP: Record<TaskPriority, "high" | "normal" | "low"> = {
  high: "high",
  normal: "normal",
  low: "low",
};

// ─── 메인 컴포넌트 ───────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.user_id;
  const userName = session?.user?.name;

  const todayStr = format(new Date(), "yyyy년 M월 d일 (E)", { locale: ko });
  const today = startOfDay(new Date());
  const sevenDaysLater = addDays(today, 7);

  // ── 내 태스크 쿼리 ──────────────────────────────────
  const { data: myTasks = [], isLoading: tasksLoading } = useQuery<TaskWithProject[]>({
    queryKey: queryKeys.dashboard.myTasks(userId),
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/tasks?userId=${userId}`);
      if (!res.ok) throw new Error("태스크 조회 실패");
      const json = await res.json();
      return (json.data || []) as TaskWithProject[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });

  // ── 참여 프로젝트 쿼리 ──────────────────────────────
  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithProgress[]>({
    queryKey: ["dashboard", "projects", userId],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/projects?userId=${userId}`);
      if (!res.ok) throw new Error("프로젝트 조회 실패");
      const json = await res.json();
      return (json.data || []) as ProjectWithProgress[];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 3,
  });

  // ── 최근 공지 쿼리 ──────────────────────────────────
  const { data: notices = [], isLoading: noticesLoading } = useQuery<Notice[]>({
    queryKey: ["dashboard", "notices"],
    queryFn: async () => {
      const res = await fetch("/api/announcements?page=1&limit=3");
      if (!res.ok) throw new Error("공지 조회 실패");
      const json = await res.json();
      return (json.data || []) as Notice[];
    },
    staleTime: 1000 * 60 * 5,
  });

  // ── 통계 계산 ────────────────────────────────────────
  const stats = useMemo(() => {
    const total = myTasks.length;
    const inprogress = myTasks.filter((t) => t.status === "inprogress").length;
    const done = myTasks.filter((t) => t.status === "done").length;
    const overdue = myTasks.filter(
      (t) => t.status !== "done" && t.ended_at && isBefore(new Date(t.ended_at), today)
    ).length;
    return { total, inprogress, done, overdue };
  }, [myTasks, today]);

  // ── 마감 임박 (7일 이내, 미완료) ─────────────────────
  const urgentTasks = useMemo(
    () =>
      myTasks
        .filter(
          (t) =>
            t.status !== "done" &&
            t.ended_at &&
            !isBefore(new Date(t.ended_at), today) &&
            isBefore(new Date(t.ended_at), sevenDaysLater)
        )
        .slice(0, 5),
    [myTasks, today, sevenDaysLater]
  );

  const getDDay = (endedAt: string) => {
    const end = startOfDay(new Date(endedAt));
    if (isToday(end)) return "D-day";
    const diff = differenceInDays(end, today);
    return `D-${diff}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

      {/* 인사 헤더 */}
      <div className="bg-main-50 dark:bg-main-900/20 border border-main-200 dark:border-main-800/50 rounded-[14px] px-6 py-5">
        <p className="text-xs font-medium text-main-600 dark:text-main-400 mb-1">{todayStr}</p>
        <h1 className="text-xl font-semibold text-foreground">
          안녕하세요, <span className="text-main-600 dark:text-main-400">{userName ?? "사용자"}</span>님
        </h1>
      </div>

      {/* Row 1 — 내 태스크 현황 */}
      <section className="space-y-3">
        <SectionLabel>내 태스크 현황</SectionLabel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="전체 작업"
            value={tasksLoading ? "—" : String(stats.total)}
            iconBg="bg-main-500/10"
            dot="bg-main-400"
          />
          <StatCard
            label="진행 중"
            value={tasksLoading ? "—" : String(stats.inprogress)}
            iconBg="bg-blue-500/10"
            dot="bg-blue-400"
            valueColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="완료"
            value={tasksLoading ? "—" : String(stats.done)}
            iconBg="bg-green-500/10"
            dot="bg-green-400"
            valueColor="text-green-600 dark:text-green-400"
          />
          <StatCard
            label="지연"
            value={tasksLoading ? "—" : String(stats.overdue)}
            iconBg="bg-red-500/10"
            dot="bg-red-400"
            valueColor={stats.overdue > 0 ? "text-red-600 dark:text-red-400" : undefined}
          />
        </div>
      </section>

      {/* Row 2 — 마감 임박 + 참여 프로젝트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* 마감 임박 */}
        <section className="space-y-3">
          <SectionLabel>마감 임박 <span className="font-normal text-muted-foreground">· 7일 이내</span></SectionLabel>
          <div className="bg-white dark:bg-card border border-[#bde3ec] dark:border-border rounded-[14px] overflow-hidden">
            {tasksLoading ? (
              <SkeletonList count={4} />
            ) : urgentTasks.length === 0 ? (
              <EmptyWidget message="7일 이내 마감 작업이 없어요" />
            ) : (
              <ul className="divide-y divide-border">
                {urgentTasks.map((task) => {
                  const dday = getDDay(task.ended_at!);
                  const isOverdueTask = isBefore(new Date(task.ended_at!), today);
                  const isTodayTask = isToday(new Date(task.ended_at!));
                  return (
                    <li
                      key={task.id}
                      onClick={() => router.push(`/project/workspace/${task.project_id}`)}
                      className="flex items-center gap-2.5 px-4 py-3 hover:bg-main-50 dark:hover:bg-main-900/10 cursor-pointer transition-colors group"
                    >
                      {task.priority && (
                        <span className="shrink-0">
                          <Badge type={PRIORITY_MAP[task.priority]} />
                        </span>
                      )}
                      <span className="flex-1 text-sm text-foreground truncate group-hover:text-main-600 dark:group-hover:text-main-400 transition-colors">
                        {task.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">{task.project_name}</span>
                      <span className={`shrink-0 text-xs font-semibold min-w-[36px] text-right ${
                        isOverdueTask ? "text-red-500" : isTodayTask ? "text-amber-500" : "text-muted-foreground"
                      }`}>
                        {dday}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        {/* 참여 프로젝트 진행률 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <SectionLabel>참여 프로젝트</SectionLabel>
            <Link href="/project/dashboard" className="text-xs text-muted-foreground hover:text-main-600 dark:hover:text-main-400 flex items-center gap-0.5 transition-colors">
              전체보기 <ChevronRight size={13} />
            </Link>
          </div>
          <div className="bg-white dark:bg-card border border-[#bde3ec] dark:border-border rounded-[14px] overflow-hidden">
            {projectsLoading ? (
              <SkeletonList count={3} />
            ) : projects.length === 0 ? (
              <EmptyWidget message="참여 중인 프로젝트가 없어요" />
            ) : (
              <ul className="divide-y divide-border">
                {projects.map((proj) => (
                  <li
                    key={proj.project_id}
                    onClick={() => router.push(`/project/workspace/${proj.project_id}`)}
                    className="px-4 py-3.5 hover:bg-main-50 dark:hover:bg-main-900/10 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground truncate group-hover:text-main-600 dark:group-hover:text-main-400 transition-colors">
                        {proj.project_name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground ml-2">
                        {proj.rate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-main-500 rounded-full transition-all duration-500"
                        style={{ width: `${proj.rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {proj.done}/{proj.total}개 완료
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Row 3 — 최근 공지 */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionLabel>최근 공지사항</SectionLabel>
          <Link href="/notice" className="text-xs text-muted-foreground hover:text-main-600 dark:hover:text-main-400 flex items-center gap-0.5 transition-colors">
            전체보기 <ChevronRight size={13} />
          </Link>
        </div>
        <div className="bg-white dark:bg-card border border-[#bde3ec] dark:border-border rounded-[14px] overflow-hidden">
          {noticesLoading ? (
            <SkeletonList count={3} />
          ) : notices.length === 0 ? (
            <EmptyWidget message="등록된 공지사항이 없어요" />
          ) : (
            <ul className="divide-y divide-border">
              {notices.map((notice) => {
                const isNew = differenceInDays(new Date(), new Date(notice.created_at)) < 7;
                return (
                  <li key={notice.announcement_id}>
                    <Link
                      href={`/notice/${notice.announcement_id}`}
                      className="flex items-center gap-2.5 px-4 py-3 hover:bg-main-50 dark:hover:bg-main-900/10 transition-colors group"
                    >
                      {notice.is_important && (
                        <span className="shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-sm bg-main-500/10 text-main-700 dark:text-main-300">
                          중요
                        </span>
                      )}
                      <span className="flex-1 text-sm text-foreground truncate group-hover:text-main-600 dark:group-hover:text-main-400 transition-colors">
                        {notice.title}
                      </span>
                      {isNew && (
                        <span className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-main-500/10 text-main-600 dark:text-main-300">
                          NEW
                        </span>
                      )}
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notice.created_at), { locale: ko, addSuffix: true })}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── 공통 서브 컴포넌트 ──────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-foreground">{children}</h2>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  iconBg: string;
  dot: string;
  valueColor?: string;
}

function StatCard({ label, value, iconBg, dot, valueColor }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-card border border-[#bde3ec] dark:border-border rounded-[14px] p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
          <span className={`w-2 h-2 rounded-full ${dot}`} />
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${valueColor ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}

function EmptyWidget({ message }: { message: string }) {
  return (
    <div className="py-10 text-center text-sm text-muted-foreground">{message}</div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-8 bg-muted/60 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
