import { ProjectMemberWithUser } from "@/types/projectMember";

const GUEST = {
  user_id: "c4c7ec7c-9e82-4126-8419-d9e13cd001bb",
  user_name: "게스트",
  email: "guest@taskry.demo",
  profile_image: "https://api.dicebear.com/9.x/avataaars/svg?seed=guest",
};

export const mockProjectMembers: ProjectMemberWithUser[] = [
  // ─── [GUEST] TaskFlow 리디자인 ────────────────────────
  {
    member_id: "pm-guest-taskflow",
    project_id: "d12d6c50-d77b-453b-b0ce-59fbdbc953a5",
    user_id: GUEST.user_id,
    role: "leader",
    joined_at: "2026-06-26T03:35:26Z",
    users: GUEST,
  },

  // ─── [GUEST] 쇼핑몰 백엔드 개편 ──────────────────────
  {
    member_id: "pm-guest-shopping",
    project_id: "ffb9dc8c-a01d-42a0-9a1c-826959a4c511",
    user_id: GUEST.user_id,
    role: "member",
    joined_at: "2026-06-26T03:35:27Z",
    users: GUEST,
  },

  // ─── [GUEST] Q2 마케팅 캠페인 ────────────────────────
  {
    member_id: "pm-guest-marketing",
    project_id: "deb83065-5c87-4394-bd19-8f6385537242",
    user_id: GUEST.user_id,
    role: "member",
    joined_at: "2026-06-26T03:35:27Z",
    users: GUEST,
  },
];
