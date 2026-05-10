// src/app/(main)/project/workspace/page.tsx - 프로젝트 워크스페이스 메인 페이지

"use client";

// React Hooks - 상태 관리 및 생명주기 관리
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { queryKeys } from "@/lib/constants/queryKeys";

// 메인 기능 컴포넌트들 - 칸반보드, 캘린더, 네비게이션
import BottomNavigation from "@/components/layout/BottomNavigation";

// 타입 정의 및 유틸리티
import { Task } from "@/types/kanban";
import { showToast } from "@/lib/utils/toast";

// Task CRUD API 함수들 - 서버와의 데이터 통신
import {
  getTasksByBoardId,
  createTask,
  updateTask,
  deleteTask,
} from "@/app/api/tasks/tasks";

// 인증 관련 - NextAuth 세션 관리
import { useSession } from "next-auth/react";

// Supabase 실시간 구독 - 다중 사용자 동시 작업 지원
import { supabase } from "@/lib/supabase/supabase";
import { ProjectRole } from "@/types";

const CalendarView = dynamic(
  () => import("@/components/features/calendarView/CalendarView")
);
const KanbanBoard = dynamic(
  () => import("@/components/features/kanban/KanbanBoard")
);
const MemoView = dynamic(() => import("@/components/features/kanban/MemoView"));
const ProjectInfoPanel = dynamic(
  () => import("@/features/project").then((mod) => mod.ProjectInfoPanel)
);

// 네비게이션 타입 정의 - 하단 탭 네비게이션용
type NavItem = "calendar" | "kanban" | "memo" | "project";

/**
 * 프로젝트 워크스페이스 메인 페이지
 *
 * 기능:
 * - 칸반보드와 캘린더 뷰 전환
 * - 실시간 협업 메모 패널
 * - Supabase Realtime을 통한 다중 사용자 동시 작업
 * - 역할 기반 UI 제어 (Leader/Member - 클라이언트 사이드만)
 * - sessionStorage 기반 워크플로우 제어
 */
