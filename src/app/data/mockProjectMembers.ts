import { ProjectMemberWithUser } from "@/types/projectMember";

export const mockProjectMembers: ProjectMemberWithUser[] = [
  // ─── project-001 ──────────────────────────────────────
  {
    member_id: "member-001",
    project_id: "project-001",
    user_id: "user-001",
    role: "leader",
    joined_at: "2026-02-20T09:00:00Z",
    users: {
      user_id: "user-001",
      user_name: "이남은",
      email: "namune.lee@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000001",
    },
  },
  {
    member_id: "member-002",
    project_id: "project-001",
    user_id: "user-002",
    role: "member",
    joined_at: "2026-02-21T09:00:00Z",
    users: {
      user_id: "user-002",
      user_name: "김민중",
      email: "minjung.kim@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000002",
    },
  },
  {
    member_id: "member-003",
    project_id: "project-001",
    user_id: "user-003",
    role: "member",
    joined_at: "2026-02-21T10:00:00Z",
    users: {
      user_id: "user-003",
      user_name: "이원찬",
      email: "wonchan.lee@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000003",
    },
  },

  // ─── project-002 ──────────────────────────────────────
  {
    member_id: "member-004",
    project_id: "project-002",
    user_id: "user-002",
    role: "leader",
    joined_at: "2026-03-15T09:00:00Z",
    users: {
      user_id: "user-002",
      user_name: "김민중",
      email: "minjung.kim@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000002",
    },
  },
  {
    member_id: "member-005",
    project_id: "project-002",
    user_id: "user-003",
    role: "member",
    joined_at: "2026-03-16T09:00:00Z",
    users: {
      user_id: "user-003",
      user_name: "이원찬",
      email: "wonchan.lee@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000003",
    },
  },
  {
    member_id: "member-006",
    project_id: "project-002",
    user_id: "user-004",
    role: "member",
    joined_at: "2026-03-16T10:00:00Z",
    users: {
      user_id: "user-004",
      user_name: "이현수",
      email: "hyunsu.lee@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000004",
    },
  },

  // ─── project-003 ──────────────────────────────────────
  {
    member_id: "member-007",
    project_id: "project-003",
    user_id: "user-003",
    role: "leader",
    joined_at: "2026-01-10T09:00:00Z",
    users: {
      user_id: "user-003",
      user_name: "이원찬",
      email: "wonchan.lee@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000003",
    },
  },
  {
    member_id: "member-008",
    project_id: "project-003",
    user_id: "user-001",
    role: "member",
    joined_at: "2026-01-11T09:00:00Z",
    users: {
      user_id: "user-001",
      user_name: "이남은",
      email: "namune.lee@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000001",
    },
  },
  {
    member_id: "member-009",
    project_id: "project-003",
    user_id: "user-004",
    role: "member",
    joined_at: "2026-01-11T10:00:00Z",
    users: {
      user_id: "user-004",
      user_name: "이현수",
      email: "hyunsu.lee@taskry.dev",
      profile_image: "https://avatars.githubusercontent.com/u/10000004",
    },
  },
];
