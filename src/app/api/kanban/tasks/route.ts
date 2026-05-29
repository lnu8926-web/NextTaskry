import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getUnifiedAuthUser } from "@/lib/auth/unifiedAuth";

const DB_TASK_FIELDS = [
  "kanban_board_id",
  "project_id",
  "title",
  "description",
  "status",
  "priority",
  "assigned_user_id",
  "started_at",
  "ended_at",
  "start_time",
  "end_time",
  "use_time",
  "memo",
  "subtasks",
] as const;

function sanitize(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  DB_TASK_FIELDS.forEach((f) => {
    if (f in data && data[f] !== undefined && data[f] !== "") {
      out[f] = data[f];
    }
  });
  return out;
}

async function requireAuth() {
  const auth = await getUnifiedAuthUser();
  if (!auth.isAuthenticated || !auth.userId) {
    return { auth: null, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { auth, res: null };
}

export async function GET(request: NextRequest) {
  try {
    const { auth, res } = await requireAuth();
    if (!auth) return res!;

    const projectId = request.nextUrl.searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("GET /api/kanban/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { auth, res } = await requireAuth();
    if (!auth) return res!;

    const body = await request.json();
    const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = body;
    const clean = sanitize(rest);

    if (!clean.kanban_board_id || !clean.title) {
      return NextResponse.json({ error: "kanban_board_id and title are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .insert(clean)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/kanban/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { auth, res } = await requireAuth();
    if (!auth) return res!;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const clean = sanitize(updates);
    if (Object.keys(clean).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("tasks")
      .update(clean)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("PUT /api/kanban/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { auth, res } = await requireAuth();
    if (!auth) return res!;

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("tasks").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/kanban/tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
