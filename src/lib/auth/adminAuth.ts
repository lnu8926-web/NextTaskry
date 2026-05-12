import { NextResponse } from "next/server";
import { getUnifiedAuthUser } from "@/lib/auth/unifiedAuth";

type AdminAuthResult =
  | { authorized: true; userId: string }
  | { authorized: false; error: NextResponse };

export async function checkAdminAuth(): Promise<AdminAuthResult> {
  const authUser = await getUnifiedAuthUser();

  if (!authUser.isAuthenticated || !authUser.userId) {
    return {
      authorized: false,
      error: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }),
    };
  }

  if (authUser.role !== "admin") {
    return {
      authorized: false,
      error: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }),
    };
  }

  return { authorized: true, userId: authUser.userId };
}
