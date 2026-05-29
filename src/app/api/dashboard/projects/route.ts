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
    .from("project_members")
    .select(`
      project_id,
      projects!inner(
        project_id,
        project_name,
        status,
        kanban_boards(
          tasks(status)
        )
      )
    `)
    .eq("user_id", userId)
    .limit(5);

  if (error) {
    console.error("Dashboard projects error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const projects = (data || []).map((row: any) => {
    const proj = row.projects;
    const allTasks = (proj.kanban_boards || []).flatMap((b: any) => b.tasks || []);
    const total = allTasks.length;
    const done = allTasks.filter((t: any) => t.status === "done").length;
    return {
      project_id: proj.project_id,
      project_name: proj.project_name,
      status: proj.status,
      total,
      done,
      rate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  return NextResponse.json({ data: projects });
}
