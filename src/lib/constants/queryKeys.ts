/**
 * TanStack Query 캐시 키 중앙 관리
 *
 * 사용 예:
 *   useQuery({ queryKey: queryKeys.projects.list(filter, page, userId) })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
 */

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (view: string, page: number, userId: string | undefined) =>
      [...queryKeys.projects.all, view, page, userId] as const,
    detail: (projectId: string) =>
      [...queryKeys.projects.all, "detail", projectId] as const,
  },
  users: {
    all: ["users"] as const,
  },
  projectForm: {
    detail: (projectId: string) =>
      ["project-form", projectId] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    list: (projectId: string) =>
      [...queryKeys.tasks.all, projectId] as const,
  },
  workspace: {
    info: (projectId: string) =>
      ["workspace-info", projectId] as const,
    role: (projectId: string, userId: string | undefined) =>
      ["workspace-role", projectId, userId] as const,
  },
  dashboard: {
    myTasks: (userId: string | undefined) =>
      ["dashboard", "my-tasks", userId] as const,
  },
} as const;
