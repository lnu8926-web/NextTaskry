import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getUnifiedAuthUser } from "@/lib/auth/unifiedAuth";

export async function GET(request: NextRequest) {
  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated || !auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("tasks")
    .select(`
      *,
      kanban_boards!inner(
        project_id,
        projects!inner(project_name)
      )
    `)
    .eq("assigned_user_id", userId)
    .order("ended_at", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Dashboard tasks error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tasks = (data || []).map((row: any) => {
    const { kanban_boards, ...task } = row;
    return {
      ...task,
      project_id: kanban_boards.project_id,
      project_name: kanban_boards.projects.project_name,
    };
  });

  return NextResponse.json({ data: tasks });
}
