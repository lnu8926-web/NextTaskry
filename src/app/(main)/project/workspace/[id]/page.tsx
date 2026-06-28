"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { queryKeys } from "@/lib/constants/queryKeys";

import BottomNavigation from "@/components/layout/BottomNavigation";
import { useWorkspaceNav } from "@/providers/WorkspaceNavProvider";

import { Task } from "@/types/kanban";
import { showToast } from "@/lib/utils/toast";

import { getTasksByBoardId } from "@/app/api/tasks/tasks";

import { useSession } from "next-auth/react";
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

type NavItem = "calendar" | "kanban" | "memo" | "project";

async function enrichTaskWithAssignee(taskRaw: Task): Promise<Task> {
  if (!taskRaw.assigned_user_id) return taskRaw;

  const { data: userData } = await supabase
    .from("users")
    .select("user_id, user_name, email, avatar_url")
    .eq("user_id", taskRaw.assigned_user_id)
    .single();

  if (!userData) return taskRaw;

  return {
    ...taskRaw,
    assignee: {
      user_id: userData.user_id,
      name: userData.user_name,
      email: userData.email,
      avatar_url: userData.avatar_url,
    },
  };
}

export default function ProjectPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [kanbanBoardId, setKanbanBoardId] = useState<string>("");
  const [showProjectInfoPanel, setShowProjectInfoPanel] = useState(false);

  const { currentView, showMemoPanel, setView, toggleMemo, closeMemo, setProjectContext, clearWorkspace } = useWorkspaceNav();

  const userId = session?.user?.user_id;
  const taskQueryKey = useMemo(() => queryKeys.tasks.list(projectId), [projectId]);

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

  useQuery({
    queryKey: queryKeys.workspace.role(projectId, userId),
    queryFn: async () => {
      if (!userId || !projectId) return null;
      const res = await fetch(`/api/projectMembers?id=${projectId}&userId=${userId}`);
      if (!res.ok) return null;
      const json = await res.json();
      const members = Array.isArray(json.data) ? json.data : Array.isArray(json) ? json : [];
      const me = members.find((m: { user_id: string; role: string }) => m.user_id === userId);
      return (me?.role as ProjectRole) ?? null;
    },
    enabled: !!projectId && !!userId,
    staleTime: 1000 * 60 * 5,
  });

  const projectName = projectInfo?.project_name || "이름 없는 프로젝트";
  const projectStartDate = projectInfo?.started_at || "";
  const projectEndDate = projectInfo?.ended_at || "";

  useEffect(() => {
    if (!projectId || projectId === "undefined") {
      router.push("/");
    }
  }, [projectId, router]);

  useEffect(() => {
    if (!projectId || projectId === "undefined" || projectId === "null") return;

    const initKanbanBoard = async () => {
      const kanbanRes = await fetch(`/api/kanban/boards?projectId=${projectId}`);
      if (!kanbanRes.ok) return;

      const kanbanData = await kanbanRes.json();

      if (kanbanData && kanbanData.length > 0) {
        setKanbanBoardId(kanbanData[0].id);
      } else {
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

  useEffect(() => {
    if (!projectId || !kanbanBoardId) return;

    const channel = supabase
      .channel(`taskry-board-${kanbanBoardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `kanban_board_id=eq.${kanbanBoardId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            enrichTaskWithAssignee(payload.new as Task).then((enrichedTask) => {
              queryClient.setQueryData(taskQueryKey, (prev: Task[]) => {
                if (!prev) return [enrichedTask];
                if (prev.some((t) => t.id === enrichedTask.id)) return prev;
                return [...prev, enrichedTask];
              });
            });
          } else if (payload.eventType === "UPDATE") {
            enrichTaskWithAssignee(payload.new as Task).then((enrichedTask) => {
              queryClient.setQueryData(taskQueryKey, (prev: Task[]) =>
                (prev || []).map((t) => (t.id === enrichedTask.id ? enrichedTask : t))
              );
            });
          } else if (payload.eventType === "DELETE") {
            const deletedTask = payload.old as Task;
            queryClient.setQueryData(taskQueryKey, (prev: Task[]) =>
              (prev || []).filter((t) => t.id !== deletedTask.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, kanbanBoardId, queryClient, taskQueryKey]);

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
      const res = await fetch("/api/kanban/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const json = await res.json();
      return json.data as Task;
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
      const res = await fetch("/api/kanban/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, ...updates }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const json = await res.json();
      return json.data as Task;
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(taskQueryKey, (prev: Task[]) =>
        (prev || []).map((t) =>
          t.id === updatedTask.id
            ? {
                ...updatedTask,
                assignee:
                  updatedTask.assigned_user_id === t.assigned_user_id
                    ? t.assignee
                    : undefined,
              }
            : t
        )
      );
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/kanban/tasks?id=${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
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

  const handleCreateTask = useCallback(
    (taskData: Omit<Task, "id" | "created_at" | "updated_at">) => {
      if (createTaskMutation.isPending) return;
      createTaskMutation.mutate(taskData);
    },
    [createTaskMutation]
  );

  const handleUpdateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      updateTaskMutation.mutate({ taskId, updates });
    },
    [updateTaskMutation]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      if (deleteTaskMutation.isPending) return;
      deleteTaskMutation.mutate(taskId);
    },
    [deleteTaskMutation]
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: taskQueryKey });
  };

  useEffect(() => {
    if (projectName) setProjectContext(projectName);
  }, [projectName, setProjectContext]);

  useEffect(() => {
    return () => clearWorkspace();
  }, [clearWorkspace]);

  const handleViewChange = (view: NavItem) => {
    if (view === "memo") {
      toggleMemo();
      setShowProjectInfoPanel(false);
    } else if (view === "project") {
      router.push("/");
    } else {
      setView(view as "kanban" | "calendar");
      setShowProjectInfoPanel(false);
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-1 flex gap-3 p-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-80 shrink-0 bg-card rounded-lg border border-border p-4 flex flex-col gap-3">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 flex overflow-hidden min-h-0 gap-2 lg:gap-3 p-2 sm:p-3">

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-hidden min-h-0">
          {currentView === "kanban" && (
            <KanbanBoard
              boardId={kanbanBoardId}
              tasks={tasks}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleMemo={toggleMemo}
              showMemoPanel={showMemoPanel}
              onProjectInfoClick={() => { setShowProjectInfoPanel((prev) => !prev); closeMemo(); }}
              project={{
                project_id: projectId,
                project_name: projectName,
                started_at: projectStartDate,
                ended_at: projectEndDate,
              }}
            />
          )}

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
              onSelectTask={() => {}}
              onTaskCreated={handleRefresh}
              onToggleMemo={toggleMemo}
              showMemoPanel={showMemoPanel}
              onProjectInfoClick={() => { setShowProjectInfoPanel((prev) => !prev); closeMemo(); }}
            />
          )}
        </main>

        {/* 프로젝트 정보 side panel */}
        <aside
          className={`flex flex-col transition-all duration-300 overflow-hidden min-h-0 shrink-0 ${
            showProjectInfoPanel
              ? "w-[300px] lg:w-[340px] opacity-100"
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

        {/* 메모 side panel */}
        <aside
          className={`flex flex-col transition-all duration-300 overflow-hidden min-h-0 shrink-0 ${
            showMemoPanel
              ? "w-[300px] lg:w-[360px] opacity-100"
              : "w-0 opacity-0"
          }`}
        >
          <MemoView projectId={projectId} onClose={closeMemo} />
        </aside>
      </div>

      <div className="shrink-0 md:hidden">
        <BottomNavigation
          activeView={showMemoPanel ? "memo" : currentView}
          onViewChange={handleViewChange}
        />
      </div>
    </div>
  );
}
