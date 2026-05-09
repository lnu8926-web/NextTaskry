import type { ProjectMemberWithUser } from "@/types/projectMember";

export async function fetchProjectMembersForAssignment(
  projectId: string
): Promise<ProjectMemberWithUser[] | undefined> {
  const response = await fetch(
    `/api/projectMembers/forAssignment?projectId=${projectId}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `HTTP ${response.status}: 프로젝트 멤버를 불러오는 데 실패했습니다.`
    );
  }

  const result = await response.json();
  return result.data
    ? (result.data as ProjectMemberWithUser[])
    : undefined;
}
