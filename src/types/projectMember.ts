// types/projectMember.types.ts
import { User } from "@/types/user";

export type ProjectMemberRole = "leader" | "member";

export interface ProjectMember {
  member_id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  joined_at: string;
}

export type InsertProjectMember = Omit<
  ProjectMember,
  "member_id" | "joined_at"
>;
export type UpdateProjectMember = Partial<
  Omit<ProjectMember, "member_id" | "joined_at">
>;

// 프로젝트 멤버 + 유저 정보 조인 타입
export interface ProjectMemberWithUser extends ProjectMember {
  users: Pick<User, "user_id" | "user_name" | "email" | "profile_image">;
}