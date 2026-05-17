import { UserInfoRow } from "@/types/adminUser";
import { mockUsers } from "@/app/data/mockUsers";

export async function fetchAdminUsers(): Promise<UserInfoRow[]> {
  try {
    const res = await fetch("/api/admin/users");
    if (!res.ok) throw new Error("Fetch failed");
    return await res.json();
  } catch (error) {
    console.warn("관리자 유저 API 실패, 목데이터 사용:", error);
    return mockUsers.map((u) => ({
      email: u.email,
      user_name: u.user_name,
      global_role: u.global_role,
      user_id: u.user_id,
    }));
  }
}
