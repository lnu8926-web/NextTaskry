// src/app/(main)/project/workspace/page.tsx - 프로젝트 워크스페이스 메인 페이지

"use client";

// React Hooks - 상태 관리 및 생명주기 관리
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 메인 기능 컴포넌트들 - 칸반보드, 캘린더, 네비게이션
import CalendarView from "@/components/features/calendarView/CalendarView";
import KanbanBoard from "@/components/features/kanban/KanbanBoard";
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

// 메모 기능 컴포넌트 - 실시간 협업 메모
import MemoView from "@/components/features/kanban/MemoView";

// 프로젝트 정보 패널
import ProjectInfoPanel from "@/components/features/project/ProjectInfoPanel";

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

  // === 핵심 상태 관리 ===
  const [projectId, setProjectId] = useState<string>(""); // sessionStorage에서 가져올 프로젝트 ID
  const [projectName, setProjectName] = useState<string>(""); // 프로젝트 이름 (헤더 표시용)
  const [projectStartDate, setProjectStartDate] = useState<string>(""); // 프로젝트 시작일 (D-day 계산용)
  const [projectEndDate, setProjectEndDate] = useState<string>(""); // 프로젝트 종료일 (D-day 계산용)
  const [kanbanBoardId, setKanbanBoardId] = useState<string>(""); // 칸반보드 ID (실시간 구독용)h
  const [tasks, setTasks] = useState<Task[]>([]); // 태스크 목록 (실시간 동기화)

  // === UI 상태 관리 ===
  const [currentView, setCurrentView] = useState<NavItem>("kanban"); // 메인 뷰 (칸반/캘린더)
  const [showMemoPanel, setShowMemoPanel] = useState(false); // 메모 패널 토글 상태
  const [showProjectInfoPanel, setShowProjectInfoPanel] = useState(false); // 프로젝트 정보 패널 토글 상태
  const [loading, setLoading] = useState(true); // 초기 데이터 로딩 상태

  // === 권한 관리 ===
  const [userRole, setUserRole] = useState<ProjectRole | null>(null); // 사용자 역할 (leader/member)
  const { data: session } = useSession(); // NextAuth 세션 정보

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
    const storedProjectId = sessionStorage.getItem("current_Project_Id");

    if (!storedProjectId) {
      // 세션에 프로젝트 ID가 없으면 홈으로 리다이렉트 (워크플로우 제어)
      showToast("프로젝트를 먼저 선택해주세요", "error");
      router.push("/");
      return;
    }

    setProjectId(storedProjectId);
  }, [router]);

  /**
   * 👤 사용자 역할 기반 인가 시스템
   *
   * 역할별 권한:
   * - Leader: 팀원 초대, 프로젝트 설정 변경, 모든 태스크 관리
   * - Member: 태스크 생성/수정, 메모 작성, 읽기 권한
   *
   * 현재 구현 상태:
   * - 클라이언트 사이드 UI 제어만 구현됨 (기본적인 사용자 경험 제어)
   * - Supabase Row Level Security 및 서버사이드 권한 검증은 미구현 상태
   */
  useEffect(() => {
    const fetchRole = async () => {
      if (!session?.user?.user_id || !projectId) return;

      // project_members 테이블에서 현재 사용자의 역할 조회
      const { data, error } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", projectId)
        .eq("user_id", session.user.user_id)
        .maybeSingle();

      if (error) {
        console.error("프로젝트 멤버 역할 조회 오류:", error);
        return;
      }

      if (data) setUserRole(data.role as ProjectRole);
    };
    fetchRole();
  }, [projectId, session?.user?.user_id]);

  /**
   * 📊 프로젝트 데이터 통합 로딩 + 칸반보드 자동 생성
   *
   * 로딩 순서:
   * 1. 프로젝트 정보 조회
   * 2. 칸반보드 존재 확인 → 없으면 자동 생성 (레거시 호환)
   * 3. 태스크 목록 조회
   *
   * 자동 생성 이유:
   * - 기존 프로젝트는 칸반보드 없이 생성됨
   * - 무중단 마이그레이션을 위한 호환 로직
   */
  useEffect(() => {
    // 세션에서 가져온 projectId가 있을 때만 데이터 로딩 실행
    if (!projectId) return;

    const fetchData = async () => {
      try {
        // projectId 유효성 검사
        if (!projectId || projectId === "undefined" || projectId === "null") {
          console.warn("⚠️ Invalid projectId:", projectId);
          setLoading(false);
          return;
        }

        // 1. 프로젝트 정보 가져오기 - API Route 사용
        const projectRes = await fetch(`/api/projects/${projectId}`);

        if (projectRes.ok) {
          const projectData = await projectRes.json();
          setProjectName(projectData.project_name || "이름 없는 프로젝트");
          setProjectStartDate(projectData.started_at || "");
          setProjectEndDate(projectData.ended_at || "");
        } else {
          setProjectName("알 수 없는 프로젝트");
          setProjectStartDate("");
          setProjectEndDate("");
        }

        // 2. 칸반보드 ID 가져오기 (또는 생성) - API Route 사용
        let boardId = null;

        // 기존 칸반보드 조회
        const kanbanRes = await fetch(
          `/api/kanban/boards?projectId=${projectId}`
        );

        if (kanbanRes.ok) {
          const kanbanData = await kanbanRes.json();

          if (kanbanData && kanbanData.length > 0) {
            // 이미 칸반보드가 있는 경우
            boardId = kanbanData[0].id;
          } else {
            /**
             * 🎯 칸반보드 자동 생성 (레거시 호환성)
             *
             * 이유:
             * - 초기 프로젝트들은 칸반보드 없이 생성됨
             * - 사용자가 처음 워크스페이스 접속 시 자동으로 생성
             * - 표준 워크플로우 강제: todo → inprogress → done
             */
            console.log("⚠️ 칸반보드가 없어서 새로 생성합니다.");

            const createRes = await fetch("/api/kanban/boards", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                project_id: projectId,
                columns: "todo,inprogress,done", // MVP: 표준 컬럼 구조 고정
              }),
            });

            if (createRes.ok) {
              const newKanban = await createRes.json();
              boardId = newKanban.id;
            } else {
              console.error("칸반보드 생성 실패");
            }
          }
        }

        if (boardId) {
          setKanbanBoardId(boardId);
        }

        // 3. Tasks 가져오기
        const { data: tasksData, error: tasksError } = await getTasksByBoardId(
          projectId
        );

        if (tasksError) {
          console.error("Tasks 조회 실패:", tasksError);
        } else {
          setTasks(tasksData || []);
        }
      } catch (error) {
        console.error("데이터 로딩 중 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    console.log("리얼타임 업데이트 설정 실행");

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
          console.log("리얼타임 업데이트 수신:", payload.eventType, payload);

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

              setTasks((prev) => {
                // 🛡️ 중복 추가 방지 (방어적 프로그래밍)
                if (prev.some((t) => t.id === enrichedTask.id)) {
                  console.log("이미 존재하는 Task");
                  return prev;
                }
                console.log("새로운 Task 추가:", enrichedTask.title);
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

              setTasks((prev) =>
                prev.map((t) => (t.id === enrichedTask.id ? enrichedTask : t))
              );
            };

            enrichUpdateTask();
          } else if (payload.eventType === "DELETE") {
            const deletedTask = payload.old as Task;
            setTasks((prev) => prev.filter((t) => t.id !== deletedTask.id));
            console.log("Task 삭제:", deletedTask.title);
          }
        }
      )
      .subscribe((status) => {
        console.log("Supabase 채널 상태:", status);
      });

    // 🧹 컴포넌트 언마운트 시 채널 정리 (메모리 누수 방지)
    return () => {
      console.log("Supabase 채널 해제");
      supabase.removeChannel(channel);
    };
  }, [projectId, kanbanBoardId]);

  /**
   * 📝 Task 생성 핸들러
   *
   * 하이브리드 패턴:
   * - DB 업데이트 후 즉시 로컬 상태 업데이트 (빠른 피드백)
   * - Realtime은 다른 사용자의 변경사항 동기화용
   */
  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "created_at" | "updated_at">
  ) => {
    const { data, error } = await createTask(taskData);

    if (error) {
      showToast("작업 생성 실패", "error");
      return;
    }

    if (data) {
      // 즉시 로컬 상태 업데이트 (낙관적 업데이트)
      setTasks((prev) => {
        // 중복 방지
        if (prev.some((t) => t.id === data.id)) return prev;
        return [...prev, data];
      });
      showToast("작업이 생성되었습니다.", "success");
    }
  };

  /**
   * ✏️ Task 수정 핸들러
   *
   * 하이브리드 패턴:
   * - 서버 업데이트 후 즉시 로컬 상태 반영
   * - Realtime은 다른 사용자의 변경사항 동기화용
   */
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    const { data, error } = await updateTask(taskId, updates);

    if (!error && data) {
      // 즉시 로컬 상태 업데이트
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );
    }
  };

  /**
   * 🗑️ Task 삭제 핸들러
   *
   * 하이브리드 패턴:
   * - 서버 삭제 성공 시 즉시 로컬 상태 반영
   * - Realtime은 다른 사용자의 변경사항 동기화용
   */
  const handleDeleteTask = async (taskId: string) => {
    const { error } = await deleteTask(taskId);

    if (error) {
      showToast("작업 삭제 실패", "error");
      return;
    }

    // 즉시 로컬 상태 업데이트
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast("작업이 삭제되었습니다.", "success");
  };

  const handleRefresh = async () => {
    const { data: tasksData, error: tasksError } = await getTasksByBoardId(
      projectId
    );

    if (tasksError) {
      console.error("Tasks 조회 실패:", tasksError);
    } else {
      setTasks(tasksData || []);
    }
  };

  /**
   * 🧭 스마트 뷰 전환 + 메모 패널 토글
   *
   * UX 설계:
   * - 메모: 사이드 패널 토글 (칸반/캘린더와 함께 보기)
   * - 칸반/캘린더: 메인 뷰 전환 (전체 화면)
   * - 프로젝트 종료: 완전 나가기 + 상태 정리
   *
   * 일관성 고려:
   * - 메모는 "보조" 기능 → 토글 방식
   * - 칸반/캘린더는 "메인" 기능 → 배타적 전환
   */
  const handleViewChange = (view: NavItem) => {
    if (view === "memo") {
      // 메모 패널 토글 (기존 뷰와 함께 표시)
      setShowMemoPanel((prev) => !prev);
    } else if (view === "project") {
      // 🧹 프로젝트 종료 시 세션 스토리지 정리 (상태 초기화)
      sessionStorage.removeItem("current_Project_Id");
      window.location.href = "/";
    } else {
      // 메인 뷰 전환 (칸반 ↔ 캘린더)
      setCurrentView(view);
      setShowMemoPanel(false); // 메모 패널은 자동으로 닫기
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
