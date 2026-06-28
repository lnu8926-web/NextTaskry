import { NextResponse } from "next/server";
import { getUnifiedAuthUser } from "@/lib/auth/unifiedAuth";

export async function requireAdmin(): Promise<NextResponse | null> {
  const auth = await getUnifiedAuthUser();

  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.provider !== "nextauth" || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