export default function ProjectPage() {
  // URL 파라미터 대신 sessionStorage 사용 (워크플로우 제어)
  // const params = useParams();
  // const projectId = params.id as string;

  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // === 핵심 상태 관리 ===
  const [projectId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("current_Project_Id") ?? "";
  }); // sessionStorage에서 가져올 프로젝트 ID
  const [kanbanBoardId, setKanbanBoardId] = useState<string>(""); // 칸반보드 ID (실시간 구독용)

  // === UI 상태 관리 ===
  const [currentView, setCurrentView] = useState<NavItem>("kanban"); // 메인 뷰 (칸반/캘린더)
  const [showMemoPanel, setShowMemoPanel] = useState(false); // 메모 패널 토글 상태
  const [showProjectInfoPanel, setShowProjectInfoPanel] = useState(false); // 프로젝트 정보 패널 토글 상태

  const userId = session?.user?.user_id;
  const taskQueryKey = queryKeys.tasks.list(projectId);

  // === 프로젝트 정보 조회 ===
  const { data: projectInfo } = useQuery({
    queryKey: queryKeys.workspace.info(projectId),
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) return { project_name: "알 수 없는 프로젝트", started_at: "", ended_at: "" };
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5,
  });

  // === 태스크 목록 조회 ===
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: taskQueryKey,
    queryFn: async () => {
      const { data, error } = await getTasksByBoardId(projectId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 0,
  });

  // === 사용자 역할 조회 ===
  useQuery({
    queryKey: queryKeys.workspace.role(projectId, userId),
    queryFn: async () => {
      if (!userId || !projectId) return null;
      const { data, error } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        console.error("프로젝트 멤버 역할 조회 오류:", error);
        return null;
      }
      return (data?.role as ProjectRole) ?? null;
    },
    enabled: !!projectId && !!userId,
    staleTime: 1000 * 60 * 5,
  });

  // 파생 값
  const projectName = projectInfo?.project_name || "이름 없는 프로젝트";
  const projectStartDate = projectInfo?.started_at || "";
  const projectEndDate = projectInfo?.ended_at || "";
  const loading = tasksLoading;

  /**
   * 🔄 워크플로우 제어: sessionStorage 기반 접근 관리
   *
   * 설계 의도:
   * 1. URL 직접 접근 차단 - 프로젝트 ID가 URL에 노출되지 않음
   * 2. 워크플로우 강제 - 반드시 홈 → 프로젝트 선택 → 워크스페이스 순서
   * 3. 북마크/링크 공유 방지 - UX상 일관성 유지
   * 4. 새로고침 시 홈으로 리다이렉트 -> 이게 장점일지 단점일지는 고민 필요
   *
   * ⚠️ 주의: 현재는 클라이언트 사이드 제어만 구현됨 (실제 보안은 아님)
   */
  useEffect(() => {
    if (!projectId) {
      // 세션에 프로젝트 ID가 없으면 홈으로 리다이렉트 (워크플로우 제어)
      showToast("프로젝트를 먼저 선택해주세요", "error");
      router.push("/");
    }
  }, [projectId, router]);

  /**
   * � 칸반보드 초기화 (최초 1회 자동 생성 포함)
   * - 프로젝트 정보/태스크는 useQuery로 이동
   * - 보드 자동 생성은 조건부 mutation이라 useEffect 유지
   */
  useEffect(() => {
    if (!projectId || projectId === "undefined" || projectId === "null") return;

    const initKanbanBoard = async () => {
      const kanbanRes = await fetch(`/api/kanban/boards?projectId=${projectId}`);
      if (!kanbanRes.ok) return;

      const kanbanData = await kanbanRes.json();

      if (kanbanData && kanbanData.length > 0) {
        setKanbanBoardId(kanbanData[0].id);
      } else {
        // 레거시 프로젝트: 칸반보드 자동 생성
        const createRes = await fetch("/api/kanban/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: projectId,
            columns: "todo,inprogress,done",
          }),
        });
        if (createRes.ok) {
          const newKanban = await createRes.json();
          setKanbanBoardId(newKanban.id);
        }
      }
    };

    initKanbanBoard();
  }, [projectId]);

  /**
   * 🔄 Supabase Realtime: 다중 사용자 동시 업데이트
   *
   * 실시간 협업 구현:
   * - PostgreSQL의 WAL(Write-Ahead Log) 기반
   * - 칸반보드별 채널 분리로 성능 최적화
   * - INSERT/UPDATE/DELETE 이벤트 실시간 동기화
   *
   * 중복 방지:
   * - React Strict Mode 중복 실행 대응
   * - 네트워크 재연결 시 이벤트 중복 처리
   * - 동시 접속자 간 경합 상태 방지
   */
  useEffect(() => {
    if (!projectId || !kanbanBoardId) return;

    // 칸반보드별 채널 생성 (네임스페이스 분리)
    const channel = supabase
      .channel(`taskry-board-${kanbanBoardId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // 모든 이벤트 수신
          schema: "public",
          table: "tasks",
          filter: `kanban_board_id=eq.${kanbanBoardId}`, // 현재 보드의 태스크만
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newTaskRaw = payload.new as Task;

            // 🔄 담당자 정보 추가 조회 (Realtime에는 JOIN 데이터 없음)
            const enrichTask = async () => {
              let assignee = null;

              if (newTaskRaw.assigned_user_id) {
                const { data: userData } = await supabase
                  .from("users")
                  .select("user_id, user_name, email")
                  .eq("user_id", newTaskRaw.assigned_user_id)
                  .single();

                if (userData) {
                  assignee = {
                    user_id: userData.user_id,
                    name: userData.user_name,
                    email: userData.email,
                  };
                }
              }

              const enrichedTask = {
                ...newTaskRaw,
                assignee,
              } as Task;

              queryClient.setQueryData(taskQueryKey, (prev: Task[]) => {
                if (!prev) return [enrichedTask];
                if (prev.some((t) => t.id === enrichedTask.id)) return prev;
                return [...prev, enrichedTask];
              });
            };

            enrichTask();
          } else if (payload.eventType === "UPDATE") {
            const updatedTaskRaw = payload.new as Task;

            // 🔄 담당자 정보 추가 조회 (UPDATE 시에도 필요)
            const enrichUpdateTask = async () => {
              let assignee = null;

              if (updatedTaskRaw.assigned_user_id) {
                const { data: userData } = await supabase
                  .from("users")
                  .select("user_id, user_name, email")
                  .eq("user_id", updatedTaskRaw.assigned_user_id)
                  .single();

                if (userData) {
                  assignee = {
                    user_id: userData.user_id,
                    name: userData.user_name,
                    email: userData.email,
                  };
                }
              }

              const enrichedTask = {
                ...updatedTaskRaw,
                assignee,
              } as Task;

              queryClient.setQueryData(taskQueryKey, (prev: Task[]) =>
                (prev || []).map((t) => (t.id === enrichedTask.id ? enrichedTask : t))
              );
            };

            enrichUpdateTask();
          } else if (payload.eventType === "DELETE") {
            const deletedTask = payload.old as Task;
            queryClient.setQueryData(taskQueryKey, (prev: Task[]) =>
              (prev || []).filter((t) => t.id !== deletedTask.id)
            );
          }
        }
      )
      .subscribe();

    // 🧹 컴포넌트 언마운트 시 채널 정리 (메모리 누수 방지)
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, kanbanBoardId, queryClient, taskQueryKey]);

  // === Task CRUD (useMutation) ===
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await createTask(taskData);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(taskQueryKey, (prev: Task[]) => {
          if ((prev || []).some((t) => t.id === data.id)) return prev;
          return [...(prev || []), data];
        });
        showToast("작업이 생성되었습니다.", "success");
      }
    },
    onError: () => showToast("작업 생성 실패", "error"),
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const { error } = await updateTask(taskId, updates);
      if (error) throw error;
      return { taskId, updates };
    },
    onSuccess: ({ taskId, updates }) => {
      queryClient.setQueryData(taskQueryKey, (prev: Task[]) =>
        (prev || []).map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await deleteTask(taskId);
      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => {
      queryClient.setQueryData(taskQueryKey, (prev: Task[]) =>
        (prev || []).filter((t) => t.id !== taskId)
      );
      showToast("작업이 삭제되었습니다.", "success");
    },
    onError: () => showToast("작업 삭제 실패", "error"),
  });

  const handleCreateTask = (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
    createTaskMutation.mutate(taskData);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ taskId, updates });
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: taskQueryKey });
  };

  /**
   * 🧭 스마트 뷰 전환 + 메모 패널 토글
   */
  const handleViewChange = (view: NavItem) => {
    if (view === "memo") {
      setShowMemoPanel((prev) => !prev);
    } else if (view === "project") {
      sessionStorage.removeItem("current_Project_Id");
      window.location.href = "/";
    } else {
      setCurrentView(view);
      setShowMemoPanel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 dark:text-gray-500 text-lg">
          불러오는 중...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 pt-14">
      <div className="flex-1 flex overflow-hidden gap-2 lg:gap-3 min-h-0 p-3 sm:p-4 lg:p-5 max-w-[1600px] mx-auto w-full">
        {/* 📋 프로젝트 정보 패널 - 왼쪽 사이드바 */}
        <aside
          className={`flex flex-col transition-all duration-300 overflow-hidden min-h-0 shrink-0 ${
            showProjectInfoPanel
              ? `w-[240px] lg:w-[280px] ${
                  showMemoPanel ? "xl:w-[260px]" : "xl:w-[300px]"
                } opacity-100`
              : "w-0 opacity-0"
          }`}
        >
          <ProjectInfoPanel
            projectId={projectId}
            projectName={projectName}
            projectStartDate={projectStartDate}
            projectEndDate={projectEndDate}
            tasks={tasks}
            onClose={() => setShowProjectInfoPanel(false)}
          />
        </aside>

        {/* 🖥️ 메인 콘텐츠 영역 */}
        <main className="flex flex-col overflow-hidden transition-all duration-300 min-h-0 flex-1 min-w-0">
          <div className="flex-1 overflow-hidden min-h-0">
            {/* 📋 칸반보드 뷰 - dnd-kit 드래그앤드롭 */}
            {currentView === "kanban" && (
              <KanbanBoard
                boardId={kanbanBoardId}
                tasks={tasks}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onProjectInfoClick={() =>
                  setShowProjectInfoPanel((prev) => !prev)
                }
                project={{
                  project_id: projectId,
                  project_name: projectName,
                  started_at: projectStartDate,
                  ended_at: projectEndDate,
                }}
              />
            )}

            {/* 📅 캘린더 뷰 - react-big-calendar 기반 */}
            {currentView === "calendar" && (
              <CalendarView
                tasks={tasks}
                boardId={kanbanBoardId}
                project={{
                  project_id: projectId,
                  project_name: projectName,
                  started_at: projectStartDate,
                  ended_at: projectEndDate,
                }}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onSelectTask={() => {}} // 태스크 선택 시 처리 (미구현)
                onTaskCreated={handleRefresh} // 캘린더에서 생성 후 새로고침
                onProjectInfoClick={() =>
                  setShowProjectInfoPanel((prev) => !prev)
                }
              />
            )}
          </div>
        </main>

        {/* 📝 메모 패널 - 오른쪽 사이드바 */}
        <aside
          className={`flex flex-col transition-all duration-300 overflow-hidden min-h-0 shrink-0 ${
            showMemoPanel
              ? `w-[240px] lg:w-[280px] ${
                  showProjectInfoPanel ? "xl:w-[260px]" : "xl:w-[300px]"
                } opacity-100`
              : "w-0 opacity-0"
          }`}
        >
          <MemoView projectId={projectId} />
        </aside>
      </div>

      {/* 🧭 하단 네비게이션 - 고정 위치 */}
      <div className="shrink-0">
        <BottomNavigation
          activeView={showMemoPanel ? "memo" : currentView}
          onViewChange={handleViewChange}
        />
      </div>
    </div>
  );
}
