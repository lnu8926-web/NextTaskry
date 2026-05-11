import { supabaseAdmin } from "@/lib/supabase/server";
import { getUnifiedAuthUser } from "@/lib/auth/unifiedAuth";

export async function GET(request: Request) {
  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const role = searchParams.get("role");
  const userId = searchParams.get("userId");

  let query = supabaseAdmin.from("project_members").select("*");
  if (id) query = query.eq("project_id", id);
  if (role) query = query.eq("role", role);
  if (userId) query = query.eq("user_id", userId);

  const { data: projectMembers, error } = await query;

  if (error) {
    console.error("Error fetching project members:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: `프로젝트 멤버[${id}] 정보 조회`,
    params: {
      projectMemberId: id || "파라미터 없음",
      userId: userId || "파라미터 없음",
    },
    data: projectMembers,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const data = await request.json();

  const projectMember = data.map((member: { userId: string; role: string }) => ({
    project_id: id,
    user_id: member.userId,
    role: member.role,
  }));

  const { error: upsertError } = await supabaseAdmin
    .from("project_members")
    .upsert(projectMember, { onConflict: "project_id, user_id" })
    .select();

  if (upsertError) {
    console.error("Error upserting project members:", upsertError);
    return Response.json({ error: upsertError.message }, { status: 500 });
  }

  // 현재 목록에 없는 멤버 삭제 (SQL injection 방지: in() 메서드 사용)
  const currentIds = projectMember.map((member: { user_id: string }) => member.user_id);

  if (currentIds.length > 0) {
    const { error: deleteError } = await supabaseAdmin
      .from("project_members")
      .delete()
      .eq("project_id", id)
      .not("user_id", "in", `(${currentIds.join(",")})`);

    if (deleteError) {
      console.error("Error deleting removed members:", deleteError);
      return Response.json({ error: deleteError.message }, { status: 500 });
    }
  } else {
    // 멤버가 없으면 해당 프로젝트의 모든 멤버 삭제
    const { error: deleteError } = await supabaseAdmin
      .from("project_members")
      .delete()
      .eq("project_id", id);

    if (deleteError) {
      console.error("Error deleting all members:", deleteError);
      return Response.json({ error: deleteError.message }, { status: 500 });
    }
  }

  return Response.json({
    message: "프로젝트 멤버 업데이트",
    params: { projectMemberId: id || "파라미터 없음" },
    timestamp: new Date().toISOString(),
  });
}

export async function DELETE(request: Request) {
  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const { error } = await supabaseAdmin
    .from("project_members")
    .delete()
    .eq("project_id", id);

  if (error) {
    console.error("Error deleting project members:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: `프로젝트 멤버[${id}] 정보 삭제`,
    params: { projectMemberId: id || "파라미터 없음" },
    timestamp: new Date().toISOString(),
  });
}
