import { supabaseAdmin } from "@/lib/supabase/server";
import { getUnifiedAuthUser } from "@/lib/auth/unifiedAuth";
import { NextResponse } from "next/server";

async function requireProjectOwner(projectId: string, userId: string) {
  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("user_id")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    console.error("Error checking project owner:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const ids = searchParams.get("ids");
  const page = searchParams.get("page");

  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let query = supabaseAdmin.from("projects").select(`*, project_members (count)`, { count: "exact" });

  if (id) {
    query = query.eq("project_id", id);
  } else if (ids) {
    query = query.in("project_id", ids.split(",").map((i) => i.trim()));
  }

  query = query.order("created_at", { ascending: true });

  if (page) {
    const limit = 12;
    const from = (Number(page) - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
  }

  const { data: projects, count, error } = await query;

  if (error) {
    console.error("Error fetching projects:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: `프로젝트[${id}] 정보 조회`,
    params: { projectId: id || "파라미터 없음" },
    data: projects,
    totalCount: count,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectName, type, status, startedAt, endedAt, techStack, description } = body;

  const { data: newProject, error } = await supabaseAdmin
    .from("projects")
    .insert([{
      project_name: projectName,
      ...(type && { type }),
      ...(status && { status }),
      ...(startedAt && { started_at: startedAt }),
      ...(endedAt && { ended_at: endedAt }),
      ...(techStack && { tech_stack: techStack }),
      ...(description && { description }),
      user_id: auth.userId,
    }])
    .select();

  if (error) {
    console.error("Error adding project:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: "프로젝트 정보 생성",
    params: body,
    data: newProject,
    timestamp: new Date().toISOString(),
  });
}

export async function PUT(request: Request) {
  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated || !auth.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Project ID is required" }, { status: 400 });
  }

  const authError = await requireProjectOwner(id, auth.userId);
  if (authError) return authError;

  const body = await request.json();
  const { projectName, type, status, startedAt, endedAt, techStack, description } = body;

  const { error } = await supabaseAdmin
    .from("projects")
    .update({
      project_name: projectName,
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(startedAt !== undefined && { started_at: startedAt }),
      ...(endedAt !== undefined && { ended_at: endedAt }),
      ...(techStack !== undefined && { tech_stack: techStack }),
      ...(description !== undefined && { description }),
      updated_at: new Date(),
    })
    .eq("project_id", id);

  if (error) {
    console.error("Error updating project:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: `프로젝트${id} 정보 업데이트`,
    params: body,
    timestamp: new Date().toISOString(),
  });
}

export async function DELETE(request: Request) {
  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated || !auth.userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return Response.json({ error: "Project ID is required" }, { status: 400 });
  }

  const authError = await requireProjectOwner(id, auth.userId);
  if (authError) return authError;

  const { error } = await supabaseAdmin
    .from("projects")
    .delete()
    .eq("project_id", id);

  if (error) {
    console.error("Error deleting project:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    message: `프로젝트[${id}] 정보 삭제`,
    params: { projectId: id || "파라미터 없음" },
    timestamp: new Date().toISOString(),
  });
}
